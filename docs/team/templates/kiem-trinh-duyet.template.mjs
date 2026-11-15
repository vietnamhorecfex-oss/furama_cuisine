// Kiểm bằng TRÌNH DUYỆT THẬT (Playwright + axe) — phần "mở trình duyệt thật" của /kiem-chung-thuc (N40, N46, N47, N17).
//
// Chạy:  BASE=http://localhost:3000 PATHS=/,/dat-ban,/en node --no-warnings scripts/kiem-trinh-duyet.mjs
//        (thoát ≠ 0 nếu có lỗi; ảnh chụp ở dist/kiem-trinh-duyet/ — nhớ gitignore dist/)
//
// CÁCH DÙNG KHUÔN NÀY:
//   1. `npm i -D playwright axe-core && npx playwright install chromium` (một lần). Chép sang `scripts/kiem-trinh-duyet.mjs`.
//      Thiếu axe-core ⇒ phần a11y tự động ghi "Chưa kiểm", không báo đạt.
//   2. Kiểm trên production build (`npm run build && npm start`), không chỉ dev server — static/dynamic, cache và
//      prefetch khác nhau (N40). Trang cần đăng nhập: đặt COOKIE="tên=giá-trị" (tài khoản test-*, không dùng thật).
//   3. Mỗi lượt chạy kiểm cho MỌI đường dẫn × HAI khổ màn hình (390px, 1440px):
//        console sạch (không error, không lỗi hydration) · không request same-origin nào 4xx/5xx · không tràn ngang ·
//        nội dung chính (<h1>) có trong HTML khi TẮT JavaScript (N46) · Tab tới được một phần tử có viền focus (N47) ·
//        axe WCAG 2.2 A/AA không vi phạm (tương phản, nhãn, aria, vùng chạm…) · bật giảm chuyển động thì không còn
//        animation lặp vô hạn nào chạy (N47). axe chèn script vào trang — CSP chặn inline script thì chạy ở bản
//        dev/preview không CSP, hoặc dùng @axe-core/playwright.
//   4. Viết kịch bản riêng của tính năng trong `KICH_BAN` (bấm đúp gửi form ⇒ đúng MỘT request — N17; F5 giữa chừng
//      giữ dữ liệu — N48; …). Mỗi kịch bản là một câu mô tả HÀNH VI.
//   5. Một lượt đầu báo 0 lỗi ⇒ cố ý làm hỏng một thứ (thêm console.error, bỏ submittingRef) xem nó có bắt không (N39).
//   6. Dán bảng kết quả vào báo cáo kiểm chứng, mục "Đã kiểm chứng"; đường dẫn không chạy được ⇒ "Chưa kiểm".
//
// Khuôn này tự chạy được khi KHÔNG đặt BASE: nó dựng một trang mẫu trong bộ nhớ để thấy đầu ra mong đợi.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

let AXE = null; // đường dẫn axe.min.js — không có thì phần a11y tự động là "Chưa kiểm"
try {
  AXE = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
} catch {}

const DEMO = !process.env.BASE;
const BASE = (process.env.BASE || "http://demo.local").replace(/\/$/, "");
const PATHS = (process.env.PATHS || "/").split(",").map((p) => p.trim()).filter(Boolean);
const COOKIE = process.env.COOKIE || "";
const OUT = "dist/kiem-trinh-duyet";
const KHO = [
  { ten: "mobile", width: 390, height: 844 },
  { ten: "desktop", width: 1440, height: 900 },
];

// ── KỊCH BẢN RIÊNG — sửa theo tính năng ────────────────────────────────────────────────────────────
// Mỗi kịch bản: { ten, path, chay(page, ghi) } — ném lỗi (assert) khi hành vi sai.
const KICH_BAN = [
  {
    ten: "bấm đúp nút Gửi ⇒ đúng MỘT request ghi (N17)",
    path: "/",
    async chay(page) {
      let soRequest = 0;
      page.on("request", (r) => {
        if (r.method() !== "GET" && new URL(r.url()).pathname.startsWith("/api/")) soRequest++;
      });
      await page.getByRole("button", { name: /gửi|send|đặt/i }).first().dblclick();
      await page.waitForTimeout(800);
      if (soRequest !== 1) throw new Error(`kỳ vọng 1 request, thực tế ${soRequest}`);
    },
  },
];

// ── Trang mẫu cho chế độ tự thử — xoá khi dùng thật ─────────────────────────────────────────────────
const TRANG_MAU = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Mẫu</title>
<style>body{font:16px system-ui;margin:0;padding:16px}button:focus-visible{outline:3px solid #06c}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#06c;animation:nhip 1.2s ease-in-out infinite}
@keyframes nhip{50%{transform:scale(1.6)}}
@media (prefers-reduced-motion: reduce){.dot{animation:none}}</style></head>
<body><main><h1>Đặt bàn <span class="dot" aria-hidden="true"></span></h1><form id="f"><label>Tên <input name="ten" value="test-a"></label>
<button type="submit">Gửi</button></form><p id="kq" aria-live="polite"></p></main>
<script>
  let dangGui = false; // khoá đồng bộ — N17 lớp 1
  document.getElementById("f").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (dangGui) return; dangGui = true;
    const r = await fetch("/api/dat-ban", { method: "POST", body: "{}" });
    document.getElementById("kq").textContent = r.ok ? "Đã gửi" : "Lỗi";
  });
