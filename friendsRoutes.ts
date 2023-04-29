import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const friendsRoutes = express.Router();

friendsRoutes.get('/', isLoggedIn,userTotalAmount);
friendsRoutes.get('/', isLoggedIn,btwFriendsAmount);


export async function userTotalAmount(req: Request, res: Response) {
    try {
        const userID = req.session.userID
        // console.log(`User ID: ${userID}`);
        // console.log(`Session: ${JSON.stringify(req.session,null,2)}`);
        const userInfo = await client.query(`SELECT nickname FROM users WHERE id = $1`, [
            userID
        ]);
        // console.log(`User Name: ${JSON.stringify(userInfo,null,2)}`);
       
        // all records related to user

        // interface usersRecords{
        //     requestor_id: number;
        //     receiver_id: number;
        //     due: boolean;
        //     accepted: boolean;
        //     id : number;
        //     nickname: string;
        //     image: string;
        //    }
           
        
        const usersRecords = await client.query(
            `SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users 
            ON
            records.requestor_id = $1 OR records.receiver_id =$1
            WHERE
            users.id = $1 AND records.due = false AND records.accepted = true
            ORDER BY 
            records.id`,[
                userID
            ])
            
        //    console.log(`all records:${JSON.stringify(usersRecords,null,2)}`);

           
        let totalAmount:number = 0;

        for (let i of usersRecords.rows ){

            // console.log(`for-loops record: ${JSON.stringify(i,null,2)}`)
            if (i.requestor_id = i.id){
                totalAmount += i.amount;
                console.log(`totalAmount: + ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},i.id${i.id},userID:${userID}`);
            }else if (i.receiver_id = i.id){
                totalAmount -= i.amount;
                console.log(`totalAmount: - ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},i.id${i.id},userID:${userID}`)
            }
        }
        // console.log(`Total:${totalAmount}`)

        // interface friends{
        //     nickname:string;
        //     totalAmount: number;
        // }

        // let friendsinfo ={
        //     nickname: userInfo,
        //     totalAmount: totalAmount
        // }


        res.json({ user: userInfo.rows,totalBalance: totalAmount});
        // console.log( res.json({ user: userInfo.rows,totalBalance: totalAmount}))

    } catch (e) {
        logger.error('[Err003] User not found ' + e)
        res.json({ success: false, msg: '[ERR003]' })
    }
}

//______________________________________________________________________________________________________________________________________________________________________________________________________________________________________

export async function btwFriendsAmount(req: Request, res: Response) {
    try {
        const userID = req.session.userID
        // console.log(`User ID: ${userID}`);
        // console.log(`Session: ${JSON.stringify(req.session,null,2)}`);
        const userInfo = await client.query(`SELECT nickname FROM users WHERE id = $1`, [
            userID
        ])
           
        
        const usersRecords = await client.query(
            `SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users 
            ON
            records.requestor_id = $1 OR records.receiver_id =$1
            WHERE
            users.id = $1 AND records.due = false AND records.accepted = true
            ORDER BY 
            records.id`,[
                userID
            ])
            
           console.log(`all records:${JSON.stringify(usersRecords,null,2)}`);

           interface friendsAmount{
            friendID: number;
           }
           let friendsAmount ={};

        for (let i of usersRecords.rows ){
            let friendID:number = 0;
        
            if (i.requestor_id == i.id){
                friendID = i.receiver_id;
                friendsAmount[friendID] = friendsAmount[friendID].value + i.amount;
            }else if (i.receiver_id == i.id){
                friendID = i.requestor_id;
                friendsAmount[friendID] = friendsAmount[friendID].value - i.amount;
            }
            }
        }
        console.log(`Total:${totalAmount}`)

        // interface friends{
        //     nickname:string;
        //     totalAmount: number;
        // }

        // let friendsinfo ={
        //     nickname: userInfo,
        //     totalAmount: totalAmount
        // }


        res.json({ user: userInfo.rows,totalBalance: totalAmount});
        console.log( res.json({ user: userInfo.rows,totalBalance: totalAmount}))

    } catch (e) {
        logger.error('[Err003] User not found ' + e)
        res.json({ success: false, msg: '[ERR003]' })
    }
}




// const friendsInfo_res = await client.query(
//     `SELECT 
//     records.id,records.requestor_id,records.receiver_id,records.amount,records.due,records.accepted,
//     users.id, users.image ,users.nickname 

//     FROM 
//     records INNER JOIN users ON records.receiver_id =$1

//     WHERE 
//     records.due = false AND records.accepted = true 

//     ORDER BY 
//     records.requestor_id`,[
//         userID
//     ])
    
//     console.log(`receive:${JSON.stringify(friendsInfo_res,null,2)}`);
    