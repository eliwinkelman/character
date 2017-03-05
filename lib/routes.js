FlowRouter.route('/editor/:postId', {
	action: () => {
		BlazeLayout.render("appLayout", {template: "editor"});
	}
});
FlowRouter.route('/editor', {
	action: () => {
		BlazeLayout.render("appLayout", {template: "editor"});
	}
});
FlowRouter.route('/dash', {
	action: () => {
		BlazeLayout.render("appLayout", {template: "dashboard"});
	}
});
FlowRouter.route('/dash/:postId', {
	action: () => {
		BlazeLayout.render("appLayout", {template: "dashboard"});
	}
});

FlowRouter.route('/', {
	action: () => {
		BlazeLayout.render("register");
	}
});
FlowRouter.route('/authorize', {
	action: () => {
		BlazeLayout.render("appLayout", {template: "authorize"});
	}
});
FlowRouter.route('/sign-up', {
	action: () => {
		BlazeLayout.render("signUp");
	}
});
FlowRouter.route('/sign-in', {
	action: () => {
		BlazeLayout.render("signin");
	}
});