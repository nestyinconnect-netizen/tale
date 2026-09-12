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



/* =========================================
   CLOUDFLARE WORKER TEST
========================================= */

async function testWorker() {

  const button =
    document.querySelector(
      "#workerTestButton"
    );


  if (button) {

    button.disabled = true;

    button.innerText =
      "Testing Cloudflare...";

  }


  /*
   * Test data
   */

  const testData = {

    type: "public",

    projectId: "project-payment-api",

    project: "Build a Scalable Payment API",

    name: "Test User",

    email: "test@example.com",

    experience: "5 years",

    company: "Microsoft",

    skills: [
      "Backend",
      "AWS",
      "System Design"
    ],

    resume:
      "https://drive.google.com/test",

    solution:
      "https://1drv.ms/test",

    submittedAt:
      new Date().toISOString()

  };


  try {

    console.log(
      "Sending data to Cloudflare:",
      testData
    );


    /*
     * Send POST request
     */

    const response = await fetch(
      "https://test.nestyinconnect.workers.dev/submit",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(testData)
      }
    );


    console.log(
      "HTTP status:",
      response.status
    );


    console.log(
      "Content-Type:",
      response.headers.get(
        "content-type"
      )
    );


    /*
     * IMPORTANT:
     *
     * Read response as TEXT first.
     *
     * This prevents:
     *
     * Unexpected end of JSON input
     *
     * if Cloudflare sends an HTML/error response.
     */

    const responseText =
      await response.text();


    console.log(
      "Raw Worker response:",
      responseText
    );


    /*
     * Try to parse JSON
     */

    let result = null;


    try {

      if (responseText) {

        result =
          JSON.parse(responseText);

      }

    } catch (jsonError) {

      console.error(
        "Response was not valid JSON:",
        jsonError
      );

    }


    /*
     * Worker returned JSON
     */

    if (result) {

      if (result.success) {

        alert(
          "SUCCESS!\n\n" +
          "Cloudflare Worker received the test submission."
        );

      } else {

        alert(
          "WORKER ERROR\n\n" +
          "Status: " +
          response.status +
          "\n\n" +
          (result.message ||
            "Unknown Worker error")
        );

      }

    }


    /*
     * Worker returned something that
     * wasn't JSON
     */

    else {

      alert(
        "CLOUDFLARE RESPONSE\n\n" +
        "HTTP Status: " +
        response.status +
        "\n\n" +
        "Response:\n" +
        (
          responseText ||
          "[empty response]"
        )
      );

    }


  } catch (error) {

    console.error(
      "Cloudflare connection error:",
      error
    );


    alert(
      "CONNECTION ERROR\n\n" +
      error.message
    );

  }


  /*
   * Restore button
   */

  if (button) {

    button.disabled = false;

    button.innerText =
      "Test Cloudflare Submission";

  }

}



/* =========================================
   MAKE FUNCTION AVAILABLE TO HTML
========================================= */

window.testWorker =
  testWorker;
