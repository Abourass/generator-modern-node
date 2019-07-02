'use strict';

const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const ip = require('ip');
const fs = require('fs');
const debug = require('debug')('<%= appName %>:server');
const logger = require('morgan');
const rfs = require('rotating-file-stream');
const chalk = require('chalk');
<%= appOptionalDependency %>

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
<%= appOptionalModels %>
const indexRoute = require('./routes/index'); // ========================> Load Routes <===========================================
<%= appMongooseBlock %>
function shouldCompress(req, res, next) { // =======================> Compression Middleware <================================
  if (req.headers['x-no-compression']) { return false; } // ========> Don't compress responses w/ no-compression header <=====
  return compression.filter(req, res); // ==========================> fallback to standard filter function <==================
};
app.use(compression({threshold: 0, filter: shouldCompress})); // ===============> Compress all responses <=====================
app.use(logger('dev', {// =======================================> Log Errors to console.error via debug <===================
  skip: function(req, res) { return res.statusCode < 400; },
  stream: {write: msg => debug(chalk.red(msg))},
}));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: '30 days'})); // ==========> Set static folders <==============
app.use('/', indexRoute); // ==============================================> Use Routes <===========================================
app.use((req, res, next) => {
  res.send('404 - Route Not Found'); // =====================> catch 404 and forward to error handler <=================
});
app.use((err, req, res, next) => { // ==============================> Error Handler <==========================================
  res.locals.message = err.message; // =============================> set locals, only providing error in development <========
  res.locals.error = (req.app.get('env') === 'development') ? err : {};
  res.status(403);
  res.send('Error 403'); // render the error page
  res.status(err.status || 500);
  res.send('Error 500'); // render the error page
  if (!err){ return next(); }
});

module.exports = app;
