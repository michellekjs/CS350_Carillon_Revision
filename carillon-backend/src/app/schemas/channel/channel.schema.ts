import { Schema, Types, model } from 'mongoose';
import { IChannel } from './channel.interface';
import { User } from '../user';

const ChannelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  members: [{ type: Types.ObjectId, ref: 'User' }],
  workspace: {
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
});

ChannelSchema.pre('save', async function (next) {
  const channel = await Channel.findOne({
    name: this.name,
    workspace: this.workspace,
  });
  if (channel) {
    return next(new Error('Channel already exists'));
  }

  next();
});

ChannelSchema.post('deleteOne', async function (result, next) {
  await User.updateMany(
    {
      participatingChannels: result._id,
    },
    {
      $pull: {
        participatingChannels: result._id,
      },
    },
  );

  await User.updateMany(
    {
      owningChannels: result._id,
    },
    {
      $pull: {
        owningChannels: result._id,
      },
    },
  );

  next();
});

export const Channel = model<IChannel>('Channel', ChannelSchema);
