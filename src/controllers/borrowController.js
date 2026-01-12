const { formatISO } = require("date-fns");
const BookModel = require("../models/bookModel");
const BorrowModel = require("../models/borrowModel");
const { sendResponse } = require("../utils/interceptors");
const logger = require("../utils/logger");
const { BORROWED, RETURNED } = require("../utils/common");

// borrow new book controller : /create
const borrowBookController = async (req, res) => {
  try {
    // Handle edge cases
    // 1. check borrow record already exists for ids and status = 'BORROWED'
    const { userId, bookId, status } = req.body;
    // IMP : filter params order -> userId, bookId, status to use compound index
    const tarRecord = await BorrowModel.findOne(
      {
        userId,
        bookId,
        status: BORROWED,
      },
      { _id: 1 }
    );
    if (tarRecord) {
      logger.warn("Already borrowed the book!");
      return sendResponse(409, { message: "Already borrowed the book!" }, res);
    }
    // 2. Check book is avaialble
    const availableCopies = await BookModel.findOne(
      {
        $and: [{ _id: bookId }, { availableCopies: { $gt: 0 } }],
      },
      {
        _id: 1,
      }
    );
    if (!availableCopies) {
      logger.warn("Book is not available to borrow!");
      return sendResponse(409, { message: "Book is not available!" }, res);
    }
    // 3. Else allow to borrow book
    const newBorrow = new BorrowModel({
      userId,
      bookId,
      status: BORROWED,
    });
    await newBorrow.save();
    // 4. On creating borrow, update available copies of the book
    const updateRes = await BookModel.findByIdAndUpdate(
      bookId,
      {
        $inc: { availableCopies: -1 },
      },
      { new: true, select: { availableCopies: 1 } }
    );
    logger.info(
      `user : ${userId}, borrowed book : ${bookId}, remaining copies : ${updateRes?.availableCopies}`
    );
    return sendResponse(
      200,
      { data: newBorrow, message: "Successfully borrowed the book!" },
      res
    );
  } catch (err) {
    logger.error(`@ borrowBookController, error message : ${err?.message}`);
    logger.error(`@ borrowBookController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// Return borrowed Book controller : /return
const returnBookController = async (req, res) => {
  try {
    // 1. Return book if it is borrowed already by the user
    // IMP : filter params order -> userId, bookId, status to use compound index
    const { userId, bookId } = req.body;
    const returnRes = await BorrowModel.findOneAndUpdate(
      {
        userId,
        bookId,
        status: BORROWED,
      },
      { status: RETURNED, returnedDate: formatISO(new Date()) },
      { new: true, select: { _id: 1 } }
    );
    if (!returnRes) {
      logger.warn(
        `Borrowed record not found for book : ${bookId}, user : ${userId}`
      );
      return sendResponse(409, { message: "Borrowed record not found!" }, res);
    }
    // 2. On successful return update book info details
    const updateBookInfo = await BookModel.findByIdAndUpdate(
      bookId,
      { $inc: { availableCopies: 1 } },
      { new: true, select: { availableCopies: 1 } }
    );
    if (updateBookInfo) {
      logger.info(
        `updated book details of book : ${bookId}, available copies : ${updateBookInfo?.availableCopies}`
      );
      return sendResponse(
        200,
        { message: "Successfully returned the book!" },
        res
      );
    }
  } catch (err) {
    logger.error(`@ returnBookController, error message : ${err?.message}`);
    logger.error(`@ returnBookController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// View borrowed history controller : /view/history
const viewBorrowHistoryController = async (req, res) => {
  try {
    const { userId } = req?.params || {};
    const borrowHistory = await BorrowModel.find({ userId }).populate("bookId");
    return sendResponse(200, { data: borrowHistory }, res);
  } catch (err) {
    logger.error(
      `@ viewBorrowHistoryController, error message : ${err?.message}`
    );
    logger.error(
      `@ viewBorrowHistoryController, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  borrowBookController,
  returnBookController,
  viewBorrowHistoryController,
};
