# BỘ PROMPT GỬI CLAUDE CODE — Hồng Phúc Alliance

**Repo làm việc:** `ledinhlam23032000/Trungtamdalieu` · **Repo tham chiếu chỉ đọc:** `ledinhlam23032000/ZenithTasks`

## Chuẩn bị (làm 1 lần)

- **Claude Code trên web/app:** tạo phiên mới, chọn repo **Trungtamdalieu**. Prompt nào cần ZenithTasks sẽ tự clone nó vào `../ZenithTasks` để đọc.
- **Claude Code trên máy (CLI):** để hai repo nằm cạnh nhau rồi mở Claude Code trong `Trungtamdalieu`:
  ```
  git clone https://github.com/ledinhlam23032000/Trungtamdalieu
  git clone --depth 1 https://github.com/ledinhlam23032000/ZenithTasks
  cd Trungtamdalieu && claude
  ```
- Điền `docs/doi-tac/QUYET-DINH.md` trước khi chạy Prompt 0.

**Quy tắc dùng:** mỗi prompt = **một phiên mới**. Chạy theo thứ tự. Duyệt kết quả xong mới chạy prompt kế tiếp. Hết mỗi giai đoạn, chạy **Prompt Rà soát** rồi mới merge.

| # | Phiên | Ra gì |
|---|---|---|
| 0 | Đọc & lập kế hoạch | `KE-HOACH-THI-CONG.md` |
| 1 | P0a Khởi tạo + phân quyền 4 lớp | Dự án chạy được, đăng nhập 10 vai trò, "Xem với tư cách" |
| 2 | P0b Nền nghiệp vụ | Schema gói/ví/danh mục, seed danh mục |
| 3 | P1 Gói 15 triệu | Bán gói, phiếu chọn, ghi nhận sử dụng |
| 4 | P2 Hoa hồng + cổng đối tác | Hoa hồng, lô chi trả, cổng `/p` |
| 5 | P3 Suất 2%/5% + duy trì | Sơ đồ ghế, vòng duy trì, vụ chấm dứt |
| 6 | P4 Kỳ lợi nhuận + quyết toán | Phòng dữ liệu kỳ, quyết toán |
| 7 | P5 Đài chỉ huy + mô phỏng + học viện | Dashboard ban điều hành |
| 8 | P6 Phân tích tăng trưởng + thu nhập lãnh đạo | `/hieu-suat` 3 ống kính, thu nhập ban điều hành |
| R | Rà soát (sau mỗi giai đoạn) | Danh sách lỗi |

---

## PROMPT 0 — Đọc & lập kế hoạch (KHÔNG code)

