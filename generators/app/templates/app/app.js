'use strict';

const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csrf = require('csurf');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const http = require('http');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ip = require('ip');
const fs = require('fs');
const io = require('socket.io');
const debug = require('debug')('veritas:server');
const logger = require('morgan');
const rfs = require('rotating-file-stream');
const chalk = require('chalk');
const faker = require('faker');

require('dotenv').config(); // =====================================> dotEnv provides support for our .env file <=============
const app = express(); // ==========================================> Initialize Express <====================================
const env = process.env.NODE_ENV || 'development'; // ==============> Discover environment we are working in <================
const logDirectory = path.join(__dirname, 'log'); // ===============> Log Folder for development runs <=======================

if (env === 'development') { // ====================================> If in dev create log files locally <====================
  fs.existsSync('./log') || fs.mkdirSync('./log');
  const accessLogStream = rfs('access.log', {size: '10M', interval: '1d', compress: 'gzip', path: logDirectory}); // create a rotating write stream - 1d means 1 day (I.E. rotates daily)
  app.use(logger(':method :url RETURNED :status FROM :referrer | :remote-addr [:date[clf]] | THIS TOOK :response-time[digits] MS', {stream: accessLogStream}));
}

app.use(helmet()); // ==============================================> Helmet middleware <=====================================
app.use(bodyParser.urlencoded({extended: false})); // ============> Required for CSRF Protection <============================
app.use(cookieParser()); // ========================================> Cookie Parser Middleware <==============================
app.use(csrf({cookie: true})); // ================================> Let CSRF Use Cookies <====================================

const User = require('./models/User'); // ==========================> Import Models & Schema <============================
const Realtor = require('./models/Realtor');
const TempRealtor = require('./models/tempRealtor');
const Employee = require('./models/Employee');
const Events = require('./models/Events');
const Counters = require('./models/Counters');
const Projects = require('./models/Project');
const Mailroom = require('./models/Mailroom');
const Conversation = require('./models/Conversations');
const Task = require('./models/Task');
const Issue = require('./models/Issue');
const Department = require('./models/Department');
const ServiceArea = require('./models/ServiceArea');

const indexRoute = require('./routes/index'); // ========================> Load Routes <===========================================
const profileRoute = require('./routes/profile');
const adminRoute = require('./routes/admin');
const adminRealtorRoute = require('./routes/adminRealtor');
const adminEmployeeRoute = require('./routes/adminEmployee');
const inboxRoute = require('./routes/inbox');
const clientRoute = require('./routes/client');
const filesRoute = require('./routes/files');
const formsRoute = require('./routes/forms');
const ordersRoute = require('./routes/orders');
const registrationRoute = require('./routes/registration');
const techDeskRoute = require('./routes/techDesk');
const userRoute = require('./routes/user');
const userAuthRoute = require('./routes/userAuth');
const errorSystemRoute = require('./routes/errorSystem');
const serviceAreaAPIRoute = require('./routes/serviceArea');

require('./services/passport')(passport); // =========================> Passport Config <=================================
mongoose.connect(process.env.mongoURI, {useNewUrlParser: true}) // ======> Connect to our Database <==========================
  .then(() => debug(chalk.blue.inverse(' Atlas has shouldered the burden | Database Aloft! '))).catch(err => debug(err));
function shouldCompress(req, res, next) { // =======================> Compression Middleware <================================
  if (req.headers['x-no-compression']) { return false; } // ========> Don't compress responses w/ no-compression header <=====
  return compression.filter(req, res); // ==========================> fallback to standard filter function <==================
}
app.use(compression({threshold: 0, filter: shouldCompress})); // ===============> Compress all responses <=====================
app.use(logger('dev', {// =======================================> Log Errors to console.error via debug <===================
  skip: function(req, res) { return res.statusCode < 400; },
  stream: {write: msg => debug(chalk.red(msg))},
}));
app.use(bodyParser.json()); // =====================================> Body Parser Middleware <=================================
app.use(methodOverride('_method')); // =============================> Method Override Middleware <=============================

