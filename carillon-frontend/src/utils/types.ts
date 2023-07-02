export interface IWorkspace {
  _id: string
  name: string
  owner: IUser
  invitationCode: string
  members: IUser[]
  defaultChannel: IChannel
  channels: IChannel[]
  description: string
}

export interface IUser {
  _id: string
  userId: string
  password: string
  userType: UserType
  userName: string
  owningWorkspaces: string[]
  participatingWorkspaces: string[]
  owningChannels: string[]
  participatingChannels: string[]
  owningDMs: string[]
  participatingDMs: string[]
}

export enum UserType {
  STUDENT = 'STUDENT',
  TA = 'TA',
  PROFESSOR = 'PROFESSOR',
}

export interface IReaction {
  name: string
  reactingChat: IChat
  reactor: IUser
}

export interface IDirectmessage {
  name: string
  owner: IUser
  members: IUser[]
  muteMembers: IUser[]
}

export interface IChat {
  content: string
  reactions: IReaction[]
  sender: IUser
  receiver: IUser
}

export interface IChannel {
  _id: string
  name: string
  description: string
  owner: IUser
  members: IUser[]
  workspace: IWorkspace
}
