import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import passport from "passport";
import router from "./routes/router.js";
import errorHandler from "./middleware/error.middleware.js";
import requestLogger from "./middleware/logger.middleware.js";
import paymentRoutes from "./routes/payment.route.js";

const swaggerDocument = JSON.parse(
    readFileSync(new URL("./swagger.json", import.meta.url)),
);

const app = express();
app.set("trust proxy", 1);

app.use(requestLogger);

const allowedOrigins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://abdelrahman0xff-nexusacademy.hf.space",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

// stripe webhook requires the raw body to verify the signature
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/payments", paymentRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", router);

app.use(errorHandler);
const PORT = process.env.PORT || 7860;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
