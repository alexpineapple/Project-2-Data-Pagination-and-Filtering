/*
Treehouse Techdegree:
FSJS Project 2 - Data Pagination and Filtering
*/

//TO DO: maybe user can pick this?
var itemsPerPage = 9;

/*
For assistance:
   Check out the "Project Resources" section of the Instructions tab: https://teamtreehouse.com/projects/data-pagination-and-filtering#instructions
   Reach out in your Slack community: https://treehouse-fsjs-102.slack.com/app_redirect?channel=unit-2
*/


/*
Create the `showPage` function
This function will create and insert/append the elements needed to display a "page" of nine students
*/
function showPage(list, page) {
  //calculate the page indexes
  var startIndex = (page * itemsPerPage) - itemsPerPage;
  var endIndex = (page * itemsPerPage);

  console.log(`Now listing page ${page}, indexes ${startIndex}-${endIndex - 1}`);

  //get & clear the list element of previous students
  const ul = document.querySelector(".student-list");
  ul.innerHTML = "";

  //iterate through the student list
  for (let i = 0; i < list.length; i++) {

    //only display those inside the specified indexes
    if (startIndex <= i && i < endIndex) {

      //create the list item with the student details
      let listItem = `<li class="student-item cf">
                        <div class="student-details">
                        <img class="avatar" src=${list[i].picture.medium} alt="Profile Picture">
                        <h3>${list[i].name.first} ${list[i].name.last}</h3>
                        <span class="email">${list[i].email}</span>
                      </div>
                      <div class="joined-details">
                        <span class="date">${list[i].registered.date}</span>
                      </div>
                      </li>`

      //append list item to the ul element
      ul.innerHTML += listItem;
    }
  }
}

/*
Create the `addPagination` function
This function will create and insert/append the elements needed for the pagination buttons
*/
function addPagination(list) {

  //calculate buttons needed, round up to the next whole number
  var buttonsNeeded = Math.ceil(list.length/itemsPerPage);

  console.log(`Creating ${buttonsNeeded} new pagination buttons`);

  //get & clear the link-list class element
  const ul = document.querySelector(".link-list");
  ul.innerHTML = "";

  //create the buttons needed
  for (let i = 0; i < buttonsNeeded; i++) {
    ul.innerHTML += `<li><button type="button">${i + 1}</button></li>`
  }

  //Select the first pagination button and give it a class name of active.
  //should be grandchild of ul (ul -> li -> button)
  ul.children[0].children[0].className = "active";

  //add the event listener
  ul.addEventListener('click', (event) =>{

    //should only run when buttons are pressed, not surrounding area
    if (event.target.tagName === 'BUTTON') {

      let targetButton = event.target;
      let buttons = ul.children;

      //Remove the active class from any other pagination button.
      for (let i = 0; i < buttons.length; i++) {
          buttons[i].children[0].className = "";
      }

      //Add the active class to the pagination button that was just clicked.
      targetButton.className = "active";

      //Call the showPage function passing the list parameter and the page number to display as arguments.
      showPage(list, targetButton.textContent)

    }
  });

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

  //function to be used when searching, used by two event listeners
  function search(query) {

    //let ul = document.querySelector(".student-list");
    //reset if empty
    if (query.length == 0) {
      showPage(data, 1);
      addPagination(data);
      return
    }

    console.log(`searching for ${query}`);

    //convert to lower case
    query = query.toLowerCase();

    //this array will hold the matches
    let searchResults = []

    //loop through the names to find matches
    for (let i = 0; i < data.length; i++) {
      //console.log(data[i].name.first)

      //combine fist and last names
      let firstLastName = `${data[i].name.first} ${data[i].name.last}`.toLowerCase();

      if (firstLastName.includes(query)) {
        //match found!!
        searchResults.push(data[i]);
      }

      //show results & check if no results found
      if (searchResults.length > 0) {
        showPage(searchResults, 1);
        addPagination(searchResults);
      } else {
        const ul = document.querySelector(".student-list");
        ul.innerHTML = '<div class="error"> Sorry, no search results found. </div>'
        //remove pagination buttons
        const list = document.querySelector(".link-list");
        list.innerHTML = "";
      }
    }
  }

  const searchLabel = document.querySelector(".student-search");

  //add event listener for names typed in
  searchLabel.addEventListener('keyup', (event) => {
    search(event.target.value);
  });

  //add event listener for search button being clicked
  searchLabel.addEventListener('click', (event) => {
    //search button is an image!!! :o
    if (event.target.tagName === 'IMG') {
      search(searchLabel.children[1].value);
    }
  });
}

// Call functions
showPage(data, 1);
addPagination(data);
showSearchBar();
