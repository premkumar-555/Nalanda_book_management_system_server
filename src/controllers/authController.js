const UserModel = require("../models/userModel");
const { sendResponse } = require("../utils/interceptors");
const logger = require("../utils/logger");

// user signup controller
const userSignupController = async (req, res) => {
  try {
    // 1. Edge cases
    const { name, email, password } = req.body;
    // a) check is user already registered
    const user = await UserModel.findOne({ email: email?.trim() }, { _id: 1 });
    if (user) {
      logger.warn(`user already signedup userId : ${user?._id?.toString()}`);
      return sendResponse(409, { message: "user is already registered!" }, res);
    }
    // b) else allow user signup
    // encrypt user password before save to db
    const newUser = new UserModel({ name, email, password });
    newUser.password = await newUser.getHashedPassword(newUser.password);
    await newUser.save();
    // 3. Next directly provide JWT token to allow direct app access
    const jwtToken = await newUser.createJWTToken({
      id: newUser?._id?.toString(),
    });
    res.cookie("token", jwtToken);
    logger.info("userSignupController: user signup successful");
    const newUserCopy = JSON.parse(JSON.stringify(newUser));
    delete newUserCopy.password;
    return sendResponse(
      200,
      { data: newUserCopy, message: "User signup is successful!" },
      res
    );
  } catch (err) {
    logger.error(`@ user singup, error message : ${err?.message}`);
    logger.error(`@ user singup, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

// user login controller
const userLoginController = async (req, res, next) => {
  try {
    // 1. Edge cases
    // a) check is valid user
    const { email } = req.body;
    const user = await UserModel.findOne(
      { email: email?.trim() },
      { _id: 1, name: 1, email: 1, password: 1, role: 1 }
    );
    if (!user) {
      return sendResponse(
        401,
        { error: true, message: "Invalid credentials!" },
        res
      );
    }
    const { password } = req.body;
    // b) if valid user, verify password with db hash password
    const match = await user.verifyPassword(password, user?.password);
    if (match) {
      // create jwt token
      const jwtToken = await user.createJWTToken({
        id: user?._id,
      });
      res.cookie("token", jwtToken);
      logger.info("userLoginController: user login successful");
      const userCopy = JSON.parse(JSON.stringify(user));
      delete userCopy?.password;
      return sendResponse(
        200,
        { data: userCopy, message: "User login is successful!" },
        res
      );
    } else {
      return sendResponse(
        401,
        { error: true, message: "Invalid credentials!" },
        res
      );
    }
  } catch (err) {
    logger.error(`@ userLoginController, error message : ${err?.message}`);
    logger.error(`@ userLoginController, error : ${JSON.stringify(err)}`);
    return sendResponse(
      500,
      { error: true, message: err?.message || "Something went wrong!" },
      res
    );
  }
};

module.exports = {
  userSignupController,
  userLoginController,
};
