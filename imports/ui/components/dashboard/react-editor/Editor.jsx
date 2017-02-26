import React from 'react';
import Editor from 'draft-js-plugins-editor';
import retext from 'retext';
import simplify from 'retext-simplify'
import {CompositeDecorator, EditorState, ContentState, RichUtils} from 'draft-js';
import {Header} from './Header';
import 'draft-js/dist/Draft.css';
import {stateToHTML} from 'draft-js-export-html';
import {richButtonsPlugin, Toolbar} from './Toolbar';
import {EditorButtons} from './Buttons.jsx';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import {convertFromRaw, convertToRaw, convertFromHTML} from 'draft-js';
import {Meteor} from 'meteor/meteor';
//Todo: look at swarm for collaboration

export class MyEditor extends React.Component {

	constructor(props) {
		super(props);//must be called
		blocksFromHTML = convertFromHTML(this.props.content);

		this.onChange = (editorState) => this.setState({editorState});
		this.handleKeyCommand = this.handleKeyCommand.bind(this);
		this.myKeyBindingFn = this.myKeyBindingFn.bind(this);
		this.handleStrategy = this.handleStrategy.bind(this);
		this.onSubmitButtonClick = this.onSubmitButtonClick.bind(this);
		this.state = {
			editorState: EditorState.createWithContent(ContentState.createFromBlockArray(
				blocksFromHTML.contentBlocks,
				blocksFromHTML.entityMap
			)),
			loadWords: true,
			words: {
				simplify: []
			},
			isSaving: false
		};
	}

	myKeyBindingFn(e: SyntheticKeyboardEvent): string {
		if (e.keyCode === 32) {
			this.setState({loadWords: true});
		}
		return getDefaultKeyBinding(e);
	}

	handleKeyCommand(command) {

		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if (newState) {
			this.onChange(newState);
			return 'handled';
		}
		return 'not-handled';
	}

	_onBoldClick() {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
	}

	onSubmitButtonClick(button) {
		var postId = FlowRouter.getParam('postId');
		var content = stateToHTML(this.state.editorState.getCurrentContent());
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
				var postId = FlowRouter.getParam('postId');
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

	handleStrategy(contentBlock, callback, contentState) {

		if(this.state.loadWords) {
			var loadedWords = retext().use(simplify).process(contentBlock.text);
			this.setState({words: loadedWords.messages});
			this.setState({loadWords: false})
		}

		var words = this.state.words;
		
		if(words.length != undefined){
			for (i = 0; i < words.length; i++) {
				var word = words[i].ruleId;
				findWithRegex(WORD_REGEX(word), contentBlock, callback);
			}
		}
	}

	render() {
		let className = 'RichEditor-editor';
		return (
			<div>
			<Header isSaving={this.state.isSaving} title={this.props.title} notifyParent={this.onSubmitButtonClick} />
			<div className="RichEditor-root">
			<div>
				<Toolbar />
				<div className={className} onClick={this.focus}>
				<Editor
					editorState={this.state.editorState}
					handleKeyCommand={this.handleKeyCommand}
					onChange={this.onChange}
					keyBindingFn={this.myKeyBindingFn}
					decorators={[
					{
						strategy: this.handleStrategy,
						component: HighlightSpan
					}]}
					ref="editor"
				    plugins={[richButtonsPlugin]}
				/>
					</div>
			</div>
			</div>
			</div>
		);
	}

}

function WORD_REGEX(word){
	return new RegExp('(\\b' +
		word + '\\b)', 'g');
}

function findWithRegex(regex, contentBlock, callback) {
	const text = contentBlock.getText();
	let matchArr, start;
	while ((matchArr = regex.exec(text)) !== null) {
		start = matchArr.index;
		callback(start, start + matchArr[0].length);
	}
}

const HighlightSpan = (props) => {
	return (
		<span
			style={styles.highlight}
			data-offset-key={props.offsetKey}
		>
            {props.children}
          </span>
	);
};

const styles = {

	highlight: {
		backgroundColor: 'rgba(98, 177, 254, 1.0)'
	}

};


