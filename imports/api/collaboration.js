import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {Blogs} from './blogs';
Meteor.methods({
	'createCollaborationDoc'(docName, postContent, exists) {
		if (Meteor.isServer) {

			var	params = {
				docName: docName,
				postContent: postContent
			};
			if (exists) {
				let blogId = Meteor.user().currentBlog;

				let blog = Blogs.findOne({_id: blogId});

				let posts = blog.posts.find(e => e.collabId == docName);
				console.log(posts);
				params.postContent = posts.content.ops;
			}
			createdDoc = HTTP.post('http://localhost:8080/createDoc', {data: params});
			return createdDoc;
		}
	}

});