const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/project");
mongoose.connect("mongodb+srv://kmustafakhan334_db_user:LNFd8wL2TLtYVrta@cluster0.2sld08n.mongodb.net/?appName=Cluster0")
const db = mongoose.connection;

db.on("connected", () => {
    console.log("MongoDB Connected");
});

db.on("error", (err) => {
    console.log(err);
});

module.exports = db;