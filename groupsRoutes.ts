import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
// import { UserHistory, History } from './type';

export const groupsRoutes = express.Router();

groupsRoutes.get('/friends', isLoggedIn, loadFriends); // load friend list
groupsRoutes.post('/create-group', isLoggedIn, createGroup); // create group
groupsRoutes.get('/', isLoggedIn, loadGroup); // load user group
groupsRoutes.get('/group-detail', isLoggedIn, loadGroupDetail);

export async function loadFriends(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const friendList = await client.query(
			`SELECT friends.*, users.nickname, users.id as user_id FROM friends 
        INNER JOIN users ON users.id = user1_id AND users.id != $1 
        OR users.id = user2_id AND users.id != $1 
        WHERE user1_id = $1 OR user2_id = $1 ORDER BY users.nickname`,
			[userID]
		);
		if (friendList.rowCount) {
			res.json({ success: true, friendList: friendList.rows });
		} else {
			res.json({
				success: false,
				msg: "Wake up, you don't have friends"
			});
		}
	} catch (e) {
		logger.error(`[Err011] ${e}`);
		res.status(400).json({ success: false, msg: '[Err011]' });
	}
}

export async function createGroup(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const { groupName, friendsID } = req.body;
		const checkisExist = await client.query(
			`SELECT groups.name, groups.id FROM user_group INNER JOIN groups ON user_group.group_id = groups.id 
        INNER JOIN users ON users.id = user_group.user_id WHERE users.id = $1 AND groups.name = $2`,
			[userID, groupName]
		);
		if (checkisExist.rowCount) {
			res.json({ success: false, msg: 'Group name existed' });
			return;
		}
		await client.query(
			`INSERT INTO groups (name, creator_id) VALUES ($1, $2)`,
			[groupName, userID]
		);
		const groupID = await client.query(
			`SELECT id FROM groups WHERE name = $1 AND creator_id = $2`,
			[groupName, userID]
		);
		await client.query(
			`INSERT INTO user_group (group_id, user_id) VALUES ($1, $2)`,
			[groupID.rows[0].id, userID]
		);
		friendsID.forEach(async (friendID: number) => {
			await client.query(
				`INSERT INTO user_group (group_id, user_id) VALUES ($1, $2)`,
				[groupID.rows[0].id, friendID]
			);
		});
		res.json({ success: true });
	} catch (e) {
		logger.error(`[Err012] ${e}`);
		res.status(400).json({ success: false, msg: '[Err012]' });
	}
}

export async function loadGroup(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const userGroups = await client.query(
			`SELECT groups.name, groups.id FROM user_group INNER JOIN groups ON user_group.group_id = groups.id 
        INNER JOIN users ON users.id = user_group.user_id WHERE users.id = $1`,
			[userID]
		);

		const groupsInfo = new Map();

		for (let row of userGroups.rows) {
			const groupInfo = await client.query(
				`SELECT users.id, users.nickname FROM users 
            INNER JOIN user_group ON users.id = user_group.user_id 
            WHERE users.id != $1 AND user_group.group_id = $2`,
				[userID, row.id]
			);

			groupInfo.rows.forEach((info) => {
				const groupMate = {
					userID: info.id,
					userName: info.nickname,
					groupName: row.name
				};
				if (groupsInfo.has(row.id)) {
					groupsInfo.get(row.id).push(groupMate);
				} else {
					groupsInfo.set(row.id, [groupMate]);
				}
			});
		}
		res.json({
			success: true,
			userGroup: userGroups.rows,
			groupsInfo: Object.fromEntries(groupsInfo)
		});
	} catch (e) {
		logger.error(`[Err013] ${e}`);
		res.status(400).json({ success: false, msg: '[Err013]' });
	}
}

async function loadGroupDetail(req: Request, res: Response) {
	try {
		const userID = req.session.userID;
		const groupID = req.query.groupID;

		const groupEventsInfo = await client.query(
			`SELECT records.id as record_id, records.event_id, records.requestor_id, records.receiver_id, records.due, records.amount, events.name,events.date, events.msg FROM records 
        INNER JOIN events ON records.event_id = events.id 
        WHERE (receiver_id = $1 AND requestor_id IN 
            (SELECT user_group.user_id FROM groups INNER JOIN user_group ON groups.id = user_group.group_id INNER JOIN users ON users.id = user_group.user_id
            WHERE groups.id = ${groupID} AND users.id != ${userID}) 
        OR records.requestor_id = $1 
        AND records.receiver_id IN 
            (SELECT user_group.user_id FROM groups INNER JOIN user_group ON groups.id = user_group.group_id INNER JOIN users ON users.id = user_group.user_id
            WHERE groups.id = ${groupID} AND users.id != ${userID})) 
        AND accepted = $2 ORDER BY events.date DESC`,
			[userID, true]
		);
		let groupBalance = 0;
		for (let eventInfo of groupEventsInfo.rows) {
			// console.log(eventInfo)
			if (eventInfo.requestor_id === userID && !eventInfo.due) {
				groupBalance += eventInfo.amount;
			} else if (eventInfo.receiver_id === userID && !eventInfo.due) {
				groupBalance -= eventInfo.amount;
			}
		}
		res.json({
			success: true,
			groupEventsInfo: groupEventsInfo.rows,
			groupBalance: groupBalance
		});
	} catch (e) {
		logger.error(`[Err014] ${e}`);
		res.status(400).json({ success: false, msg: '[Err014]' });
	}
}
