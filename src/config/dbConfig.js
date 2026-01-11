const mongoose = require("mongoose");

// connect to db
const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
  } catch (err) {
    console.log(`Error @ db connect, error message : ${err?.message}`);
    console.log(`Error @ db connect, error : ${JSON.stringify(err)}`);
  }
};

module.exports = connect;
