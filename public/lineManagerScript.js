document.addEventListener('DOMContentLoaded', function () {
    // Call the viewReport function to fetch and display user responses
    viewReport();

    // Populate the week selector dropdown
    populateWeekSelector();
});


// Function to fetch user responses for the selected week and page
async function fetchUserResponses(selectedWeek, currentPage) {
    const page = currentPage || 1;  // Set the page parameter to 1 when a new week is loaded or not provided

    // Make a GET request to the API to get user responses for the selected week and page
    const response = await fetch(`/api/line-manager/user-responses/${selectedWeek}?page=${page}`);
    const userResponses = await response.json();

    // Display the user responses table with pagination
    displayUserResponses(userResponses, page);
}



// Function to populate the week selector dropdown
function populateWeekSelector() {
    const weekSelector = document.getElementById('weekSelector');

    // Get the current week
    const currentWeek = getWeekNumber(new Date());

    // Populate the dropdown with week numbers starting from the current week
    for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
        const option = document.createElement('option');
        option.value = weekNumber;
        option.textContent = `Week ${weekNumber}`;
        weekSelector.appendChild(option);
    }
}

// Function to get the week number from a given date
function getWeekNumber(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const day = Math.ceil((date - oneJan) / 86400000);
    return Math.ceil(day / 7);
}

// Function to display user responses in a table with pagination
function displayUserResponses(userResponses, currentPage) {
    const userResponsesContainer = document.getElementById('userResponsesContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const pageDisplayContainer = document.getElementById('pageDisplayContainer');

    // Clear the containers before adding new user responses and pagination
    userResponsesContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    pageDisplayContainer.innerHTML = '';

    const itemsPerPage = 15; // Number of items to display per page
    const totalPages = Math.ceil(userResponses.length / itemsPerPage) || 1; // Ensure at least 1 page

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const table = document.createElement('table');
    table.className = 'user-responses-table';

    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Timestamp</th>
            <th>Username</th>
            <th>Feeling</th>
            <th>Happiness Index</th>
            <th>Week Number</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    for (let i = startIndex; i < endIndex && i < userResponses.length; i++) {
        const userResponse = userResponses[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userResponse.timestamp}</td>
            <td>${userResponse.username}</td>
            <td>${userResponse.feeling}</td>
            <td>${userResponse.happinessIndex}</td>
            <td>${userResponse.weekNumber}</td>
        `;
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    userResponsesContainer.appendChild(table);

    // Create pagination buttons (limit to 15 pages)
    for (let page = 1; page <= totalPages; page++) {
        if (page <= 15) {
            const button = document.createElement('button');
            button.textContent = page;
            button.onclick = () => navigateToPage(page);
            paginationContainer.appendChild(button);
        }
    }

    // Add "Previous" button
    const previousButton = document.createElement('button');
    previousButton.textContent = 'Previous';
    previousButton.onclick = () => navigateToPage(currentPage - 1);
    paginationContainer.insertBefore(previousButton, paginationContainer.firstChild);

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => navigateToPage(currentPage + 1);
    paginationContainer.appendChild(nextButton);

    // Display current page number at the top
    const pageInfo = document.createElement('div');
    pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
    pageDisplayContainer.appendChild(pageInfo);
}


// Function to navigate to a specific page
function navigateToPage(page) {
    // Get the selected week from the dropdown
    const weekSelector = document.getElementById('weekSelector');
    const selectedWeek = weekSelector.value;

    // Update the URL with the new page number
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', page);
    window.history.pushState({ path: newUrl.href }, '', newUrl.href);

    // Fetch and display user responses for the selected week and page
    fetchUserResponses(selectedWeek, page);
}

// Function to fetch user responses for the selected week and page
async function viewReport() {
    const userResponsesContainer = document.getElementById('userResponsesContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const pageDisplayContainer = document.getElementById('pageDisplayContainer');

    // Toggle visibility
    userResponsesContainer.style.display = 'block';
    paginationContainer.style.display = 'block';
    pageDisplayContainer.style.display = 'block';

    const weekSelector = document.getElementById('weekSelector');
    const selectedWeek = weekSelector.value;

    // Fetch and display user responses for the selected week and page 1
    fetchUserResponses(selectedWeek, 1);
}
