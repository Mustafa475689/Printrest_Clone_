const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],
}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);