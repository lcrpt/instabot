const Client = require('instagram-private-api').V1;
const assert = require('assert');
const mongodb = require('./drivers/mongodb');
const ObjectId = require('mongodb').ObjectID;

assert(process.env.INSTABOT_SCRAPP_USER, 'INSTABOT_SCRAPP_PASS env var is required for this service.');
assert(process.env.INSTABOT_SCRAPP_PASS, 'INSTABOT_SCRAPP_PASS env var is required for this service.');

const user = String(process.env.INSTABOT_SCRAPP_USER);
const pass = String(process.env.INSTABOT_SCRAPP_PASS);

const device = new Client.Device(user);
const storage = new Client.CookieFileStorage(__dirname + `/cookies/${user}.json`);

async function handler() {
    console.log('ping liker');

    return Client.Session.create(device, storage, user, pass).then(async (session) => {
        const instagramId = await patchAndFetchPost();

        return new Client.Request(session)
    		.setMethod('POST')
    		.setResource('like', { id: instagramId })
    		.generateUUID()
    		.setData({ media_id: instagramId, src: 'profile' })
    		.signPayload()
    		.send()
    		.then(data => new Client.Like(session, {}))
            .catch((err) => {
                throw new Error(err);
            });
    }).catch(err => {
		throw new Error(err);
	});
}

async function patchAndFetchPost() {
    await mongodb.init();

    const [{ instagramId }] = await mongodb.db.collection('posts')
        .find({
            liked: false,
            photoOfYou: false
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .project({ instagramId: 1, _id: 0 })
        .toArray();

    await mongodb.db.collection('posts').updateOne(
        { instagramId },
        {
            $set: {
                liked: true,
                likedAt: new Date()
            }
        }
    );

    return instagramId;
}

module.exports = handler;
