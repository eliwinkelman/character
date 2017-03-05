import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Blogs } from "./blogs.js";
var OAuth  = require('oauth-1.0a');
//TODO: add blog registry - multiple users per blog.
Meteor.methods({
	'newPost'(title, content) {
		if (Meteor.isServer) {
			var blogId = Meteor.user().currentBlog;
			var blog = Blogs.findOne({
					_id: blogId,
					'users.userId': Meteor.userId()
				}, {_id: 1, 'users.$': 1});

			var requestLink = blog.url + 'wp/v2/posts/';
			var token = blog.users[0].token;
			var tokenSecret = blog.users[0].tokenSecret;
			var consumerPublic = blog.users[0].consumerPublic;
			var consumerPrivate = blog.users[0].consumerPrivate;
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
					public: consumerPublic,
					secret: consumerPrivate
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
			
			var blogId = Meteor.user().currentBlog;
			var blog = Blogs.findOne({
				_id: blogId,
				'users.userId': Meteor.userId()
			}, {_id: 1, 'users.$': 1});


			var token = blog.users[0].token;
			var tokenSecret = blog.users[0].tokenSecret;
			var consumerPublic = blog.users[0].consumerPublic;
			var consumerPrivate = blog.users[0].consumerPrivate;
			var requestLink = blog.url + 'wp/v2/posts/' + id;

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
					public: consumerPublic,
					secret: consumerPrivate
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

			var blogId = Meteor.user().currentBlog;
			var blog = Blogs.findOne({
				_id: blogId,
				'users.userId': Meteor.userId()
			}, {_id: 1, 'users.$': 1});

			var requestLink = blog.url + 'wp/v2/posts/' + id;
			var token = blog.users[0].token;
			var tokenSecret = blog.users[0].tokenSecret;
			var consumerPublic = blog.users[0].consumerPublic;
			var consumerPrivate = blog.users[0].consumerPrivate;

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
					public: consumerPublic,
					secret: consumerPrivate
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
			var blogId = Meteor.user().currentBlog;
			var blog = Blogs.findOne({
				_id: blogId,
				'users.userId': Meteor.userId()
			}, {_id: 1, 'users.$': 1});

			var requestLink = blog.url + 'wp/v2/posts/' + id;
			var token = blog.users[0].token;
			var tokenSecret = blog.users[0].tokenSecret;
			var consumerPublic = blog.users[0].consumerPublic;
			var consumerPrivate = blog.users[0].consumerPrivate;

			var request_data = {
				url: requestLink,
				method: 'POST'
			};
			var oauth = OAuth({
				consumer: {
					public: consumerPublic,
					secret: consumerPrivate
				},

				signature_method: 'HMAC-SHA1'
			});
			var tokens = {
				public: token,
				secret: tokenSecret
			};

			var post = HTTP.post(requestLink, {
				params: oauth.authorize(request_data, tokens),
				headers: {
					"X-HTTP-Method-Override": "DELETE"
				}
			});


		}
	},
	'getPosts'() {

	if (Meteor.isServer) {
		var blogId = Meteor.user().currentBlog;
		var blog = Blogs.findOne({
			_id: blogId,
			'users.userId': Meteor.userId()
		}, {_id: 1, 'users.$': 1});

		var requestLink = blog.url + 'wp/v2/posts/';
		var token = blog.users[0].token;
		var tokenSecret = blog.users[0].tokenSecret;
		var consumerPublic = blog.users[0].consumerPublic;
		var consumerPrivate = blog.users[0].consumerPrivate;

		var request_data = {
			url: requestLink,
			method: 'GET',
			data: {
				"status": "any"
			}
		};
		var oauth = OAuth({
			consumer: {
				public: consumerPublic,
				secret: consumerPrivate
			},

			signature_method: 'HMAC-SHA1'
		});
		var tokens = {
			public: token,
			secret: tokenSecret
		};

		var posts = HTTP.get(requestLink, {
			params: oauth.authorize(request_data, tokens)
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

			var blogId = Meteor.user().currentBlog;
			var blog = Blogs.findOne({
				_id: blogId,
				'users.userId': Meteor.userId()
			}, {_id: 1, 'users.$': 1});

			var requestLink = blog.url + 'wp/v2/posts/ + id';
			var token = blog.users[0].token;
			var tokenSecret = blog.users[0].tokenSecret;
			var consumerPublic = blog.users[0].consumerPublic;
			var consumerPrivate = blog.users[0].consumerPrivate;

			var request_data = {
				url: requestLink,
				method: 'POST',
				data: {
				}
			};
			var oauth = OAuth({
				consumer: {
					public: consumerPublic,
					secret: consumerPrivate
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

			return (post);
		}
	}
});