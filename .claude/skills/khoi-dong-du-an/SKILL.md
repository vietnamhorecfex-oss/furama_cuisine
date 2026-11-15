---
name: khoi-dong-du-an
description: Đưa đội agency vào một project MỚI (hoặc một project đã có code nhưng chưa có nền nếp) — phỏng vấn chủ dự án, dựng nền móng mục L của NGUYEN-TAC, điền CLAUDE.md và danh sách luật bất biến đầu tiên. Dùng khi người dùng nói "khởi động dự án", "setup project mới", "bắt đầu project", "cài team vào đây", "onboard đội".
---

# Khởi động dự án

Mục tiêu: trước dòng code tính năng đầu tiên, project đã có đủ những thứ Furama phải trả giá vì làm muộn
(`docs/team/NGUYEN-TAC.md` mục L). Làm sau thì mỗi thứ tốn gấp nhiều lần — phải đi sửa lại từng route, từng script.

## Khi nào dùng

- Project vừa được tạo (thư mục trống hoặc chỉ có scaffold của framework).
- Project đã có code nhưng chưa có `CLAUDE.md` / spec / phép thử / envelope lỗi thống nhất.
- Vừa chạy `install.sh` của kit và cần "kích hoạt" đội.

## Các bước

1. **Khảo sát (chỉ khi đã có code).** Giao `kien-truc-su` (kèm agent Explore nếu repo lớn) đọc: cấu trúc thư mục,
   tầng dữ liệu, cách route xử lý lỗi, auth, i18n, cache, migration, script. Song song, chạy
   `git status`, `git log --oneline | head -20`, `ls docs scripts`, đọc `package.json`.
   *Xong khi:* có bản tóm tắt "đang có gì / thiếu gì so với mục L" ≤ 1 trang. KHÔNG ghi đè `CLAUDE.md` có sẵn —
   đề xuất phần bổ sung dưới dạng diff để chủ dự án duyệt.

1b. **Chọn nhánh + hồ sơ stack.** Đọc `docs/team/VERSION` (nhánh đã cài, stack `install.sh` nhận diện) và đối chiếu với
   thực tế vừa khảo sát. Loại dự án → nhánh: web công khai = cả 5 · công cụ nội bộ = Sản phẩm + Trải nghiệm + Nền tảng ·
   API/tự động hoá và chatbot/AI = Sản phẩm + Nền tảng · nội dung/chiến dịch = Tăng trưởng (Chất lượng + thư ký luôn
   có). Thiếu nhánh ⇒ `install.sh . --nhanh <ten>`; thừa ⇒ để nguyên hoặc xoá tay agent không dùng. Stack nhận sai hoặc
   chưa có hồ sơ ⇒ viết `docs/team/stacks/<ten>.md` theo khung `stacks/_KHUNG.md` của skill từ chính repo này (lệnh
   trong `package.json`/`Makefile`, nơi đặt luật, cách kiểm) và báo chủ dự án để góp ngược vào kit.
   *Xong khi:* `docs/team/stacks/` có hồ sơ khớp stack thật, và mục Lệnh của `CLAUDE.md` chạy được từng dòng.

2. **Phỏng vấn chủ dự án.** Hỏi gọn trong MỘT lượt (dùng câu hỏi có lựa chọn khi được), đừng hỏi lắt nhắt:
   - Sản phẩm: là gì, ai dùng (khách / nhân viên / đối tác), luồng kiếm tiền hoặc luồng quan trọng nhất.
   - Ngôn ngữ: ngôn ngữ code-comment + UI, các ngôn ngữ khách đọc, ngôn ngữ mặc định.
   - Stack + hạ tầng: framework, DB, nơi host, kho media, email/SMS. **Gói gì và hạn mức bao nhiêu** (N35).
   - Dữ liệu nhạy cảm: thông tin cá nhân, tiền, hoa hồng, sức khoẻ — luật pháp nào áp (vd NĐ 13/2023 ở VN).
   - Ai quyết **chính sách** (huỷ, hoàn tiền, phạt, quyền nhân viên) — tên vai trò, không đoán (N57).
   - Nguồn thiết kế có thẩm quyền (Figma, bản in, brand guide) và nguồn nội dung có thẩm quyền. Có trang công khai mà
     chưa có hướng thiết kế ⇒ ghi vào báo cáo: tính năng giao diện đầu tiên phải qua `giam-doc-sang-tao` mục A.
   - Kiến trúc: có dùng kiến trúc module MCA 2.0 không (`docs/team/templates/KIEN-TRUC-MCA.md`) — đề xuất CÓ nếu
     sản phẩm có nhiều vai trò/bộ phận hoặc sẽ sống lâu.
   - Trang công khai + tìm kiếm (L11): ai giữ tài khoản Google Business Profile, Bing Places, Search Console, Bing
     Webmaster (chưa có ⇒ việc trước ra mắt); hồ sơ ngoài nào là thật (để làm `sameAs`); **chính sách bot AI** — cho
     bot tìm kiếm/trích dẫn đọc không, cho bot huấn luyện đọc không (N78; giải thích: chặn bot trích dẫn = biến mất
     khỏi câu trả lời của ChatGPT/Perplexity). Đây là câu hỏi chính sách — ghi người quyết + ngày.
   - App di động: có không, nền tảng nào (Android/iOS), phát qua store hay cài tay (APK nội bộ), máy người dùng là gì,
     có cần báo động khi app ở nền không (iOS cần push server — N74).
   *Xong khi:* mọi câu đã có trả lời hoặc được ghi rõ "chưa quyết — hỏi lại khi tới tính năng X".

