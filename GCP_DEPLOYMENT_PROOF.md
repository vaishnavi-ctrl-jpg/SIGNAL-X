# 🚦 SIGNAL.X - Proof of GCP Credit Usage & Deployment

This document serves as formal evidence of the deployment of the **SIGNAL.X** project on Google Cloud Platform (GCP), utilizing active Cloud Billing credits.

## 📌 Project Identification
- **Project Name:** SIGNAL-X
- **Project ID:** `signal-x-495315-s6`
- **Project Number:** `751668289831`
- **Live URL:** [https://signal-x-751668289831.us-central1.run.app](https://signal-x-751668289831.us-central1.run.app)

## 💰 Billing & Credit Status
The project is successfully linked to a **Google Cloud Platform Trial Billing Account** which provides the credits used for this deployment.

| Metric | Status |
| :--- | :--- |
| **Billing Account Linked** | `010554-2EEFED-F74C44` |
| **Billing Enabled** | ✅ **True** |
| **Account Type** | Trial Billing Account (Free Credits) |

### Terminal Verification
```powershell
> gcloud billing projects describe signal-x-495315-s6
billingAccountName: billingAccounts/010554-2EEFED-F74C44
billingEnabled: true
projectId: signal-x-495315-s6
```

## 🏗️ Resource Utilization (Credit Consumption)
The following resources have been provisioned and are actively consuming credits/quota:

### 1. Cloud Run (Compute)
- **Service Name:** `signal-x`
- **Region:** `us-central1`
- **Configuration:** 512Mi Memory, 1 vCPU
- **Status:** Active & Serving 100% Traffic

### 2. Artifact Registry (Storage)
- **Repository:** `cloud-run-source-deploy`
- **Total Size:** `44.320 MB`
- **Format:** Docker (OCI Container)

### 3. Cloud Build (Compute)
- **Status:** Successful build completed on 2026-05-05.
- **Consumption:** Triggered containerization and deployment workflow.

---
**Verified by Antigravity AI Coding Assistant**
*Deployment timestamp: 2026-05-05 14:22:14 UTC*
