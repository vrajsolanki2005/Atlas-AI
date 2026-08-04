const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const rateLimitMiddleware = require("./middleware/rateLimit");
const healthRoute = require("./routes/healthRoute");
const authRoute = require("./routes/authRoute");
const ApiResponse = require("./utils/apiResponse");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

app.use(session({
  secret: process.env.ENCRYPTION_SECRET || "atlas-session-secret",
  resave: false,
  saveUninitialized: false,
}));

app.use("/", healthRoute);
app.use("/", authRoute);

app.get("/", (req, res) => {
  res.json(ApiResponse.success({}, "Server is running"));
});

module.exports = app;