const {// =========================================================> Handlebars Helpers & Middleware <========================
  truncate, formatDate, relativeTime, formatUnderscore, formatBoolean, handyString, activePage, dropdownOpen, eSigFont, eSigFontURL, editIcon, curTime, openForm, closeForm, contains, formatSocial, fab, div, _div, colorSwitch, randomNum, logo, formatCap, projectTranslator, eachIndex, eachLast, firstLetter, proximityFriendly, formatCommas, urlSafe, isMoreThan, isEqual, arrayLength,
} = require('./helpers/hbs');
app.engine('.handlebars', exphbs({
  helpers: {
    truncate: truncate, formatDate: formatDate, relativeTime: relativeTime, formatUnderscore: formatUnderscore, formatBoolean: formatBoolean, editIcon: editIcon, handyString: handyString, activePage: activePage, dropdownOpen: dropdownOpen, eSigFont: eSigFont, eSigFontURL: eSigFontURL, curTime: curTime, openForm: openForm, closeForm: closeForm, contains: contains, formatSocial: formatSocial, fab: fab, div: div, _div: _div, colorSwitch: colorSwitch, randomNum: randomNum, logo: logo, formatCap: formatCap, projectTranslator: projectTranslator, eachIndex: eachIndex, eachLast: eachLast, firstLetter: firstLetter, proximityFriendly: proximityFriendly, formatCommas: formatCommas, urlSafe: urlSafe, isMoreThan: isMoreThan, isEqual: isEqual, arrayLength: arrayLength,
  },
  defaultLayout: 'main',
  partialsDir: ['./views/partials/'],
  extname: '.handlebars',
}));
app.set('view engine', 'handlebars');

const sess = {// ==================================================> Create Session Object for Use <==========================
  secret: 'assetCat',
  name: 'AssetCatTheWonderCat',
  resave: false,
  saveUninitialized: false, // =====================================> The line below this is the session store <===============
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {path: '/', httpOnly: true, secure: 'auto', maxAge: 60000 * 60 * 24},
};
app.use(session(sess)); // =========================================> Express session middleware <=============================
app.use(passport.initialize()); // =================================> Passport middleware <====================================
app.use(passport.session());
app.use(flash()); // ===============================================> Flash Messaging / Notification middleware <==============
app.use((req, res, next) => { // ===================================> Set Global Variables <===================================
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.veritasVersion = process.env.VERSION;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: '30 days'})); // ==========> Set static folders <==============

app.use('/', indexRoute); // ==============================================> Use Routes <===========================================
app.use('/profile', profileRoute);
app.use('/admin', adminRoute);
app.use('/aVendor', adminRealtorRoute);
app.use('/aEmployee', adminEmployeeRoute);
app.use('/inbox', inboxRoute);
app.use('/client', clientRoute);
app.use('/files', filesRoute);
app.use('/forms', formsRoute);
app.use('/orders', ordersRoute);
app.use('/reg', registrationRoute);
app.use('/techDesk', techDeskRoute);
app.use('/user', userRoute);
app.use('/userAuth', userAuthRoute);
app.use('/errorSystem', errorSystemRoute);
app.use('/serviceArea', serviceAreaAPIRoute);

app.use((req, res, next) => {
  res.redirect('../../../errorSystem/404'); // =====================> catch 404 and forward to error handler <=================
});

app.use((err, req, res, next) => { // ==============================> Error Handler <==========================================
  res.locals.message = err.message; // =============================> set locals, only providing error in development <========
  res.locals.error = (req.app.get('env') === 'development') ? err : {};
  if (err.code !== 'EBADCSRFTOKEN'){ return next(err); }// ------> Handle CSRF token errors here if not CSURF forward to next middleware
  res.status(403);
  res.redirect('../../../errorSystem/403'); // render the error page
  res.status(err.status || 500);
  res.redirect('../../../errorSystem/500'); // render the error page
  if (!err){ return next(); }
});

module.exports = app;
