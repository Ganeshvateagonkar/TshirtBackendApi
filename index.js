const app = require("./app");
require("dotenv").config();
const cloudinary = require("cloudinary");
//database connection
const connectDB = require("./config/db");
connectDB();
//cloudinary config goes here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
