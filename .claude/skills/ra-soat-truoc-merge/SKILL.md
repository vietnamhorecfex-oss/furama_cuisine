---
name: ra-soat-truoc-merge
description: Cổng rà soát trước khi merge một nhánh — đọc diff, phân loại thay đổi, gọi song song đúng các reviewer chuyên môn (bảo mật, hiệu năng, đa ngữ, SEO, nghiệp vụ), xác minh lại từng phát hiện bằng kịch bản cụ thể, rồi kết luận ĐẠT / CHƯA ĐẠT. Dùng khi người dùng nói "review", "rà soát", "soát code", "trước khi merge", "kiểm tra nhánh", "PR này ổn chưa".
---

# Rà soát trước merge

Mục tiêu không phải là nhiều phát hiện mà là phát hiện ĐÚNG: mỗi điểm báo ra phải kèm một kịch bản cụ thể dẫn tới
kết quả sai. Phát hiện chưa xác minh làm loãng báo cáo và dạy đội bỏ qua review.

## Khi nào dùng

Bước 4 của `/quy-trinh-tinh-nang`; mọi nhánh đụng dữ liệu, quyền, tiền, thư khách, trang công khai.

## Các bước

1. **Lấy diff**: `git fetch` (nếu có remote) rồi `git diff main...HEAD --stat` và `git diff main...HEAD`. Đọc spec +
   plan của nhánh (mục "Trọng điểm review" là danh sách soi bắt buộc).
2. **Phân loại** từng file đổi theo bảng dưới ⇒ ra danh sách reviewer cần gọi. Có spec mã YC ⇒ thay đổi không phục
   vụ YC/task nào là phát hiện mức vừa "Ngoài yêu cầu" (N81) — chủ dự án chọn thêm YC hay tách ra.
3. **Gọi SONG SONG** các reviewer (một lượt, nhiều agent): mỗi agent nhận diff + đường dẫn spec/plan + đúng các dòng
   "soi gì" của nó trong bảng. Yêu cầu mỗi phát hiện có: `file:dòng`, mức (cao/vừa/thấp), kịch bản (đầu vào/trạng
   thái → kết quả sai), mã Nxx vi phạm.
4. **Xác minh từng phát hiện** trước khi báo — chính mình hoặc `kiem-dinh-vien`: đọc lại code quanh dòng đó, dựng
   kịch bản (curl, phép thử, đọc luồng). Kết quả: XÁC NHẬN / CÓ THỂ (cần dữ liệu thật mới chắc) / BÁC (ghi lý do).
   Phát hiện bị bác không vào báo cáo.
5. **Soát chéo cửa anh em**: lỗi tìm thấy ở một cửa ghi ⇒ grep các cửa cùng loại; thường chúng hỏng y hệt (N14, N17).
6. **Tổng hợp** theo mức độ, cao nhất trước. Kết luận:
   - **ĐẠT**: không còn phát hiện mức cao; mức vừa có kế hoạch (sửa ngay hoặc ghi "Còn nợ" có lý do).
   - **CHƯA ĐẠT**: còn ít nhất một phát hiện mức cao được XÁC NHẬN.
7. Sau khi sửa: rà lại ĐÚNG các điểm đã báo + chạy lại cổng tĩnh (`/kiem-chung-thuc` bước 1).

## Đụng gì thì soi gì

