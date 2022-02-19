const User = require("../models/userModel");
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const mailHelper = require("../utils/mailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  //
  if (!req.files) {
    return next(new customError("photo is required for signup", 400));
  }
  const { email, name, password } = req.body;
  if (!email || !email || !password) {
    return next(new customError("email,password and name are required", 400));
  }

  let file = req.files.photo;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: "150",
    crop: "scale",
  });

  const user = await User.create({
    email,
    password,
    name,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  //check for presence of email or password
  if (!email || !password) {
    return next(new customError("please provide email amd password", 400));
  }
  //get user from database
  const user = await User.findOne({ email }).select("+password"); //in module we written select as false so that to compare user password we are taken it from database

  //if user not found in database
  if (!user) {
    return next(new customError("you are not registered", 400));
  }
  //checking password matching or not
  const isPasswordCorrect = await user.isvalidatePassword(password);
  //checking entered password is correct or not

  if (!isPasswordCorrect) {
    return next(new customError("email or password is incorrect", 400));
  }
  //return token to frontend
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logout successfully",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new customError("email not found", 400));
  }
  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false }); //it will save in database
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `copy paste this link in your URL and hit enter \n \n ${myUrl}`;
  try {
    await mailHelper({
      email: user.email,
      subject: "password reset email",
      message,
    });
    res.status(200).json({
      success: true,
      message: "email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new customError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return next(new customError("token is invalid or expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new customError("password and confirmPassword do not match", 400)
    );
  }
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  //sebd a json response or token
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");
  const isCorrectOldPassword = user.isvalidatePassword(req.body.oldPassword);

  if (!isCorrectOldPassword) {
    return next(new customError("old password not matches", 400));
  }
  user.password = req.body.password;
  await user.save();
  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  //add to check email and name receving in body or not
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };
  //check photo is coming or not
  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;
    //deleting photo from cloudinary
    const resp = await cloudinary.uploader.destroy(imageId);
    //uploading new photo to cloudinary
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: "150",
        crop: "scale",
      }
    );
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  //find and update new user
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});
//admin routes
exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});
//geting ome user from admin
exports.admingetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new customError("no user is found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
//update single user

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  //add to check email and name receving in body or not
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //find and update new user
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});
//delete single user from admin
exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("user not found", 400));
  }
  //first delete photo from cloudinary
  const imageId = user.photo.id;
  await cloudinary.uploader.destroy(imageId);

  await user.remove();
  res.status(200).json({
    success: true,
  });
});

//maneger routes
exports.manegerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    users,
  });
});
