
import { Request, Response, NextFunction } from "express"

export const greetings = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    text: "Hello World"
  })
}