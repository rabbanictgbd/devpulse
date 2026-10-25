import express from "express";
import router from "./modules/auth/auth.route.js";

const app= express()
const PORT = Number(process.env.PORT);

app.use(express.json());
app.use("api/auth", router)

export default app;