const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");
const { campgroundSchema, reviewSchema } = require("../schemas.js");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware.js");
const multer = require('multer')
const { storage} = require('../cloudinary')
const upload = multer({ storage })

const campgrounds = require('../controllers/campgrounds.js')

// router.get("/", (req, res) => {
//     res.render("home");
//   });

router.get("/",catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post(
  "/",
   isLoggedIn,

  upload.array('image'),
  validateCampground,
  catchAsync(campgrounds.createCampground)
  
  
);

router.get( "/:id",catchAsync(campgrounds.showCampground)
);

router.get(
  "/:id/edit", isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm)
);

router.put(
  "/:id",isLoggedIn,isAuthor,  upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground)
);

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

module.exports = router;
