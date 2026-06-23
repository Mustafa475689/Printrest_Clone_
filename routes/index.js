var express = require('express');
var router = express.Router();

const passport = require("passport");

// require models
const userModel = require('../models/user');
const postModel = require('../models/post');
const likeModel = require("../models/like");
const upload = require("../config/multer");

/* Home Page */
router.get('/', async function (req, res) {
  try {
    const posts = await postModel.find()
      .populate("user")
      .sort({ createdAt: -1 });

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {

        const likeCount = await likeModel.countDocuments({
          post: post._id
        });

        let liked = false;

        if (req.user) {
          const existingLike = await likeModel.findOne({
            post: post._id,
            user: req.user._id
          });

          liked = !!existingLike;
        }

        return {
          ...post.toObject(),
          likeCount,
          liked
        };
      })
    );

    res.render('index', {
      title: "Printrest",
      posts: postsWithLikes,
      user: req.user
    });

  } catch (err) {
    console.log("HOME ROUTE ERROR:", err);
    res.status(500).send("Server Error");
  }
});
//...

/* Register */
router.post("/register", async (req, res) => {
  try {

    const { username, fullname, email, password } = req.body;

    // 1. Empty fields check
    if (!username || !fullname || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    // 2. Check if user already exists
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      req.flash("error", "Username already exists, try another one");
      return res.redirect("/register");
    }

    //  create user
    const user = new userModel({
      username,
      fullname,
      email,
    });

    await userModel.register(user, password);

    req.flash("success", "Registration successful! Please login");
    res.redirect("/login");

  } catch (err) {

    // ❌ Mongo / passport errors (like duplicate email etc.)
    req.flash("error", err.message);
    res.redirect("/register");
  }
});
/* temporery route for register */
router.get("/test-register", async (req, res) => {
  try {

    console.log("register method:", typeof userModel.register);

    const user = new userModel({
      username: "mustafa",
      fullname: "Mustafa Khan",
      email: "mustafa@gmail.com",
    });

    await userModel.register(user, "123456");

    res.send("User Registered");

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

/* Login */
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err);

    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    req.logIn(user, function (err) {
      if (err) return next(err);

      req.flash("success", "Login successful!");
      return res.redirect("/");
    });

  })(req, res, next);
});
/* Temorary login route */
router.get("/test-login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (!user) return res.send("Login failed ❌");

    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.send("Login successful ✅");
    });
  })(req, res, next);
});

/* Logout */
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

/* Temporary Route Logout */
router.get("/test-logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy(function (err) {
      if (err) return next(err);

      res.send("Logout successful ✅");
    });
  });
});

//* get routes for Register and login *//
router.get("/register", function (req, res) {
  res.render("register");
});

router.get("/login", function (req, res) {
  res.render("login");
});

// Create posts route //
router.post("/createpost", isLoggedIn, upload.single("image"), async function (req, res) {

  console.log("========== CREATE POST ==========");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {

    const post = await postModel.create({
      image: req.file.path,
      title: req.body.title,
      description: req.body.description,
      user: req.user._id
    });

    console.log("POST CREATED:", post);

    res.redirect("/profile");

  } catch (err) {

    console.error("CREATE POST ERROR:");
    console.error(err);

    res.status(500).send(err.message);
  }
});
//

// Create Post route for user Like the post  //
router.post("/like/:postId", isLoggedIn, async (req, res) => {

  const postId = req.params.postId;
  const userId = req.user._id;

  const existingLike = await likeModel.findOne({
    post: postId,
    user: userId
  });

  if (existingLike) {
    await likeModel.deleteOne({ _id: existingLike._id });
  } else {
    await likeModel.create({
      post: postId,
      user: userId
    });
  }

  // simple redirect instead of JSON
  res.redirect("back");
});
//.....

// * Delete Post route *//
router.post("/deletepost/:id", isLoggedIn, async function (req, res) {
  try {
    const postId = req.params.id;

    // 1. Delete post from Post collection
    await postModel.findByIdAndDelete(postId);

    // 2. Remove post reference from user.posts array
    await userModel.findByIdAndUpdate(req.user._id, {
      $pull: { posts: postId }
    });

    req.flash("success", "Post deleted successfully");
    res.redirect("/profile");

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/profile");
  }
});
//.. 

// * Save the post route *//
router.post("/save/:postId", isLoggedIn, async (req, res) => {

  const user = await userModel.findById(req.user._id);

  const postId = req.params.postId;

  const alreadySaved = user.savedPosts.includes(postId);

  if (alreadySaved) {

    user.savedPosts.pull(postId);

  } else {

    user.savedPosts.push(postId);

  }

  await user.save();

  res.redirect("back");
});
//...

// * Upload Profile Photo route *//
router.post("/upload-dp", isLoggedIn, upload.single("dp"), async function (req, res) {
  try {

    if (!req.file) {
      req.flash("error", "Please select an image for DP");
      return res.redirect("/profile");
    }

    const user = await userModel.findById(req.user._id);

    user.dp = req.file.filename;

    await user.save();

    req.flash("success", "Profile picture updated successfully");
    res.redirect("/profile");

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/profile");
  }
});
//

/* Middleware */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

/* Profile */
router.get("/profile", isLoggedIn, async function (req, res) {

  let user = await userModel
    .findById(req.user._id)
    .populate("posts")
    .populate("savedPosts");

  const postsWithStats = await Promise.all(
    user.posts.map(async (post) => {

      const likeCount = await likeModel.countDocuments({
        post: post._id
      });

      const saveCount = await userModel.countDocuments({
        savedPosts: post._id
      });

      return {
        ...post.toObject(),
        likeCount,
        saveCount
      };
    })
  );

  user = user.toObject();
  user.posts = postsWithStats;

  res.render("profile", { user });
});
// ...

router.get("/saved-posts", isLoggedIn, async function(req, res) {

  const user = await userModel
    .findById(req.user._id)
    .populate("savedPosts");

  res.render("saved-posts", {
    user
  });

});

/* Search Route */
router.get("/search", async function (req, res) {

  const query = req.query.query || "";

  let posts = await postModel
    .find({
      title: { $regex: query, $options: "i" }
    })
    .populate("user");

  const likeModel = require("../models/like");

  posts = await Promise.all(
    posts.map(async (post) => {
      const likeCount = await likeModel.countDocuments({ post: post._id });

      return {
        ...post.toObject(),
        likeCount
      };
    })
  );

  res.render("index", {
    title: "printrest",
    posts,
    query,
    user: req.user
  });
});
//.. 

// ** Post Route * // To open post in seperatly ....//
router.get("/post/:id", async function (req, res) {
  try {

    const post = await postModel.findById(req.params.id).populate("user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const likeCount = await likeModel.countDocuments({
      post: post._id
    });

    let liked = false;
    let saved = false;

    if (req.user) {
      const existingLike = await likeModel.findOne({
        post: post._id,
        user: req.user._id
      });

      liked = !!existingLike;

      const currentUser = await userModel.findById(req.user._id);

      saved = currentUser?.savedPosts?.includes(post._id.toString()) || false;
    }

    res.render("post", {
      post,
      likeCount,
      liked,
      saved,
      user: req.user
    });

  } catch (err) {
    console.log("POST ROUTE ERROR:", err);
    res.status(500).send("Server Error");
  }
});
//...

// * Get Route for  open User profile who posted the image : * //
router.get("/user/:id", isLoggedIn, async function (req, res) {

  const user = await userModel
    .findById(req.params.id)
    .populate("posts");

  if (!user) return res.send("User not found");

  res.render("profile", { user });

});
//....


module.exports = router;