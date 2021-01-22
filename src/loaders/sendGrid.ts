import sgMail, { MailService } from "@sendgrid/mail";

import { Config } from "configs";

function loadMailService(config: typeof Config): MailService {
  if (config.isDevelopment) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sgMail.send = async (): Promise<any> => {};
  } else {
    sgMail.setApiKey(config.sendGrid.apiKey);
  }

  return sgMail;
}

export { loadMailService };
