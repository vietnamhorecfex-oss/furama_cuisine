---
name: lam-ro-yeu-cau
description: Dò chỗ mơ hồ và thiếu quyết định trong một spec trước khi duyệt — quét theo bảng hạng mục, chọn tối đa 5 câu hỏi có tác động lớn nhất, hỏi chủ dự án MỘT lượt kèm phương án đề xuất, rồi GHI câu trả lời vào spec (mục Làm rõ + sửa đúng chỗ, xoá dấu CẦN LÀM RÕ). Dùng ở bước 0–1 của quy trình tính năng, hoặc khi người dùng nói "làm rõ yêu cầu", "spec còn mơ hồ", "còn thiếu gì không", "clarify", "hỏi lại cho chắc trước khi làm".
---

# Làm rõ yêu cầu

Câu hỏi không hỏi thì sẽ bị đoán — và đoán sai ở spec là sửa lại ở plan, code, phép thử và dữ liệu. Ngược lại, hỏi
lắt nhắt hai mươi câu thì chủ dự án bỏ đọc. Quy trình này giữ hai đầu: quét ĐỦ hạng mục, nhưng chỉ hỏi ≤ 5 câu có tác
động lớn nhất, gộp MỘT lượt (N57), và câu trả lời đi thẳng vào spec chứ không nằm lại trong chat (N02, N82).

Phỏng theo `/speckit.clarify` của github/spec-kit (MIT). Khác bản gốc: hỏi một lượt thay vì từng câu, tách câu
**chính sách** (của chủ dự án) khỏi câu **kỹ thuật** (đội tự chốt được, ghi thành Giả định).

## Khi nào dùng

- Bước 0–1 của `/quy-trinh-tinh-nang`: sau bản nháp spec đầu tiên, TRƯỚC cổng duyệt spec.
- Spec còn dấu `[CẦN LÀM RÕ …]`, hoặc chứa tính từ không đo được ("nhanh", "an toàn", "dễ dùng", "linh hoạt").
- Bỏ qua được với việc thăm dò (spike) — nhưng phải ghi vào báo cáo "chưa làm rõ, rủi ro làm lại cao".

## Các bước

1. **Nạp**: spec, `CLAUDE.md` (luật bất biến, quyết định chính sách đã có — câu đã quyết thì KHÔNG hỏi lại),
   `CONTEXT.md` nếu có (thuật ngữ), spec cũ cùng chủ đề.

2. **Quét theo hạng mục** — mỗi hạng mục chấm Rõ / Một phần / Thiếu (bảng nội bộ, không cần in hết):

   | Hạng mục | Soi gì |
   |---|---|
   | Phạm vi | mục tiêu, vai trò người dùng, "Không làm" đã khai chưa |
   | Chính sách | ai bị chặn, ai được vượt, huỷ thì nhả gì, có báo khách không, tiền/hoa hồng (N57) |
   | Dữ liệu | thực thể, định danh/UNIQUE, vòng đời trạng thái (N13), dữ liệu cũ xử lý ra sao, quy mô |
   | Quyền | xem/sửa theo vai, phạm vi dữ liệu, ngoài phạm vi ⇒ 404 (N25, N26) |
   | Luồng & trạng thái | rỗng / đang tải / lỗi từng mã / mất mạng / một phần (N48) |
   | Lỗi & ca biên | gửi trùng, đồng thời, qua nửa đêm/múi giờ (N17, N18, N53), giá trị biên |
   | Ngôn ngữ & nội dung | chữ mới ở mọi ngôn ngữ, giờ địa điểm, ai viết nội dung |
   | Tích hợp | dịch vụ ngoài, hạn mức gói (N35), dịch vụ chết thì sao (N36) |
   | Phi chức năng | con số cho tốc độ/khối lượng; bảo mật; luật dữ liệu cá nhân |
   | Công khai & tìm kiếm | trang mới có SEO không, URL đổi có redirect không (N76) |
   | Đo được | mỗi "Thành công khi"/TC kiểm được bằng thứ thật không; còn tính từ mơ hồ không |
   | Thuật ngữ | cùng một khái niệm có hai tên không (so `CONTEXT.md`) |

3. **Lập hàng câu hỏi** từ ô Một phần/Thiếu, xếp theo (tác động × độ chưa chắc). Chỉ giữ câu mà câu trả lời đổi được
   mô hình dữ liệu, quyền, luồng, phép thử, vận hành hoặc tuân thủ. Bỏ: câu đã có trong `CLAUDE.md`, câu về cách làm
   (stack, cấu trúc code — của kiến trúc sư), sở thích hình thức.
   - Câu **kỹ thuật** đội tự chốt được ⇒ không hỏi: chọn mặc định hợp lý, ghi vào *Giả định* (spec §1.5) kèm lý do —
     chủ dự án bác được lúc duyệt.
   - Câu **chính sách** ⇒ vào hàng hỏi. Tối đa **5**; quá 5 ⇒ lấy 5 câu nặng nhất, phần còn lại ghi `[CẦN LÀM RÕ]`
     và nói rõ "hỏi ở lượt sau".

