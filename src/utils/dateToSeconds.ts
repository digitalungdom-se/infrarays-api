import moment from "moment";

export function timeConversion(amount: moment.DurationInputArg1, unit: moment.unitOfTime.Base, to: moment.unitOfTime.Base): number {
  return moment.utc().add(amount, unit).diff(moment.utc(), to);
}
