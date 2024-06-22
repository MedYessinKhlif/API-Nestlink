
import { User, validate } from '../models/user.model.js';
import Token from '../models/token.model.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';


export const signup = async (req, res) => {
  try {
    // Validate the request body
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(409).send({ message: "A user with the provided email already exists. Please use a different email address." });

    // Generate hashed password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await new User({ ...req.body, password: hashPassword }).save();

    // Generate a verification token and save it
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Construct verification URL with parameters embedded
    const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`;

    // Send verification email with the constructed URL
    await sendEmail(user.email, "Nestlink: Email Verification Link", url);

    res.status(201).send({ message: "An email has been sent to your account. Please verify your email address." });
  } catch (error) {
    console.error("Error in user signup:", error);
    res.status(500).send({ message: "An internal server error occurred. Please try again later." });
  }
};

export const verify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send({ message: "The link provided is invalid. Please check and try again." });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "The link provided is invalid. Please check and try again." });

    // Update user's verified status and remove token
    const updateResult = await User.updateOne({ _id: user._id }, { verified: true });
    console.log(updateResult); 

    const removeResult = await Token.deleteOne({ _id: token._id });
    console.log(removeResult); 
    
    res.status(200).send({ message: "Email has been successfully verified." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send({ message: "An internal server error occurred. Please try again later." });
  }
};