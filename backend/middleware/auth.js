const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const crypto = require("crypto");

/**
 * Authenticate the user using the JWT token
 */
const authenticateJWT = async (req, res, next) => {
  // Check for token in the Authorization header
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Authentication token is missing.",
      data: null,
    });
  }

  try {
    // Verify the token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to set your secret

    if (!decoded) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Authentication token is invalid.",
        data: null,
      });
    }

    // Check if the user exists
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The user associated with this token no longer exists.",
        data: null,
      });
    }

    // Set the value of the token, and then hash it with sha256
    const usertok = crypto
      .createHash("sha256")
      .update(decoded.token)
      .digest("hex");

    // Check if the token is valid
    const userToken = await UserToken.findOne({
      user: user._id,
      token: usertok,
    });

    // If the token is not valid, return an error
    if (!userToken) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Authentication token is invalid.",
        data: null,
      });
    }

    // Remove the password from the user object
    user.password = undefined;

    // Attach user information to the request
    req.user = user;

    // Attach the token to the request
    req.user.token = decoded.token;

    next(); // Move to the next middleware or route handler
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Authentication token has expired.",
        data: null,
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Authentication token is invalid.",
        data: null,
      });
    }

    // Log the error
    console.error(err);

    // Handle the error
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong.",
      data: null,
    });
  }
};

/**
 * Check if the user is an admin
 */
const isAdmin = async (req, res, next) => {
  // Check if the user is an admin
  if (!req.user.admin || req.user.admin === false) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "You do not have permission to access this resource.",
      data: null,
    });
  }

  next(); // Move to the next middleware or route handler
};

/**
 * Load the user information
 */
const loadUser = async (req, res, next) => {
  // Check for token in the Authorization header
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    next();
  } else {
    try {
      // Verify the token and get user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to set your secret

      if (!decoded) {
        next();
      }

      // Check if the user exists
      const user = await User.findById(decoded.sub).select("-password");
      if (!user) {
        next();
      } else {
        // Attach user information to the request
        req.user = user;

        next(); // Move to the next middleware or route handler
      }
    } catch (err) {
      next();
    }
  }
};

// Export the middleware
module.exports = {
  authenticateJWT,
  isAdmin,
  loadUser,
};
