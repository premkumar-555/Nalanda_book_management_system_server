const BookModel = require("../models/bookModel");
const BorrowModel = require("../models/borrowModel");
const { sendResponse } = require("../utils/interceptors");
const logger = require("../utils/logger");

// Most Borrowed Books report controller : /books/mostBorrowed
const viewMostBorrowedBooksController = async (req, res) => {
  try {
    // most borrowed books summay report
    // 1. group borrow records by bookId
    // 2. compute total count for each group
    // 3. sort the count in descending order.
    // 4. populate book details
    const booksBorrowReport = await BorrowModel.aggregate([
      { $group: { _id: "$bookId", totalBorrows: { $sum: 1 } } },
      { $sort: { totalBorrows: -1 } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          book: {
            $ifNull: ["$book", "$_id"],
          },
        },
      },
      { $project: { _id: 0 } },
    ]);
    return sendResponse(200, { data: booksBorrowReport }, res);
  } catch (err) {
    logger.error(
      `@ viewMostBorrowedBooksController, error message : ${err?.message}`
    );
    logger.error(
      `@ viewMostBorrowedBooksController, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

const viewMostActiveMembersController = async (req, res) => {
  try {
    // most borrowed books summay report
    // 1. group borrow records by userId
    // 2. compute total count for each group
    // 3. sort the count in descending order.
    const membersBorrowReport = await BorrowModel.aggregate([
      { $group: { _id: "$userId", totalBorrows: { $sum: 1 } } },
      { $sort: { totalBorrows: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0 } },
    ]);
    return sendResponse(200, { data: membersBorrowReport }, res);
  } catch (err) {
    logger.error(
      `@ viewMostActiveMembersController, error message : ${err?.message}`
    );
    logger.error(
      `@ viewMostActiveMembersController, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

const viewBooksSummaryController = async (req, res) => {
  try {
    // fetch total summary => total books, borrowed books, available books
    const booksAvailabilitySummary = await BookModel.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: "$totalCopies" },
          totalAvailableBooks: { $sum: "$availableCopies" },
        },
      },
      {
        $project: {
          _id: 0,
          totalBooks: 1,
          totalAvailableBooks: 1,
          totalBorrowedBooks: {
            $subtract: ["$totalBooks", "$totalAvailableBooks"],
          },
        },
      },
    ]);
    const resData = booksAvailabilitySummary[0]
      ? booksAvailabilitySummary[0]
      : {
          totalBooks: 0,
          totalAvailableBooks: 0,
          totalBorrowedBooks: 0,
        };
    return sendResponse(200, { data: resData }, res);
  } catch (err) {
    logger.error(
      `@ viewBooksSummaryController, error message : ${err?.message}`
    );
    logger.error(
      `@ viewBooksSummaryController, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  viewMostBorrowedBooksController,
  viewMostActiveMembersController,
  viewBooksSummaryController,
};
