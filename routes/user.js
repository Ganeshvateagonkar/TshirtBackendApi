const express = require("express");
const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  manegerAllUsers,
  admingetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

//admin routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), admingetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

//maneger only routes
router
  .route("/maneger/users")
  .get(isLoggedIn, customRole("maneger"), manegerAllUsers);

module.exports = router;
