import "./sidebar.html"
import { Template } from "meteor/templating"
import "./post";

Template.sidebar.onCreated(
	function() {
		var sidebar = document.querySelector("#sidebar");
		var window = $(window).width;
		if (window < 768) {
			sidebar.style.height = 'calc(100vh - 60px)';
			$(".sidebar").hide();
		}
	}
);
Template.sidebar.onRendered(
	function() {

		$(window).resize(function() {
			var width = $(window).width();

			if (width < 768) {
				sidebar.style.height = 'calc(100vh - 60px)';
				$(".sidebar").hide();


			}
			if (width > 768) {
				sidebar.style.height = '100vh';
				$(".sidebar").show();
				$(".dashboardPanel").show();
			}

		})

	}
);
Template.sidebar.helpers({
	'newPostActive'() {
		var path = FlowRouter.current().path;
		if (path == "/editor") {
			return 'active';
		}

	},
	'contentActive'() {
		var path = FlowRouter.current().path;

		var re = new RegExp('/?[0-9][^a-z]*');
		if (re.test(path) || path=='/') {
			return "active";
		}

	}
});

Template.sidebar.helpers({
	
});