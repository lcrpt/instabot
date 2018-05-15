const assert = require('assert');
const liker = require('./liker');

assert(process.env.LIKE_MAX_MINUTES, 'LIKE_MAX_MINUTES env var is required for this service.');
assert(process.env.LIKE_MIN_MINUTES, 'LIKE_MIN_MINUTES env var is required for this service.');
assert(process.env.LIKE_DELAY_MAX, 'LIKE_DELAY_MAX env var is required for this service.');
assert(process.env.LIKE_DELAY_MIN, 'LIKE_DELAY_MIN env var is required for this service.');
assert(process.env.DAILY_LIKE, 'DAILY_LIKE env var is required for this service.');

const LIKE_MAX_MINUTES = Number(process.env.LIKE_MAX_MINUTES);
const LIKE_MIN_MINUTES = Number(process.env.LIKE_MIN_MINUTES);
const LIKE_DELAY_MAX = Number(process.env.LIKE_DELAY_MAX);
const LIKE_DELAY_MIN = Number(process.env.LIKE_DELAY_MIN);
const DAILY_LIKE = Number(process.env.DAILY_LIKE);
const HALF_DAY = 43200000;


function computeTimer() {
    const timer = (
        Math.floor(
            Math.random() * (LIKE_MAX_MINUTES - LIKE_MIN_MINUTES + 1) + LIKE_MIN_MINUTES)
        ) * 60 * 1000;

    return {
        timer,
        likeCount: Math.floor(timer * DAILY_LIKE / HALF_DAY)
    };
}

function delayRequest(i) {
    setTimeout(() => {
        return liker();
    }, Math.floor(Math.random() * LIKE_DELAY_MAX + LIKE_DELAY_MIN) * i);
}

function resolver({ timer, likeCount }) {
    return new Promise(resolve => {
        setTimeout(() => {
            for (let i = 0; i < likeCount; i++) {
                delayRequest(i);
            }

            resolve();
        }, timer);
    });
}

async function jobRunner({ timer, likeCount }) {
    await resolver({ timer, likeCount });
}

module.exports = {
    jobRunner,
    computeTimer
};
