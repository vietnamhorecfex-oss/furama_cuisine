---
name: phat-hanh-apk
description: Đóng gói và phát hành APK Android (Flutter) cho máy người dùng nội bộ ngoài Google Play — kiểm trước build, tăng phiên bản, build một file đúng ABI, ký bằng khoá release duy nhất, bung APK ra kiểm chữ ký + ABI + tài nguyên, đưa link lên cổng phiên bản, thử trên máy thật, ghi lại. Dùng khi người dùng nói "build apk", "phát apk", "release app", "cập nhật app nhân viên", "đóng gói app", "ký app", "máy không cài đè được", hoặc khi một tính năng vừa xong cần plugin/màn mới trên app.
---

# Phát hành APK

Ở IConcierge, mỗi lỗi phát hành APK đều IM LẶNG cho tới khi ra tới máy nhân viên: ký bằng khoá debug của từng máy ⇒
bản mới không cài đè được, nhân viên phải gỡ app và mất phiên (N72); tin cờ `ndk.abiFilters` ⇒ APK vẫn chứa thư mục
ABI thiếu `libflutter.so`, máy 32-bit cài được rồi crash khi mở; resource shrinker xoá icon thông báo ⇒ mọi
`notify()` ném, app sập. Quy trình này kiểm từng thứ đó bằng cách nhìn vào file APK, không tin cờ (N71).

## Khi nào dùng

Mỗi lần đưa một bản app mới tới máy người dùng. Trước đó, chắc rằng việc này cần APK: luật đặt ở server thì không
cần phát hành gì (N69).

## Chuẩn bị một lần cho mỗi project (giao `ky-su-di-dong` + `van-hanh-trien-khai`)

- **Khoá release** — tạo từ bản phát hành ĐẦU TIÊN (L10), sao lưu nơi bền (mất khoá = mọi máy phải gỡ và cài lại):
  ```bash
  keytool -genkey -v -keystore ~/<app>-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias <app>
  ```
  `android/key.properties` (storeFile · storePassword · keyPassword · keyAlias) KHÔNG vào git — `android/.gitignore`
  chặn `key.properties`, `*.jks`, `*.keystore`. Gradle đọc file này nếu có; không có thì lùi về khoá debug (máy mới
  clone vẫn build được) — nên bước kiểm chữ ký bên dưới là BẮT BUỘC.
- **Một ABI** — `android/app/build.gradle.kts`, trong `buildTypes.release`:
  ```kotlin
  packaging { jniLibs { excludes += setOf("lib/armeabi-v7a/**", "lib/x86/**", "lib/x86_64/**") } }
  ```
  Cần CẢ cái này lẫn `--target-platform android-arm64`: cờ chỉ thu hẹp engine Flutter, còn `.so` của plugin đến sẵn
  trong AAR. Debug để nguyên cho emulator x86_64. (IConcierge: 62 MB universal → 22 MB.)
- **Giữ tài nguyên tra theo tên** — `android/app/src/main/res/raw/keep.xml`:
  ```xml
  <resources xmlns:tools="http://schemas.android.com/tools"
      tools:keep="@raw/<am_thong_bao>,@drawable/ic_notification" tools:shrinkMode="safe" />
  ```
- **Cổng phiên bản** — endpoint PUBLIC trước tường đăng nhập trả `{min_version, latest_version, apk_url,
  release_notes}`, admin sửa được; app hỏi lúc khởi động, lỗi thì cho qua; dưới `min` chặn cứng, dưới `latest` nhắc
  nhẹ (N73).
- **`dist/` trong `.gitignore`** của app — file APK không vào git.
- iOS: cần Mac/Xcode hoặc CI macOS; chưa có tài khoản Apple Developer thì chỉ chạy được bước compile-check không ký.
  Không có push server ⇒ iOS không có cảnh báo nền — ghi rõ, không hứa (N74).

## Các bước

1. **Cổng tĩnh** trên đúng commit sẽ phát (trong thư mục app):
   ```bash
   flutter pub get
   dart run build_runner build --delete-conflicting-outputs   # nếu có model sinh mã
   flutter gen-l10n
   flutter analyze          # so với baseline ghi trong CLAUDE.md — không tăng
   flutter test             # gồm architecture_test (N63)
   ```
   *Xong khi:* analyze ≤ baseline, test xanh. Đỏ ⇒ dừng.
2. **Phía server đã lên trước.** App mới gọi endpoint/cột mới ⇒ backend + migration phải live trước khi phát APK
   (`curl` endpoint mới trả đúng). App cũ còn trên máy phải chịu được backend mới (thay đổi API chỉ cộng thêm).
