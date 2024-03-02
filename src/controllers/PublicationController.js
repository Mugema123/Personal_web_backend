import { HttpException } from '../exceptions/HttpException.js';
import { uploads } from '../helpers/cloudinary.js';
import { paginate } from '../helpers/pagination.js';
import Publication from '../models/Publication.js';

export default class PublicationController {
  static async create(req, res) {
    const reqData = req.body;
    try {
      if (!req.user?.name) {
        throw new HttpException(
          400,
          'User name invalid or not logged in!',
        );
      }
      const newData = await Publication.create({
        ...reqData,
        name: req.user.name,
        userId: req.user._id,
        userModel:
          req.user.accountType === 'Google' ? 'googleUser' : 'User',
      });
      return res.status(201).json({
        status: 201,
        data: newData,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async getAll(req, res) {
    try {
      const { sortBy } = req.query;
      const { all } = req.query;
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const offset = (page - 1) * limit;
      const allData = await Publication.find(
        all !== 'admin' ? { isAccepted: true } : undefined,
      )
        .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
        .skip(offset)
        .limit(limit);
      const count = await Publication.count();

      const pagination = paginate(count, limit, page);
      return res.status(200).json({
        status: 200,
        data: allData,
        pagination,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async getOne(req, res) {
    const { id } = req.params;
    try {
      const findOne = await Publication.findById(id);
      if (!findOne) {
        throw new HttpException(404, 'No publication found');
      }
      return res.status(201).json({
        status: 201,
        data: findOne,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const reqData = req.body;
    try {
      if (reqData.cover) {
        reqData.cover = (
          await uploads(reqData.cover, 'publications')
        ).secure_url;
      }
      const findOne = await Publication.findOneAndUpdate(
        { _id: id },
        reqData,
        { new: true },
      );
      if (!findOne) {
        throw new HttpException(404, 'No publication found');
      }
      return res.status(201).json({
        status: 200,
        data: findOne,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      const findOne = await Publication.findOneAndDelete({
        _id: id,
      });
      if (!findOne) {
        throw new HttpException(404, 'No Publication found');
      }
      return res.status(200).json({
        status: 200,
        data: findOne,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message:
          error.message ||
          'Something went wrong, try to reload the page.',
      });
    }
  }
}
