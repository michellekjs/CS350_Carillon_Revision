import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';
import { IChannel } from '../channel';

export interface IWorkspace {
  name: string;
  description: string;
  owner: PopulatedDoc<IUser>;
  invitationCode: string;
  members: PopulatedDoc<IUser>[];
  defaultChannel: PopulatedDoc<IChannel>;
}
