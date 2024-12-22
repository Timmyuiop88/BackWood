import { PrismaClient } from '@prisma/client';
import { APIError, NotFoundError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId; // From auth middleware
    const { receiverId, content } = req.body;

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      throw new NotFoundError('Receiver not found');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: senderId }
        },
        receiver: {
          connect: { id: receiverId }
        },
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    });

    res.json({
      status: 'success',
      messages,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: userId
      }
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });

    res.json({
      status: 'success',
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false
      }
    });

    res.json({
      status: 'success',
      count
    });
  } catch (error) {
    next(error);
  }
}; 