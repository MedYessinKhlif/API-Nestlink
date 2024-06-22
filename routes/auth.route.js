import express from 'express';
import { google, signOut, contactLandlord } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', google);
router.get('/signout', signOut);
router.post('/contact-landlord', contactLandlord);

export default router;