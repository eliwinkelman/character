import "./signin.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
Template.signin.onRendered(() => {
	if (Meteor.user()) {
		FlowRouter.go('/dash');
	}
});