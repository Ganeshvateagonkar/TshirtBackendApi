const express = require("express");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const {
  getAllProducts,
  addProduct,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReviews,
  deleteReviews,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productController.js");

//user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn, addReviews);
router.route("/review").delete(isLoggedIn, deleteReviews);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);
//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);
router
  .route("/admin/produt/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

module.exports = router;
