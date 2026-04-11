import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  profilePicture: string;
  coverPicture: string;
  bio: string;
  country: string;
  accountStatus: {
    isSuspended: boolean;
    isDisabled: boolean;
    isDeleted: boolean; // 🚀 The Soft-Delete Flag
  };
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, trim: true, default: "" },
  profilePicture: { type: String, default: "" },
  coverPicture: { type: String, default: "" },
  bio: { type: String, default: "", maxLength: 500 },
  country: { type: String, default: "" },
  
  // 🚀 Status Flags
  accountStatus: {
    isSuspended: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  }
}, { timestamps: true });

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);