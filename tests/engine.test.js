// Kiểm thử bộ máy nghiệp vụ Trungtamdalieu — chạy: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const HP = require("../app/engine.js");
const { seed } = require("../app/seed.js");
const { F } = HP;
function fresh(today = "2026-11-02") { return new HP.Store(HP.emptyState(today)); }
function as(st, id, fn) { const p = st.s.actorId; st.s.actorId = id; try { return fn(); } finally { st.s.actorId = p; } }
function sell(st, name, l5, ref, pay = HP.PKG_PRICE) { return as(st, "hoa", () => st.sell({ buyerName: name, last5: l5, referralCode: ref || "", pin: "246810", firstPayment: pay, consent: true })); }
const code = (st, c) => st.partner(c.ownerPartnerId).code;

test("T1 hoàn phần chưa dùng 12tr → 6tr, hạn 15 ngày làm việc", () => {
  const st = fresh(); const c = sell(st, "Khách A", "11111");
  st.s.wallet.push({ id: "x", contractId: c.id, kind: "REDEEM", amount: -18000000, at: st.today });
  assert.throws(() => as(st, "bich", () => st.endWithRefund(c.id, "EXPIRED")), /Chưa tới hạn/);
  st.s.today = c.expiresAt;
  const r = as(st, "bich", () => st.endWithRefund(c.id, "EXPIRED"));
  const rq = st.s.requests.find(x => x.source && x.source.contractId === c.id); assert.equal(rq.amount, 6000000); assert.equal(rq.status, "PENDING");
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
  as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "GCN-01/2027", licenseDate: "2026-10-01", lawyerConfirmed: true, levels: [{ bps: 500, minChildContracts: 1, minMonths: 0 }, { bps: 0, minChildContracts: 1, minMonths: 0 }] }));
  assert.equal(st.requestSecondLevel().ok, true);
});
test("Mạng lưới 2 cấp: F2 nhận 5% khi đã bật và F1 đạt điều kiện; tắt thì không", () => {
  const st = fresh(); const f2 = sell(st, "F2 Long", "10001"); const f1 = sell(st, "F1 Trang", "10002", code(st, f2));
  sell(st, "Khách 1", "10003", code(st, f1));
  assert.equal(st.s.commissions.filter(e => e.type === "NETWORK").length, 0, "chưa bật thì không có thưởng tuyến");
  as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "GCN-01", licenseDate: "2026-10-01", lawyerConfirmed: true, levels: [{ bps: 500, minChildContracts: 1, minMonths: 0 }, { bps: 0, minChildContracts: 50, minMonths: 3 }] }));
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
  assert.throws(() => as(st, "maianh", () => st.refundPayment(p.id, 1000000, "Khách đổi ý")), /quyền/);
  const rq = as(st, "hoa", () => st.refundPayment(p.id, 1000000, "Khách đổi ý"));
  assert.equal(st.s.payments.length, 1, "chưa duyệt thì chưa có tiền ra");
  assert.throws(() => as(st, "bich", () => st.refundPayment(p.id, 2000000, "thêm")), /tối đa/);
  as(st, "lam", () => st.approveRequest(rq.id));
  assert.throws(() => as(st, "lam", () => st.payRequest(rq.id)), /không tự ghi chi|quyền/);
  as(st, "bich", () => st.payRequest(rq.id));
  assert.equal(st.s.payments.length, 2); assert.equal(st.sumTreatment(t).paid, 1500000);
  assert.equal(st.sumTreatment(t).debt, 0, "hoàn tiền không tạo công nợ ảo");
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
  st.s.today = "2026-12-02"; assert.throws(() => as(st, "lam", () => st.reopenMonth("2026-11", "Sửa sai chứng từ")), /không tự mở lại/); as(st, "van", () => st.reopenMonth("2026-11", "Sửa sai chứng từ"));
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

