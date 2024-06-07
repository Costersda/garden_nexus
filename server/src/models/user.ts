import { Schema, model } from 'mongoose';
import { UserDocument } from '../types/user.interface';
import validator from 'validator';

const userSchema = new Schema<UserDocument>({
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        validate: [validator.isEmail, 'Please provide a valid email'],
        createIndexes: { unique: true },
    },
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        createIndexes: { unique: true },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
}, {
    timestamps: true,
});

export default model<UserDocument>('User', userSchema);
