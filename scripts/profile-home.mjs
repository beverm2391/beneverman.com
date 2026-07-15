import { chromium } from "playwright";

// Cold-load profile of the homepage against a production server. A fresh
// browser context each run means an empty cache, which is the only number that
// matters here: the scene is decoration a returning visitor already has.
//
//   pnpm build && npx next start --port 3100
//   node scripts/profile-home.mjs [url] [--throttle]
//
// The scene marks come from scene/primitives/sceneArrival: each layer marks
// itself live only once its own first frame is GPU-fence-verified, so
// scene:arrival is when the page is actually finished, not when JS finished.

const url = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3100/";
const throttle = process.argv.includes("--throttle");

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

if (throttle) {
  // Fast 3G-ish, 4x CPU slowdown: what the shader costs someone on a phone.
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

// Layout shift has to be observed from before navigation: entries are only
// delivered live, never replayed from the buffer with attribution attached.
await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue; // user-driven reflow is not a shift
      window.__shifts.push({
        value: e.value,
        at: Math.round(e.startTime),
        sources: (e.sources ?? []).map((s) => {
          const n = s.node;
          if (!n) return "(detached)";
          const tag = n.tagName?.toLowerCase() ?? n.nodeName;
          const cls = (n.className?.baseVal ?? n.className ?? "").toString().trim().split(/\s+/)[0];
          return `${tag}${cls ? "." + cls : ""}`;
        })
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});

await page.goto(url, { waitUntil: "load" });

// The scene fades in after load, so give the marks a chance to land.
await page
  .waitForFunction(() => performance.getEntriesByName("scene:arrival").length > 0, null, {
    timeout: 15000
  })
  .catch(() => console.log("(scene:arrival never fired within 15s)"));

const result = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const paint = Object.fromEntries(
    performance.getEntriesByType("paint").map((e) => [e.name, Math.round(e.startTime)])
  );
  const marks = Object.fromEntries(
    performance
      .getEntriesByType("mark")
      .filter((m) => m.name.startsWith("scene:"))
      .map((m) => [m.name, Math.round(m.startTime)])
  );
  const resources = performance
    .getEntriesByType("resource")
    .map((r) => ({
      name: r.name.split("/").pop().slice(0, 44),
      kind: r.initiatorType,
      kb: +(r.transferSize / 1024).toFixed(1),
      ms: Math.round(r.duration)
    }))
    .filter((r) => r.kb > 0)
    .sort((a, b) => b.kb - a.kb);

  const total = (t) =>
    +performance
      .getEntriesByType("resource")
      .filter((r) => (t ? r.initiatorType === t : true))
      .reduce((n, r) => n + r.transferSize, 0)
      .toFixed(0);

  const shifts = window.__shifts ?? [];
  return {
    ttfb: Math.round(nav.responseStart),
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    fcp: paint["first-contentful-paint"] ?? null,
    marks,
    cls: +shifts.reduce((n, s) => n + s.value, 0).toFixed(4),
    shifts: shifts
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((s) => `${s.value.toFixed(4)} at ${s.at}ms  <- ${[...new Set(s.sources)].join(", ") || "(no attribution)"}`),
    bytes: {
      totalKB: +(total() / 1024).toFixed(1),
      scriptKB: +(total("script") / 1024).toFixed(1),
      htmlKB: +(nav.transferSize / 1024).toFixed(1)
    },
    heaviest: resources.slice(0, 8)
  };
});

console.log(`\n=== cold load: ${url}${throttle ? "  (Fast 3G + 4x CPU)" : "  (unthrottled)"} ===\n`);
console.log(`TTFB                ${result.ttfb} ms`);
console.log(`First Contentful    ${result.fcp} ms   <- content is readable here`);
console.log(`DOMContentLoaded    ${result.domContentLoaded} ms`);
console.log(`load                ${result.load} ms`);
console.log(`Cumulative Layout Shift  ${result.cls}   ${result.cls > 0.1 ? "<- over the 0.1 'good' threshold" : "(good is < 0.1)"}`);
if (result.shifts.length) {
  console.log(`\nlayout shifts, worst first:`);
  for (const s of result.shifts) console.log(`  ${s}`);
}
console.log(`\nscene marks (ms from navigation start):`);
for (const [k, v] of Object.entries(result.marks)) console.log(`  ${k.padEnd(22)} ${v} ms`);
if (!Object.keys(result.marks).length) console.log("  (none)");
console.log(`\nbytes: ${result.bytes.totalKB} KB total, ${result.bytes.scriptKB} KB script, ${result.bytes.htmlKB} KB html`);
console.log(`\nheaviest resources:`);
for (const r of result.heaviest) {
  console.log(`  ${String(r.kb).padStart(7)} KB  ${String(r.ms).padStart(5)} ms  ${r.kind.padEnd(8)} ${r.name}`);
}
console.log();

await browser.close();
