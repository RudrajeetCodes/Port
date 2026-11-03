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
    ".tech-section, .experience-section"
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