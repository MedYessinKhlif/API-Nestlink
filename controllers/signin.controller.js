import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import Token from '../models/token.model.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';


export const signin = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (!user)
			return res.status(401).send({ message: "Invalid email or password. Please verify your credentials and try again." });

		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validPassword)
			return res.status(401).send({ message: "Invalid email or password. Please verify your credentials and try again." });

		if (!user.verified) {
			let token = await Token.findOne({ userId: user._id });
			if (!token) {
				token = await new Token({
					userId: user._id,
					token: crypto.randomBytes(32).toString("hex"),
				}).save();
				const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`;
				await sendEmail(user.email, "Nestlink: Verify Email Link ", url);
			}

			return res
				.status(400)
				.send({ message: "An Email sent to your account please verify" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		const { password: pass, ...rest } = user._doc;
		res
			.cookie('access_token', token, { httpOnly: true })
			.status(200)
			.json(rest);
	} catch (error) {
		next(error);
	}
};

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};
