import moment from "moment";
import schedule from "node-schedule";

import sendApplicationsJob from "jobs/sendApplications";

import Server from "services/Server";
import User from "services/User";

interface Db {
    user: User;
    server: Server;
}

export default async function initJobs(db: Db) {
    const thisYear = new Date().getUTCFullYear();
    const oneWeekLeftDate = moment()
        .year(thisYear)
        .month(2)
        .date(24)
        .hour(17)
        .minute(0)
        .second(0)
        .millisecond(0)
        .tz("Europe/Stockholm")
        .toDate();

    const fourDaysLeft = moment()
        .year(thisYear)
        .month(2)
        .date(27)
        .hour(17)
        .minute(0)
        .second(0)
        .millisecond(0)
        .tz("Europe/Stockholm")
        .toDate();

    const oneDayLeftDate = moment()
        .year(thisYear)
        .month(2)
        .date(30)
        .hour(18)
        .minute(0)
        .second(0)
        .millisecond(0)
        .tz("Europe/Stockholm")
        .toDate();

    const closedDate = moment()
        .year(thisYear)
        .month(3)
        .date(1)
        .hour(5)
        .minute(0)
        .second(0)
        .millisecond(0)
        .tz("Europe/Stockholm")
        .toDate();

    // let test = moment().year(thisYear).month(1).date(1).hour(16).minute(55).second(0).millisecond(0).tz('Europe/Stockholm').toDate();
    // console.log(`${moment.utc().toISOString()}: SCHEDULING TEST sendApplicationsJob for ${test.toUTCString()}`);
    // schedule.scheduleJob(test, sendApplicationsJob(db, 'WEEK'));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${oneWeekLeftDate.toUTCString()}`);
    schedule.scheduleJob(oneWeekLeftDate, sendApplicationsJob(db, "WEEK"));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${fourDaysLeft.toUTCString()}`);
    schedule.scheduleJob(fourDaysLeft, sendApplicationsJob(db, "4DAYS"));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${oneDayLeftDate.toUTCString()}`);
    schedule.scheduleJob(oneDayLeftDate, sendApplicationsJob(db, "DAY"));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${closedDate.toUTCString()}`);
    schedule.scheduleJob(closedDate, sendApplicationsJob(db, "CLOSED"));
}
