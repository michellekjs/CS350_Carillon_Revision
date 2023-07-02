import { Schema, Types, model } from 'mongoose';
import { IWorkspace } from './workspace.interface';
import { Channel } from '../channel';
import { User } from '../user';

const WorkspaceSchema = new Schema<IWorkspace>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  invitationCode: {
    type: String,
    required: true,
  },
  defaultChannel: {
    type: Types.ObjectId,
    ref: 'Channel',
  },
});

WorkspaceSchema.post('deleteOne', async function (result, next) {
  const channels = await Channel.find({
    workspace: result._id,
  });

  await User.updateMany(
    {
      participatingChannels: {
        $in: channels,
      },
    },
    {
      $pull: {
        participatingChannels: {
          $in: channels,
        },
      },
    },
  );

  await User.updateMany(
    {
      owningChannels: {
        $in: channels,
      },
    },
    {
      $pull: {
        owningChannels: {
          $in: channels,
        },
      },
    },
  );

  await Channel.deleteMany({
    workspace: result._id,
  });

  await User.updateMany(
    {
      participatingWorkspaces: result._id,
    },
    {
      $pull: {
        participatingWorkspaces: result._id,
      },
    },
  );

  await User.updateMany(
    {
      owningWorkspaces: result._id,
    },
    {
      $pull: {
        owningWorkspaces: result._id,
      },
    },
  );
  next();
});

export const Workspace = model<IWorkspace>('Workspace', WorkspaceSchema);
