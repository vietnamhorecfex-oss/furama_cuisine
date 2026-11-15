---
name: dung-ci-giam-sat
description: Dựng cổng tự động và hệ thống báo động cho một project — pipeline CI chạy đúng cổng tĩnh của stack trên mỗi nhánh, kiểm trước khi merge, triển khai có người bấm; theo dõi lỗi production, kiểm sống (uptime), cảnh báo hạn mức, và ai nhận báo động. Dùng khi người dùng nói "CI", "CI/CD", "GitHub Actions", "pipeline", "tự động deploy", "chạy test tự động", "giám sát", "monitoring", "Sentry", "uptime", "cảnh báo", "site sập mà không ai biết", hoặc ở project sắp có người dùng thật mà chưa có hai thứ này.
---

# Dựng CI & giám sát

Hai lỗ mà mọi quy trình khác của kit không tự lấp: (1) cổng tĩnh chỉ chạy khi ai đó NHỚ chạy, và (2) `/xu-ly-su-co` chỉ
bắt đầu khi có người BÁO — nghĩa là khách đã chịu lỗi trước đội. CI lấp lỗ thứ nhất, giám sát lấp lỗ thứ hai. Cả hai
phải rẻ, ít báo động giả, và nói được nên làm gì (N24).

Mới từ bản 2.0, CHƯA qua dự án thật.

## Khi nào dùng

- Project có ≥ 2 người/agent cùng sửa, hoặc sắp có người dùng thật.
- Sau một sự cố mà đội biết muộn (bước hậu kiểm của `/xu-ly-su-co`).
- KHÔNG dựng CI cho bản thử một người chưa có người dùng — ghi vào "Còn nợ" kèm điều kiện dựng.

## Các bước

1. **Khảo sát** — giao `van-hanh-trien-khai`: nơi chứa mã (GitHub/GitLab…), nơi host và cách deploy hiện tại, mục Lệnh +
   hồ sơ stack (cổng tĩnh là gì, mất bao lâu), phép thử nào cần DB/dịch vụ, bí mật nào cần, gói miễn phí của CI (số
   phút) và của dịch vụ giám sát (N35). *Xong khi:* có bảng "lệnh · thời gian · cần gì" cho từng cổng.

2. **Câu hỏi chính sách cho chủ dự án** (một lượt — N57): nhánh nào được bảo vệ · ai được merge · deploy production tự
   động hay phải có người bấm (kit đề xuất: PHẢI có người bấm — N59) · ai nhận báo động, qua kênh nào, ngoài giờ thì sao ·
   dùng dịch vụ giám sát nào (trả tiền hay miễn phí).

3. **CI — cổng trên mỗi nhánh**: một pipeline chạy ĐÚNG các lệnh trong hồ sơ stack (kiểm kiểu, lint, phép thử, build),
   không tự chế lệnh riêng cho CI — CI và máy người làm phải chạy cùng một thứ. Cache phụ thuộc. Phép thử cần DB ⇒ DB
   dịch vụ tạm của CI, KHÔNG trỏ DB thật. Bí mật khai trong kho bí mật của CI, không trong file; nhánh từ fork không
   nhận bí mật. *Xong khi:* một nhánh thử cố ý làm đỏ từng cổng ⇒ CI đỏ đúng cổng đó (N39), sửa lại ⇒ xanh.

4. **Bảo vệ nhánh chính**: bắt buộc CI xanh trước khi merge; không đẩy thẳng. Đây là thay đổi cài đặt kho mã — hỏi trước
   khi bật (N59).

5. **Triển khai**: giữ cách deploy đang chạy tốt. Thêm tự động thì: migration trước, deploy sau (N31); bước production có
   cổng người bấm; sau deploy chạy ma trận kiểm khói (vài URL + một API đọc) và có lệnh rollback ghi sẵn (N36). Cron đặt
   ở CI/nền tảng ⇒ route được gọi phải gác bằng bí mật (N61).

