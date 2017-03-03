import React from 'react';
import Quill from 'quill';
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

	onSubmitButtonClick(button) {
		var postId = FlowRouter.getParam('postId');
		var content = this.state.quill.getContents();
		var title = document.getElementById('entry-title').value;
		if (button == 'Save Draft'){
			if(!this.state.isSaving){
				this.setState({isSaving: true});

				if (postId) {
					Meteor.call('updatePost', postId, title, content, function(error, result) {
						if (error) {
							console.log(error);
						}
					});
				}
				else {
					Meteor.call('newPost', title, content, function(error, result) {
						if (!error) {
							FlowRouter.go('/editor/' + result);
						}
					});
				}
				this.setState({isSaving: false});
			}
		}

		else if (button == 'Publish'){
			if(!this.state.isSaving){
				this.setState({isSaving: true});

				if (postId) {
					Meteor.call('publishPost', postId, title, content, function(error, result) {
						if (error) {
							alert('There was a server error. It is in the console (inspect) for debugging');
							console.log(error);
						}
						if(!error && !postId){
							FlowRouter.go('/editor/' + result);
						}


					});
				}
				this.setState({isSaving: false});
			}
		}

		else if (button == 'Delete'){
			if(!this.state.isSaving){
				this.setState({isSaving: true});
				Meteor.call('deletePost', postId, function(error, response) {
					if(!error) {
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
		var socket = new WebSocket('ws://' + 'localhost:8080');
		var connection = new sharedb.Connection(socket);

// For testing reconnection
		window.disconnect = function() {
			connection.close();
		};
		window.connect = function() {
			var socket = new WebSocket('ws://' + 'localhost:8080');
			connection.bindToSocket(socket);
		};

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
		
		var doc = connection.get('example', 'richtext');
		doc.subscribe(function(err) {
			if (err) throw err;
			var quill = new Quill('#editor', {theme: 'snow'});
			this.setState({quill: quill});
			quill.setContents(doc.data);
			quill.on('text-change', function(delta, oldDelta, source) {
				if (source !== 'user') return;
				doc.submitOp(delta, {source: quill});
				this.setState({quill: quill});
			}.bind(this));
			doc.on('op', function(op, source) {
				if (source === quill) return;
				quill.updateContents(op);
			});
		}.bind(this));
	}
}