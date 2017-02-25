//TODO: move to wordpress 4.7 core endpoints
//TODO: Connect to app broker
//TODO: Better api root discovery
import { Meteor } from "meteor/meteor";



var OAuth  = require('oauth-1.0a');
if (Meteor.isServer) {
	Meteor.publish("userData", function () {
		if (this.userId) {
			return Meteor.users.find({_id: this.userId},
				{fields: {
						'token': 1, 'tokenSecret': 1
					}
				});
		} else {
			this.ready();
		}
	});
}


Meteor.methods({
	
	'getTempTokens'(siteUrl) {
		if (Meteor.isServer) {
			//prepare request to api broker for keys
			var url = 'http://' + siteUrl;
			var broker_request_data = {
				url: 'https://apps.wp-api.org/broker/connect/',
				method: 'POST',
				data: {
					server_url: url
				}
			};
			//create oauth1 signature for broker request
			var broker_oauth = OAuth({
				consumer: {
					public: '1DkNrGFgOMmy',
					secret: 'uOxEmZ5ynYZGRX0yqse1mSNNj9Q1eUIXLhryJcHmalqJHpnG'

				},

				signature_method: 'HMAC-SHA1'
			});
			//broker request
			var broker_request = HTTP.post('https://apps.wp-api.org/broker/connect/', {
				params: broker_oauth.authorize(broker_request_data)
			});

			//check if broker request was successful
			if (broker_request.statusCode == 200) {
				//set api link for site
				var requestLink = broker_request.data.api_root;

				var authentication = HTTP.get(requestLink, {});
				var requestUrl = authentication.data.authentication.oauth1.request;

				//set consumer keys to the ones received from the broker
				consumerPrivate = broker_request.data.client_secret;
				consumerPublic = broker_request.data.client_token;

				if (requestUrl != '') {

					//prepare request to wordpress client for temp keys

					var request_data = {
						url: requestUrl,
						method: 'GET',
						data: {
							oauth_callback: "localhost:3000/authorize"
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

					Meteor.users.update(Meteor.userId(), {$set: {
						token: token,
						tokenSecret: tokenSecret,
						website: 'http://' + siteUrl,
						consumerPublic: consumerPublic,
						consumerPrivate: consumerPrivate
					}});
					console.log(token, tokenSecret);
					var authorizeUrl = authentication.data.authentication.oauth1.authorize;
					authorizeUrl += '?' + request.content;
					console.log(authorizeUrl);
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

			var siteUrl = Meteor.user().website,
				requestLink = siteUrl + '/wp-json/';

			var authentication = HTTP.get(requestLink, {});
			var accessUrl = authentication.data.authentication.oauth1.access;

			if (accessUrl != '') {
				var tempToken = Meteor.user().token;

				var tempTokenSecret = Meteor.user().tokenSecret,
					consumerPrivate = Meteor.user().consumerPrivate,
					consumerPublic = Meteor.user().consumerPublic;

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
				console.log(oauth.authorize(request_data, tokens));
				var request = HTTP.get(accessUrl, {
					params: oauth.authorize(request_data, tokens)
				});
				console.log(request);
				var oauthTokens = request.content.split('&'),
					token = oauthTokens[0].substring(oauthTokens[0].indexOf('=')+1),
					tokenSecret = oauthTokens[1].substring(oauthTokens[1].indexOf('=')+1);
				Meteor.users.update(Meteor.userId(), {$set: {
					token: token,
					tokenSecret: tokenSecret
				}});
				console.log(token, tokenSecret);

			}
		}
	}
});