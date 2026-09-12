/*
 * NESTYIN CONNECT
 * Main application JavaScript
 */


/* =========================================
   SEARCH & FILTER
========================================= */

const searchInput =
  document.getElementById("searchInput");

const filters =
  document.querySelectorAll(".filter");

const cards =
  document.querySelectorAll(".searchable");


function filterCards() {

  const searchText =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

  const activeFilterElement =
    document.querySelector(".filter.active");

  const activeFilter =
    activeFilterElement
      ? activeFilterElement.dataset.filter
      : "all";


  cards.forEach(card => {

    const text =
      card.innerText.toLowerCase();


    /*
     * Search
     */

    const searchMatch =
      text.includes(searchText);


    /*
     * Category filter
     */

    let filterMatch = true;


    if (activeFilter === "case") {

      filterMatch =
        card.classList.contains("case-item");

    }


    if (activeFilter === "project") {

      filterMatch =
        card.classList.contains("project-item");

    }


    if (activeFilter === "public") {

      filterMatch =
        card.classList.contains("public-item");

    }


    if (activeFilter === "private") {

      filterMatch =
        card.classList.contains("private-item");

    }


    /*
     * Show / hide card
     */

    if (searchMatch && filterMatch) {

      card.style.display = "";

    } else {

      card.style.display = "none";

    }

  });

}



/* Search */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    filterCards
  );

}



/* Filters */

filters.forEach(filter => {

  filter.addEventListener(
    "click",
    function () {

      /*
       * Remove active state
       */

      filters.forEach(item => {

        item.classList.remove("active");

      });


      /*
       * Activate clicked filter
       */

      this.classList.add("active");


      /*
       * Apply filter
       */

      filterCards();

    }
  );

});



