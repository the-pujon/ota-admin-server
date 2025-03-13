import { NextFunction, Request, Response } from "express";
// import catchAsync from "../utils/catchAsync.";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
// import config from "../config";
// import { UserModel } from "../modules/auth/auth.model";
import { getCachedData } from "../utils/redis.utils";
// import UserModel from "../modules/auth/auth.model";
import config from "../config";
import { User } from "../modules/Auth/auth.model";
import catchAsync from "../utils/catchAsync";

export const auth = (...requiredRoles: ("admin" | "moderator" | "superAdmin")[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
    

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized. Login first",
      );
    }

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string);

      const { email, role } = decoded as JwtPayload;

      // console.log(email, role)

      const cachedToken = await getCachedData(`${config.redis_cache_key_prefix}:user:${email}:accessToken`);

      if (cachedToken !== token) {
        // console.log("here is cached token", cachedToken)
        throw new AppError(httpStatus.UNAUTHORIZED, "Token is not valid");
      }

      const user = await User.isUserExistsByEmail(email);

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
      }

      if (requiredRoles && !requiredRoles.includes(role)) {
        // console.log("here is a required role")
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You have no access to this route",
        );
      }

      req.user = decoded as JwtPayload;
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Your session has expired. Please login again.",
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid token. Please login again.",
        );
      }
      throw error;
    }
  });
};
