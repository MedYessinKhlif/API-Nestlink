import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const { Schema } = mongoose;

const userSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    avatar: { type: String, default: 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png' } // Use the imported default avatar
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return token;
};

const User = mongoose.model('User', userSchema);

const validate = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().regex(/^[a-zA-Z\s]+$/).min(8).max(25).required().label("fullName"),
        email: Joi.string().email().required().label('Email'),
        password: passwordComplexity().required().label('Password'),
    });
    return schema.validate(data);
};

export { User, validate };
