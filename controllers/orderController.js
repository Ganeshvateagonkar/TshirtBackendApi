const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  ); //it will drill down user
  if (!order) {
    next(new customError("please check order id", 401));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });
  if (!order) {
    next(new customError("please check order id", 401));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

//admin routes
exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();
  if (!orders) {
    next(new customError("no order found", 401));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new customError("order is already mark as delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;
  order.orderItems.forEach(async (item) => {
    await updateProductStock(item.product, item.quantity);
  });
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}