// ===== Các lỗi do đội kiểm thử độc lập tìm ra — giữ để không tái phát =====
test("Chống bấm hai lần: cùng nonce không ký 2 hợp đồng / không thu 2 lần", () => {
  const st = fresh();
  as(st, "hoa", () => st.sell({ buyerName: "Khách N", last5: "50001", pin: "246810", firstPayment: 0, nonce: "n1", consent: true }));
  assert.throws(() => as(st, "hoa", () => st.sell({ buyerName: "Khách N2", last5: "50002", pin: "246810", firstPayment: 0, nonce: "n1", consent: true })), /hai lần/);
  const c = st.s.contracts[0]; as(st, "hoa", () => st.collect(c.id, 1000000, null, { nonce: "n2" }));
  assert.throws(() => as(st, "hoa", () => st.collect(c.id, 1000000, null, { nonce: "n2" })), /hai lần/);
});
test("Số tiền/số lượng không hợp lệ bị từ chối, không làm tròn lặng lẽ", () => {
  const st = fresh(); const cus = as(st, "hoa", () => st.addCustomer({ name: "Khách M", last5: "50003", consent: true }));
  const t = as(st, "maianh", () => st.openTreatment(cus.id));
  for (const q of ["abc", 1.5, 0, -2, 1e12, NaN]) assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D01-01", qty: q })));
  assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D01-01", discount: "abc" })));
  as(st, "maianh", () => st.addLine(t.id, { code: "D01-01" }));
  for (const a of ["1tr", 0.5, -1, "1.005.000,50", Infinity]) assert.throws(() => as(st, "hoa", () => st.pay(t.id, a)));
});
test("Thao tác lỗi giữa chừng không để lại nửa dữ liệu (bán gói vào tháng đã chốt)", () => {
  const st = fresh("2026-12-02"); as(st, "lam", () => st.closeMonth("2026-11")); st.s.today = "2026-11-28";
  const n = st.s.contracts.length, k = st.s.customers.length;
  assert.throws(() => sell(st, "Khách C", "50004"), /chốt sổ/);
  assert.equal(st.s.contracts.length, n); assert.equal(st.s.customers.length, k);
});
test("Lương: người đã điều chỉnh không được duyệt; không tự điều chỉnh dòng của mình", () => {
  const st = fresh("2026-12-02"); const run = as(st, "bich", () => st.createPayrollRun("2026-11"));
  assert.throws(() => as(st, "lam", () => st.adjustPayroll(run.id, "lam", 50000000, "thưởng")), /chính mình/);
  as(st, "lam", () => st.adjustPayroll(run.id, "van", 1000000, "thưởng"));
  assert.throws(() => as(st, "lam", () => st.approvePayroll(run.id)), /điều chỉnh/);
  as(st, "quyen", () => st.approvePayroll(run.id)); assert.equal(run.status, "APPROVED");
});
test("Vai trò không xác định không được coi là Ban giám đốc", () => {
  const st = fresh(); st.s.actorId = "hacker";
  assert.throws(() => st.setRates({ referralFlat: 1 }), /quyền/);
});
test("Cài đặt: kiểm hết trước khi ghi; tầng 3 luôn khoá; không đổi thì không tăng phiên bản", () => {
  const st = fresh();
  assert.throws(() => as(st, "lam", () => st.setRates({ referralFlat: 5000000, addonBps: 2000 })));
  assert.equal(st.cfg.referralFlat, 3000000); assert.equal(st.cfg.version, 1);
  assert.throws(() => as(st, "lam", () => st.setRates({ staff: { consultBps: -500 } })));
  assert.throws(() => as(st, "lam", () => st.setRates({ referralFlat: 3000000 })), /thay đổi/);
  as(st, "lam", () => st.setNetwork({ enabled: true, licenseNo: "GCN-0001", licenseDate: "2026-10-01", lawyerConfirmed: true, levels: [{ bps: 500, minChildContracts: 1, minMonths: 0 }, { bps: 2000, minChildContracts: 1, minMonths: 0 }] }));
  assert.equal(st.cfg.network.levels[1].bps, 0, "mô hình 2 cấp: tầng 3 luôn 0");
});
test("Bán gói cho khách đã có người giới thiệu mà không nhập mã → vẫn ghi cho người giới thiệu cũ", () => {
  const st = fresh(); const f = sell(st, "Trang", "60001");
  const cus = as(st, "hoa", () => st.addCustomer({ name: "Khách G", last5: "60002", consent: true, referralCode: code(st, f) }));
  const c = as(st, "hoa", () => st.sell({ buyerName: "Khách G", last5: "60002", pin: "246810", firstPayment: HP.PKG_PRICE, consent: true }));
  assert.equal(c.attributedPartnerId, f.ownerPartnerId); assert.equal(st.partner(c.ownerPartnerId).sponsorId, f.ownerPartnerId);
});
test("F2: chấm dứt + hoàn tiền trước đối soát → khoản 3tr bị loại", () => {
  const st = fresh(); const f = sell(st, "GT", "60003"); const c = sell(st, "KH", "60004", code(st, f));
  as(st, "bich", () => st.endWithRefund(c.id, "TERMINATED"));
  const e = st.s.commissions.find(x => x.contractId === c.id && x.type === "REFERRAL_FLAT"); assert.equal(e.state, "VOID");
});
test("PIN: khoá sau 5 lần sai; ví hết hạn không dùng được; chỉ định số lượng 2 → 2 buổi", () => {
  const st = fresh(); const c = sell(st, "KH", "60005");
  const sel = as(st, "hoa", () => st.saveSelection(c.id, { extras: [{ code: "D01-03", qty: 2 }] })); as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true, qty: 2 }]));
  const t = as(st, "hoa", () => st.redeem(sel.id, 0, { pin: "246810" })); assert.equal(t.lines[0].sessionsTotal, 2);
  const s2 = as(st, "hoa", () => st.saveSelection(c.id, { extras: [{ code: "D01-02", qty: 1 }] })); as(st, "bsminh", () => st.prescribe(s2.id, [{ ok: true }]));
  for (let i = 0; i < 5; i++) assert.throws(() => as(st, "hoa", () => st.redeem(s2.id, 0, { pin: "000000" })));
  assert.throws(() => as(st, "hoa", () => st.redeem(s2.id, 0, { pin: "246810" })), /khoá/);
  as(st, "lam", () => st.resetPin(c.id, "135790")); st.s.today = HP.addDays(c.expiresAt, 1);
  assert.throws(() => as(st, "hoa", () => st.redeem(s2.id, 0, { pin: "135790" })), /hết hạn/);
});
test("Ví về 0 vẫn ghi nhận được mục đã chỉ định dưới dạng vượt ví (không bị kẹt)", () => {
  const st = fresh(); const c = sell(st, "KH", "60006");
  const sel = as(st, "hoa", () => st.saveSelection(c.id, { bundle: "A03", extras: [{ code: "D01-01", qty: 1 }] })); as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true }, { ok: true }]));
  as(st, "hoa", () => st.redeem(sel.id, 0, { pin: "246810" })); assert.equal(c.status, "CONSUMED");
  const t = as(st, "hoa", () => st.redeem(sel.id, 1, { pin: "246810", overageConsent: true, overagePaid: 200000 }));
  assert.equal(st.sumTreatment(t).debt, 0);
});
test("Bác sĩ không áp giảm giá; giảm trên 50% cần Ban giám đốc", () => {
  const st = fresh(); const cus = as(st, "hoa", () => st.addCustomer({ name: "KH D", last5: "60007", consent: true }));
  const t = as(st, "bsminh", () => st.openTreatment(cus.id));
  assert.throws(() => as(st, "bsminh", () => st.addLine(t.id, { code: "D01-03", discount: 100000 })), /Bác sĩ/);
  assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D01-03", discount: 600000, discountReason: "khách cũ" })), /50%/);
  assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D01-03", discount: 100000 })), /lý do/);
  as(st, "lam", () => st.addLine(t.id, { code: "D01-03", discount: 600000, discountReason: "khách VIP" }));
});
test("Đọc số tiền bằng chữ (kể cả từ nghìn tỷ)", () => {
  globalThis.HP = HP; globalThis.CATALOG = require("../app/catalog.js"); require("../app/docs.js"); const d = globalThis.DOCS.docSo;
  assert.equal(d(15000000), "Mười lăm triệu đồng"); assert.equal(d(2160000), "Hai triệu một trăm sáu mươi nghìn đồng");
  assert.equal(d(1005000), "Một triệu không trăm lẻ năm nghìn đồng"); assert.equal(d(1000500000), "Một tỷ không trăm triệu năm trăm nghìn đồng");
  assert.equal(d(2500000000000), "Hai nghìn năm trăm tỷ đồng"); assert.equal(d(1001000000000), "Một nghìn không trăm lẻ một tỷ đồng");
});
test("Phạm vi: tư vấn viên không đặt lịch/mở hồ sơ/thu tiền cho khách ngoài phạm vi", () => {
  const st = fresh(); const c = as(st, "hoa", () => st.addCustomer({ name: "Khách P", last5: "70001", consent: true }));
  const t = as(st, "linh", () => st.openTreatment(c.id)); // khách mới chưa ai phụ trách → linh nhận
  st.s.today = "2026-12-20";
  assert.throws(() => as(st, "maianh", () => st.addAppointment({ customerId: c.id, date: "2026-12-21", time: "09:00" })), /phạm vi/);
  assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D01-01" })), /phạm vi/);
  as(st, "hoa", () => st.addAppointment({ customerId: c.id, date: "2026-12-21", time: "09:00" }));
});

