const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
    })
    .then(console.log(`database connected successfully`))
    .catch((error) => {
      console.log("database connection failed");
      console.log(error);
      process.exit(1);
    });
};
module.exports = connectDB;
