import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is required" });
    }

    const secret = process.env.JWT_SECRET_KEY;

    const decoded = jwt.verify(token, secret);

    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default authMiddleware;
