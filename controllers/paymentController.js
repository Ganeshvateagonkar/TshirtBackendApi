const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: req.body.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    sessionUrl: session.url,
  });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",

    notes: {
      key1: "value3",
      key2: "value2",
    },
  });
  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});
