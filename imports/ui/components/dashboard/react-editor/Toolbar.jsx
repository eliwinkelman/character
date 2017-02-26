import React from 'react';
import createRichButtonsPlugin from 'draft-js-richbuttons-plugin';
export const richButtonsPlugin = createRichButtonsPlugin();
const {
	// inline buttons
	ItalicButton, BoldButton, MonospaceButton, UnderlineButton,
	// block buttons
	ParagraphButton, BlockquoteButton, CodeButton, OLButton, ULButton, H1Button, H2Button, H3Button, H4Button, H5Button, H6Button
} = richButtonsPlugin;

const IconButton = ({iconName, toggleInlineStyle, isActive, label, inlineStyle, onMouseDown }) =>
	<a onClick={toggleInlineStyle} onMouseDown={onMouseDown}>
    <span
	    className={`fa fa-${iconName}`}
	    style={{ color: isActive ? '#5890ff' : '#777', marginRight: 10}}
    />
	</a>;
export class Toolbar extends React.Component {
	
	render(){
		return(
		<div className="myToolbar">
			<BoldButton>
				<IconButton iconName="bold"/>
			</BoldButton>

			<ItalicButton>
				<IconButton iconName="italic"/>
			</ItalicButton>
			<UnderlineButton>
				<IconButton iconName="underline"/>
			</UnderlineButton>

			<ParagraphButton/>
			<H1Button/>
			<H2Button/>
			<H3Button/>
			<H4Button/>
			<H5Button/>
			<H6Button/>
			<BlockquoteButton/>
			<ULButton/>
			<OLButton/>
		</div>)
	;
	};
	
}