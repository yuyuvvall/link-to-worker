import mongoose from 'mongoose'

export interface IUser {
    email: string;
    password: string;
    photo?: string;
    tokens: string[];
}

const userSchema = new mongoose.Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    tokens: { type: [String], default: [] }
})

export default mongoose.model<IUser>('User', userSchema)
