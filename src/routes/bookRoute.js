const express = require("express");
const router = express.Router();
const BookModel = require("../models/bookModel");
const {
  addBookController,
  updateBookController,
  deleteBookController,
} = require("../controllers/bookController");
const {
  userRoleCheck,
  addBookPayloadCheck,
  updateBookPayloadCheck,
  checkValidBookId,
} = require("../middlewares/bookMiddleware");
const { userAuthMiddleware } = require("../middlewares/authMiddleware");

// Add Book route : POST /add
router.post(
  "/add",
  userAuthMiddleware,
  userRoleCheck,
  addBookPayloadCheck,
  addBookController
);

// Update Book route : PATCH /update/:id
router.patch(
  "/update/:id",
  userAuthMiddleware,
  userRoleCheck,
  checkValidBookId,
  updateBookPayloadCheck,
  updateBookController
);

// Delete Book route : DELETE /delete/:id
router.delete(
  "/delete/:id",
  userAuthMiddleware,
  userRoleCheck,
  checkValidBookId,
  deleteBookController
);

module.exports = router;
