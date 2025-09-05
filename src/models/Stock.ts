import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  symbol: String,
  price: Number
});

export default mongoose.models.Stock || mongoose.model("Stock", StockSchema);
