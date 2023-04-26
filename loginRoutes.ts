import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { form } from './main'
import formidable from 'formidable';
import { hashPassword, checkPassword } from './hash';
import {User} from "./type";
import crypto from 'crypto';

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

//login 

loginRoutes.post("/login" ,async(req, res) =>{
	const {email, password} = req.body;
    const result = await client.query ("Select * from users where password = $1 and email = $2", [password, email])
    const users: User[] = result.rows;
	if(users.length){
		//login success
		req.session.user = email
		console.log("login success");
        res.json({success: true});
	}else{
        console.log("login fail");
        res.json({success: false});
        throw new Error("Username/")
    }
})

loginRoutes.get('/login/google', async (req:express.Request, res:express.Response) =>{
    const accessToken = req.session?.['grant'].response.access_token;

    const fetchRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
        method:"get",
        headers:{
            "Authorization":`Bearer ${accessToken}`
        }
    })
    const result = await fetchRes.json()
    const users = (await client.query(
        `SELECT * FROM users WHERE users.username = $1`, [result.email])).rows;

    let user = users[0];
    if(!user){
        user = ( await client.query(
                `INSERT INTO users (email,password)
                VALUES ($1,$2) RETURNING *`,
                [result.email, await hashPassword(crypto.randomBytes(20).toString())])
            ).rows[0]
    }

    if(req.session){
        req.session['user'] = user.email
        req.session['userID'] = user.id
        };
        res.redirect('/landing')
    }
)


loginRoutes.get('/logout',(req,res)=>{
    if(req.session){
        delete req.session['user']
        delete req.session['email']
        delete req.session['password']
    }
})

export const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
  ) => {
	if (req.session .user) {
	  next ();
	} else {
		// login fail
	  res.redirect("/login.html")
	}
  };

checkPassword; // placeholder only