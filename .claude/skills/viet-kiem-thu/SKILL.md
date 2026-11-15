---
name: viet-kiem-thu
description: Thêm phép thử tự động cho một tính năng, một bug vừa sửa, hoặc một vùng code chưa có phép thử — chọn tầng thử theo rủi ro (luật thuần / API / đầu-cuối trình duyệt), bám mã yêu cầu YC, viết đỏ trước, dữ liệu thử tự lập tự dọn, diệt chập chờn, nối vào lệnh kiểm và CI. Dùng khi người dùng nói "viết test", "thêm test", "test coverage", "e2e", "Playwright", "pytest", "test bị flaky", "chập chờn", "regression", "chưa có test".
---

# Viết kiểm thử

`/kiem-chung-thuc` chứng minh một thay đổi đúng HÔM NAY. Quy trình này để lại thứ chứng minh nó còn đúng sau mười lần
sửa nữa. Hai việc khác nhau, người làm khác nhau: `kiem-dinh-vien` kiểm một lần và không viết gì; `ky-su-kiem-thu` viết
phép thử và không tự kết luận tính năng đạt.

Mới từ bản 2.0, CHƯA qua dự án thật dưới dạng quy trình này; luật lấy từ N37–N41.

## Khi nào dùng

- Sau bước 3 của `/quy-trinh-tinh-nang` cho mọi YC chưa có phép thử tự động; sau `/sua-loi` nếu phép thử đỏ mới chỉ là
  một lệnh `curl` chạy tay.
- Vùng code cũ sắp bị sửa lớn mà chưa có lưới an toàn — viết phép thử ghim HÀNH VI HIỆN TẠI trước khi sửa.
- Luật nghiệp vụ thuần ⇒ dùng `/phep-thu-thuan` (chuyên cho tầng đó); quy trình này lo phần còn lại và việc phối hợp.

## Các bước

1. **Kiểm kê** — giao `ky-su-kiem-thu`: đọc mục Lệnh + hồ sơ stack: runner nào đang có, lệnh nào chạy, phép thử nào đang
   đỏ sẵn (ghi lại làm nền — không tính vào việc này). Lập bảng YC/ca biên/`error.code` → đã có phép thử nào.
   *Xong khi:* có bảng phủ hiện trạng và con số nền (bao nhiêu ca, bao lâu, bao nhiêu đỏ sẵn).

2. **Chọn tầng** cho mỗi ô trống — tầng rẻ nhất bắt được rủi ro đó:
   | Rủi ro | Tầng | Công cụ (theo hồ sơ stack) |
   |---|---|---|
   | tính toán, điều kiện, state machine | luật thuần | `scripts/check-*.mjs`, `node --test`, vitest, pytest |
   | cửa ghi, quyền, envelope, chống trùng, đồng thời | API trên server thật + DB thử | supertest/httpx/`curl` trong script |
   | luồng xuyên màn, thứ chỉ trình duyệt lộ | đầu-cuối | Playwright (`docs/team/templates/kiem-trinh-duyet.template.mjs`) |
   Đầu-cuối chỉ cho luồng chính/luồng tiền — mỗi kịch bản đầu-cuối thêm là thêm thời gian và thêm chỗ chập chờn.

3. **Viết đỏ trước** (N39): chạy và thấy đỏ VÌ ĐÚNG LÝ DO. Code đã đúng sẵn ⇒ tạm đảo điều kiện trong code (hoặc trong
   kỳ vọng) để thấy đỏ rồi trả lại — một phép thử chưa từng đỏ chưa chứng minh gì.

4. **Viết** theo quy ước project: tên = `<mã YC> <hành vi> (<mã lỗi>)`; mỗi phép thử một ý; kiểm kết quả quan sát được;
   dữ liệu tự lập, tự dọn; thời gian/ngẫu nhiên cố định; dịch vụ ngoài giả ở ranh giới.

5. **Chạy 3 lần liên tiếp** + chạy theo thứ tự ngẫu nhiên nếu runner hỗ trợ. Có lần đỏ không lặp lại ⇒ đó là chập chờn:
   tìm nguyên nhân (chờ cố định, phụ thuộc thứ tự, dữ liệu dùng chung, đồng hồ thật) — không "chạy lại cho xanh".

6. **Nối vào cổng**: phép thử mới chạy trong lệnh kiểm chuẩn của project; lệnh mới ghi vào mục Lệnh của `CLAUDE.md`; có
   CI ⇒ thêm vào (`/dung-ci-giam-sat`). Bộ chậm ⇒ tách nhóm nhanh / chậm.

7. **Phép thử lộ lỗi thật** ⇒ GIỮ ĐỎ, giao kỹ sư qua `/sua-loi` (đã có sẵn bước 2 của quy trình đó). Không sửa code sản
   phẩm, không nới kỳ vọng.

8. **Báo cáo** bảng phủ trước/sau; ô chưa phủ ghi lý do. `kiem-dinh-vien` kiểm định tính năng — người viết phép thử
   không tự kết luận.

## Checklist

- [ ] Dùng runner có sẵn của project; không thêm runner/thư viện khi chưa hỏi.
- [ ] Mỗi YC/TC/`error.code`: có phép thử, hoặc dòng "chưa phủ — vì …" (N81).
- [ ] Mỗi phép thử mới từng đỏ vì đúng lý do (N39).
- [ ] Có ca từ chối cho mỗi cửa ghi (quyền, phạm vi, hình dạng, gửi lặp) và ca biên của spec.
- [ ] 3 lần liên tiếp đều xanh; không `sleep` cố định, không phụ thuộc thứ tự / giờ thật / mạng ngoài.
- [ ] Dữ liệu thử đã dọn; DB dùng chung production ⇒ ngày xa + tiền tố `test-` + không thư thật (N59).
- [ ] Lệnh chạy + thời gian chạy đã ghi vào `CLAUDE.md`; đã vào CI nếu có.
- [ ] Không file sản phẩm nào bị sửa; phép thử lộ lỗi thật vẫn đỏ và đã giao.

## Mẫu

Bảng báo cáo: xem mục *Đầu ra* của agent `ky-su-kiem-thu`.

```ts
// Tên nói hành vi + mã yêu cầu; kiểm thứ quan sát được; dữ liệu tự lập tự dọn.
test("YC-03 từ chối đặt bàn vào ngày đã khoá (DATE_CLOSED) — cả cửa khách lẫn cửa lễ tân", async () => {
  const ngay = ngayXa(40);                       // N59: ngày xa, không đụng dữ liệu thật
  await khoaNgay(ngay, "4F");
  try {
    for (const cua of ["/api/bookings", "/api/staff/bookings"]) {   // cửa anh em (N14)
      const res = await goi(cua, { date: ngay, floor: "4F", guests: 2 });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("DATE_CLOSED");
    }
    expect(await demDon(ngay)).toBe(0);          // đọc lại DB: không dòng nào lọt
  } finally {
    await moKhoaNgay(ngay, "4F");
  }
});
```

## Đầu ra

Phép thử trong repo + bảng phủ trước/sau + lệnh và thời gian chạy trong `CLAUDE.md` + danh sách lỗi thật lộ ra (đang đỏ,
đã giao).
