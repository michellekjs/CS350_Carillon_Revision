import { Schema, Types, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import { UserType } from './user.type';

const UserSchema = new Schema<IUser, UserModel>({
  userId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: Object.values(UserType),
    default: UserType.STUDENT,
  },
  userName: {
    type: String,
    required: true,
  },
  owningWorkspaces: [{ type: Types.ObjectId, ref: 'Workspace' }],
  participatingWorkspaces: [{ type: Types.ObjectId, ref: 'Workspace' }],
  owningChannels: [{ type: Types.ObjectId, ref: 'Channel' }],
  participatingChannels: [{ type: Types.ObjectId, ref: 'Channel' }],
  owningDMs: [{ type: Types.ObjectId, ref: 'Directmessage' }],
  participatingDMs: [{ type: Types.ObjectId, ref: 'Directmessage' }],
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.userType;
  return user;
};

export const User = model<IUser>('User', UserSchema);
