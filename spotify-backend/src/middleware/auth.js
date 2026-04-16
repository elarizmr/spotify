const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token yoxdur" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "gizli_kod");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token etibarsızdır" });
  }
};