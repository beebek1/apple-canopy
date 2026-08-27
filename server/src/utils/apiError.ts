export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: any;

  constructor(statusCode: number, message= "something went wrong", errors= []){
    super(message),
    this.statusCode = statusCode,
    this.success = false,
    this.errors = errors
  }
}