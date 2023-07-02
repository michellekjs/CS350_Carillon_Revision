import { Schema, Types, model } from 'mongoose';
import { IDirectmessage } from './directmessage.interface';
import { User } from '../user';

const DirectmessageSchema = new Schema<IDirectmessage>({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  muteMembers: [{ type: Types.ObjectId, ref: 'User' }],
  workspace: {
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
});

DirectmessageSchema.post('deleteOne', async function (result, next) {
  await User.updateMany(
    {
      participatingDMs: result._id,
    },
    {
      $pull: {
        participatingDMs: result._id,
      },
    },
  );

  await User.updateMany(
    {
      owningDMs: result._id,
    },
    {
      $pull: {
        owningDMs: result._id,
      },
    },
  );

  next();
});

export const Directmessage = model<IDirectmessage>(
  'Directmessage',
  DirectmessageSchema,
);
