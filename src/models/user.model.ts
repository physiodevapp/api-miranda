import { model, Schema } from "mongoose";
import {
  UserInterface,
  UserJobType,
  UserStatusType,
} from "../interfaces/User.interface";
import { emailRegex } from "../utils/validator";
import bcrypt from "bcrypt";

const userSchema = new Schema<UserInterface>(
  {
    first_name: { String, required: [true, "First name is required"] },
    last_name: { String, required: [true, "Last name is required"] },
    photo: { String, required: [true, "A user's photo is required"] },
    start_date: { String, required: [true, "Starting date is required"] },
    job_description: {
      String,
      required: [true, "Job description is required"],
    },
    telephone: { String, required: [true, "Phone number is required"] },
    status: { String, enum: Object.values(UserStatusType), required: true },
    job: {
      String,
      enum: Object.values(UserJobType),
      required: [true, "Please, choose a type of job"],
    },
    password: { String, required: [true, "Password is required"] },
    email: {
      String,
      required: true,
      validate: {
        validator: (email: string) => emailRegex.test(email),
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

userSchema.methods.checkPassword = function(password: string) {
  return bcrypt.compare(password, this.password)
}

export const User = model<UserInterface>("User", userSchema);
