import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';
import { IWorkspace } from '../workspace';

export interface IDirectmessage {
  name: string;
  owner: PopulatedDoc<IUser>;
  members: PopulatedDoc<IUser>[];
  muteMembers: PopulatedDoc<IUser>[];
  workspace: PopulatedDoc<IWorkspace>;
}
