import mongoose from "mongoose";
import HttpException from "./HttpException.js";

export function ObjectId(id) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new HttpException(
      400,
      !id
        ? "Id required to perform this action"
        : "Invalid id format, Try again!"
    );
  }
  return id;
}
