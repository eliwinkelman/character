import "./editor.js";
import "./dashboard.html";
import "./sidebar";
import "./previewpost";
import {noBlogs} from "./noBlogs.jsx";
import {Template} from "meteor/templating";
import "./../loading";
import { Meteor } from "meteor/meteor";
import {Blogs} from '/imports/api/blogs.js';

Meteor.subscribe('blogs');

Template.dashboard.onCreated(
	function() {
		self = this;
		this.isLoading = new ReactiveVar(true);
		this.Posts = new ReactiveVar('');
		var loadCount = 0;
		
		self.autorun(function() {
			const user = Meteor.user();
			if (!user) {
				return;
			}
			if (user.currentBlog) {
				Meteor.call('getPosts', function(error, response) {
					if (!error) {
						$("#loader-wrapper").fadeOut(1000);
						setTimeout(function() {
							self.isLoading.set(false);
							self.Posts.set(response);
						}, 1000);

					}
				});
			}

		});

		var postId = FlowRouter.getParam('postId');

	}
);
Template.dashboard.helpers({
	'isLoading'() {
		return Template.instance().isLoading.get();
	},
	'posts'() {
		return Template.instance().Posts.get();
	},
	'localPosts'() {
		posts = Blogs.findOne({_id: Meteor.user().currentBlog}, {_id: 0, post: 1}).posts;
		console.log(posts);
		return posts;
	},
	'noBlogsComponent'() {
		return noBlogs;
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
	},
	'hasBlogs'() {
		return Meteor.user().currentBlog;
	},
	'blogs'() {
		return Blogs.find();
	}
	
});

Template.dashboard.events({
	'click .sidebarToggle'() {

		$(".sidebar").slideToggle(1000);
		$(".contentWrapper").slideToggle(1000);
	}
});