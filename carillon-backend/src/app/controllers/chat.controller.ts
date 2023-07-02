/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import logger from '../util/logger';
import { Chat, Reaction, User } from '../schemas';
import { Types } from 'mongoose';
import { getFileAddress, uploadImageToS3 } from '../util/s3';

export async function listMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const chats = await Chat.aggregate([
      {
        $match: {
          $or: [
            {
              channel: new Types.ObjectId(req.params.id),
            },
            {
              directmessage: new Types.ObjectId(req.params.id),
            },
          ],
        },
      },
      {
        $match: {
          isResponse: false,
        },
      },
      {
        $lookup: {
          from: Reaction.collection.name,
          localField: 'reactions',
          foreignField: '_id',
          pipeline: [
            {
              $group: {
                _id: {
                  reactionType: '$reactionType',
                },
                reaction: { $push: '$_id' },
              },
            },
            {
              $lookup: {
                from: Reaction.collection.name,
                localField: 'reaction',
                foreignField: '_id',
                pipeline: [
                  {
                    $lookup: {
                      from: User.collection.name,
                      localField: 'reactor',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            userName: 1,
                          },
                        },
                      ],
                      as: 'reactor_info',
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      reactorId: '$reactor_info._id',
                      reactorName: '$reactor_info.userName',
                    },
                  },
                  {
                    $unwind: '$reactorId',
                  },
                  {
                    $unwind: '$reactorName',
                  },
                ],
                as: 'reaction_info',
              },
            },
            {
              $project: {
                _id: 0,
                reactionType: '$_id.reactionType',
                reaction: '$reaction_info',
              },
            },
          ],
          as: 'reactions_info',
        },
      },
      {
        $lookup: {
          from: Chat.collection.name,
          localField: 'responses',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: Reaction.collection.name,
                localField: 'reactions',
                foreignField: '_id',
                pipeline: [
                  {
                    $group: {
                      _id: {
                        reactionType: '$reactionType',
                      },
                      reaction: { $push: '$_id' },
                    },
                  },
                  {
                    $lookup: {
                      from: Reaction.collection.name,
                      localField: 'reaction',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $lookup: {
                            from: User.collection.name,
                            localField: 'reactor',
                            foreignField: '_id',
                            pipeline: [
                              {
                                $project: {
                                  _id: 1,
                                  userName: 1,
                                },
                              },
                            ],
                            as: 'reactor_info',
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            reactorId: '$reactor_info._id',
                            reactorName: '$reactor_info.userName',
                          },
                        },
                        {
                          $unwind: '$reactorId',
                        },
                        {
                          $unwind: '$reactorName',
                        },
                      ],
                      as: 'reaction_info',
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      reactionType: '$_id.reactionType',
                      reaction: '$reaction_info',
                    },
                  },
                ],
                as: 'reactions_info',
              },
            },
            {
              $lookup: {
                from: User.collection.name,
                localField: 'sender',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      userName: 1,
                    },
                  },
                ],
                as: 'sender_info',
              },
            },
            {
              $unwind: '$sender_info',
            },
            {
              $project: {
                responses: 0,
                reactions: 0,
                sender: 0,
              },
            },
          ],
          as: 'responses_info',
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'sender',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
              },
            },
          ],
          as: 'sender_info',
        },
      },
      {
        $unwind: '$sender_info',
      },
      {
        $project: {
          responses: 0,
          reactions: 0,
          sender: 0,
        },
      },
    ]);

    res.json(chats);
  } catch (error: any) {
    logger.error(error.message);
    next(error);
  }
}

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    logger.debug(`Uploading file ${req.file?.originalname}`);
    uploadImageToS3(req.file!.originalname, req.file!.buffer);
    res.json(getFileAddress(req.file!.originalname));
  } catch (error) {
    next(error);
  }
}
