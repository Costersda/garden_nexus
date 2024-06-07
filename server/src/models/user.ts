import { Schema, model } from 'mongoose';
import { UserDocument } from '../types/user.interface';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err as Error)
    }

});

userSchema.methods.validatePassword = function(password: string) {
    return bcrypt.compare(password, this.password);
};

export default model<UserDocument>('User', userSchema);
