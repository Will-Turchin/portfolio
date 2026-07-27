(() => {
  "use strict";

  const canvas = document.querySelector("#particle-field");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const sceneEls = [...document.querySelectorAll(".scene")];
  const revealEls = [...document.querySelectorAll(".reveal")];
  const finalTitle = document.querySelector("#contact h2");
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  const projectPanel = document.querySelector("#project-panel");
  const projectTriggers = [...document.querySelectorAll(".project-card-trigger")];
  const projectCloseButton = projectPanel.querySelector("[data-project-close]");
  const projectContent = {
    number: projectPanel.querySelector("[data-project-number]"),
    type: projectPanel.querySelector("[data-project-type]"),
    title: projectPanel.querySelector("[data-project-title]"),
    lead: projectPanel.querySelector("[data-project-lead]"),
    system: projectPanel.querySelector("[data-project-system]"),
    points: projectPanel.querySelector("[data-project-points]"),
    tags: projectPanel.querySelector("[data-project-tags]")
  };
  const pageSurfaces = [
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector("footer")
  ];

  // Detail copy is grounded in Resume/context. CapSure currently has no context
  // module, so its expanded copy deliberately stays within the facts on its card.
  const projectDetails = {
    "formula-sae-telemetry": {
      number: "01",
      type: "Telemetry / Infrastructure",
      title: "Formula SAE Telemetry & Observability Platform",
      lead: "A complete vehicle-data path built to turn track activity into information the team can use in real time.",
      system: "The platform processes CAN, GPS, acceleration, wheel-speed, and temperature data from more than 10 sensors at up to 20 Hz. Standardized time-series schemas carry that data into Dockerized InfluxDB storage and live Grafana dashboards, backed by server health monitoring and resilient backups.",
      points: [
        "Processes more than 10 vehicle sensor streams at up to 20 Hz.",
        "Standardizes ingestion across electronic control units and differing sensor frequencies.",
        "Runs on a Dell PowerEdge server with Docker Compose, backups, and health monitoring.",
        "Led telemetry development and mentored four teammates on architecture, Git, and deployments."
      ],
      tags: ["C++", "CAN bus", "InfluxDB", "Grafana", "Docker", "Linux"]
    },
    "vehicle-state-estimation": {
      number: "02",
      type: "Sensor Fusion / Analysis",
      title: "Vehicle State Estimation",
      lead: "State-estimation and visualization tools that make noisy race-car sensor data easier to validate, replay, and diagnose.",
      system: "Python tooling combines GNSS and inertial measurements into estimates of the car's position, velocity, and orientation. Recorded CAN, GPS, acceleration, wheel-speed, and temperature data can be replayed through the same analysis flow, with Rerun visualization exposing vehicle behavior and system bottlenecks.",
      points: [
        "Works with data from more than 10 vehicle sensors sampled at up to 20 Hz.",
        "Uses Kalman and extended Kalman filtering for position, velocity, and orientation estimates.",
        "Replays recorded sessions to validate estimates against repeatable inputs.",
        "Visualizes vehicle behavior in Rerun to help diagnose performance bottlenecks."
      ],
      tags: ["Python", "EKF", "GNSS", "CAN bus", "Rerun", "Data replay"]
    },
    "capsure-pill-dispenser": {
      number: "03",
      type: "Embedded / Computer Vision",
      title: "CapSure Pill Dispenser",
      lead: "An award-winning embedded system that brings sensing, physical control, and a clear user interface into one medication workflow.",
      system: "A Raspberry Pi coordinates computer vision, servo-driven dispensing, a touchscreen interface, alerts, and cloud synchronization. The project treats the hardware and application as one connected system so identification, physical movement, feedback, and remote state stay aligned.",
      points: [
        "Integrates computer vision and servo control on a Raspberry Pi.",
        "Provides an on-device touchscreen workflow for direct interaction.",
        "Connects alerts and cloud synchronization to the physical dispenser.",
        "Recognized as an award-winning project."
      ],
      tags: ["Raspberry Pi", "OpenCV", "Python", "Servo control", "Touchscreen", "Hardware"]
    },
    "self-hosted-platform": {
      number: "04",
      type: "Homelab / DevOps",
      title: "Self-Hosted Platform",
      lead: "A self-hosted platform for deploying, observing, and protecting the services I build and use.",
      system: "A Dell PowerEdge R640 runs Ubuntu and a multi-service Docker Compose environment. A self-hosted GitHub Actions runner automatically deploys services after repository updates, while Grafana observability, health checks, and local and remote Borg backups keep the platform visible and recoverable.",
      points: [
        "Operates multiple services on Ubuntu with Docker Compose.",
        "Automatically deploys repository updates through a self-hosted GitHub Actions runner.",
        "Uses Grafana and health monitoring for infrastructure observability.",
        "Protects service data with both local and remote Borg backups."
      ],
      tags: ["Linux", "Docker Compose", "GitHub Actions", "Borg", "Grafana", "Dell PowerEdge"]
    },
    "repo-context-agent": {
      number: "05",
      type: "AI Agents / Developer Tooling",
      title: "Repo Context Agent",
      lead: "An agentic system that makes large codebases easier for language models and coding agents to understand.",
      system: "The agent converts repositories into structured, LLM-readable context artifacts. A Bedrock AgentCore backend and GitHub webhook keep that context connected to changes across 1,700 company repositories, creating a continuously updated layer for downstream coding-agent workflows.",
      points: [
        "Converts codebases into structured context artifacts designed for LLM consumption.",
        "Improved coding-agent performance by 2% on internal benchmarks.",
        "Uses a Bedrock AgentCore backend and GitHub webhook integration.",
        "Tracks changes across 1,700 company repositories."
      ],
      tags: ["Python", "LLM APIs", "AWS Bedrock", "AgentCore", "GitHub webhooks"]
    },
    "ravenscope-digital-microscope": {
      number: "06",
      type: "Computer Vision / Imaging",
      title: "RavenScope™ Digital Microscope",
      lead: "Camera and computer-vision systems for a patented precision tissue-enrichment microscope.",
      system: "A 64 MP Raspberry Pi and Arducam imaging system automates focus, cropping, and sample-region detection. Java-based ImageJ and Python workflows then process the captured slides, turning a precise physical imaging task into a repeatable analysis pipeline.",
      points: [
        "Designed camera and computer-vision systems for the patented RavenScope™ microscope.",
        "Built a 64 MP Raspberry Pi imaging system with automated focusing and cropping.",
        "Automatically detects sample regions before downstream analysis.",
        "Analyzes slides at 20 μm resolution in under five minutes."
      ],
      tags: ["Java", "Python", "Raspberry Pi", "Arducam", "ImageJ", "Computer vision"]
    },
    "botta-daily-spin": {
      number: "07",
      type: "React / Product Prototype",
      title: "Botta Daily Spin",
      lead: "A polished daily-engagement prototype that won People's Choice at an Ibotta company hackathon.",
      system: "The React prize wheel combines weighted results with carefully tuned easing, staged prize reveals, and distinct rare-reward effects. The interaction was built by an intern team competing alongside full-time employees and designed to make each spin feel responsive and rewarding.",
      points: [
        "Won People's Choice among 29 hackathon projects.",
        "Built as an intern team competing against full-time employees.",
        "Uses weighted results to control prize outcomes.",
        "Adds easing, reveals, and rare-reward effects to the React interaction."
      ],
      tags: ["React", "TypeScript", "CSS", "Interaction design", "Animation"]
    },
    "ai-classical-music-generator": {
      number: "08",
      type: "Machine Learning / Music",
      title: "AI Classical Music Generator",
      lead: "A PyTorch sequence model trained to generate original classical-style melodies and polyphonic passages.",
      system: "A custom data pipeline converts 35 MIDI files into 1,000 tokenized training sequences. The sequence model learns from that representation and, after 50 training epochs, generates polyphonic outputs containing recognizable musical motifs.",
      points: [
        "Trained a PyTorch-based sequence model on classical music.",
        "Converted 35 MIDI files into 1,000 tokenized input sequences.",
        "Generated polyphonic sequences with recognizable motifs after 50 epochs."
      ],
      tags: ["Python", "PyTorch", "MIDI", "Sequence modeling", "Data pipelines"]
    },
    "driver-screen": {
      number: "09",
      type: "CAN Bus / Embedded",
      title: "Driver Screen",
      lead: "A low-latency vehicle display that turns raw CAN messages into readable telemetry and immediate safety information.",
      system: "The embedded board receives messages from the vehicle CAN bus, converts them into known sensor values, and presents the results to the driver. Engine-failure warnings share the same display path so critical conditions reach the cockpit without a separate monitoring workflow.",
      points: [
        "Converts CAN bus messages into readable, known sensor values.",
        "Displays vehicle sensor information with less than 20 ms latency.",
        "Routes every vehicle engine-failure warning to the driver display."
      ],
      tags: ["CAN bus", "Embedded systems", "Telemetry", "Driver safety"]
    }
  };
  const vehicleCarPoints = [
    ...samplePolyline([[7,62],[9,52],[16,47],[26,44],[34,32],[41,27],[61,27],[70,35],[78,44],[89,47],[95,55],[94,64],[87,66],[84,60],[81,56],[75,55],[70,60],[68,66],[33,66],[30,60],[26,56],[20,55],[15,60],[13,66]], 54, true),
    ...samplePolyline([[27,44],[37,34],[43,30],[60,30],[69,38],[75,44]], 18),
    ...samplePolyline([[17,49],[84,49]], 20),
    ...sampleEllipse(23, 66, 8.5, 10, 24),
    ...sampleEllipse(77, 66, 8.5, 10, 24)
  ];

  function samplePolyline(path, count, closed = false) {
    const segmentCount = closed ? path.length : path.length - 1;
    return Array.from({ length: count }, (_, index) => {
      const progress = (index / (closed ? count : Math.max(1, count - 1))) * segmentCount;
      const segment = Math.min(Math.floor(progress), segmentCount - 1);
      const mix = progress - segment;
      const from = path[segment];
      const to = path[(segment + 1) % path.length];
      return [from[0] + (to[0] - from[0]) * mix, from[1] + (to[1] - from[1]) * mix];
    });
  }

  function sampleEllipse(centerX, centerY, radiusX, radiusY, count) {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      return [centerX + Math.cos(angle) * radiusX, centerY + Math.sin(angle) * radiusY];
    });
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let sceneAnchors = [];
  let scrollTarget = 0;
  let scrollPosition = 0;
  let scrollVelocity = 0;
  let lastScrollUpdate = performance.now();
  let lastFrame = performance.now();
  let time = 0;
  let activeProjectSlug = null;
  let lockedScrollPosition = 0;
  let returnFocusElement = null;
  let closeTimer = null;
  let savedBodyStyles = null;

  const TAU = Math.PI * 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const MARGIN_STACK_LAYERS = 7;
  const TOP_SPLIT_LAYERS = 4;
  const ORIGIN = { x: 0, y: 0, z: 0 };
  const DODGE_RADIUS = 76;
  const DODGE_STRENGTH = 10;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const seeded = (i, salt = 1) => {
    const value = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function setPageInert(inert) {
    pageSurfaces.forEach((surface) => {
      if (surface) surface.inert = inert;
    });
  }

  function lockPage(scrollPosition) {
    lockedScrollPosition = scrollPosition;
    savedBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockPage() {
    if (!savedBodyStyles) return;
    Object.assign(document.body.style, savedBodyStyles);
    savedBodyStyles = null;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, lockedScrollPosition);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      updateScrollTarget();
    });
  }

  function addListItems(list, items, className = "") {
    list.replaceChildren(...items.map((item) => {
      const element = document.createElement("li");
      element.textContent = item;
      if (className) element.className = className;
      return element;
    }));
  }

  function populateProject(project) {
    projectContent.number.textContent = project.number;
    projectContent.type.textContent = project.type;
    projectContent.title.textContent = project.title;
    projectContent.lead.textContent = project.lead;
    projectContent.system.textContent = project.system;
    addListItems(projectContent.points, project.points);
    addListItems(projectContent.tags, project.tags);
  }

  function projectUrl(slug) {
    return `${location.pathname}${location.search}#project/${encodeURIComponent(slug)}`;
  }

  function openProject(slug, { pushHistory = true, scrollPosition = scrollY, trigger = null } = {}) {
    const project = projectDetails[slug];
    if (!project || activeProjectSlug) return;
    activeProjectSlug = slug;
    returnFocusElement = trigger || document.querySelector(`[data-project="${slug}"] .project-card-trigger`);

    if (pushHistory) {
      history.replaceState({ ...history.state, portfolioScroll: scrollPosition }, "", location.href);
      history.pushState({ portfolioProject: slug, portfolioScroll: scrollPosition, openedFromCard: true }, "", projectUrl(slug));
    }

    populateProject(project);
    lockPage(scrollPosition);
    setPageInert(true);
    projectPanel.setAttribute("aria-hidden", "false");
    void projectPanel.offsetWidth;
    projectPanel.classList.add("is-open");
    projectCloseButton.focus({ preventScroll: true });
  }

  function closeProject() {
    if (!activeProjectSlug) return;
    clearTimeout(closeTimer);
    projectPanel.classList.remove("is-open");
    projectPanel.setAttribute("aria-hidden", "true");

    const finishClose = () => {
      setPageInert(false);
      unlockPage();
      activeProjectSlug = null;
      returnFocusElement?.focus({ preventScroll: true });
      returnFocusElement = null;
    };

    if (reduceMotion) {
      finishClose();
    } else {
      const handleTransitionEnd = (event) => {
        if (event.target !== projectPanel || event.propertyName !== "transform") return;
        projectPanel.removeEventListener("transitionend", handleTransitionEnd);
        clearTimeout(closeTimer);
        finishClose();
      };
      projectPanel.addEventListener("transitionend", handleTransitionEnd);
      closeTimer = setTimeout(() => {
        projectPanel.removeEventListener("transitionend", handleTransitionEnd);
        finishClose();
      }, 900);
    }
  }

  function requestProjectClose() {
    if (!activeProjectSlug) return;
    if (history.state?.openedFromCard && history.state?.portfolioProject === activeProjectSlug) {
      history.back();
      return;
    }
    history.replaceState({ portfolioScroll: lockedScrollPosition }, "", `${location.pathname}${location.search}`);
    closeProject();
  }

  function projectFromHash() {
    const prefix = "#project/";
    if (!location.hash.startsWith(prefix)) return null;
    return decodeURIComponent(location.hash.slice(prefix.length));
  }

  function trapProjectFocus(event) {
    if (event.key !== "Tab") return;
    const focusable = [...projectPanel.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.hidden && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function buildVehicleScatter() {
    const cloud = document.querySelector(".scatter-cloud");
    if (!cloud) return;
    const points = vehicleCarPoints.map(([carX, carY], index) => {
      const point = document.createElement("i");
      point.className = "scatter-point";
      point.style.setProperty("--scatter-x", (8 + seeded(index, 41) * 84).toFixed(2));
      point.style.setProperty("--scatter-y", (8 + seeded(index, 42) * 84).toFixed(2));
      point.style.setProperty("--car-x", carX);
      point.style.setProperty("--car-y", carY);
      point.style.setProperty("--point-size", `${(1.8 + seeded(index, 43) * 2.8).toFixed(2)}px`);
      point.style.setProperty("--point-opacity", (.2 + seeded(index, 44) * .58).toFixed(2));
      point.style.setProperty("--settle-duration", `${(1.1 + seeded(index, 45) * .5).toFixed(2)}s`);
      point.style.transitionDelay = `${Math.round(seeded(index, 46) * 120)}ms`;
      return point;
    });
    cloud.replaceChildren(...points);
  }

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
    // A tall but deliberately thin data ribbon for the Experience section's
    // right-hand gutter. Its shallow depth keeps rotation from widening it.
    marginRibbon(i, n) {
      const strand = i % 5;
      const t = Math.floor(i / 5) / Math.max(1, Math.ceil(n / 5) - 1);
      const wave = t * TAU * 1.7;
      return {
        x: Math.sin(wave) * .11 + (strand - 2) * .028,
        y: (t - .5) * 4.1,
        z: Math.cos(wave) * .065
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
    // A compact version of the vehicle form for the Projects section's left
    // margin, keeping the project cards and heading clear.
    marginCar(i, n) {
      const point = forms.car(i, n);
      return {
        x: point.x * .62,
        y: point.y * .72,
        z: point.z * .62
      };
    },
    // A compact stack of orbital traces for the Capabilities section's left
    // gutter, clear of both the heading and the skills grid.
    marginStack(i, n) {
      const layer = i % MARGIN_STACK_LAYERS;
      const t = Math.floor(i / MARGIN_STACK_LAYERS) / Math.max(1, Math.ceil(n / MARGIN_STACK_LAYERS) - 1);
      const angle = t * TAU * 2.4 + layer * .58;
      const radius = .035 + layer * .018;
      return {
        x: Math.cos(angle) * radius,
        y: (layer - 3) * .33 + Math.sin(angle * 2) * .045,
        z: Math.sin(angle) * radius
      };
    },
    terrain(i, n) {
      // Keep each incoming margin-stack strand together, sending it to one
      // terrain form only. This makes the education transition a true split.
      const sourceLayer = i % MARGIN_STACK_LAYERS;
      const isTopRight = sourceLayer < TOP_SPLIT_LAYERS;
      const groupLayers = isTopRight ? TOP_SPLIT_LAYERS : MARGIN_STACK_LAYERS - TOP_SPLIT_LAYERS;
      const groupIndex = Math.floor(i / MARGIN_STACK_LAYERS) * groupLayers + (isTopRight ? sourceLayer : sourceLayer - TOP_SPLIT_LAYERS);
      const groupSize = Math.ceil(n / MARGIN_STACK_LAYERS) * groupLayers;
      const side = Math.ceil(Math.sqrt(groupSize));
      const x = ((groupIndex % side) / Math.max(1, side - 1) - .5) * 2.25;
      const z = (Math.floor(groupIndex / side) / Math.max(1, side - 1) - .5) * 1.7;
      const distance = Math.hypot(x * .82, z);
      const pivotX = isTopRight ? 1.85 : -1.85;
      const pivotY = isTopRight ? -.92 : 1.28;
      return {
        x: x * .44 + pivotX,
        y: (Math.sin(distance * 5.2) * .24 * Math.exp(-distance * .48) + Math.sin(x * 2.4) * .12) * .44 + pivotY,
        z: z * .44,
        rotationCenter: { x: pivotX, y: pivotY, z: 0 }
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
    { x: .98, y: .50, scale: .44 },
    { x: .04, y: .40, scale: .68 },
    { x: .01, y: .56, scale: .44 },
    { x: .50, y: .48, scale: 1.02 },
    // Fallback placement when the CTA title cannot be measured.
    { x: .50, y: .35, scale: 1.08 }
  ];
  const finalSceneIndex = sceneForms.length - 1;

  function finalTitleCenterY() {
    const fallback = (sceneLayout[finalSceneIndex] || sceneLayout[0]).y * height;
    if (!finalTitle) return fallback;
    const titleRect = finalTitle.getBoundingClientRect();
    return titleRect.top + titleRect.height * .5 + Math.min(42, height * .05);
  }

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
    sceneAnchors = sceneEls.map((scene, index) => {
      // The final form belongs to the closing headline, not the whole contact
      // section. Its form remains final after this point, while its position
      // follows the headline as both scroll out of view.
      if (index === finalSceneIndex && finalTitle) {
        const titleRect = finalTitle.getBoundingClientRect();
        return scrollY + titleRect.top + titleRect.height * .5;
      }
      return scene.offsetTop + scene.offsetHeight * .5;
    });
    updateScrollTarget();
  }

  // Keep the point cloud visually behind the reader during decisive scrolls.
  // The target still represents the current section, while the rendered
  // position deliberately takes longer to catch up as input velocity rises.
  function updateScrollTarget(trackVelocity = false) {
    const documentFocus = scrollY + height * .5;
    let index = 0;
    while (index < sceneAnchors.length - 1 && documentFocus > sceneAnchors[index + 1]) index += 1;

    let nextTarget;
    if (index >= sceneAnchors.length - 1) {
      nextTarget = sceneAnchors.length - 1;
    } else {
      const start = sceneAnchors[index];
      const end = sceneAnchors[index + 1];
      nextTarget = index + clamp((documentFocus - start) / Math.max(1, end - start), 0, 1);
    }

    if (trackVelocity && !reduceMotion) {
      const now = performance.now();
      const elapsed = clamp(now - lastScrollUpdate, 16, 120);
      const velocity = Math.abs(nextTarget - scrollTarget) / (elapsed / 1000);
      scrollVelocity = Math.max(scrollVelocity * .55, velocity);
      lastScrollUpdate = now;
    }

    scrollTarget = nextTarget;
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

  function draw(frameTime) {
    const frameScale = clamp((frameTime - lastFrame) / (1000 / 60), .25, 3);
    lastFrame = frameTime;
    if (!reduceMotion) time += .0015;
    scrollVelocity *= Math.pow(.9, frameScale);
    const scrollSpeed = clamp(scrollVelocity / 3.5, 0, 1);
    const followRate = reduceMotion ? 1 : lerp(.12, .032, scrollSpeed);
    const followAmount = 1 - Math.pow(1 - followRate, frameScale);
    scrollPosition += (scrollTarget - scrollPosition) * followAmount;
    scrollPosition = clamp(scrollPosition, 0, Math.max(0, sceneForms.length - 1));
    pointer.x += (pointer.tx - pointer.x) * .08;
    pointer.y += (pointer.ty - pointer.y) * .08;

    const fromIndex = clamp(Math.floor(scrollPosition), 0, sceneForms.length - 1);
    const toIndex = Math.min(fromIndex + 1, sceneForms.length - 1);
    const rawMix = scrollPosition - fromIndex;
    const mix = smoothstep(clamp(rawMix, 0, 1));
    const fromLayout = sceneLayout[fromIndex] || sceneLayout[0];
    const toLayout = sceneLayout[toIndex] || fromLayout;
    const centerX = lerp(fromLayout.x, toLayout.x, mix) * width;
    const fromCenterY = fromIndex === finalSceneIndex ? finalTitleCenterY() : fromLayout.y * height;
    const toCenterY = toIndex === finalSceneIndex ? finalTitleCenterY() : toLayout.y * height;
    const centerY = lerp(fromCenterY, toCenterY, mix);
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
      const pivotA = a.rotationCenter || ORIGIN;
      const pivotB = b.rotationCenter || ORIGIN;
      const pivotX = lerp(pivotA.x, pivotB.x, mix);
      const pivotY = lerp(pivotA.y, pivotB.y, mix);
      const pivotZ = lerp(pivotA.z, pivotB.z, mix);
      const point = rotate({
        x: lerp(a.x, b.x, mix) * (1 + warp) - pivotX,
        y: lerp(a.y, b.y, mix) + warp * .7 - pivotY,
        z: lerp(a.z, b.z, mix) * (1 + warp) - pivotZ
      }, rx, ry, rz);
      point.x += pivotX;
      point.y += pivotY;
      point.z += pivotZ;

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

      const depth = clamp((point.z + 1.35) / 2.7, 0, 1);
      const alpha = (.14 + depth * .7) * (.82 + Math.sin(time * 2 + particle.phase) * .12);
      const radius = particle.size * (.65 + depth * .9) * perspective;
      if (x < -6 || x > width + 6 || y < -6 || y > height + 6) return;

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

  buildVehicleScatter();

  projectTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const slug = trigger.closest("[data-project]")?.dataset.project;
      openProject(slug, { trigger });
    });
  });
  projectCloseButton.addEventListener("click", requestProjectClose);
  projectPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestProjectClose();
    } else {
      trapProjectFocus(event);
    }
  });
  addEventListener("popstate", (event) => {
    const slug = event.state?.portfolioProject || projectFromHash();
    if (slug && projectDetails[slug] && !activeProjectSlug) {
      openProject(slug, {
        pushHistory: false,
        scrollPosition: Number(event.state?.portfolioScroll) || 0
      });
    } else if (!slug && activeProjectSlug) {
      closeProject();
    }
  });

  addEventListener("resize", resize, { passive: true });
  addEventListener("scroll", () => {
    updateScrollTarget(true);
  }, { passive: true });
  addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      lastFrame = performance.now();
      scrollVelocity = 0;
      updateScrollTarget();
    }
  });
  addEventListener("pointermove", (event) => {
    pointer.tx = (event.clientX / Math.max(1, width) - .5) * 2;
    pointer.ty = (event.clientY / Math.max(1, height) - .5) * 2;
    pointer.active = true;
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { pointer.active = false; });

  document.querySelector("#year").textContent = new Date().getFullYear();
  resize();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const initialProjectSlug = projectFromHash();
  if (initialProjectSlug && projectDetails[initialProjectSlug]) {
    const initialScroll = Number(history.state?.portfolioScroll) || 0;
    history.replaceState({
      ...history.state,
      portfolioProject: initialProjectSlug,
      portfolioScroll: initialScroll
    }, "", location.href);
    openProject(initialProjectSlug, { pushHistory: false, scrollPosition: initialScroll });
  }
  if (document.fonts?.ready) document.fonts.ready.then(measureScenes);
  requestAnimationFrame(draw);
})();
