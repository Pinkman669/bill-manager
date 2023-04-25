import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
// import { form } from './main'

export const loginRoutes = express.Router();

loginRoutes.post('/sign', signIn); // sign-in route

export async function signIn(req: Request, res: Response) {
	try {
		const { email, password, nickname, image } = req.body;
		await client.query(
			'INSERT INTO users (email, password, nickname, image) VALUES ($1, $2, $3, $4)',
			[email, password, nickname, image ? image : null]
		);

		res.json({ success: true });
	} catch (e) {
		logger.error(e);
		res.json({ success: false });
	}
}
