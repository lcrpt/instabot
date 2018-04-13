const hashtags = require('./hashtags');
const job = require('cron').CronJob;
const scrapper = require('./scrapper');

async function handler() {
    new job('0-59 * * * *', async () => {
        await scrapper(hashtags[Math.floor(Math.random() * hashtags.length)]);
    }, null, true, 'Europe/Paris');
}

module.exports = handler;
