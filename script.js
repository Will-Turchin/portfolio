(() => {
  "use strict";

  const canvas = document.querySelector("#particle-field");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const sceneEls = [...document.querySelectorAll(".scene")];
  const revealEls = [...document.querySelectorAll(".reveal")];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let sceneAnchors = [];
  let scrollTarget = 0;
  let scrollPosition = 0;
  let time = 0;

  const TAU = Math.PI * 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const DODGE_RADIUS = 128;
  const DODGE_STRENGTH = 34;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const seeded = (i, salt = 1) => {
    const value = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  // Each scene is a parametric 3D point cloud. Because every form is sampled with
  // the same particle index, adjacent forms can continuously melt into one another.
  const forms = {
    orb(i, n) {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = i * GOLDEN_ANGLE;
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
    },
    network(i, n) {
      const strand = i % 3;
      const t = (Math.floor(i / 3) / Math.ceil(n / 3)) * TAU * 2;
      const tube = .28 + strand * .13;
      return {
        x: Math.sin(t) * (1 + tube * Math.cos(3 * t)),
        y: Math.cos(t) * (1 + tube * Math.cos(3 * t)),
        z: tube * Math.sin(3 * t) * 2
      };
    },
    brackets(i, n) {
      const side = i % 2 ? 1 : -1;
      const t = Math.floor(i / 2) / Math.ceil(n / 2);
      const angle = t * TAU * 2.2 + side * Math.PI;
      const waist = .58 + Math.cos(t * TAU * 2) * .18;
      return {
        x: side * waist + Math.cos(angle) * .23,
        y: (t - .5) * 2.25,
        z: Math.sin(angle) * .58
      };
    },
    car(i, n) {
      const u = seeded(i, 2) * TAU;
      const v = seeded(i, 3) * TAU;
      const pulse = .72 + .22 * Math.cos(3 * u + 2 * v);
      return {
        x: Math.cos(u) * (1 + .42 * Math.cos(v)) * pulse,
        y: Math.sin(u) * (1 + .42 * Math.cos(v)) * .62,
        z: Math.sin(v) * .68 + Math.sin(u * 3) * .12
      };
    },
    stack(i, n) {
      const layer = i % 7;
      const t = Math.floor(i / 7) / Math.ceil(n / 7);
      const angle = t * TAU * 2 + layer * .42;
      const radius = .34 + layer * .1 + Math.sin(angle * 3) * .09;
      return {
        x: Math.cos(angle) * radius,
        y: (layer - 3) * .24 + Math.sin(angle * 2) * .08,
        z: Math.sin(angle) * radius
      };
    },
    terrain(i, n) {
      const side = Math.ceil(Math.sqrt(n));
      const x = ((i % side) / Math.max(1, side - 1) - .5) * 2.25;
      const z = (Math.floor(i / side) / Math.max(1, side - 1) - .5) * 1.7;
      const distance = Math.hypot(x * .82, z);
      return {
        x,
        y: Math.sin(distance * 5.2) * .24 * Math.exp(-distance * .48) + Math.sin(x * 2.4) * .12,
        z
      };
    },
    signal(i, n) {
      const ring = i % 9;
      const t = Math.floor(i / 9) / Math.ceil(n / 9);
      const angle = t * TAU;
      const radius = .22 + ring * .115;
      const tilt = (ring - 4) * .13;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * Math.cos(tilt),
        z: Math.sin(angle) * radius * Math.sin(tilt) + Math.sin(angle * 3 + ring) * .08
      };
    }
  };

  const sceneForms = sceneEls.map((scene) => forms[scene.dataset.shape] || forms.orb);
  const sceneLayout = [
    { x: .72, y: .49, scale: 1 },
    { x: .27, y: .50, scale: .86 },
    { x: .77, y: .50, scale: .9 },
    { x: .50, y: .50, scale: 1.02 },
    { x: .76, y: .50, scale: .9 },
    { x: .50, y: .48, scale: 1.02 },
    { x: .50, y: .50, scale: 1.08 }
  ];

  function buildParticles() {
    const areaScale = clamp((width * height) / 900000, .75, 1.35);
    const count = reduceMotion
      ? Math.round(650 * areaScale)
      : coarse
        ? Math.round(850 * areaScale)
        : Math.round(1650 * areaScale);

    particles = Array.from({ length: count }, (_, i) => ({
      i,
      size: .48 + seeded(i, 7) * 1.18,
      phase: seeded(i, 8) * TAU,
      drift: .35 + seeded(i, 9) * .65
    }));
  }

  function measureScenes() {
    sceneAnchors = sceneEls.map((scene) => scene.offsetTop + scene.offsetHeight * .5);
    updateScrollTarget();
  }

  function updateScrollTarget() {
    const documentFocus = scrollY + height * .5;
    let index = 0;
    while (index < sceneAnchors.length - 1 && documentFocus > sceneAnchors[index + 1]) index += 1;

    if (index >= sceneAnchors.length - 1) {
      scrollTarget = sceneAnchors.length - 1;
      return;
    }

    const start = sceneAnchors[index];
    const end = sceneAnchors[index + 1];
    scrollTarget = index + clamp((documentFocus - start) / Math.max(1, end - start), 0, 1);
  }

  function resize() {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
    measureScenes();
    scrollPosition = scrollTarget;
  }

  function rotate(point, rx, ry, rz) {
    let { x, y, z } = point;
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    const cz = Math.cos(rz);
    const sz = Math.sin(rz);

    [x, z] = [x * cy - z * sy, x * sy + z * cy];
    [y, z] = [y * cx - z * sx, y * sx + z * cx];
    return { x: x * cz - y * sz, y: x * sz + y * cz, z };
  }

  function draw() {
    if (!reduceMotion) time += .0015;
    scrollPosition += (scrollTarget - scrollPosition) * (reduceMotion ? 1 : .075);
    pointer.x += (pointer.tx - pointer.x) * .14;
    pointer.y += (pointer.ty - pointer.y) * .14;

    const fromIndex = clamp(Math.floor(scrollPosition), 0, sceneForms.length - 1);
    const toIndex = Math.min(fromIndex + 1, sceneForms.length - 1);
    const rawMix = scrollPosition - fromIndex;
    const mix = smoothstep(clamp(rawMix, 0, 1));
    const fromLayout = sceneLayout[fromIndex] || sceneLayout[0];
    const toLayout = sceneLayout[toIndex] || fromLayout;
    const centerX = lerp(fromLayout.x, toLayout.x, mix) * width;
    const centerY = lerp(fromLayout.y, toLayout.y, mix) * height;
    const responsiveScale = width < 600 ? .7 : width < 900 ? .84 : 1;
    const scale = Math.min(width, height) * .285 * lerp(fromLayout.scale, toLayout.scale, mix) * responsiveScale;
    const scrollSpin = scrollPosition * .72;
    const rx = -.18 + Math.sin(time * .55) * .13;
    const ry = time + scrollSpin;
    const rz = Math.sin(time * .32 + scrollPosition) * .16;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f1f1eb";

    particles.forEach((particle) => {
      const a = sceneForms[fromIndex](particle.i, particles.length);
      const b = sceneForms[toIndex](particle.i, particles.length);
      const warp = reduceMotion ? 0 : Math.sin(time * 3 + particle.phase + scrollPosition * 1.7) * .035 * particle.drift;
      const point = rotate({
        x: lerp(a.x, b.x, mix) * (1 + warp),
        y: lerp(a.y, b.y, mix) + warp * .7,
        z: lerp(a.z, b.z, mix) * (1 + warp)
      }, rx, ry, rz);

      const perspective = 3.15 / (3.15 - point.z);
      let x = centerX + point.x * scale * perspective;
      let y = centerY + point.y * scale * perspective;

      // Keep the scene's rotation and particle attributes independent of the
      // pointer. Only the final screen position is displaced when nearby.
      if (pointer.active && !coarse) {
        const pointerX = (pointer.x * .5 + .5) * width;
        const pointerY = (pointer.y * .5 + .5) * height;
        const dx = x - pointerX;
        const dy = y - pointerY;
        const distance = Math.hypot(dx, dy);

        if (distance < DODGE_RADIUS) {
          const falloff = smoothstep(1 - distance / DODGE_RADIUS);
          const angle = distance > .001 ? Math.atan2(dy, dx) : particle.phase;
          const displacement = DODGE_STRENGTH * falloff;
          x += Math.cos(angle) * displacement;
          y += Math.sin(angle) * displacement;
        }
      }

      if (x < -6 || x > width + 6 || y < -6 || y > height + 6) return;

      const depth = clamp((point.z + 1.35) / 2.7, 0, 1);
      const alpha = (.14 + depth * .7) * (.82 + Math.sin(time * 2 + particle.phase) * .12);
      const radius = particle.size * (.65 + depth * .9) * perspective;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 3, 2) * 70}ms`;
    revealObserver.observe(el);
  });

  addEventListener("resize", resize, { passive: true });
  addEventListener("scroll", updateScrollTarget, { passive: true });
  addEventListener("pointermove", (event) => {
    pointer.tx = (event.clientX / Math.max(1, width) - .5) * 2;
    pointer.ty = (event.clientY / Math.max(1, height) - .5) * 2;
    pointer.active = true;
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { pointer.active = false; });

  document.querySelector("#year").textContent = new Date().getFullYear();
  resize();
  draw();
})();
