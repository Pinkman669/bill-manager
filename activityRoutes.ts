import express from 'express'
import {Request, Response} from 'express'
import { client } from './main';
import { isLoggedIn } from './loginRoutes';

export const activityRoutes = express.Router();

// get the friends list
activityRoutes.get('/', (req: Request, res: Response) => {
    const userID = req.session.userID;
    const friends = client.query(`SELECT user1_id FROM friends INNER JOIN users ON friends.id = users.id`.[userID])
})



