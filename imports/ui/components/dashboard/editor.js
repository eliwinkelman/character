import "./editor.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import {Random} from "meteor/random"
import {Blogs} from '/imports/api/blogs';
import "./postbuttons.js";
import "./../loading";
import {quillEditor} from './quill-editor/Quill.jsx';
//TODO: Autosave
//TODO: SEO Suggestions (yoastjs)
//TODO: Collaborative (multi user) editing.



Template.editor.onCreated(
	function() {
		this.isLoading = new ReactiveVar(true);
		let self = this;
		//subscribe to extra user data -- wait to receive data before rendering
		Meteor.subscribe('userData', () => {

			var postId = FlowRouter.getParam('postId');
			console.log(postId);
			var isNew = FlowRouter.getQueryParam('new');
			self.postContent = '';
			self.dontLoadContent = false;
			if (postId) {
				if (isNew) {
					self.docName=postId;
					Meteor.call('createCollaborationDoc', self.docName);
					$("#loader-wrapper").fadeOut(1000);
					setTimeout(function() {
						self.isLoading.set(false);
					}, 1000)
				}
				else {
					let blogId = Meteor.user().currentBlog;

					console.log(blogId);
					Meteor.subscribe('blogs', () => {
						console.log(postId);
						let blog = Blogs.findOne({_id: blogId});
						let posts = $.grep(blog.posts, (e) => {return e.wpId == postId});

						console.log(blog);
						console.log(posts);

						if (posts.length == 0) {
							self.docName = Random.id();
							Meteor.call('newLocalPost', '', postId, '', self.docName);
						}
						else {
							self.docName = posts[0].collabId;
							if (posts[0].content != null) {
								alert('This post is being edited on character right now, you will be given the edited copy in collaborative mode.')
								self.dontLoadContent = true;
							}
						}
						
						Meteor.call('createCollaborationDoc', self.docName);

						Meteor.call('getPost', postId, function(error, result){
							if (!error) {
								console.log(result);
								self.title = result.data.title;
								self.postContent=result.data.content.raw;
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
					});

				}
				//loads all the post data

			}
			else {
				self.docName = Random.id();
				Meteor.call('newLocalPost', '(untitled)', '-1', '', self.docName);
				Meteor.call('createCollaborationDoc', self.docName);
				FlowRouter.go('/editor/' + self.docName + '?' + 'new=true');
				$("#loader-wrapper").fadeOut(1000);
				setTimeout(function() {
					self.isLoading.set(false);
				}, 1000)
			}
		});

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
			var title = Template.instance().title;
			return (title);
		}
	},
	'content'() {
		//return the posts content
		console.log(Template.instance().dontLoadContent);
		if (Template.instance().dontLoadContent) {
			console.log('dont load' );
			return false;
		}
		else if (FlowRouter.getParam('postId')) {
			var content = Template.instance().postContent;
			return (content);
		}

	},

	'docName'() {
		return Template.instance().docName;
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