```
Bạn là kỹ sư chính của repo Trungtamdalieu (app "Hồng Phúc Alliance"). Phiên này chỉ ĐỌC, ĐỐI CHIẾU và LẬP KẾ HOẠCH. KHÔNG khởi tạo dự án, KHÔNG viết code.

Bước 1 — Chuẩn bị repo tham chiếu: nếu chưa có thư mục ../ZenithTasks thì chạy
  git clone --depth 1 https://github.com/ledinhlam23032000/ZenithTasks ../ZenithTasks
ZenithTasks CHỈ ĐỌC, không sửa.

Bước 2 — Đọc trong Trungtamdalieu:
- CLAUDE.md
- docs/doi-tac/DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md (đọc HẾT, đặc biệt mục 2, 3, 5, 6, 9A, 12, 13)
- docs/doi-tac/QUYET-DINH.md (ưu tiên hơn mặc định trong đặc tả)
- docs/doi-tac/nguon/*.md (hợp đồng + phiếu chọn; .docx cùng tên là bản gốc)
- docs/doi-tac/nguon/anh/*.jpg (7 infographic — xem ảnh)
- docs/doi-tac/MOCKUP-ALLIANCE.html (mục tiêu thị giác: cổng đối tác, Đài chỉ huy, Hiệu suất & phân quyền)

Bước 3 — Đọc trong ../ZenithTasks: web/CLAUDE.md, web/AGENTS.md, web/BAN-GIAO.md, FINANCE-DEFINITIONS.md, docs/AI-ADMIN-GATEWAY.md, rồi các file nguồn liệt kê ở bảng "Chuyển từ ZenithTasks" (mục 2 đặc tả): permissions.ts, rbac.ts, permission-presets.ts, audit*.ts, mã hoá SĐT, rate limiter, accounting-period-lock, performance.ts, revenue-attribution.ts, các model ZOrganizationUnit/ZProjectPosition/ZProjectAssignment/ZMechanism* trong prisma/schema.prisma, package.json, Dockerfile, docker-compose.yml.

Bước 4 — Tạo docs/doi-tac/KE-HOACH-THI-CONG.md gồm:
A. Danh sách chuyển code: từng file Zenith → đường dẫn đích trong web/, cần sửa gì, test nào đi kèm. Ghi rõ phiên bản Next/React/Prisma/Tailwind lấy từ package.json của Zenith.
B. Thiết kế engine phân quyền 4 lớp (mục 5): kiểu dữ liệu, hàm scopeWhere, che trường, token-version, "Xem với tư cách", truy cập khẩn cấp — kèm cách test quét để chứng minh không có query nào bỏ qua scopeWhere.
C. Schema Prisma đầy đủ cho P0a + P0b (code block), danh sách migration, kế hoạch seed (nhân sự theo Phụ lục B, đơn vị theo QUYET-DINH D18, danh mục từ phieu-chon-tham-my.md).
D. Nhiệm vụ P0a → P6, mỗi nhiệm vụ vừa 1 phiên, có tiêu chí nghiệm thu và test số vàng tương ứng (mục 13).
E. Rủi ro & xung đột phát hiện được (giữa đặc tả, hợp đồng, infographic, code Zenith) và đề xuất xử lý.
F. Câu hỏi cho chủ (chỉ câu chưa có trong QUYET-DINH.md).
G. Mục "Nhật ký bàn giao" trống ở cuối file để các phiên sau ghi.

Kết thúc: tóm tắt ≤ 15 dòng, commit file kế hoạch trên nhánh docs/ke-hoach-thi-cong, KHÔNG push, DỪNG chờ tôi duyệt.
```

---

## PROMPT 1 — P0a: Khởi tạo dự án + Phân quyền 4 lớp

