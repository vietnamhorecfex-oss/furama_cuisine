---
name: tich-hop-dich-vu-ngoai
description: Nối một dịch vụ bên ngoài — email/SMTP, SMS/Zalo, kho ảnh (Cloudinary/S3/Storage), AI/dịch máy, analytics/pixel, thanh toán — theo khuôn an toàn — cấu hình bí mật, nút Gửi thử, import động, timeout cứng, trạng thái trung thực, hạn mức là ràng buộc thiết kế, đường lùi. Dùng khi người dùng nói "tích hợp", "nối API", "gửi email", "gửi SMS", "upload ảnh lên", "thêm Google Analytics/Pixel", "thanh toán", "gọi AI".
---

# Tích hợp dịch vụ ngoài

Dịch vụ ngoài hỏng theo ba kiểu: hỏng ồn (lỗi rõ), hỏng im lặng (báo thành công mà không làm), và hỏng vì hết hạn
mức (cả site chết). Ở Furama đã gặp đủ ba: thư ghi "đã gửi" cho khách không có email (N19), file thứ hai upload
"thành công" nhưng kho trả về file thứ nhất (N56), DB gói Free vượt egress trả 402 cho cả tổ chức (N35).

## Khi nào dùng

Trước khi viết dòng code đầu tiên gọi một dịch vụ bên ngoài, và khi đổi nhà cung cấp/gói.

## Các bước

1. **Hạn mức trước, code sau** — giao `van-hanh-trien-khai`: ghi gói đang dùng, hạn mức từng loại (lưu trữ, băng
   thông, request, transformation, egress, số thư/ngày, trần kích thước file), và ước lượng tiêu thụ theo lượt xem
   thật. Cái gì đang ăn hạn mức thì đo, đừng đoán (N35). Ghi vào `CLAUDE.md` mục Hạ tầng.
2. **Cấu hình là secret** — giao `ky-su-nghiep-vu`:
   - Đọc env trước, DB setting sau (env thắng DB, một nguồn phải thắng dứt khoát).
   - Setting bí mật nằm trong danh sách khoá bị lọc khỏi mọi API/form đọc (N30).
   - Giá trị còn chứa `<` `>` (của file mẫu) coi như CHƯA điền.
   - ID nội suy vào script/HTML (GA, Pixel, khoá công khai) qua whitelist định dạng; sai ⇒ không render (N28).
3. **Ruột gọi dịch vụ** đặt trong `lib/<dich-vu>/`:
   - **Import động** thư viện nặng (`await import("nodemailer")`) — module tầng dữ liệu bị mọi trang tĩnh nạp lúc
     build, import tĩnh kéo thư viện vào bundle của mọi trang.
   - Ưu tiên `fetch` + `node:crypto` khi API đơn giản (ký request) thay vì SDK nặng.
   - **Timeout cứng**: tuỳ chọn timeout của thư viện + `Promise.race` làm trần. Ghi rõ: race KHÔNG huỷ request — quá
     trần mà dịch vụ vẫn làm xong là "ghi lỗi nhưng đã gửi"; trần phải lớn hơn thời gian bình thường đo thật.
   - Phân loại lỗi tạm thời (timeout/abort/429/5xx/mạng) khác lỗi cấu hình (401/403/404) — sai một nhánh là hỏng
     cả lô (N54).
4. **Trạng thái trung thực** (N19): ghi log mỗi lần gọi với `sent | skipped | failed` + lý do máy đọc
   (`no_address`, `no_provider`, `not_configured`) + câu lỗi nguyên văn (cắt ngắn). Chưa cấu hình thì KHÔNG đổi trạng
   thái nghiệp vụ nào. **Không âm thầm đổi kênh** (khách chọn Zalo mà nhận email là sai) — ghi `skipped`.
5. **Không bao giờ ném** khi chạy sau một lần ghi DB (N20). Hàm gọi dịch vụ bọc try/catch toàn thân, kể cả phần ghi log.
6. **Nút Gửi thử** trong trang cấu hình: gọi thật (gửi một thư / upload ảnh 1×1 rồi xoá), trả **nguyên câu lỗi** của
   dịch vụ ("535 sai mật khẩu" nói nhiều hơn "gửi thất bại") (N30).
7. **Đọc lại đặc tính sau khi đẩy** (media): khổ, định dạng, alpha, đúng file — không tin mã 200; hai file khác nhau
   quy về một khoá (`x.jpg`/`x.png` cùng `public_id`) ⇒ DỪNG và báo (N56).
8. **Quyền riêng tư**: không đưa PII (email, SĐT, tên) lên URL — URL lọt vào analytics, log, referrer. Script theo
   dõi đặt ở layout trang công khai, không ở trang nội bộ (trộn thao tác nhân viên vào số liệu khách).
9. **Đường lùi**: dịch vụ chết thì gì xảy ra? Ghi trong spec (vd media lùi về file local; email lỗi thì đơn vẫn tạo,
   cờ "cần gọi báo khách"; DB chính 402 thì đọc từ DB phụ) (N36).
10. **Thử gửi thật có lá chắn** (N59): địa chỉ `+tag` của chủ dự án; tạm gỡ CC tới nhân viên thật; xong trả lại.

## Checklist

- [ ] Hạn mức gói ghi trong `CLAUDE.md`, có ước lượng tiêu thụ (N35).
- [ ] Bí mật không xuất hiện trong bất kỳ response API đọc nào (`curl` trang/API cấu hình và grep khoá) (N30).
- [ ] `grep -rn "from \"<thu-vien-nang>\"" lib app` = 0 dòng import tĩnh ở module dùng chung.
- [ ] Có timeout cứng; đã đo thời gian bình thường để chọn trần.
- [ ] Log ghi đúng `sent/skipped/failed` + lý do; đã thử ca chưa cấu hình (N19).
- [ ] Hàm gọi dịch vụ không ném (thử: tắt mạng/sai khoá → nghiệp vụ vẫn xong) (N20).
- [ ] Nút Gửi thử trả nguyên lỗi.
- [ ] ID nội suy có whitelist (N28); không PII trên URL.
- [ ] Đường lùi ghi trong spec (N36).

## Mẫu

```ts
// lib/notify/email.ts — import động, timeout cứng, không bao giờ ném.
export type SendResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "no_address" | "not_configured" }
  | { status: "failed"; error: string };

const TIMEOUT_MS = 8000;

export async function sendEmail(to: string | null, subject: string, text: string): Promise<SendResult> {
  if (!to) return { status: "skipped", reason: "no_address" };
  const cfg = await getSmtpConfig(); // env > secret setting; giá trị "<…>" coi như trống
  if (!cfg) return { status: "skipped", reason: "not_configured" };
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({ ...cfg, connectionTimeout: TIMEOUT_MS, socketTimeout: TIMEOUT_MS });
    const info = await Promise.race([
      transport.sendMail({ from: cfg.from, to, subject, text }),
      new Promise<never>((_, rej) => {
        timer = setTimeout(() => rej(new Error(`Quá ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS);
      }),
    ]);
    return { status: "sent", id: info.messageId };
  } catch (err) {
    return { status: "failed", error: String(err instanceof Error ? err.message : err).slice(0, 300) };
  } finally {
    clearTimeout(timer);
  }
}
// Người gọi ghi SendResult vào bảng log (cột status, error, to_address) — đó là nguồn của bảng "đã gửi".
```

## Đầu ra

Module dịch vụ + panel cấu hình có Gửi thử + ghi log trạng thái + mục Hạ tầng (hạn mức, đường lùi) trong tri thức.
