---
name: ghi-bai-hoc
description: Ghi tri thức sau một tính năng, một sự cố hoặc một lần đo vào đúng chỗ (comment cạnh code, CLAUDE.md, docs/tri-thuc, skill) theo khuôn luật · vì sao · cạm bẫy · mốc thời gian · số đo · lệnh kiểm, và giữ CLAUDE.md gọn. Dùng khi người dùng nói "ghi lại", "cập nhật CLAUDE.md", "lưu bài học", "document lại", "ghi chú cho lần sau", hoặc ở bước cuối mỗi tính năng/sự cố.
---

# Ghi bài học

Tri thức là thứ khiến đội ở dự án thứ hai không phạm lại lỗi của dự án thứ nhất. Một luật không kèm lý do sẽ bị
người sau "dọn" đi; một bài học nằm trong commit message không bao giờ được đọc lúc cần (N01, N02).

## Khi nào dùng

Cuối mỗi tính năng (bước 7 `/quy-trinh-tinh-nang`), sau mỗi sự cố, sau mỗi lần đo hiệu năng, khi phát hiện tài
liệu sai. Giao `thu-ky-tri-thuc`.

## Các bước

1. **Gom nguyên liệu**: diff (`git diff main...HEAD --stat` + đọc phần quan trọng), spec/plan, báo cáo kiểm chứng,
   những lần "tưởng thế này hoá ra thế kia" trong lúc làm, số đo, quyết định chính sách.
2. **Lọc**: bỏ những gì code hoặc `git log` đã tự nói (tên hàm, danh sách file đổi, ai commit). Giữ những gì KHÔNG
   suy ra được từ code: vì sao chọn cách này, phương án đã loại, cạm bẫy, thứ tự bắt buộc, đánh đổi.
3. **Chọn chỗ ở** — nơi người sau sẽ đọc LÚC SẮP PHẠM LẠI:
   | Bài học về | Ghi ở |
   |---|---|
   | một hàm/khối code cụ thể ("đừng gỡ guard này") | comment ngay cạnh code + 1 dòng ở mục chủ đề |
   | luật bất biến của một chủ đề | `CLAUDE.md` mục chủ đề (3–5 dòng) |
   | chi tiết dài của một tính năng | `docs/tri-thuc/<chu-de>.md`, `CLAUDE.md` giữ luật + đường dẫn (N05) |
   | một quy trình lặp lại | skill trong `.claude/skills/` hoặc checklist |
   | nguyên tắc dùng được cho mọi dự án | đề xuất bổ sung `docs/team/NGUYEN-TAC.md` (mã Nxx mới) |
4. **Viết theo khuôn** (Mẫu). Mỗi luật có lý do; mỗi cạm bẫy nói rõ hậu quả cụ thể; mốc `MM/YYYY`; số đo có điều
   kiện đo; lệnh kiểm chạy được.
5. **Sửa câu cũ sai** trong cùng lượt — tìm bằng `grep -n "<từ khoá>" CLAUDE.md docs -r`. Ghi "(sửa MM/YYYY — câu
   cũ nói X)" (N03).
6. **Giữ một nguồn**: nếu có `AGENTS.md`/file hướng dẫn công cụ khác, nó chỉ trỏ sang `CLAUDE.md` (N04).
7. **Kiểm kích thước**: `wc -c CLAUDE.md` < 40000. Vượt ⇒ chuyển mục dài nhất sang `docs/tri-thuc/`, để lại luật +
   đường dẫn (N05).

## Checklist

- [ ] Mỗi mục mới có: luật · vì sao · (cạm bẫy) · MM/YYYY · (số đo + điều kiện) · (lệnh kiểm).
- [ ] Không chép lại thứ code/git đã nói.
- [ ] Quyết định chính sách ghi người quyết + đánh đổi (N57); việc cố ý chưa làm ghi ở "Còn nợ" (N58).
- [ ] Migration ghi "ĐÃ CHẠY ngày … trên DB …" (N31).
- [ ] Câu cũ sai đã sửa (N03).
- [ ] `AGENTS.md` ≤ 3 dòng (N04); `CLAUDE.md` < 40KB (N05).
- [ ] Đường dẫn file/hàm nhắc tới còn tồn tại: `grep -n` từng cái.

## Mẫu

Khuôn một mục:

```markdown
### <Chủ đề> (`<file chính>` — migration <số>, MM/YYYY)
<Một câu: tính năng/luật này là gì.> Invariant — giữ khi sửa:
- **<Luật bất biến>.** <Vì sao — hậu quả cụ thể nếu vi phạm.>
- **Cạm bẫy đã sập (MM/YYYY):** <chuyện gì xảy ra, vì sao lọt, cách đã chặn>.
- **Thứ tự:** <migration X PHẢI chạy trước deploy vì …> — ĐÃ CHẠY DD/MM/YYYY trên <DB>.
- **Phép thử:** `node --no-warnings scripts/check-<chu-de>.mjs` — chạy sau mỗi lần sửa `<file>`.
- **Đánh đổi đã biết:** <…> (chủ dự án chọn, MM/YYYY).
- **Còn nợ:** <…>.
Chi tiết: `docs/tri-thuc/<chu-de>.md`.
```

Tốt vs xấu:

```markdown
❌ Đã thêm hàm releaseCredit để nhả credit.                         ← code đã nói, thiếu vì sao
✅ **NĂM đường nhả credit, thiếu một là tiền khách bốc hơi**: insert lỗi · đua idempotency (23505) ·
   huỷ · không đến · hoá đơn nhỏ hơn số đã giữ. Hàm nhả không ném (4/5 đường đang xử lý sự cố) và
   idempotent — chính `UPDATE … WHERE settled_at IS NULL` là khoá chống nhả hai lần.
```

```markdown
❌ Tối ưu ảnh trang chủ, nhanh hơn nhiều.                            ← không số, không điều kiện
✅ Ảnh 4 thẻ tầng khai `sizes="calc(100vw - 48px)"` (không phải `100vw`): máy 412px tải bậc 640
   thay vì 828, −96KB. Đo Lighthouse mobile, production build, 09/2026.
```

## Đầu ra

Diff tài liệu (mục mới, câu cũ đã sửa, file đã tách) + một dòng tóm tắt: "Đã ghi: <chủ đề> (+N dòng CLAUDE.md,
docs/tri-thuc/<…>)"; nếu không có tri thức mới, ghi rõ "Không có tri thức mới — vì <lý do>".
