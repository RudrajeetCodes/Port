const roles = [
    "Frontend Developer",
    "Game Developer",
    "Software Engineer",
    "Creative Problem Solver"
];

const roleElement = document.getElementById("dynamicRole");

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeWriter() {
    const currentRole = roles[roleIndex];

    if (!deleting) {
        roleElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentRole.length) {
            deleting = true;
            setTimeout(typeWriter, 1800);
            return;
        }
    } else {
        roleElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    }

    setTimeout(typeWriter, deleting ? 45 : 85);
}

typeWriter();

function updateLocalTime() {
    const timeElement = document.getElementById("localTime");

    const now = new Date();

    timeElement.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(now);
}

updateLocalTime();
setInterval(updateLocalTime, 1000);



const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// Load saved theme, default to dark
const savedTheme = localStorage.getItem("theme") || "dark";

function setTheme(theme) {
    html.setAttribute("data-theme", theme);

    // Switch profile banner based on theme
    const profileBanner = document.getElementById("profileBanner");

    if (profileBanner) {
        profileBanner.src = theme === "light"
            ? "assets/images/bannerW.gif"
            : "assets/images/banner.gif";
    }

    localStorage.setItem("theme", theme);

    const isDark = theme === "dark";

    themeToggle.innerHTML = isDark
        ? '<i data-lucide="moon"></i>'
        : '<i data-lucide="sun"></i>';

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    lucide.createIcons();
}

// Apply saved theme
setTheme(savedTheme);

// Toggle theme on click
themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
});

// =================================
// EXPERIENCE DROPDOWN ANIMATIONS
// =================================

document.querySelectorAll(".experience-item").forEach((item) => {
    const summary = item.querySelector(".experience-summary");
    const content = item.querySelector(".experience-details");

    let animation = null;

    summary.addEventListener("click", (event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        event.preventDefault();

        if (animation) {
            animation.cancel();
            animation = null;
        }

        const isOpen = item.open;

        if (isOpen) {
            // CLOSING
            const height = content.getBoundingClientRect().height;

            animation = content.animate(
                [
                    {
                        height: `${height}px`,
                        marginBottom: "20px",
                        opacity: 1
                    },
                    {
                        height: "0px",
                        marginBottom: "0px",
                        opacity: 0
                    }
                ],
                {
                    duration: 260,
                    easing: "cubic-bezier(0.4, 0, 1, 1)"
                }
            );

            animation.onfinish = () => {
                item.open = false;
                content.style.height = "";
                content.style.marginBottom = "";
                content.style.opacity = "";
                animation = null;
            };

        } else {
            // OPENING
            item.open = true;

            content.style.height = "auto";
            content.style.marginBottom = "20px";
            content.style.overflow = "hidden";

            const height = content.getBoundingClientRect().height;

            content.style.height = "0px";
            content.style.marginBottom = "0px";

            animation = content.animate(
                [
                    {
                        height: "0px",
                        marginBottom: "0px",
                        opacity: 0
                    },
                    {
                        height: `${height}px`,
                        marginBottom: "20px",
                        opacity: 1
                    }
                ],
                {
                    duration: 350,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                }
            );

            animation.onfinish = () => {
                content.style.height = "";
                content.style.marginBottom = "";
                content.style.opacity = "";
                content.style.overflow = "";
                animation = null;
            };
        }
    });
});

// =================================
// SCROLL REVEAL
// =================================

const revealElements = document.querySelectorAll(
    ".tech-section, .experience-section, .projects-section, .about-section, .dev-stats-section, .quote-section"
);

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});

// =================================
// PROJECT DATA
// =================================

const projects = [
    {
        name: "AOT Inspired Game",
        category: "Game Development",
        description: "An Attack on Titan-inspired game built using Luau and Roblox Studio.",

        image: "assets/images/game.png",
        imageBackground: "linear-gradient(135deg, #e9f5dc 0%, #c8f0a0 55%, #a9e66d 100%)",

        status: "In Development",
        statusType: "development",

        technologies: ["Luau", "Roblox Studio"],

        website: "YOUR_AOT_GAME_LINK",
        github: "YOUR_AOT_GITHUB_LINK"
    },

    {
        name: "Project Orion",
        category: "Discord Bot",
        description: "A personal Discord productivity and developer assistant built with Python.",

        image: "assets/images/orion.png",
        imageBackground: "linear-gradient(135deg, #dce8f8 0%, #b9c9ed 50%, #a4b9e8 100%)",

        status: "In Development",
        statusType: "development",

        technologies: ["Python", "Discord", "SQLite"],

        website: "YOUR_ORION_PROJECT_LINK",
        github: "YOUR_ORION_GITHUB_LINK"
    }
];




