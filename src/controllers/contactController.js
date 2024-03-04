import contactModel from "../models/contactModel.js";
import contactValidationSchema from "../validations/contactValidation.js";
import { sendEmail } from "../helpers/nodemailer.js";
import { ObjectId } from "../helpers/ObjectID.js";
import HttpException from "../helpers/HttpException.js";

const sendMessage = async (request, response) => {
  const { error } = contactValidationSchema.validate(request.body);

  if (error)
    return response.status(400).json({ message: error.details[0].message });

  try {
    const receivedMessage = await contactModel.create({
      names: request.body.names,
      email: request.body.email,
      phoneNumber: request.body.phoneNumber,
      message: request.body.message,
    });
  
    sendEmail({
      to: "ndicunguyesteve4@gmail.com",
      subject: "🔔Notification alert | New Message🔔",
      html: `
                  <div style="padding: 10px 0;">
                      <p style="font-size: 16px;"> You have a new message on <a style="text-decoration: none; color: #00B4D0; cursor: pointer;" href="http://localhost:5173/"> 
                        mugemaleonidas.com
                      </a> </p> 
                  </div>
                  `,
    });

    response.status(201).json({
      message: "Message sent successfully!",
      messageContent: receivedMessage,
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getAllMessages = async (request, response) => {
  try {
    const christianMessages = await contactModel.find().sort({ createdAt: -1 });

    response.status(200).json({
      message: "Successfully retrieved all the messages!",
      data: christianMessages,
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getSingleMessage = async (request, response) => {
  try {
    const christianMessage = await contactModel.findOne({
      _id: request.query.messageId,
    });

    if (!christianMessage) {
      throw new Error("Message not found!");
    }

    response.status(200).json({
      message: "Successfully retrieved the message!",
      christianMessage: christianMessage,
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const deleteMessage = async (request, response) => {
  try {
    const MessageToBeDeleted = await contactModel.findOne({
      _id: request.query.messageId,
    });

    if (MessageToBeDeleted) {
      await MessageToBeDeleted.deleteOne({ _id: request.query.messageId });
    } else {
      throw new Error("Delete error: Message not found!");
    }

    response.status(200).json({
      status: "success",
      message: "Message deleted successfully!",
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const replyMessage = async (request, response) => {
  try {
    const id = ObjectId(request.query.messageId);
    const reply = request.body.replyMessage;
    if (!reply) {
      throw new HttpException(400, "Reply message required!");
    }
    const updated = await contactModel.findByIdAndUpdate(
      id,
      {
        replyMessage: reply,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!updated) {
      throw new HttpException(404, "Message not found!");
    }

    sendEmail({
      to: updated.email,
      subject: "🔔Mugema replied your message🔔",
      html: `
                    <div style="font-size: 14px;">
                        <p>
                        ${reply}
                        </p>
                    </div>
                    `,
    });
    response.status(200).json({ message: "Reply added", data: updated });
  } catch (error) {
    return response.status(error.status || 500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export default {
  sendMessage,
  getAllMessages,
  deleteMessage,
  replyMessage,
  getSingleMessage,
};
