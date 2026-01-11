const express = require("express");
const app = express();
const cors = require("cors");
// initialize environment variables (IMP prior application initialization)
require("dotenv").config();

const port = process.env.PORT || 3000;
const connect = require("./src/config/dbConfig");

// set app cors policies (enabling for All CORS requests)
app.use(cors());

// set app json parser
app.use(express.json());

// for testing purpose *
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// set app api routes

// listen express app
app.listen(port, async () => {
  try {
    await connect();
    console.log(`Server is successfully running on PORT : ${port}`);
  } catch (err) {
    console.log(`Error @ server start, error message : ${err?.message}`);
    console.log(`Error @ server start, error : ${JSON.stringify(err)}`);
  }
});
