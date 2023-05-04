import express from 'express';
import { Request, Response } from 'express';
import { client } from './main';
import { logger } from './logger';
import { isLoggedIn } from './loginRoutes';
// import { UserHistory, History } from './type';

export const groupsRoutes = express.Router();

groupsRoutes.get('/create-group', isLoggedIn, loadFriends); // load friend list
groupsRoutes.post('/create-group', isLoggedIn, createGroup); // create group
groupsRoutes.get('/', isLoggedIn, loadGroup) // load user group
// groupsRoutes.get('/group-detail', isLoggedIn, loadGroupDetail)

export async function loadFriends(req: Request, res: Response){
    try{
        const userID = req.session.userID;
        const friendList = await client.query(`SELECT friends.*, users.nickname, users.id as user_id FROM friends 
        INNER JOIN users ON users.id = user1_id AND users.id != $1 
        OR users.id = user2_id AND users.id != $1 
        WHERE user1_id = $1 OR user2_id = $1 ORDER BY users.nickname`,[
            userID
        ])
        if (friendList.rowCount){
            res.json({success: true, friendList: friendList.rows})
        } else{
            res.json({success: false, msg: "Wake up, you don't have friends"})
        }
    } catch(e){
        logger.error(`[Err011] ${e}`)
        res.status(400).json({success: false, msg: '[Err011]'})
    }
}

export async function createGroup(req: Request, res: Response) {
    try{
        const userID = req.session.userID;
        const {groupName ,friendsID} = req.body;
        const checkisExist = await client.query(`SELECT groups.name, groups.id FROM user_group INNER JOIN groups ON user_group.group_id = groups.id 
        INNER JOIN users ON users.id = user_group.user_id WHERE users.id = $1 AND groups.name = $2`,[
            userID,
            groupName
        ])
        if (checkisExist.rowCount){
            res.json({success: false, msg: 'Group name existed'})
            return
        }
        await client.query(`INSERT INTO groups (name, creator_id) VALUES ($1, $2)`,[
            groupName,
            userID
        ])
        const groupID = await client.query(`SELECT id FROM groups WHERE name = $1 AND creator_id = $2`,[
            groupName,
            userID
        ])
        await client.query(`INSERT INTO user_group (group_id, user_id) VALUES ($1, $2)`,[
            groupID.rows[0].id,
            userID
        ])
        friendsID.forEach(async (friendID: number) => {
            await client.query(`INSERT INTO user_group (group_id, user_id) VALUES ($1, $2)`,[
                groupID.rows[0].id,
                friendID
            ])
        });
        res.json({success: true});
    } catch(e){
        logger.error(`[Err012] ${e}`)
        res.status(400).json({success: false, msg: '[Err012]'})
    }
}

async function loadGroup(req: Request, res: Response) {
    try{
        const userID = req.session.userID;
        const userGroup = await client.query(`SELECT groups.name, groups.id FROM user_group INNER JOIN groups ON user_group.group_id = groups.id 
        INNER JOIN users ON users.id = user_group.user_id WHERE users.id = $1`,[
            userID
        ])
        res.json(userGroup.rows)

    }catch(e){
        logger.error(`[Err013] ${e}`);
        res.status(400).json({success: false, msg: '[Err013]'});
    }
}

// async function loadGroupDetail(req: Request, res: Response) {
//     try{
//         const groupID = req.query.groupID
//         const groupMemberInfo = await client.query(`SELECT groups.name, groups.id as group_id,user_group.user_id, users.nickname, users.image FROM groups INNER JOIN user_group ON groups.id = user_group.group_id INNER JOIN users ON users.id = user_group.user_id
//         WHERE groups.id = $1 AND users.id != $2`,[
//             groupID,
//             req.session.userID
//         ])
//         const groupEventsInfo = await client.query(``)
//         res.json(groupID)
//     }catch(e){
//         logger.error(`[Err014] ${e}`);
//         res.status(400).json({success: false, msg: '[Err014]'});
//     }
// }