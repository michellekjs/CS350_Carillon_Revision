import { PopulatedDoc } from 'mongoose';
import { IUser } from '../user';
import { IWorkspace } from '../workspace';

export interface IChannel {
  name: string;
  description: string;
  owner: PopulatedDoc<IUser>[];
  members: PopulatedDoc<IUser>[];
  workspace: PopulatedDoc<IWorkspace>;
}
