const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// initialize environment variables (IMP prior application initialization)
require("dotenv").config();

const port = process.env.PORT || 3000;
const connect = require("./src/config/dbConfig");
const { initiateAppRoutes } = require("./src/routes/routes");
const logger = require("./src/utils/logger");

// set app cors policies (enabling for All CORS requests)
app.use(cors());

// set app cookie-parser
app.use(cookieParser());

// set app json parser
app.use(express.json());

// set app routes
initiateAppRoutes(app);

// listen express app
app.listen(port, async () => {
  try {
    await connect();
    logger.info(`Server is successfully running on PORT : ${port}`);
  } catch (err) {
    logger.error(`@ server start, error message : ${err?.message}`);
    logger.error(`@ server start, error : ${JSON.stringify(err)}`);
  }
});
