const mongoose = require("mongoose");

// user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER",
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// user model
module.exports = new mongoose.model("User", userSchema);
