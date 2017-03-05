import "./post.html";
import "./postbuttons";
import { Template } from "meteor/templating";


Template.dashboardPost.helpers({
	'route'() {
		return "/editor/" + this.id;
	},
	'active'() {
		var selectedPost = Session.get('selectedPost');
		if (selectedPost == this.id) {
			return 'activePostContent';
		}
	}
});
 Template.dashboardPost.events({
	 'click .viewPost'(e) {
		 e.preventDefault();
		 var route = '/dash/'+this.id;
		 Session.set('selectedPost', this.id);
		 FlowRouter.go(route);

	 }
 });
Template.localDashboardPost.helpers({
	'route'() {
		return "/editor/" + this.collabId + "?new=true";
	},
	'active'() {
		var selectedPost = Session.get('selectedPost');
		if (selectedPost == this.collabId) {
			return 'activePostContent';
		}
	}
});
Template.localDashboardPost.events({
	'click .viewPost'(e) {
		e.preventDefault();
		var route = "/editor/" + this.collabId + "?new=true";
		FlowRouter.go(route);

	}
});