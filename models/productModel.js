const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide product name"],
      trim: true,
      maxlength: [120, "product name should not be more than 120 character"],
    },
    price: {
      type: Number,
      required: [true, "please provide product price"],
      maxlength: [6, "product price not be more than 6 digits"],
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
    },
    photos: [
      {
        id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [
        true,
        "please provide category from -short-sleeves,long-sleeves,sweat-shirts,hoodies",
      ],
      enum: {
        values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
        message:
          "please select category ONLY from -short-sleeves,long-sleeves,sweat-shirts,hoodies",
      },
    },
    brand: {
      type: String,
      required: [true, "please provide the brand"],
    },
    stock: {
      type: Number,
      required: [true, "please add a quantity"],
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
