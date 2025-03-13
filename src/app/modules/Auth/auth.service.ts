import { sendEmail } from "./../../utils/sendEmail";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ILoginUser, IUser } from "./auth.interface";
import { User } from "./auth.model";
import config from "../../config";
import { createToken, verifyToken } from "./auth.utils";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cacheData, deleteCachedData, getCachedData } from "../../utils/redis.utils";
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import jwt from 'jsonwebtoken';

const signupUser = async (payload: IUser) => {
  const { email } = payload;
  // Check if user exists
  const user = await User.isUserExistsByEmail(email);

  if (user) {
    throw new AppError(409, "User already exists");
  }

  // for verification by Email
  // make random 6 digit of code
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  // Expire time in 1 hour
  //const verificationTokenExpireTime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  const verificationTokenExpireTime = Date.now() + 10 * 60 * 1000; // 10 minute

  // create user
  const newUser = await User.create({
    ...payload,
    verificationToken,
    verificationTokenExpiresAt: verificationTokenExpireTime,
  });

  // send email
  await sendEmail({
    to: email,
    subject: "Email Verification Code TripNest LTD",
    // text: verificationToken,
    text: `Your email verification code is: `+verificationToken,
  });

  // If failed to create an user
  if (!newUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create user");
  }

  return {
    newUser,
  };
};
const verifyEmail = async (code: string) => {
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(409, "Invalid or expired verification code");
  }

  await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      isVerified: true,
      verificationToken: "",
      verificationTokenExpiresAt: null,
    }
  );
  return {
    user,
  };
};

const resendVerifyEmailCode = async (payload: any) => {
  // Check if user exists
  const user = await User.isUserExistsByEmail(payload);
  console.log("payload:",payload);
  if (!user) {
    throw new AppError(409, "User Not Found");
  }

  // for verification by Email
  // make random 6 digit of code
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  // Expire time in 1 hour
  //const verificationTokenExpireTime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  const verificationTokenExpireTime = Date.now() + 10 * 60 * 1000; // 10 minute // 10 minute

  // update user
  const updateUser = await User.findOneAndUpdate(
    {
      email: user.email,
    },
    {
      isVerified: false,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: verificationTokenExpireTime,
    }
  );

  // send email
  await sendEmail({
    to: payload,
    subject: "Email Verification Code TripNest LTD",
    // text: verificationToken,
    text: `Your Verification Code is: `+verificationToken,
  });

  // If failed to create an user
  if (!updateUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to update with new code"
    );
  }

  return {
    updateUser,
  };
};

const loginUser = async (payload: IUser) => {
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Email not found!");
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Wrong Password");

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  await deleteCachedData(`${config.redis_cache_key_prefix}:user:${user.email}:accessToken`);
  await deleteCachedData(`${config.redis_cache_key_prefix}:user:${user.email}:refreshToken`);
  await cacheData(
    `${config.redis_cache_key_prefix}:user:${user.email}:accessToken`,
    accessToken,
    parseInt(config.redis_ttl_access_token as string)
  );
  await cacheData(
    `${config.redis_cache_key_prefix}:user:${user.email}:refreshToken`,
    refreshToken,
    // 3600 * 10,
    parseInt(config.redis_ttl_refresh_token as string)
  );

  return {
    refreshToken,
    accessToken,
    user,
  };
};

const forgotPassword = async (payload: IUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found !");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //const resetTokenExpiresAt = Date.now() + 5 * 60 * 1000; // 1 hour
  const resetTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minute

  await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: resetTokenExpiresAt,
    }
  );

  const resetUILink = `${config.reset_pass_ui_link}${resetToken}`;

  // send email
  await sendEmail({
    to: user.email,
    subject: "check your email",
    text: resetUILink,
  });
};

const resetPassword = async (password: string, token: string) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid or expired reset token");
  }

  const newHashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      password: newHashedPassword,
      resetPasswordToken: "",
      resetPasswordExpiresAt: null,
    }
  );
};

const getUsers = async () => {
  const users = await User.find();

  if (!users.length) {
    throw new AppError(409, "Users not found");
  }

  return { users };
};


const refreshTokenService = async (token: string) => {
  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized. Login first",
    );
  }


  try{
    const decoded = jwt.verify(token, config.jwt_refresh_secret as string);

    const { email  } = decoded as JwtPayload;

    const cachedToken = await getCachedData(`${config.redis_cache_key_prefix}:user:${email}:refreshToken`);
    // console.log(cachedToken)

    if (cachedToken !== token) {
      // console.log("here is a cached token");
      throw new AppError(httpStatus.UNAUTHORIZED, "Token is not valid");
    }

    const user = await User.isUserExistsByEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
    }

    const jwtPayload = {
      // id: user._id,
      email: user.email,
      role: user.role as string,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    await cacheData(
      `${config.redis_cache_key_prefix}:user:${user.email}:accessToken`,
      accessToken,
      10,
    );

    return { accessToken };

  }
  catch(error){
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
    throw new AppError(httpStatus.UNAUTHORIZED, "Token is not valid");
  }

}
  


export const AuthServices = {
  signupUser,
  verifyEmail,
  resendVerifyEmailCode,
  loginUser,
  forgotPassword,
  resetPassword,
  getUsers,
  refreshTokenService,
};