</script></body></html>`;

async function caiDemo(context) {
  await context.route(`${BASE}/**`, (route) => {
    const u = new URL(route.request().url());
    if (u.pathname.startsWith("/api/")) {
      return route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true}' });
    }
    return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: TRANG_MAU });
  });
}

async function taoContext(browser, kho, coJs = true) {
  const context = await browser.newContext({
    viewport: { width: kho.width, height: kho.height },
    javaScriptEnabled: coJs,
  });
  if (COOKIE) {
    const [name, ...rest] = COOKIE.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: BASE }]);
  }
  if (DEMO) await caiDemo(context);
  return context;
}

const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/[^\w-]+/g, "_"));
const ketQua = []; // { kho, path, kiem, ok, chiTiet }
// ok: true = đạt · false = hỏng · null = CHƯA KIỂM (thiếu công cụ) — không bao giờ tính null là đạt (N40).
const ghi = (kho, path, kiem, ok, chiTiet = "") => ketQua.push({ kho, path, kiem, ok, chiTiet });

async function kiemTrang(browser, kho, path) {
  const context = await taoContext(browser, kho);
  const page = await context.newPage();
  const loiConsole = [];
  const loiMang = [];
  page.on("console", (m) => m.type() === "error" && loiConsole.push(m.text()));
  page.on("pageerror", (e) => loiConsole.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.url().startsWith(BASE) && r.status() >= 400) loiMang.push(`${r.status()} ${r.url().slice(BASE.length)}`);
  });

  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  const status = res ? res.status() : 0;
  ghi(kho.ten, path, "trang trả 2xx", status >= 200 && status < 300, `status ${status}`);

  await page.waitForTimeout(300); // cho hydration xong rồi mới chốt console
  ghi(kho.ten, path, "console sạch", loiConsole.length === 0, loiConsole.slice(0, 3).join(" | "));
  ghi(kho.ten, path, "không request 4xx/5xx", loiMang.length === 0, loiMang.slice(0, 3).join(" | "));

  const tran = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ghi(kho.ten, path, "không tràn ngang", tran <= 1, tran > 1 ? `tràn ${tran}px` : "");

  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { tag: el.tagName, vien: s.outlineStyle !== "none" || s.boxShadow !== "none" };
  });
  ghi(kho.ten, path, "Tab tới phần tử có viền focus (N47)", !!focus?.vien, focus ? focus.tag : "không có gì nhận focus");

  if (AXE) {
    await page.addScriptTag({ path: AXE });
    const vp = await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return r.violations.map((v) => `${v.id}(${v.impact}, ${v.nodes.length})`);
    });
    ghi(kho.ten, path, "axe WCAG 2.2 AA", vp.length === 0, vp.slice(0, 4).join(" · "));
  } else {
    ghi(kho.ten, path, "axe WCAG 2.2 AA", null, "axe-core chưa cài");
  }

  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}/${kho.ten}-${slug(path)}.png`, fullPage: true });
  await context.close();
}

async function kiemGiamChuyenDong(browser, path) {
  const context = await taoContext(browser, KHO[0]);
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const lap = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity)
      .map((a) => a.animationName || a.effect?.target?.className || "animation"),
  );
  ghi("reduced", path, "giảm chuyển động ⇒ không animation lặp vô hạn (N47)", lap.length === 0, lap.slice(0, 3).join(" · "));
  await context.close();
}

async function kiemKhongJs(browser, path) {
  const context = await taoContext(browser, KHO[1], false);
  const page = await context.newPage();
  await page.goto(BASE + path);
  const h1 = (await page.locator("h1").first().textContent({ timeout: 2000 }).catch(() => null))?.trim();
  ghi("no-js", path, "nội dung chính có trong HTML tĩnh (N46)", !!h1, h1 ? `h1: ${h1.slice(0, 40)}` : "không thấy <h1>");
  await context.close();
}

async function chayKichBan(browser) {
  for (const kb of KICH_BAN) {
    const context = await taoContext(browser, KHO[0]);
    const page = await context.newPage();
    try {
      await page.goto(BASE + kb.path, { waitUntil: "networkidle" });
      await kb.chay(page);
      ghi("kịch bản", kb.path, kb.ten, true);
    } catch (e) {
      ghi("kịch bản", kb.path, kb.ten, false, String(e.message || e).split("\n")[0]);
    }
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  for (const path of PATHS) {
    for (const kho of KHO) await kiemTrang(browser, kho, path);
    await kiemKhongJs(browser, path);
    await kiemGiamChuyenDong(browser, path);
  }
  await chayKichBan(browser);
} finally {
  await browser.close();
}

const hong = ketQua.filter((k) => k.ok === false);
const chuaKiem = ketQua.filter((k) => k.ok === null);
console.log(`\nKiểm trình duyệt — ${DEMO ? "TRANG MẪU (chưa đặt BASE)" : BASE}`);
console.log("| Khổ | Đường dẫn | Kiểm | Kết quả |\n|---|---|---|---|");
for (const k of ketQua) {
  const dau = k.ok === null ? "CHƯA KIỂM" : k.ok ? "✓" : "✗";
  console.log(`| ${k.kho} | ${k.path} | ${k.kiem} | ${dau}${k.chiTiet ? " " + k.chiTiet : ""} |`);
}
console.log(`\n${ketQua.length - hong.length - chuaKiem.length}/${ketQua.length} đạt · ${hong.length} hỏng · ${chuaKiem.length} chưa kiểm · ảnh chụp: ${OUT}/`);
if (hong.length) process.exit(1);
