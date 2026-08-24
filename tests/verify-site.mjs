import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(process.argv[2] ?? ".");
const pages = ["index.html", "agent.html", "presence.html", "memory.html", "boundaries.html", "philosophy.html", "404.html"];
const publicPages = pages;
const company = "Honey Badger Coop. Labs Inc.";
const productLine = "IO App · Personal AI Agent · v1.0.0 (Build 1)";
const copyright = `© 2026 ${company} All rights reserved.`;

for (const page of pages) {
  assert.ok(existsSync(join(root, page)), `${page}: required static page must exist`);
  const html = readFileSync(join(root, page), "utf8");
  assert.ok(html.includes(company), `${page}: must identify the company`);
  assert.ok(html.includes(productLine), `${page}: must identify IO and its real app version`);
  assert.ok(html.includes(copyright), `${page}: must include the complete copyright line`);
  assert.ok(html.includes(`An AI product by ${company}`), `${page}: must state product ownership`);
  assert.ok(!html.includes("Honey Badger Cooperation Labs"), `${page}: must not use the retired company spelling`);
}

for (const page of publicPages) {
  const html = readFileSync(join(root, page), "utf8");
  assert.match(html, /<title>[^<]*AI Agent[^<]*<\/title>/i, `${page}: title must identify the AI Agent product`);
  assert.match(html, /<div[^>]*class="company-strip"[^>]*>[\s\S]*Honey Badger Coop\. Labs Inc\.[\s\S]*AI Products Company[\s\S]*<\/div>/i, `${page}: global header must identify the AI company`);
  assert.match(html, /class="product-mark"[^>]*>\s*IO\s*\/\s*Personal AI Agent\s*\/\s*v1\.0\.0/i, `${page}: global header must identify the product category and version`);
  assert.match(html, /<a[^>]*href="\/?agent\.html"[^>]*>Agent<\/a>/i, `${page}: primary navigation must expose the Agent page`);
}

const home = readFileSync(join(root, "index.html"), "utf8");
const homeHero = home.match(/<section[^>]*class="hero container"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.ok(homeHero.includes("personal AI Agent"), "Home first viewport must name IO as an AI Agent");
assert.ok(homeHero.includes(`An AI product by ${company}`), "Home first viewport must make company ownership visible");
assert.match(homeHero, /<h1[^>]*>\s*Meet IO — your personal AI Agent\.\s*<\/h1>/i, "Home headline must state the product category at first glance");
assert.ok(homeHero.includes("A relationship that remembers."), "Home must retain the relationship proposition beneath the AI Agent headline");
assert.ok(home.indexOf('class="agent-profile') < home.indexOf('class="canvas-stage'), "Home must present the Agent Profile before the lower Agent visual so its identity reads at first glance");
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

const profile = home.match(/<section[^>]*class="agent-profile[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.ok(profile, "Home first screen must include an Agent Profile");
for (const field of ["Personal AI Agent", "Present", "Continuous", "Chat · Voice · Screen", "App · Dynamic Island · Live Activity", company]) {
  assert.ok(profile.includes(field), `Agent Profile must include ${field}`);
}

const capabilities = home.match(/<section[^>]*class="agent-capabilities[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.equal((capabilities.match(/class="agent-capability"/g) ?? []).length, 6, "Home must show six user-visible Agent capabilities");
for (const capability of ["Perceive", "Remember", "Reason", "Act", "Speak", "Make"]) assert.ok(capabilities.includes(capability), `Capabilities must include ${capability}`);

const principles = home.match(/<section[^>]*class="agent-principles[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.equal((principles.match(/class="agent-principle"/g) ?? []).length, 5, "Home must explain five simple Agent principles");
for (const principle of ["Choose the mind", "Give it an identity", "Build continuity", "Give it an iPhone body", "Keep the boundaries yours"]) assert.ok(principles.includes(principle), `Principles must include ${principle}`);
for (const formula of ["Your model or VPS Agent", "+ Identity + Memory + an iPhone body", "IO, a personal AI Agent that continues"]) assert.ok(home.includes(formula), `Home formula must include ${formula}`);

const audience = home.match(/<section[^>]*class="agent-audience[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.equal((audience.match(/class="audience-card/g) ?? []).length, 4, "Home must identify four overlapping target audiences");
for (const segment of ["Model API key users", "VPS and always-on Agent users", "Claude and ChatGPT power users", "Human–AI relationship users"]) assert.ok(audience.includes(segment), `Audience must include ${segment}`);
for (const provider of ["Anthropic", "OpenAI", "Gemini", "DeepSeek", "OpenRouter"]) assert.ok(audience.includes(provider), `API-key audience must mention ${provider}`);
for (const host of ["VPS", "Mac", "home server", "always-on machine"]) assert.ok(audience.includes(host), `VPS audience must mention ${host}`);

const paths = home.match(/<section[^>]*class="connection-paths[^"]*"[\s\S]*?<\/section>/i)?.[0] ?? "";
assert.ok(paths.includes("I have a model API key"), "Home must expose the model API key path");
assert.ok(paths.includes("I have my own Agent"), "Home must expose the VPS / own Agent path");
assert.ok(paths.includes("No server required."), "API key path must make its low-setup principle clear");
assert.ok(paths.includes("VPS, Mac, or always-on machine"), "Own Agent path must name its real hosts");
assert.doesNotMatch(paths, /<(?:a|button)\b/i, "Connection paths are explanations, not conversion CTAs");
assert.ok(home.includes(`${company} is an AI products company building personal agents. IO is its AI Agent product.`), "Home must directly state the company and product category");

const agentPage = readFileSync(join(root, "agent.html"), "utf8");
assert.match(agentPage, /<h1[^>]*>\s*An Agent that stays\.\s*<\/h1>/i, "Agent page needs a distinct product headline");
assert.ok(agentPage.includes("I have a model API key"), "Agent page must explain the API key route");
assert.ok(agentPage.includes("I have my own Agent"), "Agent page must explain the VPS route");
assert.ok(agentPage.includes("Anthropic / OpenAI / Gemini / DeepSeek / OpenRouter"), "Agent page must name real provider choices");
assert.ok(agentPage.includes("VPS, Mac, or always-on machine"), "Agent page must name real always-on Agent hosts");
assert.match(agentPage, /href="agent\.html"\s+aria-current="page"/i, "Agent page navigation must identify the current page");

for (const [page, label] of [
  ["agent.html", "IO AI AGENT / AGENT"],
  ["presence.html", "IO AI AGENT / PRESENCE"],
  ["memory.html", "IO AI AGENT / MEMORY"],
  ["boundaries.html", "IO AI AGENT / BOUNDARIES"],
  ["philosophy.html", "IO AI AGENT / PHILOSOPHY"],
]) assert.ok(readFileSync(join(root, page), "utf8").includes(label), `${page}: must carry its Agent section label`);

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
assert.ok(sitemap.includes("https://www.hbcolab.com/agent.html"), "sitemap must publish the Agent page");
assert.equal((sitemap.match(/<url>/g) ?? []).length, 6, "sitemap must contain all six public pages exactly once");

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
for (const selector of [".company-strip", ".product-mark", ".agent-core", ".agent-state-list", ".agent-trace", ".agent-profile", ".agent-capabilities", ".agent-principles", ".agent-audience", ".connection-paths", ".agent-telemetry", ".memory-synapse", ".boundary-gate", ".agent-form", ".product-identity", ".site-footer__legal"]) {
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
