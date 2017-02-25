/*
 * Set default Session var values
 */


//TODO: Fix bug that causes words in highlighted sentances to not be highlighted.

Meteor.startup(function() {
  Session.setDefault('editor-markdown', null);
  Session.setDefault('editor-html', null);
  Session.setDefault('editor-word-count', null);
	Session.setDefault('editor-suggestions', null);
	$(function() {
		$('[data-toggle="tooltip"]').tooltip();
	});

});

var preloadText = '';

/*
 * Initialize the editor functionality
 */
Template.GhostEditor.created = function() {
  var params = this.data.content;

  // {{> GhostEditor "abc"}} - string
if (params != undefined) {
	preloadText = toMarkdown(params);
}



};

Template.GhostEditor.rendered = function() {
	var writeGood = require('write-good');
	var simplify = require('retext-simplify');
	var retext = require('retext');
	var readability = require('retext-readability');
	var alex = require('alex');
  (function($, ShowDown, CodeMirror) {
    "use strict";

    $(function() {

      if (!document.getElementById('entry-markdown'))
        return;

      //var delay;
      var converter = new ShowDown.converter(),
        editor = CodeMirror.fromTextArea(document.getElementById('entry-markdown'), {
          mode: 'markdown',
          tabMode: 'indent',
          lineWrapping: true
        });

      // Really not the best way to do things as it includes Markdown formatting along with words

      if (preloadText) {

        editor.setValue(preloadText);
      }

      function updateWordCount() {
        var wordCount = document.getElementsByClassName('entry-word-count')[0],
          editorValue = editor.getValue();

        if (editorValue.length) {
          var count = editorValue.match(/\S+/g).length;
          wordCount.innerHTML = count + (count === 1 ? ' word' : ' words');
          Session.set('editor-word-count', count);
        } else {
          wordCount.innerHTML = 'word count';
        }
      }

      function updatePreview() {
        var preview = document.getElementsByClassName('rendered-markdown')[0];
        var html = converter.makeHtml(editor.getValue());

	      //writing suggestions



	      function highlightSuggestions(originalHtml) {
		      var highlightedHtml = originalHtml;
				originalHtml = $(originalHtml).text();
		      var simplerAlternatives = retext().use(simplify).process(originalHtml).messages;

		      var adverb = writeGood(originalHtml, {
			      weasel: false,
			      passive: false,
			      illusion: false,
			      so: false,
			      thereIs: false,
			      cliches: false,
			      tooWordy: false
		      });

		      var passive = writeGood(originalHtml, {
			      weasel: false,
			      adverb: false,
			      illusion: false,
			      so: false,
			      thereIs: false,
			      cliches: false,
			      tooWordy: false
		      });
		      /*var adverbs = adverbWhere(originalHtml); */
		      // var alexSuggestions = alex.text(originalHtml).messages;

		      //split into individual sentences TODO: use a actual english parser for splitting things into sentences (greater accuracy)
		      var sentences = highlightedHtml.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
				console.log(sentences);

				var replaced = [];
		      function highlight(text, reason, color) {

			      var finalText = "<abbr data-toggle='tooltip' data-placement='bottom' title = '" + reason + "' ><span style='background-color:" + color + ";' class='highlight'>" + text + "</span></abbr>";

			      return finalText
		      }

		      function regExpEscape(literal_string) {
			      return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
			      //foolproof (so far) regex metacharacter escape, even so, let's hope they add that function in ecma7
		      }
		      //this function highlights entire sentences
		      function highlightSentence(html, color) {
			      return (html.replace(/(<[a-z]+[^<]*>)*(\S+)([\s+]|$)(<[a-z]+[^<]*>)*/g, "$1<span style='background-color:" + color + ";' class='highlightSentence'>$2$3</span>$4"));
		      }

		      for (i = 0; i < sentences.length; i++ ) {

			      var retextreadability = retext().use(readability, {
				      'age': 14
			      }).process(sentences[i]);
			     if (retextreadability.messages[0] != undefined) {
				     var difficulty = retextreadability.messages[0].level;
				     console.log(difficulty);
				     if (difficulty == 'quite') {
					     console.log(sentences[i] + " is very difficulty to read");
					     console.log(sentences[i]);
					     var highlightedSentence = highlightSentence(sentences[i]);

					     highlightedHtml = highlightedHtml.replace(sentences[i], highlightedSentence);
				     }
				     else if (difficulty == 'very' || difficulty == 'definitely') {
					     var highlightedSentence = highlightSentence(sentences[i], "rgba(219, 107, 107, 0.55)");

					     highlightedHtml = highlightedHtml.replace(sentences[i], highlightedSentence);
				     }
			     }

		      }
			for (var i=0; i < simplerAlternatives.length; i++) {
				var message = simplerAlternatives[i];
				var text = originalHtml.substring(message.location.start.offset, message.location.end.offset);
				if (replaced.indexOf(text) == -1) {
					var reg = new RegExp("\\b(" + text + ")\\b", "g"),
					reason = message.reason,
						reasonReg = new RegExp('“'+ text + '”');
					reason = reason.replace(reasonReg, "");
					var	highlightedText = highlight(text, reason, "rgba(135, 92, 207, 0.44)");

					highlightedHtml = highlightedHtml.replace(reg, highlightedText);
					replaced.push(text);
				}

			}


		      for (var i = 0; i < adverb.length; i++) {
			      var offset = adverb[i].offset,
				      index = adverb[i].index,
				      color = 'rgba(108, 207, 92, 0.7)';
			        var reason='';
			      var text = originalHtml.substr(index, offset),
				      reg = new RegExp("\\b(" + text + ")\\b", "g"),

				      highlightedText = highlight(text, reason, color);


			      highlightedHtml = highlightedHtml.replace(reg, highlightedText);

		      }

		      for (var i = 0; i < passive.length; i++) {
			      var offset = passive[i].offset,
				      index = passive[i].index,
				      color = 'rgba(131, 203, 245, 0.7)';
			        var reason = '';
			      var text = originalHtml.substr(index, offset),
				      reg = new RegExp("\\b(" + text + ")\\b", "g"),

				      highlightedText = highlight(text, reason, color);


			      highlightedHtml = highlightedHtml.replace(reg, highlightedText);

		      }
/*
		      for (var i = 0; i < adverbs.length; i++) {
			      var indexAdverb = adverbs[i].index,
				      offsetAdverb = adverbs[i].offset;

			      text = originalHtml.substr(index, offset);

			      highlightedText = highlightAdverb(text);
			      highlightedHtml = highlightedHtml.replace(text, highlightedText);

		      }

				var checked = [];
		      for (var i = 0; i < alexSuggestions.length; i++) {

			      var startAlex = alexSuggestions[i].location.start.offset,
				      endAlex = alexSuggestions[i].location.end.offset,
			            reasonAlex = alexSuggestions[i].reason;

			      if (checked.indexOf(startAlex) != -1) {
				      continue;
			      }
					checked.push(startAlex);
			      reasonAlex = reasonAlex.replace(/['"]+/g, "");
			      reasonAlex = reasonAlex.replace(/`/g, "");

			      text = originalHtml.substring(startAlex, endAlex);

			      highlightedText = highlightAlex(text, reasonAlex);
			      highlightedHtml = highlightedHtml.replace(text, highlightedText);

		      } */

		      return highlightedHtml;


	      }
	      var highLightedSuggestions = highlightSuggestions(html);
	      Session.set('editor-suggestions', highLightedSuggestions);

        Session.set('editor-html', html);
	      preview.innerHTML = highLightedSuggestions;
	      $('abbr').tooltip();
        updateWordCount();
      }

      $('.entry-markdown header, .entry-preview header').click(function(e) {
        $('.entry-markdown, .entry-preview').removeClass('active');
        $(e.target).closest('section').addClass('active');
      });

      editor.on("change", function() {

        Session.set('editor-markdown', editor.getValue());
        updatePreview();


      });

      updatePreview();

      // Sync scrolling

      function syncScroll(e) {
        // vars
        var $codeViewport = $(e.target),
          $previewViewport = $('.entry-preview-content'),
          $codeContent = $('.CodeMirror-sizer'),
          $previewContent = $('.rendered-markdown'),

          // calc position
          codeHeight = $codeContent.height() - $codeViewport.height(),
          previewHeight = $previewContent.height() - $previewViewport.height(),
          ratio = previewHeight / codeHeight,
          previewPostition = $codeViewport.scrollTop() * ratio;

        // apply new scroll
        $previewViewport.scrollTop(previewPostition);
      }

      // TODO: Debounce
      $('.CodeMirror-scroll').on('scroll', syncScroll);

      // Shadow on Markdown if scrolled
      $('.CodeMirror-scroll').scroll(function() {
        if ($('.CodeMirror-scroll').scrollTop() > 10) {
          $('.entry-markdown').addClass('scrolling');
        } else {
          $('.entry-markdown').removeClass('scrolling');
        }
      });
      // Shadow on Preview if scrolled
      $('.entry-preview-content').scroll(function() {
        if ($('.entry-preview-content').scrollTop() > 10) {
          $('.entry-preview').addClass('scrolling');
        } else {
          $('.entry-preview').removeClass('scrolling');
        }
      });
    });
  }(jQuery, Showdown, CodeMirror));
};


Template.GhostEditor.destroyed = function () {
  Session.set('editor-markdown', null);
  Session.set('editor-html', null);
  Session.set('editor-word-count', null);
};
