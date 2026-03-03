import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    photo?: string;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        photo: { type: String },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default model<IUser>('User', userSchema);