3. **Tăng phiên bản** trong `pubspec.yaml`: `version: X.Y.Z+N` — `N` (versionCode) tăng nghiêm ngặt mỗi bản, không
   Android cài đè. Ghi dòng CHANGELOG.
4. **Build:**
   ```bash
   flutter build apk --release --target-platform android-arm64
   cp build/app/outputs/flutter-apk/app-release.apk dist/<app>-X.Y.Z+N.apk
   ```
5. **Bung APK ra kiểm** — không tin cờ (N71, N72):
   ```bash
   APK=dist/<app>-X.Y.Z+N.apk
   SDK=$ANDROID_HOME          # `flutter doctor -v` in đường dẫn "Android SDK at …" và "Java binary at …"
   BT=$(ls -d "$SDK"/build-tools/* | tail -1)
   export JAVA_HOME=<thư mục JDK mà flutter doctor in ra>   # apksigner/keytool cần Java
   "$BT/apksigner" verify --print-certs "$APK" | head -2   # PHẢI là CN của khoá release, KHÔNG "CN=Android Debug"
   unzip -Z1 "$APK" | grep '^lib/' | cut -d/ -f2 | sort -u  # chỉ một dòng: arm64-v8a
   "$BT/aapt2" dump resources "$APK" | grep -E 'drawable/ic_notification|raw/<am_thong_bao>'   # tài nguyên còn
   ls -lh "$APK"                                            # cỡ hợp lý so với bản trước
   ```
   Tài nguyên phải kiểm bằng `aapt2 dump resources`: bản release làm rối tên file trong `res/`, nên `unzip -l | grep
   ic_notification` luôn ra rỗng dù tài nguyên còn nguyên — một phép kiểm trông như đỏ mà thật ra không biết tìm (N39).
   *Xong khi:* cả bốn dòng đúng kỳ vọng. Sai chữ ký ⇒ dừng, KHÔNG phát (máy đã cài bản khoá thật sẽ từ chối).
6. **Thử trên máy thật** (hỏi trước nếu dùng tài khoản/dữ liệu production — N59): cài đè lên bản đang có (không gỡ) ⇒
   phiên còn giữ; đăng nhập; kịch bản chính của tính năng mới; với app báo động: một đơn thử ⇒ có chuông/thông báo cả
   khi app ở nền và màn khoá. Ghi hãng + bản Android.
7. **Phát hành** — chỉ khi chủ dự án đồng ý cho đúng lần này: tải APK lên chỗ chứa đã chọn, cập nhật cổng phiên bản
   (`latest_version` = X.Y.Z, `apk_url`, ghi chú). Chỉ nâng `min_version` khi bản cũ thật sự hỏng với backend hiện tại
   — nâng là CHẶN mọi máy chưa cập nhật.
8. **Ghi lại** (giao `thu-ky-tri-thuc`): phiên bản, ngày, SHA commit, cỡ file, máy đã thử, `min_version` có đổi không,
   và mục "Chưa kiểm" (vd: iOS, máy 32-bit, app nền quá 6 giờ).

## Checklist

- [ ] Việc này thật sự cần APK (không phải luật server) (N69).
- [ ] Analyze ≤ baseline, test + `architecture_test` xanh trên đúng commit phát (N63).
- [ ] Backend + migration mà bản mới cần đã live; API chỉ thay đổi cộng thêm cho máy còn bản cũ.
- [ ] `versionCode` tăng; CHANGELOG có dòng.
- [ ] Chữ ký = khoá release (không "Android Debug"); APK chỉ có `lib/arm64-v8a/`; tài nguyên tra-theo-tên còn (N72).
- [ ] Đã cài ĐÈ trên máy thật, phiên còn, kịch bản chính chạy, cảnh báo nền chạy (N71, N74).
- [ ] Cổng phiên bản cập nhật sau khi file đã tải lên và link trả 200 (N32, N73).
- [ ] Chủ dự án đồng ý trước khi phát/đổi cổng (N59).

## Đầu ra

```markdown
## Phát hành <app> X.Y.Z+N — DD/MM/YYYY

| Kiểm | Kết quả |
|---|---|
| Commit | <sha> |
| flutter analyze / test | <n> (baseline <n>) / <pass>/<tổng> |
| Chữ ký | CN=<…> (release) |
| ABI | arm64-v8a duy nhất |
| Cỡ | <MB> (bản trước <MB>) |
| Máy thật | <hãng · Android xx> — cài đè OK, <kịch bản> OK |
| Cổng phiên bản | latest X.Y.Z · min <giữ/đổi> · apk_url 200 |

Chưa kiểm: <…>
```
