import "./blog.html";
import "./postpreview";
import {Template} from "meteor/templating";
import { Posts } from "/imports/api/posts";
import { Meteor } from "meteor/meteor";
Template.blog.helpers({
	posts() {
		return Meteor.call('getPosts');
	}
});