import regNumberModel from '../models/regNumberModel.js';

const addRegNumber = async (request, response) => {
  try {
    const newRegNumber = new regNumberModel({
      regNumber: request.body.regNumber,
    });

    const registrationNumber = await newRegNumber.save();

    response.status(200).json({
      successMessage: 'Registration number saved successfully!',
      registrationNumber,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const generateRegNumber = async (req, res) => {
    try {
        const lastReg = await regNumberModel.findOne().sort({ createdAt: -1 });

        let lastRegNumber = lastReg ? lastReg.regNumber : 'A000';
        let prefix = lastRegNumber.substring(0, 1);
        let number = parseInt(lastRegNumber.substring(1));

        number++;

        if (number === 1000) {
            number = 1;
            prefix = String.fromCharCode(prefix.charCodeAt(0) + 1);
        }

        const formattedNumber = number.toString().padStart(3, '0');

        const newRegNumber = prefix + formattedNumber;

        res.status(200).json({ regNumber: newRegNumber });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while generating the registration number.' });
    }
};

export default {
  addRegNumber,
  generateRegNumber,
};
