import { Schema, Types, model } from 'mongoose';
import { IReaction } from './reaction.interface';
import { ReactionType } from './reaction.type';
import { User } from '../user';

const ReactionSchema = new Schema<IReaction>({
  reactionType: {
    type: String,
    enum: Object.values(ReactionType),
    required: true,
  },
  reactor: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

ReactionSchema.pre('save', async function (next) {
  const sender = await User.findById(this.reactor);
  if (!sender) {
    return next(new Error('User not found'));
  }
  next();
});

export const Reaction = model<IReaction>('Reaction', ReactionSchema);
