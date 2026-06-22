const mongoose = require("mongoose");

function connectDB() {

  console.log("MONGO_URL =", process.env.MONGO_URL);

  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));
}

module.exports = connectDB;