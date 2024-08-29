import Joi from 'joi';
import { UserJobType, UserStatusType } from '../interfaces/User.interface';

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

const userSchema = Joi.object({
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

export default userSchema;
