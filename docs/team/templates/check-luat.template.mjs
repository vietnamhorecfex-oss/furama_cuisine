// Phép thử cho lib/<chu-de>.ts — luật THUẦN của "<tên tính năng>" (N08, N37).
//
// Chạy:  node --no-warnings scripts/check-<chu-de>.mjs     (thoát ≠ 0 nếu có ca hỏng)
//
// CÁCH DÙNG KHUÔN NÀY:
//   1. Chép sang `scripts/check-<chu-de>.mjs`.
//   2. Xoá khối "VÍ DỤ" bên dưới, mở dòng import và trỏ tới module thật.
//      Module phải chỉ `import type` — Node 22 tự tháo annotation TypeScript nên nạp thẳng được file .ts,
//      nhưng KHÔNG hiểu alias `@/…` và không chạy được import runtime của framework.
//   3. Mỗi ca là MỘT câu mô tả HÀNH VI ("ngày có thật: từ chối 31/02"), không phải tên hàm.
//   4. Kiểm theo ĐẶC TÍNH mong muốn, không theo "giống bản cũ" (N38).
//   5. Ghi lệnh chạy vào CLAUDE.md, cạnh mục của module. Chạy lại sau MỖI lần sửa module.
//
// Khuôn này tự chạy được (`node --no-warnings check-luat.template.mjs`) để thấy đầu ra mong đợi.

import assert from "node:assert/strict";
// import { isRealDay, addDaysIso } from "../lib/<chu-de>.ts";

// ── VÍ DỤ — xoá khi dùng thật ────────────────────────────────────────────────────────────────────
// Hai hàm mẫu tiêu biểu cho loại luật hay sai: regex khớp nhưng ngày không có thật (N15), và cộng
// ngày qua tháng/năm mà không đi qua múi giờ của máy chạy (N53).
function isRealDay(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
function addDaysIso(s, n) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
// ── HẾT VÍ DỤ ────────────────────────────────────────────────────────────────────────────────────

let n = 0;
const ok = (name, fn) => {
  fn();
  n++;
  console.log("✓", name);
};

ok("ngày có thật: nhận đúng dạng, nhận 29/02 năm nhuận", () => {
  assert.equal(isRealDay("2026-10-18"), true);
  assert.equal(isRealDay("2028-02-29"), true);
});

ok("ngày có thật: từ chối 31/02, tháng 13, dạng dd/mm/yyyy, chuỗi rỗng, không phải chuỗi", () => {
  assert.equal(isRealDay("2026-02-31"), false);
  assert.equal(isRealDay("2026-13-01"), false);
  assert.equal(isRealDay("18/10/2026"), false);
  assert.equal(isRealDay(""), false);
  assert.equal(isRealDay(null), false);
});

ok("cộng ngày: qua tháng, qua năm, lùi ngày, qua 29/02", () => {
  assert.equal(addDaysIso("2026-10-31", 1), "2026-11-01");
  assert.equal(addDaysIso("2026-12-31", 1), "2027-01-01");
  assert.equal(addDaysIso("2026-03-01", -1), "2026-02-28");
  assert.equal(addDaysIso("2028-02-28", 1), "2028-02-29");
});

console.log(`\n${n} ca đều xanh.`);
