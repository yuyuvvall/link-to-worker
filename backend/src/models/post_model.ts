import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  photoUrl?: string;
  authorId: Types.ObjectId;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  photoUrl: { type: String },
  createdAt:{ type: Date, default: Date.now },
});

export default model<IPost>("Post", postSchema);
