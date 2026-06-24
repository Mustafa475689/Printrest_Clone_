const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true, 
  },

  description: {
    type: String, 
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  likes: [{   
    type: mongoose.Schema.Types.ObjectId,
    ref: "Like",
  }],

  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);