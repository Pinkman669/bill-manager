import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import path from 'path'

export const memberRoutes = express.Router()

memberRoutes.get('/', getMember) // Member home page


export async function getMember(req: Request, res: Response){
    try{
        req.session.userID = 29 // Temp use only
        const userID: number = req.session.userID
        const userInfo = await client.query('SELECT * FROM users WHERE id = $1',[
            userID
        ])
        console.log(userInfo.rows[0])
        const imagePath = userInfo.rows[0].image ? path.resolve(userInfo.rows[0].image) : null
        res.json({user: userInfo.rows[0], image: imagePath})
    } catch (e){
        logger.error('[Err002] User not found' + e)
        res.json({success: false, msg: '[ERR002]'+ e})
    }
}