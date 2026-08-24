(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  root.classList.add("js");

  function setupMenu() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-menu]");
    if (!button || !menu) return;

    const setMenu = (isOpen, returnFocus) => {
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menu.classList.toggle("is-open", isOpen);
      if (returnFocus) button.focus();
    };

    setMenu(false);

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false, true));
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;
    const revealAll = () => {
      root.classList.remove("reveal-pending");
      elements.forEach((element) => element.classList.add("is-visible"));
    };
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      root.classList.add("reveal-pending");
      elements.forEach((element) => observer.observe(element));
    } catch {
      revealAll();
    }
  }

  function setupLocalTime() {
    const hour = new Date().getHours();
    const daypart = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    document.querySelectorAll("[data-local-time]").forEach((element) => {
      const fallback = element.dataset.localTimeFallback || element.textContent.trim();
      element.dataset.localTimeFallback = fallback;
      element.textContent = `${fallback} It is ${daypart} where you are.`;
    });
  }

  window.IOSite = Object.freeze({ reduceMotion, setupMenu, setupReveal, setupLocalTime });

  const initialize = () => {
    setupMenu();
    setupReveal();
    setupLocalTime();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
}());
