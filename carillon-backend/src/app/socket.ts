/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import logger from './util/logger';
import { Chat, Reaction, User } from './schemas';
import { Types } from 'mongoose';

let _io: Server;

//TODO: refactor to follow DRY

export function startServer(io: Server) {
  _io = io;
  io.on('connection', (socket) => {
    logger.info(`Connected to websocket ${socket.id}`);

    /* Join all participating rooms */
    socket.on('init', async (data) => {
      try {
        logger.debug(`${data.userId} initially join all rooms`);
        const user = await User.findById(data.userId);
        if (!user) {
          throw new Error(`${data.userId} not found`);
        }

        const channels = user.participatingChannels;
        channels.forEach((channel) => {
          logger.debug(`${socket.id} joined ${channel}`);
          if (channel) {
            socket.join(channel.toString());
          }
        });

        const directmessages = user.participatingDMs;
        directmessages.forEach((directmessage) => {
          logger.debug(`${socket.id} joined ${directmessage}`);
          if (directmessage) {
            socket.join(directmessage.toString());
          }
        });
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('join', ({ roomId, userId }) => {
      logger.debug(`${socket.id} joined ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit('join', {
        userId: userId,
      });
    });

    socket.on('postMessage', async (message) => {
      try {
        logger.debug(`${socket.id} sent message: ${message}`);

        //If message.isFile == true, message.content should be url
        //TODO: automatically validate above
        let chat, room;
        if (message.channel) {
          chat = new Chat({
            content: message.content,
            channel: message.channel,
            sender: message.sender,
            isFile: message.isFile,
          });
          room = message.channel;
        } else if (message.directmessage) {
          chat = new Chat({
            content: message.content,
            directmessage: message.directmessage,
            sender: message.sender,
            isFile: message.isFile,
          });
          room = message.directmessage;
        } else {
          throw new Error('Either channel or directmessage should be given');
        }
        await chat.save();

        io.to(room).emit('postMessage', await chat.populate('sender'));
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('editMessage', async (message) => {
      try {
        logger.debug(`${message.sender} edit ${message.chatId}`);

        const chat = await Chat.findById(message.chatId);
        if (!chat) {
          throw new Error('Chat not found');
        } else if (chat.isFile) {
          throw new Error('File type message cannot be edited');
        } else if (chat.isDeleted) {
          throw new Error('Deleted message cannot be edited');
        }

        chat.content = message.content;
        await chat.save();

        let room;
        if (chat.channel) {
          room = chat.channel;
        } else if (chat.directmessage) {
          room = chat.directmessage;
        } else {
          throw new Error('Either directmessage or channel should be existed');
        }

        io.to(room.toString()).emit(
          'editMessage',
          await chat.populate('sender'),
        );
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('deleteMessage', async (message) => {
      try {
        logger.debug(`${message.sender} delete ${message.chatId}`);

        const chat = await Chat.findById(message.chatId);
        if (!chat) {
          throw new Error('Chat not found');
        } else if (chat.isDeleted) {
          throw new Error('Message already deleted');
        } else if (message.sender != chat.sender) {
          throw new Error('Sender does not have the authority');
        }

        chat.content = 'This message is removed from the channel';
        chat.isDeleted = true;
        await chat.save();

        let room;
        if (chat.channel) {
          room = chat.channel;
        } else if (chat.directmessage) {
          room = chat.directmessage;
        } else {
          throw new Error('Either directmessage or channel should be existed');
        }

        io.to(room.toString()).emit(
          'deleteMessage',
          await chat.populate('sender'),
        );
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('addResponse', async (response) => {
      try {
        // response.chatId is the chat which is responded
        logger.debug(`${response.sender} respond to ${response.chatId}`);

        const respondedChat = await Chat.findById(response.chatId);
        if (!respondedChat) {
          throw new Error('Chat not found');
        } else if (respondedChat.isDeleted) {
          throw new Error('Deleted message cannot be responded');
        } else if (respondedChat.isResponse) {
          throw new Error('Response message cannot be responded');
        }

        let chat, room;
        if (response.channel) {
          chat = new Chat({
            content: response.content,
            channel: response.channel,
            sender: response.sender,
            isFile: response.isFile,
            isResponse: true,
          });
          room = response.channel;
        } else if (response.directmessage) {
          chat = new Chat({
            content: response.content,
            directmessage: response.directmessage,
            sender: response.sender,
            isFile: response.isFile,
            isResponse: true,
          });
          room = response.directmessage;
        } else {
          throw new Error('Either channel or directmessage should be given');
        }
        await chat.save();

        await Chat.findByIdAndUpdate(response.chatId, {
          $push: {
            responses: chat,
          },
        });

        io.to(room).emit('addResponse', {
          response: await chat.populate('sender'),
          respondedChatId: response.chatId,
        });
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('addReaction', async (reaction) => {
      try {
        // reaction.chatId is the chat which is responded
        logger.debug(`${reaction.reactor} reaction to ${reaction.chatId}`);

        const chat = await Chat.findById(reaction.chatId);
        if (!chat) {
          throw new Error('Channel not found');
        }

        const createdReaction = new Reaction({
          reactionType: reaction.reactionType,
          reactor: reaction.reactor,
        });
        await createdReaction.save();

        await Chat.findByIdAndUpdate(reaction.chatId, {
          $push: {
            reactions: createdReaction,
          },
        });

        let room;
        if (chat.channel) {
          room = chat.channel;
        } else if (chat.directmessage) {
          room = chat.directmessage;
        } else {
          throw new Error('Either directmessage or channel should be existed');
        }

        io.to(room.toString()).emit('addReaction', {
          reaction: await createdReaction.populate('reactor'),
          chatId: chat._id,
        });
      } catch (error: any) {
        logger.error(error.message);
      }
    });

    socket.on('deleteReaction', async (reaction) => {
      try {
        logger.debug(
          `${reaction.reactor} delete reaction: ${reaction.reactionId}`,
        );

        // Reaction should contain chatId because the server should broadcast deletion of reaction
        const chat = await Chat.findById(reaction.chatId);
        if (!chat) {
          throw new Error(`Channel not found`);
        }

        const reactor = await User.findById(reaction.reactor);
        if (!reactor) {
          new Error(`${reaction.reactor} not found`);
        }

        // Validate the reactor has authroity which enables reactor delete the reaction
        const deletedReaction = await Reaction.findOneAndDelete({
          _id: reaction.reactionId,
          reactor: reaction.reactor,
        });

        await Chat.findByIdAndUpdate(reaction.chatId, {
          $pull: {
            reactions: reaction.reactionId,
          },
        });

        let room;
        if (chat.channel) {
          room = chat.channel;
        } else if (chat.directmessage) {
          room = chat.directmessage;
        } else {
          throw new Error('Either directmessage or channel should be existed');
        }

        io.to(room.toString()).emit('deleteReaction', {
          reaction: await deletedReaction!.populate('reactor'),
          chatId: chat._id,
        });
      } catch (error: any) {
        logger.error(error.message);
      }
    });
  });
}

// Broadcast initial members of room
export function invite(users: Types.ObjectId[], room: Types.ObjectId) {
  _io.emit('invite', {
    users: users,
    room: room,
  });
}
