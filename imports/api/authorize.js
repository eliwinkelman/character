
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

			var requestLink = 'http://' + siteUrl + '/wp-json/';

			var authentication = HTTP.get(requestLink, {});
			var requestUrl = authentication.data.authentication.oauth1.request;
			console.log(requestUrl);

			if (requestUrl != '') {
				var request_data = {
					url: requestUrl,
					method: 'GET',
					data: {
						oauth_callback: "http://localhost:3000/authorize"
					}
				};
				var oauth = OAuth({
					consumer: {
						public: Meteor.settings.consumer_key,
						secret: Meteor.settings.consumer_secret
					},

					signature_method: 'HMAC-SHA1'
				});

				console.log(oauth.authorize(request_data));
				var request = HTTP.get(requestUrl, {
					params: oauth.authorize(request_data)
				});
				var oauthTokens = request.content.split('&'),
					token = oauthTokens[0].substring(oauthTokens[0].indexOf('=')+1),
					tokenSecret = oauthTokens[1].substring(oauthTokens[1].indexOf('=')+1);
				Meteor.users.update(Meteor.userId(), {$set: {
					token: token,
					tokenSecret: tokenSecret,
					website: 'http://' + siteUrl
				}});
				console.log(token, tokenSecret);
				var authorizeUrl = authentication.data.authentication.oauth1.authorize;
				authorizeUrl += '?' + request.content;
				console.log(authorizeUrl);
				return (authorizeUrl);

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
				console.log(tempToken);
				var tempTokenSecret = Meteor.user().tokenSecret;
				console.log(tempTokenSecret);
				var request_data = {
					url: accessUrl,
					method: 'GET',
					data: {
						oauth_verifier: oauthVerifier
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