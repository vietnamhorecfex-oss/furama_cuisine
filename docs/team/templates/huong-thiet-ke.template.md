# Hướng thiết kế — <tên dự án>

> Chép sang `docs/design/huong-thiet-ke.md`. Người viết: `giam-doc-sang-tao`. Người duyệt: chủ dự án.
> Mục A viết MỘT lần cho dự án; mục B lặp lại cho mỗi tính năng có giao diện mới (hoặc tách file
> `docs/design/<YYYY-MM-DD>-<ten>-chuyen-dong.md`).

---

## A. Hướng của dự án

### A1. Thương hiệu (từ chủ dự án — <ngày>)

- **3 tính từ muốn người dùng cảm thấy:** <ấm áp · đẳng cấp · không phô trương>
- **Thương hiệu tham chiếu (bất kỳ ngành) + vì sao:** <…>
- **KHÔNG muốn giống:** <…>
- **Tài sản có sẵn:** logo <…> · font bản quyền <…> · kho ảnh <…>
- **Điểm chung của 3 đối thủ (để tránh):** <ảnh stock đồ ăn trên nền trắng, nút cam, chữ hệ thống…>

### A1b. Tham chiếu đã giải mã (ảnh chủ dự án gửi / `nghien-cuu-vien` tìm — cách hỏi ở `nghe-thi-giac.md` §1)

| Tham chiếu | Thứ hút mắt + vì sao | Lớp | Màu lấy từ đâu | Chữ | Chuyển động ngầm định | LẤY nguyên lý gì | KHÔNG lấy gì |
|---|---|---|---|---|---|---|---|
| <ảnh / link> | | | | | | | |

### A2. Các hướng đã đề xuất

| | Hướng A — <tên> | Hướng B — <tên> | Hướng C — <tên> |
|---|---|---|---|
| Ý tưởng (một câu) | | | |
| Màu (vai trò) | | | |
| Chữ (tiêu đề / thân) | | | |
| Nhịp bố cục | | | |
| Cá tính chuyển động | | | |
| Khoảnh khắc chữ ký | | | |
| Rủi ro (hiệu năng · a11y · độ khó dựng) | | | |
| Bản mẫu | `docs/design/prototypes/huong-a.html` | | |

### A2b. Vòng tự nhìn — mỗi hướng (ảnh ở `docs/design/prototypes/anh/`)

| Hướng | Vòng | Chiều sâu | Phân cấp | Màu | Chữ | Nhịp | Chuyển động | Độ riêng | Tổng /14 | Lỗi thấy trên ảnh → đã sửa |
|---|---|---|---|---|---|---|---|---|---|---|
| A | 1 | | | | | | | | | |
| A | 2 | | | | | | | | | |

Cổng cứng mỗi hướng: `do-tuong-phan` <n>/<n> ô đạt (mọi sắc độ/chủ đề × 1440px + 390px) · 390px không tràn ngang ·
`?reduced=1` 0 animation chạy · console sạch · `getAnimations()` chỉ `transform`/`opacity`. Chưa đạt ≥ 11/14 + mọi cổng
cứng thì chưa trình chủ dự án.

### A3. Quyết định

**Chọn:** <hướng> — <người quyết>, <ngày>. **Điều chỉnh:** <"lấy chuyển động của C cho nút chính">.
**Đã loại và vì sao:** <…>

### A4. Token đã chốt

**Màu** (mỗi màu có vai, không chỉ có mã):

| Token | Giá trị | Vai | Tương phản trên nền chính |
|---|---|---|---|
| `--h` | <sắc độ 0–360> | MỘT sắc độ sinh cả hệ (`oklch`) — công thức ở `nghe-thi-giac.md` §2 | đo bằng `do-tuong-phan`, không suy từ token |
| `--mau-nen` | | nền trang khách | — |
| `--mau-chu` | | chữ thân | ≥ 4.5:1 |
| `--mau-nhan` | | nút chính, liên kết | ≥ 4.5:1 (chữ) / ≥ 3:1 (viền) |

**Chữ:** họ chữ tiêu đề/thân · thang cỡ (vd 14 · 16 · 20 · 28 · 44 · 72) · độ đậm dùng · subset ngôn ngữ (N45).

**Chuyển động:** giá trị cho `templates/motion-tokens.template.css` — thời lượng theo vai, easing theo vai (đổi tên
easing cá tính cho hợp hướng), quãng dịch, so le. Một câu mô tả "cảm giác" để người sau giữ nhịp: <…>

### A5. Nguyên tắc của hướng

- **Làm:** <3–5 điều — "chữ tiêu đề luôn lớn hơn ảnh", "chuyển động đi từ dưới lên như hơi nóng">
- **Không làm:** <3–5 điều — "không bóng đổ", "không bo góc > 4px", "không hiệu ứng nảy ở công cụ nội bộ">
- **Công cụ nội bộ (N50):** <rút gọn của hướng: màu nhấn giữ, chuyển động chỉ phản hồi>

---

## B. Chuyển động cho tính năng: <tên> (<ngày>)

**Thiết kế UX gốc:** `docs/design/<…>-ux.md` · **Bản mẫu:** `docs/design/prototypes/<…>.html`
**Khoảnh khắc chữ ký (tối đa một):** <mô tả> — phần tử LCP có tham gia không? (phải là KHÔNG — chỉ lớp trang trí)

### B1. Bảng chuyển động

| # | Kích hoạt | Phần tử | Thuộc tính | Thời lượng | Easing | Trễ / so le | Lặp? Dừng thế nào | Giảm chuyển động | Mục đích |
|---|---|---|---|---|---|---|---|---|---|
| 1 | vào màn | lớp trang trí sau tiêu đề | `transform`, `opacity` | `--dur-dan-dung` | `--ease-vao` | 0 | không | bỏ | cá tính |
| 2 | nhấn nút Đặt | nút | `transform: scale` | `--dur-phan-hoi` | `--ease-doi` | 0 | không | giữ (1ms) | phản hồi |
| 3 | gửi thành công | thẻ xác nhận | `transform`, `opacity` | `--dur-chuyen-canh` | `--ease-ca-tinh` | 0 | không | mờ dần, không dịch | nối ngữ cảnh |

Soát bảng: mọi dòng có token (không số tự do) · thuộc tính ngoài `transform`/`opacity` ⇒ ghi lý do + "một lần,
không lặp" + đã nhờ `kiem-toan-vien` (hiệu năng) đo (N44) · tự chạy > 5s ⇒ có nút dừng (N47) · mọi dòng có cột giảm chuyển động.

### B2. Micro-interaction

| Thành phần | Nghỉ | Rê | Nhấn | Focus | Đang xử lý | Thành công | Lỗi | Vô hiệu |
|---|---|---|---|---|---|---|---|---|
| Nút chính | | | | viền focus thấy được (N47) | | | | |
| Ô nhập | | | | | — | | rung nhẹ? (giảm chuyển động: không) | |

### B3. Rủi ro cần đo

- <hiệu ứng cuộn phần X — INP trên máy yếu> → `kiem-toan-vien` (hiệu năng)
