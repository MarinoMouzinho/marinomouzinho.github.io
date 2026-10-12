const root = document.documentElement;
const content = document.querySelector(".site-content");
const navigationLinks = document.querySelectorAll(".main-navigation a");
const sections = document.querySelectorAll(".content-section");

const languageToggle = document.querySelector("#language-toggle");
const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");

let language = "pt";
let theme = "light";

// --- Tela de Carregamento & Transição de Saudações ---
const loaderScreen = document.getElementById("loader-screen");
const greetings = document.querySelectorAll(".loader-greeting-wrapper .greeting");
let currentGreetingIndex = 0;
let greetingInterval;

const projectGrid = document.getElementById("project-grid");

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error("Erro ao carregar o arquivo de projetos.");
    
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error("Erro:", error);
    if (projectGrid) {
      projectGrid.innerHTML = "<p style='color: var(--muted);'>Não foi possível carregar os projetos no momento.</p>";
    }
  }
}

function renderProjects(projects) {
  if (!projectGrid) return;

  projectGrid.innerHTML = "";

  projects.forEach((project) => {
    const isSlider = project.images.length > 1;
    
    let mediaContent = "";
    if (isSlider) {
      const slidesHtml = project.images.map(img => `
        <div class="project-slide-item">
          <img src="${img.url}" alt="${img.alt}" loading="lazy">
          ${img.subtitle ? `<div class="project-slide-caption">${img.subtitle}</div>` : ""}
        </div>
      `).join("");

      mediaContent = `
        <div class="project-media-wrapper">
          <span class="swipe-hint">← arraste para ver mais →</span>
          <div class="project-manual-slider">
            ${slidesHtml}
          </div>
        </div>
      `;
    } else {
      const img = project.images[0] || { url: "", alt: "", subtitle: "" };
      mediaContent = `
        <div class="project-media-wrapper">
          <div class="project-media-container">
            <img src="${img.url}" alt="${img.alt}" loading="lazy">
            ${img.subtitle ? `<div class="project-slide-caption">${img.subtitle}</div>` : ""}
          </div>
        </div>
      `;
    }

    const techHtml = (project.technologies || [])
      .map((tech) => `<span>${tech}</span>`)
      .join("");

    // Gera os botões de links dinamicamente (GitHub, Figma, Live Demo, etc)
    const linksHtml = (project.links || [])
      .map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="project-link-btn">${link.name} ↗</a>`)
      .join("");

    // Mudamos de <a> para <div> para o card não ser clicable por inteiro
    const card = document.createElement("div");
    card.className = "project-card";
    card.dataset.category = project.category;

    card.innerHTML = `
      ${mediaContent}
      <div class="project-info">
        <span class="project-category">${project.category}</span>
        <div class="project-header-info">
          <h3>${project.title}</h3>
          ${project.year ? `<span class="project-year">${project.year}</span>` : ""}
        </div>
        <p>${project.description}</p>
        <div class="project-technologies">
          ${techHtml}
        </div>
        ${linksHtml ? `<div class="project-links">${linksHtml}</div>` : ""}
      </div>
    `;

    projectGrid.appendChild(card);
  });

  // Ativa os ouvintes de clique dos filtros após os cards estarem renderizados
  setupFilterListeners();

  const projetosSection = document.getElementById("projetos");
  if (projetosSection) {
    projetosSection.classList.add("in-view");
  }
}

loadProjects();

// --- Renderização Dinâmica de Experiências e Formação via JSON ---
async function loadExperiences() {
  try {
    const response = await fetch("data/experiences.json"); // Ajuste o caminho se necessário (ex: "data/experiences.json")
    if (!response.ok) throw new Error("Erro ao carregar o arquivo de experiências.");
    
    const data = await response.json();
    renderExperiences(data.experiences, "experience-grid", "exp");
    renderExperiences(data.education, "education-grid", "edu");
  } catch (error) {
    console.error("Erro ao carregar experiências:", error);
  }
}

function renderExperiences(items, elementId, type) {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "timeline-item";

    if (type === "exp") {
      div.innerHTML = `
        <span class="timeline-period">${item.period}</span>
        <h4 class="timeline-title">${item.role}</h4>
        <span class="timeline-company">${item.company}</span>
        <p class="timeline-description">${item.description}</p>
      `;
    } else {
      div.innerHTML = `
        <span class="timeline-period">${item.period}</span>
        <h4 class="timeline-title">${item.degree}</h4>
        <span class="timeline-company">${item.institution}</span>
      `;
    }

    container.appendChild(div);
  });
}

loadExperiences();

// --- Lógica de Filtro dos Projetos dinâmicos corrigida ---
function setupFilterListeners() {
  const filterButtons = document.querySelectorAll(".project-filter button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      filterButtons.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      });

      // Seleciona os cards gerados dinamicamente
      const currentCards = document.querySelectorAll(".project-card");
      
      currentCards.forEach((card) => {
        const matches = category === "todos" || card.dataset.category === category;
        
        // Adiciona ou remove a classe que aplica display: none
        if (matches) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });

    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  });
}

function startGreetingsLoop() {
  greetingInterval = setInterval(() => {
    greetings[currentGreetingIndex].classList.remove("active");
    currentGreetingIndex = (currentGreetingIndex + 1) % greetings.length;
    greetings[currentGreetingIndex].classList.add("active");
  }, 350);
}

startGreetingsLoop();

function dismissLoader() {
  clearInterval(greetingInterval);
  if (loaderScreen) {
    loaderScreen.classList.add("fade-out");
    setTimeout(() => {
      loaderScreen.remove();
    }, 600);
  }
}

window.addEventListener("load", () => {
  document.fonts.ready.then(() => {
    setTimeout(dismissLoader, 800);
  });
});

setTimeout(dismissLoader, 4000);

// Idioma
function updateLanguage(nextLanguage) {
  language = nextLanguage;

  root.dataset.language = language;
  root.lang = language === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt][data-en]").forEach((element) => {
    element.textContent = element.dataset[language];
  });

  document.querySelectorAll("[data-language-option]").forEach((element) => {
    element.classList.toggle(
      "active",
      element.dataset.languageOption === language
    );
  });

  updateThemeLabel();
}

languageToggle.addEventListener("click", () => {
  updateLanguage(language === "pt" ? "en" : "pt");
});

// Tema
function updateThemeLabel() {
  if (theme === "light") {
    themeLabel.textContent = language === "pt" ? "claro" : "light";
  } else {
    themeLabel.textContent = language === "pt" ? "escuro" : "dark";
  }
}

function updateTheme(nextTheme) {
  theme = nextTheme;
  root.dataset.theme = theme;
  updateThemeLabel();
}

themeToggle.addEventListener("click", () => {
  updateTheme(theme === "light" ? "dark" : "light");
});

// --- Navegação Contextual & Correção do Header ---
const mobileLayout = window.matchMedia("(max-width: 768px)");

const getScrollContainer = () => (mobileLayout.matches ? window : content);

const updateActiveHeaderLink = () => {
  const scrollPosition = mobileLayout.matches ? window.scrollY : content.scrollTop;
  const offsetCorrection = mobileLayout.matches ? 100 : 150;

  let currentSectionId = sections[0].id;

  sections.forEach((section) => {
    const sectionTop = mobileLayout.matches 
      ? section.getBoundingClientRect().top + window.scrollY - offsetCorrection
      : section.offsetTop - offsetCorrection;

    if (scrollPosition >= sectionTop) {
      currentSectionId = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const observerOptions = {
  root: mobileLayout.matches ? null : content,
  rootMargin: "0px 0px -20% 0px",
  threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
    }
  });
}, observerOptions);

sections.forEach((section) => sectionObserver.observe(section));

const targetScrollElement = getScrollContainer();
targetScrollElement.addEventListener("scroll", updateActiveHeaderLink, { passive: true });

window.addEventListener("resize", () => {
  targetScrollElement.removeEventListener("scroll", updateActiveHeaderLink);
  const newScrollElement = getScrollContainer();
  newScrollElement.addEventListener("scroll", updateActiveHeaderLink, { passive: true });
  updateActiveHeaderLink();
});

document.addEventListener("DOMContentLoaded", () => {
  if (sections.length > 0) {
    sections[0].classList.add("in-view");
  }
  updateActiveHeaderLink();
});

updateLanguage("pt");
updateTheme("light");