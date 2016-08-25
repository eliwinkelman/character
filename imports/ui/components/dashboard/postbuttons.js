import "./postbuttons.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
Template.editPostButtons.onCreated(
	function () {
		this.isSaving = new ReactiveVar(false);

	}
);

Template.editPostButtons.helpers({
	'saveButton'() {
		var saving = Template.instance().isSaving.get();
		if (saving == true) {
			return "<i class='fa fa-circle-o-notch fa-spin'>"
		}
		else {
			return "Save";
		}
	},
	'publishButton'() {
		var saving = Template.instance().isSaving.get();
		if (saving == true) {
			return "<i class='fa fa-circle-o-notch fa-spin'>"
		}
		else {
			return "Publish";
		}
	}
});
Template.editPostButtons.events({
	'click .saveDraftDropdown'() {
		//switch to save button
		var saveButton = document.querySelector(".saveButton");
		var publishButton = document.querySelector(".publishButton");
		var dropDown = document.querySelector(".dropdown-toggle");
		dropDown.classList.add("btn-primary");
		dropDown.classList.remove("btn-success");
		publishButton.classList.remove("editButtonActive");
		saveButton.classList.add("editButtonActive");
	},

	'click .publishDropdown'() {
		//switch to publish button
		var saveButton = document.querySelector(".saveButton");
		var publishButton = document.querySelector(".publishButton");
		var dropDown = document.querySelector(".dropdown-toggle");
		dropDown.classList.remove("btn-primary");
		dropDown.classList.add("btn-success");
		saveButton.classList.remove("editButtonActive");
		publishButton.classList.add("editButtonActive");
	},

	'click .savePost'(event) {

		if (Template.instance().isSaving.get() == false) {
			Template.instance().isSaving.set(true);


			var postId = FlowRouter.getParam('postId');
			var content = Session.get('editor-html');
			var title = document.getElementById('entry-title').value;
			var templateInstance = Template.instance();
			if (postId) {
				Meteor.call('updatePost', postId, title, content, function(error, result) {
					if (!error) {
						console.log(result);
						templateInstance.isSaving.set(false);

					}
					else {
						console.log(error);
						templateInstance.isSaving.set(false);
					}

					});
			}

			else {
					Meteor.call('newPost', title, content, function(error, result) {
						if (!error) {
							templateInstance.isSaving.set(false);
							FlowRouter.go('/editor/' + result);
						}
					});
			}
		}

	},
	'click .deleteButton'() {
			if (Template.instance().isSaving.get() == false) {
				Template.instance().isSaving.set(true);
				var postId = FlowRouter.getParam('postId');

				Meteor.call('deletePost', postId, function(error, response) {
					if(!error) {
						setTimeout(function() {
							FlowRouter.go('/dash');
						}, 1000);

					}
				});
			}

	},
	'click .publishPost'() {
		if (Template.instance().isSaving.get() == false) {
			Template.instance().isSaving.set(true);

			var postId = FlowRouter.getParam('postId');
			var content = Session.get('editor-html');
			var title = document.getElementById('entry-title').value;
			var templateInstance = Template.instance();
			if (postId) {
				Meteor.call('publishPost', postId, title, content, function(error, result) {
					if (!error) {

						templateInstance.isSaving.set(false);
					}

				});
			}

			else {
				Meteor.call('publishPost', postId, title, content, function(error, result) {
					if (!error) {

						templateInstance.isSaving.set(false);
						FlowRouter.go('/editor/' + result);
					}

				});
			}
		}
	}

});
Template.editPost.events({
	'click .editPostButton'() {
		var route=this.route;
		FlowRouter.go(route);
	}
});