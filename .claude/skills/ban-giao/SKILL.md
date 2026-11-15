---
name: ban-giao
description: Bàn giao một sản phẩm hoặc một đợt phát hành cho khách hàng / người vận hành — nghiệm thu theo kịch bản người dùng, tài liệu hướng dẫn sử dụng theo vai, sổ vận hành (chạy ở đâu, sao lưu, khôi phục, báo động), danh sách tài khoản + quyền + dịch vụ + hạn mức + ngày gia hạn, chuyển quyền sở hữu, danh sách còn nợ, biên bản có chữ ký. Dùng khi người dùng nói "bàn giao", "nghiệm thu", "UAT", "giao cho khách", "hướng dẫn sử dụng", "tài liệu vận hành", "đào tạo người dùng", "go-live", "kết thúc dự án", "chuyển cho đội khác".
---

# Bàn giao

Một sản phẩm "xong" với đội mà khách không tự vận hành được thì chưa xong: tài khoản dịch vụ đứng tên người làm, tên
miền sắp hết hạn không ai biết, bản sao lưu chưa ai thử khôi phục, và người dùng thật chưa từng được chỉ cách dùng. Bàn
giao là lúc những thứ chỉ nằm trong đầu đội phải nằm trên giấy — và là lúc nói thật phần còn nợ (N58).

Mới từ bản 2.0, CHƯA qua dự án thật dưới dạng quy trình này.

## Khi nào dùng

- Trước khi người dùng thật bắt đầu dùng (go-live), khi kết thúc một giai đoạn hợp đồng, khi chuyển cho đội khác bảo trì.
- Đợt phát hành nhỏ giữa chừng ⇒ chỉ làm bước 1, 2 và cập nhật phần đổi trong tài liệu.

## Các bước

1. **Phạm vi bàn giao** — `truong-san-pham` lập bảng từ spec/lộ trình: mỗi YC/lát → Đã giao · Giao một phần · Chưa làm
   (lý do). Lấy trạng thái từ báo cáo kiểm định, không từ trí nhớ. *Xong khi:* chủ dự án đọc bảng và đồng ý đây là phạm vi.

2. **Nghiệm thu theo kịch bản người dùng** (UAT): mỗi vai (khách, lễ tân, quản lý…) một bộ kịch bản từ "Thành công khi" +
   Cho/Khi/Thì của các spec, viết bằng lời người dùng. NGƯỜI CỦA KHÁCH HÀNG chạy trên môi trường thật (hoặc bản giống
   thật), đội chỉ ghi lại: đạt / không đạt / "đúng spec nhưng vẫn vướng". Không đạt ⇒ `/sua-loi`; vướng ⇒ việc mới trong
   danh sách việc, không sửa lén. *Xong khi:* mỗi kịch bản có kết quả + người chạy + ngày.

3. **Hướng dẫn sử dụng theo vai** — `bien-tap-noi-dung` viết `docs/huong-dan/<vai>.md`: việc hằng ngày từng bước (ảnh chụp
   màn hình thật từ bản đang chạy), việc hiếm gặp, lỗi thường gặp + làm gì (lấy đúng câu lỗi trong sản phẩm), điều KHÔNG
   nên làm. `kiem-dinh-vien` đi lại từng bước theo đúng tài liệu trên hệ thống thật — bước nào không làm theo được là tài
   liệu sai (N03).

4. **Sổ vận hành** — `van-hanh-trien-khai` viết `docs/tri-thuc/van-hanh.md`: chạy ở đâu · deploy thế nào + rollback ·
   migration · cron/việc định kỳ · sao lưu (ở đâu, bao lâu một lần) · **khôi phục đã THỬ THẬT** ngày nào, mất bao lâu ·
   báo động + nên làm gì (`/dung-ci-giam-sat`) · nút khẩn cấp (N36) · liên hệ khi sự cố.
   *Xong khi:* có dòng "khôi phục thử ngày DD/MM: đạt, N phút" — chưa thử thì ghi vào "Chưa kiểm", không ghi "có sao lưu".

