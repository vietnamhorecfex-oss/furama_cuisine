---
name: xu-ly-su-co
description: Xử lý sự cố production đang ảnh hưởng người dùng thật — xác định mức độ, cầm máu bằng rollback hoặc nút khẩn cấp đã viết sẵn TRƯỚC khi tìm nguyên nhân, khoanh vùng từng tầng bằng curl, báo người liên quan, sửa gốc sau, viết hậu kiểm không đổ lỗi. Dùng khi người dùng nói "site sập", "production lỗi", "web chết", "khách không đặt được", "lỗi hàng loạt", "500 khắp nơi", "ảnh 404 hết", "API trả 402", "app không báo đơn", "mất dữ liệu", "sự cố", "khẩn cấp".
---

# Xử lý sự cố

Phần lớn nguyên tắc của đội sinh ra từ sự cố: 54/153 ảnh 404 trên site đang chạy — hai lần trong một ngày (N32);
vượt egress gói miễn phí ⇒ cả tổ chức nhận 402, app chết toàn phần dù dữ liệu còn nguyên (N35); rollback phân quyền
suýt biến nhân viên quầy thành toàn quyền vì trả code cũ trước khi khoá tài khoản (N36). Bài học chung: **khi đang
cháy, thứ tự là cầm máu → hiểu → sửa gốc → ghi lại**, không phải "sửa thẳng trên production cho nhanh".

## Khi nào dùng

- Người dùng thật đang bị ảnh hưởng NGAY LÚC NÀY: site/API/app không dùng được, lỗi hàng loạt, dữ liệu đang bị ghi sai,
  tiền/thư đang đi sai, lộ dữ liệu.
- Lỗi chỉ ở môi trường dev, hoặc ảnh hưởng một người và có đường vòng ⇒ `/sua-loi`, không phải quy trình này.

## Các bước

1. **Mức độ + một người cầm lái** (≤ 5 phút). Phân mức:
   - **S1** — sập toàn phần, mất/lộ dữ liệu, tiền đi sai, thư gửi sai hàng loạt.
   - **S2** — một luồng chính hỏng (đặt bàn, thanh toán, đăng nhập nhân viên), có/không đường vòng.
   - **S3** — xấu nhưng dùng được (chậm, một trang lỗi, ảnh thiếu).
   Ghi giờ bắt đầu (giờ địa điểm — N53) và mở **nhật ký sự cố** (Mẫu): mỗi hành động một dòng có giờ.
   *Xong khi:* có mức, có giờ bắt đầu, nhật ký đã mở.

2. **Cầm máu trước, hiểu sau.** Chọn cách lùi nhanh nhất ĐÃ VIẾT SẴN (N36), theo thứ tự ưu tiên:
   cờ tắt tính năng / biến môi trường ghim chế độ (vd `DB_MODE`) → rollback deploy về bản trước (Vercel "Promote",
   `git revert` + deploy) → bật trang bảo trì / chặn cửa ghi đang làm hỏng dữ liệu.
   - Đọc mục *Rollback* của spec gần nhất + mục hạ tầng của `CLAUDE.md`: có bước nào phải làm **TRƯỚC** khi trả code
     cũ (khoá tài khoản, tắt cờ, chạy lại migration ngược)? (N36)
   - Rollback code KHÔNG lùi migration: code cũ phải chịu được schema mới (migration additive — N31). Không chắc ⇒
     đừng rollback mù; chặn cửa ghi trước.
   - Mọi hành động ghi production phải được chủ dự án đồng ý — nhưng HỎI NGẮN, kèm đề xuất cụ thể: "Đề xuất rollback về
     deploy `abc123` (trước sự cố 40 phút), mất tính năng X tạm thời. Đồng ý?" (N59). Giao `van-hanh-trien-khai`.
   *Xong khi:* người dùng hết bị ảnh hưởng (kiểm bằng `curl`/trình duyệt như người dùng thật), hoặc đã ghi rõ vì sao
   chưa cầm được và đang thử cách nào.

3. **Khoanh vùng từng tầng** bằng thứ thật, không đoán: DNS/CDN → host (trang tĩnh) → API (`curl -i` một route đọc,
   một route ghi) → DB (truy vấn chỉ-đọc, trạng thái dịch vụ, schema cache) → kho media (`curl -I` một file) → dịch vụ
   ngoài (SMTP, AI, thanh toán — trang status của họ) → hạn mức gói (402/429 = gần như chắc là quota — N35). Đối chiếu
   với thay đổi gần nhất: `git log --since="2 days ago" --oneline`, lịch deploy, migration vừa chạy, script vừa
   `--apply`, cron vừa chạy, cấu hình vừa sửa trong admin.
   *Xong khi:* chỉ ra được tầng hỏng + thay đổi kích hoạt (hoặc ghi "chưa rõ" + giả thuyết còn lại).

4. **Báo người liên quan.** Chủ dự án biết từ bước 1. Sau khi cầm máu: một tin ngắn — đang ảnh hưởng ai, từ lúc nào,
   đã làm gì, còn rủi ro gì, cập nhật tiếp lúc nào. Có cần báo khách/đối tác (đơn bị mất, thư sai, dữ liệu lộ — xem
   NĐ 13/2023 nếu là dữ liệu cá nhân ở VN) ⇒ câu hỏi chính sách của chủ dự án, Claude chỉ soạn nháp (N57).
   *Xong khi:* người cần biết đã biết, kèm giờ cập nhật tiếp.

