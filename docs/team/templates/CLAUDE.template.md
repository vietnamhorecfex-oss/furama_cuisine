# CLAUDE.md

> Hiến pháp của dự án — nạp vào MỌI phiên làm việc, nên **giữ dưới ~40KB** (N05). Mục nào dài quá ~40 dòng thì
> chuyển chi tiết sang `docs/tri-thuc/<chu-de>.md`, ở đây giữ 3–5 dòng luật bất biến + đường dẫn.
> Cách ghi: luật · vì sao · cạm bẫy đã sập · `MM/YYYY` · số đo (xem mục *Cách ghi vào file này* ở cuối, và skill
> `/ghi-bai-hoc`). Không ghi thứ code hoặc `git log` đã tự nói rõ.
>
> `AGENTS.md` (nếu có) chỉ chứa một dòng trỏ về file này — không bao giờ là bản sao (N04).

## Dự án

<Một đoạn: sản phẩm là gì, cho ai, giai đoạn nào (MVP / scaffold / đang chạy thật). Phần nào là logic THẬT, phần nào
cố ý là placeholder.>

- **Stack:** <vd Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres + Storage)>
- **Ngôn ngữ:** comment code + chữ giao diện bằng **<tiếng Việt>**; giao diện khách có <N> ngôn ngữ: <vi, en, …>.
- **Nguồn thiết kế có thẩm quyền:** <Figma / link> — trang chưa dựng thì dựng theo nguồn này.
- **Thuật ngữ / slug:** <vd `dat-ban` = đặt bàn, `xac-nhan` = xác nhận…>
- **Người quyết chính sách:** <chủ dự án / PO — tên vai trò>. Mọi lựa chọn chính sách ghi rõ là lựa chọn (N57).

## Lệnh

<Chép từ hồ sơ stack của project (`docs/team/stacks/`), rồi sửa theo thực tế — khối dưới là bản Next.js.>

```bash
npm run dev          # dev server
npm run build        # build production — gồm type-check
npm run lint
npx tsc --noEmit     # chỉ type-check
node --test          # test runner (L3) — <thư mục test>
node --no-warnings scripts/check-<chu-de>.mjs   # phép thử luật thuần — danh sách ở mục Tính năng
```

- **Cổng tối thiểu trước khi nói "xong":** tsc + lint + build + mọi phép thử liên quan + kiểm hành vi thật (N40,
  skill `/kiem-chung-thuc`).
- **Tài khoản demo:** <tài khoản / mật khẩu> — *kiểm lại lần cuối DD/MM/YYYY* (ghi chú demo hay lỗi thời — N03).
- **Môi trường:** DB dev **tách** khỏi production (L2). <URL dev / staging / production>. Không bao giờ chạy script
  ghi vào production từ máy dev mà chưa qua `/migration-va-trien-khai`.

## Đội & quy trình

- Agent ở `.claude/agents/`, skill ở `.claude/skills/`, nguyên tắc ở `docs/team/NGUYEN-TAC.md` (trích mã `Nxx`).
- Nhánh đã cài + stack: `docs/team/VERSION`. Hồ sơ stack: `docs/team/stacks/` — lệnh ở mục Lệnh trên đây thắng hồ sơ.
  Quy trình nhắc agent của nhánh chưa cài ⇒ cài thêm (`install.sh . --nhanh <ten>`) hoặc giao `general-purpose` kèm
  thân file agent trong skill team-agency.
- Việc mới chưa rõ loại/cỡ: `/tiep-nhan`. Chưa rõ có đáng làm: `/danh-gia-y-tuong`. Chọn công nghệ: `/nghien-cuu`.
- Việc dài hơn một buổi: `/quy-trinh-tinh-nang` — spec (`docs/specs/`) → plan (`docs/plans/`) → làm → `/ra-soat-truoc-merge`
  → `/kiem-chung-thuc` → `/migration-va-trien-khai` → `/ghi-bai-hoc`.
- Thêm cửa ghi (API/form/webhook/cron): `/cua-ghi-moi`. Thêm luật nghiệp vụ: `/phep-thu-thuan`. Script đụng dữ liệu:
  `/script-du-lieu`. Nối dịch vụ ngoài: `/tich-hop-dich-vu-ngoai`. Tối ưu: `/do-hieu-nang` (đo trước).
