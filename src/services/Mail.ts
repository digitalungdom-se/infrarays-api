import { MailService as sendGridMailService, MailDataRequired } from "@sendgrid/mail";
// eslint-disable-next-line node/no-extraneous-import
import { AttachmentData } from "@sendgrid/helpers/classes/attachment";

import { Config } from "configs";

export class MailService {
  constructor(private readonly sendGridMail: sendGridMailService, private readonly config: typeof Config) {}

  private async sendEmail(to: string, templateId: string, dynamicTemplateData?: any, attachments?: AttachmentData[]): Promise<void> {
    const msg: MailDataRequired = {
      to,
      from: this.config.sendGrid.email,
      templateId,
      dynamicTemplateData,
      attachments,
    };

    await this.sendGridMail.send(msg);
  }

  public async sendLoginEmail(to: string, data: { login_code: string; authorization_token: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.login, data);
  }

  public async sendRecommendationRequest(to: string, data: { code: string; applicant_first_name: string; applicant_last_name: string; applicant_email: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.recommendationRequest, data);
  }

  public async sendRecommendationReceivedSender(to: string, data: { code: string; applicant_first_name: string; applicant_last_name: string }, recommendation: { content: string; filename: string; type: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.recommendationReceivedSender, data, [{ ...recommendation, disposition: "attachment" }]);
  }

  public async sendRecommendationReceivedApplicant(to: string, data: { sender_email: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.recommendationReceivedApplicant, data);
  }

  public async sendClosingReminder(to: string, data: { first_name: string; last_name: string; time: string }, applicationPDF: { content: string; filename: string; type: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.closingReminder, data, [{ ...applicationPDF, disposition: "attachment" }]);
  }

  public async sendClosed(to: string, data: { first_name: string; last_name: string }, applicationPDF: { content: string; filename: string; type: string }): Promise<void> {
    await this.sendEmail(to, this.config.sendGrid.emailTemplates.closed, data, [{ ...applicationPDF, disposition: "attachment" }]);
  }
}