```
Đọc CLAUDE.md, docs/doi-tac/KE-HOACH-THI-CONG.md (đã duyệt), đặc tả mục 2, 5, 10, 13 (T18–T25), QUYET-DINH.md (D14, D15, D17, D18). Đảm bảo ../ZenithTasks có sẵn (clone --depth 1 nếu thiếu, chỉ đọc). Nhánh feature/p0a-khoi-tao.

Thi công P0a:
1. Khởi tạo ứng dụng trong web/ cùng công nghệ và phiên bản với ZenithTasks (Next.js 16 App Router, React 19, TS, Tailwind v4, Prisma 7 + @prisma/adapter-pg, PostgreSQL, vitest, Docker Compose app + Postgres, font Be Vietnam Pro). Tạo web/CLAUDE.md, web/AGENTS.md (chép lưu ý Next.js 16 từ Zenith), .env.example, README chạy thử.
2. Chuyển từ Zenith (kèm test của chúng): auth JWT + bcrypt + TOTP, audit before/after, mã hoá AES-GCM (SĐT, CCCD, tài khoản ngân hàng), rate limiter (bản đã vá SEC-001), app shell + command palette + PWA. Thêm token-version: đổi role/vị trí/khoá tài khoản → JWT cũ vô hiệu (T24).
3. Engine phân quyền 4 lớp: Mục × Hành động (XEM/TẠO/SỬA/DUYỆT/XUẤT/CHI TIỀN) × Phạm vi (CỦA TÔI/ĐỘI TÔI/ĐƠN VỊ/TOÀN BỘ/KHÔNG) × Trường nhạy cảm (ĐẦY ĐỦ/CHE/ẨN). Roles: ADMIN, MANAGER(+preset Kế toán), CONSULTANT, RECEPTION, CARE, DOCTOR, NURSE, SHAREHOLDER (chỉ xem), PARTNER, AUDITOR (có hạn). OrganizationUnit/Position/Assignment có hiệu lực theo thời gian (T19). Hàm scopeWhere(ctx, resource) là cửa duy nhất; viết test quét toàn bộ server action/route để chứng minh mọi truy vấn nghiệp vụ đi qua nó. SHAREHOLDER bị chặn mọi request ghi (T20).
4. Kiểm soát quyền lực: không tự duyệt khoản của mình (T23), ủy quyền tạm thời có hạn, "Xem với tư cách" (chỉ xem, ghi log), truy cập khẩn cấp 60 phút có lý do + báo ban điều hành, nhật ký truy cập dữ liệu nhạy cảm.
5. Trang /he-thong/phan-quyen: lưới vai trò × mục (hành động + phạm vi), tab Theo người (quyền hiệu lực ghi rõ nguồn), xem trước thay đổi trước khi lưu, nút Xem với tư cách. Giao diện theo token Zenith (đỏ hoa phượng + vàng), tham khảo phần "Phân quyền" trong MOCKUP-ALLIANCE.html.
6. Seed: nhân sự Phụ lục B + đơn vị D18 + 1 tài khoản mẫu cho mỗi vai trò (mật khẩu lấy từ biến môi trường DEMO_PASSWORD).

Test T18, T19, T20, T23, T24, T25 xanh. tsc + vitest + CHANGELOG + nhật ký bàn giao. Commit, KHÔNG push. Báo cáo kèm ảnh chụp trang phân quyền và màn hình "Xem với tư cách" của 3 vai trò khác nhau.
```

---

## PROMPT 2 — P0b: Nền nghiệp vụ

```
Đọc CLAUDE.md, KE-HOACH-THI-CONG.md, đặc tả mục 6.1–6.3, 13, phụ lục A, QUYET-DINH.md. Nhánh feature/p0b-nghiep-vu từ P0a.

Thi công P0b:
- Schema + migration: Customer, Payment, ServiceVisit (externalCaseRef sang Zenith), Partner, PackageContract, EntitlementWallet/WalletEntry, Beneficiary, CatalogItem/CatalogVersion, CommissionEntry, WorkingCalendar, MechanismDefinition/MechanismVersion (chuyển từ ZMechanism*).
- Mechanism REFERRAL_FLAT (3.000.000) và ADDON_PCT (theo D11) có testCases.
- Seed danh mục v0 từ docs/doi-tac/nguon/phieu-chon-tham-my.md: 7 gói chính A01–A07 kèm ràng buộc chọn vùng + toàn bộ dịch vụ ngoài gói 8 nhóm, đúng từng giá; hỏi lại 2 lỗi dữ liệu ghi ở phụ lục A.
- Mọi bảng nghiệp vụ mới đăng ký với engine phân quyền (resource + phạm vi + trường nhạy cảm).
- Hàm thuần + unit test F1, F2; T1, T11, T12, T15 xanh. Thêm script kiểm toàn vẹn: Σ WalletEntry = số dư; 1 hợp đồng ≤1 đối tác.

Chưa làm UI. tsc + vitest + CHANGELOG + nhật ký bàn giao. Commit, KHÔNG push.
```

---

## PROMPT 3 — P1: Gói 15 triệu vận hành được

