import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';
import { IReaction } from '../reaction';
import { IChannel } from '../channel';
import { IDirectmessage } from '../directmessage';

export interface IChat {
  content: string;
  channel: PopulatedDoc<IChannel>;
  directmessage: PopulatedDoc<IDirectmessage>;
  responses: PopulatedDoc<IChat>;
  reactions: PopulatedDoc<IReaction>[];
  sender: PopulatedDoc<IUser>;
  isDeleted: boolean;
  isResponse: boolean;
  isFile: boolean;
}
