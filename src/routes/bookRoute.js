const express = require("express");
const router = express.Router();
const BookModel = require("../models/bookModel");
const {
  addBookController,
  updateBookController,
  deleteBookController,
  viewBooksController,
} = require("../controllers/bookController");
const {
  authorizeUserRole,
  addBookPayloadCheck,
  updateBookPayloadCheck,
  checkValidBookId,
} = require("../middlewares/bookMiddleware");
const { userAuthMiddleware } = require("../middlewares/authMiddleware");
const logger = require("../utils/logger");
const ADMIN = "ADMIN";
const MEMBER = "MEMBER";

// Add Book route : POST /add
router.post(
  "/add",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  addBookPayloadCheck,
  addBookController
);

// View Books route : GET /view
router.get(
  "/view",
  userAuthMiddleware,
  authorizeUserRole([ADMIN, MEMBER]),
  viewBooksController
);

// Update Book route : PATCH /update/:id
router.patch(
  "/update/:id",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  checkValidBookId,
  updateBookPayloadCheck,
  updateBookController
);

// Delete Book route : DELETE /delete/:id
router.delete(
  "/delete/:id",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  checkValidBookId,
  deleteBookController
);

module.exports = router;
