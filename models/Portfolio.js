import mongoose from "mongoose";

const portfolioSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assetType: { type: String, enum: ["stock", "crypto"] },
  tickerSymbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averageBuyPrice: { type: Number, required: true },
  currentPrice: { type: Number },
  totalValue: { type: Number },
});

export const portfolioModel = mongoose.model("Portfolio", portfolioSchema);

export const createUserPortfolio = (data) => portfolioModel.create(data);

export const getUserPortfolio = (data) => portfolioModel.findOne(data);
