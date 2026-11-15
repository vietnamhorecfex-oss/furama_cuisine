---
name: chien-dich-noi-dung
description: Làm một đợt nội dung nhiều kênh từ một nguồn sự thật — bài viết, email/newsletter, bài mạng xã hội, trang đích — có mục tiêu đo được, lịch đăng, mọi dữ kiện (giá, giờ, ưu đãi, ngày) lấy từ một bảng đã được chủ dự án xác nhận, bản dịch, link có gắn nguồn để đo, kiểm thật trước khi gửi và báo cáo sau đợt. Dùng khi người dùng nói "chiến dịch", "campaign", "newsletter", "email marketing", "bài đăng Facebook", "content calendar", "lịch nội dung", "khuyến mãi", "ra mắt", "mùa lễ", "viết bài quảng bá".
---

# Chiến dịch nội dung

Một ưu đãi xuất hiện ở năm chỗ (trang đích, email, ba bài mạng xã hội) là năm cơ hội để ghi năm con số khác nhau — và
email đã gửi thì không rút lại được. Quy trình này áp N10 (một nguồn sự thật) và N59 (hành động ra ngoài phải hỏi) cho
nội dung: dữ kiện viết MỘT lần trong bảng dữ kiện, mọi kênh chép từ đó, và không gì rời khỏi máy khi chủ dự án chưa duyệt.

Mới từ bản 2.0, CHƯA qua dự án thật dưới dạng quy trình này; luật nội dung lấy từ N23, N55, N56, N77, N79.

## Khi nào dùng

- Một đợt nội dung có từ 2 kênh trở lên, hoặc một email gửi cho danh sách khách thật.
- Một bài blog đơn lẻ ⇒ giao thẳng `bien-tap-noi-dung`. Kiểm kỹ thuật SEO toàn site ⇒ `/kiem-tra-seo-geo`.

## Các bước

1. **Mục tiêu + người nhận** — hỏi chủ dự án MỘT lượt: muốn người đọc LÀM gì (đặt bàn, đăng ký, mua voucher) · đo bằng
   gì · gửi cho ai (danh sách nào, đã đồng ý nhận chưa — luật dữ liệu cá nhân) · thời gian · ngân sách · giọng thương hiệu ·
   ai duyệt cuối. *Xong khi:* có một con số mục tiêu và tên người duyệt.

2. **Bảng dữ kiện — MỘT nguồn** (`docs/noi-dung/<dot>/du-kien.md`): mỗi dòng một dữ kiện — giá, % giảm, điều kiện, ngày
   bắt đầu/kết thúc (kèm múi giờ địa điểm — N53), giờ mở cửa, địa chỉ, số điện thoại (khớp nguồn NAP — N77), mã ưu đãi,
   link đích. Mỗi dòng ghi NGUỒN (CMS, chủ dự án xác nhận ngày nào). **CỔNG — chủ dự án xác nhận bảng** trước khi viết chữ nào.

3. **Kế hoạch kênh + lịch**: bảng `kênh · định dạng · ngày giờ đăng · thông điệp chính · lời kêu gọi · link (có gắn nguồn
   để đo) · người đăng`. Mỗi kênh một vai trò — không chép một đoạn văn sang năm chỗ.

4. **Viết** — giao `bien-tap-noi-dung`: mọi con số chép từ bảng dữ kiện, không gõ lại theo trí nhớ. Trang đích/bài viết:
   trả lời trước, dữ kiện cụ thể (N79). Email: tiêu đề, dòng xem trước, một lời kêu gọi chính, bản chữ thuần, link huỷ
   đăng ký. Bài mạng xã hội: theo giới hạn từng nền tảng. Ảnh đúng nội dung, có `alt` (N56).

5. **Dịch + hiển thị** — `chuyen-gia-da-ngu` cho các ngôn ngữ khách đọc (bản dịch là bản NHÁP có guard — N54; số, ngày,
   tiền theo định dạng từng ngôn ngữ). Email HTML dựng theo hồ sơ stack `html-email` (bố cục bảng, CSS nội dòng, ảnh URL
   tuyệt đối). Trang đích là trang công khai ⇒ `chuyen-gia-seo-geo` (metadata, JSON-LD không khai man — N23).

