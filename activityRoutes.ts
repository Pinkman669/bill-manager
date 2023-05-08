import express from 'express'
import {Request, Response} from 'express'
import { client } from './main';
import { loadFriends, loadGroup } from './groupsRoutes';
import { isLoggedIn } from './loginRoutes';
import {logger} from './logger'

export const activityRoutes = express.Router();


//get the friends list
activityRoutes.get('/', isLoggedIn, loadFriends);
activityRoutes.post('/create-activity', isLoggedIn, createActivity)
activityRoutes.get('/searchUsers/:nameInput', isLoggedIn, searchUsers)
activityRoutes.post('/addFriend', isLoggedIn, addFriend)
activityRoutes.get('/loadGroups', isLoggedIn, loadGroup)


async function createActivity(req: Request, res: Response) {
    try{
        const actInfo = req.body
        
        // Calculate shares to amount
        if (actInfo.method instanceof Object){
            console.log(actInfo.method)
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
        console.log(actInfo)
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

        // Insert events
        await client.query(`INSERT INTO events (user_id, msg, name, date, method, amount) VALUES ($1, $2, $3, $4, $5, $6)`,[
            Number(actInfo.requestorID),
            actInfo.message,
            actInfo.actName,
            actInfo.actDate,
            actInfo.method,
            Number(actInfo.totalAmount)
        ])
        const eventID = await client.query(`SELECT id FROM events WHERE user_id = $1 AND name = $2 AND date = $3 AND method = $4 AND amount =$5`,[
            Number(actInfo.requestorID),
            actInfo.actName,
            actInfo.actDate,
            actInfo.method,
            Number(actInfo.totalAmount)
        ])
        // Insert records
        for (let i in actInfo.receiversInfo.userID){
            await client.query(`INSERT INTO records (requestor_id, receiver_id, event_id, amount) VALUES ($1,$2,$3,$4)`,[
                Number(actInfo.requestorID),
                Number(actInfo.receiversInfo.userID[i]),
                eventID.rows[0].id,
                Number(actInfo.receiversInfo.userAmount[i])
            ])
        }
        res.json({success: true, msg: 'Activity created successfully!'})
    } catch(e){
        logger.error(`[Err013] ${e}`)
        res.json({success: false, msg: '[Err013]Failed to create activity'})
    }
}


async function searchUsers(req: Request, res: Response) {
    try{
        const searchName = req.params.nameInput
        const userID = req.session.userID
    
        const notFriendList = await client.query(`SELECT users.id, users.email FROM users 
        WHERE users.nickname LIKE $2 AND users.id != $1 AND users.id NOT IN (SELECT users.id FROM friends 
        INNER JOIN users ON users.id = user1_id AND users.id != $1 
        OR users.id = user2_id AND users.id != $1 
        WHERE user1_id = $1 OR user2_id = $1)`,[
            userID,
            `${searchName}%`
        ])
        res.json({success: true, usersList: notFriendList.rows})
    }catch(e){
        logger.error(`[Err014] ${e}`)
        res.json({success: false, msg: '[Err014] Failed to retrieve users'})
    }
}

async function addFriend(req: Request, res: Response) {
    try{
        const userID = req.session.userID
        const userNameInput = req.body.userNameInput
        const userIDInput = await client.query(`SELECT id FROM users WHERE email = $1`,[userNameInput])
        const friendisExisted = await client.query(`SELECT * FROM friends WHERE user1_id = $1 AND user2_id = $2 OR user1_id = $2 AND user2_id = $1`,[
            userIDInput.rows[0].id,
            userID
        ])
        if (friendisExisted.rowCount){
            res.json({success: false, msg: 'Friend existed'})
            return
        }
        await client.query(`INSERT INTO friends (user1_id, user2_id) VALUES($1,$2)`,[
            userIDInput.rows[0].id,
            userID
        ])
        res.json({success: true, msg: 'Friend added!'})
    }catch(e){
        logger.error(`[Err015] ${e}`)
        res.json({success: false, msg: '[Err015] Failed to add friend'})
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


