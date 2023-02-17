require("dotenv").config();
const express = require("express");
const path = require("path");
const cluster = require("cluster");
const os = require("os");
const cors = require("cors");
const corsOptions = require("./src/config/corsOptions");
const { logger } = require("./src/middleware/logEvents");
const errorHandler = require("./src/middleware/errorHandler");
const verifyJWT = require("./src/middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./src/middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./src/config/dbConn");

const PORT = process.env.PORT || 3500;
const app = express();

const numCpu = os.cpus().length;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/", require("./src/routes/root"));

app.use("/api/v1/admin", require("./src/routes/api/admin/index"));

app.use("/api/v1/customers", require("./src/routes/api/customers/index"));

app.use("/api/v1/vendors", require("./src/routes/api/vendors/index"));

app.use(
  "/api/v1/delivery-agents",
  require("./src/routes/api/deliveryAgents/index")
);

app.get("/get", (req, res) => {
  // for (let i = 0; i < 10000000000; i++) {}
  // res.status(404).send("connectedd");
  // cluster.worker.kill();
  const values = [
    "colorblack",
    "colorwhite",
    "sizemedium",
    "sizesmall",
    "sizelarge",
  ];
  const variant_option = values.slice(0, 2);
  const variant_value = values.slice(2, 5);
  const prepareCartesian = (arr1 = [], arr2 = []) => {
    const res = [];
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        res.push(arr1[i] + arr2[j]);
      }
    }
    return res;
  };
  const data = prepareCartesian(variant_option, variant_value);
  console.log(data.map((item, i) => item + i));
  // res.send(prepareCartesian(variant_option, variant_value));
});

app.use(verifyJWT);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "..", "..", "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  if (cluster.isMaster) {
    for (i = 0; i < numCpu; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} dead`);
      cluster.fork();
    });
  } else {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} and process ${process.pid}`);
    });
  }
});
