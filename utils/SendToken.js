export const sendToken = (res, user, message, statusCode = 200) => {
  const option = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true, // when deploy make   --->  secure = true;
    sameSite: "none",
  };

  const token = user.getJWTToken();

  user = user.toObject();
  delete user.password;

  res.status(statusCode).cookie("token", token, option).json({
    success: true,
    message,
    user,
  });
};
