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

// Helper to prepare filter query to search books
const prepareFilterQuery = (title = "", author = "", genre = "") => {
  // Maintain filters order -> title, author, genre (to use compound index)
  const filterQuery = { $or: [] };
  if (title && title?.trim() !== "") {
    filterQuery["$or"].push({
      title: { $regex: title?.trim(), $options: "i" },
    });
  }
  if (author && author?.trim() !== "") {
    filterQuery["$or"].push({
      author: { $regex: author?.trim(), $options: "i" },
    });
  }
  const isGenreValid =
    (genre && typeof genre === "string" && genre?.trim() !== "") ||
    (genre && Array.isArray(genre) && genre?.length > 0);
  if (isGenreValid) {
    filterQuery["$or"].push({ genre: { $in: genre } });
  }
  return filterQuery?.$or?.length > 0 ? filterQuery : {};
};

// view books controller : /view
const viewBooksController = async (req, res) => {
  try {
    // 1. Extract request query params
    let { title, author, genre } = req.query;
    genre = genre ? genre?.trim() : genre;
    genre = genre?.includes(",")
      ? genre?.split(",")?.map((el) => el?.trim())
      : genre;
    // 2. Prepare filter query
    const filterQuery = prepareFilterQuery(title, author, genre);
    // 3. pagination, limits
    let { page, limit } = req.query;
    limit =
      limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0
        ? parseInt(limit)
        : 50;
    // Limit max default records to 50
    limit = limit > 50 ? 50 : limit;
    page =
      page && !isNaN(parseInt(page)) && parseInt(page) > 0 ? parseInt(page) : 1;
    const offset = (page - 1) * limit;
    const books = await BookModel.find(filterQuery).skip(offset).limit(limit);
    return sendResponse(200, { data: books }, res);
  } catch (err) {
    logger.error(`@ viewBooksController, error message : ${err?.message}`);
    logger.error(`@ viewBooksController, error : ${JSON.stringify(err)}`);
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
  viewBooksController,
};
