import { Schema, model } from "mongoose";
import {
  ContactInterface,
  ContactStatusType,
} from "../interfaces/Contact.interface";
import { emailRegex } from "../utils/validator";

const contactSchema = new Schema<ContactInterface>(
  {
    status: {
      String,
      enum: Object.values(ContactStatusType),
      default: ContactStatusType.Unset,
    },
    first_name: { String, required: [true, "First name is required"] },
    last_name: { String, required: [true, "Last name is required"] },
    email: {
      String,
      required: true,
      validate: {
        validator: (email: string) => emailRegex.test(email),
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phone: { String, required: [true, "Phone number is required"] },
    subject: { String, required: [true, "Subject is required"] },
    message: { String, required: [true, "Message is required"] },
    datetime: { String, required: true },
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

export const Contact = model<ContactInterface>("Contact", contactSchema)
