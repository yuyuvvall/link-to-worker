import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  photoUrl?: string;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  authorId: Types.ObjectId;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  // TODO: Connect to likes and comments schemas
//   likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
//   comments: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
});

export default model<IPost>("Post", postSchema);
