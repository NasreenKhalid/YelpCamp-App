if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review.js");
const exp = require("constants");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const campgrounds  = require('./routes/campgrounds.js')
const reviews  = require('./routes/reviews.js')
const userRoutes  = require('./routes/users.js')
const session = require('express-session')
const User = require('./models/user.js')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
// const dbUrl = process.env.DB_URL;
const MongoStore = require('connect-mongo')

// const dbUrl = "mongodb://localhost:27017/yelp-camp";

const dbUrl = 'mongodb+srv://nasreenkhalid:nasreen123@cluster0.0ln31.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

});

// mongoose.connect(dbUrl, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,

// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())
// app.use(helmet({contentSecurityPolicy:false}))


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'thisshouldbeabettersecret!'
  }
});

// const store = new MongoStore({
//   url: dbUrl,
//   secret:'thisisasecret',
//   touchAfter: 24 * 60 * 60
// })

store.on("error", function(e){
  console.log('SESSOION STORE ERROR', e)
})

const sessionConfig = {
  store:store,
  name:'session',
secret: 'thisisthesecret',
resave: false,
saveUnitialized:true,
cookie: {
  httpOnly:true,
  // secure:true,
  expires: Date.now() + 1000 * 60 *60 * 24 * 7,
  maxAge: 1000 * 60 *60 * 24 * 7
}
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=> {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next();
})

app.use("/", userRoutes)
app.use ("/campgrounds" , campgrounds)
app.use ("/campgrounds/:id/reviews" , reviews)




const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req,res,next) =>{
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  res.render('home')
});



app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no something is wrong";
  res.status(statusCode).render("error", { err });
});

// app.get('/makecampground', async (req,res) => {
//   const camp = new Campground({title:'My Backyard1', description:"cheap camping!!"})
//   await camp.save();
//   res.send(camp)
// })

app.listen(3000, () => {
  console.log("Serving on port 3000 ");
});
