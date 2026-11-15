---
name: do-hieu-nang
description: Giao thức đo và tối ưu hiệu năng có bằng chứng — chọn chỉ số, cố định môi trường, đo nhiều lượt lấy median, A/B xen kẽ, trace tìm nguyên nhân, một thay đổi một lần đo, ghi bảng trước/sau — kèm danh mục nghi phạm thường gặp. Dùng khi người dùng nói "trang chậm", "tối ưu tốc độ", "PageSpeed", "Lighthouse", "LCP/CLS/TBT", "giảm dung lượng", "API chậm", "build chậm", "tốn hạn mức".
---

# Đo hiệu năng

Tối ưu không đo là đoán, và đoán sai rất đắt: ở Furama từng đổ lỗi oan cho một hiệu ứng CSS vì cửa sổ đo trùng một
animation chạy bằng JS; từng định giảm số khổ ảnh để tiết kiệm hạn mức trong khi 88% hạn mức bị ăn bởi
transformation, không phải băng thông (N35, N42). Mọi kết luận ở đây phải có con số trước và sau.

## Khi nào dùng

Khi có triệu chứng chậm, khi chỉ số tụt, trước khi thêm thư viện/ảnh/font/script bên thứ ba vào trang công khai,
và khi hạn mức một dịch vụ tăng bất thường. Giao `kiem-toan-vien` (hiệu năng); sửa thì giao `ky-su-giao-dien` (trang) hoặc
`ky-su-nghiep-vu` (truy vấn, API).

## Các bước

1. **Chọn chỉ số khớp triệu chứng** — không đo "điểm" chung chung:
   | Triệu chứng | Chỉ số |
   |---|---|
   | Trang hiện chậm | LCP, byte trước LCP, phần tử LCP là gì |
   | Bố cục nhảy | CLS + nguồn từng `layout-shift` |
   | Bấm không ăn / giật | TBT, main-thread ms mỗi tương tác, long task |
   | Tải nhiều | tổng byte, số request, request trước lần vẽ đầu |
   | API/admin chậm | số VÒNG MẠNG tới DB (nối tiếp hay song song), byte trả về |
   | Build chậm/chết | số truy vấn mỗi trang prerender, kích thước entry cache |
   | Hạn mức tăng | phân bổ theo loại (lưu trữ / băng thông / transformation / egress) |
2. **Cố định môi trường**: production build (`npm run build && npm start`), không dev server; CPU throttle ×4 + mạng
   mô phỏng giống công cụ chấm (Lighthouse mobile); cùng máy, cùng trang, cùng ngôn ngữ; tắt extension.
3. **Đo nền**: ≥ 5 lượt, lấy **median**, ghi cả min/max. Một lượt không phải số đo.
4. **Tìm nguyên nhân bằng trace**, không bằng suy luận: Performance panel / `chrome://tracing`, Network theo thứ tự
   thời gian, `document.getAnimations()`. Cẩn thận thứ chạy bằng JS (`setInterval`, rAF) — lệnh pause animation
   CSS không chặn được nó, cửa sổ đo trùng nó là đổ lỗi oan.
5. **Một thay đổi, một lần đo.** Gộp ba thay đổi rồi đo là không biết cái nào có tác dụng, cái nào làm tệ hơn.
6. **A/B xen kẽ** (A, B, A, B…) thay vì 5 lượt A rồi 5 lượt B — loại nhiễu nhiệt độ máy, mạng, cache.
7. **Kiểm không vỡ**: ảnh chụp trước/sau trùng khớp (hoặc khác có chủ đích), a11y không đổi, nội dung SEO vẫn trong
   HTML tĩnh (N46).
8. **Ghi bảng trước/sau** vào tri thức kèm điều kiện đo — để người sau không "tối ưu" ngược lại (N42, `/ghi-bai-hoc`).
9. **Đánh đổi** nào phải chủ dự án chọn (giữ script tracking, chế độ nạp font) thì trình bày số và hỏi (N57).

## Nghi phạm thường gặp — soát theo thứ tự

1. **Prefetch theo viewport**: mỗi link trong màn hình đẻ vài request RSC. Đo được 68 request ≈ 421KB → tắt, nạp
   theo ý định (hover/touch) còn 2 request ≈ 3KB (N45).
2. **`sizes` sai bề vẽ**: `100vw` cho thẻ có lề ⇒ tải dư một bậc ảnh. Tính `calc(100vw - <lề>)` (N45).
3. **Ảnh trang trí tải cùng ảnh LCP**: hoãn tới sau `window.load` + một `requestAnimationFrame`; `fetchPriority="low"`.
   `loading="lazy"` không đủ khi ảnh nằm trong ngưỡng lazy của trình duyệt (1250–2500px).
4. **Font**: cả bộ unicode-range, nhiều weight; giữ subset ngôn ngữ thật + ít weight; `display: optional` cho font
   gây đổi số dòng (CLS).
5. **Transition/animation ngoài compositor** (`background-color`, `box-shadow`, `text-shadow`, `filter`) ⇒ chuyển
   sang lớp `opacity`/`transform` (N44). Animation vô hạn không pause ngoài màn hình.
6. **Vòng mạng nối tiếp** ở API: gộp `Promise.all`; đếm bằng `count` thay vì kéo hàng (N43).
7. **Entry cache vượt trần** (Next Data Cache 2MB): không bao giờ được cache ⇒ mỗi trang query lại cả bảng. Bỏ cột
   nặng khỏi đường danh sách, cache theo khoá nhỏ (N43).
8. **Middleware chạy mọi request** chỉ để làm việc cấu hình tĩnh làm được (rewrite/redirect).
9. **Script bên thứ ba** (analytics, pixel, chat): `lazyOnload`; đo riêng phần của chúng để chủ dự án quyết.
10. **Thay đổi thuộc tính toàn cục sau hydrate** (`<html lang>`, class theme) ⇒ tính lại style cả trang; đặt sớm
    bằng script inline trong `<head>`, chỉ gán khi khác giá trị.

## Checklist

- [ ] Chỉ số khớp triệu chứng; môi trường ghi rõ (build, throttle, khổ màn, ngôn ngữ).
- [ ] ≥ 5 lượt, median; A/B xen kẽ.
- [ ] Nguyên nhân có bằng chứng trace, không phải suy đoán.
- [ ] Mỗi thay đổi đo riêng.
- [ ] Ảnh chụp trước/sau, a11y, HTML tĩnh không bị phá.
- [ ] Bảng trước/sau đã ghi vào tri thức (N42).

## Mẫu

```markdown
### <Tối ưu X> (MM/YYYY)
Điều kiện: production build · Lighthouse mobile · CPU ×4 · 412px · trang `/` VI · 5 lượt, median.
| Chỉ số | Trước | Sau | Thay đổi |
|---|---|---|---|
| LCP | 6,93s | 4,79s | chỉ mount ảnh tầng đang hiện + nạp trước 1 tầng kế |
| Request trước LCP | <n> | <n> | |
Đánh đổi: <gì> — chủ dự án chọn <gì> ngày <…>.
Đừng: <thứ trông giống tối ưu nhưng đã đo là không có tác dụng / làm tệ hơn>.
```

## Đầu ra

Báo cáo: triệu chứng → chỉ số → nguyên nhân (bằng chứng) → thay đổi → bảng trước/sau → đánh đổi cần chủ dự án quyết.
