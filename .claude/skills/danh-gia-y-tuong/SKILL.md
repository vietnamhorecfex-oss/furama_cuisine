---
name: danh-gia-y-tuong
description: Đánh giá một ý tưởng TRƯỚC khi viết spec — ai cần, đang xoay xở thế nào, bằng chứng ủng hộ và chống, các phương án kể cả "không làm" và "làm tay trước", đo thành công bằng gì — rồi kết luận LÀM / CẦN LÀM RÕ / DỪNG để chủ dự án chốt. Dùng khi người dùng nói "có nên làm không", "ý tưởng mới", "khách muốn thêm", "đối thủ có tính năng này", "đáng làm không", "MVP là gì", hoặc khi một yêu cầu tới mà không kèm tình huống thật nào.
---

# Đánh giá ý tưởng

Spec tốt cho một tính năng không ai cần vẫn là công bỏ đi — và nó còn để lại code phải bảo trì. Bước này rẻ hơn mọi bước
sau nó, và "DỪNG" là một kết quả tốt: nó trả lại thời gian cho việc đáng làm hơn.

Phỏng theo quy trình đánh giá của github/spec-kit (MIT). Mới từ bản 2.0, CHƯA qua dự án thật.

## Khi nào dùng

- Ý tưởng/yêu cầu chưa rõ ai cần, hoặc lý do là "đối thủ có", "chắc khách thích".
- Việc ước cỡ Vừa trở lên mà chưa có tình huống thật đứng sau.
- KHÔNG dùng cho: lỗi, sự cố, việc pháp lý/bắt buộc, việc chủ dự án đã quyết làm và đã nêu tình huống thật ⇒ đi thẳng
  `/quy-trinh-tinh-nang`.

## Các bước

1. **Tiếp nhận** — giao `truong-san-pham`: ghi nguyên văn yêu cầu, ai nêu, tình huống thật (chuyện gì đã xảy ra, bao
   nhiêu lần, với ai). *Xong khi:* có ít nhất một tình huống thật, hoặc đã hỏi chủ dự án và ghi "chưa có".

2. **Tìm hiểu** (song song): `truong-san-pham` gom bằng chứng trong nhà (số liệu sử dụng, phản hồi khách, sổ ca, phiếu hỗ
   trợ); `nghien-cuu-vien` gom bằng chứng ngoài nếu cần (đối thủ làm thế nào, có dịch vụ sẵn không, chi phí). BẮT BUỘC
   tìm cả bằng chứng CHỐNG. Điều không có nguồn mang nhãn `GIẢ ĐỊNH`.
   *Xong khi:* mỗi nhận định có nguồn hoặc nhãn `GIẢ ĐỊNH`; có ít nhất một bằng chứng chống đã xét.

3. **Xác định**: người dùng nào, việc họ cố làm, hậu quả nếu không làm, và **thành công đo bằng gì** (con số hoặc hành vi
   quan sát được). *Xong khi:* tiêu chí thành công không chứa tính từ không đo được.

4. **Phương án** (2–4): luôn có "không làm" và "làm tay trước" (bảng tính, quy trình vận hành, công cụ sẵn có). Mỗi
   phương án: lát nhỏ nhất có giá trị · cỡ nhỏ/vừa/lớn (hỏi `kien-truc-su` khi không chắc) · chi phí vận hành về sau ·
   rủi ro · điều phải bỏ.
   *Xong khi:* mỗi phương án có cỡ và ít nhất một điểm yếu thật.

5. **Chấm**: mỗi tiêu chí (giá trị cho người dùng · bằng chứng · độ khả thi · chi phí về sau · hợp hướng sản phẩm) chấm
   **mạnh / đủ / yếu / chưa biết**. Kết luận:
   - **LÀM** — mọi tiêu chí từ "đủ" trở lên. Kèm tóm tắt bàn giao cho spec.
   - **CẦN LÀM RÕ** — còn "chưa biết" đổi được kết luận. Kèm câu hỏi cho chủ dự án (một lượt, có đề xuất — N57) hoặc
     việc tìm hiểu thêm. Trả lời xong thì SỬA bản đánh giá này, không làm lại từ đầu.
   - **DỪNG** — có tiêu chí "yếu" không cứu được. Kèm lý do + điều kiện mở lại.

6. **CỔNG — chủ dự án chốt** kết luận. Ghi vào `docs/san-pham/<YYYY-MM-DD>-<ten>-danh-gia.md` và cập nhật
   `docs/san-pham/viec-can-lam.md` (kể cả việc bị dừng — giữ dòng, ghi lý do).
   *Xong khi:* bản đánh giá có dòng "Chốt: <LÀM|CẦN LÀM RÕ|DỪNG> — <ai> · <ngày>".

## Checklist

- [ ] Có tình huống thật + người nêu; "đối thủ có" không được tính là tình huống.
- [ ] Có bằng chứng chống; mọi điều chưa có nguồn mang nhãn `GIẢ ĐỊNH` (N23).
- [ ] Có phương án "không làm" và "làm tay trước".
- [ ] Tiêu chí thành công đo được (N82).
- [ ] Bảng chấm đủ 5 tiêu chí; kết luận khớp luật chấm ("LÀM" không có ô "yếu"/"chưa biết").
- [ ] Chủ dự án là người chốt; việc bị DỪNG có điều kiện mở lại và vẫn nằm trong danh sách việc.

## Mẫu

```markdown
# Đánh giá: chatbot trả lời khách trên trang đặt bàn (14/11/2026)

**Yêu cầu nguyên văn:** "làm con chatbot cho khách hỏi" — quản lý nhà hàng, 12/11.
**Tình huống thật:** hộp thư fanpage ~40 câu/ngày, 70% hỏi giờ mở cửa, chỗ đậu xe, thực đơn trẻ em (đếm 7 ngày).
**Bằng chứng chống:** 3 câu hay hỏi nhất đã có trên trang nhưng nằm sâu; GIẢ ĐỊNH: khách thích chat hơn đọc.

| Phương án | Lát nhỏ nhất | Cỡ | Điểm yếu |
|---|---|---|---|
| A. Chatbot hỏi đáp trên tài liệu | trả lời 20 câu hay hỏi, có trích nguồn | vừa | chi phí theo lượt; phải có bộ câu hỏi đánh giá |
| B. Đưa 3 câu hay hỏi lên đầu trang + FAQ | 1 khối trên trang đặt bàn | nhỏ | không trả lời được câu lạ |
| C. Không làm | — | — | nhân viên vẫn trả lời tay 40 câu/ngày |

| Tiêu chí | A | B |
|---|---|---|
| Giá trị | đủ | đủ |
| Bằng chứng | chưa biết | mạnh |
| Khả thi | đủ | mạnh |
| Chi phí về sau | yếu | mạnh |

**Kết luận đề xuất:** LÀM B trước; A → CẦN LÀM RÕ (đo lại số câu hỏi sau khi có B 2 tuần).
**Thành công đo bằng:** số câu hỏi lặp lại trên fanpage giảm từ ~28 xuống < 10/ngày.
**Chốt:** <chờ chủ dự án>
```

## Đầu ra

Bản đánh giá trong `docs/san-pham/` + danh sách việc đã cập nhật + (nếu LÀM) tóm tắt bàn giao cho `kien-truc-su`.
