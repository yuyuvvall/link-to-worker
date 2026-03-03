import mongoose from 'mongoose'

export interface IUser {
    email: string;
    password: string;
    photo?: string;
}

const userSchema = new mongoose.Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
})

export default mongoose.model<IUser>('User', userSchema)
