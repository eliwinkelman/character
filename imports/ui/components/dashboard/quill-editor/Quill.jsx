import React from 'react';
import Quill from 'quill';
import {Meteor} from 'meteor/meteor';
import {Header} from '../react-editor/Header.jsx';
var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
sharedb.types.register(richText.type);

export class quillEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loadWords: false,
			isSaving: false,
			quill: null
		};
		this.onSubmitButtonClick = this.onSubmitButtonClick.bind(this);

	}

	//update/delete/create new post actions
	onSubmitButtonClick(button) {
		var postId = FlowRouter.getParam('postId');

		if(FlowRouter.getQueryParam('new')) {
			//Post is only local, postId param refers to the collaboration ID, not the WP id
			postId = null;
			//Set the local collaboration id to save the new posts Wp Id when created

		}
		let localPostId = this.props.docName;
		//Need to convert content to html
		var content = this.state.quill.getContents();
		var title = document.getElementById('entry-title').value;
		if (button == 'Save Draft'){
			//Checks if doc is saving already
			if(!this.state.isSaving){
				//Doc is saving
				this.setState({isSaving: true});

				if (postId) {
					//Update post if it already exists
					Meteor.call('updatePost', postId, title, content, function(error, result) {
						if (error) {
							console.log(error);
						}
						else {
							Meteor.call('eraseLocalPostContent', localPostId)
						}
					});
				}

				else {
					//Create new post
					Meteor.call('newPost', title, content, function(error, result) {
						if (!error) {
							//Add WP Id to the local Post object
							Meteor.call('setLocalPostWPId', localPostId, result);
							//erase the local content so we know it has saved.
							Meteor.call('eraseLocalPostContent', localPostId);
							//go to the new created WP post
							FlowRouter.go('/editor/' + result);
						}
					});
				}
				//Doc is done saving
				this.setState({isSaving: false});
			}
		}

		else if (button == 'Publish'){
			if(!this.state.isSaving){

				//doc is saving
				this.setState({isSaving: true});

				if (postId) {
					Meteor.call('publishPost', postId, title, content, function(error, result) {
						if (error) {
							alert('There was a server error. It is in the console (inspect) for debugging');
							console.log(error);
						}
						if(!error && !postId){
							Meteor.call('eraseLocalPostContent', localPostId);
							FlowRouter.go('/editor/' + result);
						}
						else if (!error) {
							Meteor.call('eraseLocalPostContent', localPostId)
						}

					});
				}
				//doc is done saving
				this.setState({isSaving: false});
			}
		}

		else if (button == 'Delete'){
			if(!this.state.isSaving){
				this.setState({isSaving: true});
				Meteor.call('deletePost', postId, function(error, response) {
					if(!error) {
						Meteor.call('eraseLocalPostContent', localPostId);
						setTimeout(function() {
							FlowRouter.go('/dash');
						}, 1000);
					}
				});
			}
		}
		else {
			alert('unknown button')
		}
	}

	render() {
		return (
			<div className="editorContainer">
				<Header isSaving={this.state.isSaving} title={this.props.title} notifyParent={this.onSubmitButtonClick} />
				<div id="editor"></div>
			</div>
		)
	}
	
	componentDidMount() {
		// Open WebSocket connection to ShareDB server

		var collaborationServerUrl = Meteor.settings.public.collaborationServerUrl;
		console.log(collaborationServerUrl);
		var socket = new WebSocket('ws://' + collaborationServerUrl);
		var connection = new sharedb.Connection(socket);

// For testing reconnection
		window.disconnect = function() {
			connection.close();
		};

		window.connect = function() {
			var socket = new WebSocket('ws://' + collaborationServerUrl);
			connection.bindToSocket(socket);
		};

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
		console.log(this.props.docName);
		var quill = new Quill('#editor', {theme: 'snow'});
		if (this.props.content) {
			quill.clipboard.dangerouslyPasteHTML(1, this.props.content);

			console.log(quill.getContents());
			Meteor.call('createCollaborationDoc', this.props.docName, quill.getContents().ops, false);
			this.setState({quill: quill});
		}
		else {
			Meteor.call('createCollaborationDoc', this.props.docName, [], true);
		}
		var doc = connection.get(this.props.docName, 'richtext');

		doc.subscribe(function(err) {
			if (err) throw err;

			this.setState({quill: quill});

			quill.setContents(doc.data);

			quill.on('text-change', function(delta, oldDelta, source) {
				if (source !== 'user') return;
				doc.submitOp(delta, {source: quill});
				Meteor.call('updateLocalPostContent', quill.getContents(), this.props.docName);
				this.setState({quill: quill});
			}.bind(this));

			doc.on('op', function(op, source) {
				if (source === quill) return;
				quill.updateContents(op);
				Meteor.call('updateLocalPostContent', quill.getContents(), this.props.docName);
			}.bind(this));

		}.bind(this));



	}
}