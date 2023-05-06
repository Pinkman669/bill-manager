import express, { query } from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const eventDetail = express.Router();
eventDetail.get('/:recordId', isLoggedIn, getEventDetail);

export async function getEventDetail(req: Request, res: Response) {
	try {
        const  recordId= req.params.recordId;
       
        const eventDetail = await client.query(
			`SELECT 
            events.id as event_id, events.name, events.date, records.amount, records.requestor_id, records.receiver_id, events.split-method, events.amount,records.due,
            FROM 
            records INNER JOIN events ON events.id =records.event_id
            WHERE 
            records.id= $1`,
			[recordId]
        );


        res.json({eventinfo: eventDetail})

	} catch (e) {
		logger.error('[Err006] Event detail not Found ' + e);
		res.json({ success: false, msg: '[ERR006]' });
	}};
