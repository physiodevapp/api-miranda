import { model, Schema } from "mongoose";
import {
  UserInterface,
  UserJobType,
  UserStatusType,
} from "../interfaces/User.interface";
import { emailRegex } from "../utils/validator";
import bcrypt from "bcrypt";
import { APIError } from "../utils/APIError";

const userSchema = new Schema<UserInterface>(
  {
    first_name: { type: String, required: [true, "First name is required"] },
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

userSchema.pre<UserInterface>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      const customError = new APIError(
        "Error while trying to hash the password",
        500,
        false
      );

      next(customError);
    }
  }
});

userSchema.methods.checkPassword = function (
  password: string
): Promise<Boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model<UserInterface>("User", userSchema);
