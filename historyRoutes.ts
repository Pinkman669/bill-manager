import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
import { UserHistory, History } from './type'

export const historyRoutes = express.Router()

historyRoutes.get('/', isLoggedIn, getHistory) // Get user's history from most recent 3 months
historyRoutes.get('/lentHistory', isLoggedIn, getLentHistory) // Get user lent history
historyRoutes.get('/borrowedHistory', isLoggedIn, getBorrowedHistory) // Get user borrowed history
historyRoutes.get('/allHistory', isLoggedIn, getAllHistory) // Get user's all time history
historyRoutes.get('/pending', isLoggedIn, getPendingHistory) // Get user's all pending history
historyRoutes.get('/cancelled-history', isLoggedIn, getCancelledHistory) 

export async function getHistory(req: Request, res: Response) {
    try {
        const monthToSec = 30 * 24 * 60 * 60 * 1000
        const threeMonths = new Date(new Date().getTime() - 3 * monthToSec)
        const userID = req.session.userID

        const requestorInfo = await client.query(`SELECT events.date, records.accepted, records.id as record_id, records.event_id as event_id, events.name, records.amount, users.nickname, users.id as user_id, records.due 
        FROM records INNER JOIN events ON records.event_id = events.id
        INNER JOIN users ON users.id = events.user_id
        WHERE records.receiver_id = $1 AND events.date >= $2 ORDER BY events.date DESC`, [
            userID,
            threeMonths
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id as user_id, records.accepted,records.id as record_id, users.nickname, events.date, records.amount, records.event_id as event_id,events.name, records.due 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 AND events.date >= $2 ORDER BY events.date DESC`, [
            userID,
            threeMonths
        ])

        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, requestorInfo.rows, 'request')
        setHistory(userHistory.history, receiverInfo.rows, 'receive')

        userHistory.history.sort(sortRecent)
        res.json(userHistory)
    } catch (e) {
        logger.error(`[Err004] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR004]' })
    }
}

export async function getLentHistory(req: Request, res: Response) {
    try {
        const userID = req.session.userID

        const receiverInfo = await client.query(`SELECT DISTINCT users.id as user_id, records.accepted,records.id as record_id,users.nickname, events.date, records.amount, records.event_id as event_id,events.name, records.due 
            FROM events INNER JOIN records ON records.requestor_id = events.user_id 
            INNER JOIN users ON records.receiver_id = users.id 
            WHERE events.user_id = $1 AND records.accepted IS NOT false ORDER BY events.date DESC`, [
            userID,
        ])

        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, receiverInfo.rows, 'receive')
        res.json(userHistory)
    } catch (e) {
        logger.error(`[Err005] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR005]' })
    }
}

async function getBorrowedHistory(req: Request, res: Response) {
    try {
        const userID = req.session.userID

        const requestorInfo = await client.query(`SELECT events.date, records.accepted, records.id as record_id, records.event_id as event_id, events.name, records.amount, users.nickname, users.id as user_id, records.due 
        FROM records INNER JOIN events ON records.event_id = events.id
        INNER JOIN users ON users.id = events.user_id
        WHERE records.receiver_id = $1 AND records.accepted IS NOT false ORDER BY events.date DESC`, [
            userID,
        ])
        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, requestorInfo.rows, 'request')
        res.json(userHistory)
    } catch (e) {
        logger.error(`[Err006] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR006]' })
    }
}

export async function getAllHistory(req: Request, res: Response) {
    try {
        const userID = req.session.userID

        const requestorInfo = await client.query(`SELECT events.date, records.accepted, records.id as record_id, records.event_id as event_id, events.name, records.amount, users.nickname, users.id as user_id, records.due 
        FROM records INNER JOIN events ON records.event_id = events.id
        INNER JOIN users ON users.id = events.user_id
        WHERE records.receiver_id = $1 ORDER BY events.date DESC`, [
            userID,
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id as user_id, records.accepted, records.id as record_id, users.nickname, events.date, records.amount, records.event_id as event_id,events.name, records.due 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 ORDER BY events.date DESC`, [
            userID,
        ])

        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, requestorInfo.rows, 'request')
        setHistory(userHistory.history, receiverInfo.rows, 'receive')

        userHistory.history.sort(sortRecent)
        res.json(userHistory)
    } catch (e) {
        logger.error(`[Err007] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR007]' })
    }
}

export async function getPendingHistory(req: Request, res: Response) {
    try{
        const userID = req.session.userID

        const requestorInfo = await client.query(`SELECT events.date, records.accepted, records.id as record_id, records.event_id as event_id, events.name, records.amount, users.nickname, users.id as user_id, records.due 
        FROM records INNER JOIN events ON records.event_id = events.id
        INNER JOIN users ON users.id = events.user_id
        WHERE records.receiver_id = $1 AND records.accepted IS null ORDER BY events.date DESC`, [
            userID
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id as user_id, records.accepted, records.id as record_id, users.nickname, events.date, records.amount, records.event_id as event_id,events.name, records.due 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 AND records.accepted IS null ORDER BY events.date DESC`, [
            userID
        ])

        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, requestorInfo.rows, 'request')
        setHistory(userHistory.history, receiverInfo.rows, 'receive')
        userHistory.history.sort(sortRecent)
        res.json(userHistory)
    }catch (e){
        logger.error(`[Err008] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR008]' })
    }
}

export async function getCancelledHistory(req: Request, res: Response) {
    try{
        const userID = req.session.userID

        const requestorInfo = await client.query(`SELECT events.date, records.accepted, records.id as record_id, records.event_id as event_id, events.name, records.amount, users.nickname, users.id as user_id, records.due 
        FROM records INNER JOIN events ON records.event_id = events.id
        INNER JOIN users ON users.id = events.user_id
        WHERE records.receiver_id = $1 AND records.accepted IS false ORDER BY events.date DESC`, [
            userID
        ])

        const receiverInfo = await client.query(`SELECT DISTINCT users.id as user_id, records.accepted, records.id as record_id, users.nickname, events.date, records.amount, records.event_id as event_id,events.name, records.due 
        FROM events INNER JOIN records ON records.requestor_id = events.user_id 
        INNER JOIN users ON records.receiver_id = users.id 
        WHERE events.user_id = $1 AND records.accepted IS false ORDER BY events.date DESC`, [
            userID
        ])

        const userHistory: UserHistory = {
            nickname: req.session.nickname!,
            image: req.session.image!,
            history: []
        }
        setHistory(userHistory.history, requestorInfo.rows, 'request')
        setHistory(userHistory.history, receiverInfo.rows, 'receive')
        userHistory.history.sort(sortRecent)
        res.json(userHistory)
    }catch (e){
        logger.error(`[Err009] cannot access user's history ${e}`)
        res.json({ success: false, msg: '[ERR009]' })
    }
}


// Sorting Fn from recent date to farther date
export function sortRecent(a: History, b: History) {
    return b.date.getTime() - a.date.getTime()
}

// Set history Fn
export function setHistory(userHistoryRows: History[], historyRows: History[], type: string) {
    for (let i in historyRows) {
        const history: History = {
            user_id: historyRows[i].user_id,
            nickname: historyRows[i].nickname,
            amount: historyRows[i].amount,
            record_id: historyRows[i].record_id,
            event_id: historyRows[i].event_id,
            name: historyRows[i].name,
            date: historyRows[i].date,
            type: type,
            due: historyRows[i].due,
            accepted: historyRows[i].accepted
        }
        userHistoryRows.push(history)
    }
}