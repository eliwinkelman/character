import "./editor.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import "./postbuttons.js";
import "./../loading";
import {quillEditor} from './quill-editor/Quill.jsx';
//TODO: Autosave
//TODO: SEO Suggestions (yoastjs)
//TODO: Collaborative (multi user) editing.

Template.editor.onCreated(
	function() {
		this.isLoading = new ReactiveVar(true);
		var postId = FlowRouter.getParam('postId');
		var self = this;

		if (postId) {
			//loads all the post data
			Meteor.call('getPost', postId, function(error, result){
				if (!error) {
					$("#loader-wrapper").fadeOut(1000);
					setTimeout(function() {
						self.isLoading.set(false);

					}, 1000);
				if (error) {
					alert('There was an error getting the post. Error is in console.');
					console.log(error);
					FlowRouter.go('/dash');
				}
				}

			});
		}
		else {
			$("#loader-wrapper").fadeOut(1000);
			setTimeout(function() {
				self.isLoading.set(false);
			}, 1000)
		}


	}

);


Template.editor.helpers({
	
	'QuillEditor'() {
		return quillEditor;
	},
	'isLoading'() {
		//checks if the template is still loading data
		return Template.instance().isLoading.get();
	},
	'postId'() {
		return FlowRouter.getParam('postId');
	},
	'title'() {
		//returns the posts title
		if (FlowRouter.getParam('postId')) {
			var title = Session.get('editor-title');
			return (title);
		}
	},
	'content'() {
		//return the posts content
		if (FlowRouter.getParam('postId')) {
			var content = Session.get('editor-content');
			return (content);
		}

	}

});
Template.editor.events({
	
	'blur .entry-title'() {

		var title = document.getElementById('entry-title');
		if (title.value == '') {
			title.value = '(Untitled)';
		}


	},
	
	
});
