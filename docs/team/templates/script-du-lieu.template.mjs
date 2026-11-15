// <Một câu: script này GHI gì vào đâu.>
//
// VÌ SAO CẦN SCRIPT RIÊNG: <vì sao không làm qua giao diện / qua migration — một đoạn>.
//
// Chạy:
//   node scripts/<ten>.mjs                       # CHẠY KHÔ (mặc định): in kế hoạch, KHÔNG ghi gì
//   node scripts/<ten>.mjs --apply               # ghi thật
// Cờ:
//   --only=id1,id2    chỉ xử lý các id này
//   --force           ghi đè CẢ giá trị người khác đã sửa tay (mặc định: giữ và in danh sách đã giữ)
//   --allow-shrink    cho chạy dù nguồn ÍT hơn lần chạy trước (mặc định: dừng — nguồn bị cắt cụt là dấu hiệu sai)
//
// SAU KHI GHI: script Node không gọi được hàm purge cache của app ⇒ <cách purge: gọi một PATCH không đổi gì
// qua API admin / xoá thư mục cache local / đợi revalidate>. Nhớ thứ tự: file mới phải LIVE trước khi ghi dữ liệu
// trỏ tới nó (N32).
//
// Khuôn này áp đủ N33: chạy khô mặc định · idempotent · MERGE JSON · dừng khi co lại · đọc lỗi thì dừng ·
// không đè sửa tay · ghi nhật ký để lùi. Đổi các hằng TABLE/COT/nguồn cho việc thật; giữ nguyên các hàng rào.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { db, ROOT, DB_LABEL } from "./_db.mjs";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const FORCE = args.includes("--force");
const ALLOW_SHRINK = args.includes("--allow-shrink");
const ONLY = (args.find((a) => a.startsWith("--only="))?.slice("--only=".length) ?? "").split(",").filter(Boolean);

const NAME = "ten-script"; // đổi: dùng làm tên file trạng thái + nhật ký
const TABLE = "menu_items"; // đổi
const COT = "image_url"; // đổi: cột giá trị đơn
const PAGE = 1000; // trần số dòng một lần đọc của PostgREST
const STATE_DIR = resolve(ROOT, "backups/scripts"); // nên nằm trong .gitignore

