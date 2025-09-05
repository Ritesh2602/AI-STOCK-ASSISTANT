import mongoose from "mongoose";

const NewsSentimentSchema = new mongoose.Schema({
  symbol: String,
  sentiment: String,
  source: String
});

export default mongoose.models.NewsSentiment || mongoose.model("NewsSentiment", NewsSentimentSchema);
