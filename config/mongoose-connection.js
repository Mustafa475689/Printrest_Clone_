const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/project");

const db = mongoose.connection;

db.on("connected", () => {
    console.log("MongoDB Connected");
});

db.on("error", (err) => {
    console.log(err);
});

module.exports = db;