import express from 'express';

import  {signup, verify} from '../controllers/signup.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.get("/:id/verify/:token", verify);

export default router;