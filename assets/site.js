(function () {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = motionPreference.matches;
  const root = document.documentElement;
  const agentStateControllers = new WeakMap();
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

  function setupAgentStates() {
    document.querySelectorAll("[data-agent-state-list]").forEach((list) => {
      if (agentStateControllers.has(list)) return;
      const states = Array.from(list.querySelectorAll("[data-agent-state]"));
      if (!states.length) return;

      const control = list.id
        ? document.querySelector(`[data-agent-motion-toggle][aria-controls="${list.id}"]`)
        : null;
      let activeIndex = 0;
      let intervalId = null;
      let manuallyPaused = false;
      let destroyed = false;

      const showState = (index) => {
        activeIndex = index % states.length;
        list.dataset.agentStateIndex = String(activeIndex);
        states.forEach((state, stateIndex) => {
          const isActive = stateIndex === activeIndex;
          state.classList.toggle("is-active", isActive);
          state.setAttribute("aria-current", String(isActive));
        });
      };

      const stop = () => {
        if (intervalId === null) return;
        clearInterval(intervalId);
        intervalId = null;
      };

      const updateControl = () => {
        if (!control) return;
        const systemReduced = motionPreference.matches;
        const paused = systemReduced || manuallyPaused;
        control.disabled = systemReduced;
        control.setAttribute("aria-pressed", String(paused));
        control.textContent = systemReduced ? "Motion reduced" : manuallyPaused ? "Resume Agent" : "Pause Agent";
      };

      const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        stop();
        motionPreference.removeEventListener?.("change", syncMotion);
        control?.removeEventListener?.("click", togglePaused);
        agentStateControllers.delete(list);
      };

      const start = () => {
        stop();
        if (motionPreference.matches || manuallyPaused || states.length < 2 || !list.isConnected) return;
        intervalId = setInterval(() => {
          if (!list.isConnected) {
            destroy();
            return;
          }
          showState(activeIndex + 1);
        }, 2800);
      };

      function syncMotion() {
        if (motionPreference.matches) {
          stop();
          showState(0);
        } else {
          start();
        }
        updateControl();
      }

      function togglePaused() {
        if (motionPreference.matches) return;
        manuallyPaused = !manuallyPaused;
        syncMotion();
      }

      agentStateControllers.set(list, { destroy });
      control?.addEventListener("click", togglePaused);
      if (typeof motionPreference.addEventListener === "function") motionPreference.addEventListener("change", syncMotion);
      else motionPreference.addListener?.(syncMotion);
      showState(activeIndex);
      syncMotion();
    });
  }

  window.IOSite = Object.freeze({ reduceMotion, setupMenu, setupReveal, setupLocalTime, setupAgentStates });

  const initialize = () => {
    setupMenu();
    setupReveal();
    setupLocalTime();
    setupAgentStates();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
}());
