const express = require("express");
const { Home, HomeDummy } = require("../controllers/homeController");
const router = express.Router();

router.route("/").get(Home);
router.route("/dummy").get(HomeDummy);

module.exports = router;
