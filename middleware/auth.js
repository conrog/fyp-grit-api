const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    console.log("Make sure request has correct headers");
    return res.status(403).send("Invalid Token");
  }
  try {
    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).send("Token is Invalid");
  }
  return next();
};

module.exports = verifyToken;
