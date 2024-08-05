import { model, Schema } from "mongoose";
import {
  UserInterface,
  UserJobType,
  UserStatusType,
} from "../interfaces/User.interface";
import bcryptjs from "bcryptjs";
import { APIError } from "../utils/APIError";
import { emailRegex } from "../utils/validator";

const userSchema = new Schema<UserInterface>(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      unique: true,
    },
    last_name: { type: String, required: [true, "Last name is required"] },
    photo: { type: String, required: [true, "A user's photo is required"] },
    start_date: { type: String, required: [true, "Starting date is required"] },
    job_description: {
      type: String,
      required: [true, "Job description is required"],
    },
    telephone: { type: String, required: [true, "Phone number is required"] },
    status: {
      type: String,
      enum: Object.values(UserStatusType),
      required: true,
    },
    job: {
      type: String,
      enum: Object.values(UserJobType),
      required: [true, "Please, choose a type of job"],
    },
    password: { type: String, required: [true, "Password is required"] },
    email: {
      type: String,
      required: true,
      unique: true,
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
      transform: function (_doc, ret) {
        delete ret.__v;
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      const customError = new APIError({
        message: "Error while trying to hash the password",
        status: 500,
        safe: false,
      });

      next(customError);
    }
  }
});

userSchema.methods.checkPassword = function (
  password: string
): Promise<Boolean> {
  return bcryptjs.compare(password, this.password);
};

export const User = model<UserInterface>("User", userSchema);
