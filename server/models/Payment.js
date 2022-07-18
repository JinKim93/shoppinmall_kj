const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = mongoose.Schema({
    user: {
        type: Array,
        default: [],
    },
    data: {
        type:Array,
        default:[]
    },
    product: {
        type: Array,
        default: []
    }
    
  },  { timestamps: true } //자동으로 등록시간, 업데이트시간 등록됨
);


const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment };
