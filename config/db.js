const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("DB Error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;