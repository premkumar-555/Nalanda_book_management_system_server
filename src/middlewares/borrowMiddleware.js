const { isObjectIdOrHexString } = require("mongoose");
const { checkReqFields } = require("./authMiddleware");
const UserModel = require("../models/userModel");
const BookModel = require("../models/bookModel");
const logger = require("../utils/logger");
const { sendResponse } = require("../utils/interceptors");

// helper to validate userId and bookId
const checkUserNBookIds = async (userId = "", bookId = "") => {
  if (!(userId && bookId)) return null;
  const user = await UserModel.findById(userId, { _id: 1 });
  const book = await BookModel.findById(bookId, { _id: 1 });
  return !(user && book) ? "Invalid bookId or userId!" : null;
};

// validate create borrow payload : /create
const validateBorrowOrReturnPayload = async (req, res, next) => {
  try {
    // payload validation order
    // 1. Check required fields
    // 2. Validate field values
    const requiredFields = {
      userId: "UserID",
      bookId: "BookID",
    };
    const { userId, bookId } = req.body;
    const reqCheckRes = checkReqFields(requiredFields, req);
    let errMsg = reqCheckRes
      ? reqCheckRes
      : !isObjectIdOrHexString(userId)
      ? "Invalid UserID!"
      : !isObjectIdOrHexString(bookId)
      ? "Invalid BookID!"
      : null;
    if (errMsg) {
      return sendResponse(400, { error: true, message: errMsg }, res);
    }
    // 3. Also validate userId and bookId are exists in db
    const idsCheckErr = await checkUserNBookIds(userId, bookId);
    if (idsCheckErr) {
      return sendResponse(400, { error: true, message: idsCheckErr }, res);
    }
    next();
  } catch (err) {
    logger.error(
      `@ validateBorrowOrReturnPayload, error message : ${err?.message}`
    );
    logger.error(
      `@ validateBorrowOrReturnPayload, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// middleware to validate borrow id
const validateBorrowId = (req, res, next) => {
  try {
    const { id } = req?.params;
    if (!isObjectIdOrHexString(id)) {
      return sendResponse(
        400,
        { error: true, message: "Invalid borrow ID!" },
        res
      );
    }
    next();
  } catch (err) {
    logger.error(`@ validateBorrowId, error message : ${err?.message}`);
    logger.error(`@ validateBorrowId, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// middleware to validate view borrow history payload
const validateViewBorrowHisoryPayload = async (req, res, next) => {
  try {
    // validate userId param
    const { userId } = req?.params || {};
    if (
      !userId ||
      !isObjectIdOrHexString(userId) ||
      !(await UserModel.findById(userId, { _id: 1 }))
    ) {
      return sendResponse(
        400,
        { error: true, message: "Invalid user ID!" },
        res
      );
    }
    next();
  } catch (err) {
    logger.error(
      `@ validateViewBorrowHisoryPayload, error message : ${err?.message}`
    );
    logger.error(
      `@ validateViewBorrowHisoryPayload, error : ${JSON.stringify(err)}`
    );
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  validateBorrowId,
  validateBorrowOrReturnPayload,
  validateViewBorrowHisoryPayload,
};
