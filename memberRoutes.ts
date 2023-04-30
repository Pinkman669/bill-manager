import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
// import { UserHistory, History } from './type'

export const memberRoutes = express.Router()

memberRoutes.get('/', isLoggedIn, getMember) // Member home page
memberRoutes.put('/accept', isLoggedIn, putAccept) // accept user request // temp location
memberRoutes.put('/reject', isLoggedIn, putReject) // accept user request // temp location

export async function getMember(req: Request, res: Response) {
    try {
        const userID = req.session.userID
        const userInfo = await client.query(`SELECT nickname, image FROM users WHERE id = $1`, [
            userID
        ])

        const requestorInfo = await client.query(`SELECT DISTINCT events.date,records.event_id, records.amount, users.image ,users.nickname, users.id 
        FROM records INNER JOIN events ON records.requestor_id = events.user_id 
        INNER JOIN users ON users.id = events.user_id 
        WHERE records.receiver_id = $1 ORDER BY events.date DESC`, [
            userID
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id, users.nickname, users.image,events.date, records.amount 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 ORDER BY events.date DESC`, [
            userID
        ])

        res.json({ user: userInfo.rows, requestor: requestorInfo.rows, receiver: receiverInfo.rows })
    } catch (e) {
        logger.error('[Err002] User not found' + e)
        res.json({ success: false, msg: '[ERR002]' })
    }
}

export async function putAccept(req: Request, res: Response) {
    try{
        const eventID = req.body.eventID

        await client.query(`UPDATE records SET accepted = $1 WHERE event_id = $2`,[
            true,
            eventID
        ])
        logger.info(`Events: ${eventID} accepted value updated as true`)
        res.json({ success: true })
    }catch(e){
        logger.error('[Err010] accept value did not change' + e)
        res.json({ success: false, msg: '[ERR010]' })
    }
}

export async function putReject(req: Request, res: Response) {
    try{
        const eventID = req.body.eventID

        await client.query(`UPDATE records SET accepted = $1 WHERE event_id = $2`,[
            false,
            eventID
        ])
        logger.info(`Events: ${eventID} accepted value updated as false`)
        res.json({ success: true })
    }catch(e){
        logger.error('[Err011] accept value did not change' + e)
        res.json({ success: false, msg: '[ERR011]' })
    }
}