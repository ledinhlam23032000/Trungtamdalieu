// Kiểm thử bộ máy nghiệp vụ Trungtamdalieu — chạy: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const HP = require("../app/engine.js");
const { seed } = require("../app/seed.js");
const { F } = HP;
function fresh(today = "2026-11-02") { return new HP.Store(HP.emptyState(today)); }
function as(st, id, fn) { const p = st.s.actorId; st.s.actorId = id; try { return fn(); } finally { st.s.actorId = p; } }
function sell(st, name, l5, ref, pay = HP.PKG_PRICE) { return as(st, "hoa", () => st.sell({ buyerName: name, last5: l5, referralCode: ref || "", pin: "246810", firstPayment: pay })); }
const code = (st, c) => st.partner(c.ownerPartnerId).code;

test("T1 hoàn phần chưa dùng 12tr → 6tr, hạn 15 ngày làm việc", () => {
  const st = fresh(); const c = sell(st, "Khách A", "11111");
  st.s.wallet.push({ id: "x", contractId: c.id, kind: "REDEEM", amount: -18000000, at: st.today });
  const r = as(st, "bich", () => st.endWithRefund(c.id, "EXPIRED"));
  assert.equal(r, 6000000); assert.equal(HP.workingDaysBetween(st.today, c.refundDueAt), 15);
});
test("T2 T3 T4 quyết toán suất", () => {
  assert.equal(F.settle2B({ paid: 500000000, usedValue: 600000000 }), 300000000);
  assert.equal(F.settle2B({ paid: 50000000, usedValue: 0 }), 50000000);
  assert.equal(F.settle5({ paid: 570000000, owed: 12000000, received: 540000000 }), 411000000);
});
test("T5 T6 lợi nhuận kỳ, không chuyển lỗ, pro-rata", () => {
  assert.equal(F.profitShare({ bps: 200, profit: -50000000, activeDays: 90, periodDays: 90 }), 0);
  assert.equal(F.profitShare({ bps: 200, profit: 200000000, activeDays: 91, periodDays: 91 }), 4000000);
  assert.equal(F.profitShare({ bps: 200, profit: 300000000, activeDays: 15, periodDays: 30 }), 3000000);
});
test("T7 T8 T9 duy trì & chấm dứt", () => {
  assert.equal(HP.evaluateMaintenance([{ contracts: 0, activities: 1 }], 1)[0].status, "NHAC");
  const r8 = HP.evaluateMaintenance([{ contracts: 1, activities: 0 }, { contracts: 1, activities: 0, planGiven: false }], 1);
  assert.equal(r8[1].status, "KHONG_TINH"); assert.ok(!r8.some(x => x.status === "MO_VU_VIEC"));
  const r9 = HP.evaluateMaintenance([{ contracts: 1, activities: 0 }, { contracts: 1, activities: 0 }], 1);
  assert.equal(r9[1].status, "MO_VU_VIEC");
  assert.equal(HP.terminationDecisionAllowed("2026-12-01", HP.addWorkingDays("2026-12-01", 11)).allowed, true);
  assert.equal(HP.terminationDecisionAllowed("2026-12-01", HP.addWorkingDays("2026-12-01", 9)).allowed, false);
});
test("T11 một hợp đồng chỉ một khoản 3tr", () => {
  const st = fresh(); const a = sell(st, "GT", "22222"); const c = sell(st, "KH", "33333", code(st, a));
  assert.throws(() => st.activate(c, st.today));
  assert.equal(st.s.commissions.filter(e => e.contractId === c.id && e.type === "REFERRAL_FLAT" && e.amount > 0).length, 1);
});
test("T12 chưa đủ tiền → không hoa hồng; đủ → chờ; đối soát → khả dụng; huỷ sau khi trả → −3tr kỳ sau", () => {
  const st = fresh(); const a = sell(st, "GT", "44444"); const c = sell(st, "KH", "55555", code(st, a), 10000000);
  assert.equal(st.s.commissions.filter(e => e.contractId === c.id).length, 0);
  as(st, "hoa", () => st.collect(c.id, 5000000));
  const e = st.s.commissions.find(x => x.contractId === c.id); assert.equal(e.state, "PENDING");
  st.s.today = "2026-12-02"; as(st, "bich", () => st.reconcile("2026-11")); assert.equal(e.state, "ELIGIBLE");
  const b = as(st, "bich", () => st.createBatch()); as(st, "lam", () => st.approveBatch(b.id)); as(st, "bich", () => st.payBatch(b.id));
  assert.equal(e.state, "PAID");
  as(st, "bich", () => st.cancel(c.id));
  const off = st.s.commissions.find(x => x.reversalOf === e.id); assert.equal(off.amount, -3000000); assert.equal(off.period, "2027-01");
});
test("T13 thù lao ngoài gói: dịch vụ 20tr giảm 2tr, khách trả 18tr, 12% → 2.160.000", () => {
  const st = fresh(); const a = sell(st, "GT", "66666");
  const cus = as(st, "hoa", () => st.addCustomer({ name: "Khách T13", last5: "77777", consent: true, referralCode: code(st, a) }));
  const t = as(st, "maianh", () => st.openTreatment(cus.id)); as(st, "maianh", () => st.addLine(t.id, { code: "D03-04", qty: 1, discount: 0 }));
  t.lines[0].unitPrice = 20000000; t.lines[0].discount = 2000000; t.lines[0].finalPrice = 18000000;
  as(st, "hoa", () => st.pay(t.id, 18000000));
  assert.equal(st.s.commissions.find(x => x.type === "ADDON_PCT").amount, 2160000);
});
test("T15 A07 → ví còn 15tr; T16 vượt ví không đồng ý → chặn", () => {
  const st = fresh(); const c = sell(st, "KH", "88888");
  const sel = as(st, "hoa", () => st.saveSelection(c.id, { bundle: "A07" })); as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true, qty: 1 }]));
  as(st, "hoa", () => st.redeem(sel.id, 0, { pin: "246810" })); assert.equal(st.balance(c.id), 15000000);
  const s2 = as(st, "hoa", () => st.saveSelection(c.id, { extras: [{ code: "D04-01", qty: 2 }] })); as(st, "bsminh", () => st.prescribe(s2.id, [{ ok: true, qty: 2 }]));
  assert.throws(() => as(st, "hoa", () => st.redeem(s2.id, 0, { pin: "246810", overageConsent: false })), /đồng ý/);
  assert.equal(st.balance(c.id), 15000000);
  const t = as(st, "hoa", () => st.redeem(s2.id, 0, { pin: "246810", overageConsent: true, overagePaid: 1000000 }));
  assert.equal(st.balance(c.id), 0); assert.equal(st.sumTreatment(t).total, 1000000); assert.equal(st.sumTreatment(t).debt, 0);
});
test("Ghi nhận sử dụng: sai PIN bị chặn; dòng trừ ví giá 0đ, không công nợ", () => {
  const st = fresh(); const c = sell(st, "KH", "99999");
  const sel = as(st, "hoa", () => st.saveSelection(c.id, { bundle: "A03" })); as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true, qty: 1 }]));
  assert.throws(() => as(st, "hoa", () => st.redeem(sel.id, 0, { pin: "000000" })), /PIN/);
  const t = as(st, "hoa", () => st.redeem(sel.id, 0, { pin: "246810" }));
  assert.equal(st.sumTreatment(t).total, 0); assert.equal(t.lines[0].sessionsTotal, 2);
});
test("T17 thưởng tuyến bị khoá khi chưa có giấy chứng nhận; bật được khi có", () => {
  const st = fresh();
  assert.equal(st.requestSecondLevel().ok, false);
  assert.throws(() => as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "", lawyerConfirmed: true })));
  assert.throws(() => as(st, "hoa", () => st.setNetwork({ enabled: false })), /quyền/);
  as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "GCN-01/2027", lawyerConfirmed: true, levels: [{ bps: 500, minChildContracts: 1, minMonths: 0 }, { bps: 0, minChildContracts: 1, minMonths: 0 }] }));
  assert.equal(st.requestSecondLevel().ok, true);
});
test("Mạng lưới 2 cấp: F2 nhận 5% khi đã bật và F1 đạt điều kiện; tắt thì không", () => {
  const st = fresh(); const f2 = sell(st, "F2 Long", "10001"); const f1 = sell(st, "F1 Trang", "10002", code(st, f2));
  sell(st, "Khách 1", "10003", code(st, f1));
  assert.equal(st.s.commissions.filter(e => e.type === "NETWORK").length, 0, "chưa bật thì không có thưởng tuyến");
  as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "GCN-01", lawyerConfirmed: true, levels: [{ bps: 500, minChildContracts: 1, minMonths: 0 }, { bps: 0, minChildContracts: 50, minMonths: 3 }] }));
  sell(st, "Khách 2", "10004", code(st, f1));
  const net = st.s.commissions.filter(e => e.type === "NETWORK");
  assert.equal(net.length, 1); assert.equal(net[0].amount, 750000); assert.equal(net[0].partnerId, f2.ownerPartnerId);
});
test("Truy nguồn: khách ← đối tác tầng 1 ← tầng 2; đối tác thấy khách 2 tầng", () => {
  const st = fresh(); const f2 = sell(st, "Long", "20001"); const f1 = sell(st, "Trang", "20002", code(st, f2));
  const cus = as(st, "hoa", () => st.addCustomer({ name: "Khách X", last5: "20003", consent: true, referralCode: code(st, f1) }));
  const ln = st.lineage(cus.id); assert.deepEqual(ln.map(x => x.name), ["Trang", "Long"]);
  const b = st.broughtBy(f2.ownerPartnerId); assert.equal(b.level2.some(c => c.id === cus.id), true);
  assert.ok(st.journey(cus.id)[0].detail.includes("Trang"));
});
test("Hoàn tiền dịch vụ: không xoá khoản thu, sinh bút toán âm và thu hồi hoa hồng chưa trả", () => {
  const st = fresh(); const a = sell(st, "GT", "30001");
  const cus = as(st, "hoa", () => st.addCustomer({ name: "KH", last5: "30002", consent: true, referralCode: code(st, a) }));
  const t = as(st, "maianh", () => st.openTreatment(cus.id)); as(st, "maianh", () => st.addLine(t.id, { code: "D02-01" }));
  const p = as(st, "hoa", () => st.pay(t.id, 2500000));
  assert.throws(() => as(st, "hoa", () => st.refundPayment(p.id, 1000000, "Khách đổi ý")), /quyền/);
  as(st, "bich", () => st.refundPayment(p.id, 1000000, "Khách đổi ý"));
  assert.equal(st.s.payments.length, 2); assert.equal(st.sumTreatment(t).paid, 1500000);
  const net = st.s.commissions.filter(e => e.partnerId === a.ownerPartnerId && e.state !== "VOID").reduce((x, e) => x + e.amount, 0);
  assert.equal(net, 300000 - 120000);
});
test("Hai người: tự duyệt lô / lương / đề nghị chi đều bị chặn", () => {
  const st = fresh("2026-12-02");
  const r = as(st, "lam", () => st.createRequest({ category: "VAT_TU", payee: "NCC", amount: 1000000 }));
  assert.throws(() => as(st, "lam", () => st.approveRequest(r.id)), /tự duyệt/);
  as(st, "van", () => st.approveRequest(r.id)); as(st, "bich", () => st.payRequest(r.id)); assert.equal(r.status, "PAID");
  const run = as(st, "lam", () => st.createPayrollRun("2026-11"));
  assert.throws(() => as(st, "lam", () => st.approvePayroll(run.id)), /tự duyệt/);
  assert.throws(() => as(st, "bsminh", () => st.approvePayroll(run.id)), /quyền/);
});
test("Chốt sổ: tháng đã chốt không ghi thêm tiền", () => {
  const st = fresh("2026-12-02");
  as(st, "lam", () => st.closeMonth("2026-11"));
  st.s.today = "2026-11-30";
  assert.throws(() => sell(st, "KH", "40001"), /chốt sổ/);
  st.s.today = "2026-12-02"; as(st, "lam", () => st.reopenMonth("2026-11", "Sửa sai chứng từ"));
  st.s.today = "2026-11-30"; sell(st, "KH", "40002");
});
test("Cổ đông và khách/đối tác không thao tác được gì", () => {
  const st = fresh();
  for (const id of ["codong", "kh-hanh"]) for (const a of Object.keys(HP.CAN).filter(k => k !== "seeMoney")) assert.equal(as(st, id, () => st.can(a)), id === "codong" ? false : false, `${id} ${a}`);
});
test("Dữ liệu mẫu nhất quán: số dư ví = tổng bút toán ≥ 0; công nợ ≥ 0; mỗi hợp đồng ≤ 1 khoản 3tr", () => {
  const s = seed(); const st = new HP.Store(s);
  for (const c of s.contracts) assert.ok(st.balance(c.id) >= 0);
  for (const t of s.treatments) assert.ok(st.sumTreatment(t).paid <= st.sumTreatment(t).total);
  const seen = new Set(); for (const e of s.commissions.filter(x => x.type === "REFERRAL_FLAT" && x.amount > 0)) { assert.ok(!seen.has(e.contractId)); seen.add(e.contractId); }
  assert.equal(s.periods.length, 4);
});
