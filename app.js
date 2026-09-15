/*
 * NESTYIN CONNECT
 * Main application JavaScript
 */


/* =========================================
   SEARCH & FILTER
========================================= */

const searchInput =
  document.getElementById("searchInput");

const searchProjectsButton =
  document.getElementById("searchProjectsButton");

const filters =
  document.querySelectorAll(".filter");

const tagFilters =
  document.getElementById("tagFilters");

const projectFilterBar = document.getElementById("projectFilterBar");
const projectFilterState = {
  type: new Set(["all"]),
  tag: new Set(["all"]),
  company: new Set(["all"]),
  role: new Set(["all"])
};

let cards =
  document.querySelectorAll(".searchable");
let activeTag = "all";

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
  const detailPage = item.detailPage || (isCaseStudy ? "case-study.html" : "project.html");
  const detailUrl = `${detailPage}?id=${encodeURIComponent(item.id)}`;
  const applicationUrl = isCaseStudy
    ? `${item.applicationPage}?caseId=${encodeURIComponent(item.id)}`
    : `apply.html?projectId=${encodeURIComponent(item.id)}&type=${encodeURIComponent(item.type)}`;

  card.className = `card searchable ${isCaseStudy ? "case-item" : "project-item"}${
    isCaseStudy ? "" : ` ${isPrivate ? "private-item" : "public-item"}`
  }`;
  card.dataset.tags = item.tags.join("|").toLowerCase();
  card.dataset.projectType = item.type || "public";
  card.dataset.projectCompany = (item.company || "").toLowerCase();
  card.dataset.projectRoles = (item.roleCategories || [item.targetLevel]).filter(Boolean).map(role => String(role).toLowerCase()).join("|");
  card.style.cursor = "pointer";
  card.addEventListener("click", event => {
    if (event.target.closest("a")) {
      return;
    }
    window.location.href = detailUrl;
  });

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
  } else {
    meta.append(item.level || "");
    meta.append(item.deadline ? `Deadline: ${item.deadline}` : item.application || "");
  }
  card.append(meta);

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const expertButton = document.createElement("a");
  expertButton.className = "primary";
  expertButton.href = applicationUrl + (applicationUrl.includes("?") ? "&" : "?") + "evaluationType=General+expert+review";
  expertButton.textContent = isCaseStudy ? "Solve for Professional Evaluation" : "Apply for Professional Evaluation";
  footer.append(expertButton);

  const detailLink = document.createElement("a");
  detailLink.className = "secondary";
  detailLink.href = detailUrl;
  detailLink.textContent = "View details";
  footer.append(detailLink);

  const actionLink = document.createElement("a");
  actionLink.className = "primary";
  actionLink.href = applicationUrl;
  actionLink.textContent = isCaseStudy ? "Solve Case Study" : "Apply";
  footer.append(actionLink);
  card.append(footer);

  return card;
}

async function loadOpportunities() {
  const response = await fetch(`content-template.json?v=${Date.now()}`, {
    cache: "no-store"
  });
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

  renderProjectFilters(document.body.classList.contains("case-studies-page") ? caseStudies : projects);

  if (tagFilters) {
    const tags = [...new Set(
      [...caseStudies, ...projects].flatMap(item => item.tags)
    )].sort();

    tagFilters.replaceChildren();
    const allTagsButton = createTagFilter("All tags", "all");
    allTagsButton.classList.add("active");
    tagFilters.append(allTagsButton);
    tags.forEach(tag => tagFilters.append(createTagFilter(tag, tag)));
  }

  if (caseStudyCards) {
    caseStudyCards.replaceChildren(
      ...caseStudies.map(item => createOpportunityCard(item, "caseStudy"))
    );
  }

  if (projectCards) {
    projectCards.replaceChildren(
      ...projects.map(item => createOpportunityCard(item, "project"))
    );
  }
  cards = document.querySelectorAll(".searchable");
  selectFilterFromHash();
}

