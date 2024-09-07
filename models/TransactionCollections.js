import mongoose from "mongoose";

const TransactionCollectionsSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  tickerId: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  totalValue: { type: Number, required: true },
});

export const transactionCollectionsModel = mongoose.model(
  "TransactionCollections",
  TransactionCollectionsSchema
);

export const createTransactionCollections = (data) =>
  transactionCollectionsModel.create(data);
