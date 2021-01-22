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
