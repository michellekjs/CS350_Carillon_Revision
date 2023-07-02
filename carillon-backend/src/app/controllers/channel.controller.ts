/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { Channel, User, Workspace } from '../schemas';
import logger from '../util/logger';
import { Types } from 'mongoose';
import { invite } from '../socket';

export async function listChannel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const channels = await Channel.find().populate('workspace');
    res.json(channels);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function createChannel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = new Types.ObjectId(res.locals.user.id);
    const members = [owner];

    if (req.body.members !== undefined) {
      members.push(...req.body.members);
    }

    const channel = await Channel.create({
      name: req.body.name,
      workspace: req.body.workspace,
      description: req.body.description,
      owner: members,
      members: members,
    });

    await User.findByIdAndUpdate(owner, {
      $push: {
        owningChannels: channel._id,
        participatingChannels: channel._id,
      },
    });

    invite(members, channel._id);
    res.json(channel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function deleteChannel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workspace = await Workspace.findOne({
      name: req.body.workspace,
    });
    if (!workspace) {
      return res.status(404);
    }

    const channel = await Channel.deleteOne({
      name: req.body.name,
      owner: res.locals.user.id,
      workspace: workspace,
    });
    res.json(channel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function addMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = res.locals.user.id;
    const channel = await Channel.findById(req.params.channelId);
    if (!channel!.owner.includes(owner)) {
      next(new Error('owner is not authorized'));
    }

    const newChannel = await Channel.findByIdAndUpdate(req.params.channelId, {
      $push: {
        members: req.body.members,
      },
    });
    invite(req.body.members, channel!._id);
    res.json(newChannel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function kickMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = res.locals.user.id;
    const channel = await Channel.findById(req.params.channelId);
    if (!channel!.owner.includes(owner)) {
      next(new Error('owner is not authorized'));
    }

    const newChannel = await Channel.findByIdAndUpdate(req.params.channelId, {
      $pull: {
        members: req.body.members,
      },
    });
    res.json(newChannel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

//TODO: Change Default Channel

export async function changeChannelDescription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = res.locals.user.id;
    const channel = await Channel.findById(req.params.channelId);
    if (!channel!.owner.includes(owner)) {
      next(new Error('owner is not authorized'));
    }

    const newChannel = await Channel.findByIdAndUpdate(req.params.channelId, {
      description: req.body.description,
    });
    res.json(newChannel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function changeChannelAuthority(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = res.locals.user.id;
    const channel = await Channel.findById(req.params.channelId);
    if (!channel!.owner.includes(owner)) {
      next(new Error('owner is not authorized'));
    }

    const newChannel = await Channel.findByIdAndUpdate(req.params.channelId, {
      $push: {
        owner: req.body.user,
      },
    });
    res.json(newChannel);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}
