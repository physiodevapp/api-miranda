import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { ObjectSchema } from 'joi';

export const dataValidationMiddleware = (schema: ObjectSchema, makeFieldsOptional = false) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    let modifiedSchema = schema;

    if (makeFieldsOptional)
      modifiedSchema = schema.fork(Object.keys(schema.describe().keys), (field) => field.optional());

    const { error, value } = modifiedSchema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error('Validation error:', error);
      const customError = new APIError({message: "Invalid data", status: 400, safe: true});

      return next(customError);
    }

    req.body = value;

    next();
  };
}