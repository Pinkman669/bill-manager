import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';

export const memberRoutes = express.Router()

memberRoutes.get('/', getMember) // Member home page


export async function getMember(req: Request, res: Response){
    try{
        req.session.userID = 30 // Temp use only
        const userID: number = req.session.userID
        const userInfo = await client.query('SELECT * FROM users WHERE id = $1',[
            userID
        ])
        res.json(userInfo.rows[0])
    } catch (e){
        logger.error('[Err002] User not found' + e)
        res.json({success: false, msg: '[ERR002]'})
    }
}