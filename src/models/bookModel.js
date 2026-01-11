const mongoose = require("mongoose");

// book schema
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    isbn: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 13,
    },
    publishedDate: { type: Date, required: true },
    genre: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    totalCopies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

// book model
module.exports = new mongoose.model("Book", bookSchema);
