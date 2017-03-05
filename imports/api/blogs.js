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

