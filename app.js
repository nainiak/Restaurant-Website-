/**
 * Solstice & Sage Restaurant - Main Application Orchestrator
 * Theme switcher, responsive navigation, scroll spy, live opening status, and toast notifications.
 */

(function () {
  const THEME_STORAGE_KEY = "solstice_theme_preference";

  function initApp() {
    setupTheme();
    setupNavigation();
    setupScrollSpy();
    updateLiveOpeningStatus();
    setupNewsletter();
    setupModalBackdropCloses();
  }

  /* ---------------- Theme Management ---------------- */
  function setupTheme() {
    const themeBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";

    applyTheme(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const icon = document.getElementById("themeIcon");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  /* ---------------- Navigation & Mobile Drawer ---------------- */
  function setupNavigation() {
    const navbar = document.getElementById("mainNavbar");
    const mobileToggle = document.getElementById("mobileToggleBtn");
    const navLinks = document.getElementById("navLinks");

    // Scroll effect for navbar
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    // Mobile hamburger toggle
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");
        if (isOpen) {
          navLinks.classList.remove("open");
          mobileToggle.textContent = "☰";
        } else {
          navLinks.classList.add("open");
          mobileToggle.textContent = "✕";
        }
      });

      // Close menu on link click
      navLinks.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("open");
          mobileToggle.textContent = "☰";
        });
      });
    }
  }

  /* ---------------- Active Section Scroll Spy ---------------- */
  function setupScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
      let currentSectionId = "";
      const scrollPos = window.scrollY + 120;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = sec.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSectionId}`) {
          link.classList.add("active");
        }
      });
    });
  }

  /* ---------------- Live Restaurant Opening Status ---------------- */
  function updateLiveOpeningStatus() {
    const statusContainer = document.getElementById("liveOpenStatus");
    if (!statusContainer) return;

    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTimeVal = hour + minute / 60;

    // Monday closed
    let isOpen = false;
    let nextOpenText = "";

    if (day === 1) {
      isOpen = false;
      nextOpenText = "Closed on Mondays • Opens Tuesday 5:00 PM";
    } else {
      // Tue - Sun: 5:00 PM (17.0) to 11:00 PM (23.0)
      // Fri - Sun has lunch: 12:00 PM (12.0) to 3:00 PM (15.0)
      const hasLunch = day === 0 || day === 5 || day === 6;
      const isLunchOpen = hasLunch && currentTimeVal >= 12 && currentTimeVal < 15;
      const isDinnerOpen = currentTimeVal >= 17 && currentTimeVal < 23;

      if (isLunchOpen || isDinnerOpen) {
        isOpen = true;
      } else {
        isOpen = false;
        if (currentTimeVal < 17) {
          nextOpenText = "Opens today at 5:00 PM (Dinner Service)";
        } else {
          nextOpenText = "Kitchen closed for the night • Opens tomorrow";
        }
      }
    }

    if (isOpen) {
      statusContainer.className = "status-pill open";
      statusContainer.innerHTML = `
        <span class="status-indicator-dot"></span>
        <span>Open Now • Welcoming Diners</span>
      `;
    } else {
      statusContainer.className = "status-pill closed";
      statusContainer.innerHTML = `
        <span class="status-indicator-dot"></span>
        <span>${nextOpenText}</span>
      `;
    }

    // Highlight current day in hours list
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = dayNames[day];
    document.querySelectorAll(".hours-row").forEach(row => {
      const dayLabel = row.querySelector(".hours-day");
      if (dayLabel && dayLabel.textContent.includes(currentDayName)) {
        row.classList.add("current-day");
      }
    });
  }

  /* ---------------- Global Toast Notifications ---------------- */
  function showToast(message, duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span class="toast-icon">✦</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastSlideOut 0.3s forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  /* ---------------- Newsletter Subscription ---------------- */
  function setupNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      if (input && input.value) {
        showToast("🍾 Thank you! You are now subscribed to our Private Cellar Newsletter.");
        input.value = "";
      }
    });
  }

  /* ---------------- Modal Backdrop Closes ---------------- */
  function setupModalBackdropCloses() {
    document.querySelectorAll(".modal-backdrop").forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".modal-close-btn")) {
          modal.classList.remove("open");
        }
      });
    });
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", initApp);

  window.SolsticeApp = {
    showToast
  };
})();
