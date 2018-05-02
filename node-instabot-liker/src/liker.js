const Client = require('instagram-private-api').V1;
const assert = require('assert');
const mongodb = require('./drivers/mongodb');

assert(process.env.INSTABOT_SCRAPP_USER, 'INSTABOT_SCRAPP_PASS env var is required for this service.');
assert(process.env.INSTABOT_SCRAPP_PASS, 'INSTABOT_SCRAPP_PASS env var is required for this service.');

const user = String(process.env.INSTABOT_SCRAPP_USER);
const pass = String(process.env.INSTABOT_SCRAPP_PASS);

const device = new Client.Device(user);
const storage = new Client.CookieFileStorage(`${__dirname}/cookies/${user}.json`);

async function handler() {
    console.log('ping liker');

    try {
        await mongodb.init();

        return Client.Session.create(device, storage, user, pass).then(async session => {
            const instagramId = await patchAndFetchPost();

            return new Client.Request(session)
                .setMethod('POST')
                .setResource('like', { id: instagramId })
                .generateUUID()
                .setData({ media_id: instagramId, src: 'profile' })
                .signPayload()
                .send()
                .then(data => new Client.Like(session, {}))
                .catch(async err => {
                    await mongodb.db.collection('errors').insertOne({
                        app: 'liker',
                        from: 'Client.Like',
                        error: err
                    });
                });
        }).catch(async err => {
            await mongodb.db.collection('errors').insertOne({
                app: 'liker',
                from: 'Client.Session.create',
                error: err
            });
        });
    } catch (err) {
        await mongodb.db.collection('errors').insertOne({
            app: 'liker',
            from: 'Handler.liker',
            error: err
        });
    }

    return true;
}

async function patchAndFetchPost() {
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