```
Đọc CLAUDE.md, KE-HOACH-THI-CONG.md, đặc tả mục 6.2, 6.3 (F1), 7.2, 8, MOCKUP-ALLIANCE.html. Nhánh feature/p1-goi-15tr.

1. Bán gói ≤90 giây: tìm khách bằng 5 số cuối SĐT, quét/nhập mã đối tác giới thiệu (hiện tên để xác nhận), sinh hợp đồng từ mẫu docs/doi-tac/nguon/hop-dong-goi-15-trieu, thu tiền một phần/đủ, kích hoạt ví khi thu đủ.
2. Phiếu chọn số hoá (máy tính bảng tại quầy + điện thoại): chọn 1 gói chính; A01 tối đa 3/5; A02 chọn 1/2; A04 ghi chú bác sĩ quyết số vùng. Kết quả là "mong muốn".
3. Bác sĩ xác nhận/điều chỉnh chỉ định — payload trả cho bác sĩ không chứa trường hoa hồng nào (T21).
4. Ghi nhận sử dụng: thẻ ví, trừ giá trị, khách xác nhận OTP/ký, tạo ServiceVisit + WalletEntry trong 1 transaction có idempotency key. Vượt ví bắt buộc đồng ý trước (T16).
5. Hết hạn & hoàn phần chưa dùng theo F1; nhắc 90/30/7 ngày (web push).

Test T1, T15, T16, T21 xanh + test từ chối theo vai trò. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push. Gửi ảnh chụp các trang mới.
```

---

## PROMPT 4 — P2: Hoa hồng & Cổng đối tác

```
Đọc CLAUDE.md, KE-HOACH-THI-CONG.md, đặc tả mục 4, 4.1, 5.5, 6.3 (F2, F3), 7.3, 8, MOCKUP-ALLIANCE.html (phần điện thoại). Nhánh feature/p2-hoa-hong-cong-doi-tac.

1. Ghi nhận giới thiệu bằng mã/link/QR; chặn tự giới thiệu; 1 hợp đồng ≤1 đối tác.
2. CommissionEntry REFERRAL_FLAT + ADDON_PCT (F3, trên thực thu sau giảm giá/hoàn tiền); PENDING → ELIGIBLE → IN_BATCH → PAID; hoàn tiền sau khi trả → CLAWBACK bù trừ kỳ sau (D6).
3. Đối soát tháng + lô chi trả 2 bước (kế toán lập, admin duyệt, không tự duyệt khoản mình), khấu trừ thuế theo D12.
4. Cổng /p sub-brand Alliance (thêm token --color-alliance-*, --color-gold-*; không sửa token nội bộ): Trang chủ, Ví, Thu nhập (dòng thời gian + sao kê PDF tháng), Tôi. Mobile-first, vùng chạm ≥44px.
5. Đối tác chỉ thấy dữ liệu của mình; người được giới thiệu: tên viết tắt + SĐT che; không có hồ sơ y khoa.
Anti-feature: không cây tuyến dưới, không bảng xếp hạng theo người tuyển/thu nhập, không chữ "cổ đông" trong src/app/p (thêm test chặn).

Test T12, T13, T17 xanh. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push. Ảnh chụp cổng /p khổ 390px.
```

---

## PROMPT 5 — P3: Suất 2%/5% & Duy trì

```
Đọc đặc tả mục 5.5, 6.1, 6.3 (F4, F5), 6.4 (đọc thật kỹ), 7.1, 13; QUYET-DINH D4, D13. Nhánh feature/p3-suat-duy-tri.

1. ProfitSeat: 10 suất 2%, 5 suất 5%, danh sách chờ (T10).
2. Wizard công nhận: phương án A (50 HĐ, xuất danh sách hai bên ký), B (1,5 tỷ / 750tr / cấn trừ 250tr / thực đóng 500tr; cọc 50tr + 450tr trong 1 tháng), gói 5% (900tr / cấn trừ 330tr / 570tr). Cấn trừ ghi OFFSET, không bao giờ chi lại (T14). Không sinh hợp đồng khách ảo.
3. MaintenanceMonth 2 vòng; PartnerActivity có bằng chứng; điểm danh đào tạo tự sinh hoạt động.
4. TerminationCase đúng mục 6.4: nhắc sau tháng 1 → vụ việc sau tháng 2 → đếm 10 ngày làm việc theo WorkingCalendar → chỉ ADMIN quyết định. Tháng bệnh viện không giao kế hoạch không tính. Hệ thống KHÔNG BAO GIỜ tự chấm dứt.
5. Màn hình đội nhóm của đối tác 5%: chỉ hoạt động/đào tạo, payload không có tiền của người khác (T22).
6. /doi-tac/suat (sơ đồ ghế) và /doi-tac/duy-tri (bản đồ nhiệt + hàng đợi + đồng hồ vụ việc) theo mockup.

Test T7–T10, T14, T22 xanh. Audit mọi đổi trạng thái suất. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push.
```

