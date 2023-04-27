import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const memberRoutes = express.Router()

memberRoutes.get('/', isLoggedIn,getMember) // Member home page


export async function getMember(req: Request, res: Response) {
    try {
        // req.session.userID = 30 // Temp use only
        const userID = req.session.userID
        const userInfo = await client.query(`SELECT nickname, image FROM users WHERE id = $1`, [
            userID
        ])

        const requestorInfo = await client.query(`SELECT DISTINCT events.date,records.event_id,events.amount, users.image ,users.nickname, users.id 
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

        res.json({ user: userInfo.rows, requestor: requestorInfo.rows , receiver: receiverInfo.rows})
    } catch (e) {
        logger.error('[Err002] User not found' + e)
        res.json({ success: false, msg: '[ERR002]' })
    }
}