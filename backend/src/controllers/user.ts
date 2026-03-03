import { Response } from "express";
import { AuthenticatedRequest } from "../common/auth_middleware";
import User from "../models/user_model";
import mongoose from 'mongoose';

const sendError = (code: number, message: string, res: Response) => {
    return res.status(code).json({ message });
};


const getUserById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError(404, "User not found", res);
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return sendError(404, "User not found", res);
        }

        return res.json(user);
    } catch (err) {
        sendError(500, "Internal server error", res);
    }
};

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) return sendError(401, "Unauthorized", res);

        const updates = Object.fromEntries(
            Object.entries(req.body).filter(
                ([key]) => !["email", "password", "_id"].includes(key)
            )
        );

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        res.json(updatedUser);
    } catch {
        sendError(500, "Internal server error", res);
    }
};

export default {
    getUserById,
    updateUser,
};