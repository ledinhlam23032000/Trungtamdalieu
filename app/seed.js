/* Dữ liệu mẫu: mô phỏng 6 tháng vận hành bằng chính bộ máy nghiệp vụ (mọi con số sinh ra qua Store, không gõ tay).
   Tên khách là giả lập. */
(function (root) {
  "use strict";
  const HP = root.HP || require("./engine.js");
  const CAT = root.CATALOG || require("./catalog.js");
  function seed(today) {
    today = today || "2026-11-20";
    const s = HP.emptyState(today); const st = new HP.Store(s);
    let r = 20261120; const rnd = () => { r = (r * 1103515245 + 12345) % 2147483648; return r / 2147483648; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"], dem = ["Thị", "Văn", "Ngọc", "Minh", "Thu", "Hải", "Thanh", "Bảo", "Khánh", "Phương"], ten = ["Lan", "Hương", "Mai", "Tú", "Linh", "Hà", "Trang", "Yến", "Nga", "Huyền", "Thảo", "Vy", "Quỳnh", "Ánh", "Dung", "Loan", "Nhung", "My"];
    const name = () => `${pick(ho)} ${pick(dem)} ${pick(ten)}`;
    const l5 = () => String(10000 + Math.floor(rnd() * 89999));
    const as = (id, fn) => { const p = s.actorId; s.actorId = id; try { return fn(); } finally { s.actorId = p; } };
    const at = (d, fn) => { const p = s.today; s.today = d; try { return fn(); } finally { s.today = p; } };
    const events = []; const ev = (date, fn) => events.push({ date, fn, k: events.length });
    const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
    const day = (m, max) => `${m}-${String(1 + Math.floor(rnd() * max)).padStart(2, "0")}`;
    const P = {};
    // Nhóm sáng lập — 2 cấp: Long → Trang → Hạnh
    const founder = (key, nm, d, ref, use) => ev(d, () => { const c = as("hoa", () => st.sell({ buyerName: nm, last5: l5(), referralCode: ref ? P[ref].code : "", pin: "246810", firstPayment: HP.PKG_PRICE })); P[key] = st.partner(c.ownerPartnerId); if (use) redeemSeed(c, use); });
    function redeemSeed(c, code) { const b = CAT.itemByCode(code); s.wallet.push({ id: HP.uid("vi"), contractId: c.id, kind: "REDEEM", amount: -b.value, label: b.name, itemCode: b.code, at: s.today, by: "hoa" }); if (st.balance(c.id) === 0) { c.status = "CONSUMED"; c.endedAt = s.today; } }
    founder("long", "Vũ Hoàng Long", "2026-05-20", null, "A04");
    founder("binh", "Trần Văn Bình", "2026-05-22", null, "A05");
    founder("quan", "Đỗ Minh Quân", "2026-05-25", null, "A01");
    founder("trang", "Phạm Thu Trang", "2026-05-28", "long", "A03");
    founder("hanh", "Nguyễn Thị Hạnh", "2026-08-10", "trang", null);
    const plan = [["trang", [8, 10, 11, 9, 9, 6]], ["binh", [5, 8, 9, 9, 9, 6]], ["quan", [1, 1, 2, 1, 1, 1]], ["long", [3, 4, 3, 3, 3, 3]], ["hanh", [0, 0, 1, 1, 1, 1]]];
    plan.forEach(([key, counts]) => counts.forEach((n, mi) => { for (let k = 0; k < n; k++) { const d = day(months[mi], mi === 5 ? 19 : 27); if (key === "hanh" && d < "2026-08-11") continue; ev(d, () => { const c = as(pick(HP.SELLERS), () => st.sell({ buyerName: name(), last5: l5(), referralCode: P[key].code, pin: "246810", firstPayment: HP.PKG_PRICE })); const u = rnd(); if (u < .35) redeemSeed(c, "A04"); else if (u < .5) redeemSeed(c, "A07"); }); } }));
    // Khách da liễu tự đến / do đối tác giới thiệu: hồ sơ điều trị, buổi, thanh toán
    months.forEach((m, mi) => { const n = 20 + mi * 3; for (let k = 0; k < n; k++) { const d = day(m, mi === 5 ? 19 : 27); ev(d, () => {
      const refKey = rnd() < .3 ? pick(["hanh", "trang", "binh"].filter(k => P[k])) : null;
      const cus = as("hoa", () => st.addCustomer({ name: name(), last5: l5(), gender: rnd() < .8 ? "F" : "M", skinType: pick(CAT.SKIN), concerns: [pick(CAT.CONCERNS)], consent: true, source: refKey ? "PARTNER" : pick(["WALK_IN", "FACEBOOK", "ZALO", "TIKTOK", "REFERRAL"]), referralCode: refKey ? P[refKey].code : "" }));
      const cons = pick(["ha", "maianh", "huy", "bao", "linh"]), doc = pick(["bsminh", "bsthu"]);
      const t = as(cons, () => st.openTreatment(cus.id, { doctorId: doc }));
      const svcs = [pick(CAT.SERVICES)]; if (rnd() < .3) svcs.push(pick(CAT.SERVICES));
      svcs.forEach(sv => as(cons, () => st.addLine(t.id, { code: sv.code, qty: 1, discount: rnd() < .25 ? Math.round(sv.price * 0.1 / 1000) * 1000 : 0 })));
      const total = st.sumTreatment(t).total; const payAmt = rnd() < .8 ? total : Math.round(total * 0.5 / 1000) * 1000;
      as("hoa", () => st.pay(t.id, payAmt, { method: pick(["CASH", "TRANSFER", "CARD"]) }));
      t.lines.forEach(l => { const tech = pick(["nga", "tam"]); for (let b = 0; b < Math.min(l.sessionsTotal, 1 + Math.floor(rnd() * l.sessionsTotal)); b++) { const sd = HP.addDays(d, b * 7); if (sd < today) ev(sd, () => as(tech, () => { try { st.addSession(t.id, l.id, {}); } catch (e) { } })); } });
    }); } });
    // Chi phí vận hành hằng tháng + lương + hoa hồng + chốt sổ
    months.slice(0, 5).forEach(m => {
      ev(m + "-03", () => { [["MAT_BANG", "Chủ nhà — tiền thuê tháng " + m, 60000000], ["VAT_TU", "Công ty vật tư y tế Á Châu", 30000000 + Math.round(rnd() * 15) * 1000000], ["MARKETING", "Quảng cáo Facebook/TikTok", 25000000]].forEach(([cat, payee, amt]) => { const rq = as("bich", () => st.createRequest({ category: cat, payee, amount: amt, note: "Chi định kỳ" })); as("lam", () => st.approveRequest(rq.id)); as("bich", () => st.payRequest(rq.id)); }); });
    });
    ["2026-07", "2026-08", "2026-09", "2026-10"].forEach(m => {
      const pm = HP.prevMonth(m);
      ev(m + "-04", () => { as("bich", () => st.reconcile(pm)); if (m !== "2026-11") { try { const b = as("bich", () => st.createBatch()); as("lam", () => st.approveBatch(b.id)); as("bich", () => st.payBatch(b.id)); } catch (e) { } } });
      ev(m + "-06", () => { const run = as("bich", () => st.createPayrollRun(pm)); as("van", () => st.approvePayroll(run.id)); as("bich", () => st.payRequest(run.requestId)); });
      ev(m + "-12", () => as("lam", () => st.closeMonth(pm)));
    });
    ev("2026-11-04", () => as("bich", () => st.reconcile("2026-10")));
    ev("2026-11-06", () => { const run = as("bich", () => st.createPayrollRun("2026-10")); /* chờ Ban giám đốc duyệt */ });
    ev("2026-11-10", () => { const a = as("hoa", () => st.createRequest({ category: "VAT_TU", payee: "Công ty dược mỹ phẩm Minh Long", amount: 18500000, note: "Nhập serum, kem chống nắng" })); });
    ev("2026-11-14", () => { const a = as("bich", () => st.createRequest({ category: "MARKETING", payee: "Quay dựng video tháng 11", amount: 12000000, note: "Theo kế hoạch truyền thông" })); as("quyen", () => st.approveRequest(a.id)); });
    // Phiếu chọn đang chờ bác sĩ + lịch hẹn hôm nay / ngày mai
    ev("2026-11-18", () => { const k = s.contracts.find(c => c.ownerPartnerId === P.hanh.id); as("hoa", () => st.saveSelection(k.id, { bundle: "A07", options: [], extras: [{ code: "D01-03", qty: 1 }] })); });
    events.sort((a, b) => a.date.localeCompare(b.date) || a.k - b.k);
    for (let i = 0; i < events.length; i++) { const e = events[i]; if (e.date > today) continue; at(e.date, e.fn); events.sort((a, b) => a.date.localeCompare(b.date) || a.k - b.k); }
    at(today, () => {
      const cs = s.customers.slice(-30);
      [["08:30", "SERVICE"], ["09:15", "FOLLOW_UP"], ["10:00", "NEW"], ["13:30", "SERVICE"], ["14:30", "FOLLOW_UP"], ["16:00", "NEW"]].forEach(([tm, ty], i) => as("hoa", () => st.addAppointment({ customerId: cs[i].id, date: today, time: tm, type: ty, staffId: pick(["bsminh", "bsthu"]) })));
      [["09:00", "SERVICE"], ["11:00", "FOLLOW_UP"], ["15:00", "NEW"]].forEach(([tm, ty], i) => as("hoa", () => st.addAppointment({ customerId: cs[10 + i].id, date: HP.addDays(today, 1), time: tm, type: ty })));
      s.appointments[0].status = "ARRIVED";
      as("hoa", () => st.logCare(cs[20].id, "AFTERCARE", "Gọi hỏi thăm sau peel, da hồi phục tốt"));
    });
    s.seats.s2 = [{ no: 1, partnerId: P.trang.id, path: "A · 50 hợp đồng", from: "2026-10-01" }, { no: 2, partnerId: P.quan.id, path: "B · thực đóng 500tr", from: "2026-09-15" }];
    s.seats.s5 = [{ no: 1, partnerId: P.long.id, path: "Cao cấp · thực đóng 570tr", from: "2026-10-01" }];
    s.activities.push({ id: HP.uid("nv"), partnerId: P.trang.id, month: "2026-11", title: "Dự họp lớn 06/11", at: "2026-11-06", by: "quyen" }, { id: HP.uid("nv"), partnerId: P.trang.id, month: "2026-10", title: "Tổ chức chương trình khách hàng", at: "2026-10-18", by: "quyen" }, { id: HP.uid("nv"), partnerId: P.quan.id, month: "2026-10", title: "Hỗ trợ đội nhóm", at: "2026-10-21", by: "quyen" }, { id: HP.uid("nv"), partnerId: P.long.id, month: "2026-11", title: "Dự họp lớn 06/11", at: "2026-11-06", by: "quyen" }, { id: HP.uid("nv"), partnerId: P.long.id, month: "2026-10", title: "Dự họp lớn 09/10", at: "2026-10-09", by: "quyen" });
    P.hanh.code = "HP-2K7Q";
    s.today = today; s.actorId = "hoa"; s.audit = [];
    st.log("DỮ LIỆU MẪU", "Khởi tạo 6 tháng vận hành minh hoạ — tên khách là giả lập");
    return s;
  }
  root.SEED = { seed };
  if (typeof module !== "undefined") module.exports = { seed };
})(typeof window !== "undefined" ? window : globalThis);
