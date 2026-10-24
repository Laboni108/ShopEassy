# ShopEasy — Basic E-Commerce Site
**Vercel Link** - shop-eassy.vercel.app

A full-stack e-commerce demo built with **Express.js** (Node.js) + **MongoDB** (via Mongoose) on the backend and plain **HTML/CSS/JavaScript** on the frontend.

## Features

- **Product listings** — browsable grid with search and category filtering
- **Product details page** — full description, stock, quantity picker
- **Shopping cart** — session-based, works for guests, persists across pages
- **User registration/login** — passwords hashed with bcrypt, session cookies
- **Order processing** — checkout with shipping address, stock is validated and decremented, order history per user
- **Database** — MongoDB, with Mongoose schemas for users, products, and orders

## Project structure

```
ecommerce-app/
├── server.js               # Express app entry point
├── .env.example             # copy to .env and fill in your Mongo connection string
├── db/
│   ├── connect.js            # opens the Mongoose/MongoDB connection
│   ├── seed.js                # sample product data
│   └── models/
│       ├── User.js
│       ├── Product.js
│       └── Order.js
├── middleware/
│   └── auth.js               # requireAuth guard
├── routes/
│   ├── auth.js                # register / login / logout / me
│   ├── products.js            # product listing & detail
│   ├── cart.js                 # cart CRUD (session-based)
│   └── orders.js                # checkout & order history
└── public/                    # static frontend
    ├── index.html               # product listing
    ├── product.html               # product detail
    ├── cart.html                   # shopping cart
    ├── checkout.html                # shipping + place order
    ├── login.html
    ├── register.html
    ├── orders.html                    # order history
    ├── css/style.css
    └── js/main.js                      # shared fetch helper + nav bar
```

## Getting started

### 1. Get a MongoDB database

Pick one:

- **Local MongoDB** — install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and make sure it's running (`mongod`). It listens on `mongodb://127.0.0.1:27017` by default.
- **MongoDB Atlas (free, no install)** — create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), then grab the connection string from *Connect → Drivers*. This is the easier option on Windows if you don't want to install anything.

### 2. Configure the connection string

```bash
cp .env.example .env
```

Then edit `.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-app
```
(or paste your Atlas connection string instead)

### 3. Install dependencies

```bash
npm install
```

### 4. Seed the product catalog

```bash
npm run seed
```

You should see `Seeded 12 products.` — this confirms the app can reach your database.

### 5. Start the server

```bash
npm start
```

Then open **http://localhost:3000**.

## How it works

- **Auth**: `express-session` issues an `httpOnly` cookie on login/register. `bcryptjs` hashes passwords (never stored in plain text). User documents live in the `users` collection.
- **Products**: stored in the `products` collection. IDs are MongoDB's own `ObjectId`s (shown as strings like `"664f1e2b..."` in the API and URLs — not sequential numbers).
- **Cart**: stored in the session (`req.session.cart`), *not* the database — so guests can add items before logging in, and nothing is written to Mongo until checkout.
- **Checkout**: re-checks each cart item's stock against the `products` collection, decrements stock, creates a document in the `orders` collection (with a snapshot of item name/price so history stays accurate even if a product changes later), and clears the cart.
- **Frontend**: no build step or framework — plain HTML pages each load `/js/main.js` (nav bar + tiny `fetch` wrapper) and call the JSON API directly.

## API reference

| Method | Endpoint              | Description                          | Auth required |
|--------|-----------------------|---------------------------------------|----------------|
| POST   | `/api/auth/register`  | Create an account                     | No             |
| POST   | `/api/auth/login`     | Log in                                | No             |
| POST   | `/api/auth/logout`    | Log out                               | No             |
| GET    | `/api/auth/me`        | Get current user                      | No             |
| GET    | `/api/products`       | List products (`?search=&category=`)  | No             |
| GET    | `/api/products/:id`   | Product detail                        | No             |
| GET    | `/api/cart`           | View cart                             | No             |
| POST   | `/api/cart`           | Add item `{ productId, qty }`         | No             |
| PUT    | `/api/cart/:productId`| Update quantity `{ qty }`             | No             |
| DELETE | `/api/cart/:productId`| Remove item                           | No             |
| POST   | `/api/orders`         | Checkout `{ shippingAddress }`        | **Yes**        |
| GET    | `/api/orders`         | List my orders                        | **Yes**        |
| GET    | `/api/orders/:id`     | Order detail                          | **Yes**        |

## Changing product images

Edit `db/seed.js` — each product has an `image` field (a URL, or a path like `/img/your-file.jpg` if you put your own images in `public/img/`). After editing, re-run:
```bash
npm run seed
```

## Troubleshooting

- **`MongooseServerSelectionError` / "Failed to connect to MongoDB"** — MongoDB isn't running, or `MONGODB_URI` in `.env` is wrong. If using local MongoDB, make sure the `mongod` service/process is actually running. If using Atlas, double-check the connection string, password, and that your IP is allow-listed in Atlas's Network Access settings.
- **`EADDRINUSE: address already in use :::3000`** — something else (often an old copy of this same server) is already using port 3000. On Windows: `netstat -ano | findstr :3000` to find the process ID, then `taskkill /PID <id> /F`. Or just run on another port: `set PORT=3001 && npm start` (PowerShell: `$env:PORT=3001; npm start`).

## Notes / production considerations

This is built as a learning/demo project. Before deploying for real use, you'd want to:
- Set a strong, secret `SESSION_SECRET` in `.env` and use `secure: true` cookies behind HTTPS
- Use MongoDB transactions for checkout (to avoid race conditions on stock under concurrent orders)
- Add input validation/rate limiting, CSRF protection, and HTTPS
- Add a payment gateway (Stripe, PayPal, etc.) — this demo simulates order placement without real payment