3. **Dựng nền móng mục L** (giao `van-hanh-trien-khai` + `ky-su-nghiep-vu`, chạy song song vì độc lập):
   - L1 `git init` (nếu chưa), nhánh tính năng, `.gitignore` chặn `.env*`, dump, file media gốc lớn.
   - L2 tách DB **dev / production** (ít nhất hai project/DB riêng); `.env.local` chỉ trỏ dev. Nếu chủ dự án
     chưa đồng ý tách, ghi rõ rủi ro N32 + N59 vào `CLAUDE.md`.
   - L3 test runner: `"test": "node --test"` trong `package.json` + thư mục `scripts/` cho `check-*.mjs`.
   - L5 `AGENTS.md` chỉ một dòng: `Xem CLAUDE.md — đây là nguồn hướng dẫn duy nhất.` (hoặc symlink).
   - L8 envelope lỗi từ route ĐẦU TIÊN: `lib/apiError.ts` (`errorJson`, `mapDbError`) + class `DbError` và
     `BusinessError` ở tầng dữ liệu (xem Mẫu).
   - Hook hỏi trước hành động ra ngoài (N59): `.claude/settings.json` nối `.claude/hooks/hoi-truoc-hanh-dong-ngoai.mjs`
     (install.sh cài sẵn; project đã có `settings.json` thì chép khối `hooks` từ `docs/team/templates/settings.template.json`).
   - L7 module rate limit `lib/loginThrottle.ts` (hai tầng: IP+tài khoản và IP), ghi rõ "in-memory, tạm".
   - Một module kết nối DB dùng chung cho mọi script: `scripts/_db.mjs` (đọc `.env.local`, bóc dấu nháy).
   - L9 nếu dùng MCA: khung thư mục + `CONTEXT.md` + ADR trục chia + phép kiểm ranh giới — theo `/kien-truc-module`.
   - L10 nếu có app di động: keystore release (sao lưu), cổng phiên bản public, `dist/` trong `.gitignore` — theo
     phần *Chuẩn bị một lần* của `/phat-hanh-apk`.
   *Xong khi:* cổng tĩnh của hồ sơ stack chạy được (Next.js: `npm run build`, `npm run lint`, `npm test` — kể cả khi
   chưa có test nào).

4. **Điền `CLAUDE.md`** từ `docs/team/templates/CLAUDE.template.md` (giao `thu-ky-tri-thuc`): Project, Lệnh,
   Kiến trúc tầng dữ liệu, Hợp đồng API, Ngôn ngữ, Hạ tầng + hạn mức, Quyết định chính sách.
   **Xoá hẳn** mục không áp dụng (Module MCA, App di động, kênh thông báo chưa dùng…) thay vì để placeholder —
   `CLAUDE.md` nạp vào MỌI phiên, mỗi KB thừa là token đốt ở mọi lượt.
   *Xong khi:* `wc -c CLAUDE.md` < 40000 (N05) và không còn placeholder `<…>` nào ngoài mục "chưa quyết".

5. **Lập danh sách luật bất biến đầu tiên** cùng chủ dự án (giao `kien-truc-su`): mỗi luật một dòng + vì sao.
   Ví dụ dạng: "Trạng thái đơn chỉ đổi qua động từ (N13)", "Mã giới thiệu suy từ phiên, bất biến (N16)",
   "Mọi cửa ghi đi qua `assert<Thu>Shape` (N15)". Project đã có code: chỉ ghi luật ĐANG đúng (kiểm được trong code,
   CI, ADR) — luật mong muốn mà code chưa giữ thì ghi vào "Còn nợ", không ghi như thể đã có; tính năng đầu tiên chọn
   việc nhỏ, ranh giới rõ, không phải "viết spec cho cả hệ thống". Ghi phiên bản 1.0 + ngày lập cho danh sách.
   *Xong khi:* có 5–15 luật, mỗi luật chỉ ra file sẽ chứa nó.

