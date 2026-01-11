const express = require("express");
const router = express.Router();

const {
  signupPayloadCheck,
  loginPayloadCheck,
} = require("../middlewares/authMiddleware");
const UserModel = require("../models/userModel");
const {
  userSignupController,
  userLoginController,
} = require("../controllers/authController");

// user signup : POST : /signup
router.post("/signup", signupPayloadCheck, userSignupController);

// user login : POST : /login
router.post("/login", loginPayloadCheck, userLoginController);

module.exports = router;
