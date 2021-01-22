import { UserType } from "types";

export interface IUserInput {
  email: string;
  firstName: string;
  lastName: string;
  type: UserType;
}

export interface IUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  type?: UserType;
}

export interface IUserPrivate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: UserType | string;
}
