// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import authRoutes from "./routes/authRoutes.js";
// import teamMemberRoutes from "./routes/teamMemberRoutes.js";
// import { authMiddleware } from "./middleware/authMiddleware.js";

// const app = express();
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(cookieParser());
// app.use(express.json());

// const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.0ort1bw.mongodb.net/awscc_blogs?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log("Connected to MongoDB");
// }).catch((err) => {
//     console.error("MongoDB connection error:", err);
// });

// app.use("/iamatharva", (req, res) => {
//     res.send("API is running...");
// });
// app.use("/auth", authRoutes);
// import eventRoutes from "./routes/eventRoutes.js";

// app.use("/events", eventRoutes);

// app.use("/team-members", teamMemberRoutes);

// app.get("/profile", authMiddleware, (req, res) => {
//     res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

// src/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import teamMemberRoutes from "./routes/teamMemberRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import eventRoutes from "./routes/eventRoutes.js";
import certificateRouter from "./routes/certificate.route.js";

const app = express();

// CORS configuration for both development and production
// const corsOptions = {
//   origin:
//     process.env.NODE_ENV === "production"
//       ? [
//           "https://your-frontend-domain.vercel.app", // Replace with your actual frontend domain
//           "https://your-custom-domain.com", // Add any custom domains
//         ]
//       : ["http://localhost:3000", "http://localhost:3001"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.use(cors({
//   origin: (origin, callback) => {
//     callback(null, true); // Allow all origins
//   },
//   credentials: true
// }));

// Allow requests from any origin
const corsOptions = {
  origin: "*",       // <-- allow all origins
  credentials: true, // keep this if you need cookies/auth headers
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

// Middleware to ensure database connection for each request (only for routes that need DB)
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't throw error in serverless environment
  }
};

// Database middleware only for routes that need it
const dbMiddleware = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "AWSCC Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/imaatharva", (req, res) => {
  res.json({ message: "API is running!", status: "success" });
});

// Simple test endpoint without database
app.get("/test", (req, res) => {
  res.json({
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
  });
});

// Apply database middleware only to routes that need it
app.use("/auth", dbMiddleware, authRoutes);
app.use("/events", dbMiddleware, eventRoutes);
app.use("/team-members", dbMiddleware, teamMemberRoutes);
app.use("/certificate", certificateRouter);

app.get("/profile", dbMiddleware, authMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
});

// Global error handler for production
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (process.env.NODE_ENV === "production") {
    res.status(500).json({
      message: "Internal server error",
      error: "Something went wrong",
    });
  } else {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      stack: err.stack,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

// Start server for production (Render) or local development
const PORT = process.env.PORT || 3001;

// For Render and other production environments
if (process.env.NODE_ENV === "production" || !process.env.VERCEL) {
  // Connect to database and start server
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

// ✅ Export app for Vercel (serverless)
export default app;
