import express from 'express'
import {Request, Response} from 'express'
import { client } from './main';
import { loadFriends } from './groupsRoutes';
import { isLoggedIn } from './loginRoutes';
import {logger} from './logger'

export const activityRoutes = express.Router();


//get the friends list
activityRoutes.get('/', isLoggedIn, loadFriends);
activityRoutes.post('/create-activity', isLoggedIn, createActivity)

async function createActivity(req: Request, res: Response) {
    try{
        const actInfo = req.body
        
        // Calculate shares to amount
        if (actInfo.method instanceof Object){
            if (actInfo.receiversInfo.userAmount.reduce((acc:number, curr:string)=>{
                return acc += Number(curr)
            },0) !== Number(actInfo.method.shares)){
                res.json({success: false, msg: 'Shares not match'})
                return
            }
            actInfo.receiversInfo.userAmount = actInfo.receiversInfo.userAmount.map((amount: string)=>{
                return Math.round(Number(amount) * (Number(actInfo.totalAmount) / Number(actInfo.method.shares)))
            })
        }
        console.log(actInfo.receiversInfo.userAmount)
        // Reject if amount not match
        let checkAmount = 0;
        actInfo.receiversInfo.userAmount.forEach((amount: string)=>{
            checkAmount+=Number(amount)
        })
        console.log(checkAmount)
        if (Number(actInfo.totalAmount) !== checkAmount){
            res.json({success: false, msg: 'Amount not match'})
            return
        }
        await client.query(`INSERT INTO events (user_id, msg, name, date, method, amount) VALUES ($1, $2, $3, $4, $5, $6)`,[
            Number(actInfo.requestorID),
            actInfo.message,
            actInfo.actName,
            actInfo.actDate,
            actInfo.method,
            Number(actInfo.totalAmount)
        ])
        res.json({success: true, msg: 'Activity created successfully!'})
    } catch(e){
        logger.error(`[Err013] ${e}`)
        res.json({success: false, msg: '[Err013]Failed create activity'})
    }
}




























// async function getFriends(userID: number) {
//     const friendsList = await client.query(
//         `SELECT user1_id, user2_id FROM friends
//         INNER JOIN users ON users.id = friends.user1_id OR users.id = friends.user2_id
//         WHERE friends.users1_id = $1 OR friends.user2_id = $1`, [userID]);
//         return friendsList.rows;
// }

// function calculateSplitAmount(totalAmount: number, selectedFriends: Array<number>) {
//     const numberOfFriends = selectedFriends.length;
//     const splitAmount = totalAmount / numberOfFriends;
//     return splitAmount;
// }


// activityRoutes.post('/', async (req: Request ,res: Response) => {
//     const {userID, totalAmount, selectedFriends } = req.body;

// })
// const splitAmount = calculateSplitAmount(totalAmount, selectedFriends);

//interface Friend {
    //name: string;
    //check: boolean;
//}

//export async function getFriendList (req: Request, res: Response) {
    //try {
        //const userID = req.session.userID;
        //const friends = await client.query(
            //`SELECT user1_id, user2_id FROM friends
            //INNER JOIN users
           // ON friends.id = $1`, [userID]
        //);

       // const friendList: Friend[] = friends.map((friend: string) => {
            //return {name: friend, check: false};
       // });

        //res.json(friendList);


   // }
//}


