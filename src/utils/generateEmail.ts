import { MailDataRequired } from "@sendgrid/mail";
// eslint-disable-next-line node/no-extraneous-import
import { AttachmentData } from "@sendgrid/helpers/classes/attachment";

import { Config } from "configs";

export function generateSimpleEmail(to: string, templateId: string, dynamicTemplateData?: any, attachments?: AttachmentData[]): MailDataRequired {
  const msg: MailDataRequired = {
    to,
    from: Config.sendGrid.email,
    templateId,
    dynamicTemplateData,
    attachments,
  };

  return msg;
}
