import React from 'react';

export class noBlogs extends React.Component {

	render() {
		return(
			<div className="center-vertically-horizontally-container">
				<div className="center-vertically-horizontally text-center">
					<h1>You have no blogs.</h1>
					<a href="/authorize" className="btn btn-primary btn-lg">Add Blog</a>
				</div>
			</div>
		)
	}

}