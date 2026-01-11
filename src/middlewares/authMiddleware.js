const validator = require("validator");
const userModel = require("../models/userModel");
const logger = require("../utils/logger");
const { sendResponse } = require("../utils/interceptors");

// helper to check required fields in req body (assuming all fields are strings)
const checkReqFields = (reqFields, req) => {
  let errMsg = null;
  const absentField = reqFields.find((item) => {
    return req.body[item] === undefined || req.body[item] === "";
  });
  if (absentField) {
    errMsg = `${absentField} is required!`;
  }
  return errMsg;
};

const stringTypeLengthCheck = (item) => {
  let errMsg = null;
  if (
    typeof item?.field !== "string" ||
    !(
      item?.field?.trim()?.length >= item?.minLength &&
      item?.field?.trim()?.length <= item?.maxLength
    )
  ) {
    errMsg = `${item?.text} should be a valid string, with length between ${item?.minLength} to ${item?.maxLength}!`;
  }
  return errMsg;
};

// helper to check user emailId and password values
const checkEmailPasswordValues = (req) => {
  const { email, password } = req.body;
  let errMsg = null;
  const fieldsCheckTypeLength = [
    { field: email, minLength: 5, maxLength: 254, text: "EmailId" },
    {
      field: password,
      minLength: 8,
      maxLength: 128,
      text: "Password",
    },
  ];
  fieldsCheckTypeLength.forEach((item) => {
    const typeLengthCheckRes = stringTypeLengthCheck(item);
    if (typeLengthCheckRes) {
      errMsg = typeLengthCheckRes;
      return;
    } else if (item?.text === "EmailId" && !validator.isEmail(email?.trim())) {
      errMsg = "Invalid EmailId!";
      return;
    } else if (
      item?.text === "Password" &&
      !validator.isStrongPassword(password?.trim())
    ) {
      errMsg = `Weak Password : Password must be at least 8 characters  long \n and include an uppercase letter, \n a lowercase letter, a number, \n and a special character`;
      return;
    }
  });
  return errMsg;
};

// user signup : payload validations
const signupPayloadCheck = (req, res, next) => {
  try {
    // payload validations order
    // 1. check required fields
    // 2. validate field values
    const requiredFields = ["name", "email", "password"];
    const errMsg =
      checkReqFields(requiredFields, req) ||
      stringTypeLengthCheck({
        field: req.body?.name,
        minLength: 2,
        maxLength: 50,
        text: "Name",
      }) ||
      checkEmailPasswordValues(req) ||
      null;

    if (errMsg) {
      return sendResponse(400, { error: true, message: errMsg }, res);
    }
    next();
  } catch (err) {
    logger.error(`@ signupPayloadCheck, error message : ${err?.message}`);
    logger.error(`@ signupPayloadCheck, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// user login : payload validations
const loginPayloadCheck = (req, res, next) => {
  try {
    // payload validations order
    // 1. check required fields
    // 2. validate field values
    const requiredFields = ["email", "password"];
    const errMsg =
      checkReqFields(requiredFields, req) ||
      checkEmailPasswordValues(req) ||
      null;

    if (errMsg) {
      return sendResponse(400, { error: true, message: errMsg }, res);
    }
    next();
  } catch (err) {
    logger.error(`@ loginPayloadCheck, error message : ${err?.message}`);
    logger.error(`@ loginPayloadCheck, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// User Authentication middleware
const userAuthMiddleware = async (req, res, next) => {
  try {
    // 1. check auth token
    const { token } = req.cookies || {};
    if (!token) {
      return sendResponse(401, { error: true, message: "Auth denied!" }, res);
    }
    // verify token, fetch user details if valid token set user info on request object
    const decoded = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!(decoded && decoded?.id)) {
      return sendResponse(401, { error: true, message: "Auth denied!" }, res);
    }
    const user = await userModel.findById(decoded?.id, {
      password: 0,
    });
    if (!user) {
      return sendResponse(401, { error: true, message: "Auth denied!" }, res);
    }
    req.userInfo = user;
    next();
  } catch (err) {
    logger.error(`@ userAuthMiddleware, error message : ${err?.message}`);
    logger.error(`@ userAuthMiddleware, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  signupPayloadCheck,
  loginPayloadCheck,
};