4. **Hỏi MỘT lượt** (dùng câu hỏi có lựa chọn khi được — AskUserQuestion tối đa 4 câu một lần; câu thứ 5 gộp vào
   cùng tin nhắn). Mỗi câu:
   - là một câu hỏi thật, tự hiểu được khi đọc riêng, kết thúc bằng dấu `?` — không phải nhãn ("Ma trận quyền YC-04");
   - một câu **Vì sao quan trọng** (đổi gì nếu chọn sai);
   - **Đề xuất** đặt đầu, kèm lý do 1–2 câu; 2–4 phương án loại trừ nhau; cho phép trả lời ngắn khác.
   Không có câu nào đáng hỏi ⇒ báo "không còn chỗ mơ hồ quan trọng" và chuyển bước 6.

5. **Ghi vào spec SAU MỖI câu trả lời** (không dồn tới cuối — mất ngữ cảnh là mất câu trả lời):
   - Mục 9 *Làm rõ* › `### Phiên DD/MM/YYYY` › `- Q: <câu hỏi> → A: <trả lời> (<ai quyết>) — đã áp vào <chỗ>`.
   - Áp vào ĐÚNG chỗ: chính sách ⇒ "Đã chốt" (§1) + YC liên quan; dữ liệu ⇒ D-bảng/§3; ca biên ⇒ §1.3; con số ⇒ TC;
     thuật ngữ ⇒ đổi thống nhất cả spec (giữ một lần "(trước gọi là X)").
   - Câu trả lời làm một câu cũ sai ⇒ THAY câu cũ, không để hai câu mâu thuẫn. Xoá dấu `[CẦN LÀM RÕ]` đã được trả lời.
   - Quyết định chính sách mới mang tính lâu dài ⇒ đề xuất thêm vào mục quyết định chính sách của `CLAUDE.md`.

6. **Tự kiểm chất lượng yêu cầu** ("phép thử cho câu chữ" — kiểm CÂU CHỮ của spec, không kiểm code). Đọc lại spec
   với các câu hỏi dạng:
   - Đủ? "Có nói chuyện gì xảy ra khi người được giao việc bị xoá không?" · "Mọi `error.code` có câu cho người dùng chưa?"
   - Rõ? "'Hiển thị nổi bật' đã thành kích thước/vị trí cụ thể chưa?"
   - Nhất quán? "Quyền ở YC-02 có khớp ma trận quyền ở D6 không?"
   - Đo được? "TC-01 kiểm bằng lệnh/thao tác nào?"
   - Phủ? "Lát 2 có kịch bản Cho/Khi/Thì chưa?"
   Câu nào trả lời "chưa" ⇒ sửa spec nếu là việc kỹ thuật, hoặc thành `[CẦN LÀM RÕ]` cho lượt sau nếu là chính sách.
   SAI: "Kiểm nút bấm chạy đúng" (đó là kiểm code — việc của `kiem-dinh-vien`).

## Checklist

- [ ] Đã quét đủ 12 hạng mục; câu đã quyết trong `CLAUDE.md` không bị hỏi lại.
- [ ] ≤ 5 câu, hỏi MỘT lượt, mỗi câu có "vì sao quan trọng" + đề xuất (N57).
- [ ] Câu kỹ thuật thành *Giả định* có lý do, không thành câu hỏi.
- [ ] Mỗi câu trả lời: một dòng ở mục 9 + đã áp vào đúng chỗ; không còn câu mâu thuẫn (N03).
- [ ] `grep -n "CẦN LÀM RÕ" docs/specs/<file>` = 0 trước cổng duyệt spec — hoặc từng dấu còn lại có ghi "hỏi ở lượt sau".
- [ ] Không còn tính từ mơ hồ trong YC/TC (`grep -niE "nhanh|an toàn|dễ dùng|linh hoạt|tối ưu|thân thiện"`).

## Mẫu

```markdown
**Câu 1/3 — chính sách:** Khi khách huỷ đặt bàn trong vòng 2 giờ trước giờ đến, bàn có được nhả cho người khác đặt
ngay không?
*Vì sao quan trọng:* quyết định cách giữ chỗ (N18) và câu báo cho khách; chọn sai thì hoặc mất bàn trống, hoặc nhận
trùng khách.
**Đề xuất: A** — nhả ngay; nhà hàng đông khách vào giờ cao điểm, giữ bàn trống tốn hơn.
| | Phương án |
|---|---|
| A | Nhả ngay, ai cũng đặt được |
| B | Giữ tới giờ đến, rồi nhả |
| C | Nhả nhưng chỉ lễ tân đặt được |
```

```markdown
## 9. Làm rõ
### Phiên 06/11/2026
- Q: Khách huỷ trong vòng 2 giờ trước giờ đến thì bàn có nhả ngay không? → A: Nhả ngay (chủ nhà hàng) — đã áp vào YC-04, §1.3
- Q: Có gửi thư báo huỷ cho khách không? → A: Có, cả khi lễ tân huỷ hộ (chủ nhà hàng) — đã áp vào YC-06, D8
```

## Đầu ra

Spec đã cập nhật (mục 9 + các mục bị ảnh hưởng) + báo cáo ngắn: số câu đã hỏi/đã trả lời, hạng mục còn Một phần/Thiếu
và vì sao để lại, các Giả định đã thêm, gợi ý bước tiếp (`kien-truc-su` hoàn thiện spec → cổng duyệt).
