import "./authorize.html";
import React from 'react';
import { Meteor } from "meteor/meteor";

Meteor.subscribe('userData');

export class AuthorizeBlog extends React.Component{
	
	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}
	
	onSubmit(event) {
		
		event.preventDefault();
		
		const target = event.target;
		var url = target.url.value;
		Meteor.call('getTempTokens', url, function(error, response) {
			if (!error) {
				window.location.href = response;
			}
			else {
				alert("There was a server error.")
			}
		});
		
	}
	
	componentDidMount() {
		var oauthVerifier = FlowRouter.getQueryParam('oauth_verifier');
		var url = '';
		if (oauthVerifier) {
			Meteor.call('getPermTokens', oauthVerifier, function(error, response) {
				if (!error) {
					FlowRouter.go('/dash');
				}
			});
		}
	}
	render() {
		return(
			<div className="container-fluid">
				<div className="row">
					<div className="col-xs-12 text-center">

						<h1>Add A Blog</h1>
						<h4>Install the following plugins on your wordpress site.</h4>
						<p><a href="https://downloads.wordpress.org/plugin/rest-api-oauth1.0.3.0.zip">WP Rest API Oauth1 Plugin.</a> This allows Character to securely connect to your blog.</p>
						<p><a href="https://github.com/WP-API/broker-plugin/archive/master.zip">WP Rest API Broker Plugin</a> This allows Character to connect more simply.</p>
						<p>Once you have installed both plugins input your url below.</p>
						<form className="domainNameForm form-inline">
							<div className="input-group input-group-lg">
								<span className="input-group-addon">http://</span>
								<input type="text" className="form-control url" id="url" placeholder="Website Url"/>
							</div>
							<button className="btn btn-primary" onSubmit={this.onSubmit} type="submit">Continue</button>
						</form>

					</div>
				</div>
			</div>
		)
	}
	
}

