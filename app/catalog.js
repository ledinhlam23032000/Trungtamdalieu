/* Danh mục Trung tâm Da liễu.
   - Gói chính A01–A07: lấy nguyên từ phiếu chọn của chương trình (docs/doi-tac/nguon/phieu-chon-tham-my.md).
   - Dịch vụ da liễu D01–D07: BẢNG GIÁ MẪU để chạy thử — thay bằng bảng giá thật của trung tâm trước khi dùng. */
(function (root) {
  "use strict";
  const BUNDLES = [
    { code: "A01", name: "Xoá nhăn / thon gọn hàm", value: 30000000, pickMax: 3, opts: ["Xoá nhăn trán", "Xoá nhăn cau mày", "Xoá nhăn ấn đường", "Xoá nhăn đuôi mắt", "Thon gọn hàm"], note: "Chọn tối đa 3/5" },
    { code: "A02", name: "Giảm tiết mồ hôi nách / thon gọn vai", value: 30000000, pickMax: 1, opts: ["Giảm tiết mồ hôi nách + tay", "Thon gọn vai"], note: "Chọn 1 trong 2" },
    { code: "A03", name: "HIFU nâng cơ — 2 buổi", value: 30000000, opts: [] },
    { code: "A04", name: "HA làm đầy — 5 hộp", value: 30000000, pickMax: null, opts: ["Nhăn ấn đường", "Thái dương hóp", "Rãnh cười sâu", "Mí mắt dưới hóp", "Má hai bên hóp", "Cằm ngắn", "Làm đầy tai", "Tai vểnh", "Làm đầy bàn tay", "Làm đầy ngón tay", "Làm đầy trán", "Làm đầy môi"], note: "Số vùng do bác sĩ quyết định sau khám" },
    { code: "A05", name: "Căng chỉ mặt — 4 sợi", value: 30000000, opts: [] },
    { code: "A06", name: "Nâng mũi bằng chỉ — 4 sợi", value: 30000000, opts: [] },
    { code: "A07", name: "Nhấn mí", value: 15000000, opts: [], review: "Trị giá 15tr — ví còn 15tr để chọn tiếp (D3). Chờ chủ xác nhận." }
  ];
  // [tên, giá, số buổi mặc định, đơn vị]
  const GROUPS = [
    ["D01", "Điều trị mụn", [["Khám & soi da", 200000, 1], ["Lấy nhân mụn chuẩn y khoa", 350000, 1], ["Peel trị mụn", 900000, 1], ["Laser trị mụn viêm", 1500000, 1], ["Liệu trình trị mụn chuẩn y khoa (10 buổi)", 6500000, 10]]],
    ["D02", "Nám – tàn nhang – sắc tố", [["Laser Pico trị nám", 2500000, 1], ["Peel trị nám", 1200000, 1], ["Liệu trình trị nám (6 buổi)", 12000000, 6], ["Điện di trắng da", 700000, 1]]],
    ["D03", "Sẹo – lỗ chân lông", [["Fractional CO2 trị sẹo rỗ", 3000000, 1], ["Lăn kim tế bào gốc", 2200000, 1], ["Cắt đáy sẹo (Subcision)", 2500000, 1], ["Liệu trình sẹo rỗ (5 buổi)", 13500000, 5]]],
    ["D04", "Trẻ hoá – nâng cơ", [["HIFU nâng cơ toàn mặt", 8000000, 1], ["RF trẻ hoá da", 3000000, 1], ["Botox xoá nhăn (1 vùng)", 3500000, 1], ["Filler làm đầy (1 cc)", 5999000, 1], ["Căng chỉ nâng cơ (1 sợi)", 2999000, 1, "/sợi"]]],
    ["D05", "Chăm sóc da", [["Chăm sóc da cơ bản", 400000, 1], ["Chăm sóc da chuyên sâu", 900000, 1], ["Cấy tinh chất phục hồi", 1800000, 1], ["Thẻ chăm sóc da (10 buổi)", 3500000, 10]]],
    ["D06", "Triệt lông", [["Triệt lông nách (liệu trình)", 1500000, 6], ["Triệt lông chân (liệu trình)", 6000000, 6], ["Triệt lông mép (liệu trình)", 1200000, 6]]],
    ["D07", "Da liễu bệnh lý", [["Khám da liễu bệnh lý", 250000, 1], ["Điều trị viêm da cơ địa (đợt)", 2500000, 3], ["Điều trị nấm da", 800000, 1], ["Đốt mụn thịt / mụn cóc (1 nốt)", 300000, 1, "/nốt"]]]
  ];
  const SERVICES = [];
  GROUPS.forEach(([g, label, rows]) => rows.forEach((r, i) => SERVICES.push({
    code: `${g}-${String(i + 1).padStart(2, "0")}`, group: g, groupLabel: label, name: r[0], price: r[1], sessions: r[2] || 1, unit: r[3] || ""
  })));
  const SOURCES = { WALK_IN: "Tự đến", PARTNER: "Đối tác giới thiệu", REFERRAL: "Khách cũ giới thiệu", FACEBOOK: "Facebook", ZALO: "Zalo", TIKTOK: "TikTok", HOTLINE: "Hotline", MARKETING: "Quảng cáo khác" };
  const SKIN = ["Da dầu", "Da khô", "Da hỗn hợp", "Da thường", "Da nhạy cảm"];
  const CONCERNS = ["Mụn", "Nám", "Tàn nhang", "Sẹo rỗ", "Lỗ chân lông to", "Lão hoá", "Viêm da", "Triệt lông", "Khác"];
  function itemByCode(c) { return BUNDLES.find(b => b.code === c) || SERVICES.find(s => s.code === c) || null; }
  const API = { BUNDLES, GROUPS, SERVICES, SOURCES, SKIN, CONCERNS, itemByCode };
  root.CATALOG = API;
  if (typeof module !== "undefined") module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
