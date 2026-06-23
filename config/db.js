const mongoose = require("mongoose");

function connectDB() {
  return mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
      console.log("DB Error:", err);
      process.exit(1);
    });
}

module.exports = connectDB; 