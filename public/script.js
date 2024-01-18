
// Function to display the popup
function showPopup() {
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'flex';
}

// Function to submit user feedback
async function submitFeedback(feeling) {
    const username = prompt('You just selected your mood as ' + feeling + '. Please enter your username to confirm and submit your response.'); // Prompt the user for their username

    // Check if the username is provided
    if (username !== null && username.trim() !== '') {

        console.log("Valid username");

        // Here, you would send the feedback data to the console
        console.log('User feedback:', feeling);

        let responseMessage = '';

        switch (feeling) {
            case 'Bad':
                responseMessage = await handleFeedback(feeling, username);
                break;
            case 'Average':
                responseMessage = await handleFeedback(feeling, username);
                break;
            case 'Excited':
                responseMessage = await handleFeedback(feeling, username);
                break;
            default:
                responseMessage = "Thanks for your feedback!";
        }

        // Display the response message only if it's not an empty string
        if (responseMessage !== '') {
            alert(responseMessage, 'Wellbeing Monitor');
        }
    }
    else {
        // Handle the case where the user cancels the username prompt or provides an empty username
        console.log('Username not provided or cancelled');
        alert('Username not provided or cancelled', 'Wellbeing Monitor');
        // Add any specific handling or message for this case if needed
    }
}

// Function to handle feedback
async function handleFeedback(feeling, username) {
    await sendFeedbackToBackend(feeling, username);


    //loadingSpinner.style.display = 'none'; // Hide loading spinner when operation is complete


    await new Promise(resolve => setTimeout(resolve, 1000));


    // Call checkWellbeingStatus API

    const shouldShowOptions = await checkWellbeingStatus(username);


    if (shouldShowOptions) {
        // Display floating alert with header and options
        const alertContainer = document.createElement('div');
        alertContainer.className = 'floating-alert';
        alertContainer.innerHTML = `
            <div class="alert-header">Seems like you had a rough week. Do you want to talk about it?</div>
            <div class="options-container">
                <input type="radio" name="supportOption" value="LineManager"> Discuss with my Line Manager<br>
                <input type="radio" name="supportOption" value="Counsellor"> Discuss with Counsellor<br>
                <input type="radio" name="supportOption" value="WellnessPortal"> Get support from the Allianz Wellness Portal<br>
                <input type="radio" name="supportOption" value="NotNow"> I would prefer not to discuss it now<br>
            </div>
        `;

        // Append alertContainer to the document body
        document.body.appendChild(alertContainer);

        // Add a click event listener to the alertContainer
        alertContainer.addEventListener('click', async (event) => {
            const selectedOption = event.target.value;
            await handleSupportOption(selectedOption, username);
            alertContainer.remove(); // Remove the alert container after handling the option
            closePopup();
        });

        return ''; // No response message when options are displayed
    } else {
        // Customize the response message based on the feeling
        switch (feeling) {
            case 'Bad':
                return `We're sorry to hear that, ${username}. If you need support, feel free to reach out.`;
            case 'Average':
                return `It's okay, ${username}. If there's anything on your mind, we're here to listen.`;
            case 'Excited':
                return `Awesome, ${username}! We are so glad that you had a great day!`;
            default:
                return 'executing the default code';
        }


    }
}


// Function to send feedback data to the backend
function sendFeedbackToBackend(feeling, username) {
    console.log('Executing sendFeedbackToBackend function...');

    /* const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block'; // Show loading spinner */

    // Make a POST request to your backend API
    fetch('http://localhost:3000/api/submitresponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feeling, username }), // Include the username in the request body
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

// Function to check employee wellbeing status
async function checkWellbeingStatus(username) {
    console.log('Checking employee wellbeing status...');
    const response = await fetch('http://localhost:3000/api/checkwellbeing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });


    const data = await response.json();
    return data.showOptions;

}

// Function to display the username popup
function showUsernamePopup() {
    const usernamePopup = document.getElementById('usernamePopup');
    usernamePopup.style.display = 'flex';
}



// Function to close the username popup
function closeUsernamePopup() {
    const usernamePopup = document.getElementById('usernamePopup');
    usernamePopup.style.display = 'none';
}

// Function to handle the selected support option
function handleSupportOption(selectedOption, username) {
    switch (selectedOption) {
        case 'LineManager':
            // Open email client with prefilled email address and subject
            window.location.href = `mailto:extern.nair_sreejith1@allianz.de?subject=I would like to discuss a personal concern with you`;
            break;
        case 'Counsellor':
            // Open website for Counsellor support
            window.open('https://awcsexpat.lifeworks.com/life/employee-assistance', '_blank');
            break;
        case 'WellnessPortal':
            // Open website for Allianz Wellness Portal support
            window.open('https://www.allianzcare.com/en/support/health-and-wellness/allianz-wellness-portal.html', '_blank');
            break;
        case 'NotNow':
            // Do nothing for "I would prefer not to discuss it now"
            break;
        default:
            console.log('Invalid option selected');
    }
}


//showPopup();