5. **Dữ liệu trong thời gian sự cố.** Đếm bằng truy vấn chỉ-đọc: bao nhiêu bản ghi ghi sai / thiếu / trùng, bao nhiêu
   thư/tin đã gửi sai, từ giờ nào tới giờ nào. Sửa dữ liệu chỉ qua `/script-du-lieu` (chạy khô, có đồng ý) — không
   UPDATE tay trên production (N33). Thư đã gửi thì không thu hồi được: ghi lại để chủ dự án quyết có gửi đính chính.
   *Xong khi:* có con số và kế hoạch xử lý được duyệt.

6. **Sửa gốc** khi đã hết cháy — theo `/sua-loi` (phép thử đỏ, cửa anh em), rồi `/migration-va-trien-khai` để đưa lên.
   Gỡ biện pháp tạm (cờ tắt, trang bảo trì) sau khi bản sửa đã kiểm thật trên production.
   *Xong khi:* biện pháp tạm đã gỡ, ma trận kiểm hạ tầng liên quan xanh (N41).

7. **Hậu kiểm không đổ lỗi** — giao `thu-ky-tri-thuc` theo `/ghi-bai-hoc`, trong 24–48 giờ: dòng thời gian, tác động
   (con số), gốc rễ, vì sao phép kiểm/cảnh báo không bắt sớm hơn, điều gì giúp cầm máu nhanh, việc cần làm (mỗi việc có
   người + hạn). Thêm cạm bẫy vào đúng mục `CLAUDE.md`; thiếu nút khẩn cấp ⇒ viết ra ngay (N36); thiếu cảnh báo ⇒ đặt
   (N24, N35). Lớp lỗi dùng chung mọi dự án ⇒ đề xuất Nxx mới.
   *Xong khi:* hậu kiểm được chủ dự án đọc, việc cần làm đã thành task.

## Không được làm

- Không sửa code trực tiếp trên production hay deploy bản vá chưa qua cổng tĩnh "cho nhanh" khi rollback đã đủ cầm máu.
- Không chạy script `--apply`, `--force`, xoá trên kho, chuyển chế độ DB khi chưa xem trạng thái và chưa có đồng ý
  cho ĐÚNG lần đó (N33, N59).
- Không tuyên bố "đã ổn" khi chưa kiểm như người dùng thật — dòng "deploy thành công" không phải bằng chứng (N40).
- Không đổ lỗi cho người trong hậu kiểm; hỏi "hệ thống nào để lỗi này lọt", không hỏi "ai làm".

## Checklist

- [ ] Mức độ + giờ bắt đầu + nhật ký có giờ cho mọi hành động.
- [ ] Cầm máu bằng đường lùi viết sẵn; đã làm các bước phải-làm-trước của mục Rollback (N36).
- [ ] Rollback code không gặp schema mới không tương thích (N31).
- [ ] Mỗi hành động ghi production có đồng ý của chủ dự án (N59).
- [ ] Tầng hỏng được chứng minh bằng `curl`/truy vấn, không đoán (N40).
- [ ] Số bản ghi/thư/người bị ảnh hưởng đã đếm; việc báo khách do chủ dự án quyết (N57).
- [ ] Gốc đã sửa theo `/sua-loi`; biện pháp tạm đã gỡ; ma trận kiểm xanh (N41).
- [ ] Hậu kiểm có việc cần làm kèm người + hạn; `CLAUDE.md` có cạm bẫy mới (N01, N02).

## Mẫu

```markdown
## Sự cố <YYYY-MM-DD> — <mô tả một dòng> — S1

**Ảnh hưởng:** khách không đặt bàn được (POST /api/bookings 500) · 14:05 → 14:52 (giờ VN) · ~23 lượt thất bại
**Nhật ký:**
- 14:05 cảnh báo / chủ dự án báo
- 14:09 `curl -i $PROD/api/bookings` → 500 `column "deposit" does not exist`
- 14:12 nghi deploy 13:58 (`abc123`) đọc cột mới; migration 0048 CHƯA chạy production (N31)
- 14:15 đề xuất: chạy 0048 (additive) thay vì rollback — chủ dự án đồng ý 14:18
- 14:21 0048 ĐÃ CHẠY trên DB chính + DB phụ; reload schema cache
- 14:24 `curl` POST đặt bàn thử (ngày +40, `+tag`) → 201 ✓; đã xoá bản ghi thử
**Gốc:** checklist deploy thiếu bước "migration trước deploy" cho DB phụ.
**Dữ liệu:** 23 lượt thất bại không ghi gì (đã đếm log); 0 bản ghi hỏng.
**Việc cần làm:** thêm DB phụ vào ma trận migration (van-hanh, 05/11) · cảnh báo 5xx > 1% (chủ dự án chọn kênh)
```

## Đầu ra

Nhật ký sự cố có giờ, xác nhận đã cầm máu bằng thứ thật, con số tác động, bản sửa gốc (qua `/sua-loi`), hậu kiểm có việc
cần làm.
