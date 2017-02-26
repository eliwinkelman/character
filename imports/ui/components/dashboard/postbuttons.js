import "./postbuttons.html";
import { Template } from "meteor/templating";

Template.editPost.events({
	'click .editPostButton'() {
		var route=this.route;
		FlowRouter.go(route);
	}
});