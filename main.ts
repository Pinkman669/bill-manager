import express from 'express';
import expressSession from 'express-session';
// import { Request, Response } from 'express'
// import dotenv from 'dotenv'
import { logger } from './logger';
// import pg from 'pg'

declare module 'express-session' {
	interface SessionData {
		user?: string;
		userID?: number;
	}
}

// Configure psql
// dotenv.config()
// export const client = new pg.Client({
//     database: process.env.DB_NAME,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD
// });
// client.connect()

//  Configure express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	expressSession({
		secret: 'wsp-project',
		resave: true,
		saveUninitialized: true
	})
);

// Start
app.use(express.static('public'));

const PORT = 8080;
app.listen(PORT, () => {
	logger.info(`Listening at http://localhost:${PORT}/`);
});
