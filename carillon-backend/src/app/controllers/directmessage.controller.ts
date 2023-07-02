/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { Directmessage, User, Workspace } from '../schemas';
import logger from '../util/logger';
import { Types } from 'mongoose';
import { invite } from '../socket';

export async function listDirectmessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const directmessages = await Directmessage.find().populate('workspace');
    res.json(directmessages);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function createDirectmessage(
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

    const directmessage = await Directmessage.create({
      name: req.body.name,
      workspace: req.body.workspace,
      owner: owner,
      members: members,
    });

    await User.findByIdAndUpdate(owner, {
      $push: {
        owningDMs: directmessage._id,
        participatingDMs: directmessage._id,
      },
    });

    invite(members, directmessage._id);
    res.json(directmessage);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function deleteMessage(
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

    const directmessage = await Directmessage.deleteOne({
      name: req.body.name,
      owner: res.locals.user.id,
      workspace: workspace,
    });
    res.json(directmessage);
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
    const directmessage = await Directmessage.findById(
      req.params.directmessageId,
    );
    if (directmessage!.owner != owner) {
      next(new Error('owner is not authorized'));
    }

    const newDirectmessage = await Directmessage.findByIdAndUpdate(
      req.params.directmessageId,
      {
        $push: {
          members: req.body.members,
        },
      },
    );
    invite(req.body.members, directmessage!._id);
    res.json(newDirectmessage);
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
    const directmessage = await Directmessage.findById(
      req.params.directmessageId,
    );
    if (directmessage!.owner != owner) {
      next(new Error('owner is not authorized'));
    }

    const newDirectmessage = await Directmessage.findByIdAndUpdate(
      req.params.directmessageId,
      {
        $pull: {
          members: req.body.members,
        },
      },
    );
    res.json(newDirectmessage);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}
