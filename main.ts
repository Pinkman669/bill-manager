import express from 'express';
import expressSession from 'express-session';
import dotenv from 'dotenv';
import { logger } from './logger';
import pg from 'pg';
import formidable from 'formidable';
import fs from 'fs';
import { loginRoutes } from './loginRoutes';
import path from 'path';
import { memberRoutes } from './memberRoutes';
import { isLoggedIn } from './loginRoutes';
import { friendsRoutes } from './friendsRoutes';
import { activityRoutes } from './activityRoutes';
import grant from 'grant';
import { historyRoutes } from './historyRoutes';
import { groupsRoutes } from './groupsRoutes';
import { friendsDetail } from './friendsdetail';
import { eventDetail } from './eventDetail';
// import { group } from 'console';

declare module 'express-session' {
	interface SessionData {
		user?: string;
		userID?: number;
		image?: string;
		nickname?: string;
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
// google login
const grantExpress = grant.express({
	defaults: {
		origin: 'http://localhost:8080',
		transport: 'session',
		state: true
	},
	google: {
		key: process.env.GOOGLE_CLIENT_ID || '',
		secret: process.env.GOOGLE_CLIENT_SECRET || '',
		scope: ['profile', 'email', 'openid'],
		callback: '/login/google'
	}
});

app.use(grantExpress as express.RequestHandler);

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
app.use(
	'/',
	// (req, res, next) => {
	// 	// temp use only
	// 	req.session.userID = 30;
	// 	req.session.image = 'cffedf62bdd20668651f5e700.jpg';
	// 	req.session.nickname = 'james2@gmail.com';
	// 	next();
	// },
	loginRoutes
); // Login and sign up routes
app.use('/home', memberRoutes); // routes about member function
app.use('/history', historyRoutes); //routes about history page
app.use('/friendsdetail', friendsDetail); //routes about friends page
app.use('/friends', friendsRoutes); // routes for friends record
app.use('/groups', groupsRoutes); // routes for groups page
app.use('/eventdetail', eventDetail); // routes for groups page

app.use('/activity', activityRoutes); // routes for create activity

// admin.html should be inside protected
app.use(isLoggedIn, express.static('protected'));

// Redirecting
app.use((req: express.Request, res: express.Response) => {
	res.sendFile(path.resolve('./public/404.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
	logger.info(`Listening at http://localhost:${PORT}/`);
});
