---
name: kiem-tra-seo-geo
description: Rà SEO + GEO toàn site theo đợt — kiểm kê trang, URL/redirect, structured data, thực thể (NAP, Google Business), bot AI, index trên Google + Bing, rồi hỏi lại các trợ lý AI bằng bộ câu hỏi cố định và so với lượt trước. Dùng trước ngày ra mắt site, sau một đợt đổi định tuyến/slug, theo quý, hoặc khi người dùng nói "kiểm tra SEO", "audit SEO", "GEO", "AI có nhắc tới mình không", "ChatGPT nói sai về nhà hàng", "lên Google chưa", "rớt top", "tối ưu cho AI".
---

# Kiểm tra SEO & GEO

SEO kỹ thuật của kit rút từ lỗi thật ở Furama; phần GEO và SEO địa phương (N76–N80) CHƯA qua dự án thật. Quy trình này
vừa để rà, vừa để biến mỗi lượt rà thành số đo so được với lượt sau — không có số đo thì "đã tối ưu GEO" chỉ là cảm giác
(N80). Mỗi lượt kết thúc bằng bảng trước/sau, không bằng "nhìn chung ổn".

## Khi nào dùng

- Trước ngày ra mắt một site/trang công khai (bắt buộc — mục L11).
- Sau mỗi đợt đổi định tuyến, slug, cấu trúc ngôn ngữ, chuyển domain.
- Theo quý: chạy lại bước 6 (bộ câu hỏi GEO) + bước 5 (index) dù không đổi gì.
- Khi khách/chủ dự án báo Google hoặc trợ lý AI hiện thông tin sai/cũ. Nếu là lỗi code cụ thể ⇒ `/sua-loi`.

## Các bước

1. **Kiểm kê** — giao `chuyen-gia-seo-geo`: bảng mọi route công khai × ngôn ngữ (title, description, canonical,
   hreflang, sitemap, JSON-LD, status), theo khung *Đầu ra* của agent. Lấy danh sách route từ code + sitemap, không
   từ trí nhớ.
   *Xong khi:* mọi route công khai có một dòng; route có trong code mà thiếu trong sitemap (hoặc ngược lại) đã giải thích.

2. **URL + redirect** (N76): `git log --diff-filter=DR --name-status` trên thư mục route + bảng `old_slugs` từ lượt rà
   trước ⇒ danh sách URL cũ. Mỗi URL: `curl -sI` ⇒ MỘT bước 301/308 tới đích 200. Đổi domain/chuyển site ⇒ thêm
   danh sách backlink chính (Search Console › Liên kết) vào bộ kiểm.
   *Xong khi:* 0 URL cũ trả 404, 0 chuỗi redirect, 0 redirect dồn về trang chủ.

3. **Structured data + nội dung tĩnh**: validate JSON-LD từng loại trang (Rich Results Test / validator.schema.org);
   thực thể chính một `@id`, có `sameAs`; trang con có `BreadcrumbList`; `curl` HTML (không JS) thấy nội dung chính
   (N23, N46). Lấy mẫu ≥ 1 trang mỗi loại × mỗi ngôn ngữ.
   *Xong khi:* 0 lỗi validator; mọi cảnh báo có kết luận "sửa" hoặc "chấp nhận vì …".

4. **Thực thể bên ngoài + bot AI** (N77, N78):
   - Bảng NAP + giờ: CMS ↔ Google Business Profile ↔ Bing Places ↔ nền tảng đặt chỗ/đánh giá ↔ mạng xã hội. Không có
     quyền xem ⇒ nhờ chủ dự án chụp màn hình hoặc ghi "Chưa kiểm".
   - Bot: đọc quyết định trong `CLAUDE.md`; `curl -A "<UA>" -sI` cho từng nhóm (Googlebot, Bingbot, OAI-SearchBot,
     Claude-SearchBot, PerplexityBot, GPTBot, ClaudeBot) ⇒ khớp `robots` VÀ khớp thực tế (CDN/WAF có thể trả 403 dù
     `robots` mở). Chưa có quyết định ⇒ đưa câu hỏi chính sách cho chủ dự án (N57), dừng phần này.
   *Xong khi:* bảng thực thể đủ cột, mọi ô lệch có việc cần làm; mọi nhóm bot có kết quả thật khớp quyết định.

5. **Index + đo** (N80): Search Console (Trang › lý do không index; Hiệu suất 3 tháng) và Bing Webmaster (Index,
   Search Performance) — ghi số trang đã index / đã gửi, top lý do loại; analytics: phiên từ kênh nguồn AI trong
   kỳ. Cần đăng nhập ⇒ chủ dự án xuất số hoặc cấp quyền xem; không đoán số.
   *Xong khi:* có số của kỳ này đặt cạnh số kỳ trước (lượt đầu: ghi làm mốc).

