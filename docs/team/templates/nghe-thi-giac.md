# Nghề thị giác — màu, chữ, chiều sâu, chuyển động

> Sổ tay của `giam-doc-sang-tao`. Đi kèm `thu-vien-chuyen-dong.html` (trang mẫu CHẠY ĐƯỢC — mở bằng trình duyệt, chép
> công thức) và `do-tuong-phan.template.mjs` (đo tương phản bằng điểm ảnh). Mọi con số dưới đây rút từ lượt dựng trang
> mẫu đó (11/2026): bản đầu tiên trông "ổn" và trượt 5 chỗ khi nhìn lại ảnh chụp, thêm 4 chỗ khi đo.

## 0. Vòng làm việc — không bỏ bước nào

**Tham chiếu → giải mã → dựng bản mẫu → CHỤP → tự phê bình trên ảnh → đo → sửa → chụp lại.** Tối thiểu HAI vòng trước khi
đưa chủ dự án. Không nhìn ảnh chụp bản mình dựng thì không biết nó đẹp hay không — code đọc lên luôn có vẻ đúng.

## 1. Giải mã ảnh tham chiếu (chủ dự án đưa, hoặc `nghien-cuu-vien` tìm 3–5 ảnh cùng ngành)

Không chép — tìm xem ĐIỀU GÌ làm nó đẹp, rồi dùng điều đó cho nội dung và thương hiệu của mình.

| Hỏi | Ví dụ: màn đầu "chủ thể xuyên chữ" |
|---|---|
| Thứ gì hút mắt đầu tiên, vì sao? | chủ thể lớn giữa màn, đè lên chữ khổng lồ ⇒ có trước–sau |
| Mấy lớp, xếp thế nào? | nền chuyển màu → chữ khổng lồ → chủ thể → thẻ kính + lời |
| Màu lấy từ đâu? | từ chính chủ thể: nền, nút, thẻ cùng một sắc độ; MỘT điểm màu đối |
| Chữ: mấy họ, tương phản cỡ? | 2 họ — serif mảnh cho chữ lớn, sans cho phần đọc; cỡ lớn/nhỏ chênh ~15 lần |
| Khoảng trắng nằm đâu? | quanh chủ thể; lời dồn về một góc |
| Chuyển động ngầm định? | chữ lớn trượt lên so le, thẻ nổi lên, số đếm, lớp dịch nhẹ theo con trỏ |
| Thứ KHÔNG nên lấy? | chữ trắng trên nền sáng (tham chiếu hay hy sinh tương phản) |

## 2. Màu

- **Một sắc độ sinh cả hệ.** Chọn `--h` (lấy từ ảnh chủ thể hoặc màu thương hiệu), mọi màu khác tính từ nó bằng `oklch`:
  nền `96% .03` → `84% .08` → `56% .13` · chữ `24% .06`, chữ phụ `36% .06` · nhấn `48% .19` · kề `74% .13` ở `h+38` ·
  điểm `80% .16` ở `h+150`. Đổi `--h` là đổi thương hiệu — thử ≥ 3 sắc độ trước khi chốt.
- **Màu KỀ pha vào nền được; màu BỔ TÚC thì không** — bổ túc trộn vào nền ra xám bùn. Bổ túc chỉ cho chi tiết nhỏ (≤ 5%
  diện tích): một biểu tượng, một dấu, mỏ con chim.
- **Nền có chiều sâu**: sáng ở trên, trung tính ở dưới; không một màu phẳng. Khối màu mờ lớn (blur tĩnh) trôi chậm.
- **Chữ trắng trên nền chuyển màu cần lớp tối CỤC BỘ** phía sau đúng chỗ có chữ (gradient toả từ góc có chữ). Đo bằng điểm
  ảnh: mắt thường thấy ổn ở 1.8:1.
- **Cùng độ sáng `L` KHÔNG cho cùng tương phản giữa các sắc độ**: nút `52%` đạt 5.2:1 ở xanh dương, 4.49:1 ở lục. Đo
  từng sắc độ, đừng suy ra.
- **Đầu sáng của gradient kéo chữ rớt ngưỡng**: chữ trắng trên gradient nhấn→nhấn-nhạt đo được 3.3:1 ở đầu nhạt.
- Bóng đổ mang sắc độ của nền (`oklch(30% .12 h / .45)`), không xám đen. Thẻ kính: trắng `/.7` + viền trắng `/.75` 1px.

## 3. Chữ

- **Hai họ là đủ**: một họ trưng bày (serif mảnh, hoặc grotesk đậm) + một họ đọc. Họ trưng bày PHẢI có đủ dấu tiếng Việt —
  thử chuỗi `ẢÂỆỮ ường nghiêng` trước khi chọn; thiếu dấu là trình duyệt thay bằng họ khác ngay giữa chữ.
- **Tương phản cỡ thật sự**: chữ khổng lồ `clamp(5rem, 23vw, 21rem)` cạnh chữ thân 15–16px. Thang 16/20/24 không tạo ra gì.
- **Chữ khổng lồ là TRANG TRÍ** (`aria-hidden`, nằm sau chủ thể, trắng `/.7`); tiêu đề thật là `h1` nhỏ hơn, hiện NGAY.
  Dấu thanh của chữ hoa cần chừa chỗ phía trên (`line-height ≥ .9`, đẩy xuống 10%).
- Chữ lớn: `letter-spacing` ≥ 0, `line-height` 0.9–1.1. Chữ thân: dòng 45–75 ký tự, `line-height` 1.5–1.6.

## 4. Bố cục & chiều sâu

- **Năm lớp** từ sau ra trước: nền chuyển màu → khối màu mờ → chữ khổng lồ → chủ thể → thẻ kính + lời. Mỗi lớp một
  `z-index`, một hệ số thị sai khác nhau.