- Thêm/sửa module: `/kien-truc-module`. Phát APK: `/phat-hanh-apk`. Tính năng gọi mô hình: `/tinh-nang-ai`. Phép thử tự
  động: `/viet-kiem-thu`. CI + báo động: `/dung-ci-giam-sat`. Đợt nội dung: `/chien-dich-noi-dung`. Giao khách: `/ban-giao`.
- <XOÁ dòng nhắc quy trình của nhánh project không cài.>

## Kiến trúc

### Module <xoá mục này nếu project không dùng MCA>

MCA 2.0 — `docs/kien-truc.md`. Thuật ngữ: `CONTEXT.md`. Quyết định: `docs/adr/` (trục chia: <ADR 0001>). Máy kiểm:
`<npm run lint:arch>` — baseline <0> vi phạm (đo DD/MM/YYYY). Đọc `module.manifest.md` trước khi sửa một module (N64).

### App di động <xoá mục này nếu không có>

- Thư mục `<mobile-app/>` · Flutter <x.y> · dùng chung API `<https://…/api/v1>` (không backend riêng — N69).
- Lệnh: `flutter analyze` (baseline <n>) · `flutter test` (gồm `architecture_test`) · phát hành: `/phat-hanh-apk`.
- Khoá ký release: `<đường dẫn>` — sao lưu ở `<nơi>`; `android/key.properties` không vào git (N72).
- Cổng phiên bản: `GET <…/app-version>` (public); sửa ở `<màn admin>` (N73). Phiên bản đang phát: <X.Y.Z+N, ngày>.
- Chạy nền / thông báo: <foreground service `specialUse` | push APNs/FCM> — giới hạn đã biết: <…> (N74).

### Tầng dữ liệu `<lib/db.ts>` là backend — đọc trước khi đụng nghiệp vụ

<Route/API chỉ là lớp mỏng; luật nghiệp vụ THẬT nằm ở đây (N12). Liệt kê các bất biến — mỗi dòng một luật kèm vì sao.>

- **State machine `<thực thể>`:** `<a> → <b> → <c> | <d>`. Không có hàm set-status chung; chuyển trạng thái chỉ qua
  các động từ `<verbA>`, `<verbB>`…, guard trạng thái nguồn nằm trong chính câu UPDATE (N13).
- **Mọi cửa ghi `<thực thể>` gọi `assert<Thực thể>Shape`** (N15) — <liệt kê: ngày có thật, biên số, định dạng liên hệ>.
- **Các cửa vào và ngữ nghĩa khác nhau:**

  | Cửa | Ai gọi | Trạng thái đầu | Khác biệt |
  |---|---|---|---|
  | `<createPublicX>` | khách | `<pending>` | <…> |
  | `<createStaffX>` | nhân viên | `<confirmed>` | <định danh lấy từ phiên> |

- **Tham số chính sách bắt buộc:** `<assertWindow(…, policy: "enforce" | "override")>` — cửa mới quên chọn là lỗi
  biên dịch (N14).
- **Chống gửi trùng ba lớp** cho mọi cửa submit (N17): `submittingRef` + idempotency key (`<lib/idempotency.ts>`) +
  UNIQUE một phần `idempotency_key`.
- **Tài nguyên giới hạn** (<voucher / lượt / credit>): giữ nguyên tử, các đường nhả: <liệt kê đủ> (N18).
- **Side effect sau khi ghi không bao giờ ném** (`<notify()>`); trạng thái ghi đúng sự thật (N19–N20).
- **Lỗi DB:** `if (error) throw new DbError(error.message)` — không phải `Error` (N21).

### Hợp đồng API

- **Envelope lỗi:** `{ error: { code, message } }` — `code` cho máy, `message` theo ngôn ngữ người dùng.
- **Mã trạng thái có chủ đích:** 201 tạo · 400 nhập sai/sai luồng · 401 chưa đăng nhập · 403 thiếu quyền · 404 không
  tồn tại hoặc ngoài phạm vi · 409 xung đột trạng thái · 429 quá số lần thử · 500 hạ tầng · 503 bảo trì.