function createTagFilter(label, value) {
  const button = document.createElement("button");
  button.className = "tag-filter";
  button.type = "button";
  button.textContent = label;
  button.dataset.tag = value;
  button.addEventListener("click", () => {
    activeTag = value.toLowerCase();
    tagFilters.querySelectorAll(".tag-filter").forEach(item => {
      item.classList.toggle("active", item.dataset.tag.toLowerCase() === activeTag);
    });
    filterCards();
  });
  return button;
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

  const caseStudySection = document.getElementById("case-studies");
  const projectSection = document.getElementById("projects");
  const showCaseStudies = ["all", "case"].includes(activeFilter);
  const showProjects = ["all", "project", "public", "private"].includes(activeFilter);

  if (caseStudySection) {
    caseStudySection.style.display = showCaseStudies ? "" : "none";
  }

  if (projectSection) {
    projectSection.style.display = showProjects ? "" : "none";
  }


  cards.forEach(card => {

    const text =
      card.innerText.toLowerCase();


    /*
     * Search
     */

    const searchMatch =
      text.includes(searchText);

    const tagMatch =
      activeTag === "all" || card.dataset.tags.split("|").includes(activeTag);


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

    const projectTypeMatch =
      projectFilterState.type.has("all") ||
      projectFilterState.type.has(card.dataset.projectType);
    const projectTagMatch =
      projectFilterState.tag.has("all") ||
      card.dataset.tags.split("|").some(tag => projectFilterState.tag.has(tag));
    const projectCompanyMatch =
      projectFilterState.company.has("all") ||
      projectFilterState.company.has(card.dataset.projectCompany);
    const projectRoleMatch =
      projectFilterState.role.has("all") ||
      card.dataset.projectRoles.split("|").some(role => projectFilterState.role.has(role));


    /*
     * Show / hide card
     */

    if (searchMatch && filterMatch && tagMatch && projectTypeMatch && projectTagMatch && projectCompanyMatch && projectRoleMatch) {

      card.style.display = "";

    } else {

      card.style.display = "none";

    }

  });

}

function createProjectFilter(key, label, options) {
  const picker = document.createElement("div");
  picker.className = "category-picker";

  const button = document.createElement("button");
  button.className = "category-picker-button";
  button.type = "button";
  button.textContent = `All ${label}`;
  button.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "category-picker-menu";
  menu.hidden = true;

  const checkboxes = options.map(([value, optionLabel]) => {
    const option = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = value;
    checkbox.checked = value === "all";
    const text = document.createElement("span");
    text.textContent = optionLabel;
    option.append(checkbox, text);
    menu.append(option);
    return checkbox;
  });

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const selected = projectFilterState[key];
      if (checkbox.value === "all" && checkbox.checked) {
        selected.clear();
        selected.add("all");
        checkboxes.forEach(item => { item.checked = item.value === "all"; });
      } else {
        selected.delete("all");
        if (checkbox.checked) selected.add(checkbox.value);
        else selected.delete(checkbox.value);
        if (selected.size === 0) {
          selected.add("all");
          checkboxes[0].checked = true;
        }
      }
      const labels = checkboxes
        .filter(item => item.checked && item.value !== "all")
        .map(item => item.nextElementSibling.textContent);
      button.textContent = selected.has("all")
        ? `All ${label}`
        : labels.length > 1 ? `${labels.length} selected` : labels[0];
      filterCards();
    });
  });

  picker.append(button, menu);
  return picker;
}

function renderProjectFilters(projects) {
  if (!projectFilterBar) return;
  const tags = [...new Set(projects.flatMap(item => item.tags.map(tag => tag.toLowerCase())))].sort();
  const companies = [...new Set(projects.map(item => (item.company || "").toLowerCase()))].sort();
  const roles = [...new Set(projects.flatMap(item => item.roleCategories || []))].sort();
  const companyOptions = companies.map(company => [
    company,
    company.includes("confidential") ? "Anonymous / Confidential" : company
  ]);
  projectFilterBar.replaceChildren(
    createProjectFilter("type", "types", [["all", "All project types"], ["public", "Public"], ["private", "Private"]]),
    createProjectFilter("tag", "tags", [["all", "All tags"], ...tags.map(tag => [tag, tag.replace(/\b\w/g, letter => letter.toUpperCase())])]),
    createProjectFilter("company", "companies", [["all", "All companies"], ...companyOptions]),
    createProjectFilter("role", "roles", [["all", "All role categories"], ...roles.map(role => [role.toLowerCase(), role])])
  );
}



/* Search */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    filterCards
  );

}

if (searchProjectsButton) {
  searchProjectsButton.addEventListener("click", filterCards);
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

function selectFilterFromHash() {
  const hashFilters = {
    "#case-studies": "case",
    "#projects": "project"
  };
  const filterName = hashFilters[window.location.hash];

  if (!filterName) {
    return;
  }

  const filter = document.querySelector(`[data-filter="${filterName}"]`);
  if (filter) {
    filters.forEach(item => item.classList.remove("active"));
    filter.classList.add("active");
    filterCards();
  }
}

loadOpportunities().catch(error => {
  console.error("Could not load opportunity content:", error);
});

window.addEventListener("hashchange", selectFilterFromHash);
selectFilterFromHash();



