import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from "./routes/userRouter.js";
const app = express();



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}
));

app.use(express.json({ limit: "16kb" })); // Middleware to parse JSON request bodies 
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Middleware to parse URL-encoded request bodies
app.use(express.static("public")); // serve static files from the 'public' directory
app.use(cookieParser()); // Middleware to parse cookies
// router import 

app.use("/api/v1/users", userRouter);

app.get("/post", (req, res) => {
    res.send("Server is running");
});

export { app };