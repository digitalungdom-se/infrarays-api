import moment from "moment";

function toDate(date: string): Date {
  return moment.utc(date).toDate();
}

export const sanitizers = {
  toDate,
};