test("Vòng 2: lương không âm (thiếu chuyển kỳ sau); lô tự tháo đối tác ròng âm; từ chối hoàn gói thì lập lại được; bác sĩ không chỉ định quá số khách chọn", () => {
  // N5
  { const st = fresh(); const c = sell(st, "KH", "70001"); const sel = as(st, "hoa", () => st.saveSelection(c.id, { extras: [{ code: "D01-03", qty: 1 }] }));
    assert.throws(() => as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true, qty: 20 }])), /1 đến 1/); }
  // N3
  { const st = fresh(); const c = sell(st, "KH", "70002"); as(st, "bich", () => st.cancel(c.id)); const r = st.s.requests.find(x => x.id === c.refundRequestId);
    as(st, "lam", () => st.rejectRequest(r.id, "sai số tài khoản")); assert.equal(c.refundRequestId, null);
    const r2 = as(st, "bich", () => st.reissueRefund(c.id)); assert.equal(r2.amount, c.refundAmount); assert.throws(() => as(st, "bich", () => st.reissueRefund(c.id)), /đang chờ/);
    as(st, "lam", () => st.approveRequest(r2.id)); assert.throws(() => as(st, "bich", () => st.payRequest(r2.id)), /Người lập/); as(st, "van", () => st.payRequest(r2.id)); assert.ok(c.refundPaidAt); assert.throws(() => as(st, "bich", () => st.reissueRefund(c.id))); }
  // N2: lô có đối tác ròng ≤ 0 sau khi huỷ → tháo hết, lô rỗng thì trả lại
  { const st = fresh(); const p = "pX"; const b = { id: "lo1", status: "CHO_DUYET", entryIds: ["e1", "e2"], lines: [], total: 0 };
    st.s.commissions.push({ id: "e1", partnerId: p, amount: 3000000, state: "IN_BATCH", batchId: "lo1" }, { id: "e2", partnerId: p, amount: -1620000, state: "IN_BATCH", batchId: "lo1" }); st.s.batches.push(b);
    st.s.commissions[0].state = "VOID"; b.entryIds = ["e2"]; st._rebuildBatch(b);
    assert.equal(b.status, "TRA_LAI"); assert.equal(b.total, 0); assert.equal(st.s.commissions[1].state, "ELIGIBLE"); assert.equal(st.s.commissions[1].batchId, null); }
  // N1: hoàn lớn → dòng lương 0, thiếu chuyển kỳ sau
  { const st = fresh(); const run = { month: "2026-10", status: "APPROVED", lines: [{ staffId: "huy", carryOut: 6500000 }] }; st.s.payrollRuns.push(run);
    const lines = st.computePayroll("2026-11"); const h = lines.find(l => l.staffId === "huy"); assert.equal(h.carryIn, -6500000); assert.ok(h.total >= 0); assert.ok(lines.every(l => l.total >= 0)); }
});

