import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
import {UserHistory, History} from './type'

export const memberRoutes = express.Router()

memberRoutes.get('/', isLoggedIn,getMember) // Member home page
memberRoutes.get('/history', getHistory) // Get user's history info


export async function getMember(req: Request, res: Response) {
    try {
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

export async function getHistory(req: Request, res: Response) {
    try{
        const userID = req.session.userID
        const userInfo = await client.query(`SELECT nickname, image FROM users WHERE id = $1`,[
            userID
        ])

        const requestorInfo = await client.query(`SELECT DISTINCT events.date,records.event_id, events.name,events.amount, users.nickname, users.id 
        FROM records INNER JOIN events ON records.requestor_id = events.user_id 
        INNER JOIN users ON users.id = events.user_id 
        WHERE records.receiver_id = $1 ORDER BY events.date`, [
            userID
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id, users.nickname, events.date, records.amount, events.name 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 ORDER BY events.date`, [
            userID
        ])

        const userHistory: UserHistory = {
            nickname: userInfo.rows[0].nickname,
            image: userInfo.rows[0].image,
            history: []
        }

        for (let i in requestorInfo.rows){
            const requestor: History = {
                nickname: requestorInfo.rows[i].nickname,
                amount: requestorInfo.rows[i].amount,
                event: requestorInfo.rows[i].name,
                date: requestorInfo.rows[i].date,
                type: "request"
            }
            userHistory.history.push(requestor)
        }

        for (let i in receiverInfo.rows){
            const receiver: History = {
                nickname: receiverInfo.rows[i].nickname,
                amount: receiverInfo.rows[i].amount,
                event: receiverInfo.rows[i].name,
                date: receiverInfo.rows[i].date,
                type: "receive"
            }
            userHistory.history.push(receiver)
        }
        
        console.log(JSON.stringify(userHistory, null, 4))
        res.json(userHistory)
    } catch(e){
        logger.error(`[Err004] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR004]' })
    }
}