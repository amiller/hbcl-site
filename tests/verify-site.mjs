import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(process.argv[2] ?? ".");
const pages = ["index.html", "presence.html", "memory.html", "boundaries.html", "philosophy.html", "404.html"];
const publicPages = pages.slice(0, 5);
const company = "Honey Badger Coop. Labs Inc.";
const productLine = "IO App · Personal AI Agent · v1.0.0 (Build 1)";
const copyright = `© 2026 ${company} All rights reserved.`;

for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  assert.ok(html.includes(company), `${page}: must identify the company`);
  assert.ok(html.includes(productLine), `${page}: must identify IO and its real app version`);
  assert.ok(html.includes(copyright), `${page}: must include the complete copyright line`);
  assert.ok(html.includes(`An AI product by ${company}`), `${page}: must state product ownership`);
  assert.ok(!html.includes("Honey Badger Cooperation Labs"), `${page}: must not use the retired company spelling`);
}

const home = readFileSync(join(root, "index.html"), "utf8");
const homeHero = home.match(/<section[^>]*class="hero container"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.ok(homeHero.includes("personal AI Agent"), "Home first viewport must name IO as an AI Agent");
assert.ok(homeHero.includes(`An AI product by ${company}`), "Home first viewport must make company ownership visible");
assert.match(home, /<figure[^>]*class="canvas-stage[^\"]*agent-core[^\"]*"[^>]*data-agent-core/i, "Home must present the Presence canvas as the Agent Core");
assert.match(home, /IO AGENT\s*\/\s*v1\.0\.0/i, "Home Agent Core must expose product identity and version");
const homeStates = home.match(/<li[^>]*data-agent-state[^>]*>/g) ?? [];
assert.equal(homeStates.length, 4, "Home Agent Core must expose four visible agent states");
assert.match(home, /<ol[^>]*id="home-agent-states"[^>]*data-agent-state-list/i, "Home Agent states need a stable control target");
assert.match(home, /<button[^>]*data-agent-motion-toggle[^>]*aria-controls="home-agent-states"[^>]*>Pause Agent<\/button>/i, "Home Agent animation must provide a pause control");
for (const state of ["Observing", "Remembering", "Waiting", "Making"]) {
  assert.ok(home.includes(state), `Home Agent Core must include ${state}`);
}
const trace = home.match(/<section[^>]*class="agent-trace[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.ok(trace, "Home must include an Agent trace");
assert.equal((trace.match(/class="agent-trace__step/g) ?? []).length, 4, "Agent trace must show four stages");
for (const stage of ["Perceive", "Remember", "Reason", "Act"]) assert.ok(trace.includes(stage), `Agent trace must include ${stage}`);
for (const field of ["Product", "IO", "Type", "Personal AI Agent", "Company", company, "Version", "1.0.0"]) {
  assert.ok(home.includes(field), `Home product identity must include ${field}`);
}
assert.match(home, /"@type"\s*:\s*"SoftwareApplication"[\s\S]*"softwareVersion"\s*:\s*"1\.0\.0"[\s\S]*"creator"[\s\S]*"Honey Badger Coop\. Labs Inc\."/i, "Home structured data must connect IO v1.0.0 to its company");

const presence = readFileSync(join(root, "presence.html"), "utf8");
assert.match(presence, /data-agent-telemetry/i, "Presence must include agent telemetry");
assert.match(presence, /<ul[^>]*id="presence-agent-states"[^>]*data-agent-state-list/i, "Presence telemetry needs a stable control target");
assert.match(presence, /<button[^>]*data-agent-motion-toggle[^>]*aria-controls="presence-agent-states"[^>]*>Pause Agent<\/button>/i, "Presence telemetry must provide a pause control");
for (const signal of ["Signal", "Voice", "Context", "Agent online"]) assert.ok(presence.includes(signal), `Presence telemetry must include ${signal}`);

const memory = readFileSync(join(root, "memory.html"), "utf8");
assert.equal((memory.match(/class="memory-signal/g) ?? []).length, 2, "Memory cards must expose two agent-organised memory signals");
assert.match(memory, /class="memory-synapse"/i, "Memory must visually connect recalled fragments");

const boundaries = readFileSync(join(root, "boundaries.html"), "utf8");
assert.match(boundaries, /class="boundary-gate[^"]*"[\s\S]*data-agent-waiting/i, "Boundaries must show the Agent waiting outside permission");
assert.ok(boundaries.includes("Permission required"), "Boundary gate must keep permission explicit");

const philosophy = readFileSync(join(root, "philosophy.html"), "utf8");
const agentForm = philosophy.match(/<div[^>]*class="agent-form"[\s\S]*?<\/div>/i)?.[0] ?? "";
assert.ok(agentForm, "Philosophy must include a non-human Agent form");
assert.equal((agentForm.match(/<span><\/span>/g) ?? []).length, 12, "Agent form must be a twelve-point HTML/CSS body");

const styles = readFileSync(join(root, "assets", "styles.css"), "utf8");
for (const selector of [".agent-core", ".agent-state-list", ".agent-trace", ".agent-telemetry", ".memory-synapse", ".boundary-gate", ".agent-form", ".product-identity", ".site-footer__legal"]) {
  assert.ok(styles.includes(selector), `Styles must render ${selector}`);
}
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i, "Agent motion must preserve reduced-motion support");

function loadAgentStateContract(reducedMotion) {
  const intervals = [];
  const clearedIntervals = [];
  const motionListeners = [];
  const buttonListeners = new Map();
  const buttonAttributes = new Map();
  const makeState = () => {
    const classes = new Set();
    const attributes = new Map();
    return {
      classList: { contains: (name) => classes.has(name), toggle: (name, enabled) => classes[enabled ? "add" : "delete"](name) },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: (name) => attributes.get(name),
    };
  };
  const states = Array.from({ length: 4 }, makeState);
  const list = { dataset: {}, id: "home-agent-states", isConnected: true, querySelectorAll: () => states };
  const button = {
    disabled: false,
    textContent: "Pause Agent",
    addEventListener: (type, listener) => buttonListeners.set(type, listener),
    setAttribute: (name, value) => buttonAttributes.set(name, value),
    getAttribute: (name) => buttonAttributes.get(name),
    click: () => buttonListeners.get("click")?.(),
  };
  const rootElement = { classList: { add() {}, remove() {} } };
  const document = {
    documentElement: rootElement,
    readyState: "complete",
    addEventListener() {},
    querySelector(selector) {
      if (selector === "[data-agent-motion-toggle][aria-controls=\"home-agent-states\"]") return button;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-agent-state-list]") return [list];
      return [];
    },
  };
  const motionQuery = {
    matches: reducedMotion,
    addEventListener(type, listener) { if (type === "change") motionListeners.push(listener); },
    dispatch(matches) { this.matches = matches; motionListeners.forEach((listener) => listener({ matches })); },
  };
  const window = { matchMedia: () => motionQuery };
  const setInterval = (callback, delay) => { intervals.push({ callback, delay }); return intervals.length; };
  const clearInterval = (handle) => { clearedIntervals.push(handle); };
  const script = readFileSync(join(root, "assets", "site.js"), "utf8");
  vm.runInNewContext(script, { Array, Date, Object, WeakMap, document, window, setInterval, clearInterval }, { filename: "site.js" });
  return { button, buttonAttributes, clearedIntervals, intervals, list, motionListeners, motionQuery, states, window };
}

const animated = loadAgentStateContract(false);
assert.equal(typeof animated.window.IOSite.setupAgentStates, "function", "site API must expose Agent state setup");
assert.equal(animated.states[0].classList.contains("is-active"), true, "Agent state starts at the first visible state");
assert.equal(animated.states[0].getAttribute("aria-current"), "true", "active Agent state is exposed semantically");
assert.equal(animated.intervals.length, 1, "all Agent states share one calm timer per list");
assert.equal(animated.intervals[0].delay, 2800, "Agent state changes at a calm, readable pace");
assert.equal(animated.button.textContent, "Pause Agent", "running Agent state exposes a pause action");
assert.equal(animated.button.getAttribute("aria-pressed"), "false", "running Agent state is not marked paused");
animated.intervals[0].callback();
assert.equal(animated.states[0].classList.contains("is-active"), false, "previous Agent state becomes inactive");
assert.equal(animated.states[1].classList.contains("is-active"), true, "Agent state advances visibly");
animated.button.click();
assert.equal(animated.clearedIntervals.includes(1), true, "Pause Agent clears the active timer");
assert.equal(animated.button.textContent, "Resume Agent", "paused Agent state exposes a resume action");
assert.equal(animated.button.getAttribute("aria-pressed"), "true", "paused Agent state is exposed semantically");
animated.button.click();
assert.equal(animated.intervals.length, 2, "Resume Agent starts one replacement timer");
animated.motionQuery.dispatch(true);
assert.equal(animated.clearedIntervals.includes(2), true, "dynamic reduced-motion immediately clears the replacement timer");
assert.equal(animated.button.disabled, true, "system reduced-motion prevents manual animation restart");
assert.equal(animated.button.textContent, "Motion reduced", "control explains why Agent motion is stable");
assert.equal(animated.states[0].classList.contains("is-active"), true, "dynamic reduced-motion fixes the first Agent state in place");
animated.window.IOSite.setupAgentStates();
assert.equal(animated.motionListeners.length, 1, "Agent state setup is idempotent");
animated.motionQuery.dispatch(false);
assert.equal(animated.intervals.length, 3, "Agent state resumes once when system motion is restored");
animated.list.isConnected = false;
animated.intervals[2].callback();
assert.equal(animated.clearedIntervals.includes(3), true, "detached Agent state lists release their timer");

const reduced = loadAgentStateContract(true);
assert.equal(reduced.states[0].classList.contains("is-active"), true, "reduced motion keeps a stable Agent state");
assert.equal(reduced.intervals.length, 0, "reduced motion does not schedule Agent state animation");
assert.equal(reduced.button.disabled, true, "reduced motion disables the resume control");
assert.equal(reduced.button.textContent, "Motion reduced", "reduced motion is explained in the control label");

for (const page of publicPages) {
  const html = readFileSync(join(root, page), "utf8");
  assert.ok(!/backend architecture|deployment topology|database design|runtime workers?/i.test(html), `${page}: must not expose backend architecture`);
}

console.log("Verified IO Agent identity, behavior, company, version, and legal footer.");
