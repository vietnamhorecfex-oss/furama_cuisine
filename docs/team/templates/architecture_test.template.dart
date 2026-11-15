import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Tên gói trong pubspec.yaml — ĐỔI cho project của bạn.
const _pkg = 'ten_app';

/// Architecture test — import boundaries theo MCA 2.0
/// (`docs/team/templates/KIEN-TRUC-MCA.md` mục 9.1), bản dịch cho Flutter client.
///
/// Chép thành `test/architecture_test.dart`, đổi `_pkg` thành `name:` trong
/// `pubspec.yaml`, rồi `flutter test test/architecture_test.dart`. Khuôn rút
/// từ app nhân viên IConcierge (N63) — giữ nguyên thói quen in DANH SÁCH vi
/// phạm kèm đường dẫn, không chỉ đỏ/xanh.
///
///
///  R1  `core/` (platform) không import `features/` — Luật 7.
///  R2  `features/shared/` (shared kernel) không import feature khác — Luật 7.
///  R3  Feature A import feature B CHỈ qua `features/B/contract/` — Luật 3.
///  R4  `domain/` thuần Dart: cấm Flutter/Riverpod/Dio/GoRouter, cấm import
///      `data/` + `presentation/` (kể cả trong feature mình); feature khác chỉ
///      được `contract/types.dart` — Luật 5 + điều khoản CI #4.
///  R5  `data/` không import `presentation/` của BẤT KỲ feature nào;
///      `jobs/` chỉ được import presentation của chính feature nó.
///  R6  `features/` và `core/` không import `config/` — `config/` là
///      composition root (tương đương `app/` trong MCA), chỉ `main.dart` /
///      `app.dart` được đụng.
///
/// Miễn trừ: `lib/main.dart`, `lib/app.dart`, `lib/config/**` (composition
/// root — nơi duy nhất được compose mọi feature), code sinh tự động.
void main() {
  final libDir = Directory('lib');

  bool isGenerated(String path) =>
      path.endsWith('.g.dart') ||
      path.endsWith('.freezed.dart') ||
      path.contains('/generated/');

  bool isCompositionRoot(String path) =>
      path == 'lib/main.dart' ||
      path == 'lib/app.dart' ||
      path.startsWith('lib/config/');

  // Frameworks bị cấm trong domain/ (Luật 5: domain không biết HTTP/DI/UI).
  const domainBannedPackages = [
    'package:flutter/',
    'package:flutter_riverpod/',
    'package:dio/',
    'package:go_router/',
    'package:flutter_local_notifications/',
    'package:shared_preferences/',
  ];

  final files = libDir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'))
      .where((f) => !isGenerated(f.path))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  final directive = RegExp(r"^\s*(?:import|export)\s+'([^']+)'");

  /// `package:<_pkg>/x/y.dart` → `lib/x/y.dart`;
  /// relative import → resolve theo thư mục file nguồn;
  /// package ngoài / dart: → trả nguyên URI.
  String resolve(String sourcePath, String uri) {
    if (uri.startsWith('package:$_pkg/')) {
      return 'lib/${uri.substring('package:$_pkg/'.length)}';
    }
    if (uri.startsWith('dart:') || uri.startsWith('package:')) return uri;
    final sourceDir = File(sourcePath).parent.path;
    return File('$sourceDir/$uri').uri.normalizePath().path;
  }

  /// Feature name khi path thuộc `lib/features/<name>/…`, else null.
  String? featureOf(String path) {
    final m = RegExp('^lib/features/([a-z_]+)/').firstMatch(path);
    return m?.group(1);
  }

  /// Layer trong feature: contract | domain | data | jobs | presentation.
  String? layerOf(String path) {
    final m =
        RegExp('^lib/features/[a-z_]+/([a-z_]+)/').firstMatch(path);
    return m?.group(1);
  }

  test('MCA-lite import boundaries (R1–R6)', () {
    final violations = <String>[];

    for (final file in files) {
      final src = file.path;
      if (isCompositionRoot(src)) continue;

      final srcFeature = featureOf(src);
      final srcLayer = layerOf(src);
      final inCore = src.startsWith('lib/core/');
      final inShared = srcFeature == 'shared';
      final inDomain = srcLayer == 'domain';
      final inData = srcLayer == 'data';
      final inJobs = srcLayer == 'jobs';

      for (final line in file.readAsLinesSync()) {
        final m = directive.firstMatch(line);
        if (m == null) continue;
        final target = resolve(src, m.group(1)!);

        // R4 — domain cấm framework.
        if (inDomain) {
          for (final banned in domainBannedPackages) {
            if (target.startsWith(banned)) {
              violations.add('R4 $src → $target (domain phải thuần Dart)');
            }
          }
        }

        if (!target.startsWith('lib/')) continue;
        final tgtFeature = featureOf(target);

        // R1 — core không import features.
        if (inCore && tgtFeature != null) {
          violations.add('R1 $src → $target (core không được import features)');
          continue;
        }

        // R6 — core/features không import config (composition root).
        if ((inCore || srcFeature != null) &&
            target.startsWith('lib/config/')) {
          violations.add(
            'R6 $src → $target (config/ là composition root, '
            'chỉ main/app được import)',
          );
          continue;
        }

        if (srcFeature == null || tgtFeature == null) continue;

        // R2 — shared kernel không import feature.
        if (inShared && tgtFeature != 'shared') {
          violations.add(
            'R2 $src → $target (features/shared không được import feature)',
          );
          continue;
        }

        final crossFeature =
            tgtFeature != srcFeature && tgtFeature != 'shared' && !inShared;

        // R3 — cross-feature chỉ qua contract/.
        if (crossFeature &&
            !target.startsWith('lib/features/$tgtFeature/contract/')) {
          violations.add(
            'R3 $src → $target (cross-feature phải qua '
            'features/$tgtFeature/contract/)',
          );
          continue;
        }

        // R4 — domain: nội bộ chỉ domain/, cross-feature chỉ contract/types.
        if (inDomain) {
          final sameFeatureNonDomain = tgtFeature == srcFeature &&
              layerOf(target) != 'domain';
          if (sameFeatureNonDomain) {
            violations.add(
              'R4 $src → $target (domain chỉ được import domain cùng feature)',
            );
            continue;
          }
          if (crossFeature &&
              target != 'lib/features/$tgtFeature/contract/types.dart') {
            violations.add(
              'R4 $src → $target (domain chỉ được import contract/types.dart '
              'của feature khác)',
            );
            continue;
          }
        }

        // R5 — data không import presentation; jobs chỉ presentation của mình.
        final tgtIsPresentation = layerOf(target) == 'presentation';
        if (inData && tgtIsPresentation) {
          violations.add(
            'R5 $src → $target (data không được import presentation)',
          );
          continue;
        }
        if (inJobs && tgtIsPresentation && tgtFeature != srcFeature) {
          violations.add(
            'R5 $src → $target (jobs chỉ được import presentation '
            'của chính feature nó)',
          );
          continue;
        }
      }
    }

    expect(
      violations,
      isEmpty,
      reason: 'Vi phạm ranh giới kiến trúc (xem test/architecture_test.dart '
          'và docs/team/templates/KIEN-TRUC-MCA.md):\n${violations.join('\n')}',
    );
  });

  test('mỗi feature có module.manifest.md', () {
    final featureDirs = Directory('lib/features')
        .listSync()
        .whereType<Directory>()
        .where((d) => !d.path.endsWith('/shared'))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));

    final missing = <String>[
      for (final d in featureDirs)
        if (!File('${d.path}/module.manifest.md').existsSync()) d.path,
    ];

    expect(
      missing,
      isEmpty,
      reason: 'Feature thiếu module.manifest.md (mục 6 KIEN-TRUC-MCA.md): '
          '${missing.join(', ')}',
    );
  });
}