// ── 1. NGUỒN giá trị mới ──────────────────────────────────────────────────────────────────────────
// Trả về { [id]: { value, translations? } }. Đổi theo việc thật (đọc file seed, bảng tra, kết quả upload…).
function docNguon() {
  const file = resolve(ROOT, `data/${NAME}.json`);
  if (!existsSync(file)) {
    console.error(`✗ Không thấy nguồn ${file}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

// ── 2. Hàng rào CO LẠI: nguồn ít hơn lần trước ⇒ nghi nguồn bị cắt cụt (thư mục thiếu file, sheet sai…) ──
function kiemCoLai(soNguon) {
  const file = resolve(STATE_DIR, `${NAME}.last.json`);
  if (!existsSync(file)) return;
  const truoc = JSON.parse(readFileSync(file, "utf8")).soNguon ?? 0;
  if (soNguon < truoc && !ALLOW_SHRINK) {
    console.error(`✗ Nguồn có ${soNguon} mục, lần trước có ${truoc}. DỪNG để khỏi ghi đè bằng dữ liệu thiếu.`);
    console.error("  Chắc chắn nguồn đúng thì chạy lại với --allow-shrink.");
    process.exit(1);
  }
}

// ── 3. ĐỌC hiện trạng — lỗi đọc thì DỪNG, không bao giờ coi là "rỗng" ─────────────────────────────────
async function docHienTai() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from(TABLE)
      .select(`id, ${COT}, translations`)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Đọc ${TABLE} lỗi — DỪNG, không coi là rỗng: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

// Giá trị do NGƯỜI đặt tay (không phải do script sinh). Đổi theo việc thật — ví dụ: URL tuyệt đối thì chỉ có thể
// đến từ admin upload, còn script chỉ ghi đường dẫn tương đối.
function laSuaTay(row) {
  return typeof row[COT] === "string" && /^https?:\/\//.test(row[COT]);
}

// MERGE bản dịch: chỉ điền ô TRỐNG, không đụng ngôn ngữ/field khác. Thay cả cột là cách xoá sạch bản dịch của người
// khác mà không một dòng lỗi nào (N33a).
function mergeTranslations(cu, moi) {
  if (!moi) return cu ?? null;
  const out = structuredClone(cu ?? {});
  for (const [loc, fields] of Object.entries(moi)) {
    out[loc] ??= {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v !== "string" || !v.trim()) continue;
      if (!out[loc][k] || FORCE) out[loc][k] = v;
    }
  }
  return out;
}

// ── 4. LẬP KẾ HOẠCH (thuần, không ghi) ────────────────────────────────────────────────────────────────
function lapKeHoach(rows, nguon) {
  const ghi = [];
  const giu = [];
  const khongCoNguon = [];
  for (const row of rows) {
    if (ONLY.length && !ONLY.includes(row.id)) continue;
    const src = nguon[row.id];
    if (!src) {
      khongCoNguon.push(row.id);
      continue;
    }
    const patch = {};
    if (row[COT] !== src.value) {
      if (laSuaTay(row) && !FORCE) giu.push(row.id);
      else patch[COT] = src.value;
    }
    const tr = mergeTranslations(row.translations, src.translations);
    if (JSON.stringify(tr) !== JSON.stringify(row.translations ?? null)) patch.translations = tr;
    if (Object.keys(patch).length) ghi.push({ id: row.id, truoc: { [COT]: row[COT] }, patch });
  }
  return { ghi, giu, khongCoNguon };
}

// ── 5. CHẠY ───────────────────────────────────────────────────────────────────────────────────────────
const nguon = docNguon();
const soNguon = Object.keys(nguon).length;
kiemCoLai(soNguon);

const rows = await docHienTai();
const { ghi, giu, khongCoNguon } = lapKeHoach(rows, nguon);

console.log(`DB: ${DB_LABEL} · bảng ${TABLE} · ${rows.length} dòng · nguồn ${soNguon} mục`);
console.log(`→ sẽ ghi ${ghi.length} · giữ (sửa tay) ${giu.length} · không có nguồn ${khongCoNguon.length}`);
for (const g of ghi.slice(0, 20)) console.log(`  ~ ${g.id}: ${JSON.stringify(g.truoc[COT])} → ${JSON.stringify(g.patch[COT] ?? "(giữ)")}`);
if (ghi.length > 20) console.log(`  … và ${ghi.length - 20} dòng nữa`);
if (giu.length) console.log(`  Giữ nguyên (người đã sửa tay — dùng --force để đè): ${giu.join(", ")}`);

if (!APPLY) {
  console.log("\nCHẠY KHÔ — chưa ghi gì. Thêm --apply để ghi thật.");
  process.exit(0);
}

// Nhật ký để LÙI được: ghi giá trị trước khi đổi, TRƯỚC khi ghi dòng đầu tiên.
mkdirSync(STATE_DIR, { recursive: true });
const logFile = resolve(STATE_DIR, `${NAME}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(logFile, JSON.stringify(ghi, null, 2));
console.log(`\nNhật ký lùi: ${logFile}`);

let okCount = 0;
const loi = [];
for (const g of ghi) {
  // Tuần tự, không song song: dễ đọc lỗi, không dội dịch vụ, dừng gọn khi bị giới hạn.
  const { error } = await db.from(TABLE).update(g.patch).eq("id", g.id);
  if (error) {
    loi.push(`${g.id}: ${error.message}`);
    if (/rate|limit|429|420/i.test(error.message)) {
      console.error("✗ Bị giới hạn tần suất — dừng gọn. Chạy lại sau: script idempotent, phần đã ghi không ghi lại.");
      break;
    }
    continue;
  }
  okCount++;
}

writeFileSync(resolve(STATE_DIR, `${NAME}.last.json`), JSON.stringify({ soNguon, at: new Date().toISOString() }));
console.log(`Đã ghi ${okCount}/${ghi.length}.${loi.length ? ` Lỗi ${loi.length}:\n  ${loi.join("\n  ")}` : ""}`);
console.log("Nhớ purge cache (xem đầu file) — không thì trang còn hiện bản cũ.");
if (loi.length) process.exit(1);
