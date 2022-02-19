const BigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];
  if (!req.files) {
    return next(new customError("images are required", 401));
  }
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalCountProduct = await Product.countDocuments(); //this is used to count document
  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();
  let products = await productsObj.base;
  const filterProductNumber = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filterProductNumber,
    totalCountProduct,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("no product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addReviews = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (alreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //save
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

exports.deleteReviews = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );

  const numOfReviews = reviews.length;

  //adjust ratings
  product.ratings =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  //update the product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//admin routes

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new customError("no product found with this id", 401));
  }
  const imageArray = [];
  if (req.files) {
    //destory the existing images
    for (let index = 0; index < product.photos.length; index++) {
      const resp = await cloudinary.uploader.destroy(product.photos[index].id);
    }
    //upload and save images

    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = imageArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new customError("no product found with this id", 401));
  }

  //destory the existing images
  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "product delered successfully",
  });
});
