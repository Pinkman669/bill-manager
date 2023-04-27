import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const friendsRoutes = express.Router();

friendsRoutes.get('/', isLoggedIn,friendsRecord);


export async function friendsRecord(req: Request, res: Response) {
    try {
        const userID = req.session.userID
        const userInfo = await client.query(`SELECT nickname FROM users WHERE id = $1`, [
            userID
        ])

        const friendsInfo = await client.query(`SELECT DISTINCT events.date,records.event_id,events.amount, users.image ,users.nickname, users.id 
        FROM records INNER JOIN events ON records.requestor_id = events.user_id 
        INNER JOIN users ON users.id = events.user_id 
        WHERE records.receiver_id = $1 ORDER BY events.date`, [
            userID
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id, users.nickname, users.image,events.date, records.amount 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 ORDER BY events.date`, [
            userID
        ])

        res.json({ user: userInfo.rows[0], friends: friendsInfo.rows , receiver: receiverInfo.rows})
    } catch (e) {
        logger.error('[Err003] User not found' + e)
        res.json({ success: false, msg: '[ERR003]' })
    }
}