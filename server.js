const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

mongoose.connect('mongodb://127.0.0.1/wellbeing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Define a schema for user responses
const userResponseSchema = new mongoose.Schema({
    username: String,
    feeling: String,
    timestamp: { type: Date, default: Date.now },
    happinessIndex: Number,
    weekNumber: { type: Number, required: true, validate: Number.isInteger },
});

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

// Define a schema for wellbeing statistics
const wellbeingStatisticsSchema = new mongoose.Schema({
    username: String,
    weeklyScore: Number,
    employeeWellbeingStatus: String,
    weekNumber: Number,
});

const WellbeingStatistics = mongoose.model('WellbeingStatistics', wellbeingStatisticsSchema);

app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Well-Being Monitor route
app.get('/wellbeing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wellbeing.html'));
});

// Line Manager Dashboard route
app.get('/linemanagerdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'linemanagerdashboard.html'));
});


// Endpoint to store user responses
// Endpoint to store user responses
app.post('/api/submitresponse', async (req, res) => {
    try {
        const { username, feeling } = req.body;
        const happinessIndex = calculateHappinessIndex(feeling);
        const timestamp = new Date();
        const weekNumber = getWeekNumber(timestamp);

        // Validate that weekNumber is a valid number
        if (isNaN(weekNumber)) {
            throw new Error('Invalid weekNumber');
        }

        const response = new UserResponse({ username, feeling, happinessIndex, timestamp, weekNumber });
        await response.save();

        // Check if the user has reached 5 records for the current week
        const userResponsesThisWeek = await UserResponse.find({ username, weekNumber });
        if (userResponsesThisWeek.length === 5) {
            const weeklyScore = calculateWeeklyScore(userResponsesThisWeek);
            const employeeWellbeingStatus = calculateEmployeeWellbeingStatus(weeklyScore);
            const wellbeingStat = new WellbeingStatistics({
                username,
                weeklyScore,
                employeeWellbeingStatus,
                weekNumber,
            });
            await wellbeingStat.save();
        }

        res.status(201).json({ message: 'Response stored successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Function to calculate happiness index based on feeling
function calculateHappinessIndex(feeling) {
    switch (feeling) {
        case 'Excited':
            return 3;
        case 'Average':
            return 2;
        case 'Bad':
            return 1;
        default:
            return 0;
    }
}

// Function to get the week number from a given date
function getWeekNumber(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const day = Math.ceil((date - oneJan) / 86400000);
    return Math.ceil(day / 7);
}

// Function to calculate weekly score
function calculateWeeklyScore(userResponses) {
    return userResponses.reduce((acc, response) => acc + response.happinessIndex, 0);
}

// Function to calculate employee wellbeing status
function calculateEmployeeWellbeingStatus(weeklyScore) {
    if (weeklyScore <= 7) {
        return 'Employee Unhappy';
    } else if (weeklyScore >= 8 && weeklyScore <= 15) {
        return 'Employee OK';
    } else {
        return 'Invalid value';
    }
}

// Endpoint to check employee wellbeing status and send email to the line manager
app.post('/api/checkwellbeing', async (req, res) => {
    try {
        const { username } = req.body;
        const currentWeekNumber = getWeekNumber(new Date());
        const wellbeingStat = await WellbeingStatistics.findOne({
            username,
            weekNumber: currentWeekNumber,
        });

        if (wellbeingStat && wellbeingStat.employeeWellbeingStatus === 'Employee Unhappy') {
            res.status(200).json({ showOptions: true });
        } else {
            res.status(200).json({ showOptions: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

//lineManagerDashboard code starts here


// Endpoint to get user responses for a specific week
app.get('/api/line-manager/user-responses/:weekNumber', async (req, res) => {
    try {

        const { weekNumber } = req.params;
        const userResponses = await UserResponse.find({ weekNumber: parseInt(weekNumber, 10) });
        res.status(200).json(userResponses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});