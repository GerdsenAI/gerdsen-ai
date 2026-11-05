const REDUCED_MOTION_QUERY = window.matchMedia("(prefers-reduced-motion: reduce)");
const MOBILE_NAV_QUERY = window.matchMedia("(max-width: 920px)");

function bindMediaQueryChange(query, callback) {
    if (typeof query.addEventListener === "function") {
        query.addEventListener("change", callback);
        return;
    }

    if (typeof query.addListener === "function") {
        query.addListener(callback);
    }
}

function setCurrentYear() {
    const yearNode = document.querySelector("[data-year]");
    if (yearNode) {
        yearNode.textContent = String(new Date().getFullYear());
    }
}

function initHeader() {
    const header = document.querySelector(".site-header");
    const navShell = header?.querySelector(".nav-shell");
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("site-menu");

    if (!header || !navShell || !toggle || !menu) {
        return;
    }

    const setMenuState = (isOpen) => {
        menu.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("nav-open", isOpen && MOBILE_NAV_QUERY.matches);
    };

    const closeMenu = () => setMenuState(false);

    const handleScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 16);
    };

    toggle.addEventListener("click", () => {
        setMenuState(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (MOBILE_NAV_QUERY.matches) {
                closeMenu();
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!MOBILE_NAV_QUERY.matches || !menu.classList.contains("is-open")) {
            return;
        }

        if (navShell.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    bindMediaQueryChange(MOBILE_NAV_QUERY, () => {
        if (!MOBILE_NAV_QUERY.matches) {
            closeMenu();
        }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    closeMenu();
}

function initSmoothScroll() {
    const header = document.querySelector(".site-header");
    if (!header) {
        return;
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();

            const offset = header.offsetHeight + 14;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top,
                behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth"
            });

            if (history.replaceState) {
                history.replaceState(null, "", targetId);
            }
        });
    });
}

function initRevealAnimations() {
    const revealNodes = document.querySelectorAll(".reveal");
    if (!revealNodes.length) {
        return;
    }

    if (REDUCED_MOTION_QUERY.matches || !("IntersectionObserver" in window)) {
        revealNodes.forEach((node) => node.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px"
    });

    revealNodes.forEach((node) => observer.observe(node));
}

function initServiceDetails() {
    document.querySelectorAll(".service-card").forEach((card) => {
        const trigger = card.querySelector(".service-trigger");
        if (!trigger) {
            return;
        }

        trigger.addEventListener("click", () => {
            const isOpen = card.classList.toggle("is-open");
            trigger.setAttribute("aria-expanded", String(isOpen));
        });
    });
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const submitButton = document.getElementById("submit-btn");
    const statusNode = document.getElementById("form-status");

    if (!form || !submitButton || !statusNode) {
        return;
    }

    const defaultButtonText = submitButton.textContent;
    let hideStatusTimer = null;

    const showStatus = (message, state) => {
        statusNode.textContent = message;
        statusNode.className = `form-status ${state} is-visible`;

        if (hideStatusTimer) {
            window.clearTimeout(hideStatusTimer);
        }

        hideStatusTimer = window.setTimeout(() => {
            statusNode.classList.remove("is-visible");
        }, 10000);
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            company: formData.get("company") || "Not specified",
            project: formData.get("project") || "Not specified",
            message: formData.get("message"),
            website: formData.get("website") || ""
        };

        // Honeypot: bots that fill the hidden field are rejected silently
        if (payload.website) {
            form.reset();
            showStatus("Message sent successfully. We will get back to you within 24 hours.", "is-success");
            return;
        }

        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = "Sending Message...";

        try {
            const response = await fetch(form.action || "https://formspree.io/f/xeozyrwa", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Form submission failed");
            }

            form.reset();
            showStatus("Message sent successfully. We will get back to you within 24 hours.", "is-success");
        } catch (error) {
            showStatus(
                "Sorry, there was an error sending your message. Please try again or email info@gerdsen.ai.",
                "is-error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.textContent = defaultButtonText;
        }
    });
}

function initParticles() {
    const canvas = document.getElementById("particle-field");
    if (!canvas || REDUCED_MOTION_QUERY.matches) {
        return;
    }

    const context = canvas.getContext("2d");
    const particles = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const targetCount = Math.max(34, Math.min(88, Math.floor(width / 22)));
        particles.length = 0;

        for (let index = 0; index < targetCount; index += 1) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.8 + 0.6,
                alpha: Math.random() * 0.55 + 0.2,
                drift: Math.random() * 0.22 + 0.08,
                hue: Math.random() > 0.82 ? 198 : 37
            });
        }
    };

    const draw = () => {
        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            particle.y -= particle.drift;
            particle.x += Math.sin((particle.y + particle.radius) * 0.012) * 0.12;

            if (particle.y < -8) {
                particle.y = height + 8;
                particle.x = Math.random() * width;
            }

            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = particle.hue === 37
                ? `rgba(255, 157, 0, ${particle.alpha})`
                : `rgba(103, 190, 255, ${particle.alpha * 0.5})`;
            context.fill();
        });

        animationFrame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            window.cancelAnimationFrame(animationFrame);
            return;
        }

        draw();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    initHeader();
    initSmoothScroll();
    initRevealAnimations();
    initServiceDetails();
    initContactForm();
    initParticles();
});
