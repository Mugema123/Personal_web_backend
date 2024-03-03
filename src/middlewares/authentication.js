import Jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../helpers/security.helper.js';

const authLogin = async (request, response, next) => {
  const token = request.cookies.accessTokenCookie;
  console.log(request.cookies);
  if (!token) {
    return response.status(401).json({
      invalidToken: 'Please Login to continue!',
    });
  } else {
    try {
      var decoded = verifyAccessToken(token);
      if (decoded) {
        request.user = decoded.data;
        request.token = token;
      } else {
        return response.status(401).json({
          invalidToken: 'Please Login to continue!',
        });
      }
    } catch (error) {
      return response.status(401).json({
        invalidToken: 'Please Login to continue!',
      });
    }
    next();
  }
};
const isAdmin = (req, res, next) =>
  checkRole(req, res, next, 'admin');
const isFinanceAdmin = (req, res, next) =>
  checkRole(req, res, next, 'finance_admin');
const isRegistrarAdmin = (req, res, next) =>
  checkRole(req, res, next, 'registrar_admin');
const isSuperAdmin = (req, res, next) =>
  checkRole(req, res, next, 'super_admin');

const checkRole = async (request, response, next, role) => {
  try {
    const token = request.cookies.accessTokenCookie;
    if (!token) {
      return response.status(401).json({
        invalidToken: 'Please Login to continue!',
      });
    }
    const { data: user } = verifyAccessToken(token);
    if (!user) {
      return response.status(401).json({
        invalidToken: 'Please Login to continue!',
      });
    }

    if (
      !user.role.includes(role || 'none') &&
      user.role !== 'super_admin'
    ) {
      return response.status(403).json({
        invalidToken: `Unauthorized! You must be the ${role
          .split('_')
          .join(' ')} to perform this action`,
      });
    }
    request.user = user;
    request.token = token;
    next();
  } catch (error) {
    return response.status(401).json({
      message: error.message,
      invalidToken: 'Please Login to continue!',
    });
  }
};

const authUserLoggedIn = async (request, response, next) => {
  var token = request.headers['auth_token'];

  if (token) {
    try {
      var decoded = Jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      );
      if (decoded) {
        request.user = decoded.data;
      }
    } catch (error) {
      // console.log(error);;
    }
  }

  next();
};

export default {
  authLogin,
  isAdmin,
  isFinanceAdmin,
  isRegistrarAdmin,
  isSuperAdmin,
  authUserLoggedIn,
};
