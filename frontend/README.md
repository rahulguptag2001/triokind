triokind-complete/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── contactController.js
│   │   └── uploadController.js (Cloudinary)
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── contact.js
│   │   ├── payment.js (Razorpay)
│   │   └── upload.js
│   ├── server.js
│   ├── package.json
│   └── .env (YOU CREATE THIS)
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico (Triokind logo)
│   │   └── logo192.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   └── Toast.js
│   │   ├── context/
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── Orders.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── About.js
│   │   │   ├── Team.js
│   │   │   ├── Contact.js
│   │   │   ├── OrderSuccess.js
│   │   │   └── AdminProductUpload.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env.production
└── database/
    └── schema.sql (with 18 products pre-loaded)