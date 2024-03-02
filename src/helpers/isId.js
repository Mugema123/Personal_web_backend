import mongoose from 'mongoose';
import { HttpException } from '../exceptions/HttpException.js';

export default function isId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpException(400, 'Invalid id format, Try again!');
  }
  return id;
}
