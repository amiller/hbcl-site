(() => {
  "use strict";

  const POINT_COUNT = 112;
  const TAU = Math.PI * 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  function seededUnit(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function createPoints() {
    return Array.from({ length: POINT_COUNT }, (_, index) => {
      const y = 1 - (index / (POINT_COUNT - 1)) * 2;
      const ring = Math.sqrt(1 - y * y);
      const angle = index * GOLDEN_ANGLE + (seededUnit(index + 1) - 0.5) * 0.08;
      return {
        phase: seededUnit(index + 91) * TAU,
        size: 0.75 + seededUnit(index + 211) * 1.1,
        x: Math.cos(angle) * ring,
        y,
        z: Math.sin(angle) * ring,
      };
    });
  }

  function mount(canvas) {
    if (!canvas || typeof canvas.getContext !== "function") return () => {};

    const context = canvas.getContext("2d");
    if (!context) return () => {};

    const points = createPoints();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const pointer = { active: false, x: 0, y: 0 };
    let animationFrame = 0;
    let destroyed = false;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let observer = null;

    function cancelLoop() {
      if (animationFrame && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = 0;
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width || canvas.clientWidth || 320);
      height = Math.max(1, bounds.height || canvas.clientHeight || width);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw(time) {
      const breath = 1 + Math.sin(time * 0.0007) * 0.045;
      const rotation = time * 0.00013;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.34 * breath;

      context.clearRect(0, 0, width, height);
      for (const point of points) {
        const rotatedX = point.x * cosine - point.z * sine;
        const depth = point.x * sine + point.z * cosine;
        const pointerWeight = pointer.active
          ? Math.max(0, 1 - Math.hypot(rotatedX - pointer.x, point.y - pointer.y) / 1.7)
          : 0;
        const scale = 0.72 + (depth + 1) * 0.2;
        const x = centerX + rotatedX * radius * scale + pointer.x * pointerWeight * 15;
        const y = centerY + point.y * radius * scale + pointer.y * pointerWeight * 15;
        const opacity = 0.28 + (depth + 1) * 0.2 + pointerWeight * 0.12;

        context.beginPath();
        context.arc(x, y, point.size * scale + pointerWeight * 0.7, 0, TAU);
        context.fillStyle = `rgba(16, 16, 14, ${Math.min(opacity, 0.72)})`;
        context.fill();
      }
    }

    function detach() {
      if (destroyed) return;
      destroyed = true;
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener?.("resize", onResize);
      document.removeEventListener?.("visibilitychange", onVisibilityChange);
      reducedMotion?.removeEventListener?.("change", onMotionChange);
      observer?.disconnect();
      observer = null;
      cancelLoop();
    }

    function loop(time) {
      animationFrame = 0;
      if (destroyed || canvas.isConnected === false) {
        detach();
        return;
      }
      if (document.hidden || reducedMotion?.matches) return;
      draw(time);
      animationFrame = requestAnimationFrame(loop);
    }

    function start() {
      if (destroyed || document.hidden || reducedMotion?.matches || animationFrame) return;
      animationFrame = requestAnimationFrame(loop);
    }

    function onResize() {
      resize();
      draw(0);
    }

    function onPointerMove(event) {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / width - 0.5) * 2));
      pointer.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / height - 0.5) * 2));
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function onVisibilityChange() {
      if (document.hidden) cancelLoop();
      else start();
    }

    function onMotionChange() {
      cancelLoop();
      draw(0);
      start();
    }

    resize();
    draw(0);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener?.("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion?.addEventListener?.("change", onMotionChange);
    if (typeof MutationObserver === "function" && document.documentElement) {
      observer = new MutationObserver(() => {
        if (canvas.isConnected === false) detach();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    start();

    return detach;
  }

  window.IOPresence = Object.freeze({ mount });
  document.querySelectorAll("[data-io-presence]").forEach(mount);
})();
