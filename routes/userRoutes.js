import express from "express";
import {
  createUser,
  getUser,
  getUserBalance,
  getUserById,
} from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authMiddleware from "../middlewares/auth.js";

dotenv.config();

const router = express.Router();

export const userRouter = router.get("/user", (req, res) => {
  res.send({ status: 200, message: "user route" });
});

// Sign Up Router

export const userSignUpRouter = router.post("/signup", async (req, res) => {
  const { username, email } = req.body;

  console.log(username, email);

  if (!username || !email) {
    return res.send(400);
  }

  try {
    const existingUser = await getUser(email);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await createUser({ username, email });

    const access_token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY
    );

    res.status(201).json({
      data: newUser,
      access_token,
      message: "Account Created Successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Router

router.use(cookieParser());

export const userLoginRouter = router.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const isUserExist = await getUser(email);

    if (!isUserExist) {
      return res.status(404).json({ error: "User not found" });
    }

    const access_token = jwt.sign(
      { email: isUserExist.email, id: isUserExist._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      expiresIn: "1d",
    });

    res.status(200).json({
      data: isUserExist,
      accessToken: access_token,
      message: "User Logged in successfully!",
    });
  } catch (err) {
    res.send(500).json({ message: err.message });
  }
});

// User Info Router

export const userInfoRouter = router.get(
  "/user/info",
  authMiddleware,
  async (req, res) => {
    const id = req.userId;

    if (!id) {
      res.status(404).json({ message: "Invalid Credentials" });
    }

    try {
      const user = await getUserById(id);
      res.status(200).json({
        data: user,
        message: "Successfully retrieved user data",
        response: "ok",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// User Balance Router

export const userBalanceRouter = router.get(
  "/balance",
  authMiddleware,
  async (req, res) => {
    const id = req.userId;

    if (!id) {
      res.status(404).json({ message: "Invalid Credentials" });
    }

    try {
      const userBalance = await getUserBalance(id);

      console.log(userBalance);

      res.status(200).json({
        balance: userBalance,
        message: "Successfully retrieved user balance",
        response: "ok",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// User Portfolio Router

export const userPortfolioRouter = router.get("/portfolio", (req, res) => {
  res.send({ status: 200, message: "portfolio route" });
  console.log("User Portfolio Retrieved Successfully!");
});
