import { mongoose, Schema } from "mongoose";
const statsSchema = new Schema({
  users: {
    type: Number,
    default: 0,
  },
  subscription: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Stats = mongoose.model("stats", statsSchema);
export default Stats;
