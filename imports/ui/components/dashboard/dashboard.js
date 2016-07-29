import "./editor.js";
import "./dashboard.html";
import "./sidebar";
import "./previewpost";
import {Template} from "meteor/templating";
import "./../loading";
import { Meteor } from "meteor/meteor";

Template.dashboard.onCreated(
	function() {
		self = this;
		this.isLoading = new ReactiveVar(true);
		this.Posts = new ReactiveVar('');
		var loadCount = 0;
		
		Meteor.call('getPosts', function(error, response) {
			if (!error) {

					$("#loader-wrapper").fadeOut(1000);
					setTimeout(function() {
						self.isLoading.set(false);
						self.Posts.set(response);
					}, 1000);


			}
		});

		var postId = FlowRouter.getParam('postId');
		Session.set('selectedPost', postId);
	}
);
Template.dashboard.helpers({
	'isLoading'() {
		return Template.instance().isLoading.get();
	},
	'posts'() {
		return Template.instance().Posts.get();
	},
	'postId'() {
		var postId = FlowRouter.getParam('postId');
	},
	'title'() {
		var postId = FlowRouter.getParam('postId');
			if(postId) {
			var	posts = Template.instance().Posts.get(),
				post = posts.filter( function(posts){return (posts.id == postId);} );

			return(post[0].title);
		}

	},
	'content'() {
	var postId = FlowRouter.getParam('postId');
		if (postId) {
			var posts = Template.instance().Posts.get(),
				post = posts.filter( function(posts){return (posts.id == postId);} );
			return(post[0].content);
		}
}
});
Template.dashboard.events({
	'click .sidebarToggle'() {

		$(".sidebar").slideToggle(1000);
		$(".contentWrapper").slideToggle(1000);
	}
});