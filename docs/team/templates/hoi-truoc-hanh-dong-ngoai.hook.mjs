#!/usr/bin/env node
// Hook PreToolUse (Bash) của team-agency — buộc Claude Code HỎI chủ dự án trước mọi hành động ra ngoài (N59):
// đẩy code, deploy, migration lên DB thật, phát hành gói, script dữ liệu chạy --apply.
//
// Vì sao là hook: trước bản 1.3.1, luật "hỏi trước khi deploy" chỉ nằm trong lời dặn của agent/quy trình — một agent
// quên đọc, hoặc một lượt dọn prompt, là luật biến mất mà không ai thấy. Hook do Claude Code chạy, không phụ thuộc
// việc agent có nhớ luật hay không.
//
// Cài: install.sh chép file này vào .claude/hooks/hoi-truoc-hanh-dong-ngoai.mjs và (nếu project chưa có)
// .claude/settings.json từ settings.template.json. File này là của KIT — `install.sh --update` sẽ ghi đè.
// Muốn thêm luật riêng của project: tạo .claude/hanh-dong-ngoai.local.json (của PROJECT, không bị ghi đè):
//   [["\\bpsql\\b.*prod", "psql vào DB production"], ["\\bkubectl\\s+apply\\b", "kubectl apply"]]
//
// Chỉ HỎI (permissionDecision "ask"), không chặn: chủ dự án vẫn đồng ý được ngay trong phiên.
// Lỗi của chính hook (JSON hỏng, file luật riêng hỏng) ⇒ cho qua + cảnh báo stderr: hook hỏng không được khoá
// mọi lệnh Bash của cả đội. Đây là lớp nhắc thứ hai, không thay lá chắn ở hạ tầng (quyền deploy, DB tách dev/prod — L2).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// [mẫu, mô tả]. Mẫu chạy trên TOÀN chuỗi lệnh, nên bắt được cả `cd app && git push`.
const LUAT = [
  [/\bgit\s+push\b/, "git push — đẩy code lên remote"],
  [/\bgh\s+(pr\s+merge|release\s+create)\b/, "gh pr merge / gh release create"],
  [/\bvercel(\s*$|\s*[;&|]|\s+(deploy|redeploy|promote|rollback|alias)\b)|\bvercel\b[^;&|]*\s--prod\b/, "vercel deploy"],
  [/\b(netlify\s+deploy|firebase\s+deploy|fly(ctl)?\s+deploy|railway\s+up|wrangler\s+(deploy|publish))\b/, "deploy lên hạ tầng"],
  [/\bsupabase\s+(db\s+(push|reset)|migration\s+(up|repair))\b/, "supabase — migration/ghi schema"],
  [/\bprisma\s+(migrate\s+(deploy|reset)|db\s+push)\b/, "prisma — migration/ghi schema"],
  [/\bdrizzle-kit\s+(push|migrate)\b/, "drizzle-kit — migration/ghi schema"],
  [/\b(npm|pnpm|yarn)\s+publish\b/, "phát hành gói npm"],
  [/\bnode\b[^;&|]*\bscripts\/[^\s;&|]+\.m?js\b[^;&|]*\s--apply\b/, "script dữ liệu chạy --apply (N33)"],
];

const canhBao = (m) => process.stderr.write(`[hoi-truoc-hanh-dong-ngoai] ${m}\n`);

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  canhBao("không đọc được JSON đầu vào — cho qua");
  process.exit(0);
}
if (input?.tool_name !== "Bash") process.exit(0);
const lenh = String(input.tool_input?.command ?? "");

const luat = [...LUAT];
const fileRieng = join(process.env.CLAUDE_PROJECT_DIR || input.cwd || ".", ".claude/hanh-dong-ngoai.local.json");
if (existsSync(fileRieng)) {
  try {
    for (const [mau, moTa] of JSON.parse(readFileSync(fileRieng, "utf8"))) luat.push([new RegExp(mau), moTa]);
  } catch (e) {
    canhBao(`bỏ qua ${fileRieng}: ${e.message}`);
  }
}

const trung = luat.find(([mau]) => mau.test(lenh));
if (!trung) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason:
        `Hành động ra ngoài: ${trung[1]}. N59 — chủ dự án phải đồng ý trước; ` +
        "kiểm tra đích (DB/môi trường nào), đã chạy khô chưa, có đường lùi chưa.",
    },
  }),
);
