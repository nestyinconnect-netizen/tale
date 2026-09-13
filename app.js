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

let cards =
  document.querySelectorAll(".searchable");

function createOpportunityCard(item, kind) {
  const card = document.createElement("article");
  const isCaseStudy = kind === "caseStudy";
  const isPrivate = item.type === "private";
  const badgeClass = isCaseStudy ? "case" : isPrivate ? "private" : "public";
  const badgeText = isCaseStudy
    ? "🟣 CASE STUDY"
    : isPrivate
      ? "🔒 PRIVATE"
      : "🟢 PUBLIC";
  const applicationUrl = isCaseStudy
    ? `${item.applicationPage}?caseId=${encodeURIComponent(item.id)}`
    : `apply.html?projectId=${encodeURIComponent(item.id)}&type=${encodeURIComponent(item.type)}`;

  card.className = `card searchable ${isCaseStudy ? "case-item" : "project-item"}${
    isCaseStudy ? "" : ` ${isPrivate ? "private-item" : "public-item"}`
  }`;

  const badge = document.createElement("div");
  badge.className = `badge ${badgeClass}`;
  badge.textContent = badgeText;
  card.append(badge);

  const title = document.createElement("h3");
  title.textContent = item.title;
  card.append(title);

  const description = document.createElement("p");
  description.textContent = item.description;
  card.append(description);

  const company = document.createElement("div");
  company.className = "company";
  company.textContent = item.company;
  card.append(company);

  const tags = document.createElement("div");
  tags.className = "tags";
  item.tags.forEach(tag => {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tags.append(tagElement);
  });
  card.append(tags);

  const meta = document.createElement("div");
  meta.className = isCaseStudy ? "card-info" : "project-meta";
  if (isCaseStudy) {
    meta.append(`${item.rating ? `★ ${item.rating}` : ""}`);
    meta.append(`${item.attempts ? `${item.attempts} attempts` : ""}`);
    meta.append(item.feedback || "");
  } else {
    meta.append(item.level || "");
    meta.append(item.deadline ? `Deadline: ${item.deadline}` : item.application || "");
  }
  card.append(meta);

  const footer = document.createElement("div");
  footer.className = "card-footer";
  if (!isCaseStudy) {
    const evaluation = document.createElement("span");
    evaluation.className = "evaluation";
    evaluation.textContent = `✓ ${item.evaluation || "Evaluation"}`;
    footer.append(evaluation);
  }

  const link = document.createElement("a");
  link.className = "primary";
  link.href = applicationUrl;
  link.textContent = isCaseStudy ? "Solve Case Study" : "Apply";
  footer.append(link);
  card.append(footer);

  return card;
}

async function loadOpportunities() {
  const response = await fetch("content-template.json");
  if (!response.ok) {
    throw new Error(`Could not load opportunities: ${response.status}`);
  }

  const content = await response.json();
  const caseStudyCards = document.getElementById("caseStudyCards");
  const projectCards = document.getElementById("projectCards");
  const showAll = document.body.dataset.view === "all";
  const caseStudies = showAll
    ? content.caseStudies
    : content.caseStudies.filter(item => item.showOnMain);
  const projects = showAll
    ? content.projects
    : content.projects.filter(item => item.showOnMain);

  caseStudyCards.replaceChildren(
    ...caseStudies.map(item => createOpportunityCard(item, "caseStudy"))
  );
  projectCards.replaceChildren(
    ...projects.map(item => createOpportunityCard(item, "project"))
  );
  cards = document.querySelectorAll(".searchable");
}


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

loadOpportunities().catch(error => {
  console.error("Could not load opportunity content:", error);
});



