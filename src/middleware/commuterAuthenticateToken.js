// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const commuterAuthenticateToken = (req, res, next) => {
  const token = req.header("AuthorizationCommuter");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.commuter = decoded.commuter;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
module.exports = commuterAuthenticateToken;
