import "./authorize.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
Meteor.subscribe('userData');
Template.authorize.onRendered(() => {
	var oauthVerifier = FlowRouter.getQueryParam('oauth_verifier');
	var url = '';
	if (oauthVerifier) {
		Meteor.call('getPermTokens', oauthVerifier, function(error, response) {
			if (!error) {
				FlowRouter.go('/dash');
			}
		});
	}
});
Template.authorize.events({
	'submit .domainNameForm'(event) {
		event.preventDefault();
		console.log("submitted");
		const target = event.target;
		var url = target.url.value,
			consumerPublic = target.consumerPublic.value,
			consumerPrivate = target.consumerPrivate.value;
		Meteor.call('getTempTokens', url, consumerPublic, consumerPrivate, function(error, response) {
			if (!error) {
				window.location.href = response;
			}
		});
	}
});