5. **Sổ tài sản + quyền**: bảng mọi thứ dự án phụ thuộc — tên miền, DNS, nơi host, DB, kho ảnh, email, SMS, thanh toán,
   AI, analytics, cửa hàng ứng dụng, khoá ký APK (N72), kho mã. Mỗi dòng: tài khoản đứng tên AI · ai có quyền quản trị ·
   gói + hạn mức (N35) · ngày gia hạn · cách thanh toán. **KHÔNG ghi mật khẩu/khoá vào tài liệu** — ghi nơi cất (trình
   quản lý mật khẩu của khách) (N30).

6. **Chuyển quyền sở hữu** — hành động ra ngoài, làm khi chủ dự án đồng ý từng mục (N59): tài khoản dịch vụ về tên khách,
   thêm quản trị viên của khách, gỡ quyền cá nhân của đội không còn cần, đổi bí mật đã từng qua tay nhiều người, tài khoản
   thử/dữ liệu thử đã dọn. *Xong khi:* cột "đứng tên" trong sổ tài sản không còn tên cá nhân của đội — hoặc có lý do + hạn.

7. **Còn nợ + rủi ro đã biết** (N58): thứ đang là bản tạm (rate limit in-memory, chưa có staging…), yêu cầu chưa làm, giới
   hạn đã biết, việc nên làm trong 3 tháng tới — mỗi dòng có hậu quả nếu để nguyên.

8. **Buổi bàn giao + biên bản** `docs/ban-giao/<YYYY-MM-DD>-bien-ban.md`: phạm vi (bước 1) · kết quả nghiệm thu (bước 2) ·
   danh mục tài liệu · sổ tài sản · còn nợ · điều khoản hỗ trợ sau bàn giao (ai, bao lâu, kênh nào — chủ dự án quyết) ·
   **CỔNG — hai bên xác nhận** (tên + ngày). `thu-ky-tri-thuc` cập nhật `CLAUDE.md`: ai sở hữu gì từ ngày nào.

## Checklist

- [ ] Bảng phạm vi lấy từ báo cáo kiểm định; phần chưa làm ghi rõ, không lẫn vào "đã giao".
- [ ] UAT do người của khách chạy, có tên + ngày; mục không đạt đã thành việc.
- [ ] Mỗi vai có hướng dẫn; đã đi lại từng bước trên hệ thống thật theo đúng tài liệu (N03, N40).
- [ ] Khôi phục từ bản sao lưu đã thử thật, có ngày + thời gian — hoặc nằm trong "Chưa kiểm".
- [ ] Sổ tài sản đủ mọi dịch vụ, có ngày gia hạn + hạn mức; không chứa mật khẩu/khoá (N30, N35).
- [ ] Không tài sản nào còn đứng tên cá nhân của đội mà không có lý do + hạn; mỗi lần chuyển quyền đã được đồng ý (N59).
- [ ] Bí mật từng chia sẻ rộng đã đổi; tài khoản thử và dữ liệu thử đã dọn.
- [ ] Danh sách còn nợ có hậu quả từng dòng (N58).
- [ ] Biên bản có xác nhận hai bên; `CLAUDE.md` ghi chủ sở hữu mới.

## Mẫu

```markdown
| Tài sản | Đứng tên | Quản trị | Gói · hạn mức | Gia hạn | Ghi chú |
|---|---|---|---|---|---|
| Tên miền | công ty khách | <tên> | — | 03/2027 | tự gia hạn: BẬT |
| DB | công ty khách (chuyển 12/11) | <tên>, đội (tới 31/12) | Free · 500MB, đang 61% | — | cảnh báo ở 80% |
| Khoá ký APK | công ty khách | <tên> | — | — | cất ở <trình quản lý mật khẩu>; mất là không cập nhật được app (N72) |

| Kịch bản UAT | Vai | Người chạy · ngày | Kết quả |
|---|---|---|---|
| Khoá ngày 4F rồi thử đặt bàn ngày đó | lễ tân | <tên> · 13/11 | đạt |
| Xuất danh sách khách tuần | quản lý | <tên> · 13/11 | đúng spec nhưng vướng: thiếu cột số điện thoại → việc mới #41 |
```

## Đầu ra

Bảng phạm vi, kết quả UAT, hướng dẫn theo vai, sổ vận hành, sổ tài sản + quyền, danh sách còn nợ, biên bản bàn giao có
xác nhận, `CLAUDE.md` cập nhật.