// =================================
// PROJECT RENDERER
// =================================

const projectsGrid = document.getElementById("projectsGrid");

function renderProjects() {

    if (!projectsGrid) return;

    projectsGrid.innerHTML = projects.map(project => {

        const visibleTechnologies = project.technologies.slice(0, 2);
        const extraTechnologies = project.technologies.length - 2;

        const technologyHTML = visibleTechnologies.map(tech => `
            <span class="project-tag">${tech}</span>
        `).join("");

        const moreHTML = extraTechnologies > 0
            ? `<span class="project-tag-more">+${extraTechnologies}</span>`
            : "";

        return `
            <article class="project-card">

                <div
                    class="project-image-wrapper"
                    style="--project-image-bg: ${project.imageBackground || "#e5e5e5"}"
                >
                    <img
                        src="${project.image}"
                        alt="${project.name} preview"
                        class="project-image"
                        loading="lazy"
                    >
                </div>

                <div class="project-info">

                    <div class="project-title-row">

                        <h3 class="project-title">
                            ${project.name}
                        </h3>

                        ${project.status ? `
                            <span class="project-status ${project.statusType || ""}">
                                <span class="project-status-dot"></span>
                                ${project.status}
                            </span>
                        ` : ""}

                    </div>

                    <p class="project-category">
                        ${project.category}
                    </p>

                    <p class="project-description">
                        ${project.description}
                    </p>

                    <div class="project-footer">

                        <div class="project-tags">
                            ${technologyHTML}
                            ${moreHTML}
                        </div>

                        <div class="project-links">

                            <!-- Live Website -->
                            <a
                                href="${project.website || "#"}"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View ${project.name} live"
                                title="Live Website"
                                class="${project.website ? "" : "disabled"}"
                            >
                                <i data-lucide="external-link"></i>
                            </a>

                            <!-- GitHub -->
                            <a
                                href="${project.github || "#"}"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="${project.name} GitHub repository"
                                title="GitHub"
                                class="${project.github ? "" : "disabled"}"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.031 1.532 1.031.892 1.53 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.22-.253-4.555-1.11-4.555-4.944 0-1.092.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.699 1.028 1.591 1.028 2.683 0 3.843-2.339 4.688-4.566 4.937.359.31.678.921.678 1.856 0 1.34-.012 2.42-.012 2.75 0 .265.18.576.688.478A10.003 10.003 0 0 0 22 12c0-5.523-4.477-10-10-10Z"/>
                                </svg>
                            </a>

                        </div>

                    </div>

                </div>

            </article>
        `;

    }).join("");

    lucide.createIcons();
}

renderProjects();

// =================================
// GITHUB COMMIT ACTIVITY
// =================================

const githubActivity = [
    {
        message: "Add Dev Stats section and theme-aware contribution legend",
        repo: "Port",
        date: "Nov 4, 2026",
        type: "commits"
    },
    {
        message: "Add About section and refine theme styling",
        repo: "Port",
        date: "Nov 4, 2026",
        type: "commits"
    },
    {
        message: "style: refine light theme with cool pink palette",
        repo: "Port",
        date: "Nov 4, 2026",
        type: "commits"
    },
    {
        message: "feat: add projects section and improve portfolio UI",
        repo: "Port",
        date: "Nov 3, 2026",
        type: "commits"
    },
    {
        message: "Build portfolio experience section and animations",
        repo: "Port",
        date: "Nov 3, 2026",
        type: "commits"
    }
];

const activityList = document.getElementById("github-activity-list");
const activityTabs = document.querySelectorAll(".activity-tab");
const showMoreButton = document.getElementById("activity-show-more");

let activeActivityFilter = "commits";
let showAllActivity = false;

