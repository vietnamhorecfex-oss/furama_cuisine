// Cửa kết nối DB + nạp `.env.local` DÙNG CHUNG cho mọi script Node trong repo (N33).
//
// Chép sang `scripts/_db.mjs`. Mọi script import `{ db, ROOT }` từ đây — không chép lại loadEnv() vào từng
// script (dự án gốc từng có năm bản sao y hệt; đổi cách đọc env là năm chỗ phải sửa và bốn chỗ bị quên).
//
// Bản này dùng Supabase JS. Stack khác (pg, Prisma, Drizzle…) thì giữ nguyên loadEnv() + ROOT, đổi phần client.
//
// BÓC DẤU NHÁY LÀ BẮT BUỘC: `.env.local` viết kiểu shell nên giá trị hay nằm trong " hoặc '. Để nguyên thì
// URL mang theo dấu nháy và client NÉM "Invalid URL" — lỗi trông như sai credential trong khi credential đúng.
// Không ghi đè biến đã có trong process.env: env do CI/shell truyền vào phải THẮNG file trên đĩa.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Gốc repo tính từ VỊ TRÍ THẬT của file này, không phải cwd — script có thể được gọi từ thư mục khác. */
export const ROOT = resolve(__dirname, "..");

export function loadEnv(file = resolve(ROOT, ".env.local")) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i === -1) continue;
    const key = s.slice(0, i).trim();
    let val = s.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong môi trường / .env.local");
  process.exit(1);
}

/** Tên môi trường để script IN RA trước khi ghi — người chạy phải thấy mình đang ghi vào đâu (L2). */
export const DB_LABEL = process.env.DB_LABEL || new URL(url).hostname.split(".")[0];

/** Client service role — script cần ghi vượt RLS. Tắt session vì tiến trình chạy một lượt rồi thoát. */
export const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