---

## PROMPT 6 — P4: Kỳ lợi nhuận & Quyết toán

```
Đọc đặc tả mục 6.3 (F6–F9), 7.3 (Phòng dữ liệu kỳ), 9A.4, 13; QUYET-DINH D5, D7, D15, Q6. Nhánh feature/p4-ky-loi-nhuan.

1. ProfitScope có phiên bản; ProfitPeriod DRAFT → PUBLISHED → DISPUTE_WINDOW → LOCKED → PAID; ProfitCostLine chỉ nhận danh mục khấu trừ đã ký, bắt buộc chứng từ.
2. Tiền hưởng F6, pro-rata theo ngày, không chuyển lỗ nếu D7 (T5, T6).
3. Quyết toán F7, F8 hiển thị từng dòng công thức, xuất PDF biên bản (T2, T3, T4).
4. Cổng /p tab Quyền lợi: thẻ suất, vòng duy trì, Phòng dữ liệu kỳ (bảng thu chi, chứng từ, công thức, nút Phản hồi đúng hạn hợp đồng), tiến độ thu hồi vốn F9 với dòng chữ cố định "Mục tiêu hỗ trợ, không phải bảo lãnh hoàn vốn".
5. Khoá kỳ: người lập ≠ người khoá.

Test T2–T6 xanh. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push.
```

---

## PROMPT 7 — P5: Đài chỉ huy, Mô phỏng, Học viện

```
Đọc đặc tả mục 1, 7.1, 9, 11, MOCKUP-ALLIANCE.html (phần Đài chỉ huy). Nhánh feature/p5-dai-chi-huy.

1. /doi-tac Đài chỉ huy: 5 thẻ KPI (thẻ "Nghĩa vụ dịch vụ còn nợ" nổi bật: giá trị chương trình + giá vốn + dự phòng hoàn), phễu, sơ đồ ghế, "Cần xử lý hôm nay", bản đồ nhiệt. Mọi con số bấm vào mở bút toán gốc. Cổ đông xem được, không thao tác được.
2. /doi-tac/mo-phong: thanh trượt tham số + thác nước đóng góp/gói + điểm hoà vốn tháng.
3. /doi-tac/hoc-vien + tab Học viện trong /p: lộ trình 4 bước, 2 Zoom/tuần + 1 chương trình lớn/tuần, điểm danh, yêu cầu quay dựng giao Dương/Tuấn, kho nội dung đã duyệt.
4. AI (chuyển ai-approval-gate từ Zenith, mọi hành động cần duyệt): gợi ý đối soát + cờ bất thường, soạn thông báo duy trì, trả lời đối tác dựa trên bút toán thật.

Kiểm tra trên seed: ban điều hành trả lời được 4 câu hỏi mục 1 trong một màn hình. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push. Ảnh chụp 1440px.
```

---

## PROMPT 8 — P6: Phân tích tăng trưởng & Thu nhập lãnh đạo

