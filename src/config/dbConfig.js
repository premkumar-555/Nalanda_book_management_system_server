const mongoose = require("mongoose");

// connect to db
const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
  } catch (err) {
    logger.error(`@ db connect, error message : ${err?.message}`);
    logger.error(`@ db connect, error : ${JSON.stringify(err)}`);
  }
};

module.exports = connect;
