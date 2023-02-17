const mongoose = require("mongoose");
let Items = {
    Products: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product_Variation',
        required: true
    },
    
    quantity: {
        type: Number,
        required: true,
        },
    price: {
        type: Number,
        default: 0,
           },
    total: {
        type: Number,
        default: 0,
           }
}
const RfqSchema = new mongoose.Schema({
    items:[Items],
    RfqDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["processing", "Completed"],
        default: "processing",
      },
    subTotal:{
        default: 0,
        type: Number
    },
    CustomerID: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
  
});
module.exports = mongoose.model("Rfq", RfqSchema);
