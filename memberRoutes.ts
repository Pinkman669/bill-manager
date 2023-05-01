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
        const userInfo = {
            userID: req.session.userID,
            image: req.session.image
        }

        res.json(userInfo)
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