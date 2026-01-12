const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ADMIN, MEMBER } = require("../utils/common");

// user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 128,
    },
    role: {
      type: String,
      enum: [ADMIN, MEMBER],
      default: MEMBER,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// schema methods
// 1. To encrypt user password
userSchema.methods.getHashedPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, 10);
};
// 2. To compare user password
userSchema.methods.verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 3. To get JWT access token
userSchema.methods.createJWTToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "1d",
  });
  return token;
};

// user model
module.exports = new mongoose.model("User", userSchema);
