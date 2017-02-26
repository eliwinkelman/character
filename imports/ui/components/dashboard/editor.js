import "./editor.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import "./postbuttons.js";
import "./../loading";
import {MyEditor} from './react-editor/Editor';
//TODO: Autosave
//TODO: SEO Suggestions (yoastjs)
//TODO: Switch away from ghostdown to cleaner(code) editor.
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
						Session.set('editor-title', result.data.title.rendered);
						Session.set('editor-content', result.data.content.raw);
					}, 1000);

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
	'MyEditor'() {
		return MyEditor;
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

	},
	'suggestions'() {
		var writeGood = require('write-good');
		function highlightSuggestions(suggestions, originalHtml) {
			var highlightedHtml = originalHtml;
			function highlight(index, text, offset, reason) {
				var finalText = "<span class='highlight'><abbr title='" + reason + "' >" + text.substring(0, index) + "</abbr></span>";
				return finalText
			}

			for (var i = 0; i < suggestions.length; i++) {
				var offset = suggestions[i].offset,
					index = suggestions[i].index,
					reason = suggestions[i].reason,
					text = originalHtml.substr(index, offset),
					highlightedText = highlight(index, text, offset, reason);
				highlightedHtml = highlightedHtml.replace(text, highlightedText);

			}
			return highlightedHtml;


		}
		var text = Session.get('editor-html');
		var suggestions = writeGood(text);
		var highLightedSuggestions = highlightSuggestions(suggestions, text);
		console.log(highLightedSuggestions);
		return(highLightedSuggestions);
	}

});
Template.editor.events({
	
	'blur .entry-title'() {

		var title = document.getElementById('entry-title');
		if (title.value == '') {
			title.value = '(Untitled)';
		}


	}
	
});
