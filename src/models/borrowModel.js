const mongoose = require("mongoose");
const { BORROWED, RETURNED } = require("../utils/common");

// borrow schema
const borrowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowedDate: {
      type: Date,
      default: new Date().toISOString(),
    },
    returnedDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.borrowedDate;
        },
        message: "Returned date must be greater than borrowed date!",
      },
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: [BORROWED, RETURNED],
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexes
// schema level compound index on (userId, bookId, bookId)
borrowSchema.index({ userId: 1, bookId: 1, bookId: 1 });

// borrow model
module.exports = new mongoose.model("Borrow", borrowSchema);
