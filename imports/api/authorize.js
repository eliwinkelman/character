
//TODO: create new blog in Blogs when site is added
import { Meteor } from "meteor/meteor";
import {Blogs} from "./blogs.js";

var OAuth  = require('oauth-1.0a');
if (Meteor.isServer) {
	Meteor.publish("userData", function () {
		if (this.userId) {
			return Meteor.users.find({_id: this.userId},
				{fields: {
						'token': 1, 'tokenSecret': 1, 'currentBlog': 1, 'blogs':1
					}
				});
		} else {
			this.ready();
		}
	});
}


Meteor.methods({
	
	'getTempTokens'(url) {
		if (Meteor.isServer) {
			//prepare request to api broker for keys



			var broker_request_data = {
				url: Meteor.settings.brokerUrl,
				method: 'POST',
				data: {
					server_url: url
				}
			};
			//create oauth1 signature for broker request
			var broker_oauth = OAuth({
				consumer: {
					public: Meteor.settings.brokerKey,
					secret: Meteor.settings.brokerSecret

				},

				signature_method: 'HMAC-SHA1'
			});
			//broker request
			var broker_request = HTTP.post(Meteor.settings.brokerUrl, {
				params: broker_oauth.authorize(broker_request_data)
			});

			//check if broker request was successful
			if (broker_request.statusCode == 200) {
				//set api link for site
				var requestLink = broker_request.data.api_root;
				console.log(requestLink);
				var blogCreatedAlready = Blogs.findOne({url: {$eq: requestLink}, "users.userId": Meteor.userId()});
				if (blogCreatedAlready) {
					return 'dash';
				}
				var authentication = HTTP.get(requestLink, {});
				var siteName = authentication.data.name;
				var requestUrl = authentication.data.authentication.oauth1.request;

				//set consumer keys to the ones received from the broker
				var consumerPrivate = broker_request.data.client_secret;
				var consumerPublic = broker_request.data.client_token;

				if (requestUrl != '') {

					//prepare request to wordpress client for temp keys
					//console.log(Meteor.settings.callbackUrl);
					var request_data = {
						url: requestUrl,
						method: 'GET',
						data: {
							oauth_callback: Meteor.settings.callbackUrl
						}
					};

					//oauth1 signature for request
					var oauth = OAuth({
						consumer: {
							public: consumerPublic,
							secret: consumerPrivate
						},

						signature_method: 'HMAC-SHA1'
					});

					//send request
					var request = HTTP.get(requestUrl, {
						params: oauth.authorize(request_data)
					});

					//parse keys out
					var oauthTokens = request.content.split('&'),
						token = oauthTokens[0].substring(oauthTokens[0].indexOf('=')+1),
						tokenSecret = oauthTokens[1].substring(oauthTokens[1].indexOf('=')+1);

					//save to user

					var blogId = null;

					var blog = Blogs.findOne({url: {$eq: requestLink}});
					if (blog) {
						blogId = blog._id;

						Blogs.update({_id: blogId}, {$addToSet: {users: [{
							userId: Meteor.userId(),
							temptoken: token,
							temptokenSecret: tokenSecret,
							consumerPublic: consumerPublic,
							consumerPrivate: consumerPrivate
						}]
						}})
					}
					else {
						blogId = Blogs.insert({
								url: requestLink,
								name: siteName,
								users: [{
									userId: Meteor.userId(),
									temptoken: token,
									temptokenSecret: tokenSecret,
									consumerPublic: consumerPublic,
									consumerPrivate: consumerPrivate
								}]

						})
					}



					Meteor.users.update(Meteor.userId(),
						{
							$addToSet: {blogs:
							{
							blogId: blogId,
							name: siteName
							}
						}, $set: {currentBlog: blogId
					}});

					var authorizeUrl = authentication.data.authentication.oauth1.authorize;
					authorizeUrl += '?' + request.content;

					return (authorizeUrl);

				}
				else {
					//error "server error, most likely cause is broker plugin is not installed."
				}

			}

		}
	},
	'getPermTokens'(oauthVerifier) {
		if (Meteor.isServer) {
		//TODO: Create blog in blogs in this method
			var blogId = Meteor.user().currentBlog;

			var blog = Blogs.findOne({
					_id: blogId
				},
				{_id: 0, url: 1,
					users: {$elemMatch: {userId: Meteor.userId()}}
				});

			var requestLink = blog.url;
			var authentication = HTTP.get(requestLink, {});
			var accessUrl = authentication.data.authentication.oauth1.access;
			var siteName = authentication.data.name;

			if (accessUrl != '') {

				var tempToken = blog.users[0].temptoken;
				var tempTokenSecret = blog.users[0].temptokenSecret,
					consumerPrivate = blog.users[0].consumerPrivate,
					consumerPublic = blog.users[0].consumerPublic;

				var request_data = {
					url: accessUrl,
					method: 'GET',
					data: {
						oauth_verifier: oauthVerifier
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
					public: tempToken,
					secret: tempTokenSecret
				};


				var request = HTTP.get(accessUrl, {
					params: oauth.authorize(request_data, tokens)
				});


				var oauthTokens = request.content.split('&'),
					token = oauthTokens[0].substring(oauthTokens[0].indexOf('=')+1),
					tokenSecret = oauthTokens[1].substring(oauthTokens[1].indexOf('=')+1);
				Blogs.update({_id: blogId, "users.userId" : Meteor.userId()}, {$set: {
					"users.$.token": token,
					"users.$.tokenSecret": tokenSecret
				}});


			}
		}
	}
});