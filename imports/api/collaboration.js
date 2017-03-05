import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';
Meteor.methods({
	'createCollaborationDoc'(docName, postContent) {
		if (Meteor.isServer) {
			var	params = {
				docName: docName,
				postContent: postContent
			};
			createdDoc = HTTP.post('http://localhost:8080/createDoc', {data: params})
			return createdDoc;
		}
	}

});