import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
var OAuth  = require('oauth-1.0a');
export const Posts = new Mongo.Collection('posts');

Meteor.methods({
	'newPost'(title, content) {
		if (Meteor.isServer) {
			var requestLink = Meteor.user().website + '/wp-json/wp/v2/posts/';
			var token = Meteor.user().token;
			var tokenSecret = Meteor.user().tokenSecret;
			var request_data = {
				url: requestLink,
				method: 'POST',
				data: {
					"title": title,
					"content": content,
					"status": "draft"
				}
			};
			var oauth = OAuth({
				consumer: {
					public: Meteor.settings.consumer_key,
					secret: Meteor.settings.consumer_secret
				},

				signature_method: 'HMAC-SHA1'
			});
			var tokens = {
				public: token,
				secret: tokenSecret
			};

			var post = HTTP.post(requestLink, {
				params: oauth.authorize(request_data, tokens)
			});

			return (post.data.id);
		}



	},
	'publishPost'(id, title, content) {
		if (Meteor.isServer) {
			var requestLink = Meteor.user().website + 'wp-json/wp/v2/posts/' + id;
			var token = Meteor.user().token;
			var tokenSecret = Meteor.user().tokenSecret;
			var request_data = {
				url: requestLink,
				method: 'POST',
				data: {
					"title": title,
					"content": content,
					"status": "publish"
				}
			};
			var oauth = OAuth({
				consumer: {
					public: Meteor.settings.consumer_key,
					secret: Meteor.settings.consumer_secret
				},

				signature_method: 'HMAC-SHA1'
			});
			var tokens = {
				public: token,
				secret: tokenSecret
			};

			var post = HTTP.post(requestLink, {
				params: oauth.authorize(request_data, tokens)
			});


			return (post.data.id);
		}
	},
	'updatePost'(id, title, content) {
		if (Meteor.isServer) {

			var requestLink = Meteor.user().website + 'wp-json/wp/v2/posts/' + id;
			var token = Meteor.user().token;
			var tokenSecret = Meteor.user().tokenSecret;
			var request_data = {
				url: requestLink,
				method: 'POST',
				data: {
					"title": title,
					"content": content
				}
			};
			var oauth = OAuth({
				consumer: {
					public: Meteor.settings.consumer_key,
					secret: Meteor.settings.consumer_secret
				},

				signature_method: 'HMAC-SHA1'
			});
			var tokens = {
				public: token,
				secret: tokenSecret
			};

			var post = HTTP.post(requestLink, {
				params: oauth.authorize(request_data, tokens)
			});

			return (post.data.id);
		}
	},
	'deletePost'(id) {
		if (Meteor.isServer) {
			var requestLink = Meteor.user().website + 'wp-json/wp/v2/posts/' + id;
			var token = Meteor.user().token;
			var tokenSecret = Meteor.user().tokenSecret;
			var request_data = {
				url: requestLink,
				method: 'DELETE'
			};
			var oauth = OAuth({
				consumer: {
					public: Meteor.settings.consumer_key,
					secret: Meteor.settings.consumer_secret
				},

				signature_method: 'HMAC-SHA1'
			});
			var tokens = {
				public: token,
				secret: tokenSecret
			};

			var post = HTTP.del(requestLink, {
				params: oauth.authorize(request_data, tokens)
			});

		}
	},
	'getPosts'() {

	if (Meteor.isServer) {
		var requestLink = 'http://localhost:8888/wp-json/wp/v2/posts/';
		var posts = HTTP.get(requestLink, {
			headers: {'Authorization': 'Basic ZXdpbmtlbG1hbjprYXQxMjM='},
			params: {
				"status": "any"
			}
		});
		var data = posts.data;
		var parsedPosts = [];
		for (var i = 0; i < data.length; i++) {
			parsedPosts.push({
				id: data[i].id,
				title: data[i].title.rendered,
				content: data[i].content.rendered
			});
		}
		
		return (parsedPosts);

	}


	},
	'getPost'(id) {
		if(Meteor.isServer) {
			var requestLink = 'http://localhost:8888/wp-json/wp/v2/posts/';
			var post = HTTP.post(requestLink + id, {
				headers: {'Authorization': 'Basic ZXdpbmtlbG1hbjprYXQxMjM='}

			});

			return (post);
		}
	}
});