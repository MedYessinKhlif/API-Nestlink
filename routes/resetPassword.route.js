import express from 'express';
import { send, verify, setNew } from '../controllers/resetPassword.controller.js';

const router = express.Router();

router.post('/', send);
router.get('/:id/:token', verify);
router.post('/:id/:token', setNew);

export default router;
