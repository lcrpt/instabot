const assert = require('assert');
const Client = require('instagram-private-api').V1;
const mongodb = require('./drivers/mongodb');
const get = require('lodash/get');
const difference = require('lodash/difference');

assert(process.env.INSTABOT_SCRAPP_USER, 'INSTABOT_SCRAPP_PASS env var is required for this service.');
assert(process.env.INSTABOT_SCRAPP_PASS, 'INSTABOT_SCRAPP_PASS env var is required for this service.');

const user = String(process.env.INSTABOT_SCRAPP_USER);
const pass = String(process.env.INSTABOT_SCRAPP_PASS);

const device = new Client.Device(user);
const storage = new Client.CookieFileStorage(__dirname + `/cookies/${user}.json`);

async function handler(hashtag) {
	try {
		await mongodb.init();

		return Client.Session.create(device, storage, user, pass).then(async (session) => {
			const feed = new Client.Feed.TaggedMedia(session, hashtag);
			const data = await feed.get();

			await computeResult(data, hashtag);
		}).catch(err => {
			throw new Error(err);
		});
	} catch (e) {
		throw new Error(e);
	}
}

async function computeResult(data, hashtag) {
	try {
		await stats(data, hashtag);

		await Promise.all(data.map(async (post) => {
			await mongodb.db.collection('posts').update(
				{ instagramId: post._params.id },
				{ $setOnInsert: formatPost(post._params, hashtag) },
				{ upsert: true }
			);
		}));
	} catch (e) {
		throw new Error(e);
	}
}

function formatPost(post, hashtag) {
	return {
		instagramId: get(post, 'id'),
		hashtag,
		liked: false,
		likedAt: null,
		createdAt: new Date(),
		userId: get(post, 'user.pk'),
		userName: get(post, 'user.username'),
		userFullName: get(post, 'user.full_name'),
		userIs_private: get(post, 'user.is_private'),
		userFriendship_status: get(post, 'user.friendship_status'),
		locationName: get(post, 'location.name'),
		locationAddress: get(post, 'location.address'),
		locationCity: get(post, 'location.city'),
		takenAt: get(post, 'takenAt'),
		code: get(post, 'code'),
		caption: get(post, 'caption'),
		likeCount: get(post, 'likeCount'),
		photoOfYou: get(post, 'photoOfYou'),
		webLink: get(post, 'webLink')
	};
}

async function stats(data, hashtag) {
	const ids = data.map(item => item._params.id);

	const existingPosts = await mongodb.db.collection('posts')
		.find({ instagramId: { $in: ids } })
		.toArray();

	const existingIds = existingPosts.map(item => item.instagramId);

	await mongodb.db.collection('scrapperStats').insertOne({
		hashtag,
		postsCount: await mongodb.db.collection('posts').count(),
		postsFound: ids.length,
		alreadyExists: existingPosts.length,
		postsToInsert: difference(ids, existingIds).length,
		createdAt: new Date()
	});

	return true;
}

module.exports = handler;
