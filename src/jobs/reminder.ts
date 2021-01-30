import _ from "lodash";

import { ApplicationService, MailService, UserService } from "services";
import { Logger } from "winston";

export enum When {
  Week = "WEEK",
  FourDays = "FOUR_DAYS",
  OneDay = "ONE_DAY",
  Closed = "CLOSED",
}

export function sendClosingReminderJob(when: When, userService: UserService, applicationService: ApplicationService, mailService: MailService, logger: Logger) {
  return async function (): Promise<void> {
    const applicants = await userService.getUsers(true);
    logger.info(`Sending ${when} reminder to ${applicants.length} applicants.`);

    for (const chunk of _.chunk(applicants, 10)) {
      await Promise.all(
        chunk.map(async applicant => {
          try {
            const applicationPDF = await applicationService.getPDF(applicant.id);

            if (when === When.Closed) {
              await mailService.sendClosed(
                applicant.email,
                { first_name: applicant.firstName, last_name: applicant.lastName },
                { content: applicationPDF.toString("base64"), filename: `${applicant.lastName.toLowerCase()}_${applicant.firstName.toLowerCase()}.pdf`.replace(/ /g, "_"), type: "application/pdf" },
              );
              return;
            }

            let time = "";

            switch (when) {
              case When.Week:
                time = "en vecka";
                break;
              case When.FourDays:
                time = "fyra dagar";
                break;
              case When.OneDay:
                time = "en dag";
                break;
            }

            await mailService.sendClosingReminder(
              applicant.email,
              { first_name: applicant.firstName, last_name: applicant.lastName, time },
              { content: applicationPDF.toString("base64"), filename: `${applicant.lastName.toLowerCase()}_${applicant.firstName.toLowerCase()}.pdf`.replace(/ /g, "_"), type: "application/pdf" },
            );
          } catch (e) {
            logger.error(`Error sending application to user. ID: ${applicant.id} EMAIL: ${applicant.email} FIRST_NAME: ${applicant.firstName} LAST_NAME: ${applicant.lastName}`);
          }
        }),
      );
    }
  };
}
