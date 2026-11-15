---
name: soat-cheo-tai-lieu
description: Cổng soát CHÉO spec ↔ thiết kế ↔ plan trước khi viết code — chỉ đọc, không sửa — mỗi yêu cầu YC/TC có task phủ chưa, task nào không phục vụ yêu cầu nào, luật bất biến và Nxx có bị plan vi phạm không, dấu CẦN LÀM RÕ còn sót, tính từ mơ hồ, thuật ngữ lệch, thứ tự task sai, trọng điểm review chưa ghim task. Kết luận ĐẠT / CHƯA ĐẠT. Dùng ở bước 2b của quy trình tính năng, hoặc khi người dùng nói "soát plan", "plan khớp spec chưa", "kiểm tra tài liệu trước khi code", "analyze".
---

# Soát chéo tài liệu

Lỗi rẻ nhất là lỗi bắt được trên giấy. Spec, thiết kế và plan do các vai khác nhau viết vào các lúc khác nhau — chúng
lệch nhau theo cách không ai thấy khi đọc từng file riêng: một yêu cầu không có task nào làm, một task làm thứ không ai
yêu cầu, plan đặt luật ở route trong khi `CLAUDE.md` bắt luật ở cửa ghi thật (N12). Quy trình này đọc ba file CÙNG LÚC.

Phỏng theo `/speckit.analyze` của github/spec-kit (MIT). Khác bản gốc: luật bất biến của project + mã Nxx là "hiến
pháp"; vi phạm là mức Cao; ngoại lệ chỉ hợp lệ khi chủ dự án đã duyệt trong bảng *Ngoại lệ có lý do* của plan.

## Khi nào dùng

- Bước 2b của `/quy-trinh-tinh-nang`: plan xong, TRƯỚC task đầu tiên. Bắt buộc với việc có migration, quyền, tiền.
- Sau khi spec hoặc plan được sửa đáng kể (thêm lát, đổi mô hình dữ liệu).
- Việc nhỏ đã bỏ spec/plan ⇒ không dùng.

## Nguyên tắc vận hành

- **CHỈ ĐỌC.** Không sửa spec/plan/code. Báo cáo + đề xuất sửa; sửa ở tài liệu SỞ HỮU phát hiện (spec ⇒ kiến trúc sư
  + chủ dự án; plan ⇒ kiến trúc sư) rồi soát lại. Giao cho `kiem-dinh-vien` (vai chỉ-đọc) hoặc một subagent
  `general-purpose` với lời dặn "chỉ đọc" — không giao cho chính người viết plan (không độc lập).
- Tối đa ~50 phát hiện; dư thì gộp thành dòng tổng.

## Các bước

1. **Nạp**: spec (Yêu cầu, lát, YC, TC, ca biên, Giả định, Đã chốt, Làm rõ), thiết kế UX nếu có (ma trận trạng thái,
   câu cho mọi `error.code`), plan (Ràng buộc chung, Cổng đối chiếu, Ngoại lệ, Trọng điểm review, task + `→ YC` +
   `[P]` + file), `CLAUDE.md` (luật bất biến, quyết định chính sách), `CONTEXT.md` nếu có.

2. **Dựng bảng phủ**: mỗi YC-xx / TC-xx / kịch bản Cho-Khi-Thì ⇒ task nào phục vụ (theo `→ YC` và theo nội dung);
   mỗi task ⇒ yêu cầu nào. Mỗi `error.code` trong spec ⇒ có câu trong thiết kế UX và có ca từ chối trong plan.

