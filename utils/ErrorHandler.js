class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//   throw new MyCustomError("Something went wrong");
export default ErrorHandler;
