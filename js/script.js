/*
Treehouse Techdegree:
FSJS Project 2 - Data Pagination and Filtering
*/

//TO DO: maybe user can pick this?
let itemsPerPage = 9;
let currentPage = 1;
let currentSearchResults = [];


/*
Create the `showPage` function
This function will create and insert/append the elements needed to display a "page" of nine students
*/
function showPage(list, page) {
  console.log("function showPage: currentPage: ", currentPage);
  
  // Handle Next/Previous navigation
  if (page === "Next") {
    currentPage = Math.min(currentPage + 1, Math.ceil(list.length/itemsPerPage));
    page = currentPage;
  } else if (page === "Previous") {
    currentPage = Math.max(currentPage - 1, 1);
    page = currentPage;
  } else if (!isNaN(page)) {
    // If a specific page number was clicked, update currentPage
    currentPage = parseInt(page);
  }
  
  // Ensure currentPage is valid for the current itemsPerPage setting
  const maxPage = Math.ceil(list.length/itemsPerPage);
  if (currentPage > maxPage && maxPage > 0) {
    currentPage = maxPage;
    page = currentPage;
  }

  // Calculate page indexes
  let startIndex = (page * itemsPerPage) - itemsPerPage;
  let endIndex = Math.min(page * itemsPerPage, list.length);

  // Get & clear the list element of previous students
  const ul = document.querySelector(".student-list");
  ul.innerHTML = "";

  // Iterate through the student list
  for (let i = 0; i < list.length; i++) {
    // Only display those inside the specified indexes
    if (startIndex <= i && i < endIndex) {
      // Create the list item with the student details
      let listItem = `<li class="student-item cf">
                        <div class="student-details">
                        <img class="avatar" src=${list[i].picture.medium} alt="Profile Picture">
                        <h3>${list[i].name.first} ${list[i].name.last}</h3>
                        <span class="email">${list[i].email}</span>
                      </div>
                      <div class="joined-details">
                        <span class="date">${list[i].registered.date}</span>
                      </div>
                      </li>`;

      // Append list item to the ul element
      ul.innerHTML += listItem;
    }
  }
  
  // Update pagination buttons to reflect current page
  updatePaginationButtons(list);
  
  // Update results info
  showResultsInfo(list, currentPage);
}

