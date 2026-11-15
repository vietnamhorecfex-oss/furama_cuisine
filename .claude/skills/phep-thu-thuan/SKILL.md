---
name: phep-thu-thuan
description: Tách một luật nghiệp vụ khỏi I/O thành module thuần `lib/<chu-de>.ts` rồi viết phép thử chạy bằng Node (`scripts/check-<chu-de>.mjs` hoặc `node --test`) — cách project không có test runner vẫn có phép thử thật. Dùng khi người dùng nói "viết test", "thêm phép thử", "kiểm luật", "tách logic", "luật dùng chung client/server", hoặc khi vừa thêm một điều kiện "hợp lệ / trạng thái / được phép".
---

# Phép thử thuần

Ở Furama, 14 script `check-*.mjs` đóng vai test runner — chúng ghim những ca mà `tsc` + `build` không
thể thấy (qua nửa đêm, ngày 31/02, phạm vi tầng). Điều kiện để làm được: luật nằm trong module KHÔNG chạm I/O (N08, N37).

## Khi nào dùng

- Vừa viết (hoặc sắp viết) một câu hỏi kiểu "hợp lệ không / dùng được không / trạng thái gì / tính ra bao nhiêu".
- Cùng một điều kiện xuất hiện ở hơn một nơi (form + server + admin + báo cáo) — gom về một.
- Sửa một module thuần đã có: chạy lại phép thử của nó, không có thì viết.

## Các bước

1. **Tách luật.** Đưa hàm vào `lib/<chu-de>.ts`. Module CHỈ được `import type` — không import runtime nào, kể cả
   module thuần khác. *Xong khi:* `grep -n "^import " lib/<chu-de>.ts` chỉ ra dòng `import type`.
   Lý do: Node chạy thẳng file `.ts` bằng cách tháo type, nhưng (a) alias `@/…` không chạy trong Node, (b) import
   module `.ts` khác phải viết đuôi `.ts`, mà `tsc` từ chối đuôi đó khi chưa bật `allowImportingTsExtensions`.
   Không import gì là cách duy nhất không mâu thuẫn. Cần hằng của module khác thì nhận qua tham số.
2. **Thời gian là tham số.** Hàm nhận `today`/`now` từ người gọi (`todayInVenueTZ()` ở tầng dữ liệu), không tự
   gọi `new Date()` — vừa thử được, vừa chạy đúng ngoài vùng cache (N53).
3. **Nối luật vào mọi nơi dùng**: form (báo sớm), tầng dữ liệu (chốt chặn), admin (bộ lọc), báo cáo. Xoá các bản
   viết lại. *Xong khi:* `grep -rn "<tên điều kiện cũ>" app components lib` không còn bản sao.
4. **Viết phép thử** từ `docs/team/templates/check-luat.template.mjs` → `scripts/check-<chu-de>.mjs`. Mỗi ca là một
   câu tiếng Việt mô tả HÀNH VI. Phủ: ca thường · ca biên (bảng dưới) · ca "giá trị lạ phải bị từ chối".
   *Xong khi:* `node --no-warnings scripts/check-<chu-de>.mjs` in `✓` từng ca và thoát 0.
5. **Cố ý làm hỏng một lần.** Đảo một điều kiện trong luật, chạy lại — phải có ca đỏ. Không đỏ ⇒ phép thử không
   kiểm điều nó tưởng là kiểm (N39). Trả lại code.
6. **Ghi lệnh chạy** vào `CLAUDE.md` cạnh mục của module: "phép thử `node --no-warnings scripts/check-<chu-de>.mjs`,
   chạy sau mỗi lần sửa file này" (N02).

## Ca biên bắt buộc cân nhắc

