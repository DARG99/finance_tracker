const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from the Authorization header


  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach the decoded user data (which includes the user id) to req.user
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Invalid or expired token", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
