const express = require("express");
const { userAuthMiddleware } = require("../middlewares/authMiddleware");
const { authorizeUserRole } = require("../middlewares/bookMiddleware");
const { ADMIN, MEMBER } = require("../utils/common");
const BorrowModel = require("../models/borrowModel");
const {
  viewMostBorrowedBooksController,
  viewMostActiveMembersController,
  viewBooksSummaryController,
} = require("../controllers/reportsController");
const bookModel = require("../models/bookModel");
const router = express.Router();

// View Most Borrowed Books report route : GET /books/mostBorrowed
router.get(
  "/books/mostBorrowed",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  viewMostBorrowedBooksController
);

// View Most Active Members report route : GET /members/mostActive
router.get(
  "/members/mostActive",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  viewMostActiveMembersController
);

// View Book Availability summary report route : GET /books/availabilitySummary
router.get(
  "/books/availabilitySummary",
  userAuthMiddleware,
  authorizeUserRole([ADMIN]),
  viewBooksSummaryController
);

module.exports = router;
