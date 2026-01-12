const BookModel = require("../models/bookModel");
const { sendResponse } = require("../utils/interceptors");
const logger = require("../utils/logger");

// add book controller : /add
const addBookController = async (req, res) => {
  try {
    // Edge cases
    // a) check is already added
    const { isbn } = req.body;
    const book = await BookModel.findOne({ isbn }, { _id: 1 });
    if (book) {
      logger.warn("Book already exists");
      return sendResponse(409, { message: "Book already exists!" }, res);
    }
    const {
      title,
      author,
      publishedDate,
      genre,
      totalCopies,
      availableCopies,
    } = req.body;
    const newBook = BookModel({
      title,
      isbn,
      author,
      publishedDate,
      genre,
      totalCopies,
      availableCopies,
    });
    await newBook.save();
    return sendResponse(
      200,
      { data: newBook, message: "Successfully added book details!" },
      res
    );
  } catch (err) {
    logger.error(`@ addBookController, error message : ${err?.message}`);
    logger.error(`@ addBookController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// udpate book controller : /update/:id
const updateBookController = async (req, res) => {
  try {
    const updateRes = await BookModel.findByIdAndUpdate(
      req?.params?.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (updateRes) {
      return sendResponse(
        200,
        { data: updateRes, message: "Successfully updated book details!" },
        res
      );
    } else {
      logger.warn("Book not found!");
      return sendResponse(
        409,
        { data: updateRes, message: "Book not found!" },
        res
      );
    }
  } catch (err) {
    logger.error(`@ updateBookController, error message : ${err?.message}`);
    logger.error(`@ updateBookController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// udpate book controller : /update/:id
const deleteBookController = async (req, res) => {
  try {
    const deleteRes = await BookModel.findByIdAndDelete(req?.params?.id);
    if (deleteRes) {
      return sendResponse(200, { message: "Successfully deleted book!" }, res);
    } else {
      logger.warn("Book not found!");
      return sendResponse(409, { message: "Book not found!" }, res);
    }
  } catch (err) {
    logger.error(`@ updateBookController, error message : ${err?.message}`);
    logger.error(`@ updateBookController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  addBookController,
  updateBookController,
  deleteBookController,
};
