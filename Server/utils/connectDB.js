import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Force Google DNS — local resolver (127.0.0.1) cannot handle MongoDB SRV queries
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config(); // Load .env values

// Create a connection tracker object
const connection = {
  isConnected: null // Will track if DB is connected to avoid reconnecting
};

// Function to connect to MongoDB
export const connectToDB = async () => {
  try {
    // If already connected, skip reconnection
    if (connection.isConnected) {
      return;
    }

    // Connect to MongoDB using URL from environment variable
    const db = await mongoose.connect(process.env.MONGO_URL);

    // Set connection status
    connection.isConnected = db.connections[0].readyState; // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    console.log("MongoDB connected:", connection.isConnected);

  } catch (error) {
    // Log connection errors
    console.log("Database connection failed:", error);
    process.exit(1); // Exit process with failure code
  }
};

