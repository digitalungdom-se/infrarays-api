import sgMail, { MailService as SendGridMailService } from "@sendgrid/mail";

import { Config } from "configs";

function loadSendGridMailService(config: typeof Config): SendGridMailService {
  if (config.isDevelopment) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sgMail.send = async (): Promise<any> => {};
  } else {
    sgMail.setApiKey(config.sendGrid.apiKey);
  }

  return sgMail;
}

export { loadSendGridMailService };
