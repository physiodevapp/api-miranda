
import Express from 'express'
import { greetings } from '../controllers/sample.controller'
import { headers } from '../middlewares/response.middleware';

export const router = Express.Router();

router.get("/", headers, greetings)
