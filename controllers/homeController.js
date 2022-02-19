const bigPromise = require("../middlewares/bigPromise");

exports.Home = bigPromise((req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from api",
  });
});

exports.HomeDummy = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from another dummy routes",
  });
};
