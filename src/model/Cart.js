const mongoose = require("mongoose");

let ItemSchema = {
    brands: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brand',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        // min: [1, 'Quantity can not be less then 1.']
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    }
}

const cartSchema = new mongoose.Schema({
    items:[ItemSchema],
    cartPlacedDate: {
        type: Date,
        default: Date.now,
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
    // vendors:{
    //     type:String,
    //     required:true
    // }
});

module.exports = mongoose.model("Cart", cartSchema);
