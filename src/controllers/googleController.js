import { generateAccessToken } from '../helpers/security.helper.js';
import googleUser from '../models/auth/googleUserModel.js';

const googleAuth = async (request, response) => {
  try {
    const {
      given_name: givenName,
      family_name: familyName,
      email,
      picture,
    } = request.body;
    let user = await googleUser.findOne({ email });

    if (!user) {
      user = new googleUser({
        firstName: givenName,
        lastName: familyName,
        name: `${givenName} ${familyName}`,
        email: email,
        picture: { url: picture },
        isVerified: true,
        role: 'user',
      });

      const token = generateAccessToken(user, response);

      await user.save();

      response.status(200).json({
        result: user,
        Access_Token: token,
      });
    } else {
      const token = generateAccessToken(user, response);

      response.status(200).json({
        result: user,
        Access_Token: token,
      });
    }
  } catch (error) {
    response.status(500).json({
      status: 'Fail',
      errorMessage: error.message,
    });
  }
};

export default { googleAuth };