/*
Create the `addPagination` function
This function will create and insert/append the elements needed for the pagination buttons
*/
function addPagination(list) {
  console.log("function buttonsNeeded: buttonsNeeded: ", Math.ceil(list.length/itemsPerPage), "currentPage: ", currentPage);
  
  // Get the link-list class element
  const ul = document.querySelector(".link-list");
  
  // Clear the pagination buttons
  ul.innerHTML = "";
  
  // Create pagination buttons
  updatePaginationButtons(list);
  
  // Remove any existing event listeners
  const newUl = ul.cloneNode(true);
  ul.parentNode.replaceChild(newUl, ul);
  
  // Add the event listener to the NEW ul element
  newUl.addEventListener('click', (event) => {
    console.log("clicked on button:", event.target.textContent);
    
    // Should only run when buttons are pressed, not surrounding area
    if (event.target.tagName === 'BUTTON') {
      // Don't do anything if the button is disabled
      if (event.target.classList.contains('disabled')) {
        return;
      }
      
      // Call the showPage function with the appropriate text
      showPage(list, event.target.textContent);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// New function to update pagination buttons without adding new event listeners
function updatePaginationButtons(list) {
  // Calculate buttons needed
  let buttonsNeeded = Math.ceil(list.length/itemsPerPage);
  
  // Get the link-list class element
  const ul = document.querySelector(".link-list");
  
  // Don't clear innerHTML here, we'll do that in addPagination
  
  // Create previous button with disabled class if on first page
  const prevDisabled = currentPage === 1 ? 'class="disabled"' : '';
  ul.innerHTML = `<li><button type="button" ${prevDisabled}>Previous</button></li>`;
  
  // Create the numbered buttons
  for (let i = 0; i < buttonsNeeded; i++) {
    // Is current page?
    if (i + 1 == currentPage) {
      ul.innerHTML += `<li><button type="button" class="active">${i + 1}</button></li>`;
    } else {
      ul.innerHTML += `<li><button type="button">${i + 1}</button></li>`;
    }
  }
  
  // Create next button with disabled class if on last page
  const nextDisabled = currentPage === buttonsNeeded ? 'class="disabled"' : '';
  ul.innerHTML += `<li><button type="button" ${nextDisabled}>Next</button></li>`;
}

/*
Extra Credit
This function will dynamically create and add a search bar.
*/
function showSearchBar() {
  const header = document.querySelector(".header");
  const searchBar = `<label for="search" class="student-search">
                      <span>Search by name</span>
                      <input id="search" placeholder="Search by name...">
                      <button type="button"><img src="img/icn-search.svg" alt="Search icon"></button>
                    </label>`;
  header.innerHTML += searchBar;

  let debounceTimer;
  let infoDiv = document.querySelector('.results-info');
  let currentSortedData = [...data]; // Keep track of the current sorted data

  //function to be used when searching, used by two event listeners
  function search(query) {
    // Get current sort option
    const sortOption = document.getElementById('sort-select').value;
    
    // Reset if empty
    if (query.length == 0) {
      currentSearchResults = [];
      sortAndDisplayStudents(sortOption);
      return;
    }
  
    // Convert to lower case
    query = query.toLowerCase();
  
    // This array will hold the matches
    let searchResults = [];
  
    // Loop through the original data (not sorted) to find matches
    for (let i = 0; i < data.length; i++) {
      // Combine first and last names
      let firstLastName = `${data[i].name.first} ${data[i].name.last}`.toLowerCase();
  
      if (firstLastName.includes(query)) {
        // Match found!!
        searchResults.push(data[i]);
      }
    }
  
    // Store the search results globally
    currentSearchResults = searchResults;
    
    // Apply current sorting to search results
    if (sortOption !== 'default' && searchResults.length > 0) {
      sortAndDisplayStudents(sortOption);
      return;
    }
  
    // Show results & check if no results found
    if (searchResults.length > 0) {
      showPage(searchResults, 1);
      showResultsInfo(searchResults, 1);
      addPagination(searchResults);
    } else {
      const ul = document.querySelector(".student-list");
      infoDiv.innerHTML = '<div class="error"> Sorry, no search results found. </div>';
      ul.innerHTML = '';
  
      // Remove pagination buttons
      const list = document.querySelector(".link-list");
      list.innerHTML = "";
    }
  }


  const searchLabel = document.querySelector(".student-search");

  // Keyup event => debounce
  searchLabel.addEventListener('keyup', (event) => {
    // If the user typed in the input field
    if (event.target.id === 'search') {
      // Clear any previous timer
      clearTimeout(debounceTimer);
      infoDiv.innerHTML = '<div class="searching">Searching... </div>'
      // Set a new timer
      debounceTimer = setTimeout(() => {
        search(event.target.value);
      }, 400); // 300ms or 500ms, your choice
    }
  });

  //add event listener for search button being clicked
  searchLabel.addEventListener('click', (event) => {
    //search button is an image!!! :o
    if (event.target.tagName === 'IMG') {
      search(searchLabel.children[1].value);
    }
  });
}

/*
This function handles showing: “Showing X–Y of Z results.” 
*/
function showResultsInfo(list, page) {
  // Reference the container for results info
  const infoDiv = document.querySelector('.results-info');

  // If no matching results, show a helpful message - Silly GPT, this wont ever get called if results are zero!
  // if (list.length == 0) {
  //   infoDiv.textContent = ``;
  //   //infoDiv.innerHTML = '<div class="error"> Sorry, no search results found. </div>';
  //   return;
  // }

  // Calculate start and end indices (1-based, not 0-based)
  const startIndex = (page - 1) * itemsPerPage + 1;
  const endIndex = Math.min(page * itemsPerPage, list.length);

  // Construct the text (e.g. "Showing 10-18 of 42 results.")
  infoDiv.innerHTML = `<div class="good">Showing ${startIndex}-${endIndex} of ${list.length} results.</div>`;
}

// Add this function to create the sorting options
function showSortOptions() {
  const header = document.querySelector(".header");
  
  // Create sorting dropdown
  const sortOptions = `
    <div class="sort-options">
      <label for="sort-select">Sort by: </label>
      <select id="sort-select">
        <option value="default">Default</option>
        <option value="first-name-asc">First Name (A-Z)</option>
        <option value="first-name-desc">First Name (Z-A)</option>
        <option value="last-name-asc">Last Name (A-Z)</option>
        <option value="last-name-desc">Last Name (Z-A)</option>
        <option value="reg-date-asc">Registration Date (Oldest)</option>
        <option value="reg-date-desc">Registration Date (Newest)</option>
      </select>
    </div>
  `;
  
  // Insert after the header title but before the search
  const headerTitle = document.querySelector(".header h2");
  headerTitle.insertAdjacentHTML('afterend', sortOptions);
  
  // Add event listener for sorting
  document.getElementById('sort-select').addEventListener('change', (e) => {
    sortAndDisplayStudents(e.target.value);
  });
}

// Function to sort and display students
function sortAndDisplayStudents(sortOption) {
  // Determine what data we're working with
  const searchInput = document.getElementById('search');
  const isSearchActive = searchInput && searchInput.value.length > 0;
  
  // If search is active, we should sort the current search results
  // otherwise sort the full data set
  let dataToSort = isSearchActive ? currentSearchResults : [...data];
  
  // Sort based on the selected option
  switch(sortOption) {
    case 'last-name-asc':
      dataToSort.sort((a, b) => a.name.last.localeCompare(b.name.last));
      break;
    case 'last-name-desc':
      dataToSort.sort((a, b) => b.name.last.localeCompare(a.name.last));
      break;
    case 'reg-date-asc':
      dataToSort.sort((a, b) => new Date(a.registered.date) - new Date(b.registered.date));
      break;
    case 'reg-date-desc':
      dataToSort.sort((a, b) => new Date(b.registered.date) - new Date(a.registered.date));
      break;
    // Default case remains unchanged
  }
  
  // Store the sorted data for search to use
  currentSortedData = isSearchActive ? [...data] : dataToSort;
  
  // Reset to page 1 when sorting changes
  currentPage = 1;
  
  // Update the display with sorted data
  showPage(dataToSort, 1);
  showResultsInfo(dataToSort, 1);
  addPagination(dataToSort);
}

// Add this function to create the items-per-page options
function showItemsPerPageOptions() {
  const header = document.querySelector(".header");
  
  // Create items-per-page dropdown
  const itemsOptions = `
    <div class="items-per-page">
      <label for="items-select">Items per page: </label>
      <select id="items-select">
        <option value="5">5</option>
        <option value="8" selected>8</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
    </div>
  `;
  
  // Insert right before the search bar
  const searchBar = document.querySelector(".student-search");
  if (searchBar) {
    searchBar.insertAdjacentHTML('beforebegin', itemsOptions);
  } else {
    header.insertAdjacentHTML('beforeend', itemsOptions);
  }
  
  // Add event listener for changing items per page
  document.getElementById('items-select').addEventListener('change', (e) => {
    // Update the global itemsPerPage variable
    itemsPerPage = parseInt(e.target.value);
    
    // Reset to page 1 when changing items per page
    currentPage = 1;
    
    // Re-display with new pagination
    const searchInput = document.getElementById('search');
    const isSearchActive = searchInput && searchInput.value.length > 0;
    const currentData = isSearchActive ? currentSearchResults : data;
    
    // Apply current sorting
    const sortOption = document.getElementById('sort-select').value;
    if (sortOption !== 'default') {
      sortAndDisplayStudents(sortOption);
    } else {
      // Just update the display with current data
      showPage(currentData, 1);
      showResultsInfo(currentData, 1);
      addPagination(currentData);
    }
  });
}




// Call functions
showPage(data, 1);
showResultsInfo(data, 1);
addPagination(data);
showSearchBar();
showSortOptions();
showItemsPerPageOptions();