6. **Kiểm thật trước khi gửi** — `kiem-dinh-vien`:
   - đối chiếu TỪNG dữ kiện trong mọi kênh với bảng dữ kiện (lệch một chữ số là KHÔNG ĐẠT);
   - bấm mọi link: tới đúng trang, trang đang sống, có gắn nguồn đo; link huỷ đăng ký chạy;
   - email: mở ở khổ 600px + điện thoại, chế độ tối nếu mẫu có; gửi thử tới địa chỉ `+tag` của chủ dự án — CHỈ khi được
     đồng ý, và danh sách thật chưa được nạp (N59);
   - mã ưu đãi dùng thử được ở hệ thống thật (hoặc ghi "Chưa kiểm");
   - ngày hết hạn đúng múi giờ địa điểm.

7. **CỔNG — chủ dự án duyệt bản cuối**. Gửi/đăng/lên lịch là hành động ra ngoài: người duyệt bấm, hoặc đồng ý rõ từng
   kênh trước khi agent thao tác (N59). Email đã gửi không sửa được — kiểm xong mới nạp danh sách thật.

8. **Sau đợt**: đo mục tiêu (lượt mở/bấm theo nguồn, lượt đặt/mua), ghi bảng kết quả + điều rút ra vào
   `docs/noi-dung/<dot>/ket-qua.md`; gỡ/cập nhật nội dung hết hạn (trang đích hết ưu đãi ⇒ sửa hoặc redirect — N76);
   bài học → `/ghi-bai-hoc`.

## Checklist

- [ ] Có mục tiêu đo được, người duyệt, và cơ sở để gửi cho danh sách (đã đồng ý nhận).
- [ ] Bảng dữ kiện một nguồn, mỗi dòng có nguồn; chủ dự án đã xác nhận TRƯỚC khi viết (N10, N57).
- [ ] Mọi kênh khớp bảng dữ kiện từng ký tự số; không khẳng định điều chưa xác nhận (N23).
- [ ] Mọi link sống, đúng đích, có gắn nguồn đo; không đưa dữ liệu cá nhân lên URL.
- [ ] Email có link huỷ đăng ký + bản chữ thuần; ảnh có `alt`, URL tuyệt đối (N56).
- [ ] Bản dịch đã soát; ngày giờ theo địa điểm (N53, N54).
- [ ] Gửi thử chỉ tới địa chỉ thử, có sự đồng ý; danh sách thật nạp SAU khi duyệt (N59).
- [ ] Báo cáo tách "Đã kiểm chứng" / "Chưa kiểm" (N40); chủ dự án duyệt bản cuối và là người cho phép gửi.
- [ ] Sau đợt: có bảng kết quả; nội dung hết hạn đã xử lý (N76).

## Mẫu

```markdown
# Dữ kiện — Đợt Tết 2027 (xác nhận: <chủ nhà hàng> · 14/11/2026)
| # | Dữ kiện | Giá trị | Nguồn |
|---|---|---|---|
| F1 | Thời gian áp dụng | 25/01–10/02/2027 (giờ Việt Nam), hết 22:00 ngày 10/02 | chủ dự án 14/11 |
| F2 | Ưu đãi | giảm 15% thực đơn set, không áp đồ uống | chủ dự án 14/11 |
| F3 | Mã | TET27 — mỗi khách một lần | CMS › Ưu đãi |
| F4 | Link đích | /vi/tet-2027?utm_source=<kenh>&utm_campaign=tet27 | — |

| Kênh | Ngày giờ | Thông điệp | Lời kêu gọi | Dữ kiện dùng |
|---|---|---|---|---|
| Trang đích | 18/01 | thực đơn Tết + ưu đãi | Đặt bàn | F1–F4 |
| Email | 20/01 09:00 | mở đặt sớm cho khách cũ | Đặt bàn | F1, F2, F3 |
| Facebook ×3 | 20, 24, 28/01 | món / không khí / nhắc hạn | Xem thực đơn | F1, F2 |
```

## Đầu ra

Bảng dữ kiện đã xác nhận, kế hoạch kênh + lịch, nội dung từng kênh (đã dịch), báo cáo kiểm trước khi gửi, quyết định
duyệt của chủ dự án, và bảng kết quả sau đợt.
