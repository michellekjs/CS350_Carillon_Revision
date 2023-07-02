import { Schema, Types, model } from 'mongoose';
import { IChat } from './chat.interface';
import { User } from '../user';

const ChatSchema = new Schema<IChat>({
  content: {
    type: String,
    required: true,
  },
  channel: {
    type: Types.ObjectId,
    ref: 'Channel',
  },
  directmessage: {
    type: Types.ObjectId,
    ref: 'Directmessage',
  },
  responses: [
    {
      type: Types.ObjectId,
      ref: 'Chat',
    },
  ],
  reactions: [
    {
      type: Types.ObjectId,
      ref: 'Reaction',
    },
  ],
  sender: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isResponse: {
    type: Boolean,
    default: false,
  },
  isFile: {
    type: Boolean,
    default: false,
  }
});

ChatSchema.pre('save', async function (next) {
  const sender = await User.findById(this.sender);
  if (!sender) {
    return next(new Error('User not found'));
  }

  if (!sender.participatingChannels.includes(this.channel)) {
    return next(new Error('User not in channel'));
  }
  next();
});

ChatSchema.pre('save', function (next) {
  if (
    (this.channel && this.directmessage) ||
    (!this.channel && !this.directmessage)
  ) {
    return next(new Error('Invalid channel & directmessage input'));
  }
  next();
});

export const Chat = model<IChat>('Chat', ChatSchema);
