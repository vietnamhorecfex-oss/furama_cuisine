# <Tên tính năng> — thiết kế (DD/MM/YYYY)

> Lưu tại `docs/specs/YYYY-MM-DD-<ten>-design.md`. Viết TRƯỚC khi code (N06). Chủ dự án duyệt xong mới viết plan.
> Xoá mọi dòng hướng dẫn trong `<…>` khi điền.

**Trạng thái:** Nháp <→ Đã duyệt DD/MM (ai) → Đang làm → Đã triển khai DD/MM (commit) — hoặc "Bị thay một phần: YC-03
bởi `docs/specs/<…>`">. Spec là BIÊN BẢN thiết kế có ngày: sau khi triển khai không sửa lại thành hành vi mới — đổi hành
vi về sau thì viết spec mới ghi "Thay: <spec này> YC-xx" và thêm dòng "Bị thay" ở đây. Sự thật hiện hành nằm ở
`CLAUDE.md` + code + phép thử (N03).

## 1. Yêu cầu — CÁI GÌ và VÌ SAO (chưa nói CÁCH LÀM; cách làm ở mục 2–4)

**Sự cố / nhu cầu khởi nguồn:** <chuyện gì đã xảy ra hoặc ai cần gì — kể bằng một tình huống thật, kèm số nếu có.
Vd "một ngày đã kín bàn nhưng web vẫn nhận đặt; nhà hàng phải huỷ và xin lỗi khách". Hiện app làm gì / không làm gì.>

**Đã chốt với chủ dự án** (mỗi câu hỏi chính sách một dòng — N57; chi tiết phiên hỏi ở mục 9):

- Q1. <câu hỏi> → **<câu trả lời>** <(lý do nếu có)>
- Q2. <…>

### 1.1 Lát cắt theo ưu tiên

<Tính năng một lát thì giữ một lát. Nhiều phần ⇒ chia lát mà MỖI lát làm xong riêng vẫn dùng được và kiểm riêng được
(P1 = bản tối thiểu có giá trị). Plan làm theo thứ tự lát, mỗi lát một điểm dừng kiểm.>

**Lát 1 — <tên> (P1)** · Vì sao ưu tiên: <…> · Kiểm riêng bằng: <thao tác cụ thể>

1. **Cho** <trạng thái ban đầu> **Khi** <hành động> **Thì** <kết quả thấy được>
2. **Cho** <…> **Khi** <…> **Thì** <…>

**Lát 2 — <tên> (P2)** · <…>

### 1.2 Yêu cầu có mã (N81 — mã không bao giờ đổi số; bỏ yêu cầu thì ghi "(bỏ DD/MM — vì …)", không xoá dòng)

- **YC-01**: <Hệ thống PHẢI … — một hành vi kiểm được>
- **YC-02**: <Người dùng <vai> PHẢI được …>
- **YC-03**: <Hệ thống PHẢI từ chối … với `<ERROR_CODE>`>
- **YC-04**: <Hệ thống PHẢI … [CẦN LÀM RÕ · chính sách: huỷ thì có nhả bàn ngay không?]>

Dấu `[CẦN LÀM RÕ · chính sách|kỹ thuật: <câu hỏi cụ thể>]` thay cho đoán (N82). Còn dấu nào ⇒ chưa được duyệt spec.

### 1.3 Ca biên & lỗi

- <Chuyện gì xảy ra khi …? — gắn mã YC tương ứng> <(qua nửa đêm, hai người bấm cùng lúc, dữ liệu cũ, mất mạng…)>

### 1.4 Thành công khi

**Kịch bản đầu-cuối:** <MỘT kịch bản cụ thể, viết như người dùng thật làm từng bước và thấy gì — đây là thứ
`kiem-dinh-vien` sẽ chạy lại ở cuối. Gồm cả đường "gửi thẳng API" chứ không chỉ giao diện.>

**Tiêu chí đo được** (không tính từ chung chung — "nhanh", "dễ dùng" phải thành con số):

- **TC-01**: <vd "lễ tân khoá một ngày trong ≤ 3 thao tác"; "trang /dat-ban vẫn Static"; "0 đơn trùng khi bấm đúp">
- **TC-02**: <…>

### 1.5 Giả định (mặc định đã chọn khi yêu cầu không nói — chủ dự án bác được)

- <vd "Chỉ áp cho đặt bàn mới; đơn đã có giữ nguyên"> — <vì sao chọn mặc định này>

## 2. Quyết định (kèm lý do)

