// Packages
const Sentry = require("@sentry/node");
const express = require("express");
const markio = require("markio");
const rateLimit = require("express-rate-limit");
const mongoStore = require("rate-limit-mongo");
const helmet = require("helmet");
const fs = require("fs");
const chalk = require("chalk");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { getVersion } = require("./utils/general");
const path = require("path");

// Scripts
const { createAdminUser } = require("./scripts/createAdminUser"); // Create the admin user

// Load environment variables
require("dotenv").config();

// Create the Express app
const app = express();
const port = process.env.APP_PORT || 3000;

// Connect to MongoDB
require("./db");
const { DB_URI, DB_NAME } = require("./db");

app.set("trust proxy", true);
app.use(express.static("public"));

// Sentry
Sentry.init({
  dsn: "https://5194a9dd607da159b03d6e8398041032@o4504137778659328.ingest.sentry.io/4505800043528192",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({
      tracing: true,
    }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({
      app,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!,
});

// Trace incoming requests
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-For"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  store: new mongoStore({
    uri: DB_URI,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME,
    },
    expireTimeMs: 60 * 1000,
    errorHandler: console.error.bind(null, "rate-limit-mongo"),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per windowMs
  message: {
    status: "error",
    code: 429,
    message: "Too many requests, please try again later.",
    data: {
      retryAfter: 60,
    },
  },
});

// Apply the rate limiter to all requests
app.use(limiter);

// Middleware for IP logging
app.use((req, res, next) => {
  // Model
  const RequestLog = require("./models/RequestLog");

  // Headers
  var headers = req.headers;

  // Convert headers to object for easier manipulation and so we don't modify the original headers
  headers = Object.assign({}, headers);

  // Remove sensitive headers
  delete headers["cookie"];
  delete headers["authorization"];

  // IP address
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const requestLog = new RequestLog({
    ip: ip,
    method: req.method,
    url: req.url,
    headers: headers,
  });

  requestLog.save();
  console.log(
    chalk.green(`📝 Request logged from ${ip} for ${req.url} | ${req.method}`)
  );

  next();
});

// Disable X-Powered-By header
app.use(helmet.hidePoweredBy());

// Enable XSS filtering
app.use(markio.markioMiddleware);

// Default the request body as json
app.use(express.json());
// Used to parse the form data that is sent to the server
app.use(express.urlencoded({ extended: true }));

// Load the controllers
const PostController = require("./controllers/PostController");
const LikeController = require("./controllers/LikeController");
const MessageController = require("./controllers/MessageController");
const AuthController = require("./controllers/AuthController");
const FollowController = require("./controllers/FollowController");
const UserController = require("./controllers/UserController");
const CommentController = require("./controllers/CommentController");
const NotificationController = require("./controllers/NotificationController");
const ReportController = require("./controllers/ReportController");

// Setup the routes
app.use("/api/v1/posts", PostController);
app.use("/api/v1/likes", LikeController);
app.use("/api/v1/messages", MessageController);
app.use("/api/v1/auth", AuthController);
app.use("/api/v1/follows", FollowController);
app.use("/api/v1/users", UserController);
app.use("/api/v1/comments", CommentController);
app.use("/api/v1/notifications", NotificationController);
app.use("/api/v1/reports", ReportController);

// Swagger documentation
const options = require("./configs/swagger");
const specs = swaggerJsdoc(options);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "The requested resource could not be found.",
    data: null,
  });
});

// Start listening for requests
app.listen(port, () => {
  // Display the Camphouse logo
  try {
    const currentPath = path.dirname(__filename);
    const logoPath = path.join(currentPath, "logo.txt");
    const camphouseLogo = fs.readFileSync(logoPath, "utf8");
    console.log(chalk.green(camphouseLogo));
  } catch (err) {
    console.log(chalk.green("🏕️ Camphouse"));
  }

  // Create the admin user
  createAdminUser();

  // Show the version number and the port that the app is running on
  console.log(
    chalk.green(`🎉 Camphouse version ${getVersion()} is now running!`)
  );
  console.log(
    chalk.green(`✨ Camphouse's API is now running and listening at`)
  );
  console.log(chalk.yellow(`🌍 http://localhost:${port}`));
  console.log(chalk.yellow(`📚 API docs at http://localhost:${port}/api/docs`));
});
