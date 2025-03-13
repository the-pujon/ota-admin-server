import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";
import AppError from "../../errors/AppError";

const signupUser = catchAsync(async (req, res) => {
  const { ...users } = req.body;
  const newUser = await AuthServices.signupUser(users);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data: newUser,
  });
});
const verifyEmail = catchAsync(async (req, res) => {
  const { code } = req.body;
  const result = await AuthServices.verifyEmail(code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email Verified Successfully!",
    data: result,
  });
});

const resendVerifyEmailCode = catchAsync(async (req, res) => {
  const { email } = req.body;
  console.log("request: ", req.body);
  const result = await AuthServices.resendVerifyEmailCode(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Resend Email Verification code",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, user, refreshToken } = result;
  res.cookie("accessToken", accessToken, {
    // secure: process.env.NODE_ENV === 'production',
    secure: true,
    httpOnly: true,
    sameSite: "none", // Change from "strict" to "none" for cross-site requests
    maxAge: 1000 * 60 * 60 * 24 * 365,
    path: "/", // Explicitly set the path
  });

  res.cookie("refreshToken", refreshToken, {
    // secure: process.env.NODE_ENV === 'production',
    secure: true,
    httpOnly: true,
    sameSite: "none", // Change from "strict" to "none" for cross-site requests
    maxAge: 1000 * 60 * 60 * 24 * 365,
    path: "/", // Explicitly set the path
  });
  res.cookie("accessToken2", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
    path: "/",
    // domain: ".vercel.app", // Specify the domain explicitly
  });
  // Add this alongside your other cookies
  res.cookie("debugTest", "testValue", {
    secure: true,
    httpOnly: false, // Make it visible to JS
    sameSite: "none",
    maxAge: 60000, // 1 minute for testing
    path: "/",
  });
  console.log("sending response");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: {
      accessToken,
      user,
    },
  });
});

const refreshTokenController = catchAsync(async (req, res) => {
  // console.log("here is refresh token controller")
  const { refreshToken } = req.cookies;
  // console.log(refreshToken)
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is required");
  }
  const result = await AuthServices.refreshTokenService(refreshToken);

  // console.log("result: ", result);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
    sameSite: "strict", // Or 'Lax' or 'None' depending on your setup
  });

  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  res.cookie("accessToken2", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "access token in successfully",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sent email successfully!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong !");
  }

  const result = await AuthServices.resetPassword(password, token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "password Update successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  // res.clearCookie("accessToken");
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
    sameSite: "strict", // Or 'Lax' or 'None' depending on your setup
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
    sameSite: "strict", // Or 'Lax' or 'None' depending on your setup
  });

  res.clearCookie("isTokenValid", {
    httpOnly: false,
    secure: false, // Set to true if using HTTPS
    sameSite: "none", // Or 'Lax' or 'None' depending on your setup
  });

  res.clearCookie("role", {
    httpOnly: false,
    secure: false, // Set to true if using HTTPS
    sameSite: "none", // Or 'Lax' or 'None' depending on your setup
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged out successfully",
    data: [],
  });
});

const getUsers = catchAsync(async (req, res) => {
  const users = await AuthServices.getUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Getting all Users ",
    data: users,
  });
});

export const AuthControllers = {
  signupUser,
  verifyEmail,
  resendVerifyEmailCode,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  getUsers,
  refreshTokenController,
};
