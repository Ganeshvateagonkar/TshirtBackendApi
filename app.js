const express = require("express");
const morgan = require("morgan");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
//all routes go here
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/paymentRoutes");
const order = require("./routes/orderRoutes");
//for swaggwer documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie and file upload middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
//temp check
app.set("view engine", "ejs");

//morgan middleware
app.use(morgan("tiny"));

//routes middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);
app.get("/signuptest", (req, res) => {
  res.render("signupTest");
});
module.exports = app;
