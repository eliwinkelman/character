FlowRouter.route('/editor/:postId', {
	action: () => {
		BlazeLayout.render("editor");
	}
});
FlowRouter.route('/editor', {
	action: () => {
		BlazeLayout.render("editor" );
	}
});
FlowRouter.route('/dash', {
	action: () => {
		BlazeLayout.render("dashboard");
	}
});
FlowRouter.route('/dash/:postId', {
	action: () => {
		BlazeLayout.render("dashboard");
	}
});

FlowRouter.route('/posts', {
	action: () => {
		BlazeLayout.render("dashboardPosts" );
	}
});

FlowRouter.route('/', {
	action: () => {
		BlazeLayout.render("register");
	}
});
FlowRouter.route('/authorize', {
	action: () => {
		BlazeLayout.render("authorize");
	}
});