6. **Giám sát** — ba lớp, từ rẻ tới đủ:
   - **Kiểm sống**: gọi định kỳ trang chính + một endpoint sức khoẻ có CHẠM DB (endpoint chỉ trả 200 cứng là báo "sống"
     khi DB đã chết). Báo khi lỗi liên tiếp N lần, không phải một lần.
   - **Theo dõi lỗi**: lỗi server và lỗi trình duyệt gửi về một nơi, có phiên bản phát hành để biết lỗi mới từ bản nào.
     Che dữ liệu cá nhân, không gửi body/cookie/bí mật (N30).
   - **Hạn mức**: cảnh báo ở 70–80% cho từng dịch vụ có trần (DB, băng thông, email, mô hình AI) — N35.

7. **Báo động nói được nên làm gì** (N24): mỗi loại báo động một dòng trong `docs/tri-thuc/van-hanh.md` — nghĩa là gì ·
   kiểm gì trước · lệnh/nút khẩn cấp · gọi ai. Thử thật: tạo một lỗi có chủ đích ở môi trường thử ⇒ báo động tới đúng
   người trong thời gian mong đợi.

8. **Ghi tri thức** (`/ghi-bai-hoc`): lệnh CI = lệnh nào trong `CLAUDE.md`, nơi xem lỗi, ai nhận báo, hạn mức gói CI/giám
   sát, đường rollback.

## Checklist

- [ ] CI chạy đúng lệnh của hồ sơ stack/`CLAUDE.md`; không có lệnh "chỉ CI mới chạy".
- [ ] Đã cố ý làm đỏ từng cổng để thấy CI bắt được (N39).
- [ ] CI không chạm DB/dịch vụ thật; bí mật ở kho bí mật; không in bí mật ra log (N30).
- [ ] Deploy production có người bấm; migration trước deploy; có lệnh rollback đã ghi (N31, N36, N59).
- [ ] Endpoint sức khoẻ chạm DB; báo động theo chuỗi lỗi, không theo một lần.
- [ ] Theo dõi lỗi không gửi dữ liệu cá nhân/bí mật; có gắn phiên bản phát hành.
- [ ] Cảnh báo hạn mức cho mọi dịch vụ có trần; hạn mức gói CI/giám sát ghi trong `CLAUDE.md` (N35).
- [ ] Mỗi loại báo động có dòng "nên làm gì"; đã thử một báo động thật tới đúng người (N24).
- [ ] Bật bảo vệ nhánh / đổi cài đặt kho mã / đăng ký dịch vụ mới: đã hỏi chủ dự án (N57, N59).

## Mẫu

```yaml
# .github/workflows/kiem.yml — chạy ĐÚNG cổng tĩnh trong hồ sơ stack, không hơn không kém
name: kiem
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  cong-tinh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }   # phiên bản đọc từ project, không gõ tay
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm test --if-present
      - run: npm run build
```

```markdown
| Báo động | Nghĩa là | Kiểm trước | Làm gì | Gọi ai |
|---|---|---|---|---|
| Kiểm sống /api/health đỏ 3 lần | server hoặc DB không trả lời | trang trạng thái nơi host, hạn mức DB | `/xu-ly-su-co`; rollback bản gần nhất nếu vừa deploy | <tên> |
| Hạn mức DB 80% | sắp bị chặn truy vấn | bảng nào lớn nhất | xoá nhật ký cũ theo `docs/tri-thuc/…`, báo chủ dự án nâng gói | <tên> |
```

## Đầu ra

File pipeline + cài đặt bảo vệ nhánh (đã được duyệt) + endpoint sức khoẻ + cấu hình theo dõi lỗi/kiểm sống/cảnh báo hạn
mức + bảng báo động trong `docs/tri-thuc/van-hanh.md` + mục `CLAUDE.md` cập nhật.