| Loại | Ca |
|---|---|
| Ngày | `2026-02-31`, `2026-13-01`, `2028-02-29` (nhuận), qua tháng `10-31 → 11-01`, qua năm, chuỗi rỗng, `18/10/2026` |
| Giờ | `T99:99`, `23:30` + 1 slot, giờ đóng qua nửa đêm (`16:00–01:00`) |
| Múi giờ | 06:30 sáng giờ VN (UTC+7) vẫn là HÔM QUA theo UTC — "hôm nay" phải là ngày của địa điểm, truyền vào như tham số |
| Tập hợp | rỗng, một phần tử, trùng lặp, giá trị không thuộc tập (`"5F"`) |
| Số | 0, âm, `-1` nếu là cờ đặc biệt, `NaN`, số thực khi cần nguyên, trần |
| Phạm vi | `null` = toàn quyền, mảng con, bản ghi chạm nhiều đơn vị ("NẰM TRỌN" — N25) |
| Thứ tự ưu tiên | hai điều kiện cùng đúng: lý do nào thắng (vd "đã dùng" > "hết hạn") |

## Kiểm theo đặc tính, không theo bản cũ (N38)

Khi refactor, "kết quả y hệt trước" chỉ chứng minh hành vi không đổi — không chứng minh nó đúng. Luôn thêm ít nhất
một ca khẳng định ĐẶC TÍNH mong muốn (tỉ lệ ảnh = tỉ lệ đã yêu cầu, tổng các rổ = tổng tiền, khứ hồi
`parse(format(x)) === x` trên toàn bộ dữ liệu thật).

## Checklist

- [ ] Module chỉ `import type`; không `enum`, không `namespace`, không parameter property (Node tháo type không hỗ
      trợ cú pháp phải biên dịch).
- [ ] Không gọi `Date.now()`/`new Date()` không tham số bên trong luật.
- [ ] Mọi nơi dùng điều kiện đều hỏi module này (N08).
- [ ] Phép thử thoát ≠ 0 khi một ca hỏng (`assert` ném, không bắt lại).
- [ ] Đã làm hỏng thử một lần và thấy đỏ (N39).
- [ ] Lệnh chạy ghi trong `CLAUDE.md` cạnh mục module.
- [ ] Node ≥ 22.18 (tháo type mặc định); bản cũ hơn thêm `--experimental-strip-types` vào lệnh.

## Mẫu

```js
// Phép thử cho lib/coupons.ts — luật THUẦN "mã giảm giá áp được không".
// Chạy: node --no-warnings scripts/check-coupons.mjs   (thoát ≠ 0 nếu có ca hỏng)
import assert from "node:assert/strict";
import { couponIneligibleReason } from "../lib/coupons.ts";

let n = 0;
const ok = (name, fn) => {
  fn();
  n++;
  console.log("✓", name);
};

const TODAY = "2026-10-15";
const base = { active: true, valid_from: "2026-10-01", valid_to: "2026-10-31", max_uses: 10, used_count: 0 };

ok("mã đang chạy: không có lý do từ chối", () => {
  assert.equal(couponIneligibleReason(base, TODAY), null);
});
ok("hết hạn tính HẾT ngày valid_to", () => {
  assert.equal(couponIneligibleReason(base, "2026-10-31"), null);
  assert.equal(couponIneligibleReason(base, "2026-11-01"), "expired");
});
ok("hết lượt thắng chưa-tới-ngày khi cùng đúng (thứ tự ưu tiên)", () => {
  const c = { ...base, valid_from: "2026-10-20", used_count: 10 };
  assert.equal(couponIneligibleReason(c, TODAY), "exhausted");
});

console.log(`\n${n} ca xanh`);
```

Chuyển sang `node --test` khi project có test runner: đổi `ok(name, fn)` thành `test(name, fn)` từ `node:test`,
đặt file ở `tests/<chu-de>.test.mjs`, và `"test": "node --no-warnings --test \"tests/**/*.test.mjs\""` trong
`package.json`. Giữ script `check-*` cho phép thử cần DB/dịch vụ thật.

## Đầu ra

`lib/<chu-de>.ts` (thuần) · `scripts/check-<chu-de>.mjs` hoặc `tests/<chu-de>.test.mjs` · dòng lệnh trong
`CLAUDE.md` · báo cáo: số ca, ca biên đã phủ, xác nhận đã thấy đỏ khi cố ý làm hỏng.
