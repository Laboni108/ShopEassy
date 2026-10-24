const path = require('path');
const express = require('express');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;

const connectDB = require('./db/connect');
const { MONGODB_URI } = require('./db/connect');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, secure: isProd, sameSite: 'lax' },
  })
);

// Make sure the DB is connected before any API route runs
app.use('/api', async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { res.status(500).json({ error: 'Database connection failed: ' + err.message }); }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Local: start a server. Vercel: just export the app.
if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)))
    .catch((err) => { console.error('Failed to connect to MongoDB:', err.message); process.exit(1); });
}

module.exports = app;