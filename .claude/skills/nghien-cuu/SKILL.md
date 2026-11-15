---
name: nghien-cuu
description: Trả lời một câu hỏi lựa chọn kỹ thuật bằng bằng chứng — chốt câu hỏi và tiêu chí của dự án, đọc tài liệu đúng phiên bản, tìm bằng chứng chống, thử nhanh ngoài code sản phẩm, viết báo cáo có nguồn + ngày + phương án bị loại, rồi ghi quyết định thành ADR. Dùng khi người dùng nói "tìm hiểu", "nghiên cứu", "so sánh", "nên dùng thư viện nào", "lựa chọn nào tốt hơn", "có cách nào để", "đánh giá công nghệ", hoặc trước khi thêm một phụ thuộc hay dịch vụ mới vào project.
---

# Nghiên cứu

Quyết định kỹ thuật tệ nhất không phải quyết định sai, mà là quyết định không ai nhớ vì sao — nó bị đề xuất lại sáu
tháng sau, tốn thêm một vòng (N68). Và câu trả lời "theo trí nhớ" về phiên bản, giá, hạn mức thường là câu trả lời của
năm ngoái.

Mới từ bản 2.0, CHƯA qua dự án thật.

## Khi nào dùng

- Trước khi thêm phụ thuộc, dịch vụ ngoài, hay đổi một lớp kiến trúc.
- Bước tìm hiểu của `/danh-gia-y-tuong` (bằng chứng ngoài), bước 1 của `/tich-hop-dich-vu-ngoai` (hạn mức, giá).
- KHÔNG dùng để tìm một file hay một hàm trong repo — đó là tìm kiếm, làm thẳng.

## Các bước

1. **Chốt câu hỏi** thành MỘT quyết định: "chọn X hay Y cho việc Z trong dự án này" + ai quyết + hạn + đảo ngược được
   không. Tìm trong `docs/adr/`, `docs/nghien-cuu/`: câu này từng được trả lời chưa — có rồi thì đọc lý do cũ trước.
   *Xong khi:* câu hỏi viết được trong một dòng và có người quyết.

2. **Tiêu chí của dự án** — giao `nghien-cuu-vien`: hợp stack + phiên bản đang dùng (đọc file phụ thuộc thật), hạn mức
   gói hiện tại (N35), chi phí ở quy mô thật, công bảo trì, khoá nhà cung cấp, giấy phép, đường lùi (N36).
   *Xong khi:* 4–7 tiêu chí, mỗi cái kiểm được.

3. **Thu thập có nguồn**: tài liệu chính thức đúng phiên bản → mã nguồn/changelog/issue → bài đo có phương pháp. Mỗi dữ
   kiện ghi nguồn + ngày xem. Giá, hạn mức, model id, phiên bản mới nhất: tra hôm nay, không dùng trí nhớ.
   *Xong khi:* mọi ô trong bảng so sánh có nguồn hoặc nhãn `GIẢ ĐỊNH`.

4. **Bằng chứng chống** cho phương án đang nghiêng về + phương án "không thêm gì, dùng thứ đang có".
   *Xong khi:* mỗi phương án có ít nhất một điểm yếu thật.

5. **Thử nhanh** khi đọc không đủ để quyết: script/thư mục tạm NGOÀI code sản phẩm, trả lời đúng một câu; đo ≥ 3 lượt
   lấy median (N42); không dùng dữ liệu khách thật; dịch vụ tính tiền phải hỏi trước (N59). Dọn sau khi thử.
   *Xong khi:* kết quả thử ghi trong báo cáo kèm lệnh chạy lại; thư mục tạm đã xoá.

6. **Báo cáo** `docs/nghien-cuu/<YYYY-MM-DD>-<cau-hoi>.md`: khuyến nghị ở đầu · bảng so sánh · phương án bị loại + lý do ·
   đã thử gì · chưa biết gì · nguồn.

7. **CỔNG — người quyết chốt** (`kien-truc-su` cho kiến trúc; chủ dự án cho chi phí/nhà cung cấp/chính sách — N57).
   Quyết định khó đảo ngược ⇒ `kien-truc-su` ghi ADR từ `docs/team/templates/adr.template.md`; `thu-ky-tri-thuc` ghi
   luật + lý do vào `CLAUDE.md` (hạn mức, gói — mục Hạ tầng).
   *Xong khi:* báo cáo có dòng "Quyết: <phương án> — <ai> · <ngày>" và ADR nếu cần.

## Checklist

- [ ] Một câu hỏi = một quyết định; đã tra ADR/nghiên cứu cũ.
- [ ] Phiên bản trong tài liệu được trích khớp phiên bản project đang dùng (N03).
- [ ] Giá / hạn mức / model id có nguồn chính thức + ngày xem.
- [ ] Có bằng chứng chống và phương án "dùng thứ đang có"; phương án bị loại ghi lý do (N68).
- [ ] Thử nghiệm ngoài code sản phẩm, có số đo đúng phương pháp, đã dọn (N42, N59).
- [ ] Điều chưa kiểm mang nhãn `GIẢ ĐỊNH` hoặc nằm trong "Chưa biết" (N23, N40).
- [ ] Người quyết đã chốt; ADR cho quyết định khó đảo ngược; hạn mức mới vào `CLAUDE.md` (N35).

## Mẫu

Xem mục *Đầu ra* của agent `nghien-cuu-vien` — báo cáo theo đúng khung đó.

## Đầu ra

Báo cáo trong `docs/nghien-cuu/` + quyết định có người chốt + ADR (nếu khó đảo ngược) + mục tri thức cập nhật.
