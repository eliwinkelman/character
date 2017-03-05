import {Mongo} from "meteor/mongo";
import {Meteor} from "meteor/meteor";
export const Blogs = new Mongo.Collection('blogs');

//TODO: Publish users blogs to frontend

Meteor.startup(() => {
if (Meteor.isServer) {
	Meteor.publish("blogs", function () {
		return Blogs.find({});
	});
}


});

