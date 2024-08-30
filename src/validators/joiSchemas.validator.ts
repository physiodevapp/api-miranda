import Joi from 'joi';
import { UserJobType, UserStatusType } from '../interfaces/User.interface';
import { RoomFacility, RoomStatusType, RoomType } from '../interfaces/Room.interface';

// Email regex pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Custom transformation function to handle string dates
const transformDate = (value: any, helpers: Joi.CustomHelpers) => {
  // If the value is already a Date object, return it as is
  if (value instanceof Date) return value;

  // Try to parse the value as a date string
  const parsedDate = new Date(value);
  
  // If the parsed date is invalid, return an error
  if (isNaN(parsedDate.getTime())) {
    return helpers.error('date.base');
  }

  // Return the parsed date
  console.log('parsedDate ', parsedDate);
  return parsedDate;
};

export const userSchema = Joi.object({
  first_name: Joi.string()
    .required()
    .messages({
      'string.base': 'First name must be a string',
      'string.empty': 'First name is required',
    }),
  
  last_name: Joi.string()
    .required()
    .messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name is required',
    }),
  
  photo: Joi.string()
    .required()
    .messages({
      'string.base': 'Photo must be a string',
      'string.empty': 'A user\'s photo is required',
    }),
  
  start_date: Joi.alternatives()
    .try(
      Joi.date().iso(),         // ISO date format
      Joi.string().isoDate()    // String in ISO date format
    )
    .custom(transformDate)
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'string.base': 'Start date must be a valid date string',
      'date.empty': 'Starting date is required',
      'string.empty': 'Starting date is required',
    }),
  
  job_description: Joi.string()
    .required()
    .messages({
      'string.base': 'Job description must be a string',
      'string.empty': 'Job description is required',
    }),
  
  telephone: Joi.string()
    .required()
    .messages({
      'string.base': 'Telephone must be a string',
      'string.empty': 'Phone number is required',
    }),
  
  status: Joi.string()
    .valid(...Object.values(UserStatusType))
    .required()
    .messages({
      'string.base': 'Status must be a string',
      'string.empty': 'Please, choose a type of status',
      'any.only': 'Status must be one of the following values: FULL_TIME, PART_TIME', // Modify this message as needed
    }),
  
  job: Joi.string()
    .valid(...Object.values(UserJobType))
    .required()
    .messages({
      'string.base': 'Job must be a string',
      'string.empty': 'Please, choose a type of job',
      'any.only': 'Job must be one of the following values: FULL_TIME, PART_TIME', // Modify this message as needed
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .regex(emailRegex)
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'string.pattern.base': 'Email address is not valid',
    }),
});

export const roomSchema = Joi.object({
  number: Joi.number()
    .required()
    .messages({
      'number.base': 'Room number must be a number',
      'any.required': 'Room number is required',
    }),
  
  description: Joi.string()
    .allow('', null) // Allow empty or null if optional
    .messages({
      'string.base': 'Description must be a string',
    }),

  facilities: Joi.array()
    .items(Joi.string().valid(...Object.values(RoomFacility)))
    .messages({
      'array.base': 'Facilities must be an array of strings',
      'string.base': 'Each facility must be a string',
      'any.only': 'Facility must be one of the valid values',
    }),

  name: Joi.string()
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'any.required': 'Name is required',
    }),

  cancellation_policy: Joi.string()
    .required()
    .messages({
      'string.base': 'Cancellation policy must be a string',
      'any.required': 'Cancellation policy is required',
    }),

  has_offer: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Has offer must be a boolean',
    }),

  type: Joi.string()
    .valid(...Object.values(RoomType))
    .default(RoomType.Double_bed)
    .messages({
      'string.base': 'Type must be a string',
      'any.only': 'Type must be one of the valid values',
    }),

  price_night: Joi.number()
    .required()
    .messages({
      'number.base': 'Price per night must be a number',
      'any.required': 'Price per night is required',
    }),

  discount: Joi.number()
    .default(0)
    .messages({
      'number.base': 'Discount must be a number',
    }),

  status: Joi.string()
    .valid(...Object.values(RoomStatusType))
    .default(RoomStatusType.Available)
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of the valid values',
    }),

  photos: Joi.array()
    .items(Joi.string().uri()) // Assuming photos are URLs, use .uri() to validate them
    .required()
    .messages({
      'array.base': 'Photos must be an array of strings',
      'string.base': 'Each photo must be a string',
      'string.uri': 'Each photo must be a valid URI',
    }),
});