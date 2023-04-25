import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { form } from './main'
import formidable from 'formidable';

export const loginRoutes = express.Router();

loginRoutes.post('/sign', signIn); // sign-in route

export async function signIn(req: Request, res: Response) {
	try {
		form.parse(req, async (err, fields, files)=>{
            await client.query(
                'INSERT INTO users (email, password, nickname, image) VALUES ($1, $2, $3, $4)',[
                    fields.email as string,
                    fields.password as string,
                    fields.nickname as string,
                    (files.image as formidable.File)?.newFilename
                ]
            );
        })
        logger.info('sign up success')
		res.json({ success: true });
	} catch (e) {
		logger.error(e);
		res.json({ success: false });
	}
}