```
Đọc đặc tả mục 5 (phạm vi), 9A (đọc hết), 13 (T26–T29, T27b); QUYET-DINH D5, D14, D15, D16, D16a, D17; ../ZenithTasks/web/src/lib/performance.ts, revenue-attribution.ts, FINANCE-DEFINITIONS.md; MOCKUP-ALLIANCE.html (phần "Hiệu suất & tăng trưởng"). Nhánh feature/p6-hieu-suat.

1. Từ điển chỉ số: src/lib/metrics/definitions.ts (công thức, nguồn, phân bổ, làm tròn) + docs/doi-tac/TU-DIEN-CHI-SO.md. Dùng lớp phân bổ doanh số chung — một người kiêm hai vai trò không bị cộng hai lần (T26). Kiểm tra bất biến: tổng từng người = số đội = số toàn hệ thống, phần chưa phân bổ hiện riêng.
2. /hieu-suat với thanh ống kính Của tôi / Đội tôi / Toàn hệ thống — chỉ hiện ống kính mà phạm vi cho phép; dữ liệu lọc bằng scopeWhere ở server.
3. Biểu đồ (recharts): xu hướng 12 tháng + cùng kỳ năm trước, thẻ tăng trưởng MoM/YoY/TB 3 tháng/dự phóng (T28), thanh mục tiêu, cột chồng đóng góp đội, thác nước lợi nhuận, cohort khách, phân vị ẩn danh cho nhân viên (T29). Chỉ số kết quả luôn đi kèm chỉ số chất lượng. Mọi điểm bấm được để mở giao dịch gốc.
4. /hieu-suat/muc-tieu: đặt mục tiêu tháng theo người/đội/chương trình; cảnh báo sớm gửi đúng người theo phạm vi.
5. /hieu-suat/thu-nhap: tính thu nhập ban điều hành và nhân sự cố định bằng mechanism (3 × 10% doanh số tổng; kế toán 20tr + 2%; truyền thông 8tr + 2% DOANH SỐ CÁ NHÂN từng người theo D16/D16a — cần trường nguồn khách ghi nhận cho nhân sự truyền thông, mỗi khoản thực thu chỉ gắn 1 người) mỗi kỳ (T27, T27b); mỗi người xem của mình; kế toán lập; khoản của giám đốc do giám đốc khác duyệt; cổ đông xem theo D15; đối tác 2%/5% chỉ thấy tổng trong Phòng dữ liệu kỳ.
6. Không bảng xếp hạng công khai theo thu nhập; bảng vinh danh (nếu bật) xếp theo chỉ số chất lượng.

Test T26–T29 xanh + test mỗi vai trò mở /hieu-suat chỉ thấy đúng phạm vi. tsc + vitest + CHANGELOG + bàn giao. Commit, KHÔNG push. Ảnh chụp /hieu-suat dưới góc nhìn: nhân viên, trưởng nhóm, ban điều hành, cổ đông.
```

---

## PROMPT R — Rà soát trước khi merge (chạy sau mỗi giai đoạn)

```
Rà soát nhánh hiện tại so với main như một reviewer khó tính. KHÔNG sửa code trước khi báo cáo.
1. Đường ghi tiền: transaction, idempotency, append-only, audit before/after?
2. Phân quyền: có truy vấn nào bỏ qua scopeWhere? Có payload nào lộ trường lẽ ra phải che/ẩn? Thử bằng tài khoản seed của từng vai trò (nhân viên, trưởng nhóm, bác sĩ, kế toán, cổ đông, đối tác, đối tác 5%) — gọi thẳng API/server action bằng id của người khác.
3. Cổ đông có đường ghi nào không? Có ai tự duyệt được khoản của mình không?
4. Có chỗ nào tính thưởng cấp 2, cây tuyến dưới, chữ "cổ đông" trong nội dung cho đối tác, hoặc tự động chấm dứt suất?
5. Test số vàng của giai đoạn này đủ và xanh?
6. Đối chiếu từng tiêu chí nghiệm thu trong KE-HOACH-THI-CONG.md.
Xuất danh sách lỗi HIGH/MEDIUM/LOW kèm file:dòng, rồi hỏi tôi có muốn sửa không.
```
