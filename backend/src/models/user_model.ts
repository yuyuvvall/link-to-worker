import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    photo?: string;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        photo: { type: String },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default model<IUser>('User', userSchema);