import {Mongo} from "meteor/mongo";
import {Meteor} from "meteor/meteor";
export const Blogs = new Mongo.Collection('blogs');

//TODO: Publish users blogs to frontend

Meteor.startup(() => {
	if (Meteor.isServer) {

		Meteor.publish("blogs", function () {
			if(this.userId) {

				var user = Meteor.users.findOne(this.userId);

				blogIds = user.blogs.map((blogs) => {return blogs.blogId});

				return Blogs.find({_id: {$in: blogIds}});
			}

		});
	}
});

Meteor.methods({
	'changeCurrentBlog'(blogId) {
		Meteor.users.update(Meteor.userId(), {$set: {currentBlog: blogId}})

	},
	'newLocalPost'(title, wpId, contentDelta, collabId) {
		blogId = Meteor.user().currentBlog;
		Blogs.update({_id: blogId}, {$push: {posts: {title: title, wpId: wpId, content: contentDelta, collabId: collabId}}});
	},
	'updateLocalPostContent'(contentDelta, collabId) {
		blogId = Meteor.user().currentBlog;
		Blogs.update({_id: blogId, 'posts.collabId': collabId}, {$set: {'posts.$.content': contentDelta}});
	},
	'setLocalPostWPId'(collabId, wpId) {
		blogId = Meteor.user().currentBlog;
		Blogs.update({_id: blogId, 'posts.collabId': collabId}, {$set: {'posts.$.wpId': wpId}});
	},
	'eraseLocalPostContent'(collabId) {
		blogId = Meteor.user().currentBlog;
		Blogs.update({_id: blogId, 'posts.collabId': collabId}, {$unset: {'posts.$.content': ''}});
	},
	'getLocalPostbyWPID'(wpId) {
		blogId = Meteor.user().currentBlog;
		return Blogs.findOne({_id: blogId, 'posts.wpId': wpId}, {'posts.$': 1});
	}
});

