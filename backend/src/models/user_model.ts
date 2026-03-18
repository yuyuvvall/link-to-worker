import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    photo?: string;
    location?: string;
    bannerImageUrl?: string;
    badges?: { iconUrl: string; label: string }[];
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, required: true },
        photo: { type: String },
        location: { type: String },
        bannerImageUrl: { type: String },
        badges: [
            {
                iconUrl: { type: String },
                label: { type: String },
                _id: false,
            },
        ],
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default model<IUser>('User', userSchema);