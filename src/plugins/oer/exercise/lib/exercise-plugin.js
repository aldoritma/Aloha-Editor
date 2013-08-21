// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!exercise/css/exercise-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var SOLUTION_TEMPLATE, SOLUTION_TYPE_CONTAINER, TEMPLATE, TYPE_CONTAINER, activateExercise, activateSolution, deactivateExercise, deactivateSolution;
    TEMPLATE = '<div class="exercise">\n    <div class="problem"></div>\n</div>';
    SOLUTION_TEMPLATE = '<div class="solution">\n</div>';
    TYPE_CONTAINER = '<div class="type-container dropdown aloha-ephemera">\n    <span class="type btn-link" data-toggle="dropdown"></span>\n    <ul class="dropdown-menu">\n        <li><span class="btn-link" data-type="">Exercise</span></li>\n        <li><span class="btn-link" data-type="homework">Homework</span></li>\n        <li><span class="btn-link" data-type="problem">Problem</span></li>\n        <li><span class="btn-link" data-type="question">Question</span></li>\n        <li><span class="btn-link" data-type="task">Task</span></li>\n        <li><span class="btn-link" data-type="Worked Example">Worked Example</span></li>\n    </ul>\n</div>';
    SOLUTION_TYPE_CONTAINER = '<div class="type-container dropdown aloha-ephemera">\n    <span class="type btn-link" data-toggle="dropdown"></span>\n    <ul class="dropdown-menu">\n        <li><span class="btn-link">Answer</span></li>\n        <li><span class="btn-link">Solution</span></li>\n    </ul>\n</div>';
    activateExercise = function($element) {
      var $problem, $solutions, $typeContainer, type,
        _this = this;
      type = $element.attr('data-type') || 'exercise';
      $problem = $element.children('.problem').contents();
      $solutions = $element.children('.solution');
      $element.children().remove();
      $typeContainer = jQuery(TYPE_CONTAINER);
      $typeContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1));
      $typeContainer.find('.dropdown-menu li').each(function(i, li) {
        if (jQuery(li).children('span').data('type') === type) {
          return jQuery(li).addClass('checked');
        }
      });
      $typeContainer.prependTo($element);
      jQuery('<div>').addClass('problem').addClass('aloha-block-dropzone').attr('placeholder', "Type the text of your problem here.").appendTo($element).aloha().append($problem);
      jQuery('<div>').addClass('solutions').addClass('aloha-ephemera-wrapper').appendTo($element).append($solutions);
      jQuery('<div>').addClass('solution-controls').addClass('aloha-ephemera').append('<span class="add-solution btn-link">Click here to add an answer/solution</span>').append('<span class="solution-toggle">hide solution</span>').appendTo($element);
      if (!$solutions.length) {
        return $element.children('.solution-controls').children('.solution-toggle').hide();
      }
    };
    deactivateExercise = function($element) {
      var $problem, $solutions;
      $problem = $element.children('.problem');
      $solutions = $element.children('.solution');
      if ($problem.html() === '' || $problem.html() === '<p></p>') {
        $problem.html('&nbsp;');
      }
      $element.children().remove();
      jQuery("<div>").addClass('problem').html(jQuery('<p>').append($problem.html())).appendTo($element);
      return $element.append($solutions);
    };
    activateSolution = function($element) {
      var $body, $typeContainer, type,
        _this = this;
      type = $element.attr('data-type') || 'solution';
      $body = '';
      if ($element.text().trim().length) {
        $body = $element.children();
      }
      $element.children().remove();
      $typeContainer = jQuery(SOLUTION_TYPE_CONTAINER);
      $typeContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1));
      $typeContainer.find('.dropdown-menu li').each(function(i, li) {
        if (jQuery(li).children('a').text().toLowerCase() === type) {
          return jQuery(li).addClass('checked');
        }
      });
      $typeContainer.prependTo($element);
      return jQuery('<div>').addClass('body').addClass('aloha-block-dropzone').appendTo($element).aloha().append($body);
    };
    deactivateSolution = function($element) {
      $element.children(':not(.body)').remove();
      return $element.children('.body').contents().unwrap();
    };
    return Plugin.create('exercise', {
      getLabel: function($element) {
        if ($element.is('.exercise')) {
          return 'Exercise';
        } else if ($element.is('.solution')) {
          return 'Solution';
        }
      },
      activate: function($element) {
        if ($element.is('.exercise')) {
          return activateExercise($element);
        } else if ($element.is('.solution')) {
          return activateSolution($element);
        }
      },
      deactivate: function($element) {
        if ($element.is('.exercise')) {
          return deactivateExercise($element);
        } else if ($element.is('.solution')) {
          return deactivateSolution($element);
        }
      },
      selector: '.exercise,.solution',
      ignore: '.problem',
      init: function() {
        semanticBlock.register(this);
        UI.adopt('insertExercise', Button, {
          click: function() {
            return semanticBlock.insertAtCursor(TEMPLATE);
          }
        });
        semanticBlock.registerEvent('click', '.exercise .solution-controls .add-solution', function() {
          var controls, exercise;
          exercise = $(this).parents('.exercise').first();
          controls = exercise.children('.solution-controls');
          controls.children('.solution-toggle').text('hide solution').show();
          return semanticBlock.appendElement($(SOLUTION_TEMPLATE), exercise.children('.solutions'));
        });
        semanticBlock.registerEvent('click', '.exercise .solution-controls .solution-toggle', function() {
          var controls, exercise, solutions;
          exercise = $(this).parents('.exercise').first();
          controls = exercise.children('.solution-controls');
          solutions = exercise.children('.solutions');
          return solutions.slideToggle(function() {
            if (solutions.is(':visible')) {
              return controls.children('.solution-toggle').text('hide solution');
            } else {
              return controls.children('.solution-toggle').text('show solution');
            }
          });
        });
        semanticBlock.registerEvent('click', '.exercise .semantic-delete', function() {
          var controls, exercise;
          exercise = $(this).parents('.exercise').first();
          controls = exercise.children('.solution-controls');
          controls.children('.add-solution').show();
          if (exercise.children('.solutions').children().length === 1) {
            return controls.children('.solution-toggle').hide();
          }
        });
        return semanticBlock.registerEvent('click', '.aloha-oer-block.solution > .type-container > ul > li > *,\
                                              .aloha-oer-block.exercise > .type-container > ul > li > *', function(e) {
          var $el,
            _this = this;
          $el = jQuery(this);
          $el.parents('.type-container').first().children('.type').text($el.text());
          $el.parents('.aloha-oer-block').first().attr('data-type', $el.data('type'));
          $el.parents('.type-container').find('.dropdown-menu li').each(function(i, li) {
            return jQuery(li).removeClass('checked');
          });
          return $el.parents('li').first().addclass('checked');
        });
      }
    });
  });

}).call(this);
