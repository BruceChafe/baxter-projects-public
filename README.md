# baxter-projects (Public Snapshot)

**baxter-projects** is a modular SaaS platform designed for automotive dealerships, providing tools to manage dealership visits, leads, and customer interactions. This repository is a **sanitized snapshot** of the live project for educational and demonstration purposes.

> 🚗 Live Demo: [https://baxter-projects.vercel.app](https://baxter-projects.vercel.app)  
> 🔐 Note: This repo excludes secrets, private configs, and some backend logic.

---

## 🚀 Current Module: UpShift

UpShift is a visit tracking system that helps dealerships record, manage, and analyze customer interactions at the front desk.

### Key Features:
- Multi-step visitor intake form with contact search and creation
- Driver’s license scanning and OCR (via AWS Textract)
- Duplicate contact detection and ban management
- Interactive dashboard showing visits by time, program, and consultant
- Role-based access: receptionist, consultant, manager, admin

---

## 🧪 Coming Soon: Additional Modules

We're building `baxter-projects` to support multiple standalone modules:

### ✅ LeadFlow *(in development)*
> A lightweight ADF lead processor that ensures your hottest leads get attention first. Built to modernize the broken first-contact process.

### 🧠 CRM *(foundation in place)*
> Connect the dots between contacts, leads, and follow-ups. CRM ties everything together so nothing slips through the cracks.

---

## 🧱 Tech Stack

| Layer        | Tech                           |
|--------------|--------------------------------|
| Frontend     | React + Vite + Material UI     |
| Backend      | Supabase (Auth, DB, Storage, Edge Functions) |
| OCR/Scanning | AWS Textract + ZXing           |
| Payments     | Stripe (ready, but $0 plans for now) |
| Email        | SendGrid (lead and visit notifications) |
| Hosting      | Vercel                         |
| Docs/Help    | Scribe                         |

---

## 📁 What’s in This Repo?

This snapshot includes:
- Frontend React components
- Supabase function stubs (minus secrets/config)
- Project structure and architecture
- `.gitignore`d sensitive content

---

## ⚠️ Important Notes

- **Private keys, `.env`, and full Edge Function logic** are excluded.
- Stripe is connected but currently running with all pricing set to $0.
- If you’d like to run a local copy, you’ll need to configure your own Supabase backend and secrets.

---

## 🙌 Acknowledgements

Huge thanks to the [GetCoding](https://www.getcoding.ca/) community, the coaching team, and fellow builders who provided feedback and motivation through every module. This has been my most ambitious build to date — and I'm excited to keep pushing it forward.

— Bruce Chafe  
[brucechafe.dev](https://brucechafe.dev) | [@BruceChafe](https://github.com/BruceChafe)
