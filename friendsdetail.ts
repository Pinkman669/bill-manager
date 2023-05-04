import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
// import { isLoggedIn } from './loginRoutes';

export const friendsDetail = express.Router();

friendsDetail.get('/:friendID', getFriendsDetail);

export async function getFriendsDetail(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const friendID = req.params.friendID;
		
		const userInfo = await client.query(
			`SELECT nickname FROM users WHERE id = $1`,
			[userID]
		);
		const friendInfo = await client.query(
			`SELECT nickname FROM users WHERE id = $1`,
			[friendID]
		);

		const friendHistory = await client.query(
			`SELECT 
            events.id as event_id, events.name, events.date, records.id as record_id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted
            FROM
            events INNER JOIN records ON events.id = records.event_id
            WHERE
            ((records.requestor_id = $1 AND records.receiver_id = $2) OR (records.requestor_id = $2  AND records.receiver_id = $1 )) AND records.due = false AND records.accepted = true 
            ORDER BY 
            events.date`,
			[userID,friendID]
		);
			console.log(`This is friend history${friendHistory}`);
		

		


	

		res.json({
			user: userInfo.rows, friends: friendInfo.rows, history:friendHistory.rows
		});
		// console.log( res.json({ user: userInfo.rows,totalBalance: totalAmount}))
	} catch (e) {
		logger.error('[Err004] History detail not found ' + e);
		res.json({ success: false, msg: '[ERR004]' });
	}
}
