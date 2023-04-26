import express from 'express';
import expressSession from 'express-session';
import dotenv from 'dotenv';
import { logger } from './logger';
import pg from 'pg';
import formidable from 'formidable';
import fs from 'fs';
import { loginRoutes } from './loginRoutes';
import path from 'path'
import {memberRoutes} from './memberRoutes'

declare module 'express-session' {
	interface SessionData {
		user?: string;
		userID?: number;
	}
}

// Configure psql
dotenv.config();
export const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
});
client.connect();

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

// Configure formidable
const uploadDir = 'public/uploads';
fs.mkdirSync(uploadDir, { recursive: true });

export const form = formidable({
	uploadDir: uploadDir,
	keepExtensions: true,
	maxFiles: 1,
	maxFileSize: 1024 ** 2 * 20,
	filter: (part) => part.mimetype?.startsWith('image/') || false
});

// Start
app.use(express.static('public'));
app.use('/', loginRoutes); // Login and sign up routes
app.use('/member', memberRoutes); // routes about member function


// Login guard
export function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction){
	if (req.session.user){
		next()
	} else{
		res.status(404).sendFile(path.resolve('./public/404.html'))
	}
}


// Redirecting
app.use((req: express.Request, res: express.Response) => {
	res.sendFile(path.resolve('./public/404.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
	logger.info(`Listening at http://localhost:${PORT}/`);
});
