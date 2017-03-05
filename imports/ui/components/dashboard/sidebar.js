import "./sidebar.html"
import { Template } from "meteor/templating"
import "./post";
import {Meteor} from "meteor/meteor";
import {Blogs} from "/imports/api/blogs.js";
//TODO: User Settings

Meteor.subscribe('blogs');

Template.sidebar.onCreated(
	function() {
		var sidebar = document.querySelector("#sidebar");
		var window = $(window).width;
		if (window < 768) {
			sidebar.style.height = 'calc(100vh - 60px)';
			$(".sidebar").hide();
		}
	}
);

Template.sidebar.onRendered(
	function() {

		$(window).resize(function() {
			var width = $(window).width();

			if (width < 768) {
				sidebar.style.height = 'calc(100vh - 60px)';
				$(".sidebar").hide();
			}

			if (width > 768) {
				sidebar.style.height = '100vh';
				$(".sidebar").show();
				$(".dashboardPanel").show();
			}

		})

	}
);
Template.sidebar.helpers({
	'newPostActive'() {
		var path = FlowRouter.current().path;
		if (path == "/editor") {
			return 'active';
		}

	},
	'contentActive'() {
		var path = FlowRouter.current().path;

		var re = new RegExp('/dash/?[0-9]*');
		if (re.test(path) || path=='/') {
			return "active";
		}

	},
	'blogs'() {
		return Blogs.find({_id: {$ne: Meteor.user().currentBlog}});
	}
});

Template.sidebar.events({
	'click .changeBlog'() {
		Meteor.call('changeCurrentBlog', this._id);
		FlowRouter.go('/dash');
	}

});