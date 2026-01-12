const { default: mongoose } = require("mongoose");
const validator = require("validator");
const { isValid } = require("date-fns");
const { checkReqFields, stringTypeLengthCheck } = require("./authMiddleware");
const logger = require("../utils/logger");
const { sendResponse } = require("../utils/interceptors");

// Middleware to check whether user is admin or not
const authorizeUserRole = (allowedUsers = []) => {
  return (req, res, next) => {
    try {
      const { role } = req.userInfo;
      if (!allowedUsers.includes(role)) {
        return sendResponse(403, { message: "Permission denied!" }, res);
      }
      next();
    } catch (err) {
      logger.error(`@ authorizeUserRole, error message : ${err?.message}`);
      logger.error(`@ authorizeUserRole, error : ${JSON.stringify(err)}`);
      return sendResponse(
        500,
        { error: true, message: err?.message || "Something went wrong!" },
        res
      );
    }
  };
};

// Helper to validate required fields
const validateStringFields = (fieldsCheckTypeLength) => {
  fieldsCheckTypeLength.forEach((field) => {
    const checkRes = stringTypeLengthCheck(field);
    if (!!checkRes) {
      return checkRes;
    }
  });
  return null;
};

// Helper to validate string values type and allowed length
const checkStringTypelength = (valuesObj) => {
  let errMsg = null;
  const sourceFields = [
    { field: null, minLength: 1, maxLength: 150, key: "title", text: "Title" },
    {
      field: null,
      minLength: 2,
      maxLength: 100,
      key: "author",
      text: "Author Name",
    },
    {
      field: null,
      minLength: 10,
      maxLength: 13,
      key: "isbn",
      text: "ISBN number",
    },
    { field: null, minLength: 3, maxLength: 30, key: "genre", text: "Genre" },
  ];
  sourceFields
    .filter((el) => {
      if (el.key in valuesObj) {
        el.field = valuesObj[el.key];
        return true;
      }
      return false;
    })
    .forEach((item) => {
      const errInfo = stringTypeLengthCheck(item);
      if (errInfo) {
        errMsg = errInfo;
      }
    });
  return errMsg;
};

// Helper to validate isbn, publishedDate
const checkIsbnPubDate = (isbn, publishedDate) => {
  let errMsg = null;
  if (typeof isbn !== "string" || !validator.isISBN(isbn)) {
    errMsg = "Invalid ISBN!";
  }
  if (typeof publishedDate !== "string" || !isValid(new Date(publishedDate))) {
    errMsg = "Invalid published date!";
  }
  return errMsg;
};

// Middleware to validate add book payload
const addBookPayloadCheck = (req, res, next) => {
  try {
    // payload validations order
    // 1. validate required fields
    const reqStringFields = {
      title: "Title",
      author: "Author",
      isbn: "ISBN",
      publishedDate: "Published Date",
      genre: "Genre",
      totalCopies: "Total copies",
      availableCopies: "Available copies",
    };
    const missingErr = checkReqFields(reqStringFields, req);
    if (missingErr) {
      return sendResponse(401, { error: true, message: missingErr }, res);
    }
    // 2. validate field values
    // a) check string values type and allowed length
    const {
      title,
      author,
      isbn,
      genre,
      totalCopies,
      publishedDate,
      availableCopies,
    } = req.body;
    const tarFieldsObj = { title, author, isbn, genre };
    const stringErr = checkStringTypelength(tarFieldsObj);
    if (stringErr) {
      return sendResponse(401, { error: true, message: stringErr }, res);
    }
    // minimum value check for totalCopies
    let errInfo = null;
    if (typeof totalCopies !== "number" || totalCopies < 0) {
      errInfo = "Total copies should be a valid number with minimum value 0!";
    }
    if (typeof availableCopies !== "number" || availableCopies < 0) {
      return sendResponse(
        400,
        {
          error: true,
          message: `Available copies should be a valid number with minimum value 0!`,
        },
        res
      );
    }
    if (availableCopies > totalCopies) {
      errInfo =
        "Available copies count should be less than or equal to total copies!";
    }
    if (errInfo) {
      return sendResponse(
        400,
        {
          error: true,
          message: errInfo,
        },
        res
      );
    }
    // b) check or validate field values, isbn, publishedDate
    const errMsg = checkIsbnPubDate(isbn, publishedDate);
    if (errMsg) {
      return sendResponse(
        400,
        {
          error: true,
          message: errMsg,
        },
        res
      );
    }
    next();
  } catch (err) {
    logger.error(`@ addBookPayloadCheck, error message : ${err?.message}`);
    logger.error(`@ addBookPayloadCheck, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// Helper to validate editable fields for update book paylod
const checkIsEditabled = (req) => {
  const allowedEditFields = [
    "title",
    "author",
    "isbn",
    "publishedDate",
    "genre",
    "totalCopies",
    "availableCopies",
  ];
  const isEditAllowed = Object.keys(req.body)?.every((item) =>
    allowedEditFields.includes(item)
  );
  return !isEditAllowed ? "Invalid payload!" : null;
};

// Middleware to validate book id at edit or delete route
const checkValidBookId = (req, res, next) => {
  try {
    // validate provided book id
    const bookId = req?.params?.id;
    if (!mongoose.isObjectIdOrHexString(bookId)) {
      return sendResponse(
        400,
        { error: true, message: "Invlid book id!" },
        res
      );
    }
    next();
  } catch (err) {
    logger.error(`@ checkValidBookId, error message : ${err?.message}`);
    logger.error(`@ checkValidBookId, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};
// Middleware to validate update book payload
const updateBookPayloadCheck = (req, res, next) => {
  try {
    // payload validations order
    // 1. validate allowed edit fields
    // 2. validate field values
    // a) string values check if any
    const tarKeys = ["title", "author", "isbn", "genre"];
    const tarStringsObj = {};
    tarKeys.forEach((el) => {
      if (Object.hasOwn(req.body, el)) {
        tarStringsObj[el] = req.body[el];
      }
    });
    const errInfo =
      checkIsEditabled(req) || checkStringTypelength(tarStringsObj) || null;
    if (errInfo) {
      return sendResponse(400, { error: true, message: errInfo }, res);
    }
    // b) validations for totalCopies, isbn, publishedDate if any
    const { totalCopies, isbn, publishedDate, availableCopies } = req.body;
    let errMsg = null;
    if ((totalCopies && typeof totalCopies !== "number") || totalCopies < 0) {
      errMsg = "Total copies should be a valid number with minimum value 0!";
    }
    if (
      (availableCopies && typeof availableCopies !== "number") ||
      availableCopies < 0
    ) {
      errMsg =
        "Available copies copies should be a valid number with minimum value 0!";
    }
    if (totalCopies && availableCopies && availableCopies > totalCopies) {
      errMsg =
        "Available copies count should be less than or equal to total copies!";
    }
    if (isbn && !validator.isISBN(isbn)) {
      errMsg = "Invalid ISBN";
    }
    if (
      (publishedDate && typeof publishedDate !== "string") ||
      !isValid(new Date(publishedDate))
    ) {
      errMsg = "Invalid published date!";
    }
    if (errMsg) {
      return sendResponse(400, { error: true, message: errMsg }, res);
    }
    next();
  } catch (err) {
    logger.error(`@ updateBookPayloadCheck, error message : ${err?.message}`);
    logger.error(`@ updateBookPayloadCheck, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  authorizeUserRole,
  addBookPayloadCheck,
  updateBookPayloadCheck,
  checkValidBookId,
};
