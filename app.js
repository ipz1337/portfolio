const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const routes = require('./routes');
const compression = require('compression');
const winston = require('winston');
const session = require('express-session');

//command to uninvert colors on windows10
//


dotenv.config();

// Use a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'portvia3' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enable sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Enable all middleware needs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '', 'views')));
app.use(express.json({ limit: '50000mb' }));
app.use(cookieParser());
app.use(compression());

// Use the express-ddos middleware to detect potential DDoS attacks
const ddos = require('ddos-express');

// Use the express-ddos middleware to detect potential DDoS attacks
app.use(ddos({
  errorData: {
    message: 'Too many requests, please try again later',
    code: 429
  }
}));


app.use('/', routes);

// Handle all errors with logger
app.use(function(err, req, res, next) {
  // Log the error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Set the status and message for the error
  res.status(err.status || 500);
  res.locals.message = err.message;
  console.log(err);
  // send the error msg
  res.send(`<h1>${err.message}</h1>`);
});

// Set NODE_ENV to production
app.set('env', 'production');

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server started on port ${server.address().port}`);
});
