/* =====================================================================================
   BỘ MÁY NGHIỆP VỤ — Trungtamdalieu
   - Tiền: VND số nguyên. Nhân-chia dùng BigInt (mulDivFloor) để không sai số.
   - Sổ cái chỉ ghi thêm: thanh toán, ví, hoa hồng, hoàn tiền không bao giờ bị xoá; sửa sai bằng bút toán đảo.
   - Phân quyền kiểm ở đây (need()), không chỉ ẩn nút trên giao diện.
   - Hai người cho việc nhạy cảm: người lập ≠ người duyệt (lô hoa hồng, bảng lương, đề nghị thanh toán).
   - Tháng đã chốt sổ: không ghi thêm tiền vào tháng đó.
   Chạy được cả trong trình duyệt (window.HP) và Node (require) để kiểm thử tự động.
   ===================================================================================== */
(function (root) {
  "use strict";
  const CAT = root.CATALOG || (typeof require !== "undefined" ? require("./catalog.js") : null);
  const PKG_PRICE = 15000000, ENTITLEMENT = 30000000;

  // ---------------- nhân sự & vai trò ----------------
  const STAFF = [
    { id: "lam", name: "BS. Lê Đình Lam", role: "ADMIN", label: "Giám đốc chuyên môn & pháp lý", team: "BGD", pctBps: 1000, base: 0 },
    { id: "van", name: "Lê Vân", role: "ADMIN", label: "Founder — sản phẩm & phân phối", team: "BGD", pctBps: 1000, base: 0 },
    { id: "quyen", name: "Nguyễn Quyên", role: "ADMIN", label: "Giám đốc đào tạo & vận hành", team: "BGD", pctBps: 1000, base: 0 },
    { id: "bich", name: "Bích", role: "MANAGER", label: "Kế toán tổng", team: "KT", pctBps: 200, base: 20000000 },
    { id: "hoa", name: "Lễ tân Hoa", role: "RECEPTION", label: "Lễ tân", team: "QUAY", base: 7000000 },
    { id: "ha", name: "Thu Hà", role: "LEAD", label: "Trưởng nhóm Tư vấn 1", team: "TV1", base: 10000000 },
    { id: "maianh", name: "Mai Anh", role: "CONSULTANT", label: "Tư vấn viên", team: "TV1", base: 7000000 },
    { id: "huy", name: "Đức Huy", role: "CONSULTANT", label: "Tư vấn viên", team: "TV1", base: 7000000 },
    { id: "bao", name: "Quốc Bảo", role: "LEAD", label: "Trưởng nhóm Tư vấn 2", team: "TV2", base: 10000000 },
    { id: "linh", name: "Khánh Linh", role: "CONSULTANT", label: "Tư vấn viên", team: "TV2", base: 7000000 },
    { id: "bsminh", name: "BS. Trần Minh", role: "DOCTOR", label: "Bác sĩ da liễu", team: "BS", base: 25000000 },
    { id: "bsthu", name: "BS. Phạm Thu", role: "DOCTOR", label: "Bác sĩ da liễu", team: "BS", base: 25000000 },
    { id: "nga", name: "KTV Thanh Nga", role: "TECH", label: "Kỹ thuật viên", team: "KTV", base: 6500000 },
    { id: "tam", name: "KTV Minh Tâm", role: "TECH", label: "Kỹ thuật viên", team: "KTV", base: 6500000 },
    { id: "baongoc", name: "Bảo Ngọc", role: "MEDIA", label: "Truyền thông — điều phối", team: "TT", pctBps: 200, base: 8000000 },
    { id: "duong", name: "Dương", role: "MEDIA", label: "Truyền thông — quay dựng", team: "TT", pctBps: 200, base: 8000000 },
    { id: "tuan", name: "Tuấn", role: "MEDIA", label: "Truyền thông — quay dựng", team: "TT", pctBps: 200, base: 8000000 },
    { id: "codong", name: "Cổ đông bệnh viện", role: "SHAREHOLDER", label: "Chỉ xem, không sửa" },
    { id: "kh-hanh", name: "Nguyễn Thị Hạnh", role: "PARTNER", label: "Khách hàng / Đối tác", partnerName: "Nguyễn Thị Hạnh" },
    { id: "kh-binh", name: "Trần Văn Bình", role: "PARTNER", label: "Khách hàng / Đối tác", partnerName: "Trần Văn Bình" }
  ];
  const TEAMS = { TV1: "Nhóm Tư vấn 1", TV2: "Nhóm Tư vấn 2", QUAY: "Quầy lễ tân", BS: "Bác sĩ", KTV: "Kỹ thuật viên" };
  const ROLE_LABEL = { ADMIN: "Ban giám đốc", MANAGER: "Kế toán", RECEPTION: "Lễ tân", LEAD: "Trưởng nhóm", CONSULTANT: "Tư vấn viên", DOCTOR: "Bác sĩ", TECH: "Kỹ thuật viên", MEDIA: "Truyền thông", SHAREHOLDER: "Cổ đông (chỉ xem)", PARTNER: "Khách hàng / Đối tác" };
  const FRONT = ["ADMIN", "RECEPTION", "LEAD", "CONSULTANT"];
  const CAN = {
    intake: FRONT, appt: FRONT, apptStatus: [...FRONT, "DOCTOR", "TECH"],
    treatOpen: [...FRONT, "DOCTOR"], treatLine: ["ADMIN", "LEAD", "CONSULTANT", "DOCTOR"], session: ["ADMIN", "DOCTOR", "TECH"],
    pay: [...FRONT, "MANAGER"], refund: ["ADMIN", "MANAGER"],
    sell: FRONT, collect: [...FRONT, "MANAGER"], select: FRONT, prescribe: ["DOCTOR"], redeem: FRONT, end: ["ADMIN", "MANAGER"],
    reconcile: ["ADMIN", "MANAGER"], batchCreate: ["ADMIN", "MANAGER"], batchApprove: ["ADMIN"], batchPay: ["ADMIN", "MANAGER"],
    expenseCreate: ["ADMIN", "MANAGER", "RECEPTION"], expenseApprove: ["ADMIN"], expensePay: ["ADMIN", "MANAGER"],
    payrollCreate: ["ADMIN", "MANAGER"], payrollApprove: ["ADMIN"], closeMonth: ["ADMIN"], settings: ["ADMIN"],
    care: FRONT, activity: ["ADMIN"], seeMoney: [...FRONT, "MANAGER", "SHAREHOLDER"]
  };
  const SELLERS = ["hoa", "ha", "maianh", "huy", "bao", "linh"];

  // ---------------- tiện ích ngày & tiền ----------------
  const pad = n => String(n).padStart(2, "0");
  function mulDivFloor(a, b, c) { return Number((BigInt(Math.round(a)) * BigInt(Math.round(b))) / BigInt(Math.round(c))); }
  function parseD(s) { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); }
  function fmtD(dt) { return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`; }
  function addDays(s, n) { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return fmtD(d); }
  function addMonths(s, n) { const d = parseD(s); const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return fmtD(d); }
  const monthOf = s => s.slice(0, 7);
  const nextMonth = m => addMonths(m + "-01", 1).slice(0, 7);
  const prevMonth = m => addMonths(m + "-01", -1).slice(0, 7);
  function daysBetween(a, b) { return Math.round((parseD(b) - parseD(a)) / 86400000); }
  function monthsBetween(a, b) { const A = parseD(a), B = parseD(b); let m = (B.getUTCFullYear() - A.getUTCFullYear()) * 12 + B.getUTCMonth() - A.getUTCMonth(); if (B.getUTCDate() < A.getUTCDate()) m--; return m; }
  const HOLIDAYS = new Set(["2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20", "2026-04-27", "2026-04-30", "2026-05-01", "2026-09-01", "2026-09-02", "2027-01-01", "2027-02-04", "2027-02-05", "2027-02-08", "2027-02-09", "2027-02-10", "2027-04-16", "2027-04-30", "2027-05-03", "2027-09-02", "2027-09-03"]);
  function isWorkingDay(s) { const w = parseD(s).getUTCDay(); return w !== 0 && w !== 6 && !HOLIDAYS.has(s); }
  function addWorkingDays(s, n) { let d = s, k = 0; while (k < n) { d = addDays(d, 1); if (isWorkingDay(d)) k++; } return d; }
  function workingDaysBetween(a, b) { let d = a, k = 0; while (d < b) { d = addDays(d, 1); if (isWorkingDay(d)) k++; } return k; }
  function vnd(n) { return (n < 0 ? "−" : "") + Math.abs(Math.round(n)).toLocaleString("vi-VN"); }
  function vnDate(s) { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; }
  function maskPhone(last5) { return "***" + String(last5).slice(-3); }

  // ---------------- công thức thuần (đặc tả mục 6.3) ----------------
  const F = {
    refundUnused: bal => mulDivFloor(PKG_PRICE, Math.max(0, bal), ENTITLEMENT),                                       // F1
    pct: (base, bps) => mulDivFloor(Math.max(0, base), bps, 10000),                                                    // F3 & các tỷ lệ
    settle2B: ({ paid, usedValue, bonusOwed = 0 }) => paid - mulDivFloor(usedValue, 500000000, 1500000000) + bonusOwed,  // F7
    settle5: ({ paid, owed = 0, received, totalValue = 1800000000, direct = 0 }) => paid + owed - mulDivFloor(received, 570000000, totalValue) - direct, // F8
    profitShare: ({ bps, profit, activeDays, periodDays }) => profit <= 0 ? 0 : Number((BigInt(Math.round(profit)) * BigInt(bps) * BigInt(activeDays)) / (10000n * BigInt(periodDays))), // F6 — một phép chia
    pctSigned: (base, bps) => mulDivFloor(base, bps, 10000) // cho phép âm (thu hồi khi hoàn tiền)
  };
  function evaluateMaintenance(months, required) {
    let streak = 0; const out = [];
    for (const m of months) {
      if (m.planGiven === false || m.excused) { out.push({ status: "KHONG_TINH", note: "Bệnh viện không giao kế hoạch / tạm nghỉ đã duyệt — tháng này không tính" }); continue; }
      if (m.activities < 1) { streak++; out.push(streak >= 2 ? { status: "MO_VU_VIEC", note: "2 tháng liên tiếp thiếu nhiệm vụ → mở vụ việc, 10 ngày làm việc giải trình" } : { status: "WARNED", note: "Thiếu nhiệm vụ tháng thứ 1 → soạn thông báo nhắc" }); }
      else { streak = 0; out.push(m.contracts < required ? { status: "NHAC", note: "Thiếu hợp đồng nhưng có nhiệm vụ → chỉ nhắc" } : { status: "DAT", note: "Đạt cả 2 vòng" }); }
    }
    return out;
  }
  function terminationDecisionAllowed(noticeDate, explanationDate) {
    const deadline = addWorkingDays(noticeDate, 10);
    if (explanationDate && explanationDate <= deadline) return { allowed: false, deadline, reason: "Có giải trình trong hạn" };
    return { allowed: true, deadline, reason: explanationDate ? "Giải trình nộp sau hạn" : "Không giải trình" };
  }

  function defaultSettings() {
    return {
      version: 1, referralFlat: 3000000, addonEnabled: true, addonBps: 1200, revenueScope: "PROGRAM",
      staff: { consultBps: 500, doctorBps: 800, techFee: 50000, pkgSaleBonus: 0 },
      network: { enabled: false, licenseNo: "", licenseDate: "", lawyerConfirmed: false, levels: [{ level: 2, bps: 500, minChildContracts: 50, minMonths: 3 }, { level: 3, bps: 0, minChildContracts: 50, minMonths: 3 }] }
    };
  }
  function emptyState(today) {
    return { v: 4, today: today || "2026-11-20", actorId: "hoa", seq: {}, partnerLogins: {}, settings: defaultSettings(), customers: [], appointments: [], treatments: [], sessions: [], payments: [], partners: [], contracts: [], pkgPayments: [], wallet: [], selections: [], commissions: [], batches: [], requests: [], payrollRuns: [], periods: [], careLogs: [], seats: { s2: [], s5: [] }, activities: [], audit: [], guide: null };
  }
  // Kiểm số tiền / số lượng: số nguyên an toàn trong khoảng cho phép, không làm tròn lặng lẽ.
  function money(v, label, min = 1, max = 5000000000) {
    const n = typeof v === "number" ? v : (typeof v === "string" && /^-?\d+$/.test(v.trim()) ? Number(v.trim()) : NaN);
    if (!Number.isSafeInteger(n)) throw new Error(`${label} không hợp lệ — nhập số nguyên (đồng).`);
    if (n < min || n > max) throw new Error(`${label} phải từ ${vnd(min)} đến ${vnd(max)}.`);
    return n;
  }
  const REQ_CATS = ["MAT_BANG", "VAT_TU", "MARKETING", "KHAC"];
  let _uid = 0;
  function uid(p) { _uid++; return p + Date.now().toString(36).slice(-4) + _uid.toString(36) + Math.random().toString(36).slice(2, 5); }

  class Store {
    constructor(state) { this.s = state; }
    get today() { return this.s.today; }
    get cfg() { return this.s.settings; }
    actor() { return STAFF.find(x => x.id === this.s.actorId) || { id: null, name: "Không xác định", role: "NONE", label: "" }; }
    staff(id) { return STAFF.find(x => x.id === id); }
    can(a) { return (CAN[a] || []).includes(this.actor().role); }
    need(a) { if (!this.can(a)) { this.log("TỪ CHỐI", `${this.actor().name} không có quyền "${a}"`); throw new Error(`${this.actor().name} (${ROLE_LABEL[this.actor().role] || "chưa đăng nhập"}) không có quyền thao tác này.`); } }
    deny(msg) { this.log("TỪ CHỐI", msg); throw new Error(msg); }
    log(action, detail) { this.s.audit.unshift({ at: this.today, actor: this.actor().name, action, detail }); }
    code(kind, prefix, w) { this.s.seq[kind] = (this.s.seq[kind] || 0) + 1; return prefix + String(this.s.seq[kind]).padStart(w, "0"); }
    isClosed(m) { return this.s.periods.some(p => p.month === m && !p.reopenedAt); }
    // Phạm vi: tư vấn viên/trưởng nhóm chỉ thao tác trên khách trong phạm vi của mình.
    assertScope(customerId) {
      if (!["LEAD", "CONSULTANT"].includes(this.actor().role)) return;
      if (!this.visibleCustomers().some(c => c.id === customerId)) this.deny("Khách này không thuộc phạm vi của bạn.");
    }
    usedNonce(n) { return !!n && (this.s.payments.some(p => p.nonce === n) || this.s.pkgPayments.some(p => p.nonce === n) || this.s.contracts.some(c => c.nonce === n)); }
    assertOpen(date) { if (this.isClosed(monthOf(date))) throw new Error(`Tháng ${monthOf(date)} đã chốt sổ — không ghi thêm tiền vào tháng này.`); }

    // ================= KHÁCH HÀNG =================
    customer(id) { return this.s.customers.find(c => c.id === id); }
    addCustomer(o) {
      this.need("intake");
      const name = String(o.name || "").trim().replace(/\s+/g, " "), last5 = String(o.last5 || "").trim();
      if (name.length < 2) throw new Error("Nhập họ tên khách.");
      if (/[<>"{}]/.test(name) || name.length > 60) throw new Error("Họ tên chỉ gồm chữ, khoảng trắng, tối đa 60 ký tự.");
      if (!/^\d{5}$/.test(last5)) throw new Error("Nhập đúng 5 số cuối SĐT.");
      if (o.dob && (o.dob > this.today || o.dob < "1900-01-01")) throw new Error("Ngày sinh không hợp lệ.");
      if (!o.consent) throw new Error("Khách cần đồng ý cho trung tâm lưu và xử lý thông tin cá nhân.");
      const dup = this.s.customers.find(c => c.last5 === last5 && c.name.toLowerCase() === name.toLowerCase());
      if (dup) { const e = new Error(`Đã có hồ sơ ${dup.code} trùng tên và 5 số cuối SĐT.`); e.dupId = dup.id; throw e; }
      let ref = null;
      if (o.referralCode) { ref = this.partnerByCode(o.referralCode); if (!ref) throw new Error(`Không tìm thấy mã đối tác ${o.referralCode}.`); }
      const c = { id: uid("kh"), code: this.code("cus", "KH", 5), name, last5, gender: o.gender === "M" ? "M" : "F", dob: o.dob || "", skinType: o.skinType || "", concerns: o.concerns || [], allergies: String(o.allergies || "").slice(0, 300), note: o.note || "", source: ref ? "PARTNER" : (o.source || "WALK_IN"), referrerPartnerId: ref ? ref.id : null, createdAt: this.today, createdBy: this.actor().id, consentAt: this.today };
      this.s.customers.push(c);
      this.log("TIẾP NHẬN", `${c.code} ${name} (${maskPhone(last5)})${ref ? ` · giới thiệu: ${this.partnerName(ref.id)}` : ""}`);
      return c;
    }
    updateAllergies(customerId, text) {
      if (!["ADMIN", "DOCTOR"].includes(this.actor().role)) this.need("__clinical");
      const c = this.customer(customerId); if (!c) throw new Error("Không thấy khách hàng.");
      const before = c.allergies; c.allergies = String(text || "").slice(0, 300);
      this.log("SỬA DỊ ỨNG", `${c.code}: "${before}" → "${c.allergies}"`);
    }
    findCustomers(q) { const n = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(); q = n(String(q || "").trim()); if (!q) return this.s.customers.slice(); return this.s.customers.filter(c => n(c.name).includes(q) || c.last5.endsWith(q) || n(c.code) === q); }
    // ================= LỊCH HẸN =================
    addAppointment({ customerId, date, time, type, note, staffId }) {
      this.need("appt");
      if (!this.customer(customerId)) throw new Error("Chọn khách hàng.");
      this.assertScope(customerId);
      if (!date || date < this.today) throw new Error("Ngày hẹn phải từ hôm nay trở đi.");
      if (!/^\d{2}:\d{2}$/.test(time || "")) throw new Error("Nhập giờ hẹn dạng 09:30.");
      if (time < "07:00" || time > "20:00") throw new Error("Giờ hẹn phải trong giờ làm việc 07:00–20:00.");
      if (this.s.appointments.some(a => a.customerId === customerId && a.date === date && a.time === time && a.status === "BOOKED")) throw new Error("Khách đã có lịch đúng giờ này.");
      const a = { id: uid("lh"), customerId, date, time, type: type || "SERVICE", note: String(note || "").slice(0, 200), staffId: staffId || null, status: "BOOKED", by: this.actor().id };
      this.s.appointments.push(a); this.log("ĐẶT LỊCH", `${this.customer(customerId).name} · ${vnDate(date)} ${time}`); return a;
    }
    setApptStatus(id, status) {
      this.need("apptStatus");
      const a = this.s.appointments.find(x => x.id === id); if (!a) throw new Error("Không thấy lịch hẹn.");
      const flow = { BOOKED: ["ARRIVED", "CANCELLED", "NO_SHOW"], ARRIVED: ["DONE", "CANCELLED"] };
      if (!(flow[a.status] || []).includes(status)) throw new Error("Không chuyển được trạng thái này.");
      a.status = status; this.log("LỊCH HẸN", `${this.customer(a.customerId).name} → ${status}`);
    }

    // ================= HỒ SƠ ĐIỀU TRỊ =================
    treatment(id) { return this.s.treatments.find(t => t.id === id); }
    openTreatment(customerId, { consultantId, doctorId, note, kind } = {}) {
      this.need("treatOpen");
      if (!this.customer(customerId)) throw new Error("Không thấy khách hàng.");
      this.assertScope(customerId);
      const t = { id: uid("hs"), code: this.code("tr", "HS", 5), customerId, openedAt: this.today, consultantId: consultantId || (["LEAD", "CONSULTANT"].includes(this.actor().role) ? this.actor().id : null), doctorId: doctorId || (this.actor().role === "DOCTOR" ? this.actor().id : null), status: "OPEN", lines: [], note: note || "", kind: kind || "NORMAL" };
      this.s.treatments.push(t); this.log("MỞ HỒ SƠ", `${t.code} · ${this.customer(customerId).name}`); return t;
    }
    addLine(tid, { code, qty = 1, discount = 0 }) {
      this.need("treatLine");
      const t = this.treatment(tid); const svc = CAT.itemByCode(code);
      if (!t || t.status !== "OPEN") throw new Error("Hồ sơ không mở.");
      this.assertScope(t.customerId);
      if (!svc || !svc.price) throw new Error("Chọn dịch vụ.");
      qty = money(qty, "Số lượng", 1, 99); discount = money(discount == null || discount === "" ? 0 : discount, "Giảm giá", 0, 5000000000);
      const gross = svc.price * qty; if (discount > gross) throw new Error("Giảm giá lớn hơn giá dịch vụ.");
      if (discount > 0 && this.actor().role === "DOCTOR") throw new Error("Bác sĩ không áp giảm giá — tư vấn viên hoặc Ban giám đốc thực hiện.");
      if (discount * 2 > gross && this.actor().role !== "ADMIN") throw new Error("Giảm trên 50% cần Ban giám đốc thực hiện.");
      const l = { id: uid("dv"), code, name: svc.name, unitPrice: svc.price, qty, discount, finalPrice: gross - discount, sessionsTotal: svc.unit ? svc.sessions : svc.sessions * qty, sessionsDone: 0, walletEntryId: null, addedBy: this.actor().id, at: this.today };
      t.lines.push(l); this.log("THÊM DỊCH VỤ", `${t.code} · ${l.name} ×${qty} · ${vnd(l.finalPrice)}đ${discount ? ` (giảm ${vnd(discount)}đ)` : ""}`); return l;
    }
    removeLine(tid, lineId) {
      this.need("treatLine");
      const t = this.treatment(tid); const l = t && t.lines.find(x => x.id === lineId);
      if (!l) throw new Error("Không thấy dòng dịch vụ.");
      if (l.walletEntryId || l.adjustment) throw new Error("Dòng này không xoá được.");
      if (l.sessionsDone > 0) throw new Error("Dịch vụ đã làm buổi nào đó — không xoá.");
      if (this.sumTreatment(t).total - l.finalPrice < this.sumTreatment(t).paid) throw new Error("Xoá dòng này làm tổng thấp hơn số khách đã trả — lập đề nghị hoàn tiền trước.");
      t.lines = t.lines.filter(x => x.id !== lineId); this.log("BỎ DỊCH VỤ", `${t.code} · ${l.name}`);
    }
    sumTreatment(t) { const total = t.lines.reduce((a, l) => a + l.finalPrice, 0); const paid = this.s.payments.filter(p => p.treatmentId === t.id).reduce((a, p) => a + p.amount, 0); return { total, paid, debt: Math.max(0, total - paid) }; }
    addSession(tid, lineId, { techId, note } = {}) {
      this.need("session");
      const t = this.treatment(tid); const l = t && t.lines.find(x => x.id === lineId);
      if (!l) throw new Error("Không thấy dịch vụ.");
      if (l.sessionsDone >= l.sessionsTotal) throw new Error("Đã làm đủ số buổi của dịch vụ này.");
      if (techId && (!this.staff(techId) || this.staff(techId).role !== "TECH")) throw new Error("Chọn kỹ thuật viên hợp lệ.");
      const tech = this.actor().role === "TECH" ? this.actor().id : (techId || null);
      l.sessionsDone++;
      const se = { id: uid("bu"), treatmentId: tid, lineId, at: this.today, techId: tech, doctorId: this.actor().role === "DOCTOR" ? this.actor().id : t.doctorId, recordedBy: this.actor().id, note: note || "", no: l.sessionsDone };
      this.s.sessions.push(se);
      if (t.lines.every(x => x.sessionsDone >= x.sessionsTotal) && this.sumTreatment(t).debt === 0) t.status = "DONE";
      this.log("GHI BUỔI", `${t.code} · ${l.name} · buổi ${l.sessionsDone}/${l.sessionsTotal}${tech ? " · KTV " + this.staff(tech).name : " · bác sĩ tự làm"}`); return se;
    }
    referrerFor(customerId) { const c = this.customer(customerId); return c && c.referrerPartnerId ? c.referrerPartnerId : null; }
    partnerActive(pid) { return this.s.contracts.some(k => k.ownerPartnerId === pid && k.fullyPaidAt && k.status !== "CANCELLED"); }
    pay(tid, amount, { method = "CASH", nonce } = {}) {
      this.need("pay"); this.assertOpen(this.today);
      const t = this.treatment(tid);
      if (!t) throw new Error("Không thấy hồ sơ.");
      this.assertScope(t.customerId);
      if (this.usedNonce(nonce)) throw new Error("Khoản thu này đã ghi (chống bấm hai lần).");
      amount = money(amount, "Số tiền thu", 1);
      const { debt } = this.sumTreatment(t);
      if (amount > debt) throw new Error(`Chỉ còn nợ ${vnd(debt)}đ.`);
      if (!["CASH", "TRANSFER", "CARD"].includes(method)) method = "CASH";
      const ref = this.referrerFor(t.customerId), owner = this.partnerOfCustomer(t.customerId);
      const giveAddon = this.cfg.addonEnabled && ref && !(owner && owner.id === ref) && this.partnerActive(ref);
      const com = giveAddon ? F.pct(amount, this.cfg.addonBps) : 0; // tính xong trước khi ghi
      const p = { id: uid("pt"), code: this.code("pt", "PT", 6), treatmentId: tid, customerId: t.customerId, amount, method, at: this.today, by: this.actor().id, kind: "PAYMENT", nonce: nonce || null };
      this.s.payments.push(p);
      this.log("THU TIỀN", `${t.code} · ${vnd(amount)}đ · ${p.code}`);
      if (giveAddon) this.s.commissions.push({ id: uid("hh"), partnerId: ref, type: "ADDON_PCT", state: "PENDING", amount: com, basis: amount, rateBps: this.cfg.addonBps, sourceRef: p.id, paymentId: p.id, contractId: null, customerId: t.customerId, period: monthOf(this.today), at: this.today, note: `Dịch vụ ngoài gói ${t.code}`, ver: this.cfg.version });
      if (t.lines.every(x => x.sessionsDone >= x.sessionsTotal) && this.sumTreatment(t).debt === 0) t.status = "DONE";
      return p;
    }
    // Hoàn tiền dịch vụ = tiền ra khỏi quỹ → đi qua Giấy đề nghị thanh toán (người lập ≠ người duyệt ≠ người chi).
    refundPayment(paymentId, amount, reason) {
      this.need("refund");
      const p = this.s.payments.find(x => x.id === paymentId && x.kind === "PAYMENT"); if (!p) throw new Error("Không thấy khoản thu.");
      const done = -this.s.payments.filter(x => x.reversalOf === p.id).reduce((a, x) => a + x.amount, 0);
      const pending = this.s.requests.filter(r => r.source && r.source.type === "REFUND_TREATMENT" && r.source.paymentId === p.id && ["PENDING", "APPROVED"].includes(r.status)).reduce((a, r) => a + r.amount, 0);
      if (!reason || String(reason).trim().length < 3) throw new Error("Nhập lý do hoàn tiền.");
      amount = money(amount, "Số tiền hoàn", 1, p.amount);
      if (amount > p.amount - done - pending) throw new Error(`Hoàn tối đa ${vnd(p.amount - done - pending)}đ (đã hoàn/đang chờ ${vnd(done + pending)}đ).`);
      const cus = this.customer(p.customerId);
      const r = { id: uid("dn"), code: this.code("dn", "DNTT-", 5), category: "HOAN_TIEN", payee: `${cus.name} (${cus.code})`, amount, note: `Hoàn tiền ${p.code}: ${String(reason).trim()}`, status: "PENDING", createdBy: this.actor().id, createdAt: this.today, source: { type: "REFUND_TREATMENT", paymentId: p.id, reason: String(reason).trim() } };
      this.s.requests.push(r); this.log("LẬP ĐỀ NGHỊ HOÀN TIỀN", `${r.code} · ${p.code} · ${vnd(amount)}đ · ${reason}`); return r;
    }
    _executeRefundTreatment(r) {
      const p = this.s.payments.find(x => x.id === r.source.paymentId), t = this.treatment(p.treatmentId), amount = r.amount;
      const ref = { id: uid("pt"), code: this.code("pchi", "PC", 6), treatmentId: p.treatmentId, customerId: p.customerId, amount: -amount, method: p.method, at: this.today, by: this.actor().id, kind: "REFUND", reversalOf: p.id, reason: r.source.reason, requestId: r.id };
      this.s.payments.push(ref);
      // Giảm giá trị dịch vụ tương ứng để không phát sinh "công nợ ảo".
      t.lines.push({ id: uid("dv"), code: "ADJ", name: `Điều chỉnh giảm do hoàn tiền ${ref.code}`, unitPrice: -amount, qty: 1, discount: 0, finalPrice: -amount, sessionsTotal: 0, sessionsDone: 0, walletEntryId: null, adjustment: true, addedBy: this.actor().id, at: this.today });
      for (const e of this.s.commissions.filter(e => e.paymentId === p.id && e.amount > 0 && e.type === "ADDON_PCT")) {
        const prev = -this.s.commissions.filter(x => x.reversalOf === e.id).reduce((a, x) => a + x.amount, 0);
        const totalRefunded = -this.s.payments.filter(x => x.reversalOf === p.id).reduce((a, x) => a + x.amount, 0);
        const back = mulDivFloor(e.amount, totalRefunded, p.amount) - prev + (totalRefunded === p.amount ? e.amount - mulDivFloor(e.amount, totalRefunded, p.amount) : 0);
        if (back <= 0) continue;
        if (["PENDING", "ELIGIBLE"].includes(e.state) && !e.batchId) this.s.commissions.push({ id: uid("hh"), partnerId: e.partnerId, type: "CLAWBACK", state: e.state, amount: -back, sourceRef: ref.id, reversalOf: e.id, paymentId: null, period: e.period, at: this.today, note: `Hoàn tiền ${p.code} — thu hồi trước khi trả` });
        else this.s.commissions.push({ id: uid("hh"), partnerId: e.partnerId, type: "OFFSET", state: "ELIGIBLE", amount: -back, sourceRef: ref.id, reversalOf: e.id, paymentId: null, period: nextMonth(monthOf(this.today)), at: this.today, note: `Hoàn tiền ${p.code} sau khi đã trả — bù trừ kỳ sau` });
      }
      this.log("HOÀN TIỀN", `${p.code} · ${vnd(amount)}đ · ${r.source.reason}`); return ref;
    }
    // ================= GÓI 15 TRIỆU & VÍ =================
    partner(id) { return this.s.partners.find(p => p.id === id); }
    partnerName(id) { const p = this.partner(id); return p ? this.customer(p.customerId).name : "—"; }
    partnerByCode(code) { return this.s.partners.find(p => p.code.toUpperCase() === String(code || "").trim().toUpperCase()); }
    partnerOfCustomer(cid) { return this.s.partners.find(p => p.customerId === cid); }
    contract(id) { return this.s.contracts.find(c => c.id === id); }
    newPartnerCode() { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c; do { c = "HP-" + Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join(""); } while (this.s.partners.some(p => p.code === c)); return c; }
    paid(cid) { return this.s.pkgPayments.filter(p => p.contractId === cid).reduce((a, p) => a + p.amount, 0); }
    balance(cid) { return this.s.wallet.filter(w => w.contractId === cid).reduce((a, w) => a + w.amount, 0); }
    used(cid) { return -this.s.wallet.filter(w => w.contractId === cid && w.kind === "REDEEM").reduce((a, w) => a + w.amount, 0); }
    isValidForKpi(c) { return !!c.fullyPaidAt && c.status !== "CANCELLED" && c.countsForKpi; }
    sell({ customerId, buyerName, last5, referralCode, pin, firstPayment, date, nonce, consent = true }) {
      this.need("sell");
      const d = date || this.today;
      if (d !== this.today) throw new Error("Chỉ ghi hợp đồng vào ngày hôm nay.");
      this.assertOpen(d);
      if (this.usedNonce(nonce)) throw new Error("Hợp đồng này đã được ký (chống bấm hai lần).");
      if (!/^\d{6}$/.test(String(pin || ""))) throw new Error("Khách tự đặt PIN 6 số để xác nhận mỗi lần dùng quyền lợi.");
      firstPayment = money(firstPayment == null || firstPayment === "" ? 0 : firstPayment, "Số tiền thu lần đầu", 0, PKG_PRICE);
      let cus = customerId ? this.customer(customerId) : null, newCus = null;
      if (customerId && !cus) throw new Error("Không thấy khách hàng.");
      if (cus) this.assertScope(cus.id);
      if (!cus) {
        buyerName = String(buyerName || "").trim().replace(/\s+/g, " "); last5 = String(last5 || "").trim();
        if (buyerName.length < 2 || /[<>"{}]/.test(buyerName)) throw new Error("Nhập họ tên người mua (chỉ chữ và khoảng trắng).");
        if (!/^\d{5}$/.test(last5)) throw new Error("Nhập đúng 5 số cuối SĐT.");
        cus = this.s.customers.find(c => c.last5 === last5 && c.name.toLowerCase() === buyerName.toLowerCase());
        if (!cus) { if (!consent) throw new Error("Người mua mới cần đồng ý cho trung tâm lưu và xử lý thông tin cá nhân."); newCus = { id: uid("kh"), name: buyerName, last5 }; }
      }
      let owner = cus ? this.partnerOfCustomer(cus.id) : null;
      let attributed = null;
      if (referralCode) { attributed = this.partnerByCode(referralCode); if (!attributed) throw new Error(`Không tìm thấy mã đối tác ${referralCode}.`); }
      else if (cus && cus.referrerPartnerId && (!owner || owner.id !== cus.referrerPartnerId)) attributed = this.partner(cus.referrerPartnerId); // giữ chuỗi nguồn gốc
      if (owner && attributed && owner.id === attributed.id) throw new Error("Người mua không được tự giới thiệu chính mình (Q7).");
      if (attributed && cus && this.partnerOfCustomer(cus.id) && this.partnerOfCustomer(cus.id).id === attributed.id) throw new Error("Người mua không được tự giới thiệu chính mình (Q7).");
      // ---- mọi kiểm tra đã xong: bắt đầu ghi ----
      if (newCus) { cus = { id: newCus.id, code: this.code("cus", "KH", 5), name: newCus.name, last5: newCus.last5, gender: "F", dob: "", skinType: "", concerns: [], allergies: "", note: "", source: attributed ? "PARTNER" : "WALK_IN", referrerPartnerId: null, createdAt: d, createdBy: this.actor().id, consentAt: d }; this.s.customers.push(cus); }
      const repeat = !!owner && this.s.contracts.some(c => c.ownerPartnerId === owner.id && c.status !== "CANCELLED");
      if (!owner) { owner = { id: uid("dt"), code: this.newPartnerCode(), customerId: cus.id, joinedAt: d, sponsorId: attributed ? attributed.id : null }; this.s.partners.push(owner); }
      if (attributed && !cus.referrerPartnerId) cus.referrerPartnerId = attributed.id;
      const c = { id: uid("hd"), code: this.code("contract", "GOI-", 6), ownerPartnerId: owner.id, customerId: cus.id, attributedPartnerId: attributed ? attributed.id : null, soldById: this.actor().id, signedAt: d, fullyPaidAt: null, expiresAt: null, status: "SIGNED", pin: String(pin), pinFails: 0, countsForKpi: !repeat, endedAt: null, refundDueAt: null, ver: this.cfg.version, nonce: nonce || null };
      this.s.contracts.push(c);
      this.log("BÁN GÓI", `${c.code} · ${cus.name}${attributed ? ` · giới thiệu: ${this.partnerName(attributed.id)} (${attributed.code})` : ""}${repeat ? " · gói thứ 2, không tính KPI (Q2)" : ""}`);
      if (firstPayment > 0) this.collect(c.id, firstPayment, d, {});
      return c;
    }
    collect(cid, amount, date, { method = "CASH", nonce } = {}) {
      this.need("collect"); const d = date || this.today;
      if (d !== this.today) throw new Error("Chỉ ghi thu vào ngày hôm nay.");
      this.assertOpen(d);
      if (this.usedNonce(nonce)) throw new Error("Khoản thu này đã ghi (chống bấm hai lần).");
      const c = this.contract(cid);
      if (!c || c.status !== "SIGNED") throw new Error("Hợp đồng không ở trạng thái thu tiền.");
      const due = PKG_PRICE - this.paid(cid);
      amount = money(amount, "Số tiền thu", 1, PKG_PRICE);
      if (amount > due) throw new Error(`Chỉ còn phải thu ${vnd(due)}đ.`);
      if (!["CASH", "TRANSFER", "CARD"].includes(method)) method = "CASH";
      this.s.pkgPayments.push({ id: uid("tg"), code: this.code("pt", "PT", 6), contractId: cid, kind: "PAYMENT", amount, method, at: d, by: this.actor().id, nonce: nonce || null });
      this.log("THU TIỀN GÓI", `${c.code} · ${vnd(amount)}đ`);
      if (this.paid(cid) === PKG_PRICE) this.activate(c, d);
    }
    activate(c, d) {
      if (c.fullyPaidAt) throw new Error("Hợp đồng đã kích hoạt.");
      if (c.attributedPartnerId && this.s.commissions.some(e => e.contractId === c.id && e.type === "REFERRAL_FLAT" && e.amount > 0)) throw new Error("Hợp đồng đã có hoa hồng giới thiệu.");
      c.fullyPaidAt = d; c.status = "ACTIVE"; c.expiresAt = addMonths(d, 12);
      this.s.wallet.push({ id: uid("vi"), contractId: c.id, kind: "GRANT", amount: ENTITLEMENT, label: "Kích hoạt ví quyền lợi", at: d, by: this.actor().id });
      if (c.attributedPartnerId) {
        if (this.cfg.referralFlat > 0) this.s.commissions.push({ id: uid("hh"), partnerId: c.attributedPartnerId, type: "REFERRAL_FLAT", level: 1, state: "PENDING", amount: this.cfg.referralFlat, basis: PKG_PRICE, sourceRef: c.id, contractId: c.id, period: monthOf(d), at: d, note: `Giới thiệu ${c.code}`, ver: this.cfg.version });
        this.networkBonus(c, d);
      }
      this.log("KÍCH HOẠT VÍ", `${c.code} · +30.000.000đ · hạn ${vnDate(c.expiresAt)}`);
    }
    // Mô hình 2 cấp: chỉ tầng 2 (người giới thiệu của F1). Chỉ chạy khi đã bật bằng giấy chứng nhận + xác nhận luật sư.
    networkBonus(c, d) {
      const net = this.cfg.network; if (!net.enabled || !net.licenseNo || !net.lawyerConfirmed) return [];
      const lv = net.levels[0], child = this.partner(c.attributedPartnerId);
      const anc = child && child.sponsorId ? this.partner(child.sponsorId) : null;
      if (!anc || !lv.bps || anc.id === c.ownerPartnerId) return [];
      if (this.kpiCount(child.id) < lv.minChildContracts || monthsBetween(child.joinedAt, d) < lv.minMonths) return [];
      const ini = n => { const p = n.trim().split(/\s+/); return p.length > 1 ? p.slice(0, -1).map(w => w[0] + ".").join("") + " " + p[p.length - 1] : n; };
      const e = { id: uid("hh"), partnerId: anc.id, type: "NETWORK", level: 2, state: "PENDING", amount: F.pct(PKG_PRICE, lv.bps), basis: PKG_PRICE, rateBps: lv.bps, sourceRef: c.id, contractId: c.id, period: monthOf(d), at: d, note: `Thưởng tầng 2: ${c.code} qua ${ini(this.partnerName(child.id))}`, ver: this.cfg.version };
      this.s.commissions.push(e); return [e];
    }
    requestSecondLevel() { const n = this.cfg.network; if (!n.enabled || !n.licenseNo || !n.lawyerConfirmed) { this.log("CHẶN THƯỞNG TUYẾN", "Chưa bật thưởng tầng 2 (chưa có giấy chứng nhận/ý kiến luật sư) — từ chối"); return { ok: false, reason: "Chưa bật thưởng tầng 2: cần số giấy chứng nhận đăng ký bán hàng đa cấp và xác nhận của luật sư." }; } return { ok: true }; }
    setNetwork(o) {
      this.need("settings");
      const n = this.cfg.network, before = JSON.stringify(n);
      const lic = String(o.licenseNo || "").trim();
      if (o.enabled && !lic) this.deny("Bật thưởng tầng 2 bị từ chối: chưa nhập số giấy chứng nhận đăng ký bán hàng đa cấp.");
      if (o.enabled && !o.lawyerConfirmed) this.deny("Bật thưởng tầng 2 bị từ chối: chưa xác nhận ý kiến luật sư bằng văn bản.");
      if (lic.length > 60 || /[<>"]/.test(lic)) throw new Error("Số giấy chứng nhận không hợp lệ.");
      if (o.licenseDate && !/^\d{4}-\d{2}-\d{2}$/.test(o.licenseDate)) throw new Error("Ngày cấp không hợp lệ.");
      let levels = n.levels;
      if (Array.isArray(o.levels) && o.levels[0]) {
        const l = o.levels[0];
        levels = [{ level: 2, bps: money(l.bps, "Tỷ lệ tầng 2 (điểm cơ bản)", 0, 2000), minChildContracts: money(l.minChildContracts, "Số hợp đồng tối thiểu", 0, 1000), minMonths: money(l.minMonths, "Số tháng tối thiểu", 0, 60) }, { level: 3, bps: 0, minChildContracts: 50, minMonths: 3 }];
      }
      const next = { enabled: !!o.enabled, licenseNo: lic, licenseDate: o.licenseDate || "", lawyerConfirmed: !!o.lawyerConfirmed, levels };
      if (JSON.stringify(next) === before) throw new Error("Không có thay đổi nào.");
      Object.assign(n, next); this.cfg.version++;
      this.log("CÀI ĐẶT MẠNG LƯỚI", `trước: ${before} → sau: ${JSON.stringify(n)} · phiên bản ${this.cfg.version}`);
    }
    setRates(o) {
      this.need("settings");
      const cur = { referralFlat: this.cfg.referralFlat, addonBps: this.cfg.addonBps, staff: { ...this.cfg.staff } };
      const next = { referralFlat: o.referralFlat != null ? money(o.referralFlat, "Hoa hồng giới thiệu", 0, 10000000) : cur.referralFlat, addonBps: cur.addonBps, staff: { ...cur.staff } };
      if (o.addonBps != null) { const b = Number(o.addonBps); if (!Number.isSafeInteger(b) || b < 1000 || b > 1500) this.deny("Thù lao ngoài gói phải trong khoảng 10–15% theo hợp đồng."); next.addonBps = b; }
      if (o.staff) {
        const S = o.staff;
        if (S.consultBps != null) next.staff.consultBps = money(S.consultBps, "Tỷ lệ tư vấn (điểm cơ bản)", 0, 3000);
        if (S.doctorBps != null) next.staff.doctorBps = money(S.doctorBps, "Tỷ lệ bác sĩ (điểm cơ bản)", 0, 3000);
        if (S.techFee != null) next.staff.techFee = money(S.techFee, "Thù lao KTV/buổi", 0, 2000000);
        if (S.pkgSaleBonus != null) next.staff.pkgSaleBonus = money(S.pkgSaleBonus, "Thưởng bán gói", 0, 5000000);
      }
      if (JSON.stringify(next) === JSON.stringify(cur)) throw new Error("Không có thay đổi nào.");
      this.cfg.referralFlat = next.referralFlat; this.cfg.addonBps = next.addonBps; this.cfg.staff = next.staff; this.cfg.version++;
      this.log("CÀI ĐẶT TỶ LỆ", `trước: ${JSON.stringify(cur)} → sau: ${JSON.stringify(next)} · phiên bản ${this.cfg.version}`);
    }
    children(pid) { return this.s.partners.filter(p => p.sponsorId === pid); }
    downline(pid, depth = 3) { const out = []; let lvl = [pid]; for (let k = 1; k <= depth; k++) { const next = this.s.partners.filter(p => lvl.includes(p.sponsorId)); next.forEach(p => out.push({ p, level: k })); lvl = next.map(p => p.id); if (!lvl.length) break; } return out; }
    kpiCount(pid, month) { return this.s.contracts.filter(c => c.attributedPartnerId === pid && this.isValidForKpi(c) && (!month || monthOf(c.fullyPaidAt) === month)).length; }
    contractUsable(c) { return c && (c.status === "ACTIVE" || c.status === "CONSUMED") && c.expiresAt && this.today <= c.expiresAt; }
    saveSelection(cid, { bundle, options = [], extras = [] }) {
      this.need("select");
      const c = this.contract(cid);
      if (!c || c.status !== "ACTIVE") throw new Error("Chỉ lập phiếu chọn khi ví đang hiệu lực.");
      if (this.today > c.expiresAt) throw new Error(`Gói đã hết hạn ngày ${vnDate(c.expiresAt)}.`);
      const b = bundle ? CAT.BUNDLES.find(x => x.code === bundle) : null;
      if (bundle && !b) throw new Error("Gói chính không có trong danh mục.");
      if (b && this.s.selections.some(s => s.contractId === cid && s.lines.some(l => l.code.startsWith("A")))) throw new Error("Hợp đồng đã chọn gói chính. Phần còn lại trong ví dùng cho dịch vụ da liễu.");
      if (b && b.opts.length) { if (!options.length) throw new Error(`Gói ${b.code}: chọn ít nhất 1 vùng.`); if (b.pickMax && options.length > b.pickMax) throw new Error(`Gói ${b.code}: chỉ được chọn tối đa ${b.pickMax}.`); }
      if (!b && !extras.length) throw new Error("Chưa chọn gì.");
      const lines = [];
      if (b) lines.push({ code: b.code, name: b.name + (options.length ? ` (${options.join(", ")})` : ""), unitValue: b.value, qty: 1, state: "CHO_BAC_SI", sessions: b.code === "A03" ? 2 : 1, bundle: true });
      for (const e of extras) { const it = CAT.itemByCode(e.code); if (!it || !it.price) throw new Error("Dịch vụ không có trong danh mục."); lines.push({ code: it.code, name: it.name, unitValue: it.price, qty: money(e.qty || 1, "Số lượng", 1, 99), state: "CHO_BAC_SI", sessions: it.sessions, unit: it.unit }); }
      const sel = { id: uid("pc"), code: this.code("pcq", "PCQ", 5), contractId: cid, at: this.today, by: this.actor().id, lines, doctor: null };
      this.s.selections.push(sel); this.log("PHIẾU CHỌN", `${c.code} · ${lines.length} mục (mong muốn của khách)`); return sel;
    }
    prescribe(selId, decisions) {
      this.need("prescribe");
      const sel = this.s.selections.find(s => s.id === selId); if (!sel) throw new Error("Không thấy phiếu chọn.");
      if (!this.contractUsable(this.contract(sel.contractId))) throw new Error("Gói đã hết hạn hoặc đã kết thúc — không chỉ định thêm.");
      sel.lines.forEach((l, i) => { const d = decisions[i]; if (!d || l.state !== "CHO_BAC_SI" || l.bundle || l.code.startsWith("A")) return; if (d.ok) { const want = l.wantQty || l.qty || 1; money(d.qty || 1, "Số lượng chỉ định", 1, want); } });
      sel.lines.forEach((l, i) => { const d = decisions[i]; if (l.state !== "CHO_BAC_SI" || !d) return; if (d.ok) { l.state = "DA_CHI_DINH"; l.wantQty = l.wantQty || l.qty; l.qty = l.bundle || l.code.startsWith("A") ? 1 : money(d.qty || 1, "Số lượng chỉ định", 1, l.wantQty || 99); } else { l.state = "KHONG_CHI_DINH"; l.reason = d.reason || ""; } });
      sel.doctor = this.actor().id; this.log("BÁC SĨ CHỈ ĐỊNH", `${this.contract(sel.contractId).code}`);
    }
    redeem(selId, idx, { pin, overageConsent, overagePaid, nonce } = {}) {
      this.need("redeem"); this.assertOpen(this.today);
      const sel = this.s.selections.find(s => s.id === selId); if (!sel) throw new Error("Không thấy phiếu chọn.");
      const c = this.contract(sel.contractId), l = sel.lines[idx];
      if (!l) throw new Error("Không thấy mục.");
      if (!this.contractUsable(c)) throw new Error(c && c.expiresAt && this.today > c.expiresAt ? `Gói đã hết hạn ngày ${vnDate(c.expiresAt)}.` : "Ví không còn hiệu lực.");
      if (l.state !== "DA_CHI_DINH") throw new Error("Mục này chưa được bác sĩ chỉ định.");
      if (c.pinLocked) throw new Error("PIN đã bị khoá do nhập sai nhiều lần — Ban giám đốc mở khoá và khách đặt lại PIN.");
      if (String(pin) !== c.pin) { c.pinFails = (c.pinFails || 0) + 1; if (c.pinFails >= 5) c.pinLocked = true; this.log("SAI PIN", `${c.code} · lần ${c.pinFails}`); throw new Error(c.pinLocked ? "Sai PIN 5 lần — PIN đã bị khoá." : `PIN của chủ gói không đúng (còn ${5 - c.pinFails} lần).`); }
      c.pinFails = 0;
      const value = l.unitValue * l.qty, bal = this.balance(c.id);
      const fromWallet = Math.min(value, Math.max(0, bal)), over = value - fromWallet;
      if (over > 0 && !overageConsent) throw new Error(`Vượt ví ${vnd(over)}đ — cần khách đồng ý trước khi làm (T16).`);
      const paidOver = over > 0 ? money(overagePaid == null || overagePaid === "" ? 0 : overagePaid, "Số thu phần vượt", 0, over) : 0;
      if (paidOver > 0) { this.need("pay"); if (this.usedNonce(nonce)) throw new Error("Khoản thu này đã ghi (chống bấm hai lần)."); }
      const sessions = l.bundle || l.code.startsWith("A") ? (l.sessions || 1) : (l.unit ? (l.sessions || 1) : (l.sessions || 1) * l.qty);
      // ---- mọi kiểm tra đã xong: bắt đầu ghi ----
      let t = this.s.treatments.find(x => x.customerId === c.customerId && x.kind === "WALLET" && x.status === "OPEN");
      if (!t) { t = { id: uid("hs"), code: this.code("tr", "HS", 5), customerId: c.customerId, openedAt: this.today, consultantId: ["LEAD", "CONSULTANT"].includes((this.staff(c.soldById) || {}).role) ? c.soldById : null, doctorId: sel.doctor, status: "OPEN", lines: [], note: `Quyền lợi gói ${c.code}`, kind: "WALLET" }; this.s.treatments.push(t); }
      let w = null;
      if (fromWallet > 0) { w = { id: uid("vi"), contractId: c.id, kind: "REDEEM", amount: -fromWallet, label: l.name + (l.qty > 1 ? ` ×${l.qty}` : ""), itemCode: l.code, at: this.today, by: this.actor().id, treatmentId: t.id }; this.s.wallet.push(w); }
      t.lines.push({ id: uid("dv"), code: l.code, name: l.name + (l.qty > 1 ? ` ×${l.qty}` : "") + (fromWallet > 0 ? " (trừ ví)" : " (ngoài ví)"), unitPrice: over, qty: 1, discount: 0, finalPrice: over, listValue: fromWallet, sessionsTotal: sessions, sessionsDone: 0, walletEntryId: w ? w.id : null, overage: over, addedBy: this.actor().id, at: this.today });
      l.state = "DA_DUNG";
      this.log("GHI NHẬN SỬ DỤNG", `${c.code} · ${l.name} · trừ ví ${vnd(fromWallet)}đ${over ? ` · phần vượt ${vnd(over)}đ thu riêng` : ""} · còn ${vnd(this.balance(c.id))}đ · khách xác nhận PIN`);
      if (paidOver > 0) this.pay(t.id, paidOver, { nonce });
      if (this.balance(c.id) === 0 && c.status === "ACTIVE") { c.status = "CONSUMED"; c.endedAt = this.today; this.log("DÙNG HẾT VÍ", c.code); }
      return t;
    }
    resetPin(cid, newPin) {
      this.need("settings");
      const c = this.contract(cid); if (!c) throw new Error("Không thấy hợp đồng.");
      if (!/^\d{6}$/.test(String(newPin || ""))) throw new Error("PIN mới phải gồm 6 số.");
      c.pin = String(newPin); c.pinFails = 0; c.pinLocked = false; this.log("ĐẶT LẠI PIN", c.code);
    }
    _refundPackageRequest(c, amount, why) {
      const cus = this.customer(c.customerId);
      const r = { id: uid("dn"), code: this.code("dn", "DNTT-", 5), category: "HOAN_TIEN", payee: `${cus.name} (${cus.code})`, amount, note: `${why} ${c.code}`, status: "PENDING", createdBy: this.actor().id, createdAt: this.today, source: { type: "REFUND_PACKAGE", contractId: c.id } };
      this.s.requests.push(r); c.refundRequestId = r.id; return r;
    }
    _voidUnpaidReferral(c, why) {
      for (const e of this.s.commissions.filter(e => e.contractId === c.id && e.amount > 0 && ["REFERRAL_FLAT", "NETWORK"].includes(e.type))) {
        if (this.s.commissions.some(x => x.reversalOf === e.id)) continue;
        if (e.batchId) { const b = this.s.batches.find(x => x.id === e.batchId); if (b && b.status === "CHO_DUYET") { b.entryIds = b.entryIds.filter(id => id !== e.id); e.batchId = null; e.state = "ELIGIBLE"; this._rebuildBatch(b); } }
        if (["PENDING", "ELIGIBLE"].includes(e.state) && !e.batchId) { e.state = "VOID"; this.s.commissions.push({ id: uid("hh"), partnerId: e.partnerId, type: "CLAWBACK", state: "VOID", amount: -e.amount, reversalOf: e.id, contractId: c.id, period: e.period, at: this.today, note: `${why} ${c.code} trước khi trả — đảo` }); }
        else if (why === "Huỷ") this.s.commissions.push({ id: uid("hh"), partnerId: e.partnerId, type: "OFFSET", state: "ELIGIBLE", amount: -e.amount, reversalOf: e.id, contractId: c.id, period: nextMonth(monthOf(this.today)), at: this.today, note: `Huỷ ${c.code} sau khi đã trả — bù trừ kỳ sau (D6)` });
      }
    }
    // Tính lại lô chờ duyệt: đối tác nào có số ròng ≤ 0 thì tháo hết khoản của người đó về "khả dụng" (chuyển kỳ sau); lô rỗng → trả lại.
    _rebuildBatch(b) {
      const byP = {}; b.entryIds.forEach(id => { const e = this.s.commissions.find(x => x.id === id); (byP[e.partnerId] = byP[e.partnerId] || []).push(e); });
      const ids = [], lines = []; let total = 0;
      for (const [pid, es] of Object.entries(byP)) { const net = es.reduce((a, e) => a + e.amount, 0); if (net <= 0) { es.forEach(e => { e.batchId = null; e.state = "ELIGIBLE"; }); continue; } es.forEach(e => ids.push(e.id)); total += net; lines.push({ partnerId: pid, net, count: es.length }); }
      b.entryIds = ids; b.lines = lines; b.total = total; if (!ids.length) b.status = "TRA_LAI";
    }
    // Lập lại đề nghị hoàn tiền gói (sau khi lần trước bị từ chối) — tiền khách không bị kẹt.
    reissueRefund(cid) {
      this.need("end");
      const c = this.contract(cid); if (!c) throw new Error("Không thấy hợp đồng.");
      if (!["CANCELLED", "EXPIRED", "TERMINATED"].includes(c.status) || !(c.refundAmount > 0) || c.refundPaidAt) throw new Error("Hợp đồng này không còn khoản hoàn nào.");
      if (c.refundRequestId) throw new Error("Đã có đề nghị hoàn đang chờ xử lý.");
      const r = this._refundPackageRequest(c, c.refundAmount, "Lập lại đề nghị hoàn");
      this.log("LẬP LẠI ĐỀ NGHỊ HOÀN", `${c.code} · ${vnd(c.refundAmount)}đ · ${r.code}`); return r;
    }
    endWithRefund(cid, reason) {
      this.need("end"); this.assertOpen(this.today);
      const c = this.contract(cid); if (!c) throw new Error("Không thấy hợp đồng.");
      if (c.status !== "ACTIVE") throw new Error("Chỉ áp dụng cho hợp đồng đang hiệu lực.");
      if (!["EXPIRED", "TERMINATED"].includes(reason)) throw new Error("Lý do kết thúc không hợp lệ.");
      if (reason === "EXPIRED" && this.today < c.expiresAt) throw new Error(`Chưa tới hạn (${vnDate(c.expiresAt)}). Nếu khách muốn dừng sớm, dùng "Chấm dứt".`);
      const bal = this.balance(cid), refund = F.refundUnused(bal);
      if (bal > 0) this.s.wallet.push({ id: uid("vi"), contractId: cid, kind: reason === "EXPIRED" ? "EXPIRE" : "REFUND_CONVERSION", amount: -bal, label: reason === "EXPIRED" ? "Hết hạn — quy đổi hoàn tiền" : "Chấm dứt — quy đổi hoàn tiền", at: this.today, by: this.actor().id });
      c.status = reason; c.endedAt = this.today; c.refundDueAt = addWorkingDays(this.today, 15); c.refundAmount = refund;
      if (reason === "TERMINATED") this._voidUnpaidReferral(c, "Chấm dứt");
      if (refund > 0) this._refundPackageRequest(c, refund, reason === "EXPIRED" ? "Hoàn phần chưa dùng (hết hạn)" : "Hoàn phần chưa dùng (chấm dứt)");
      this.log(reason === "EXPIRED" ? "HẾT HẠN GÓI" : "CHẤM DỨT GÓI", `${c.code} · số dư ${vnd(bal)}đ → hoàn ${vnd(refund)}đ (F1) · hạn ${vnDate(c.refundDueAt)} · chờ duyệt chi`);
      return refund;
    }
    cancel(cid) {
      this.need("end"); this.assertOpen(this.today);
      const c = this.contract(cid); if (!c) throw new Error("Không thấy hợp đồng.");
      if (!["SIGNED", "ACTIVE"].includes(c.status)) throw new Error("Không huỷ được hợp đồng ở trạng thái này.");
      if (this.used(cid) > 0) throw new Error("Ví đã dùng một phần — dùng 'Chấm dứt & hoàn phần chưa dùng'.");
      const paid = this.paid(cid);
      if (this.balance(cid) > 0) this.s.wallet.push({ id: uid("vi"), contractId: cid, kind: "REFUND_CONVERSION", amount: -this.balance(cid), label: "Huỷ hợp đồng", at: this.today, by: this.actor().id });
      c.status = "CANCELLED"; c.endedAt = this.today; c.refundDueAt = paid > 0 ? addWorkingDays(this.today, 15) : null; c.refundAmount = paid;
      this._voidUnpaidReferral(c, "Huỷ");
      if (paid > 0) this._refundPackageRequest(c, paid, "Hoàn tiền huỷ hợp đồng");
      this.log("HUỶ HỢP ĐỒNG", `${c.code} · hoàn ${vnd(paid)}đ · chờ duyệt chi`);
    }
    // ================= HOA HỒNG: ĐỐI SOÁT → LÔ → DUYỆT → CHI =================
    reconcile(period) {
      this.need("reconcile");
      if (!/^\d{4}-\d{2}$/.test(String(period))) throw new Error("Kỳ không hợp lệ.");
      if (period >= monthOf(this.today)) throw new Error("Chỉ đối soát kỳ đã kết thúc.");
      let n = 0, sum = 0, voided = 0;
      for (const e of this.s.commissions) {
        if (e.state !== "PENDING" || e.period > period) continue;
        const c = e.contractId ? this.contract(e.contractId) : null;
        if (c && ["CANCELLED", "TERMINATED"].includes(c.status) && e.amount > 0) { e.state = "VOID"; voided++; continue; } // F2: đã huỷ/hoàn tại ngày đối soát
        e.state = "ELIGIBLE"; e.eligibleAt = this.today; n++; sum += e.amount;
      }
      this.log("ĐỐI SOÁT", `Kỳ ${period} · ${n} khoản → khả dụng · ${vnd(sum)}đ${voided ? ` · loại ${voided} khoản của hợp đồng đã huỷ/chấm dứt` : ""}`); return { n, sum, voided };
    }
    createBatch() {
      this.need("batchCreate");
      const pool = this.s.commissions.filter(e => e.state === "ELIGIBLE" && !e.batchId), byP = {};
      pool.forEach(e => (byP[e.partnerId] = byP[e.partnerId] || []).push(e));
      const ids = [], lines = []; let total = 0;
      for (const [pid, es] of Object.entries(byP)) { const net = es.reduce((a, e) => a + e.amount, 0); if (net <= 0) continue; es.forEach(e => ids.push(e.id)); total += net; lines.push({ partnerId: pid, net, count: es.length }); }
      if (!ids.length) throw new Error("Không có khoản nào đủ điều kiện (hoặc số âm lớn hơn số dương — chuyển kỳ sau).");
      const b = { id: uid("lo"), code: this.code("batch", "LO-", 4), createdBy: this.actor().id, createdAt: this.today, approvedBy: null, status: "CHO_DUYET", entryIds: ids, total, lines, requestIds: [] };
      ids.forEach(id => { const e = this.s.commissions.find(x => x.id === id); e.state = "IN_BATCH"; e.batchId = b.id; });
      this.s.batches.unshift(b); this.log("LẬP LÔ CHI TRẢ", `${b.code} · ${lines.length} đối tác · ${vnd(total)}đ`); return b;
    }
    approveBatch(bid) {
      this.need("batchApprove");
      const b = this.s.batches.find(x => x.id === bid);
      if (!b || b.status !== "CHO_DUYET") throw new Error("Lô không ở trạng thái chờ duyệt.");
      if (b.createdBy === this.actor().id) this.deny(`Người lập lô ${b.code} không được tự duyệt (tách quyền hai người).`);
      b.status = "DA_DUYET"; b.approvedBy = this.actor().id; b.approvedAt = this.today;
      const ini = n => { const p = n.trim().split(/\s+/); return p.length > 1 ? p.slice(0, -1).map(w => w[0] + ".").join("") + " " + p[p.length - 1] : n; };
      b.requestIds = b.lines.map(l => { const r = { id: uid("dn"), code: this.code("dn", "DNTT-", 5), category: "HOA_HONG", payee: `${this.partnerName(l.partnerId)} (${this.partner(l.partnerId).code})`, partnerId: l.partnerId, amount: l.net, note: `Hoa hồng đối tác — lô ${b.code}`, status: "APPROVED", createdBy: b.createdBy, createdAt: b.createdAt, approvedBy: this.actor().id, approvedAt: this.today, source: { type: "BATCH", id: b.id } }; this.s.requests.push(r); return r.id; });
      this.log("DUYỆT LÔ", `${b.code} · sinh ${b.requestIds.length} giấy đề nghị thanh toán`);
    }
    payBatch(bid) {
      this.need("batchPay"); this.assertOpen(this.today);
      const b = this.s.batches.find(x => x.id === bid);
      if (!b || b.status !== "DA_DUYET") throw new Error("Lô phải được duyệt trước khi ghi đã chuyển.");
      if (b.approvedBy === this.actor().id) this.deny(`Người duyệt lô ${b.code} không tự ghi chi — kế toán thực hiện.`);
      b.status = "DA_TRA"; b.paidAt = this.today; b.paidBy = this.actor().id;
      b.entryIds.forEach(id => { const e = this.s.commissions.find(x => x.id === id); e.state = "PAID"; e.paidAt = this.today; });
      b.requestIds.forEach(id => { const r = this.s.requests.find(x => x.id === id); r.status = "PAID"; r.paidAt = this.today; r.paidBy = this.actor().id; });
      this.log("CHI HOA HỒNG", `${b.code} · ${vnd(b.total)}đ`);
    }
    rejectBatch(bid) {
      this.need("batchApprove");
      const b = this.s.batches.find(x => x.id === bid); if (!b || b.status !== "CHO_DUYET") throw new Error("Chỉ trả lại lô đang chờ duyệt.");
      b.status = "TRA_LAI"; b.approvedBy = this.actor().id;
      b.entryIds.forEach(id => { const e = this.s.commissions.find(x => x.id === id); e.state = "ELIGIBLE"; e.batchId = null; });
      this.log("TRẢ LẠI LÔ", b.code);
    }
    earnings(pid) {
      const es = this.s.commissions.filter(e => e.partnerId === pid && e.state !== "VOID");
      const sum = st => es.filter(e => st.includes(e.state)).reduce((a, e) => a + e.amount, 0);
      return { pending: sum(["PENDING"]), available: sum(["ELIGIBLE", "IN_BATCH"]), paid: sum(["PAID"]), entries: es };
    }

    // ================= ĐỀ NGHỊ THANH TOÁN / SỔ CHI =================
    createRequest({ category, payee, amount, note }) {
      this.need("expenseCreate");
      if (!REQ_CATS.includes(category)) throw new Error("Chọn hạng mục chi trong danh sách.");
      payee = String(payee || "").trim(); if (!payee) throw new Error("Nhập người/đơn vị nhận tiền.");
      if (payee.length > 120 || /[<>]/.test(payee)) throw new Error("Tên người nhận không hợp lệ.");
      amount = money(amount, "Số tiền đề nghị", 1, 2000000000);
      const r = { id: uid("dn"), code: this.code("dn", "DNTT-", 5), category, payee, amount, note: String(note || "").slice(0, 300), status: "PENDING", createdBy: this.actor().id, createdAt: this.today };
      this.s.requests.push(r); this.log("LẬP ĐỀ NGHỊ CHI", `${r.code} · ${vnd(amount)}đ · ${r.payee}`); return r;
    }
    approveRequest(id) {
      this.need("expenseApprove");
      const r = this.s.requests.find(x => x.id === id); if (!r || r.status !== "PENDING") throw new Error("Chứng từ không ở trạng thái chờ duyệt.");
      if (r.createdBy === this.actor().id) this.deny(`Người lập ${r.code} không được tự duyệt.`);
      r.status = "APPROVED"; r.approvedBy = this.actor().id; r.approvedAt = this.today; this.log("DUYỆT CHI", r.code);
    }
    rejectRequest(id, reason) {
      this.need("expenseApprove");
      const r = this.s.requests.find(x => x.id === id); if (!r || r.status !== "PENDING") throw new Error("Chỉ từ chối chứng từ đang chờ.");
      if (!String(reason || "").trim()) throw new Error("Nhập lý do từ chối.");
      r.status = "REJECTED"; r.approvedBy = this.actor().id; r.approvedAt = this.today; r.rejectReason = String(reason).trim().slice(0, 200);
      if (r.source && r.source.type === "REFUND_PACKAGE") { const c = this.contract(r.source.contractId); if (c) c.refundRequestId = null; }
      this.log("TỪ CHỐI CHI", `${r.code} · ${reason}`);
    }
    payRequest(id) {
      this.need("expensePay"); this.assertOpen(this.today);
      const r = this.s.requests.find(x => x.id === id); if (!r || r.status !== "APPROVED") throw new Error("Chứng từ phải được duyệt trước khi chi.");
      if (r.source && r.source.type === "BATCH") throw new Error("Khoản hoa hồng chi theo lô — dùng nút 'Ghi đã chuyển' của lô.");
      if (r.approvedBy === this.actor().id) this.deny(`Người duyệt ${r.code} không tự ghi chi — kế toán thực hiện.`);
      if (r.source && r.source.type === "REFUND_TREATMENT") this._executeRefundTreatment(r);
      if (r.source && r.source.type === "REFUND_PACKAGE") { const c = this.contract(r.source.contractId); this.s.pkgPayments.push({ id: uid("tg"), code: this.code("pchi", "PC", 6), contractId: c.id, kind: "REFUND", amount: -r.amount, method: "TRANSFER", at: this.today, by: this.actor().id, requestId: r.id }); c.refundPaidAt = this.today; }
      r.status = "PAID"; r.paidAt = this.today; r.paidBy = this.actor().id;
      if (r.source && r.source.type === "PAYROLL") { const run = this.s.payrollRuns.find(x => x.id === r.source.id); if (run) { run.status = "PAID"; run.paidAt = this.today; } }
      this.log("ĐÃ CHI", `${r.code} · ${vnd(r.amount)}đ`);
    }
    // ================= LƯƠNG NHÂN SỰ =================
    programRevenue(m) {
      const pk = this.s.pkgPayments.filter(p => monthOf(p.at) === m).reduce((a, p) => a + p.amount, 0);
      const tr = this.s.payments.filter(p => monthOf(p.at) === m && (this.cfg.revenueScope === "ALL" || this.referrerFor(p.customerId) || this.partnerOfCustomer(p.customerId))).reduce((a, p) => a + p.amount, 0);
      return pk + tr;
    }
    computePayroll(m) {
      const st = this.cfg.staff, rev = Math.max(0, this.programRevenue(m));
      const prevRun = this.s.payrollRuns.find(r => r.month === prevMonth(m) && r.status !== "REJECTED");
      return STAFF.filter(x => !["SHAREHOLDER", "PARTNER"].includes(x.role)).map(x => {
        const trs = this.s.treatments;
        const consultBase = this.s.payments.filter(p => monthOf(p.at) === m && trs.find(t => t.id === p.treatmentId && t.consultantId === x.id)).reduce((a, p) => a + p.amount, 0);
        const doctorBase = this.s.payments.filter(p => monthOf(p.at) === m && trs.find(t => t.id === p.treatmentId && t.doctorId === x.id)).reduce((a, p) => a + p.amount, 0);
        const sess = this.s.sessions.filter(s => monthOf(s.at) === m && s.techId === x.id).length;
        const pkgs = this.s.contracts.filter(c => c.soldById === x.id && c.fullyPaidAt && monthOf(c.fullyPaidAt) === m).length;
        // Hoàn tiền trong tháng làm căn cứ âm → thu hồi phần hoa hồng đã trả tháng trước (F.pctSigned).
        const consult = ["LEAD", "CONSULTANT", "RECEPTION"].includes(x.role) ? F.pctSigned(consultBase, st.consultBps) : 0;
        const doctor = x.role === "DOCTOR" ? F.pctSigned(doctorBase, st.doctorBps) : 0;
        const tech = x.role === "TECH" ? sess * st.techFee : 0;
        const leader = x.pctBps ? F.pct(rev, x.pctBps) : 0;
        const pkgBonus = pkgs * (st.pkgSaleBonus || 0);
        const base = x.base || 0;
        // Thu hồi lớn hơn thu nhập: dòng lương không xuống dưới 0, phần thiếu chuyển trừ kỳ sau.
        const pl = prevRun && prevRun.lines.find(l => l.staffId === x.id), carryIn = pl && pl.carryOut ? -pl.carryOut : 0;
        const raw = base + consult + doctor + tech + leader + pkgBonus + carryIn;
        return { staffId: x.id, base, consult, consultBase, doctor, doctorBase, tech, sessions: sess, leader, pkgs, pkgBonus, carryIn, carryOut: raw < 0 ? -raw : 0, adjust: 0, total: Math.max(0, raw) };
      });
    }
    createPayrollRun(m) {
      this.need("payrollCreate");
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(m)) || m < "2024-01") throw new Error("Tháng lương không hợp lệ.");
      if (m >= monthOf(this.today)) throw new Error("Chỉ lập bảng lương cho tháng đã kết thúc.");
      if (this.s.payrollRuns.some(r => r.month === m && r.status !== "REJECTED")) throw new Error(`Đã có bảng lương tháng ${m}.`);
      const lines = this.computePayroll(m);
      const run = { id: uid("bl"), code: this.code("bl", "BL-", 4), month: m, lines, total: lines.reduce((a, l) => a + l.total, 0), status: "DRAFT", createdBy: this.actor().id, createdAt: this.today, adjustedBy: [] };
      this.s.payrollRuns.unshift(run); this.log("LẬP BẢNG LƯƠNG", `${run.code} · tháng ${m} · ${vnd(run.total)}đ`); return run;
    }
    adjustPayroll(runId, staffId, amount, note) {
      this.need("payrollCreate");
      const run = this.s.payrollRuns.find(r => r.id === runId); if (!run || run.status !== "DRAFT") throw new Error("Chỉ điều chỉnh bảng lương nháp.");
      if (!String(note || "").trim()) throw new Error("Nhập lý do điều chỉnh.");
      const l = run.lines.find(x => x.staffId === staffId); if (!l) throw new Error("Không thấy nhân sự trong bảng lương.");
      if (staffId === this.actor().id) this.deny("Không tự điều chỉnh dòng lương của chính mình.");
      const v = money(amount, "Số tiền điều chỉnh", -100000000, 100000000);
      const total = l.base + l.consult + l.doctor + l.tech + l.leader + l.pkgBonus + (l.carryIn || 0) + v;
      if (total < 0) throw new Error("Tổng lương sau điều chỉnh không được âm.");
      if (l.carryOut && v > 0) l.carryOut = Math.max(0, l.carryOut - v);
      const before = l.adjust; l.adjust = v; l.adjustNote = String(note).trim().slice(0, 200); l.total = total;
      run.total = run.lines.reduce((a, x) => a + x.total, 0);
      run.adjustedBy = Array.from(new Set([...(run.adjustedBy || []), this.actor().id]));
      this.log("ĐIỀU CHỈNH LƯƠNG", `${run.code} · ${this.staff(staffId).name}: ${vnd(before)} → ${vnd(v)}đ · ${note}`);
    }
    approvePayroll(runId) {
      this.need("payrollApprove");
      const run = this.s.payrollRuns.find(r => r.id === runId); if (!run || run.status !== "DRAFT") throw new Error("Bảng lương không ở trạng thái chờ duyệt.");
      if (run.createdBy === this.actor().id) this.deny(`Người lập ${run.code} không được tự duyệt.`);
      if (run.lines.some(l => l.total < 0)) throw new Error("Bảng lương có dòng âm — không duyệt được.");
      if ((run.adjustedBy || []).includes(this.actor().id)) this.deny(`Người đã điều chỉnh ${run.code} không được duyệt — mời người khác trong Ban giám đốc.`);
      run.status = "APPROVED"; run.approvedBy = this.actor().id; run.approvedAt = this.today;
      const r = { id: uid("dn"), code: this.code("dn", "DNTT-", 5), category: "LUONG", payee: `Nhân sự — bảng lương ${run.month}`, amount: run.total, note: run.code, status: "APPROVED", createdBy: run.createdBy, createdAt: run.createdAt, approvedBy: this.actor().id, approvedAt: this.today, source: { type: "PAYROLL", id: run.id } };
      this.s.requests.push(r); run.requestId = r.id; this.log("DUYỆT LƯƠNG", `${run.code} · ${vnd(run.total)}đ`);
    }
    rejectPayroll(runId, reason) {
      this.need("payrollApprove");
      const run = this.s.payrollRuns.find(r => r.id === runId); if (!run || run.status !== "DRAFT") throw new Error("Chỉ trả lại bảng lương nháp.");
      if (!String(reason || "").trim()) throw new Error("Nhập lý do trả lại.");
      run.status = "REJECTED"; run.rejectedBy = this.actor().id; run.rejectReason = reason; this.log("TRẢ LẠI BẢNG LƯƠNG", `${run.code} · ${reason}`);
    }
    // ================= SỔ QUỸ & CHỐT SỔ =================
    // Báo cáo theo DÒNG TIỀN: thu/chi ghi theo ngày tiền vào/ra. Hoàn tiền khách đã trừ vào thu (không tính lại vào chi).
    monthSummary(m) {
      const trIn = this.s.payments.filter(p => monthOf(p.at) === m).reduce((a, p) => a + p.amount, 0);
      const pkIn = this.s.pkgPayments.filter(p => monthOf(p.at) === m).reduce((a, p) => a + p.amount, 0);
      const out = {}; this.s.requests.filter(r => r.status === "PAID" && monthOf(r.paidAt) === m && r.category !== "HOAN_TIEN").forEach(r => { out[r.category] = (out[r.category] || 0) + r.amount; });
      const expense = Object.values(out).reduce((a, b) => a + b, 0);
      return { month: m, treatmentIncome: trIn, packageIncome: pkIn, income: trIn + pkIn, expenseByCat: out, expense, profit: trIn + pkIn - expense };
    }
    closePending(m) { return { requests: this.s.requests.filter(r => monthOf(r.createdAt) <= m && ["PENDING", "APPROVED"].includes(r.status)).length, payroll: this.s.payrollRuns.filter(r => r.month <= m && r.status === "DRAFT").length, batches: this.s.batches.filter(b => monthOf(b.createdAt) <= m && ["CHO_DUYET", "DA_DUYET"].includes(b.status)).length }; }
    closeMonth(m, { force = false } = {}) {
      this.need("closeMonth");
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(m))) throw new Error("Tháng không hợp lệ.");
      if (m >= monthOf(this.today)) throw new Error("Chỉ chốt sổ tháng đã kết thúc.");
      if (this.isClosed(m)) throw new Error("Tháng này đã chốt.");
      const pend = this.closePending(m);
      if ((pend.requests || pend.payroll || pend.batches) && !force) { const e = new Error(`Còn ${pend.requests} chứng từ chưa chi, ${pend.payroll} bảng lương nháp và ${pend.batches} lô hoa hồng chưa chi. Xử lý xong hoặc bấm "Vẫn chốt".`); e.needForce = true; throw e; }
      const snap = this.monthSummary(m);
      this.s.periods.push({ month: m, closedBy: this.actor().id, closedAt: this.today, snapshot: snap, pendingAtClose: pend }); // giữ lịch sử các lần chốt/mở
      this.log("CHỐT SỔ", `Tháng ${m} · thu ${vnd(snap.income)}đ · chi ${vnd(snap.expense)}đ · lãi ${vnd(snap.profit)}đ${pend.requests || pend.payroll ? ` · còn ${pend.requests} chứng từ, ${pend.payroll} bảng lương treo` : ""}`);
    }
    reopenMonth(m, reason) {
      this.need("closeMonth");
      const p = this.s.periods.filter(x => x.month === m && !x.reopenedAt).pop(); if (!p) throw new Error("Tháng này chưa chốt.");
      if (!String(reason || "").trim()) throw new Error("Nhập lý do mở lại sổ.");
      p.reopenedAt = this.today; p.reopenedBy = this.actor().id; p.reopenReason = String(reason).trim(); this.log("MỞ LẠI SỔ", `Tháng ${m} · ${reason}`);
    }
    // ================= CHĂM SÓC KHÁCH =================
    careList() {
      const out = [], t = this.today;
      const logged = (cid, kind) => this.s.careLogs.some(l => l.customerId === cid && l.kind === kind && daysBetween(l.at, t) < 14);
      for (const c of this.s.customers) {
        const last = this.s.sessions.filter(s => this.treatment(s.treatmentId)?.customerId === c.id).map(s => s.at).sort().pop();
        const future = this.s.appointments.some(a => a.customerId === c.id && a.date >= t && a.status === "BOOKED");
        if (last && daysBetween(last, t) >= 3 && daysBetween(last, t) <= 10 && !future && !logged(c.id, "AFTERCARE")) out.push({ customerId: c.id, kind: "AFTERCARE", label: `Hỏi thăm sau buổi điều trị ngày ${vnDate(last)}` });
        const debt = this.s.treatments.filter(x => x.customerId === c.id).reduce((a, x) => a + this.sumTreatment(x).debt, 0);
        if (debt > 0 && !logged(c.id, "DEBT")) out.push({ customerId: c.id, kind: "DEBT", label: `Còn nợ ${vnd(debt)}đ` });
      }
      for (const k of this.s.contracts.filter(x => x.status === "ACTIVE" && x.expiresAt)) {
        const d = daysBetween(t, k.expiresAt);
        if (d >= 0 && d <= 30 && !logged(k.customerId, "EXPIRY")) out.push({ customerId: k.customerId, kind: "EXPIRY", label: `Gói ${k.code} hết hạn ${vnDate(k.expiresAt)} — ví còn ${vnd(this.balance(k.id))}đ` });
      }
      return out;
    }
    logCare(customerId, kind, note) {
      this.need("care");
      if (!this.customer(customerId)) throw new Error("Không thấy khách hàng.");
      this.assertScope(customerId);
      if (!String(note || "").trim()) throw new Error("Ghi lại nội dung đã trao đổi với khách.");
      this.s.careLogs.push({ id: uid("cs"), customerId, kind, note, at: this.today, by: this.actor().id }); this.log("CHĂM SÓC", `${this.customer(customerId).name} · ${note}`);
    }
    addActivity(partnerId, title) { this.need("activity"); this.s.activities.push({ id: uid("nv"), partnerId, month: monthOf(this.today), title, at: this.today, by: this.actor().id }); this.log("GHI NHẬN NHIỆM VỤ", `${this.partnerName(partnerId)} · ${title}`); }

    // ================= TRUY NGUỒN & HÀNH TRÌNH KHÁCH =================
    // Chuỗi nguồn gốc: khách ← đối tác giới thiệu (tầng 1) ← người giới thiệu đối tác đó (tầng 2).
    lineage(customerId) {
      const c = this.customer(customerId); if (!c) return [];
      const chain = []; let pid = c.referrerPartnerId, lvl = 1;
      while (pid && lvl <= 2) { const p = this.partner(pid); if (!p) break; chain.push({ level: lvl, partner: p, name: this.partnerName(p.id) }); pid = p.sponsorId; lvl++; }
      return chain;
    }
    // Khách do một đối tác mang về: tầng 1 (trực tiếp) và tầng 2 (qua đối tác mình giới thiệu).
    broughtBy(partnerId) {
      const direct = this.s.customers.filter(c => c.referrerPartnerId === partnerId);
      const kids = this.children(partnerId).map(p => p.id);
      const level2 = this.s.customers.filter(c => kids.includes(c.referrerPartnerId));
      return { direct, level2 };
    }
    journey(customerId) {
      const c = this.customer(customerId); if (!c) return [];
      const ev = [], S = this.s, nm = id => (this.staff(id) || {}).name || "—";
      const src = CAT.SOURCES[c.source] || c.source;
      ev.push({ at: c.createdAt, kind: "START", title: `Lần đầu đến trung tâm — nguồn: ${src}`, detail: c.referrerPartnerId ? `Đối tác giới thiệu: ${this.partnerName(c.referrerPartnerId)} (${this.partner(c.referrerPartnerId).code})` : `Tiếp nhận bởi ${nm(c.createdBy)}` });
      S.appointments.filter(a => a.customerId === c.id).forEach(a => ev.push({ at: a.date, kind: "APPT", title: `Lịch hẹn ${a.time} — ${({ BOOKED: "đã đặt", ARRIVED: "đã đến", DONE: "hoàn thành", CANCELLED: "huỷ", NO_SHOW: "không đến" })[a.status]}`, detail: a.note }));
      S.treatments.filter(t => t.customerId === c.id).forEach(t => ev.push({ at: t.openedAt, kind: "TREAT", title: `Mở hồ sơ điều trị ${t.code}`, detail: `Tư vấn: ${nm(t.consultantId)} · Bác sĩ: ${nm(t.doctorId)}` }));
      S.sessions.filter(s => this.treatment(s.treatmentId)?.customerId === c.id).forEach(s => { const t = this.treatment(s.treatmentId), l = t.lines.find(x => x.id === s.lineId); ev.push({ at: s.at, kind: "SESSION", title: `Buổi ${s.no}/${l ? l.sessionsTotal : "?"}: ${l ? l.name : ""}`, detail: `KTV: ${nm(s.techId)} · BS: ${nm(s.doctorId)}` }); });
      S.payments.filter(p => p.customerId === c.id).forEach(p => ev.push({ at: p.at, kind: p.amount < 0 ? "REFUND" : "PAY", title: p.amount < 0 ? `Hoàn tiền ${vnd(-p.amount)}đ` : `Thanh toán ${vnd(p.amount)}đ`, detail: `${p.code}${p.reason ? " · " + p.reason : ""}` }));
      const own = this.partnerOfCustomer(c.id);
      if (own) ev.push({ at: own.joinedAt, kind: "PKG", title: `Trở thành đối tác ${own.code}`, detail: own.sponsorId ? `Tuyến trên: ${this.partnerName(own.sponsorId)}` : "Không có tuyến trên" });
      S.contracts.filter(k => k.customerId === c.id).forEach(k => {
        ev.push({ at: k.signedAt, kind: "PKG", title: `Ký gói 15 triệu ${k.code}`, detail: k.attributedPartnerId ? `Giới thiệu: ${this.partnerName(k.attributedPartnerId)}` : "Không có người giới thiệu" });
        S.pkgPayments.filter(p => p.contractId === k.id).forEach(p => ev.push({ at: p.at, kind: p.amount < 0 ? "REFUND" : "PAY", title: p.amount < 0 ? `Hoàn tiền gói ${vnd(-p.amount)}đ` : `Thu tiền gói ${vnd(p.amount)}đ`, detail: p.code }));
        S.wallet.filter(w => w.contractId === k.id).forEach(w => ev.push({ at: w.at, kind: "WALLET", title: w.kind === "GRANT" ? "Kích hoạt ví 30.000.000đ" : `Ví: ${w.label}`, detail: `${vnd(w.amount)}đ` }));
        S.selections.filter(x => x.contractId === k.id).forEach(x => ev.push({ at: x.at, kind: "WALLET", title: `Phiếu chọn ${x.code}`, detail: x.lines.map(l => l.name + " — " + ({ CHO_BAC_SI: "chờ bác sĩ", DA_CHI_DINH: "đã chỉ định", KHONG_CHI_DINH: "không chỉ định", DA_DUNG: "đã dùng" })[l.state]).join("; ") }));
        if (["CANCELLED", "TERMINATED", "EXPIRED"].includes(k.status)) ev.push({ at: k.endedAt, kind: "REFUND", title: ({ CANCELLED: "Huỷ hợp đồng", TERMINATED: "Chấm dứt hợp đồng", EXPIRED: "Hết hạn hợp đồng" })[k.status] + ` ${k.code}`, detail: k.refundAmount ? `Hoàn ${vnd(k.refundAmount)}đ` : "" });
      });
      S.careLogs.filter(l => l.customerId === c.id).forEach(l => ev.push({ at: l.at, kind: "CARE", title: "Chăm sóc khách", detail: `${l.note} — ${nm(l.by)}` }));
      if (own) this.broughtBy(own.id).direct.forEach(x => ev.push({ at: x.createdAt, kind: "REFER", title: `Giới thiệu khách ${x.name}`, detail: x.code }));
      return ev.sort((a, b) => a.at.localeCompare(b.at));
    }
    // ================= PHẠM VI DỮ LIỆU =================
    scope() {
      const a = this.actor();
      if (["ADMIN", "MANAGER", "SHAREHOLDER"].includes(a.role)) return { all: true, ids: STAFF.map(x => x.id), label: "Toàn trung tâm" };
      if (a.role === "LEAD") return { all: false, ids: STAFF.filter(x => x.team === a.team).map(x => x.id), label: "Của " + TEAMS[a.team] };
      if (["RECEPTION", "DOCTOR", "TECH"].includes(a.role)) return { all: false, frontDesk: true, ids: [a.id], label: "Của bạn" };
      return { all: false, ids: [a.id], label: "Của bạn" };
    }
    // Khách mà người đang đăng nhập được xem
    visibleCustomers() {
      const a = this.actor(), sc = this.scope();
      if (sc.all || sc.frontDesk) return this.s.customers;
      if (a.role === "PARTNER") return [];
      // Của mình/nhóm mình + khách mới chưa có ai phụ trách (để nhận tư vấn).
      return this.s.customers.filter(c => { const trs = this.s.treatments.filter(t => t.customerId === c.id), ks = this.s.contracts.filter(k => k.customerId === c.id);
        if (trs.some(t => sc.ids.includes(t.consultantId)) || ks.some(k => sc.ids.includes(k.soldById))) return true;
        return !trs.some(t => t.consultantId) && !ks.length && (sc.ids.includes(c.createdBy) || daysBetween(c.createdAt, this.today) <= 30); });
    }
    actorPartnerId() { const a = this.actor(); if (a.role !== "PARTNER") return null; const id = (this.s.partnerLogins || {})[a.id]; return id && this.partner(id) ? id : null; }
  }

  const API = { Store, STAFF, TEAMS, ROLE_LABEL, CAN, SELLERS, F, PKG_PRICE, ENTITLEMENT, mulDivFloor, addDays, addMonths, addWorkingDays, workingDaysBetween, monthOf, nextMonth, prevMonth, daysBetween, monthsBetween, vnd, vnDate, maskPhone, evaluateMaintenance, terminationDecisionAllowed, emptyState, defaultSettings, uid };
  root.HP = API;
  if (typeof module !== "undefined") module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
