const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

var TokenVerification = function (req, res, next) {
  var { token } = req.headers;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
	next();
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json("Invalid Access Token May be Expired");
  }
};

module.exports = TokenVerification;