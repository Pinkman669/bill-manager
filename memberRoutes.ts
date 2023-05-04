import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
// import { UserHistory, History } from './type'

export const memberRoutes = express.Router();

memberRoutes.get('/', isLoggedIn, getMember); // Member home page
memberRoutes.put('/accept', isLoggedIn, putAccepted); // accept/reject user request // temp location

export async function getMember(req: Request, res: Response) {
	try {
		const userInfo = {
			userID: req.session.userID,
			image: req.session.image
		};

		res.json(userInfo);
	} catch (e) {
		logger.error('[Err002] User not found' + e);
		res.json({ success: false, msg: '[ERR002]' });
	}
}

export async function putAccepted(req: Request, res: Response) {
	try {
		const { eventID, acceptance } = req.body;

		await client.query(
			`UPDATE records SET accepted = $1 WHERE event_id = $2`,
			[acceptance, eventID]
		);
		logger.info(
			`Events: ${eventID} accepted value updated as ${acceptance}`
		);
		res.json({ success: true });
	} catch (e) {
		logger.error('[Err010] accept value did not change' + e);
		res.json({ success: false, msg: '[ERR010]' });
	}
}
