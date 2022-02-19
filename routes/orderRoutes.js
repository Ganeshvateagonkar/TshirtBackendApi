const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOneOrder,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/myorder").get(isLoggedIn, getLoggedInOrders);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
//admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneOrder);

module.exports = router;
