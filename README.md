# LeaveMaster — Personal Employee Leave Management System

A modern, offline-first personal leave management web application designed for employees. Built with **Next.js (Static Export)**, **TypeScript**, and **IndexedDB**, and deployed to **GitHub Pages**.

---

## 🌟 Key Features

1. **Client-Side Persistence (IndexedDB)**
   - No cloud server or backend database required.
   - All leaves, balances, and settings are saved securely inside your browser's IndexedDB.
   - Full JSON **Backup** & **Restore** capability with zero data loss.

2. **Smart Working Days Calculation**
   - Automatically excludes weekly days off (e.g. Friday & Saturday or Saturday & Sunday) and public holidays.
   - Half-day leave support (0.5 working days deduction for morning or afternoon sessions).
   - Strict annual quota balances with **No Carry Forward** rule.

3. **Official Email Notice Generator**
   - Application submission automatically generates a formatted notice:
   ```text
   Dear Mr. Adnan & HR Team,

   I am writing to formally request leave of absence from the office.

   Leave Details:
   - Leave Type: Casual Leave (CL)
   - Duration: 15 Feb 2026 – 16 Feb 2026 (2 Working Days)
   - Reason: Personal urgent matters

   During my absence, my colleague Jane Doe will handle urgent deliverables.

   I will resume work on 17 Feb 2026. In case of any urgent query, I will remain accessible via phone or email.

   I kindly request you to approve my leave application.

   Thank you very much for your understanding and support.

   Sincerely,
   Sojib Das 
   Software Engineer
   Employee ID: EMP-1042
   Product & Engineering
   Acme Technologies Ltd.
   ```
   - One-click **Open in Mail Client** (`mailto:`) and **Copy to Clipboard**.

4. **Paper-Ready Printable Form**
   - Official A4 formatted document with signature fields for Applicant, Recommended by (Department Head), and Approved by (HR).

5. **Interactive Dashboard & Calendar**
   - Circular progress cards for Casual, Sick, Annual, and Compensatory leaves.
   - Color-coded monthly calendar (Approved = Green, Pending = Amber, Holiday = Purple, Weekend = Muted).
   - Application status management (`Pending` -> `Approved` / `Rejected`).

---

## 🚀 Getting Started

### Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Static Production / GitHub Pages
```bash
npm run build
```
Generates static HTML export files into the `./out` directory.

---

## ⚙️ Configuration

Click the **Settings** button in the dashboard to customize:
- **Employee Information:** Name, Employee ID, Designation, Department, Company Name.
- **Recipients:** Manager Name/Salutation (`Mr. Adnan`), Manager Email (`To:`), HR Email (`Cc:`).
- **Office Weekends:** Toggle Friday & Saturday, Saturday & Sunday, or custom off-days.
- **Annual Quotas:** Set custom days for Casual (CL), Sick (SL), Annual (AL), etc.
- **Public Holidays:** View and add custom national or company holidays.
