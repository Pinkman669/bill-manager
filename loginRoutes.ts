import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { form } from './main'
import formidable from 'formidable';
import { hashPassword, checkPassword } from './hash';

export const loginRoutes = express.Router();

loginRoutes.post('/sign', signIn); // sign-in route

export async function signIn(req: Request, res: Response) {
	try {
        form.parse(req, async (err, fields, files)=>{
            // check existed user
            const checkUser = await client.query('SELECT * FROM users WHERE email = $1',[
                fields.email as String
            ])
            if (checkUser.rowCount){
                res.json({success: false, msg: 'User existed.'})
                return
            }
            // Add user
            const hashedPw: string = await hashPassword(fields.password as string)
            await client.query(
                'INSERT INTO users (email, password, nickname, image) VALUES ($1, $2, $3, $4)',[
                    fields.email as string,
                    hashedPw,
                    fields.nickname as string,
                    (files.image as formidable.File)?.newFilename
                ]
            );
            logger.info('sign up success')
            res.json({ success: true , msg: 'Registered successfully!'});
        })
	} catch (e) {
		logger.error(e);
		res.json({ success: false , msg: '[Err001]'});
	}
}



checkPassword; // placeholder only