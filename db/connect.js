require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce-app';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!global._mongoPromise) {
    global._mongoPromise = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((err) => { global._mongoPromise = null; throw err; });
  }
  await global._mongoPromise;
  return mongoose.connection;
}

module.exports = connectDB;
module.exports.MONGODB_URI = MONGODB_URI;