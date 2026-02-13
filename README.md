# Trokind Pharmaceuticals - E-commerce Platform

A complete full-stack e-commerce solution for pharmaceutical products built with React, Node.js, Express, and MySQL.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment Guide](#deployment-guide)
- [Features](#features)

## Prerequisites

Before starting, you need to install the following software on your computer:

### 1. Node.js and npm
- Go to https://nodejs.org/
- Download and install the LTS (Long Term Support) version
- This will install both Node.js and npm (Node Package Manager)
- Verify installation by opening Command Prompt/Terminal and typing:
  ```bash
  node --version
  npm --version
  ```

### 2. MySQL Database
- Go to https://dev.mysql.com/downloads/mysql/
- Download MySQL Community Server
- During installation, set a root password (remember this!)
- Or use XAMPP (https://www.apachefriends.org/) which includes MySQL

### 3. Code Editor
- Download VS Code: https://code.visualstudio.com/
- Install recommended extensions: ES7+ React/Redux/React-Native snippets, ESLint

## Installation Steps

### Step 1: Create Project Folders
```bash
# Create main project folder
mkdir trokind-pharmaceuticals
cd trokind-pharmaceuticals

# Create frontend and backend folders
mkdir frontend
mkdir backend
```

### Step 2: Setup Backend

```bash
cd backend
npm init -y
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken express-validator multer
npm install --save-dev nodemon
```

### Step 3: Setup Frontend

```bash
cd ../frontend
npx create-react-app .
npm install react-router-dom axios
```

### Step 4: Copy Project Files

Copy all the provided code files into their respective directories:
- Backend files → `backend/` folder
- Frontend files → `frontend/src/` folder
- Database schema → `database/` folder

## Project Structure

```
trokind-pharmaceuticals/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── contact.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   └── Cart.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── About.js
│   │   │   ├── Team.js
│   │   │   ├── Contact.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Checkout.js
│   │   ├── context/
│   │   │   └── CartContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── database/
    └── schema.sql
```

## Database Setup

### Step 1: Start MySQL
- Open MySQL Workbench or use command line
- Login with your root password

### Step 2: Create Database
```sql
CREATE DATABASE trokind_pharmaceuticals;
USE trokind_pharmaceuticals;
```

### Step 3: Run Schema
- Open the `schema.sql` file
- Copy and paste the contents into MySQL Workbench
- Execute the SQL commands
- This will create all necessary tables

### Step 4: Configure Backend
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trokind_pharmaceuticals
JWT_SECRET=your_super_secret_key_change_this_in_production
```

**Important**: Replace `your_mysql_password` with your actual MySQL password!

## Running the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
You should see: "Server running on port 5000" and "Connected to MySQL database"

### Terminal 2 - Frontend React App
```bash
cd frontend
npm start
```
Your browser will automatically open to http://localhost:3000

## Features

✅ **User Features:**
- User registration and login with JWT authentication
- Browse pharmaceutical products by category
- Product search and filtering
- Shopping cart functionality
- Secure checkout process
- Order history tracking

✅ **Pages:**
- Home page with featured products
- Product catalog with categories
- Individual product details
- About Us company information
- Team/Careers section
- Contact form
- User dashboard

✅ **Admin Features** (for future development):
- Product management (add/edit/delete)
- Order management
- User management

## Deployment Guide

### Option 1: Vercel (Frontend) + Railway (Backend & Database)

**Frontend on Vercel:**
1. Create account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. In frontend folder: `vercel`
4. Follow prompts to deploy

**Backend on Railway:**
1. Create account at https://railway.app
2. Create new project → Deploy from GitHub
3. Add MySQL database service
4. Add environment variables from .env file
5. Deploy backend service

### Option 2: Netlify (Frontend) + Heroku (Backend)

**Frontend on Netlify:**
1. Create account at https://netlify.com
2. Drag and drop `frontend/build` folder after running `npm run build`

**Backend on Heroku:**
1. Create account at https://heroku.com
2. Install Heroku CLI
3. Add ClearDB MySQL addon
4. Configure environment variables
5. Deploy with Git

### Option 3: Full Stack on VPS (DigitalOcean/AWS/Linode)

**Best for production:**
1. Rent a VPS (start with $5-10/month plan)
2. Install Node.js, MySQL, Nginx
3. Configure domain and SSL certificates
4. Deploy both frontend and backend
5. Setup PM2 for process management

**Recommended Hosting Providers:**
- **Beginner-friendly**: Vercel + Railway ($15-20/month combined)
- **Mid-range**: Netlify + Heroku ($25-50/month)
- **Production**: DigitalOcean VPS ($10-40/month)

## Security Notes

🔒 **Before going live:**
1. Change JWT_SECRET to a strong random string
2. Enable HTTPS/SSL certificates
3. Set up CORS properly for your domain
4. Implement rate limiting on APIs
5. Add input validation and sanitization
6. Regular database backups
7. Keep dependencies updated

## Support

For questions or issues:
- Check console logs for errors
- Verify all environment variables are set
- Ensure MySQL is running
- Check that both frontend and backend servers are running

## Next Steps

1. Add product images to your database
2. Customize colors and branding
3. Add payment gateway (Stripe/PayPal)
4. Implement email notifications
5. Add admin dashboard
6. Setup analytics

---

**Built with ❤️ for Trokind Pharmaceuticals**