6. **Bộ câu hỏi GEO**: mở `docs/tri-thuc/geo-bo-cau-hoi.md` (lượt đầu: tạo từ
   `docs/team/templates/geo-bo-cau-hoi.template.md` CÙNG chủ dự án — câu hỏi khách thật hay hỏi). Hỏi từng câu trên
   từng trợ lý trong bộ, phiên mới, không đăng nhập tài khoản doanh nghiệp, ghi nguyên văn ý chính: có nhắc thương
   hiệu không, trích URL nào, dữ kiện nào SAI. Không có cách tự hỏi trợ lý ⇒ đưa bộ câu hỏi cho chủ dự án chạy, dán
   kết quả lại — KHÔNG tự tưởng tượng câu trả lời của trợ lý.
   *Xong khi:* mọi ô câu hỏi × trợ lý có kết quả hoặc "Chưa kiểm vì …"; mọi dữ kiện SAI đã truy tới nguồn (trang nào
   của mình, hồ sơ ngoài nào, bài báo/danh bạ nào).

7. **Việc cần làm + giao**: gộp phát hiện theo mức (Cao: URL 404, thực thể sai giờ/địa chỉ, bot trích dẫn bị chặn;
   Vừa: thiếu JSON-LD/description, câu trả lời chính không ở đầu trang; Thấp: còn lại). Giao: code ⇒
   `ky-su-giao-dien` / `chuyen-gia-seo-geo`; nội dung ⇒ `bien-tap-noi-dung` (danh sách câu hỏi chưa trang nào trả
   lời được); hồ sơ ngoài + chính sách bot ⇒ chủ dự án (N57, N59).
   *Xong khi:* mỗi phát hiện có người nhận; sửa code đi qua `/kiem-chung-thuc`.

8. **Ghi số đo** — `/ghi-bai-hoc`: bảng trước/sau vào `docs/tri-thuc/seo-geo.md` + kết quả bước 6 vào
   `geo-bo-cau-hoi.md` (thêm cột ngày, không ghi đè lượt cũ). Cạm bẫy thật gặp lần đầu ⇒ đề xuất thay "rủi ro đã
   biết" của N76–N80 bằng bài học gốc.

## Checklist

- [ ] Kiểm kê từ code + sitemap; mọi route công khai có một dòng.
- [ ] Mọi URL cũ: một bước 301/308 tới 200; 0 dồn về trang chủ (N76).
- [ ] JSON-LD 0 lỗi validator; `@id` + `sameAs` + `BreadcrumbList`; nội dung chính trong HTML tĩnh (N23, N46).
- [ ] Bảng NAP + giờ đủ nguồn; lệch đã thành việc cho chủ dự án (N77).
- [ ] Bot: quyết định có người quyết + ngày; `curl -A` thật khớp quyết định, kể cả qua CDN/WAF (N78).
- [ ] Số Search Console + Bing + kênh AI kỳ này cạnh kỳ trước (N80).
- [ ] Bộ câu hỏi GEO: kết quả thật, không tưởng tượng; dữ kiện sai đã truy nguồn.
- [ ] Báo cáo tách "Đã kiểm chứng" / "Chưa kiểm" (N40); số đo đã ghi vào tri thức.

## Mẫu

```markdown
## Rà SEO/GEO — <site> — <kỳ/ngày>

**Tóm tắt:** 3 Cao · 5 Vừa · 4 Thấp. Index Google 142/150 (kỳ trước 120/150). Phiên từ AI 38 (kỳ trước 11).

### So với kỳ trước
| Chỉ số | Kỳ trước | Kỳ này |
|---|---|---|
| Trang đã index (Google / Bing) | 120 / 64 | 142 / 131 |
| URL cũ 404 | 6 | 0 |
| Câu hỏi GEO có nhắc thương hiệu | 3/12 | 7/12 |
| Dữ kiện SAI trong câu trả lời AI | 4 | 1 |

### Cao
1. ChatGPT + Perplexity nói đóng cửa 21:00 (thật: 22:00) — nguồn sai: Bing Places (N77). Việc: chủ dự án sửa Bing Places.
2. `/en/rooms/deluxe` 404 sau đổi slug 10/2026 (N76) — thêm redirect → `/en/rooms/deluxe-ocean`.

### Bộ câu hỏi GEO (trích)
| Câu hỏi | ChatGPT | Perplexity | Gemini |
|---|---|---|---|
| "resort gần Mỹ Khê có hồ bơi cho trẻ em" | có nhắc, trích /vi/tien-ich ✓ | không nhắc | có nhắc, giờ sai ✗ |

### Chưa kiểm
- Google Business Profile — chưa có quyền xem; chờ chủ dự án chụp màn hình.
```

## Đầu ra

Báo cáo theo mẫu + danh sách việc có người nhận + bảng trước/sau trong `docs/tri-thuc/seo-geo.md` + lượt mới trong
`docs/tri-thuc/geo-bo-cau-hoi.md`.
