import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  balance: { type: Number, default: 1000000 },
  portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" }],
  transactionsHistory: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TransactionCollections" },
  ],
  tradesHistory: [
    { type: mongoose.Schema.Types.ObjectId, re: "TradesHistory" },
  ],
});

export const userModel = mongoose.model("User", userSchema);

export const getUser = (email) => userModel.findOne({ email });

export const createUser = (data) => userModel.create(data);

export const getUserById = (id) => userModel.findById(id);

export const getUserBalance = async (id) => {
  const user = await userModel.findById(id);
  return user.balance;
};

export const userPortfolio = async (id) => {
  const user = await userModel.findById(id);
  return user.portfolio;
};

export const userTransactions = async (id) => {
  const user = await userModel.findById(id);
  return user.transactions;
};
