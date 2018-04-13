require('dotenv').load();

const assert = require('assert');
const mongodb = require('./drivers/mongodb');
const job = require('cron').CronJob;
const moment = require('moment');

new job('00 0-23 * * *', async () => {
    await handler({ type: 'hourly', minutes: 60 });
}, null, true, 'Europe/Paris');

new job('00 00 12 * * *', async () => {
    await handler({ type: 'daily', minutes: 1440 });
}, null, true, 'Europe/Paris');

async function handler({ type, minutes }) {
    await mongodb.init();

    const startDate = new Date(moment().subtract(minutes, 'minutes').format());
    const endDate = new Date();

    const posts = await mongodb.db.collection('posts')
		.find({
            liked: true,
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .project({ instagramId: 1, _id: 0 })
		.toArray();

    const totalPosts = await mongodb.db.collection('posts')
        .find()
        .count();

    const totalLikedPosts = await mongodb.db.collection('posts')
        .find({ liked: true })
        .count();

    const totalUnlikedPosts = await mongodb.db.collection('posts')
        .find({ liked: false })
        .count();

    await mongodb.db.collection('reports').insertOne({
        type,
        totalPosts,
        totalLikedPosts,
        totalUnlikedPosts,
        likedPosts: posts.length,
        startDate,
        endDate,
        postIds: posts.map(post => post.instagramId)
    });

    return true;
}
