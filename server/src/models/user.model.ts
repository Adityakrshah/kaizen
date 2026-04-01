import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    authProvider: {
      type: String,
      default: "better-auth"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

export const User = mongoose.model("User", userSchema)