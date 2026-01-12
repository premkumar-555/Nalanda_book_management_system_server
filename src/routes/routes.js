const logger = require("../utils/logger");

// All application routes store
const appRoutes = [
  { path: "/auth", route: require("./authRoute") },
  { path: "/book", route: require("./bookRoute") },
  { path: "/borrow", route: require("./borrowRoute") },
];

// Method to initiate application routes
const initiateAppRoutes = (app) => {
  // setting a global app middleware to log on each api request
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });
  // set application api routes
  appRoutes.forEach(({ path, route }) => {
    if (!!path && !!route) {
      app.use(path, route);
    }
  });
};

module.exports = {
  initiateAppRoutes,
};
