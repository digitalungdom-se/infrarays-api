import { UserType } from "types";
import { IUserInput } from "./";

export interface IGradeInput {
  adminId: string;
  applicantId: string;
  cv: number;
  coverLetter: number;
  essays: number;
  grades: number;
  recommendations: number;
  overall: number;
  comment: string;
}

export interface IAdminInput extends Omit<IUserInput, "type"> {
  type: UserType.Admin | UserType.SuperAdmin;
}
