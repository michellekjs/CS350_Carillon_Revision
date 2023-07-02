import { Model, PopulatedDoc } from 'mongoose';
import { UserType } from './user.type';
import { IWorkspace } from '../workspace';
import { IChannel } from '../channel';
import { IDirectmessage } from '../directmessage';

export interface IUser {
  userId: string;
  password: string;
  userType: UserType;
  userName: string;
  owningWorkspaces: PopulatedDoc<IWorkspace>[];
  participatingWorkspaces: PopulatedDoc<IWorkspace>[];
  owningChannels: PopulatedDoc<IChannel>[];
  participatingChannels: PopulatedDoc<IChannel>[];
  owningDMs: PopulatedDoc<IDirectmessage>[];
  participatingDMs: PopulatedDoc<IDirectmessage>[];
}

export interface UserModel extends Model<IUser> {
  toJSON(): { [key: string]: string };
}
