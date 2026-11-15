# <Tên tính năng> — kế hoạch triển khai

> Lưu tại `docs/plans/YYYY-MM-DD-<ten>.md`. Viết SAU khi spec được duyệt. Mỗi task làm xong là đánh dấu `- [x]`.
> Người thực thi (người hay agent) đọc *Ràng buộc chung* + *Trọng điểm review* TRƯỚC task đầu tiên.

**Mục tiêu:** <một câu — người dùng làm được gì sau khi xong>

**Kiến trúc:** <3–4 câu: bảng, module thuần, chốt chặn ở đâu, cache, quyền>

**Stack:** <…> · Phép thử: `scripts/check-*.mjs` + `node --test` + tsc + build + kiểm thật.

**Spec:** `docs/specs/YYYY-MM-DD-<ten>-design.md`

## Ràng buộc chung

<Những luật áp cho MỌI task — người làm task 7 không cần đọc lại task 1 mới biết. Ví dụ:>

- Comment + chữ giao diện bằng <ngôn ngữ>; chữ khách thấy có đủ <N> ngôn ngữ, file gốc là shape.
- `lib/<chu-de>.ts` chỉ `import type` (Node nạp thẳng cho phép thử).
- Lỗi DB: `throw new DbError(error.message)`; lỗi nghiệp vụ: `throw new BusinessError(code, câu cho người dùng, status)`;
  không tồn tại ⇒ `status` 404 — phân loại bằng class, không dò chữ trong message (N21).
- Route: xác thực → quyền → gọi tầng dữ liệu → `mapDbError`. Envelope `{ error: { code, message } }`.
- Mọi ghi bảng `<…>` gọi purge cache `<…>`.
- Migration `<00xx>` chạy trên <mọi DB> TRƯỚC khi deploy.
- <Lá chắn kiểm thật: ngày xa, không gửi thư thật, dọn dữ liệu thử.>

## Cổng: đối chiếu luật bất biến (TRƯỚC task 1 — chạy lại khi plan đổi)

Mỗi luật bất biến trong `CLAUDE.md` + mã Nxx mà tính năng chạm tới: plan TUÂN hay cần NGOẠI LỆ. Không có ngoại lệ ⇒ ghi
"Không có". Có ngoại lệ ⇒ chủ dự án duyệt trước khi code; ngoại lệ chưa duyệt = `/soat-cheo-tai-lieu` báo CHƯA ĐẠT.

| Luật | Plan làm gì | Tuân? |
|---|---|---|
| I-01 · <luật bất biến của project> | <task nào giữ nó> | ✓ |
| N14 · tham số chính sách bắt buộc | Task 3 — `assert<Thu>Window(policy)` | ✓ |

**Ngoại lệ có lý do** (chỉ điền khi có):

| Ngoại lệ | Vì sao cần | Phương án đơn giản hơn bị loại vì | Chủ dự án duyệt |
|---|---|---|---|
| <vd thêm bảng đếm song song (trái N09)> | <…> | <…> | <ai · ngày> |

## Trọng điểm review

<3–6 chỗ DỄ SAI NHẤT của tính năng này, mỗi chỗ ghim vào task sẽ kiểm nó. Đây là phần làm nên khác biệt — nghĩ như kẻ
phá hoại: trang tĩnh còn bản cũ? qua nửa đêm? đọc bảng lỗi? hai người bấm cùng lúc? tài khoản phạm vi hẹp? dữ liệu cũ?>

1. **<tình huống>** — <hành vi đúng>. Ghim ở Task <n> (<cách kiểm>).
2. **<…>**

## Cách ghi task

- Tiêu đề: `### Task <n> [P] → YC-01, YC-03: <tên>`. `[P]` = chạy SONG SONG được (khác file, không chờ kết quả task
  khác); không có `[P]` ⇒ nối tiếp. `→ YC-xx` = yêu cầu/tiêu chí task này phục vụ (N81). Task không phục vụ YC/TC nào
  phải nói vì sao (nền móng, dọn đường) — không thì là việc ngoài yêu cầu.
- Mỗi YC/TC của spec có ít nhất một task; `/soat-cheo-tai-lieu` đếm phủ hai chiều trước khi code.
- Nhiều lát (spec §1.1): nhóm task theo lát, hết mỗi lát có **Điểm dừng**: kịch bản Cho/Khi/Thì của lát đó chạy thật
  được — lát sau không bắt đầu khi lát trước chưa qua điểm dừng.
- Việc lớn: giao từng khoảng task (Task 1–5) mỗi lượt; `- [x]` cho lượt sau biết đi tiếp từ đâu.

---

### Task 1 → YC-01: <Migration + chạy trên mọi DB>

**File:** `supabase/migrations/<00xx_ten>.sql`

- [ ] Viết migration (spec §3).
- [ ] Chạy trên <DB chính> rồi <DB phụ>; reload schema cache nếu cần.
- [ ] Kiểm: <truy vấn xác nhận cột/bảng tồn tại>.

**Xong khi:** <tiêu chí kiểm được>.

### Task 2 [P] → YC-02, YC-03: Luật thuần `lib/<chu-de>.ts` + phép thử

**File:** `lib/<chu-de>.ts`, `scripts/check-<chu-de>.mjs`

- [ ] Viết phép thử TRƯỚC (từ `docs/team/templates/check-luat.template.mjs`), chạy thấy đỏ.
- [ ] Viết module tới khi xanh: `node --no-warnings scripts/check-<chu-de>.mjs`.

**Xong khi:** mọi ca xanh, gồm ca biên <…>.

### Task 3 → YC-03: Tầng dữ liệu + chốt chặn

- [ ] <…>

**Xong khi:** <…>.

### Task <n>: Kiểm thật đầu-cuối + ghi tri thức

- [ ] Chạy lại kịch bản "Thành công khi" của spec — có curl cho đường API (`/kiem-chung-thuc`).
- [ ] Đối chiếu yêu cầu: mỗi YC/TC → Đạt / Thiếu / Một phần / Trái; việc ngoài yêu cầu liệt kê riêng (N83).
- [ ] Dọn dữ liệu thử.
- [ ] Cập nhật `CLAUDE.md` (`/ghi-bai-hoc`): luật, lệnh phép thử, "ĐÃ CHẠY migration ngày…", đánh đổi, còn nợ.

**Xong khi:** báo cáo có mục "Đã kiểm chứng" và "Chưa kiểm vì …".

---

## Đợt bổ sung <n> (DD/MM — từ đối chiếu yêu cầu của `kiem-dinh-vien`)

<CHỈ THÊM VÀO CUỐI: không sửa, đánh số lại hay xoá task cũ — kể cả task của đợt bổ sung trước. Mỗi khoảng trống
đối chiếu tìm ra (Thiếu / Một phần / Trái / Ngoài yêu cầu) thành một task trỏ về mã YC và dòng phát hiện. Đối chiếu
lại không còn khoảng trống ⇒ không thêm đợt nào.>

### Task <n+1> → YC-04: <việc còn thiếu> — (Thiếu: <phát hiện #>)

- [ ] <…>

**Xong khi:** <…>.
