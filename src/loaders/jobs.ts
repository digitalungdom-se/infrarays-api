import moment from 'moment';
import schedule from 'node-schedule';

import sendApplicationsJob from 'jobs/sendApplications';

import Server from 'services/Server';
import User from 'services/User';

interface IDb {
    user: User;
    server: Server;
}

export default async function initJobs(db: IDb) {
    const thisYear = (new Date()).getUTCFullYear();
    const oneWeekLeftDate = moment().year(thisYear).month(2).date(24).hour(17).minute(0).second(0).millisecond(0).tz('Europe/Stockholm').toDate();
    const oneDayLeftDate = moment().year(thisYear).month(2).date(30).hour(18).minute(0).second(0).millisecond(0).tz('Europe/Stockholm').toDate();
    const closedDate = moment().year(thisYear).month(3).date(1).hour(5).minute(0).second(0).millisecond(0).tz('Europe/Stockholm').toDate();

    // const test = moment().year(thisYear).month(0).date(30).hour(20).minute(32).second(45).millisecond(0).tz('Europe/Stockholm').toDate();
    // console.log(`${moment.utc().toISOString()}: SCHEDULING TEST sendApplicationsJob for ${test.toUTCString()}`);
    // schedule.scheduleJob(test, sendApplicationsJob(db, 'WEEK'));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${oneWeekLeftDate.toUTCString()}`);
    schedule.scheduleJob(oneWeekLeftDate, sendApplicationsJob(db, 'WEEK'));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${oneDayLeftDate.toUTCString()}`);
    schedule.scheduleJob(oneDayLeftDate, sendApplicationsJob(db, 'DAY'));

    console.log(`${moment.utc().toISOString()}: SCHEDULING sendApplicationsJob for ${closedDate.toUTCString()}`);
    schedule.scheduleJob(closedDate, sendApplicationsJob(db, 'CLOSED'));
}