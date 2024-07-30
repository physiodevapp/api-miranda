import express from 'express';
import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    interface User {
      email: string;
    }

    interface Request {
      cookies: {
        token?: string; 
        [key: string]: any;
      };
      user?: User | null;
    }
  }
}

export {};