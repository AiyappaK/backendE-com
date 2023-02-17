const RFQ = require("../../model/Rfq");
const Product_Variation = require("../../model/products/Variation");
const Customer = require("../../model/Customer");

let RfqModel = async (i) => {
    const newRfq = await RFQ.find().populate({
        path: "items.Products",
        select: "productName price total"
    })
    return newRfq[i];
}

exports.AddNewRfq = async (req, res) => {

    const productID = req.body.productId;
    const quantity = Number.parseInt(req.body.quantity);
    const CustomerI = req.body.CustomerID;

    let Rfq = await RFQ.find()
    const indexcystFound = Rfq.findIndex(item => item.CustomerID == CustomerI);
    console.log("indexcystFound",indexcystFound)

    console.log("CustomerI",CustomerI)
    try {
        let Rfq = await RfqModel(indexcystFound)
        console.log('rfds', Rfq)
        let customer = await RFQ.findOne({
            CustomerID: CustomerI
        }).populate('CustomerID');

        console.log("customer",customer)

        let productDetails = await Product_Variation.findById(productID);
        let customerDetails = await Customer.findById(CustomerI);
        // console.log(productDetails, customerDetails)
        if (!productDetails || !customerDetails) {
            return res.status(500).json({
                type: "Not Found",
                msg: "Invalid request"
            })
        }

        if (customer) {

            const indexFound = Rfq.items.findIndex(item => item.Products._id == productID);
            console.log("indexFound",indexFound)
            // check if index found and less than zero remove items reduce that quantity
            if (indexFound !== -1) {
                Rfq.items[indexFound].quantity = Rfq.items[indexFound].quantity + quantity;

            }

            else if (quantity > 0) {
                Rfq.items.push({
                    Products: productID,
                    quantity: quantity,

                })

            }

            else {
                return res.status(400).json({
                    type: "Invalid",
                    msg: "Invalid request"
                })
            }
            
            console.log("data",Rfq);
            let data = await Rfq.save();
            res.status(200).json({
                type: "success",
                mgs: "Process Successful",
                data: data
            })
        }

        else {
            const RfqData = {
                items: [{
                    Products: productID,
                    quantity: quantity,

                }],

                CustomerID: req.body.CustomerID
            }
            Rfq = await RFQ.create(RfqData)
            res.json(Rfq);
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: "Something Went Wrong", err: err })
    }
}

// admin updates price only
exports.updatePrice = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ message: "ID parameter is required." });
    }
    const Rfq = await RFQ.findById({ _id: req.params.id }).exec();
    console.log(Rfq.subTotal)
    if (!Rfq) {
        return res
            .status(204)
            .json({ message: `No RFQ found ${req.params.id}.` });
    }

    let RfqItems = await RfqModel(0)
    const productID = req.body?.productID
    // const status = req.body?.status
    const Price = req.body?.price

    const indexFound = RfqItems.items.findIndex(item => item.Products._id == productID);

    if (indexFound !== -1) {
        console.log("found")
        Rfq.items[indexFound].total = Rfq.items[indexFound].quantity * Price;
        Rfq.items[indexFound].price = Price
        Rfq.subTotal = Rfq.items.map(item => item.total).reduce((acc, next) => acc + next);
        // Rfq.status = status
    }
    else {
        return res.status(400).json({
            type: "Invalid",
            msg: "Invalid request"
        })
    }
    let data = await Rfq.save();
    res.status(200).json({
        type: "success",
        mgs: "Process Successful",
        data: data
    })
}
// get paticular Rfq 
exports.getRfq = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ message: "ID parameter is required." });
    }
    try {
        console.log(req.params.id)

        let Rfq = await RFQ.findOne({ CustomerID: req.params.id }).populate('items.Products').populate(({ path: 'CustomerID', select: 'email username' })).exec();
        // let Pro =  await RFQ.findOne({Products:Products}).populate('CustomerID');
        console.log("Rfq", Rfq)
        if (!Rfq) {
            return res.status(400).json({
                type: "Invalid",
                msg: "Customer Rfq Not Found",
            })
        }
        res.status(200).json({
            status: true,
            data: Rfq
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: "Something Went Wrong", err: err })
    }
}
// get all RFQ 
exports.getAllRfq = async (req, res) => {
    try {
        const RfqAll = await RFQ.find().populate('items.Products').populate(({ path: 'CustomerID', select: 'email username' })).exec();
        res.status(200).json(RfqAll);
    } catch (error) {
        return res.status(204).json({ message: "No customers found." });
    }
}
exports.emptyRfq = async (req, res) => {

    try {
        let customer = await RFQ.findOne({ CustomerID: req.body.CustomerID }).populate('CustomerID');
        if (customer) {

            const result = await RFQ.deleteOne({ _id: req.params.id });
            res.status(202).json({
                type: "success",
                mgs: "RFQ Has been Deleted",
                data: result
            });
        }
        else {
            res.status(400).json({ msg: "Customer Not Found" })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: "Something Went Wrong", err: err })
    }
}
