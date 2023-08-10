import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
import errorCode from './error-code.json';


export const memberRoutes = express.Router();

memberRoutes.get('/', isLoggedIn, getMember); // Member home page
memberRoutes.put('/accept', isLoggedIn, putAccepted); // accept/reject user request // temp location

export async function getMember(req: Request, res: Response) {
	try {
		const userInfo = {
			userName: req.session.nickname,
			userID: req.session.userID,
			image: req.session.image
		};

		const requestorInfo = await client.query(
			`SELECT records.id as record_id, users.id, records.amount, users.nickname, users.image, events.date
		FROM records INNER JOIN users ON records.requestor_id = users.id INNER JOIN events ON events.id = records.event_id
		WHERE records.receiver_id = $1 AND records.due = false AND records.accepted = true
		ORDER BY events.date DESC`,
			[userInfo.userID]
		);

		const receiverInfo = await client.query(
			`SELECT records.id as record_id, users.id, records.amount, users.nickname, users.image, events.date
		FROM records INNER JOIN users ON records.receiver_id = users.id INNER JOIN events ON events.id = records.event_id
		WHERE records.requestor_id = $1  AND records.due = false AND records.accepted = true
		ORDER BY events.date DESC`,
			[userInfo.userID]
		);

		let totalBalance = 0;
		requestorInfo.rows.forEach((requestor) => {
			totalBalance -= requestor.amount;
		});
		receiverInfo.rows.forEach((receiver) => {
			totalBalance += receiver.amount;
		});

		res.json({
			userInfo: userInfo,
			receiverInfo: receiverInfo.rows,
			requestorInfo: requestorInfo.rows,
			totalBalance: totalBalance
		});
	} catch (e) {
		logger.error(`[Err002] ${errorCode.Err002}` + e);
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
