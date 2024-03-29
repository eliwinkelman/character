import "./authorize.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import {AuthorizeBlog} from "./authorize.jsx";
import {Blogs} from "/imports/api/blogs.js";

Meteor.subscribe('userData');
Meteor.subscribe('blogs');
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

	$('.selectpicker').selectpicker({
		size: 2,
		width: '95px'
	});

});
Template.authorize.events({
	'submit .domainNameForm'(event) {
		event.preventDefault();
		const target = event.target;
		console.log(target);
		var httpPrefix = $('#httpSelect').val();
		console.log(httpPrefix);
		var url = httpPrefix + target.url.value;
		Meteor.call('getTempTokens', url, function(error, response) {
			if (!error) {
				window.location.href = response;
			}
			else {
				alert("There was a server error.")
			}
		});
	}
});
Template.authorize.helpers({
	'AuthorizeBlog'() {
		return AuthorizeBlog;
	}
});