import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const friendsRoutes = express.Router();

friendsRoutes.get('/', isLoggedIn, userTotalAmount);

export async function userTotalAmount(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const userInfo = await client.query(
			`SELECT nickname, image FROM users WHERE id = $1`,
			[userID]
		);

		const usersRecordsReq = await client.query(
			`SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users ON records.receiver_id = users.id 
            WHERE
            records.requestor_id = $1  AND records.due = false AND records.accepted = true
            ORDER BY 
            records.receiver_id`,
			[userID]
		);

		const usersRecordsRes = await client.query(
			`SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users ON records.requestor_id = users.id 
            WHERE
            records.receiver_id = $1  AND records.due = false AND records.accepted = true
            ORDER BY 
            records.requestor_id`,
			[userID]
		);

		let totalAmount: number = 0;

		// get the total req amount:
		for (let i of usersRecordsReq.rows) {
			totalAmount += i.amount;
		}
		// get the total res amount:
		for (let i of usersRecordsRes.rows) {
			totalAmount -= i.amount;
		}

		// friends amount ===================================================================

		interface FriendsDetail {
			friendID: number;
			friendsName: string;
			friendsImage: string;
			friendsAmount: number;
		}
		let allFriendsDetail: FriendsDetail[] = [];

		for (let i of usersRecordsReq.rows) {
			let friend = allFriendsDetail.find(
				(obj) => obj.friendID === i.receiver_id
			);
			if (friend) {
				friend.friendsAmount += i.amount;
			} else {
				allFriendsDetail.push({
					friendID: i.receiver_id,
					friendsName: i.nickname,
					friendsImage: i.image,
					friendsAmount: i.amount
				});
			}
		}

		for (let i of usersRecordsRes.rows) {
			let friend = allFriendsDetail.find(
				(obj) => obj.friendID === i.requestor_id
			);
			if (friend) {
				friend.friendsAmount -= i.amount;
			} else {
				allFriendsDetail.push({
					friendID: i.requestor_id,
					friendsName: i.nickname,
					friendsImage: i.image,
					friendsAmount: -i.amount
				});
			}
		}

		res.json({
			user: userInfo.rows[0],
			totalBalance: totalAmount,
			friendsRecords: allFriendsDetail
		});
	} catch (e) {
		logger.error('[Err003] User not found ' + e);
		res.json({ success: false, msg: '[ERR003]' });
	}
}
