import React from 'react';
//TODO: Render all different buttons - after events work


//The active button, i.e. save, save draft, delete
class ActiveButton extends React.Component {
	constructor(props) {
		super(props);
		this.onActiveButtonClick = this.onActiveButtonClick.bind(this)

	}
	onActiveButtonClick (e) {
		e.preventDefault();
		this.props.notifyParent(this.props.activeButton);
	}
	render() {
		const isSaving = this.props.isSaving;
		let buttonText = isSaving ? <i className="fa fa-circle-o-notch fa-spin"/> : this.props.activeButton;

		return (
			<button type="button" onClick={this.onActiveButtonClick} className="btn btn-primary savePost">{buttonText}</button>
		);
	}
}

function SaveOption(props) {
	function buttonClick(e) {
		e.preventDefault();
		props.onClick(props.option)
	}
	return (
		<li>
		{ props.option != props.activeButton && <a style={{paddingLeft: 30}} href="" onClick={buttonClick}>{props.option}</a> }
		</li>
	)
}

export class EditorButtons extends React.Component {

	constructor(props) {
		super(props);

		this.state = {activeButton: 'Publish'};

		this.changeActiveButton = this.changeActiveButton.bind(this);
	}
	componentDidMount() {
		if (FlowRouter.getQueryParam('new')) {
			this.setState({activeButton: 'Save Draft'})
		}
	}
	changeActiveButton(activeButton) {
		this.setState({activeButton: activeButton})
	}

	render(){
		let dropDown = null;
		let dropDownButton = null
		if (!FlowRouter.getQueryParam('new')) {

			dropDown =

				<ul className="dropdown-menu" aria-labelledby="editDropdown">
				<SaveOption option="Publish" onClick={this.changeActiveButton}   activeButton={this.state.activeButton}/>
		<SaveOption option="Save Draft" onClick={this.changeActiveButton} activeButton={this.state.activeButton}/>
		<li role="separator" className="divider"/>
				<SaveOption option="Delete" onClick={this.props.notifyParent} activeButton={this.state.activeButton}/>
		</ul>;
			dropDownButton = 			<button type="button" id="editDropdown" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				<span className="caret"/>
				<span className="sr-only">Toggle Dropdown</span>
			</button>

		}
		return(
			<div className="btn-group editPostButtons">
				<a href="/dash" className="btn btn-primary">Back</a>
				<ActiveButton notifyParent={this.props.notifyParent} isSaving={this.props.isSaving} activeButton={this.state.activeButton}/>
				{dropDownButton}
				{dropDown}

			</div>
		)
	}
}


