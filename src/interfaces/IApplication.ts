import { FileType } from "types";
import { IUserInput, IUserPrivate } from "./";

export interface IApplicantInput extends Omit<IUserInput, "type"> {
  birthdate: Date;
  finnish: boolean;
}

export interface IApplicantPrivate extends IUserPrivate {
  birthdate: Date;
  finnish: boolean;
}

export interface ISurveyInput {
  city: string;
  school: string;
  gender: string;
  applicationPortal: number;
  applicationProcess: number;
  improvement: string;
  informant: string;
}

export interface IRecommendationByCode {
  id: string;
  code: string;
  email: string;
  lastSent: Date;
  received: Date | null;

  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;

  fileId: string | null;
  fileType: FileType | null;
  fileCreated: Date | null;
  fileName: string | null;
  fileMime: string | null;
}

export interface IRecommendationForUser {
  id: string;
  userId: string;
  email: string;
  lastSent: Date;
  received: Date | null;
  index: number;
}
