import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';


export const friendsDetail = express.Router();

friendsDetail.get('/:friendID', isLoggedIn, getFriendsDetail);
friendsDetail.put('/settle', isLoggedIn, settleBalance);

export async function settleBalance(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const friendID = req.body.friendId;

		await client.query(
			`UPDATE records SET due = true 
			WHERE
			((requestor_id = $1 AND receiver_id = $2) OR (requestor_id = $2  AND receiver_id = $1 )) AND due = false AND accepted = true`,
			[userID, friendID]
		);
		res.json({ success: true });
	} catch (e) {
		logger.error('[Err005] Settle Balance not Found ' + e);
		res.json({ success: false, msg: '[ERR005]' });
	}
}

export async function getFriendsDetail(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const friendID = req.params.friendID;

		const userInfo = await client.query(
			`SELECT nickname FROM users WHERE id = $1`,
			[userID]
		);
		const friendInfo = await client.query(
			`SELECT nickname, image FROM users WHERE id = $1`,
			[friendID]
		);

		const friendHistory = await client.query(
			`
				SELECT
				events.id as event_id, events.name, events.date, records.id as record_id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted
				FROM
				events INNER JOIN records ON events.id = records.event_id
				WHERE
				((records.requestor_id = $1 AND records.receiver_id = $2) OR (records.requestor_id = $2  AND records.receiver_id = $1 )) AND records.accepted = true 
				ORDER BY 
				events.date
			`,
			[userID, friendID]
		);
		const fdRecordsReq = await client.query(
			`SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted
            FROM
            records 
            WHERE
            records.requestor_id = $1  AND records.receiver_id = $2 AND records.due = false AND records.accepted = true
            ORDER BY 
            records.id`,
			[userID, friendID]
		);

		const fdRecordsRes = await client.query(
			`SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted
            FROM
            records 
            WHERE
            records.requestor_id = $2  AND records.receiver_id = $1 AND records.due = false AND records.accepted = true
            ORDER BY 
            records.id`,
			[userID, friendID]
		);

		let totalAmount: number = 0;

		// get the total req amount:
		for (let i of fdRecordsReq.rows) {
			totalAmount += i.amount;
		}
		// get the total res amount:
		for (let i of fdRecordsRes.rows) {
			totalAmount -= i.amount;
		}

		res.json({
			user: userInfo.rows,
			friend: friendInfo.rows,
			totalAmount,
			history: friendHistory.rows
		});
	} catch (e) {
		logger.error('[Err004] History detail not found ' + e);
		res.json({ success: false, msg: '[ERR004]' });
	}
}