| # | Quyết định | Vì sao (và phương án đã loại) | Phục vụ |
|---|---|---|---|
| D1 | <mô hình dữ liệu: bảng/cột, một dòng = gì, UNIQUE gì> | <vì sao; phương án B bị loại vì …> | YC-01 |
| D2 | <luật thuần ở `lib/<chu-de>.ts`, dùng chung form + server + admin> | <một nguồn sự thật — N08> | YC-02, YC-03 |
| D3 | <chốt chặn đặt ở hàm `<…>` của tầng dữ liệu, tham số chính sách BẮT BUỘC `<…>`> | <N12, N14> | YC-03 |
| D4 | <mã lỗi máy đọc + câu theo ngôn ngữ> | <N21> | YC-03 |
| D5 | <cache: đọc qua …, ghi xong purge …> | <N34> | TC-02 |
| D6 | <quyền: xem = …, sửa = …; ngoài phạm vi ⇒ 404, thiếu quyền ⇒ 403> | <N25–N26> | YC-02 |
| D7 | <dữ liệu đã có trước tính năng xử lý thế nào> | <…> | <…> |

<Thêm dòng khi cần. Mỗi quyết định phải trả lời được "nếu làm cách khác thì hỏng ở đâu". Quyết định không phục vụ YC/TC
nào ⇒ có thể là việc ngoài yêu cầu — bỏ, hoặc thêm YC và hỏi chủ dự án.>

## 3. Dữ liệu — migration `<00xx_ten>.sql`

- Loại: <additive / đổi cột / xoá> · **PHẢI chạy trước deploy: <có/không — vì code mới ghi cột …>** (N31)
- Chạy trên: <DB chính · DB phụ · staging>

```sql
-- <DDL đầy đủ, `if not exists`, CHECK, UNIQUE, index, RLS>
```

- Dữ liệu cũ: <backfill hay cố ý KHÔNG backfill — và vì sao (đoán ngược là ghi số sai vào cột đối chiếu)>.

## 4. Thành phần

### 4.1 `lib/<chu-de>.ts` (thuần — chỉ `import type`)
<Danh sách hàm + chữ ký + hành vi biên. Đây là thứ phép thử `scripts/check-<chu-de>.mjs` sẽ ghim.>

### 4.2 Tầng dữ liệu `<lib/db.ts>`
<Hàm đọc/ghi mới, lớp lỗi mới, thứ tự kiểm trong chốt chặn, side effect.>

### 4.3 API
<Route · method · quyền · body · phản hồi · mã lỗi. Nhắc `/cua-ghi-moi` cho mỗi cửa ghi.>

### 4.4 Giao diện
<Form/khối nào đổi; trạng thái tải/lỗi/trống; chữ mới ở mọi ngôn ngữ; a11y; không mất dữ liệu người dùng (N48).>

### 4.5 Công cụ nội bộ / admin
<Màn nào, theo hệ thị giác nội bộ (N50); đo chỗ trước khi thêm cột (N51).>

## 5. Không làm (YAGNI)

<Liệt kê thứ CỐ Ý không làm ở bản này, mỗi thứ một cụm — để người sau không tưởng là thiếu sót.>

## 6. Kiểm tra

1. `node --no-warnings scripts/check-<chu-de>.mjs` — <các nhóm ca chính, ghi mã YC mỗi nhóm phủ>.
2. `npx tsc --noEmit` + `npm run lint` + `npm run build`.
3. Kiểm thật (N40): <từng bước của kịch bản "Thành công khi" + mỗi kịch bản Cho/Khi/Thì của các lát, kèm curl cho
   đường API; lá chắn dữ liệu thử — ngày xa, địa chỉ thử, dọn sau khi thử (N59)>.
4. <Ma trận kiểm nếu đụng hạ tầng (N41).>
5. Đối chiếu yêu cầu (N83): mỗi YC/TC một dòng Đạt / Thiếu / Một phần / Trái — trong báo cáo kiểm định.

## 7. Triển khai & rollback

- Thứ tự: <migration (mọi DB) → deploy → script dữ liệu → purge cache> (N31–N32).
- Rollback: <từng câu lệnh / thao tác; điều gì phải làm TRƯỚC khi trả code cũ> (N36).

## 8. Cập nhật tri thức

<Mục nào trong `CLAUDE.md` thêm/sửa; có cần file `docs/tri-thuc/<chu-de>.md` không; "Đánh đổi đã biết" + "Còn nợ" (N58).>

## 9. Làm rõ (ghi bởi `/lam-ro-yeu-cau` — không xoá phiên cũ)

### Phiên DD/MM/YYYY

- Q: <câu hỏi> → A: <câu trả lời> (<ai quyết>) — đã áp vào <YC-04 / mục 1.3 / D2>
