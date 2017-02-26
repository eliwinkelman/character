import React from 'react';
import Editor from 'draft-js-plugins-editor';
import retext from 'retext';
import simplify from 'retext-simplify'
import passive from 'retext-passive'
import writeGood from 'write-good';
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
		editorState = EditorState.createEmpty();
		if (this.props.content != null) {
			let blocksFromHTML = convertFromHTML(this.props.content);
			editorState = EditorState.createWithContent(ContentState.createFromBlockArray(
				blocksFromHTML.contentBlocks,
				blocksFromHTML.entityMap
			));
		}
		
		this.state = {
			editorState: editorState,
			loadWords: false,
			//words
			simplify: [],
			overuse: [],
			passive: [],
			adverbs: [],

			isSaving: false
		};




		this.onChange = (editorState) => this.setState({editorState});
		this.handleKeyCommand = this.handleKeyCommand.bind(this);
		this.myKeyBindingFn = this.myKeyBindingFn.bind(this);
		this.simplifyStrategy = this.simplifyStrategy.bind(this);
		this.passiveStrategy = this.passiveStrategy.bind(this);
		this.onSubmitButtonClick = this.onSubmitButtonClick.bind(this);
		this.adverbStrategy = this.adverbStrategy.bind(this);
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
	adverbStrategy(contentBlock, callback, contentState) {

		if(this.state.loadWords) {
			var loadedWords = writeGood(contentBlock.text.toLowerCase(), {
				weasel: false,
				passive: false,
				illusion: false,
				so: false,
				thereIs: false,
				cliches: false,
				tooWordy: false
			});
			var adverbs = this.state.adverbs;
			for (var i = 0; i < loadedWords.length; i++) {
				var offset = loadedWords[i].offset,
					index = loadedWords[i].index;
				var adverb = contentBlock.text.toLowerCase().substr(index, offset)
				if(adverbs.indexOf(adverb) === -1){
					adverbs.push(adverb);
				}
			}
			this.setState({adverbs: adverbs});
			this.setState({loadWords: false})
		}

		var words = this.state.adverbs;
		console.log(words);
		if(words != undefined){
			for (i = 0; i < words.length; i++) {
				var word = words[i];
				findWithRegex(WORD_REGEX(word), contentBlock, callback);
			}
		}
	}

	passiveStrategy(contentBlock, callback, contentState) {
		var passiveWords = this.state.passive;
		if(this.state.loadWords) {
			var loadedWords = retext().use(passive).process(contentBlock.text.toLowerCase());

			for (var i = 0; i < loadedWords.messages.length; i++) {
				if(passiveWords.indexOf(loadedWords.messages[i].ruleId) === -1){
					passiveWords.push(loadedWords.messages[i].ruleId)
				}
			}

			this.setState({passive: passiveWords});
			this.setState({loadWords: false})
		}
		var words = this.state.passive;


		if(words != undefined){
			for (i = 0; i < words.length; i++) {
				var word = words[i];
				findWithRegex(WORD_REGEX(word), contentBlock, callback);
			}
		}
	}

	simplifyStrategy(contentBlock, callback, contentState) {
		var simplifyWords = this.state.simplify;
		if(this.state.loadWords) {
			var loadedWords = retext().use(simplify).process(contentBlock.text.toLowerCase());

			for (var i = 0; i < loadedWords.messages.length; i++) {
				if (simplifyWords.indexOf(loadedWords.messages[i].ruleId) === -1) {
					simplifyWords.push(loadedWords.messages[i].ruleId)
				}
			}
			this.setState({simplify: simplifyWords});
			this.setState({loadWords: false})
		}
		var words = this.state.simplify;

		if(words != undefined){
			for (i = 0; i < words.length; i++) {
				var word = words[i];
				findWithRegex(WORD_REGEX(word), contentBlock, callback);
			}
		}
	}

	render() {
		const plugins = [richButtonsPlugin];
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
						strategy: this.simplifyStrategy,
						component: SimplifyHighlightSpan
					},
					{
						strategy: this.passiveStrategy,
						component: PassiveHighlightSpan
					},
					{
						strategy: this.adverbStrategy,
						component: AdverbHighlightSpan
					}]}
					ref="editor"
				    plugins={plugins}
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
		word + '\\b)', 'gi');
}

function findWithRegex(regex, contentBlock, callback) {
	const text = contentBlock.getText();
	let matchArr, start;
	while ((matchArr = regex.exec(text)) !== null) {
		start = matchArr.index;
		callback(start, start + matchArr[0].length);
	}
}

const SimplifyHighlightSpan = (props) => {
	return (
		<span
			style={styles.highlightSimplify}
			data-offset-key={props.offsetKey}
		>
            {props.children}
          </span>
	);
};
const PassiveHighlightSpan = (props) => {
	return (
		<span
			style={styles.highlightPassive}
			data-offset-key={props.offsetKey}
		>
            {props.children}
          </span>
	);
};
const AdverbHighlightSpan = (props) => {
	return (
		<span
			style={styles.highlightAdverb}
			data-offset-key={props.offsetKey}
		>
            {props.children}
          </span>
	);
};
const styles = {

	highlightSimplify: {
		backgroundColor: 'rgba(98, 177, 254, 1.0)'
	},
	highlightAdverb: {
		backgroundColor: 'rgb(102, 255, 153)'
	},
	highlightPassive: {
		backgroundColor: '#FFAA3B'
	}

};


