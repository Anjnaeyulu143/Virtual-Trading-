import express from "express";
import { getUserById, userModel } from "../models/User.js";
import {
  createUserPortfolio,
  getUserPortfolio,
  portfolioModel,
} from "../models/Portfolio.js";
import {
  createTransactionCollections,
  transactionCollectionsModel,
} from "../models/TransactionCollections.js";
import authMiddleware from "../middlewares/auth.js";
import {
  createTradeHistory,
  getTradeHistory,
  tradesHistoryModel,
} from "../models/TradesHistory.js";

const router = express.Router();

export const orderExecution = router.post(
  "/order/execution",
  async (req, res) => {
    const { tickerId, id, type, price, quantity } = req.body;

    const numQuantity = parseInt(quantity);

    const userId = id;

    try {
      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.portfolio) {
        user.portfolio = [];
      }

      if (!user.transactionsHistory) {
        user.transactionsHistory = [];
      }

      if (!user.tradesHistory) {
        user.tradesHistory = [];
      }

      const totalValue = price * numQuantity;

      if (type === "buy") {
        if (user.balance < totalValue) {
          return res.status(400).json({ message: "Insufficient balance" });
        }

        console.log("Before User balance:", user.balance);

        user.balance -= totalValue;

        console.log("After User balance:", user.balance);

        let userPortfolio = await getUserPortfolio({
          userId,
          tickerSymbol: tickerId,
        });

        if (userPortfolio) {
          userPortfolio.averageBuyPrice =
            (userPortfolio.averageBuyPrice * userPortfolio.quantity +
              price * numQuantity) /
            (userPortfolio.quantity + numQuantity);
          userPortfolio.quantity += numQuantity;
          userPortfolio.currentPrice = price;
          userPortfolio.totalValue = userPortfolio.quantity * price;
        } else {
          userPortfolio = await createUserPortfolio({
            userId,
            tickerSymbol: tickerId,
            quantity: numQuantity,
            averageBuyPrice: price,
            currentPrice: price,
            totalValue: price * numQuantity,
            assetType: "crypto",
          });

          user.portfolio.push(userPortfolio);
        }

        await userPortfolio.save();

        // Handle trade history

        let tradeHistory = await getTradeHistory({ userId, status: "open" });

        if (tradeHistory) {
          tradeHistory.entryPrice =
            (tradeHistory.quantity * tradeHistory.entryPrice +
              quantity * price) /
            (tradeHistory.quantity + numQuantity);

          tradeHistory.quantity += numQuantity;
        } else {
          tradeHistory = await createTradeHistory({
            userId,
            tickerId,
            entryPrice: price,
            quantity: numQuantity,
          });
        }

        await tradeHistory.save();
        user.tradesHistory.push(tradeHistory);

        const transaction = await createTransactionCollections({
          userId,
          tickerId,
          type,
          price,
          quantity: numQuantity,
          totalValue,
        });

        console.log("Transaction:", transaction);

        await transaction.save();
        user.transactionsHistory.push(transaction);
        await user.save();

        res.status(201).json({
          message: "Order Executed Successfully",
          data: transaction,
          portfolio: userPortfolio,
          userData: user,
        });
      } else if (type === "sell") {
        console.log("Type:", type);

        const userPortfolio = await getUserPortfolio({
          userId,
          tickerSymbol: tickerId,
        });

        if (!userPortfolio || userPortfolio.quantity < numQuantity) {
          return res
            .status(400)
            .json({ message: "Insufficient assets in portfolio" });
        }

        user.balance += totalValue;

        userPortfolio.quantity -= numQuantity;
        userPortfolio.totalValue = userPortfolio.quantity * price;

        if (userPortfolio.quantity === 0) {
          await userPortfolio.deleteOne({ _id: userPortfolio._id });

          user.portfolio = user.portfolio.filter(
            (id) => !id.equals(userPortfolio._id)
          );

          console.log("User ID", userId);

          const remainingPortfolio = await userModel
            .findById(userId)
            .select("portfolio");

          console.log("Remaining Portfolio", remainingPortfolio);

          if (remainingPortfolio.length === 0) {
            user.portfolio.length = 0;
          }
        } else {
          await userPortfolio.save();
        }

        const tradeHistory = await tradesHistoryModel.findOne({
          userId,
          tickerId,
          status: "open",
        });

        if (tradeHistory) {
          tradeHistory.exitPrice = price;
          tradeHistory.exitDate = new Date();
          tradeHistory.status = "closed";
          await tradeHistory.save();
        } else {
          return res
            .status(400)
            .json({ message: "No open positions found to close" });
        }

        const transaction = await createTransactionCollections({
          userId,
          tickerId,
          type,
          price,
          quantity: numQuantity,
          totalValue,
        });

        await transaction.save();
        user.transactionsHistory.push(transaction);
        await user.save();

        res.status(201).json({
          message: "Order Executed Successfully",
          data: transaction,
          portfolio: userPortfolio,
        });
      } else {
        res.status(400).json({ message: "Invalid Order Type" });
      }
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
);

export const userPortfolio = router.get(
  "/user/portfolio",
  authMiddleware,
  async (req, res) => {
    const userId = req.userId;

    try {
      const portfolioList = await portfolioModel.find({ userId });

      res.status(200).json({
        message: "User Portfolio",
        userId,
        portfolio: portfolioList,
        response: "ok",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export const userTransactionsHistory = router.get(
  "/user/transactions",
  authMiddleware,
  async (req, res) => {
    const userId = req.userId;

    console.log(userId);

    try {
      const transactionList = await transactionCollectionsModel.find({
        userId,
      });

      res.status(200).json({
        message: "Transactions History",
        userId,
        transactions: transactionList,
        response: "ok",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export const updateMarketPrice = router.put(
  "/update/price",
  async (req, res) => {
    const { tickerId, currentPrice, userId } = req.body;

    try {
      const userPortfolio = await getUserPortfolio({
        userId,
        tickerSymbol: tickerId,
      });

      if (!userPortfolio) {
        return res.status(404).json({ message: "User portfolio not found" });
      }

      userPortfolio.currentPrice = currentPrice;
      userPortfolio.totalValue = userPortfolio.quantity * currentPrice;
      await userPortfolio.save();

      res.status(200).json({
        message: "Market price updated successfully",
        portfolio: userPortfolio,
        response: "ok",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export const tradesHistory = router.get(
  "/user/trades",
  authMiddleware,
  async (req, res) => {
    const userId = req.userId;

    try {
      const tradeHistoryList = await tradesHistoryModel.findOne({ userId });
      res.status(200).json({
        data: tradeHistoryList,
        response: "ok",
        message: "TradeHistory fetched successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
