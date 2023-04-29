import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';

export const friendsRoutes = express.Router();

friendsRoutes.get('/', isLoggedIn,userTotalAmount);
// friendsRoutes.get('/', isLoggedIn,btwFriendsAmount);


export async function userTotalAmount(req: Request, res: Response) {
    try {
        const userID = req.session.userID
        // console.log(`User ID: ${userID}`);
        // console.log(`Session: ${JSON.stringify(req.session,null,2)}`);
        const userInfo = await client.query(`SELECT nickname FROM users WHERE id = $1`, [
            userID
        ]);
       
        const usersRecordsReq = await client.query(
            `SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users ON records.receiver_id = users.id 
            WHERE
            records.requestor_id = $1  AND records.due = false AND records.accepted = true
            ORDER BY 
            records.receiver_id`,[
                userID
            ])

        const usersRecordsRes = await client.query(
            `SELECT 
            records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
            FROM
            records INNER JOIN users ON records.requestor_id = users.id 
            WHERE
            records.receiver_id = $1  AND records.due = false AND records.accepted = true
            ORDER BY 
            records.requestor_id`,[
                userID
            ])
        
        //    console.log(`all records:${JSON.stringify(usersRecords,null,2)}`);
           
        let totalAmount:number = 0;

        // get the total req amount: 
        for (let i of usersRecordsReq.rows ){
                totalAmount += i.amount;
                console.log(`totalAmount: + ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},fd_id${i.id},name:${i.nickname}`);
        }
        // get the total res amount: 
        for (let i of usersRecordsRes.rows ){
            totalAmount -= i.amount;
            console.log(`totalAmount: - ${i.amount} = ${totalAmount},req:${i.requestor_id} ,res:${i.receiver_id},fd_id${i.id},name:${i.nickname}`);
        } 

        console.log(`total amount: ${totalAmount}`)
        
        // friends amount ===================================================================

        interface allFriendsAmount{
         friendID: number;
         friendsName: string;
         friendsImage: string;
        }
        let allFriendsAmount ={};
        

            for (let i of usersRecordsReq.rows ){
                    if (i.receiver_id in allFriendsAmount){
                        allFriendsAmount[i.receiver_id] += i.amount;
                        console.log(`friendAmountreq: + ${i.amount},allFriendsAmount: ${JSON.stringify(allFriendsAmount,null,2)}`);
        
                    }
                    else{
                        allFriendsAmount[i.receiver_id] = i.amount;
                        console.log(`NEWreq: + ${i.amount},allFriendsAmount: ${JSON.stringify(allFriendsAmount,null,2)}`);
                    }
                }
            
            for (let i of usersRecordsRes.rows ){
                    if (i.request_id in allFriendsAmount){
                        allFriendsAmount[i.request_id] -= i.amount;
                        console.log(`friendAmountres: - ${i.amount},allFriendsAmount: ${JSON.stringify(allFriendsAmount,null,2)}`);
                    }
                    else{
                        allFriendsAmount[i.request_id] = -(i.amount);
                        console.log(`NEWres: - ${i.amount},allFriendsAmount: ${JSON.stringify(allFriendsAmount,null,2)}`);
                    }
                }
            res.json({ user: userInfo.rows,totalBalance: totalAmount,friendsRecords: allFriendsAmount});
            // console.log( res.json({ user: userInfo.rows,totalBalance: totalAmount}))
    
        } catch (e) {
            logger.error('[Err003] User not found ' + e)
            res.json({ success: false, msg: '[ERR003]' })
        }
    }
    
        // for (let i of usersRecordsReq.rows ){
        // //  let friend = i.id
        // // //  let amount:number = 0;
        // // if (i.receiver_id=friend){
        //     if (friend in allFriendsAmount){
        //         allFriendsAmount[friend] += i.amount;
        //     }
        //     else{
        //         allFriendsAmount[friend] = i.amount;
        //     }
        //  }else{
        //     continue;
        //  }
        // }


        

     
        
//______________________________________________________________________________________________________________________________________________________________________________________________________________________________________

// export async function btwFriendsAmount(req: Request, res: Response) {
//     try {
//         const userID = req.session.userID
//         // console.log(`User ID: ${userID}`);
//         // console.log(`Session: ${JSON.stringify(req.session,null,2)}`);
//         const userInfo = await client.query(`SELECT nickname FROM users WHERE id = $1`, [
//             userID
//         ])
           
        
//         const usersRecords = await client.query(
//             `SELECT 
//             records.id, records.requestor_id, records.receiver_id, records.amount, records.due, records.accepted, users.id, users.nickname, users.image
//             FROM
//             records INNER JOIN users 
//             ON
//             records.requestor_id = $1 OR records.receiver_id =$1
//             WHERE
//             users.id = $1 AND records.due = false AND records.accepted = true
//             ORDER BY 
//             records.id`,[
//                 userID
//             ])
            
//            console.log(`all records:${JSON.stringify(usersRecords,null,2)}`);

//            interface friendsAmount{
//             friendID: number;
//            }
//            let friendsAmount ={};

//         for (let i of usersRecords.rows ){
//             let friendID:number = 0;
        
//             if (i.requestor_id == i.id){
//                 friendID = i.receiver_id;
//                 if (friendID in friendsAmount){
//                     friendsAmount[friendID] += i.amount;
//                     console.log(`friend(+): ${friendsAmount}`)
//                 }else{
//                     friendsAmount[friendID] = i.amount;
//                     console.log(`new friend added(+): ${friendsAmount}`)
//                 }
//             }else if (i.receiver_id == i.id){
//                 friendID = i.requestor_id;
//                 if (friendID in friendsAmount){
//                     friendsAmount[friendID] -= i.amount;
//                     console.log(`friend(-): ${friendsAmount}`)
//                 }else{
//                     friendsAmount[friendID] = i.amount;
//                     console.log(`new friend added(-): ${friendsAmount}`)
//                 }
//             }
//             }

//         // console.log(`final:${friendsAmount}`)
//         res.json({ user: userInfo.rows,friendsRecords: friendsAmount});
//         console.log( res.json({ user: userInfo.rows,totalBalance: friendsAmount}))

//     } catch (e) {
//         logger.error('[Err003] User not found ' + e)
//         res.json({ success: false, msg: '[ERR003]' })
//     }
// }

// ===================================================================

// for (let i of usersRecords.rows ){
//     let friendID:number = 0;

//     if (i.requestor_id == i.id){
//         friendID = i.receiver_id;
//         if (friendID in friendsAmount){
//             friendsAmount[friendID] += i.amount;
//             console.log(`friend(+): ${friendsAmount}`)
//         }else{
//             friendsAmount[friendID] = i.amount;
//             console.log(`new friend added(+): ${friendsAmount}`)
//         }
//     }else if (i.receiver_id == i.id){
//         friendID = i.requestor_id;
//         if (friendID in friendsAmount){
//             friendsAmount[friendID] -= i.amount;
//             console.log(`friend(-): ${friendsAmount}`)
//         }else{
//             friendsAmount[friendID] = i.amount;
//             console.log(`new friend added(-): ${friendsAmount}`)
//         }
//     }
//     }