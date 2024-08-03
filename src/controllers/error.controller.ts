import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import mongoose from "mongoose";

export const handleError = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    error = new APIError({message: error.message, status: 400, safe: true})
  } else if (error instanceof mongoose.Error.CastError
    && error.path === '_id') {
    const modelNameMatch = error.stack!.match(/for model "(.+?)"/);
    const modelName = modelNameMatch ? modelNameMatch[1] : undefined;

    error = new APIError({message: `${modelName} not found`, status: 404, safe: true})
  } else if (error.message.includes('E11000')) {
    Object.keys(error.keyValue).forEach((key) => error.keyValue[key] = "Already exists")
    
    error = new APIError({message: "Duplicate key error", status: 409, safe: true, errors: error.keyValue})
  } else if (!error.status) {
    error = new APIError({message: error.message || "Internal Server Error", status: 500, safe: true})
  }

  interface errorData {
    message: string,
    errors?: {
      [key: string]: string;
    };
  }

  const errorData: errorData = {
    message: error.safe ? error.message : "Application error"
  }

  if (error as APIError && error.errors) {
    const errors = Object.keys(error.errors)
      .reduce((errors, errorKey) => {
        errors![errorKey] = error.errors[errorKey]?.message || error.errors[errorKey]

        return errors
      }, {} as {[key: string]: string});

      errorData.errors = errors;
  }

  res.status(error.status || 500).json({error: errorData});
}