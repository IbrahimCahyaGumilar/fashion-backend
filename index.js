import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import SequelizeStore from "connect-session-sequelize";
import db from "./config/Database.js";

// Import Routes
import UserRoute from "./routes/UserRoute.js";
import BlogRoute from "./routes/BlogRoute.js";
import AuthRoute from "./routes/AuthRoute.js";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db,
    checkExpirationInterval: 15 * 60 * 1000, 
    expiration: 24 * 60 * 60 * 1000   
});

// KONFIGURASI SESSION & COOKIE
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    proxy: true,
    cookie: {
        // secure: process.env.NODE_ENV === "production",
        // sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// KONFIGURASI CORS
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173', 
        'https://cutting-fashion.vercel.app'
    ],
}));

app.use(express.json());

// Routes
app.use(UserRoute);
app.use(BlogRoute);
app.use(AuthRoute);

// Sinkronisasi Database
// (async () => {
//     await db.sync();
// })();


if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.APP_PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}...`);
    });
}


export default app;