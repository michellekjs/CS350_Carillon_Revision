import { NextFunction, Request, Response } from 'express';
import { Workspace } from '../schemas/workspace';
import { Types } from 'mongoose';
import { Channel, User } from '../schemas';
import logger from '../util/logger';

export async function listWorkspace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workspaces = await Workspace.find();
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
}

export async function createWorkspace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = new Types.ObjectId(res.locals.user.id);
    const members = [owner];

    const workspace = await Workspace.findOneAndUpdate(
      {
        name: req.body.name,
        owner: res.locals.user.id,
      },
      {
        name: req.body.name,
        description: req.body.description,
        owner: res.locals.user.id,
        members: members,
        invitationCode: generateAuthCode(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    const defaultChannel = await Channel.findOneAndUpdate(
      {
        name: 'Default Channel',
        workspace: workspace,
      },
      {
        name: 'Default Channel',
        description: 'Default Channel',
        owner: owner,
        members: members,
        workspace: workspace,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const updatedWorkspace = await Workspace.findOneAndUpdate(
      {
        name: req.body.name,
        owner: res.locals.user.id,
      },
      {
        defaultChannel: defaultChannel,
      },
      {
        new: true,
      },
    );

    await User.findByIdAndUpdate(owner, {
      $push: {
        owningWorkspaces: workspace._id,
        participatingWorkspaces: workspace._id,
      },
    });

    res.json(updatedWorkspace);
  } catch (error) {
    next(error);
  }
}

export function generateAuthCode() {
  const codeLength = 6;
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function deleteWorkspace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workspace = await Workspace.findOne({
      name: req.body.name,
      owner: res.locals.user.id,
    });

    if (!workspace) {
      return res.sendStatus(404);
    }

    const deletedWorkspace = await Workspace.findByIdAndDelete(workspace._id);
    res.json(deletedWorkspace);
  } catch (error) {
    next(error);
  }
}

export async function checkInvitationCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workspace = await Workspace.findOne({
      name: req.body.name,
    });
    if (!workspace) {
      return res.sendStatus(404);
    }

    if (workspace.invitationCode != req.body.invitationCode) {
      return res.sendStatus(400);
    }

    const newWorkspace = await workspace.updateOne(
      {
        $push: {
          members: res.locals.user.id,
        },
      },
      {
        new: true,
      },
    );

    await User.findByIdAndUpdate(res.locals.user.id, {
      $push: {
        participatingWorkspaces: workspace._id,
      },
    });

    //TODO: default channel에 업데이트
    res.json(newWorkspace);
  } catch (error) {
    next(error);
  }
}
