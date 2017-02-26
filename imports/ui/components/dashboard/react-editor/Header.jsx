import React from 'react';
import {EditorButtons} from './Buttons';

export class Header extends React.Component {

	render() {
		return(
			<header>
				<section className="box entry-title">
					<div className="row">
						<div className="col-xs-4 col-sm-8 col-md-9">
							<input id="entry-title" className="entry-title" autoFocus="autofocus" defaultValue={this.props.title} placeholder="Your Post Title" tabIndex="1" type="text"/>

						</div>

						<div className="col-xs-8 col-md-3 col-sm-4">

						<EditorButtons isSaving={this.props.isSaving} notifyParent={this.props.notifyParent} />


						</div>
					</div>


				</section>
			</header>
		)
	}
}