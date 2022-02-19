const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a name"],
      maxlength: [40, "maximum length of name should be 40 character"],
    },
    email: {
      type: String,
      required: [true, "please provide an email"],
      validate: [validator.isEmail, "please enter an email in correct format"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please provide password"],
      minlength: [6, "minimum length of password should be 6 char"],
      select: false, // when we save user in database and send back that time it not give password field
    },
    role: {
      type: String,
      default: "user",
    },
    photo: {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

//encrypt password before save

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//validate pasword with user passed password
userSchema.methods.isvalidatePassword = async function (userPassedPassword) {
  return await bcrypt.compareSync(userPassedPassword, this.password); //this will return true or false
};

//creating jwt token and return

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//generate forgot password token(string)
userSchema.methods.getForgotPasswordToken = function () {
  //generate long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");
  //getting a hash -make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return forgotToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
