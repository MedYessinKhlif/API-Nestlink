import { errorHandler } from '../utils/error.js';
import { User } from '../models/user.model.js';
import Token from '../models/token.model.js';
import sendEmail from '../utils/sendEmail.js';

import bcrypt from 'bcrypt';
import bcryptjs from 'bcryptjs';

import crypto from 'crypto';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

export const send = async (req, res) => {
    try {
		const emailSchema = Joi.object({
			email: Joi.string().email().required().label("Email"),
		});
		const { error } = emailSchema.validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		let user = await User.findOne({ email: req.body.email });
		if (!user)
			return res
				.status(409)
				.send({ message: "User with the provided email does not exist." });

		let token = await Token.findOne({ userId: user._id });
		if (!token) {
			token = await new Token({
				userId: user._id,
				token: crypto.randomBytes(32).toString("hex"),
			}).save();
		}

		const url = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}/`;
		await sendEmail(user.email, "Nestlink: Password Reset Link", url);
		res
			.status(200)
			.send({ message: "A password reset link has been sent to your email account. Please check your inbox." });
	} catch (error) {
		res.status(500).send({ message: "An internal server error occurred. Please try again later." });
	}
}


export const verify = async (req, res) => {
    try {
		const user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send({ message: "Invalid link" });

		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		res.status(200).send("Valid Url");
	} catch (error) {
		res.status(500).send({ message: "An internal server error occurred. Please try again later." });
	}
}


export const setNew = async (req, res) => {
    try {
        // Validate password schema and other operations...
        
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send({ message: "Invalid link" });

        const token = await Token.findOneAndDelete({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send({ message: "Invalid link" });

        if (!user.verified) user.verified = true;

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        user.password = hashPassword;
        await user.save();

        res.status(200).send({ message: "Password has been successfully reset." });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).send({ message: "An internal server error occurred. Please try again later." });
    }
}



