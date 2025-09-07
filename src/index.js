// import express from "express";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import { authMiddleware } from "./middleware/authMiddleware.js";

// const app = express();
// app.use(express.json());

// const MONGO_URI = "mongodb+srv://redeem_user:Redeem123@cluster0.psm60jr.mongodb.net/redeemr?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log("Connected to MongoDB");
// }).catch((err) => {
//     console.error("MongoDB connection error:", err);
// });

// app.use("/auth", authRoutes);

// app.get("/profile", authMiddleware, (req, res) => {
//     res.json({ message: `Hello, ${req.user.username}` });
// });//this is the middleware for auth

// app.listen(3000, () => {
//     console.log("Server running on http://localhost:3000");
// });

//new code from here /....
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

const app = express();
app.use(express.json());

const MONGO_URI = "mongodb+srv://redeem_user:Redeem123@cluster0.psm60jr.mongodb.net/redeemr?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.use("/auth", authRoutes);

app.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
