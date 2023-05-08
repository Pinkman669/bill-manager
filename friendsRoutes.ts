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
		// console.log(`User ID: ${userID}`);
		// console.log(`Session: ${JSON.stringify(req.session,null,2)}`);
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

		//    console.log(`all records:${JSON.stringify(usersRecords,null,2)}`);

		let totalAmount: number = 0;

		// get the total req amount:
		for (let i of usersRecordsReq.rows) {
			totalAmount += i.amount;
			// console.log(
			// 	`totalAmount: + ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},fd_id${i.id},name:${i.nickname}`
			// );
		}
		// get the total res amount:
		for (let i of usersRecordsRes.rows) {
			totalAmount -= i.amount;
			// console.log(
			// 	`totalAmount: - ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},fd_id${i.id},name:${i.nickname}`
			// );
		}

		// console.log(`total amount: ${totalAmount}`);

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
				// console.log(
				// 	`friendAmountReq: + ${
				// 		i.amount
				// 	} allFriendsDetail: ${JSON.stringify(
				// 		allFriendsDetail,
				// 		null,
				// 		2
				// 	)}`
				// );
			} else {
				allFriendsDetail.push({
					friendID: i.receiver_id,
					friendsName: i.nickname,
					friendsImage: i.image,
					friendsAmount: i.amount
				});
				// console.log(
				// 	`NEWreq: + ${i.amount} allFriendsDetail:${JSON.stringify(
				// 		allFriendsDetail,
				// 		null,
				// 		2
				// 	)}`
				// );
			}
		}

		for (let i of usersRecordsRes.rows) {
			let friend = allFriendsDetail.find(
				(obj) => obj.friendID === i.requestor_id
			);
			if (friend) {
				friend.friendsAmount -= i.amount;
				// console.log(
				// 	`friendAmountRes: - ${
				// 		i.amount
				// 	} allFriendsDetail: ${JSON.stringify(
				// 		allFriendsDetail,
				// 		null,
				// 		2
				// 	)}`
				// );
			} else {
				allFriendsDetail.push({
					friendID: i.requestor_id,
					friendsName: i.nickname,
					friendsImage: i.image,
					friendsAmount: -(i.amount)
				});
				// console.log(
				// 	`NEWreq: - ${i.amount} allFriendsDetail:${JSON.stringify(
				// 		allFriendsDetail,
				// 		null,
				// 		2
				// 	)}`
				// );
			}
		}

		res.json({
			user: userInfo.rows,
			totalBalance: totalAmount,
			friendsRecords: allFriendsDetail
		});
		// console.log( res.json({ user: userInfo.rows,totalBalance: totalAmount}))
	} catch (e) {
		logger.error('[Err003] User not found ' + e);
		res.json({ success: false, msg: '[ERR003]' });
	}
}
