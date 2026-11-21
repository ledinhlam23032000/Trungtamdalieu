/* Giấy tờ: mỗi hàm trả về HTML một trang A4, điền sẵn từ dữ liệu thật trong app. */
(function (root) {
  "use strict";
  const HP = root.HP, CAT = root.CATALOG;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const v = n => HP.vnd(n);
  // Đọc số tiền bằng chữ (tiếng Việt)
  function docSo(n) {
    if (!Number.isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER) return "(số tiền không hợp lệ)";
    n = Math.round(Math.abs(n)); if (n === 0) return "Không đồng";
    const so = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    function ba(x, full) { const t = Math.floor(x / 100), c = Math.floor(x % 100 / 10), d = x % 10; let s = "";
      if (full || t) s += so[t] + " trăm";
      if (c > 1) s += " " + so[c] + " mươi" + (d === 1 ? " mốt" : d === 4 ? " tư" : d === 5 ? " lăm" : d ? " " + so[d] : "");
      else if (c === 1) s += " mười" + (d === 5 ? " lăm" : d ? " " + so[d] : "");
      else if (d) s += (full || t ? " lẻ " : " ") + so[d];
      return s.trim(); }
    // Dưới 1 tỷ: [triệu, nghìn, đơn vị]. full = đã có nhóm lớn hơn đứng trước.
    function duoiTy(x, full) {
      const g = [Math.floor(x / 1e6), Math.floor(x % 1e6 / 1000), x % 1000], hang = [" triệu", " nghìn", ""], out = [];
      let started = full;
      g.forEach((v, k) => {
        const later = g.slice(k + 1).some(Boolean);
        if (v) { out.push(ba(v, started) + hang[k]); started = true; }
        else if (k === 0 && started && later) out.push("không trăm triệu");
      });
      return out.join(" ");
    }
    function doc(x) { if (x >= 1e9) { const hi = Math.floor(x / 1e9), lo = x % 1e9; return doc(hi) + " tỷ" + (lo ? " " + duoiTy(lo, true) : ""); } return duoiTy(x, false); }
    const s = doc(n).replace(/\s+/g, " ").trim(); return s.charAt(0).toUpperCase() + s.slice(1) + " đồng";
  }
  const head = (title, no) => `<div class="doc-head"><div><b>BỆNH VIỆN ĐA KHOA HỒNG PHÚC</b><div>TRUNG TÂM DA LIỄU</div></div><div style="text-align:right"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><div>Độc lập — Tự do — Hạnh phúc</div></div></div><h1 class="doc-title">${title}</h1>${no ? `<div class="doc-no">Số: ${esc(no)}</div>` : ""}`;
  const sign = (a, b) => `<div class="doc-sign"><div><b>${a}</b><div>(Ký, ghi rõ họ tên)</div></div><div><b>${b}</b><div>(Ký, ghi rõ họ tên)</div></div></div>`;
  const today = st => { const [y, m, d] = st.today.split("-"); return `Ngày ${d} tháng ${m} năm ${y}`; };
  const staffName = (st, id) => (st.staff(id) || {}).name || "………………";
  const ini = n => { const p = String(n).trim().split(/\s+/); return p.length > 1 ? p.slice(0, -1).map(w => w[0] + ".").join("") + " " + p[p.length - 1] : n; };

  const D = {
    hopDongGoi(st, c) {
      const cus = st.customer(c.customerId), p = st.partner(c.ownerPartnerId), ref = c.attributedPartnerId ? st.partner(c.attributedPartnerId) : null;
      const [yy, mm, dd] = c.signedAt.split("-");
      return head("HỢP ĐỒNG HỢP TÁC GÓI 15 TRIỆU ĐỒNG", c.code) + `<p class="doc-c">Ngày ${dd} tháng ${mm} năm ${yy}</p>
      <p><b>BÊN A:</b> Đơn vị chủ quản Bệnh viện Đa khoa Hồng Phúc — Trung tâm Da liễu. Đại diện: ………………………… Chức vụ: …………</p>
      <p><b>BÊN B (Đối tác):</b> ${esc(cus.name)} · SĐT: ${HP.maskPhone(cus.last5)} · Mã đối tác: <b>${esc(p.code)}</b> · CCCD/MST: ……………………</p>
      ${ref ? `<p>Người giới thiệu trực tiếp: ${esc(ini(st.partnerName(ref.id)))} (${esc(ref.code)})</p>` : ""}
      <p><b>1. Giá trị và quyền lợi.</b> Bên B thanh toán <b>15.000.000 đồng</b> (${docSo(15000000)}), nhận <b>30.000.000 đồng</b> giá trị sản phẩm hoặc dịch vụ tuỳ chọn theo danh mục ký kèm (phiên bản PC-TM-v0). ${c.fullyPaidAt ? `Đã thanh toán đủ ngày ${HP.vnDate(c.fullyPaidAt)}. Thời hạn sử dụng đến <b>${HP.vnDate(c.expiresAt)}</b>.` : `Đã thanh toán ${v(st.paid(c.id))}đ; ví mở khi thanh toán đủ.`} Mỗi lần sử dụng phải xác nhận giá trị và số dư; khoản vượt gói chỉ thu khi Bên B đồng ý trước.</p>
      <p><b>2. Trách nhiệm hai bên.</b> Bên A cấp chứng từ thu, cung cấp đúng sản phẩm, chất lượng và quyền lợi; dịch vụ do người đủ điều kiện thực hiện tại cơ sở được cấp phép. Bên B cung cấp thông tin chính xác, chỉ truyền thông nội dung được Bên A xác nhận, không tự cam kết hiệu quả.</p>
      <p><b>3. Thù lao dịch vụ ngoài gói.</b> ☑ Có — ${st.cfg.addonBps / 100}% trên tiền dịch vụ ngoài gói thực thu, sau giảm giá và hoàn tiền, của khách Bên B trực tiếp tư vấn, giới thiệu được Bên A xác nhận. Đối soát hằng tháng.</p>
      <p><b>4. Thù lao giới thiệu.</b> Khi khách hàng do Bên B giới thiệu trực tiếp ký và thanh toán đủ gói, Bên A trả ${v(st.cfg.referralFlat)}đ/hợp đồng sau đối soát tháng; nếu hợp đồng đó bị huỷ, khoản đã trả được trừ vào kỳ chi trả sau. Thù lao chỉ tính trên giao dịch mua dịch vụ có thật; <b>không bao gồm thưởng tuyển đối tác, không trả theo số người tham gia</b>, không yêu cầu Bên B mua thêm hay duy trì doanh số. Thù lao là thu nhập chịu thuế TNCN; Bên A khấu trừ, kê khai theo quy định và cấp chứng từ khấu trừ.</p>
      <p><b>5. Chấm dứt.</b> Khi chấm dứt hoặc hết hạn, Bên A hoàn phần chưa dùng trong 15 ngày làm việc: tiền hoàn = 15.000.000 × số dư quyền lợi / 30.000.000.</p>
      <p><b>6. Sử dụng quyền lợi.</b> Mỗi lần sử dụng, Bên B xác nhận bằng mã PIN cá nhân do Bên B tự đặt; Bên A không lưu giữ PIN thay Bên B. Các thủ thuật chỉ thực hiện khi bác sĩ khám, chỉ định và Bên B ký phiếu đồng ý.</p>
      <p><b>7. Dữ liệu cá nhân.</b> Bên A xử lý dữ liệu cá nhân (kể cả dữ liệu sức khoẻ) của Bên B chỉ cho mục đích điều trị, chăm sóc và thực hiện hợp đồng, theo văn bản đồng ý riêng; không chia sẻ cho bên thứ ba khi chưa có đồng ý.</p>
      <p><b>8. Vi phạm và tranh chấp.</b> Bên vi phạm khắc phục trong 10 ngày kể từ khi nhận thông báo; gây thiệt hại thì bồi thường theo pháp luật. Tranh chấp được thương lượng; không thành thì đưa ra Toà án có thẩm quyền.</p>
      <p>Giá trị hợp đồng ☐ đã gồm ☐ chưa gồm thuế GTGT (nếu có). Hợp đồng chỉ áp dụng gói 15 triệu, không bao gồm cổ phần. Lập 02 bản, mỗi bên giữ 01 bản.</p>` + sign("ĐẠI DIỆN BÊN A", "BÊN B");
    },
    phieuThu(st, p, isPkg) {
      const cus = isPkg ? st.customer(st.contract(p.contractId).customerId) : st.customer(p.customerId);
      const refund = p.amount < 0;
      const what = (refund ? "Hoàn tiền " : "Thanh toán ") + (isPkg ? `gói 15 triệu ${st.contract(p.contractId).code}` : `dịch vụ — hồ sơ ${st.treatment(p.treatmentId).code}`);
      return head(refund ? "PHIẾU CHI (HOÀN TIỀN)" : "PHIẾU THU", p.code) + `<p class="doc-c">${HP.vnDate(p.at)}</p>
      <table class="doc-t"><tr><td>Họ tên khách hàng</td><td><b>${esc(cus.name)}</b> (${esc(cus.code)}) · SĐT ${HP.maskPhone(cus.last5)}</td></tr>
      <tr><td>Nội dung</td><td>${esc(what)}${p.reason ? " — " + esc(p.reason) : ""}</td></tr>
      <tr><td>Số tiền</td><td><b>${v(Math.abs(p.amount))} đồng</b></td></tr>
      <tr><td>Bằng chữ</td><td><i>${docSo(Math.abs(p.amount))}</i></td></tr>
      <tr><td>Hình thức</td><td>${({ CASH: "Tiền mặt", TRANSFER: "Chuyển khoản", CARD: "Quẹt thẻ" })[p.method] || "Tiền mặt"}</td></tr>
      ${!isPkg && st.treatment(p.treatmentId) ? (() => { const t = st.treatment(p.treatmentId), sm = st.sumTreatment(t); return `<tr><td>Dịch vụ</td><td>${t.lines.filter(l => l.finalPrice).map(l => `${esc(l.name)}${l.qty > 1 ? " ×" + l.qty : ""}: ${v(l.finalPrice)}đ${l.discount ? " (giảm " + v(l.discount) + "đ)" : ""}`).join("<br>")}</td></tr><tr><td>Tổng · đã thu · còn nợ</td><td>${v(sm.total)}đ · ${v(sm.paid)}đ · <b>${v(sm.debt)}đ</b></td></tr>`; })() : ""}
      ${p.kind === "VOID" ? `<tr><td>Ghi chú</td><td><b>Phiếu huỷ</b> (đảo phiếu thu nhầm trong ngày)</td></tr>` : ""}
      <tr><td>${refund ? "Người chi" : "Người thu"}</td><td>${esc(staffName(st, p.by))}</td></tr></table>` + sign(refund ? "NGƯỜI NHẬN TIỀN" : "NGƯỜI NỘP TIỀN", refund ? "NGƯỜI CHI" : "NGƯỜI THU TIỀN");
    },
    phieuChon(st, sel) {
      const c = st.contract(sel.contractId), cus = st.customer(c.customerId);
      return head("PHIẾU CHỌN QUYỀN LỢI", sel.code) + `<p class="doc-c">${HP.vnDate(sel.at)}</p>
      <p>Khách hàng: <b>${esc(cus.name)}</b> · Hợp đồng ${esc(c.code)} · Ví hiện còn ${v(st.balance(c.id))}đ</p>
      <table class="doc-t"><tr><th>Mục</th><th>Trị giá</th><th>SL</th><th>Bác sĩ</th></tr>${sel.lines.map(l => `<tr><td>${esc(l.code)} · ${esc(l.name)}</td><td>${v(l.unitValue)}đ</td><td>${l.qty}</td><td>${({ CHO_BAC_SI: "Chờ khám", DA_CHI_DINH: "Chỉ định", KHONG_CHI_DINH: "Không chỉ định", DA_DUNG: "Đã sử dụng" })[l.state]}</td></tr>`).join("")}</table>
      <p><i>Khách hàng lựa chọn dịch vụ để được tư vấn; các thủ thuật chỉ tiến hành sau khi được bác sĩ đánh giá, giải thích nguy cơ, chỉ định và hoàn thành thủ tục đồng ý.</i></p>` + sign("KHÁCH HÀNG", "BÁC SĨ / NHÂN VIÊN TƯ VẤN");
    },
    phieuDongY(st, t) {
      const cus = st.customer(t.customerId);
      const CAT = root.CATALOG, kinds = Array.from(new Set(t.lines.map(l => (CAT.clin(l.code) || {}).consent).filter(Boolean)));
      const RISK = { PEEL: "Peel hoá học: đỏ, rát, bong tróc, tăng/giảm sắc tố, bùng mụn, hiếm gặp bỏng hoá chất và sẹo.", LASER: "Laser / lăn kim / triệt lông: đỏ, phù, đóng mài, tăng sắc tố sau viêm, bỏng nhiệt, phồng rộp, nhiễm trùng, hiếm gặp sẹo.", HIFU: "HIFU / RF: đỏ, sưng, đau, tê bì tạm thời, bỏng điểm, tổn thương thần kinh mặt hiếm gặp.", INJECT: "Tiêm filler / botox / căng chỉ / tiểu phẫu: bầm, sưng, đau, nhiễm trùng, lệch / không đều, sụp mi (botox), u hạt; <b>tắc mạch máu có thể gây hoại tử da, giảm hoặc mất thị lực</b> (filler) — cần báo ngay nếu đau tăng, da tái, nhìn mờ." };
      const age = HP.ageAt ? HP.ageAt(cus.dob || "", st.today) : null, contra = (cus.contra || []).map(k => CAT.CONTRA[k]);
      return head("PHIẾU ĐỒNG Ý THỰC HIỆN THỦ THUẬT DA LIỄU", t.code) + `<p class="doc-c">${today(st)}</p>
      <p>Tôi là: <b>${esc(cus.name)}</b> · Ngày sinh: ${cus.dob ? HP.vnDate(cus.dob) : "…………"} · CCCD: ……………… · Loại da: ${esc(cus.skinType || "…………")}</p>
      <p>Tiền sử dị ứng / chống chỉ định: <b>${esc([...contra, cus.allergies].filter(Boolean).join("; ") || "Không ghi nhận")}</b>. Tôi xác nhận đã khai báo trung thực (mang thai, thuốc đang dùng, bệnh nền).</p>
      ${age !== null && age < 18 ? `<p><b>Khách dưới 18 tuổi</b> — cha/mẹ hoặc người giám hộ ký thay: ……………………………… · Quan hệ: …………</p>` : ""}
      <p>Đã được bác sĩ <b>${esc(staffName(st, t.doctorId))}</b> thăm khám, giải thích về các dịch vụ sau:</p>
      <ul>${t.lines.map(l => `<li>${esc(l.name)} — ${l.sessionsTotal} buổi</li>`).join("") || "<li>…………………………</li>"}</ul>
      <p><b>Nguy cơ có thể xảy ra:</b></p><ul>${(kinds.length ? kinds : ["PEEL"]).map(k => `<li>${RISK[k]}</li>`).join("")}</ul><p>Phương án thay thế (điều trị bôi/uống, không điều trị) đã được giải thích. ☐ Tôi đồng ý cho chụp ảnh trước–sau để theo dõi điều trị (không dùng cho quảng cáo nếu không có đồng ý riêng).</p><p>Tôi đã được giải thích mục đích, quy trình, lợi ích, các nguy cơ trên và cách chăm sóc sau điều trị. Tôi hiểu kết quả phụ thuộc cơ địa, không có cam kết hiệu quả tuyệt đối. Tôi tự nguyện đồng ý thực hiện.</p>` + sign("KHÁCH HÀNG", "BÁC SĨ ĐIỀU TRỊ");
    },
    deNghiThanhToan(st, r) {
      const cat = { HOAN_TIEN: "Hoàn tiền khách hàng", HOA_HONG: "Hoa hồng đối tác", LUONG: "Lương nhân sự", MAT_BANG: "Mặt bằng", VAT_TU: "Vật tư – dược mỹ phẩm", MARKETING: "Marketing", KHAC: "Chi khác" };
      return head("GIẤY ĐỀ NGHỊ THANH TOÁN", r.code) + `<p class="doc-c">${HP.vnDate(r.createdAt)}</p>
      <table class="doc-t"><tr><td>Người đề nghị</td><td>${esc(staffName(st, r.createdBy))}</td></tr><tr><td>Hạng mục</td><td>${cat[r.category] || "Chi khác"}</td></tr>
      <tr><td>Người / đơn vị nhận</td><td><b>${esc(r.payee)}</b></td></tr><tr><td>Nội dung</td><td>${esc(r.note)}</td></tr>
      <tr><td>Số tiền</td><td><b>${v(r.amount)} đồng</b></td></tr><tr><td>Bằng chữ</td><td><i>${docSo(r.amount)}</i></td></tr>
      <tr><td>Trạng thái</td><td>${({ PENDING: "Chờ duyệt", APPROVED: "Đã duyệt — chờ chi", PAID: "Đã chi " + HP.vnDate(r.paidAt), REJECTED: "Từ chối: " + esc(r.rejectReason || "") })[r.status]}</td></tr>
      <tr><td>${r.status === "REJECTED" ? "Người từ chối" : "Người duyệt"}</td><td>${r.approvedBy ? esc(staffName(st, r.approvedBy)) + " · " + HP.vnDate(r.approvedAt) : "—"}</td></tr><tr><td>Người chi</td><td>${r.paidBy ? esc(staffName(st, r.paidBy)) + " · " + HP.vnDate(r.paidAt) : "—"}</td></tr><tr><td>Chứng từ gốc kèm theo</td><td>………………………………</td></tr></table>` + sign("NGƯỜI ĐỀ NGHỊ", "BAN GIÁM ĐỐC DUYỆT") + sign("KẾ TOÁN", "NGƯỜI NHẬN TIỀN");
    },
    saoKe(st, pid, month) {
      const p = st.partner(pid), es = st.s.commissions.filter(e => e.partnerId === pid && e.state !== "VOID" && HP.monthOf(e.at) <= month);
      const inM = es.filter(e => HP.monthOf(e.at) === month), before = es.filter(e => HP.monthOf(e.at) < month);
      const paidBefore = before.filter(e => e.state === "PAID" && e.paidAt && HP.monthOf(e.paidAt) < month).reduce((a, e) => a + e.amount, 0);
      const open = before.reduce((a, e) => a + e.amount, 0) - paidBefore;
      const paidIn = es.filter(e => e.state === "PAID" && e.paidAt && HP.monthOf(e.paidAt) === month).reduce((a, e) => a + e.amount, 0);
      const gen = inM.reduce((a, e) => a + e.amount, 0);
      const TL = { REFERRAL_FLAT: "Giới thiệu gói", ADDON_PCT: "Dịch vụ ngoài gói", NETWORK: "Thưởng tuyến", OFFSET: "Bù trừ", CLAWBACK: "Thu hồi" };
      return head(`SAO KÊ THU NHẬP ĐỐI TÁC THÁNG ${month.slice(5)}/${month.slice(0, 4)}`, "") + `<p>Đối tác: <b>${esc(st.partnerName(pid))}</b> · Mã ${esc(p.code)}</p>
      <table class="doc-t"><tr><td>Số dư chưa trả đầu kỳ</td><td>${v(open)}đ</td></tr><tr><td>Phát sinh trong kỳ</td><td>${v(gen)}đ</td></tr><tr><td>Đã chuyển trong kỳ</td><td>${v(paidIn)}đ</td></tr><tr><td><b>Số dư chưa trả cuối kỳ</b></td><td><b>${v(open + gen - paidIn)}đ</b></td></tr><tr><td>Thuế TNCN khấu trừ</td><td>Theo chứng từ khấu trừ khi chi trả (kế toán ghi)</td></tr></table>
      <table class="doc-t"><tr><th>Ngày</th><th>Loại</th><th>Diễn giải</th><th>Số tiền</th></tr>${inM.map(e => `<tr><td>${HP.vnDate(e.at)}</td><td>${TL[e.type] || e.type}</td><td>${esc(e.note || "")}</td><td>${v(e.amount)}đ</td></tr>`).join("") || `<tr><td colspan="4">Không có phát sinh</td></tr>`}</table>` + sign("ĐỐI TÁC XÁC NHẬN", "KẾ TOÁN");
    },
    danhSachCongNhan(st, pid) {
      const p = st.partner(pid), cs = st.s.contracts.filter(c => c.attributedPartnerId === pid && st.isValidForKpi(c));
      return head("DANH SÁCH HỢP ĐỒNG GÓI GHI NHẬN CHO ĐỐI TÁC", "") + `<p>Đối tác: <b>${esc(st.partnerName(pid))}</b> (${esc(p.code)}) · Tổng hợp đồng hợp lệ: <b>${cs.length}</b> · Mốc 50 (suất 2%) / 60 (suất 5%)</p>
      <table class="doc-t"><tr><th>STT</th><th>Hợp đồng</th><th>Khách hàng</th><th>Thanh toán đủ</th></tr>${cs.map((c, i) => `<tr><td>${i + 1}</td><td>${esc(c.code)}</td><td>${esc(ini(st.customer(c.customerId).name))} (${HP.maskPhone(st.customer(c.customerId).last5)})</td><td>${HP.vnDate(c.fullyPaidAt)}</td></tr>`).join("")}</table>
      <p><i>Chỉ tính hợp đồng có thật, đã thanh toán đủ, chưa huỷ/hoàn tiền tại ngày lập danh sách; không tính gói tự mua lần 2.</i></p>` + sign("ĐẠI DIỆN BỆNH VIỆN", "ĐỐI TÁC");
    },
    bangLuong(st, run) {
      return head(`BẢNG LƯƠNG THÁNG ${run.month.slice(5)}/${run.month.slice(0, 4)}`, run.code) + `<table class="doc-t small"><tr><th>Nhân sự</th><th>Lương cứng</th><th>Tư vấn</th><th>Bác sĩ</th><th>KTV</th><th>% doanh số</th><th>Điều chỉnh</th><th>Tổng</th></tr>${run.lines.map(l => `<tr><td>${esc(staffName(st, l.staffId))}</td><td>${v(l.base)}</td><td>${v(l.consult)}</td><td>${v(l.doctor)}</td><td>${v(l.tech)}</td><td>${v(l.leader)}</td><td>${v(l.adjust)}</td><td><b>${v(l.total)}</b></td></tr>`).join("")}<tr><td colspan="7"><b>Tổng cộng</b></td><td><b>${v(run.total)}</b></td></tr></table>
      <p>Bằng chữ: <i>${docSo(run.total)}</i></p><p>Lập: ${esc(staffName(st, run.createdBy))} · Duyệt: ${run.approvedBy ? esc(staffName(st, run.approvedBy)) : "chưa duyệt"}</p>` + sign("KẾ TOÁN LẬP", "BAN GIÁM ĐỐC DUYỆT");
    },
    bienBanHoan(st, c) {
      const cus = st.customer(c.customerId), refund = -st.s.pkgPayments.filter(p => p.contractId === c.id && p.kind === "REFUND").reduce((a, p) => a + p.amount, 0);
      const conv = -st.s.wallet.filter(w => w.contractId === c.id && ["EXPIRE", "REFUND_CONVERSION"].includes(w.kind)).reduce((a, w) => a + w.amount, 0);
      return head("BIÊN BẢN HOÀN PHẦN QUYỀN LỢI CHƯA SỬ DỤNG", c.code) + `<p class="doc-c">${today(st)}</p>
      <p>Khách hàng: <b>${esc(cus.name)}</b> · Hợp đồng ${esc(c.code)} · Trạng thái: ${esc(({ CANCELLED: "Đã huỷ", TERMINATED: "Đã chấm dứt", EXPIRED: "Đã hết hạn", ACTIVE: "Đang hiệu lực", CONSUMED: "Đã dùng hết", SIGNED: "Đã ký, chưa đóng đủ" })[c.status] || c.status)}</p>
      <table class="doc-t"><tr><td>Giá trị quyền lợi ban đầu</td><td>30.000.000đ</td></tr><tr><td>Đã sử dụng</td><td>${v(st.used(c.id))}đ</td></tr><tr><td>Số dư quy đổi</td><td>${v(conv)}đ</td></tr>
      <tr><td>Công thức</td><td>15.000.000 × ${v(conv)} / 30.000.000</td></tr><tr><td><b>Số tiền hoàn</b></td><td><b>${v(refund)}đ</b> — ${docSo(refund)}</td></tr><tr><td>Hạn hoàn</td><td>${HP.vnDate(c.refundDueAt)} (15 ngày làm việc)</td></tr></table>` + sign("ĐẠI DIỆN BỆNH VIỆN", "KHÁCH HÀNG");
    }
  };
  root.DOCS = Object.assign(D, { docSo });
})(typeof window !== "undefined" ? window : globalThis);
