import { FileType } from "types";

export interface IFilePublic {
  id: string;
  userId: string;
  type: FileType;
  created: Date;
  name: string;
  mime: string;
}
