// Luật ranh giới MCA 2.0 cho web TypeScript (docs/team/templates/KIEN-TRUC-MCA.md, mục 5 + 9.2).
//
// Chép thành `.dependency-cruiser.cjs` ở gốc project, cài `npm i -D dependency-cruiser`, thêm
//   "lint:arch": "depcruise --config .dependency-cruiser.cjs src"
// vào package.json và chạy trong CI (N63). `$1`/`$2` trong `to` là nhóm bắt được ở `from` của cùng luật.
//
// Ngoại lệ: KHÔNG tắt luật. Thêm `pathNot` với danh sách TÊN cụ thể + vì sao ngay trong `comment` (N66) —
// ví dụ thật ở IConcierge: slice dựng màn bảng đơn được import đúng 5 slice khác, liệt kê từng tên.
module.exports = {
  forbidden: [
    {
      name: 'no-cross-feature-imports',
      comment: 'Luật 1: slice không import slice khác. Dùng chung trong module → domain/.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/features/([^/]+)/' },
      to: { path: '^src/modules/$1/features/', pathNot: '^src/modules/$1/features/$2/' },
    },
    {
      name: 'no-cross-module-deep-import',
      comment: 'Luật 3: module khác chỉ được chạm qua contract/ của nó.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: { path: '^src/modules/', pathNot: '^src/modules/($1/|[^/]+/contract/)' },
    },
    {
      name: 'platform-cannot-import-modules',
      comment: 'Luật 7: platform/ không bao giờ import modules/.',
      severity: 'error',
      from: { path: '^src/platform/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'shared-cannot-import-modules-or-platform',
      comment: 'Luật 7: shared/ chỉ chứa thứ thuần.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/(modules|platform)/' },
    },
    {
      name: 'domain-stays-pure',
      comment: 'Luật 5: domain/ không biết adapter, slice, framework HTTP/UI.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/domain/' },
      to: { path: '^(src/modules/$1/(data/adapters|features)/|node_modules/(react|react-dom|express|pg)/)' },
    },
    {
      name: 'query-cannot-import-repository-port',
      comment: 'Luật 2: query đọc thẳng read model; repository port dành cho đường ghi.',
      severity: 'error',
      from: { path: '\\.query\\.ts$' },
      to: { path: '/data/ports/.+Repository\\.port\\.ts$' },
    },
    {
      name: 'no-circular',
      comment: 'Vòng import giữa module = một chiều phải chuyển thành event (mục 4).',
      severity: 'warn',
      from: { path: '^src/' },
      to: { circular: true },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
  },
};
