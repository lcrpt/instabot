require('dotenv').load();

const assert = require('assert');
const mongodb = require('./drivers/mongodb');
const job = require('cron').CronJob;
const moment = require('moment');

new job('00 00 12 * * *', async () => {
    await handler();
}, null, true, 'Europe/Paris');

async function handler() {
    console.log('ping cleaner');

    await mongodb.init();

    const removeDate = new Date(moment().subtract(5, 'days').format());

    const totalPosts = await mongodb.db.collection('posts')
        .find()
        .count();

    await mongodb.db.collection('posts').deleteMany({
        date: {
            $lte: new Date(removeDate)
        }
    });

    const totalPosts = await mongodb.db.collection('posts')
        .find()
        .count();

    await mongodb.db.collection('reports').insertOne({
        type: 'cleaner',
        createdAt: new Date()
    });

    return true;
}
