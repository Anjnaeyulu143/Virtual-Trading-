import express from "express";
import cors from "cors";
import {
  userBalanceRouter,
  userInfoRouter,
  userLoginRouter,
  userPortfolioRouter,
  userRouter,
  userSignUpRouter,
} from "./routes/userRoutes.js";
import mongoose from "mongoose";
import {
  orderExecution,
  tradesHistory,
  updateMarketPrice,
  userPortfolio,
  userTransactionsHistory,
} from "./routes/tradesRoute.js";
const app = express();

const MONGOOSE_URL =
  "mongodb+srv://Azax:DeKZ8WLpSELZxWk2@cluster0.9h792.mongodb.net/virtual_trading_db";

const connectMongodb = async () => {
  try {
    await mongoose.connect(MONGOOSE_URL);
    console.log("Connected to MongoDB successfully", mongoose.connection.host);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

connectMongodb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ message: "Hello" });
});

// User routes

app.use("/api/v1", userRouter);
app.use("api/v1", userSignUpRouter);
app.use("/api/v1", userLoginRouter);
app.use("/api/v1", userInfoRouter);
app.use("/api/v1", userBalanceRouter);

// Trade Routes

app.use("/api/v1", orderExecution);
app.use("/api/v1", userPortfolio);
app.use("/api/v1", userTransactionsHistory);
app.use("/api/v1", tradesHistory);
app.use("/api/v1", updateMarketPrice);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
