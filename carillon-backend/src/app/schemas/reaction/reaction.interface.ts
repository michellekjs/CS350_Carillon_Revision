import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';
import { ReactionType } from './reaction.type';

export interface IReaction {
  reactionType: ReactionType;
  reactor: PopulatedDoc<IUser>;
}
