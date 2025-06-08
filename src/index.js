import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env", // Path to the environment variables file
});

const port = process.env.PORT || 3000; // Get the port from the environment variables file or default to 3000

// Connect to the MongoDB database
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));