- **Chủ thể phải ĐÈ lên chữ** ít nhất 1/3 chiều cao chữ — chạm mép dưới chữ thì mất chiều sâu (lỗi bản đầu). Ảnh chủ thể
  tách nền (PNG/AVIF có alpha), đáy tan dần bằng `mask-image` để hoà vào nền.
- **Thẻ kính ≤ 4 mỗi màn** (`backdrop-filter` đắt), không animate blur, có nền dự phòng `@supports not`. Thẻ đè lên chủ thể
  một phần càng tăng chiều sâu.
- **Điện thoại: XẾP LẠI, không co lại.** Chủ thể nằm giữa chữ lớn và lời — không để thẻ che mất (lỗi bản đầu). Lớp tối
  đổi sang chiều dọc vì lời nằm dưới.
- **Chọn công thức màn đầu theo tài sản có thật**: có ảnh chủ thể đẹp ⇒ *chủ thể xuyên chữ* hoặc *toàn ảnh + thẻ nổi* ·
  không có ảnh ⇒ *chữ làm chủ thể* (chữ lớn chuyển động) hoặc *lưới ô* (bento) · nhiều nội dung ⇒ *chia đôi lệch*. Đừng
  dựng công thức cần ảnh đẹp rồi lấp bằng ảnh stock.

## 5. Chuyển động (công thức ở `thu-vien-chuyen-dong.html`)

- **Dàn dựng vào màn** — thứ tự: chữ khổng lồ trượt lên so le từng chữ → chủ thể co nhẹ `1.07 → 1` (KHÔNG mờ: nó là LCP) →
  thẻ nổi lên so le → số đếm. Tổng ≤ 1.2s, so le 60–70ms, tối đa ~6 phần tử một nhóm. `h1` và lời hiện ngay.
- **Sống sau khi vào màn**: thẻ trôi nhẹ ±7px (lệch pha), khối màu nền trôi 26–34s, lớp dịch theo con trỏ ≤ 18px.
- **Phản hồi**: nút co `.96` khi nhấn, mũi tên trượt khi rê, thẻ nghiêng theo con trỏ — chỉ cho chuột (`hover: hover`).
- **MỘT khoảnh khắc chữ ký mỗi màn.** Mười hiệu ứng nhỏ rải rác không bằng một dàn dựng kỹ.

| Công thức | Dùng khi | Đừng dùng khi |
|---|---|---|
| Lộ diện khi cuộn | nội dung dưới màn đầu | phần tử là LCP; nhóm > 6 phần tử |
| Chữ lộ theo mặt nạ | tiêu đề trang trí, tiêu đề mục | tiêu đề chính của màn đầu |
| Thẻ nghiêng + vệt sáng | thẻ sản phẩm, voucher | màn chạm; lưới > 8 thẻ |
| Nút từ tính | MỘT nút chính của màn | nhiều nút cạnh nhau |
| Đếm số | con số là thông điệp chính | số cần đọc chính xác ngay (giá, giờ) |
| Chạy chữ vô hạn | dải thương hiệu, thực đơn gợi ý | nội dung phải đọc hết; không có nút dừng |
| Khung chờ | tải dữ liệu > 300ms | tải nhanh hơn thế (nháy) |
| Nút có trạng thái | mọi nút gửi dữ liệu | — |
| Đổi cả hệ màu | chủ đề theo mùa, sáng/tối | — |

Bốn luật không đổi: chỉ `transform`/`opacity` · chỉ token · có bản giảm chuyển động + dừng khi ra khỏi màn · nội dung vẫn
hiện khi JS hỏng (N44, N47).

## 6. Thang chấm — tự chấm trên ẢNH CHỤP, ≥ 11/14 mới đưa chủ dự án

Mỗi tiêu chí 0 (thiếu) · 1 (có) · 2 (rõ, đáng nhớ). Ghi điểm + một câu lý do vào `huong-thiet-ke.md`.

| Tiêu chí | Câu hỏi kiểm |
|---|---|
| Chiều sâu | Có ≥ 3 lớp chồng lên nhau thấy rõ trước–sau không? |
| Phân cấp | Nheo mắt lại: còn thấy MỘT thứ hút mắt và MỘT nút chính không? |
| Màu | Mọi màu truy được về một sắc độ + một màu điểm? Có vùng nào xám bùn, gắt, lạc tông? |
| Chữ | Cỡ lớn/nhỏ chênh ≥ 4 lần? Dấu tiếng Việt đủ, không bị cắt? |
| Nhịp | Khoảng trắng có chủ ý, hay mọi thứ cách đều nhau? |
| Chuyển động | Có dàn dựng vào màn + một khoảnh khắc chữ ký, hay chỉ mờ dần đồng loạt? |
| Độ riêng | Đặt cạnh ba trang đối thủ, có chi tiết nào họ không có? |

**Cổng cứng (trượt một cái là chưa xong, bất kể điểm):** `do-tuong-phan` đạt ở MỌI sắc độ/chủ đề × 2 khổ màn · 390px không
tràn ngang, chủ thể còn thấy · bản giảm chuyển động có 0 animation chạy · console không lỗi · chỉ `transform`/`opacity`
trong `document.getAnimations()`.

## 7. Lỗi hay gặp khi nhìn lại ảnh chụp

- Chủ thể quá nhỏ/thấp, không đè lên chữ ⇒ phẳng. · Chữ trắng trên vùng sáng. · Một góc gắt màu, một góc xám bùn.
- Hai nút lệch hàng; liên kết dạng nút còn gạch chân. · Logo tối trên nền tối sau khi thêm lớp tối cho chữ.
- Điện thoại: chủ thể bị thẻ che; chữ lớn bị cắt dấu. · Nút trắng trên thẻ trắng không có viền.
