const express = require("express");
const { userAuthMiddleware } = require("../middlewares/authMiddleware");
const { authorizeUserRole } = require("../middlewares/bookMiddleware");
const BorrowModel = require("../models/borrowModel");
const {
  borrowBookController,
  returnBookController,
  viewBorrowHistoryController,
} = require("../controllers/borrowController");
const {
  validateBorrowOrReturnPayload,
  validateBorrowId,
  validateViewBorrowHisoryPayload,
} = require("../middlewares/borrowMiddleware");
const { ADMIN, MEMBER } = require("../utils/common");
const router = express.Router();

// Borrow Book route: POST /create
router.post(
  "/create",
  userAuthMiddleware,
  authorizeUserRole([ADMIN, MEMBER]),
  validateBorrowOrReturnPayload,
  borrowBookController
);

// Return borrowed Book route : POST /return
router.post(
  "/return",
  userAuthMiddleware,
  authorizeUserRole([ADMIN, MEMBER]),
  validateBorrowOrReturnPayload,
  returnBookController
);

// View borrowed history route : POST /view/history/:userId
router.get(
  "/view/history/:userId",
  userAuthMiddleware,
  authorizeUserRole([ADMIN, MEMBER]),
  validateViewBorrowHisoryPayload,
  viewBorrowHistoryController
);

module.exports = router;
