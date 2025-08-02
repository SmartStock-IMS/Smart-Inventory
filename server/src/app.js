const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const cors = require("cors");
const express = require("express");
const db = require("./models"); // Sequelize models
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const productRoutes = require("./routes/product-routes");
const customerRoutes = require("./routes/customer-routes");
const salesRepRoutes = require("./routes/salesrep-routes");
const orderRoutes = require("./routes/order-routes");
const quotationRoutes = require("./routes/quotation-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const reportRoutes = require("./routes/report-routes");
const authorizeRoles = require("./utils/auth-roles");

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://trollius-client.onrender.com",
      "https://trollius-client-lpah.onrender.com",
      "https://www.inglot.lk",
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {

      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authorizeRoles("001", "002"), userRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/salesrep",authorizeRoles("002"), salesRepRoutes);
app.use("/api/products", authorizeRoles("001", "002"), productRoutes);
app.use("/api/orders", authorizeRoles("001", "002"), orderRoutes);
app.use("/api/quotation", authorizeRoles("001", "002"), quotationRoutes);
app.use("/api/dashboard", authorizeRoles("001", "002"), dashboardRoutes);
app.use("/api/report", authorizeRoles("002"), reportRoutes)

// Sync database
db.sequelize.sync().then(() => {
  console.log("Database synced!");
});

module.exports = app;
