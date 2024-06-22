import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

import Listing from '../models/listing.model.js'; // Import the Listing model
import contactViaEmail from '../utils/contactViaEmail.js';

export const contactLandlord = async (req, res, next) => {
  try {
    const { email, subject, message, listingId } = req.body;

    // Ensure required fields are provided
    if ( !email || !subject || !message || !listingId) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Send email to the landlord
    const info = await contactViaEmail(email, subject, message, listingId);

    // Respond with success message
    return res.status(200).json({ message: "Email sent to landlord successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Error sending email to landlord" });
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        fullName: req.body.name, // Set fullName to the user's name as it is
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};