6. **Ghi các quyết định chính sách** đã chốt vào mục riêng của `CLAUDE.md`, mỗi dòng có "ai quyết · ngày ·
   đánh đổi đã biết". *Xong khi:* chủ dự án đọc lại và xác nhận.

## Checklist

- [ ] `git rev-parse --is-inside-work-tree` trả `true`; `.env*` có trong `.gitignore` (L1).
- [ ] `.env.local` không trỏ DB production — kiểm bằng cách đọc host trong biến DB (L2, N32).
- [ ] Lệnh phép thử của hồ sơ stack chạy được (Next.js: `npm test`) (L3, N37).
- [ ] `docs/team/VERSION` ghi đúng nhánh + stack; hồ sơ stack khớp thực tế; mục Lệnh của `CLAUDE.md` chạy được.
- [ ] `AGENTS.md` (nếu có) ≤ 3 dòng (L5, N04).
- [ ] Hook N59 sống: `echo '{"tool_name":"Bash","tool_input":{"command":"git push"}}' | node .claude/hooks/hoi-truoc-hanh-dong-ngoai.mjs`
      in ra `"permissionDecision":"ask"`, và `.claude/settings.json` có khối `hooks` trỏ tới file đó.
- [ ] `wc -c CLAUDE.md` < 40000 (L4, N05); soát `grep -n '<' CLAUDE.md` — placeholder `<…>` chỉ còn ở mục "chưa quyết"; mục không áp dụng đã xoá.
- [ ] Route API đầu tiên trả lỗi qua `errorJson` với envelope `{ error: { code, message } }` (L8, N21).
- [ ] Hạn mức từng dịch vụ ghi trong `CLAUDE.md` mục Hạ tầng (L6, N35).
- [ ] Có trang công khai: quyết định bot AI + người giữ Google Business/Search Console/Bing đã ghi trong `CLAUDE.md`
      mục SEO & GEO; `/kiem-tra-seo-geo` đã nằm trong kế hoạch trước ngày ra mắt (L11, N78, N80).
- [ ] Danh sách luật bất biến + quyết định chính sách đã được chủ dự án xác nhận (N57).

## Mẫu

`lib/db.ts` (hoặc tầng dữ liệu tương đương) — tách lỗi hạ tầng khỏi lỗi nghiệp vụ:

```ts
/** Lỗi hạ tầng (DB/mạng). Message thô chỉ vào log, không bao giờ ra client. */
export class DbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbError";
  }
}

/** Lỗi nghiệp vụ: `code` cho máy, `message` là câu cho người dùng. Không tồn tại / ngoài phạm vi ⇒ status 404. */
export class BusinessError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: 400 | 404 | 409 = 400,
  ) {
    super(message);
    this.name = "BusinessError";
  }
}
// Dùng: if (error) throw new DbError(error.message);
//       throw new BusinessError("NOT_FOUND", "Đơn không tồn tại", 404);
//       throw new BusinessError("DATE_CLOSED", "Ngày này đã kín bàn");
```

`lib/apiError.ts`:

```ts
import { NextResponse } from "next/server";
import { BusinessError, DbError } from "@/lib/db";

export function errorJson(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Phân loại theo NGUỒN lỗi bằng class (N21) — KHÔNG so khớp chữ trong message: đổi câu chữ hay dịch là ánh xạ sai.
 * Lỗi không thuộc class nào là bug chưa lường ⇒ 500 + câu chung, nguyên văn chỉ vào log (không đẩy ra màn hình).
 */
export function mapDbError(err: unknown) {
  if (err instanceof BusinessError) return errorJson(err.status, err.code, err.message);
  console.error(err instanceof DbError ? "[db]" : "[unexpected]", err);
  return errorJson(500, "INTERNAL_ERROR", "Lỗi máy chủ, vui lòng thử lại.");
}
```

Stack khác (Express, Fastify, Django…): giữ nguyên ba ý — class lỗi hạ tầng riêng, class lỗi nghiệp vụ mang `code`
+ status, và một hàm ánh xạ duy nhất phân loại theo class.

## Đầu ra

- `CLAUDE.md` đã điền, `AGENTS.md` một dòng, `lib/apiError.ts`, class `DbError` + `BusinessError`, `lib/loginThrottle.ts`,
  `scripts/_db.mjs`, script `test` trong `package.json`.
- Báo cáo cho chủ dự án: đã làm gì (theo mã L1–L8), điều gì chưa làm và vì sao, câu hỏi còn treo.