function renderGithubActivity() {
    if (!activityList) return;

    const filteredActivity = githubActivity.filter(
        activity => activity.type === activeActivityFilter
    );

    const visibleActivity = showAllActivity
        ? filteredActivity
        : filteredActivity.slice(0, 4);

    if (filteredActivity.length === 0) {
        activityList.innerHTML = `
            <div class="github-activity-empty">
                No ${activeActivityFilter} activity to show.
            </div>
        `;
    } else {
        activityList.innerHTML = visibleActivity.map(activity => `
            <div class="github-activity-item">

                <span class="activity-commit-icon" aria-hidden="true">⌘</span>

                <span class="activity-commit-message" title="${activity.message}">
                    ${activity.message}
                </span>

                <span class="activity-commit-repo">
                    ${activity.repo}
                </span>

                <span class="activity-commit-date">
                    ${activity.date}
                </span>

            </div>
        `).join("");
    }

    showMoreButton.hidden = filteredActivity.length <= 4;
    showMoreButton.textContent = showAllActivity ? "Show less" : "Show more";
}

// Tab switching

activityTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        activityTabs.forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        activeActivityFilter = tab.dataset.filter;
        showAllActivity = false;

        renderGithubActivity();
    });
});

// Show more / less

showMoreButton.addEventListener("click", () => {
    showAllActivity = !showAllActivity;
    renderGithubActivity();
});

renderGithubActivity();

// =================================
// FLOATING NAVIGATION
// =================================

const navItems = document.querySelectorAll(".nav-item");

const navSections = [
    "home",
    "experience",
    "projects",
    "about",
    "dev-stats"
].map(id => document.getElementById(id)).filter(Boolean);

// Smooth navigation

navItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();

        const target = document.getElementById(item.dataset.section);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

/// Detect current section

function updateActiveSection() {
    const activationPoint = window.innerHeight * 0.4;

    let activeSection = navSections[0];

    navSections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= activationPoint) {
            activeSection = section;
        }
    });

    if (!activeSection) return;

    navItems.forEach(item => {
        const isActive = item.dataset.section === activeSection.id;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-current", isActive ? "location" : "false");
    });
}

window.addEventListener("scroll", updateActiveSection, {
    passive: true
});

window.addEventListener("resize", updateActiveSection);

updateActiveSection();


// =================================
// DISCORD STATUS — LANYARD API
// =================================



(() => {
    console.log("[Lanyard] Script initialized");

    const LANYARD_USER_ID = "321037704563523584";

    const statusDot = document.getElementById("discordStatusDot");
    const statusText = document.getElementById("discordStatusText");

    if (!statusDot || !statusText) {
        console.error("[Lanyard] Status elements not found. Check index.html IDs.");
        return;
    }

    let socket;
    let heartbeat;
    let reconnectTimer;

    function updateDiscordStatus(status) {
        console.log("[Lanyard] Discord status:", status);

        if (!status) return;

        const offline = status === "offline";

        statusText.textContent = offline ? "Offline" : "Active";
        statusDot.dataset.status = offline ? "offline" : "online";
    }

    function connectLanyard() {
        console.log("[Lanyard] Connecting...");

        socket = new WebSocket("wss://api.lanyard.rest/socket");

        socket.addEventListener("open", () => {
            console.log("[Lanyard] WebSocket connected");
        });

        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);

            console.log("[Lanyard] Received:", message);

            // Hello
            if (message.op === 1) {
                socket.send(JSON.stringify({
                    op: 2,
                    d: {
                        subscribe_to_id: LANYARD_USER_ID
                    }
                }));

                heartbeat = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ op: 3 }));
                    }
                }, message.d.heartbeat_interval);
            }

            // Initial presence
            if (message.t === "INIT_STATE") {
                updateDiscordStatus(message.d.discord_status);
            }

            // Live presence update
            if (message.t === "PRESENCE_UPDATE") {
                updateDiscordStatus(message.d.discord_status);
            }
        });

        socket.addEventListener("error", (error) => {
            console.error("[Lanyard] WebSocket error:", error);
        });

        socket.addEventListener("close", () => {
            console.warn("[Lanyard] Connection closed. Reconnecting...");

            clearInterval(heartbeat);
            clearTimeout(reconnectTimer);

            reconnectTimer = setTimeout(connectLanyard, 5000);
        });
    }

    connectLanyard();
})();