- **Ánh xạ lỗi:** `<lib/apiError.ts> mapDbError()` — không catch phẳng thành 400.
- **Định danh từ phiên, không từ body** (N16). **Trả ra client qua whitelist** (N27).
- Route có tham số động trong Next 16: `params` là `Promise` — phải `await`.

### Một trường = một nguồn sự thật

<Mỗi field CMS sửa được ↔ chỗ trang công khai đọc nó (N07). Mỗi luật nghiệp vụ ↔ module thuần duy nhất (N08).>

| Field / luật | Nguồn duy nhất | Đọc ở |
|---|---|---|
| `<opening_hours>` | `<bảng.cột>` | `<trang A>`, `<JSON-LD>` |
| `<điều kiện mã hợp lệ>` | `<lib/offers.ts>` | form · server · admin |

- **Danh sách hằng tsc KHÔNG bắt được** (N11) — thêm `<ngôn ngữ / chi nhánh>` thì sửa cả: `<file 1>`, `<file 2>`.

### Frontend & định tuyến

- Server component đọc dữ liệu; client component chỉ giữ TRẠNG THÁI; nội dung SEO nằm trong HTML tĩnh (N46).
- <Trang nào tĩnh (SSG/ISR), trang nào động, vì sao. Không đọc `cookies()` trong trang cần tĩnh.>
- <Layout gốc, landmark, skip link, focus ring — N47.>

### Phân quyền

- Ma trận một nguồn `<lib/permissions.ts>`; route mới ⇒ thêm luật + chạy `node --no-warnings scripts/check-permissions.mjs`
  (N25). Thiếu quyền ⇒ 403, ngoài phạm vi ⇒ 404. Khớp đường dẫn trên bản đã giải mã.
- Mọi cửa đăng nhập đi qua `<lib/loginThrottle.ts>` (N29).

### Đa ngôn ngữ

- `<dictionaries/vi.ts>` là SHAPE; các ngôn ngữ khác annotate `: Dictionary` (N52). Lưu bản dịch CMS sparse.
- Ngày giờ theo múi giờ ĐỊA ĐIỂM `<Asia/Ho_Chi_Minh>`, so chuỗi `YYYY-MM-DD` (N53).

### SEO, GEO & đo lường

- Mọi trang có `description` riêng theo ngôn ngữ; canonical + hreflang; structured data dựng ở `<lib/seo.ts>` với `@id`
  cố định + `sameAs` (N23). Mã analytics qua whitelist định dạng (N28); không đo khu nội bộ; có kênh nguồn AI (N80).
- Đổi/xoá URL công khai ⇒ redirect vĩnh viễn trong cùng deploy; slug cũ ở `<redirects.json | cột old_slugs>` (N76).
- NAP + giờ một nguồn: `<CMS › Cài đặt › Liên hệ>`; Google Business / Bing Places / `<nền tảng khác>` sửa theo nguồn
  này (N77). Người giữ tài khoản: Google Business `<ai>`, Search Console `<ai>`, Bing Webmaster `<ai>`.
- Bot AI (N78) — quyết định: trích dẫn `<cho phép|chặn>`, huấn luyện `<cho phép|chặn>` — `<ai quyết · DD/MM/YYYY>`.
- Bộ câu hỏi GEO: `docs/tri-thuc/geo-bo-cau-hoi.md`; lượt đo gần nhất `<DD/MM/YYYY>`; rà `/kiem-tra-seo-geo` theo quý.

### Design system

- Token màu/font ở `<app/globals.css>`; trang khách và công cụ nội bộ là HAI hệ thị giác (N50).
- Chuyển động chỉ `transform`/`opacity`; animation vô hạn tự dừng ngoài màn hình; có nút dừng nếu tự chạy > 5s (N44, N47).
- Hướng thiết kế: `docs/design/huong-thiet-ke.md` (<hướng đã chọn — ngày>). Token chuyển động ở `<app/tokens-motion.css>`
  — code chỉ dùng `var(--dur-…)`/`var(--ease-…)`. Thiết kế từng tính năng + bản mẫu ở `docs/design/`.

