import { mongoose, Schema } from "mongoose";
const paymentSchema = new Schema({
  razorpay_signature: {
    type: "string",
    required: true,
  },
  razorpay_payment_id: {
    type: "string",
    required: true,
  },
  razorpay_subscription_id: {
    type: "string",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Payment = mongoose.model("payment", paymentSchema);
export default Payment;
