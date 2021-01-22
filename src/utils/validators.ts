import { Meta } from "express-validator";
import { Request } from "express";
import moment from "moment";

import { UserType } from "types";

function isDate(date: string): boolean {
  if (!moment.utc(date).isValid()) {
    throw new Error();
  }

  return true;
}

function isBefore(isBeforeDate: Date): (date: Date) => boolean {
  return (date: Date): boolean => {
    if (moment.utc(date).isAfter(isBeforeDate)) {
      throw new Error();
    }

    return true;
  };
}

function isAfter(isAfterDate: Date): (date: Date) => boolean {
  return (date: Date): boolean => {
    if (moment.utc(date).isBefore(isAfterDate)) {
      throw new Error();
    }

    return true;
  };
}

async function isUserApplicant(userID: string, meta: Meta): Promise<boolean> {
  const req = meta.req as Request;

  const user = await req.services.User.getByID(userID);

  if (user?.type !== UserType.Applicant) {
    throw new Error("User is not applicant.:USER-001:422");
  }

  return true;
}

export const validators = { isDate, isBefore, isAfter, isUserApplicant };
