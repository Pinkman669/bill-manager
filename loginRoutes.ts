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
	try{
        const {email, password} = req.body;
        const result = await client.query (
            "Select * from users where email = $1",[email]
        );
        const [user]: User[] = result.rows;
	    if(!user){
		throw new Error("Username/Password not matched")
        }
        if (await checkPassword(password,user.password)){
            req.session.user = email
            req.session.userID = user.id
		    console.log("login success");
            res.json({success: true});
        }else{
        throw new Error("Username/Password not matched")
    }
}catch(e){
    console.log("login fail");
    console.error(e);
    res.status(400).json({success: false});
}
});

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
        `SELECT * FROM users WHERE users.email = $1`, [result.email])).rows;

    let user = users[0];
    if(!user){
        user = ( await client.query(
                `INSERT INTO users (email,password,nickname)
                VALUES ($1,$2,$3) RETURNING *`,
                [result.email, await hashPassword(crypto.randomBytes(20).toString()),result.name])
            ).rows[0]
    }

    if(req.session){
        req.session['userID'] = user.id
        };
        res.redirect('/home.html')
    }
)


loginRoutes.get('/logout',(req,res)=>{
    if(req.session){
        delete req.session['user']
        delete req.session['email']
        logger.info('logout success')
        res.redirect('/')
    }
})

export const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
  ) => {
	if (req.session.userID) {
	    next ();
	} else {
		// login fail
	  res.redirect("/login.html")
      
	}
  };