### Hạ tầng & hạn mức

| Dịch vụ | Gói | Hạn mức | Đang ăn hạn mức nhất (đo DD/MM/YYYY) | Cảnh báo đặt ở |
|---|---|---|---|---|
| <DB> | <Free> | <egress 5GB/tháng> | <…> | <…> |
| <Kho ảnh> | <Free> | <…> | <…> | <…> |

<Hạn mức gói miễn phí là ràng buộc thiết kế (N35). Đường lùi + nút khẩn cấp (N36).>

## Luật bất biến (tóm tắt — mỗi dòng một luật)

**Phiên bản <1.0> · lập <DD/MM/YYYY> · sửa lần cuối <DD/MM/YYYY>**

<Danh sách ngắn để đọc lướt; chi tiết ở các mục trên. Mỗi plan đối chiếu từng luật nó chạm tới (Cổng đối chiếu); vi
phạm mà không có ngoại lệ được duyệt là phát hiện mức Cao ở `/soat-cheo-tai-lieu`. Ví dụ:>
- I-01 · `<referral_code>` bất biến sau khi tạo và không bao giờ nhận từ client.
- I-02 · Hoa hồng chỉ sinh ở `<completeBooking()>` — không ở check-in, không cho `no_show`.
- I-03 · <…>

**Sửa luật bất biến:** chỉ khi chủ dự án duyệt. Mỗi lần sửa: tăng phiên bản (bỏ/đổi nghĩa một luật ⇒ số đầu;
thêm luật ⇒ số giữa; sửa câu chữ ⇒ số cuối), ghi `(sửa DD/MM — vì …, ai duyệt)` cạnh luật, mã cũ không dùng lại cho
luật khác, và rà spec/plan ĐANG MỞ trong `docs/specs`, `docs/plans` xem có cái nào dựa vào luật cũ. Project đã có code:
chỉ ghi luật ĐANG đúng trong code/CI/ADR, không ghi luật mong muốn như thể đã có.

## Tính năng

<Mỗi tính năng 3–8 dòng: luật bất biến + lệnh phép thử + trạng thái migration + đường dẫn tri thức chi tiết. Chi tiết
dài → `docs/tri-thuc/<chu-de>.md`.>

### <Tên tính năng> (`<bảng>` — migration `<00xx>`, MM/YYYY)

- **Luật:** <một nguồn ở `lib/<chu-de>.ts`; chốt chặn ở `<hàm>`>.
- **Phép thử:** `node --no-warnings scripts/check-<chu-de>.mjs`.
- **Migration:** `<00xx>` PHẢI chạy trước deploy — **ĐÃ CHẠY DD/MM/YYYY** trên <DB chính, DB phụ>.
- **Đánh đổi đã biết:** <…>. **Còn nợ:** <…>.
- **Chi tiết:** `docs/tri-thuc/<chu-de>.md` · spec `docs/specs/<…>-design.md`.

## Hợp đồng lên production & còn nợ toàn dự án

- <Những thứ đang là bản tạm: rate limit in-memory, auth nhẹ, transaction chưa bọc… kèm kế hoạch thay (L7).>

## Cách ghi vào file này

Mỗi mục trả lời được năm câu: **luật là gì · vì sao · cạm bẫy nào đã sập (nếu có) · từ khi nào (`MM/YYYY`) · số đo nào
chứng minh**. Ví dụ đạt chuẩn (rút từ dự án gốc):

> - **`cancelBooking` có `.neq("status","cancelled")`** (07/2026) — chính câu UPDATE là khoá chống huỷ hai lần. Trước
>   đây update vô điều kiện theo id nên bấm Huỷ lần hai gửi THÊM một thư huỷ cho khách và trừ dư một lượt mã ưu đãi.
>   Thêm side effect mới vào `cancelBooking` thì nhớ nó chỉ chạy cho cú huỷ THẬT SỰ đổi trạng thái.

Ví dụ KHÔNG đạt: "Đã sửa lỗi huỷ booking." (không có luật, không có lý do, không ai biết phải giữ gì).
