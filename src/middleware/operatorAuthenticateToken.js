const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("AuthorizationOperator");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, "secretKey");
    req.operator = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
