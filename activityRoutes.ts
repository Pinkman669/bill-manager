import express from 'express'
import {Request, Response} from 'express'
import { client } from './main';
// import { isLoggedIn } from './loginRoutes';

export const activityRoutes = express.Router();

//get the friends list
activityRoutes.get('/', async (req: Request, res: Response) => {
    const userID = req.session.userID;
    const friends = await getFriends(userID!);
    res.json(friends)
})

async function getFriends(userID: number) {
    const friendsList = await client.query(
        `SELECT user1_id, user2_id FROM friends
        INNER JOIN users
        ON friends.id =$1`, [userID]);
        return friendsList.rows;
}

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

//activityRoutes.get('/',async (req:Request, res: Response) => {
    //try{
        //const friendsResponse = await 
    //}
    
//})



