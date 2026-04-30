import { Sequelize } from "sequelize";
import mysql2 from "mysql2";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const db = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        dialectModule: mysql2,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default db;