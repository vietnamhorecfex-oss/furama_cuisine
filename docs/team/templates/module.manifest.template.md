# Module: <ten-module>

<!-- ≤ 40–50 dòng. Ghi điều ĐỌC CODE KHÔNG SUY RA ĐƯỢC (N64). Đọc trước khi sửa module; đổi contract ⇒ sửa file này
     trong CÙNG PR. Mục nào chưa có thì ghi "chưa có" — đừng xoá mục. -->

## Mục đích
<Một-hai câu: module sở hữu mảng nghiệp vụ nào. Từ ngữ lấy đúng từ CONTEXT.md.>

## Contract surface
- Public API: <`XPublicApi.getY(id)` — hoặc "chưa có (chưa module nào cần — N65)">
- Events phát ra: <`XCreatedV1` (eventVersion, occurredAt) — hoặc "chưa có">
- Events tiêu thụ: <`YConfirmedV1` (từ module y) — hoặc "không">

## Invariants quan trọng
<!-- Mỗi dòng: luật + hậu quả nếu vi phạm. Ví dụ thật (IConcierge, module orders của app nhân viên):
     "getList nhiều trạng thái PHẢI fan-out mỗi trạng thái một request — bỏ ?status= rồi lọc client thì BE trả bảng
      90 ngày mỗi 10s → quá timeout → lỗi poll bị nuốt = đơn không báo." -->
- <luật> — vì <hậu quả>

## Phụ thuộc
- Sync: <`inventory.contract` (kiểm tồn kho khi tạo đơn)>
- I/O qua port: <DB · email · API ngoài — adapter nằm ở đâu>

## Chưa đạt so với kiến trúc đích
<!-- Nói thật (N67): outbox? schema riêng? slice còn nằm ở thư mục cũ? -->
- <vd: Outbox chưa có — event chỉ phát in-process, mất khi crash>
