import Hogan from "hogan.js";
import moment from "moment";
import Server from "services/Server";
import User from "services/User";
import { sendMail } from "utils";

interface Db {
    user: User;
    server: Server;
}

export default function sendApplicationsJob(db: Db, when: "WEEK" | "4DAYS" | "DAY" | "CLOSED") {
    return async function() {
        const applicationsPromise = db.server.getAllApplicants();

        let templateData = "";
        if (when === "WEEK" || when === "4DAYS" || when === "DAY") {
            templateData = await db.server.getEmail("application_closing");
        } else {
            templateData = await db.server.getEmail("application_closed");
        }

        const template = Hogan.compile(templateData);
        const applications = await applicationsPromise;

        console.log(`${moment.utc().toISOString()}: STARTING SENDING APPLCATIONS TO ${applications.length}`);

        for (const user of applications) {
            let body = "";
            const name = user.name
                .toLowerCase()
                .split(" ")
                .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(" ");

            switch (when) {
                case "WEEK":
                    body = template.render({ name: name, closing: "en vecka" });
                    break;
                case "4DAYS":
                    body = template.render({ name: name, closing: "fyra dagar" });
                    break;
                case "DAY":
                    body = template.render({ name: name, closing: "en dag" });
                    break;
                case "CLOSED":
                    body = template.render({ name: name });
                    break;
            }

            try {
                const application = await db.user.getCompleteApplication(user.id);

                const fileName = user.name.replace(/ /g, "_");

                await sendMail(user.email, "Din ansökning", body, [
                    {
                        content: application,
                        filename: `${fileName}.pdf`,
                    },
                ]);
            } catch (e) {
                console.error(`ERROR SENDING APPLICATION TO ${name} (${user.id})`, e);

                await sendMail(user.email, "Din ansökning", body);
            }
        }

        console.log(`${moment.utc().toISOString()}: SENT ALL APPLICATIONS`);
    };
}
