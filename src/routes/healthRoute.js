const router = require("express").Router();
const ApiResponse = require("../utils/apiResponse");

router.get("/health", (req, res) => {
  res.json(
    ApiResponse.success({
      uptime: process.uptime(),
      timestamp: new Date(),
    }, "OK"),
  );
});

module.exports = router;
