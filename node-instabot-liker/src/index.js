require('dotenv').load();
const moment = require('moment');
const { jobRunner, computeTimer } = require('./job');

const FORMAT = 'hh:mm:ss';
const BEFORE_TIME = moment('08:00:00', FORMAT);
const AFTER_TIME = moment('20:00:00', FORMAT);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    while (true) {
        const time = moment(moment().format(FORMAT), FORMAT);

        if (time.isBetween(BEFORE_TIME, AFTER_TIME)) {
            await jobRunner(computeTimer());
        } else {
            await sleep(60000);
        }
    }
})();
