Package.describe({
  name: 'eli:ghostdown',
  version: '0.4.558',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {

	api.versionsFrom("METEOR@0.9.2");

	api.use([
		'jquery',
		'templating'
	], 'client');

	api.addFiles([
		'lib/client/vendor/codemirror.js',
		'lib/client/vendor/showdown.js',
		'lib/client/codemirror-markdown.js',
		'lib/client/ghostdown.html',
		'lib/client/ghostdown.js'

	], 'client');


});
