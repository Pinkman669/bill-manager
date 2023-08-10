import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const eventDetail = express.Router();
eventDetail.get('/:recordId', isLoggedIn, getEventDetail);

export async function getEventDetail(req: Request, res: Response) {
	try {
		const recordId = req.params.recordId;

		const userID = req.session.userID;

		const userInfo = await client.query(
			`SELECT nickname FROM users WHERE id = $1`,
			[userID]
		);

		const eventDetail = await client.query(
			`SELECT 
            events.id as event_id, events.name, events.date, records.amount as record_amount, records.requestor_id, records.receiver_id, events.method , events.msg as message, events.amount as total_amount,records.due
            FROM 
            records INNER JOIN events ON events.id =records.event_id
            WHERE 
            records.id= $1`,
			[recordId]
		);
		const requestor = await client.query(
			`SELECT
            users.id,users.nickname, records.requestor_id
            FROM
            records INNER JOIN users ON users.id = records.requestor_id
            WHERE 
            records.id= $1`,
			[recordId]
		);
		const receiver = await client.query(
			`SELECT
            users.id,users.nickname, records.receiver_id
            FROM
            records INNER JOIN users ON users.id = records.receiver_id 
            WHERE 
            records.id= $1`,
			[recordId]
		);

		res.json({
			user: userInfo.rows,
			req: requestor.rows,
			res: receiver.rows,
			eventInfo: eventDetail.rows
		});
	} catch (e) {
		logger.error('[Err006] Event detail not Found ' + e);
		res.json({ success: false, msg: '[ERR006]' });
	}
}
