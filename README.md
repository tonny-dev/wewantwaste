# WeWantWaste 🗑️

A full-stack skip hire platform with secure payments via Stripe (Test Mode). Users can book skips, view order summaries, and pay using card or Google Pay. Built with React (Vite), Node.js/Express, and Stripe API.

---

## 🚀 Tech Stack

- Frontend: React + Vite
- Backend: Express (Node.js)
- Payments: Stripe API (Test Mode)
- Dev Tools: `concurrently`, `dotenv`

---

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/wewantwaste.git
cd wewantwaste
````

2. **Install dependencies for both frontend and backend:**

```bash
# Frontend (Vite)
npm install/yarn install

# Backend
cd server
npm install
```

---

## ⚙️ Environment Setup

Create a `.env` file in the **project root** with the following:

```env
# .env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

STRIPE_SECRET_KEY=sk_test_...
PORT=5000
NODE_ENV=development
```

> 🔐 Use **Stripe test keys** from [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

---

## ▶️ Running the App Locally

Use `concurrently` to run both frontend and backend together:

```bash
npm run dev
```

This will:

* Start React frontend on `http://localhost:5173`
* Start Express backend on `http://localhost:5000`

---

## 🧪 Testing Payments (Stripe Test Mode)

You can test payments using Stripe’s sandbox environment:

### 💳 Test Card (No 3D Secure)

```text
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP/Postcode: Any
```

> All payments are routed to **Stripe Test Mode**. You will **not** be charged.

### ✅ Check test payments here:

[https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)

---

## 🧠 Features

* Custom payment form with card validation
* Real-time pricing and VAT breakdown
* Save card details (Stripe Customer API)
* Stripe webhook support (coming soon)
* Booking summary and success state

---
