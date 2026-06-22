const mongoose = require("mongoose");
// const passportLocalMongoose = require("passport-local-mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },

  fullname:{
    type: String,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
  },

  dp: {
    type: String,
    default: "default.png",
  },

  bio: String,

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],

  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],

  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
  }],
});

console.log(passportLocalMongoose);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);