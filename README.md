# stock_app_test

This public repo to share the data in between the candidate and interviewer

# Company Dashboard Project (React + Express + MySQL)

## 🚀 Project Overview

This project is a **Company Dashboard** that allows users to:
✅ View a list of companies  
✅ Click on a company to display related data & charts  
✅ Authenticate users (Login/Signup)  
✅ Admin can manage company data

---

## 📂 Project Structure

### `frontend/`

- **components/**
  - `Navbar.jsx` (Top navigation bar)
  - `CompanyList.jsx` (List of companies)
  - `CompanyChart.jsx` (Charts for company data)
- **pages/**
  - `Home.jsx` (Landing page)
  - `Dashboard.jsx` (Main dashboard)
  - `Login.jsx` (User login page)
  - `Signup.jsx` (User registration page)
- `App.jsx` (Main routing)
- `index.css` (Tailwind styling)

### `backend/`

- **routes/**
  - `companyRoutes.js` (API routes for companies)
  - `authRoutes.js` (Authentication routes)
- **controllers/**
  - `companyController.js` (Handles company data logic)
  - `authController.js` (Handles login/signup)
- **config/**
  - `db.js` (Database connection)
- `server.js` (Main Express server)

---

## 📦 Dependencies Installed

### 🔹 **Frontend (React + Vite)**

```sh
npm install react-router-dom framer-motion tailwindcss lucide-react axios recharts
```