| Thay đổi đụng | Reviewer | Soi |
|---|---|---|
| route API, server action, webhook, cron | `kiem-toan-vien` (bảo mật) + `ky-su-nghiep-vu` | xác thực → quyền → phạm vi (401/403/404), định danh từ phiên (N16), ma trận quyền có dòng mới (N25), envelope + mã đúng nguồn (N21), whitelist trả ra (N27), rate limit nếu công khai (N29) |
| tầng dữ liệu, migration | `ky-su-nghiep-vu` | luật ở cửa ghi thật (N12), động từ + guard trong UPDATE (N13), tham số chính sách bắt buộc (N14), assert shape (N15), chống trùng 3 lớp (N17), claim + mọi đường nhả (N18), side effect không ném (N20), đọc lỗi ở chốt chặn thì ném (N22), migration additive + thứ tự (N31) |
| luật nghiệp vụ | `ky-su-nghiep-vu` | một nguồn trong module thuần (N08), có phép thử, thứ tự ưu tiên lý do (N37) |
| auth, cookie, mật khẩu, bí mật | `kiem-toan-vien` (bảo mật) | không rò tồn tại (N26), secret không ra API (N30), chuỗi cấu hình nội suy qua whitelist (N28), khớp đường dẫn đã giải mã (N25) |
| trang công khai, component, CSS | `ky-su-giao-dien` + `kiem-toan-vien` (hiệu năng) | nội dung SEO trong HTML tĩnh (N46), a11y + nút dừng (N47), form giữ dữ liệu (N48), giá trị dẫn xuất dùng mọi chỗ (N49), transition compositor-only (N44), `sizes`/prefetch/ảnh trang trí (N45), chỗ trên màn hình (N51) |
| màn/luồng/form mới, chữ giao diện, câu lỗi | `nha-thiet-ke` | đi lại luồng + ÉP từng ô của ma trận trạng thái (rỗng, lỗi từng `error.code`, mất mạng), câu lỗi nói làm gì tiếp, tương phản + vùng chạm + thứ tự focus + `aria-live` cho lỗi (N47, N48), axe trong `kiem-trinh-duyet` sạch |
| animation, transition, token, trang công khai, khoảnh khắc chữ ký | `giam-doc-sang-tao` | ảnh chụp bản dựng cạnh ảnh bản mẫu (1440px + 390px): chiều sâu và màu còn nguyên, đúng token (không số tự do), đúng nhịp/easing/dàn dựng, khoảnh khắc chữ ký không bị dựng "an toàn hoá"; `do-tuong-phan` đạt trên nội dung thật; bản giảm chuyển động có; phần tử LCP không chờ hiệu ứng; chỉ `transform`/`opacity` cho thứ lặp (N44, N47) |
| ảnh, font, script bên thứ ba | `kiem-toan-vien` (hiệu năng) | byte khớp bề vẽ (N45), font subset, `lazyOnload`, hạn mức dịch vụ (N35) |
| chữ UI, từ điển, bản dịch | `chuyen-gia-da-ngu` | đủ mọi ngôn ngữ (tsc), không danh sách locale chép tay (N11), lưu sparse (N52), ngày theo địa điểm (N53) |
| metadata, sitemap, JSON-LD, robots, route công khai mới/đổi/xoá, slug | `chuyen-gia-seo-geo` | description mỗi trang, canonical/hreflang, structured data không khai man (N23), URL tuyệt đối cho ảnh CMS, URL cũ có redirect vĩnh viễn một bước (N76), NAP/giờ đọc từ một nguồn (N77), robots khớp quyết định bot AI (N78) |
| bài viết, nội dung dài | `bien-tap-noi-dung` | lint nội dung + ba điểm mù (N55), alt đúng ảnh (N56), link tới bài chưa đăng |
| gọi mô hình ngôn ngữ, prompt, RAG, nạp tài liệu | `ky-su-ai-du-lieu` + `kiem-toan-vien` (bảo mật) | đầu ra model qua schema + kiểm giá trị trước khi ghi (N15), model không quyết quyền/giá/trạng thái (N12), không nội suy thô vào chỉ dẫn hệ thống (N28), khoá + model id trong cấu hình (N30), timeout + đường lùi + trạng thái đúng (N19, N20), bộ đánh giá có bảng trước/sau (N39) |
| phép thử (`tests/`, `e2e/`, `scripts/check-*`) | `ky-su-kiem-thu` | tên mang mã YC (N81), từng đỏ (N39), không `sleep` cố định / phụ thuộc thứ tự / mạng ngoài, không giả chính thứ đang thử, dữ liệu thử tự dọn (N59), không phép thử nào bị `skip` thiếu lý do |
| script dữ liệu | `van-hanh-trien-khai` | chạy khô mặc định, co lại ⇒ dừng, merge JSON, không đè việc tay (N33) |
| CLAUDE.md, docs | `thu-ky-tri-thuc` | luật có vì sao (N01), câu cũ sai đã sửa (N03), < 40KB (N05) |
| `src/modules/**`, contract, manifest, luật `lint:arch` | `kien-truc-su` | `lint:arch`/`architecture_test` xanh (N63), manifest khớp contract (N64), contract có người dùng (N65), ngoại lệ ghi đích danh (N66), baseline di trú không tăng (N67) |
| thư mục app di động, `pubspec.yaml`, `android/`, `ios/` | `ky-su-di-dong` | luật không nằm riêng trong app (N69), SSE chỉ là tín hiệu + huỷ khi đăng xuất (N70, N75), plugin native đã thử trên máy thật (N71), keep.xml + khoá ký + ABI (N72), cổng phiên bản (N73), chạy nền theo chính sách OS (N74) |

## Checklist

- [ ] Đã đọc spec/plan; mọi "Trọng điểm review" có kết luận.
- [ ] Reviewer gọi song song, đúng bảng phân loại.
- [ ] Mọi phát hiện trong báo cáo có `file:dòng` + kịch bản + trạng thái xác minh.
- [ ] Đã soát cửa anh em cho mỗi lỗi ở cửa ghi.
- [ ] Kết luận ĐẠT/CHƯA ĐẠT theo tiêu chí, không "nhìn chung ổn".

## Mẫu

```markdown
## Rà soát `feat/<nhanh>` — CHƯA ĐẠT
Diff: 23 file (+1.204 −318). Reviewer: bảo mật, nghiệp vụ, giao diện, đa ngữ.

### Cao
1. `lib/db.ts:812` — `createStaffOrder` không gọi `assertOrderShape` (N15). Kịch bản: POST `/api/staff/orders`
   `{"date":"2026-02-31"}` → 201, dòng DB `scheduled_at = "2026-02-31T…"` → báo cáo kỳ sai. XÁC NHẬN (curl).
   Cửa anh em `createPublicOrder` đã có — đưa assert vào hàm dùng chung.
### Vừa
2. `app/[locale]/dat-ban/Form.tsx:140` — dùng `date` thay vì `effectiveDate` trong payload (N49). CÓ THỂ — chỉ lệch
   khi tầng chưa khai trương; cần dữ liệu tầng có `opening_date` tương lai để chắc.
### Đã bác
- "Thiếu rate limit ở /api/admin/x" — route gác `requireAdmin`, không công khai.

**Trọng điểm review:** 1 ✓ · 2 ✓ · 3 ✗ (xem phát hiện 1) · 4 ✓
```

## Đầu ra

Báo cáo theo mẫu + kết luận ĐẠT / CHƯA ĐẠT + danh sách việc cần sửa xếp theo mức độ.
