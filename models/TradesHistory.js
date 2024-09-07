import mongoose from "mongoose";

const tradesHistory = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tickerId: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  quantity: { type: Number, required: true },
  entryDate: { type: Date, default: Date.now },
  exitDate: { type: Date },
  status: { type: String, enum: ["open", "closed"], default: "open" },
});

export const tradesHistoryModel = mongoose.model(
  "TradesHistory",
  tradesHistory
);

export const createTradeHistory = (data) => tradesHistoryModel.create(data);

export const getTradeHistory = (data) => tradesHistoryModel.findOne(data);