test("Vòng 3 — an toàn chuyên môn: bác sĩ chỉ định, KTV không tiêm, chống chỉ định, phiếu đồng ý, số lô, huỷ buổi", () => {
  const st = fresh();
  const cus = as(st, "hoa", () => st.addCustomer({ name: "Khách Tiêm", last5: "70101", consent: true, contra: ["LIDO"] }));
  const t = as(st, "maianh", () => st.openTreatment(cus.id, { doctorId: "bsminh" }));
  // dị ứng thuốc tê → tư vấn không thêm được filler; bác sĩ phải ghi lý do
  assert.throws(() => as(st, "maianh", () => st.addLine(t.id, { code: "D04-04" })), /Chống chỉ định/);
  assert.throws(() => as(st, "bsminh", () => st.addLine(t.id, { code: "D04-04" })), /lý do/);
  const l = as(st, "bsminh", () => st.addLine(t.id, { code: "D04-04", contraReason: "Dùng filler không lidocaine" }));
  assert.equal(l.rx, "OK"); assert.ok(l.contraOverride);
  // peel do tư vấn thêm → chờ bác sĩ
  const p = as(st, "maianh", () => st.addLine(t.id, { code: "D01-03" })); assert.equal(p.rx, "CHO_BS");
  assert.throws(() => as(st, "nga", () => st.addSession(t.id, p.id)), /bác sĩ khám/);
  as(st, "bsminh", () => st.approveLine(t.id, p.id, { ok: true }));
  assert.throws(() => as(st, "nga", () => st.addSession(t.id, p.id)), /phiếu đồng ý/);
  as(st, "hoa", () => st.signConsent(t.id));
  const se = as(st, "nga", () => st.addSession(t.id, p.id, { note: "da đỏ nhẹ" }));
  assert.throws(() => as(st, "nga", () => st.addSession(t.id, p.id)), /Đã làm đủ|hôm nay/);
  // KTV không làm filler; bác sĩ phải ghi số lô
  assert.throws(() => as(st, "nga", () => st.addSession(t.id, l.id)), /bác sĩ thực hiện/);
  assert.throws(() => as(st, "bsminh", () => st.addSession(t.id, l.id)), /số lô/);
  as(st, "bsminh", () => st.addSession(t.id, l.id, { lot: "JUV2611A" }));
  // huỷ buổi ghi nhầm: người khác không huỷ được, người ghi huỷ được trong ngày, không tính thù lao
  assert.throws(() => as(st, "tam", () => st.voidSession(se.id, "nhầm")), /người ghi/);
  as(st, "nga", () => st.voidSession(se.id, "Ghi nhầm khách"));
  assert.equal(p.sessionsDone, 0); assert.ok(se.voidedAt);
  // không chỉ định: lý do bắt buộc, giá về 0
  const q = as(st, "maianh", () => st.addLine(t.id, { code: "D03-01" }));
  assert.throws(() => as(st, "bsminh", () => st.approveLine(t.id, q.id, { ok: false })), /lý do/);
  as(st, "bsminh", () => st.approveLine(t.id, q.id, { ok: false, reason: "Đang có mụn viêm" })); assert.equal(q.finalPrice, 0);
});
test("Vòng 3 — vận hành & chống gian lận", () => {
  const st = fresh();
  // trùng hồ sơ bỏ dấu; tìm theo SĐT đầy đủ
  as(st, "hoa", () => st.addCustomer({ name: "Trần Ngọc Hân", last5: "45678", consent: true, phone: "0912345678" }));
  assert.throws(() => as(st, "hoa", () => st.addCustomer({ name: "tran ngoc han", last5: "45678", consent: true })), /Đã có hồ sơ/);
  assert.equal(st.findCustomers("0912 345 678").length, 1); assert.equal(st.findCustomers("ngoc han").length, 1);
  const c = st.s.customers[0];
  // lịch: trùng bác sĩ cảnh báo, không đến → tới muộn trong ngày, dời, huỷ cần lý do
  const a = as(st, "hoa", () => st.addAppointment({ customerId: c.id, date: st.today, time: "10:00", staffId: "bsminh" }));
  const c2 = as(st, "hoa", () => st.addCustomer({ name: "Khách Hai", last5: "45679", consent: true }));
  assert.throws(() => as(st, "hoa", () => st.addAppointment({ customerId: c2.id, date: st.today, time: "10:15", staffId: "bsminh" })), /đã có khách/);
  as(st, "hoa", () => st.addAppointment({ customerId: c2.id, date: st.today, time: "10:15", staffId: "bsminh", force: true }));
  as(st, "hoa", () => st.setApptStatus(a.id, "NO_SHOW")); as(st, "hoa", () => st.setApptStatus(a.id, "ARRIVED")); assert.equal(a.status, "ARRIVED");
  const b = as(st, "hoa", () => st.addAppointment({ customerId: c2.id, date: "2026-11-05", time: "09:00" }));
  as(st, "hoa", () => st.moveAppointment(b.id, "2026-11-06", "14:00")); assert.equal(b.date, "2026-11-06");
  assert.throws(() => as(st, "hoa", () => st.setApptStatus(b.id, "CANCELLED")), /lý do/);
  // thu nhầm: huỷ phiếu trong ngày bằng bút toán đảo; đổi hình thức
  const t = as(st, "maianh", () => st.openTreatment(c.id)); as(st, "maianh", () => st.addLine(t.id, { code: "D05-01" }));
  const p1 = as(st, "hoa", () => st.pay(t.id, 400000, { method: "CASH" }));
  as(st, "bich", () => st.changePayMethod(p1.id, "TRANSFER")); assert.equal(p1.method, "TRANSFER");
  as(st, "bich", () => st.voidPayment(p1.id, "Thu nhầm khách")); assert.equal(st.sumTreatment(t).paid, 0);
  assert.equal(st.cashbook(st.today).by.TRANSFER, 0);
  // gói: mặc định phải có đồng ý; dưới 18 tuổi bị chặn; ghi đúng hình thức
  assert.throws(() => as(st, "hoa", () => st.sell({ buyerName: "Khách Mới", last5: "45680", pin: "123456", firstPayment: 0 })), /đồng ý/);
  const kid = as(st, "hoa", () => st.addCustomer({ name: "Học Sinh", last5: "45681", consent: true, dob: "2012-01-01" }));
  assert.throws(() => as(st, "hoa", () => st.sell({ customerId: kid.id, pin: "123456", firstPayment: 0 })), /18 tuổi/);
  const k = as(st, "hoa", () => st.sell({ customerId: c.id, pin: "123456", firstPayment: HP.PKG_PRICE, method: "TRANSFER" }));
  assert.equal(st.s.pkgPayments.find(x => x.contractId === k.id).method, "TRANSFER");
  assert.equal(st.obligations().wallet, HP.ENTITLEMENT);
  // đặt lại PIN rồi tự trừ ví trong ngày → chặn
  as(st, "lam", () => st.resetPin(k.id, "654321"));
  const sel = as(st, "hoa", () => st.saveSelection(k.id, { extras: [{ code: "D05-01", qty: 1 }] }));
  as(st, "bsminh", () => st.prescribe(sel.id, [{ ok: true }]));
  assert.throws(() => as(st, "lam", () => st.redeem(sel.id, 0, { pin: "654321" })), /đặt lại PIN/);
  // sự cố: mức 1 hạn trong ngày, đóng cần kết quả
  const inc = as(st, "hoa", () => st.addIncident({ customerId: c.id, kind: "BIEN_CHUNG", severity: 1, desc: "Sưng đỏ sau peel" }));
  assert.equal(inc.due, st.today); assert.throws(() => as(st, "hoa", () => st.closeIncident(inc.id, "ok ok ok")), /quyền/);
  as(st, "bsminh", () => st.closeIncident(inc.id, "Khám lại, kê kem phục hồi")); assert.equal(inc.status, "CLOSED");
});
