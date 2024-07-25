import { NextFunction, Request, Response } from "express";

export const headers = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("API-Name", "Miranda-API");
  res.setHeader("API-Version", "0.1.0");

  next();
}