import "express";
import { AuthPayload } from "../services/authService";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthPayload;
  }
}