3. **Các lượt dò**:
   | Lượt | Tìm |
   |---|---|
   | A. Hiến pháp | plan trái luật bất biến của `CLAUDE.md` hoặc Nxx (luật ở route — N12; tham số chính sách có mặc định — N14; số dẫn xuất lưu song song — N09; migration không ghi "chạy trước deploy" — N31); ngoại lệ chưa có người duyệt |
   | B. Phủ | YC/TC không có task; task không phục vụ yêu cầu nào và không nói vì sao; TC cần việc xây (hiệu năng, bảo mật) mà không có task; trọng điểm review không ghim task |
   | C. Mơ hồ | dấu `[CẦN LÀM RÕ]` còn sót; tính từ không đo được trong YC/TC; placeholder `<…>`, `TODO`, `???` |
   | D. Thiếu đặc tả | YC có động từ mà thiếu đối tượng/kết quả kiểm được; lát không có Cho/Khi/Thì; task nhắc file/hàm không có trong spec và không đánh "(mới)" (N03) |
   | E. Lệch nhau | cùng khái niệm hai tên giữa các file; thực thể trong plan không có trong spec (hoặc ngược lại); quyền ở YC khác ma trận ở D-bảng; giả định trái câu đã chốt |
   | F. Thứ tự | task UI trước API nó gọi; ghi dữ liệu trước khi file live (N32); `[P]` trên hai task sửa cùng file; lát 2 bắt đầu trước điểm dừng lát 1 |
   | G. Trùng | hai YC nói cùng một điều bằng hai câu — giữ câu rõ hơn |

4. **Mức độ**:
   - **Cao**: trái luật bất biến/Nxx không có ngoại lệ được duyệt; YC/TC lõi không có task; dấu `[CẦN LÀM RÕ · chính
     sách]` còn sót; hai yêu cầu mâu thuẫn.
   - **Vừa**: task ngoài yêu cầu không lý do; thuật ngữ lệch; ca biên/`error.code` thiếu câu hoặc thiếu ca từ chối;
     thứ tự task sai.
   - **Thấp**: câu chữ, trùng nhẹ không đổi thứ tự làm.

5. **Kết luận**: **ĐẠT** khi 0 phát hiện Cao; **CHƯA ĐẠT** khi còn ≥ 1. Vừa/Thấp: sửa ngay hoặc ghi "Còn nợ" có lý do.
   Hỏi người giao việc có muốn đề xuất sửa cụ thể cho N phát hiện đầu không — KHÔNG tự sửa.

## Checklist

- [ ] Đọc cả spec + thiết kế + plan + `CLAUDE.md` cùng lúc; người soát không phải người viết plan.
- [ ] Bảng phủ hai chiều đầy đủ; số liệu: tổng YC/TC, tổng task, % YC có task, số task ngoài yêu cầu.
- [ ] Mọi vi phạm luật bất biến/Nxx là Cao, trừ khi có trong bảng Ngoại lệ có người duyệt.
- [ ] `grep -n "CẦN LÀM RÕ"` trên spec + plan = 0 dấu chính sách.
- [ ] Mỗi phát hiện có vị trí (`file:dòng` hoặc mã YC/Task) + đề xuất sửa ở tài liệu nào.
- [ ] Không sửa file nào trong lúc soát.

## Mẫu

```markdown
## Soát chéo: <tính năng> — CHƯA ĐẠT

**Số liệu:** 9 YC · 3 TC · 11 task · phủ YC 8/9 (89%) · 1 task ngoài yêu cầu · 1 dấu CẦN LÀM RÕ.

| # | Lượt | Mức | Vị trí | Phát hiện | Sửa ở |
|---|---|---|---|---|---|
| A1 | Hiến pháp | Cao | plan Task 4 | kiểm "ngày kín" đặt trong route `/api/bookings`, cửa lễ tân không đi qua (N12, I-03) | plan: chuyển vào `assertBookingWindow` |
| B1 | Phủ | Cao | YC-06 | "gửi thư báo huỷ" không có task | plan: thêm task |
| B2 | Phủ | Vừa | Task 9 | thêm bộ lọc theo tầng — không YC nào yêu cầu | hỏi chủ dự án: thêm YC hay bỏ task |
| C1 | Mơ hồ | Cao | spec YC-04 | `[CẦN LÀM RÕ · chính sách: nhả bàn khi huỷ]` | `/lam-ro-yeu-cau` |

**Bảng phủ:** YC-01 → T1, T3 · YC-02 → T2 · … · YC-06 → (không có) ✗
**Bước tiếp:** sửa A1, B1, C1 ⇒ soát lại. Có muốn mình đề xuất nội dung sửa cho 3 phát hiện Cao không?
```

## Đầu ra

Báo cáo theo mẫu (không ghi file nào) + kết luận ĐẠT / CHƯA ĐẠT + danh sách sửa xếp theo mức, mỗi dòng chỉ tài liệu
sở hữu.
