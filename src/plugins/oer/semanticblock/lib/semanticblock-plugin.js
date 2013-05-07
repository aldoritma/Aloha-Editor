// Generated by CoffeeScript 1.5.0
(function() {

  define(['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'css!semanticblock/css/semanticblock-plugin.css'], function(Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button) {
    var activate, activateHandlers, bindEvents, blockControls, blockDragHelper, blockTemplate, deactivate, deactivateHandlers, insertElement, pluginEvents;
    if (pluginManager.plugins.semanticblock) {
      return pluginManager.plugins.semanticblock;
    }
    blockTemplate = jQuery('<div class="semantic-container"></div>');
    blockControls = jQuery('<div class="semantic-controls"><button class="semantic-delete"><i class="icon-remove"></i></button><button><i class="icon-cog"></i></button></div>');
    blockDragHelper = jQuery('<div class="semantic-drag-helper"><div class="title"></div><div class="body">Drag me to the desired location in the document</div></div>');
    activateHandlers = {};
    deactivateHandlers = {};
    pluginEvents = [
      {
        name: 'mouseenter',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').addClass('drag-active');
        }
      }, {
        name: 'mouseleave',
        selector: '.aloha-block-draghandle',
        callback: function() {
          if (!jQuery(this).parents('.semantic-container').data('dragging')) {
            return jQuery(this).parents('.semantic-container').removeClass('drag-active');
          }
        }
      }, {
        name: 'mousedown',
        selector: '.aloha-block-draghandle',
        callback: function(e) {
          e.preventDefault();
          return jQuery(this).parents('.semantic-container').data('dragging', true);
        }
      }, {
        name: 'mouseup',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').data('dragging', false);
        }
      }, {
        name: 'mouseover',
        selector: '.aloha-oer-block',
        callback: function() {
          return activate(jQuery(this));
        }
      }, {
        name: 'mouseleave',
        selector: '.semantic-container',
        callback: function() {
          if (!jQuery(this).data('dragging')) {
            return deactivate(jQuery(this).children('.aloha-oer-block'));
          }
        }
      }, {
        name: 'click',
        selector: '.semantic-container .semantic-delete',
        callback: function(e) {
          e.preventDefault();
          return jQuery(this).parents('.semantic-container').first().slideUp('slow', function() {
            return jQuery(this).remove();
          });
        }
      }, {
        name: 'click',
        selector: '[placeholder]',
        callback: function() {
          jQuery(this).removeClass('placeholder');
          if (jQuery(this).attr('placeholder') === jQuery(this).text()) {
            return jQuery(this).text('');
          }
        }
      }, {
        name: 'blur',
        selector: '[placeholder]',
        callback: function() {
          if (!jQuery(this).text()) {
            jQuery(this).text(jQuery(this).attr('placeholder'));
            return jQuery(this).addClass('placeholder');
          }
        }
      }, {
        name: 'click',
        selector: '.aloha-oer-block .title-container li a',
        callback: function(e) {
          e.preventDefault();
          jQuery(this).parents('.title-container').first().children('.type').text(jQuery(this).text());
          return jQuery(this).parents('.aloha-oer-block').first().attr('data-type', jQuery(this).text().toLowerCase());
        }
      }
    ];
    insertElement = function(element) {};
    activate = function(element) {
      var type, _results;
      if (!element.parent('.semantic-container').length) {
        element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock();
        type = void 0;
        _results = [];
        for (type in activateHandlers) {
          if (element.hasClass(type)) {
            activateHandlers[type](element);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };
    deactivate = function(element) {
      var type;
      if (element.parent('.semantic-container').length) {
        element.find('[placeholder]').trigger('click');
        type = void 0;
        for (type in deactivateHandlers) {
          if (element.hasClass(type)) {
            deactivateHandlers[type](element);
            break;
          }
        }
        element.siblings('.semantic-controls').remove();
        BlockManager.getBlock(element.parent('.semantic-container').get(0)).unblock();
        return element.unwrap();
      }
    };
    bindEvents = function(element) {
      var event, i, _results;
      if (element.data('oerBlocksInitialized')) {
        return;
      }
      element.data('oerBlocksInitialized', true);
      event = void 0;
      i = void 0;
      i = 0;
      _results = [];
      while (i < pluginEvents.length) {
        event = pluginEvents[i];
        element.on(event.name, event.selector, event.callback);
        _results.push(i++);
      }
      return _results;
    };
    Aloha.ready(function() {
      jQuery('.semantic-drag-source').children().each(function() {
        var element;
        element = jQuery(this);
        return element.draggable({
          revert: 'invalid',
          helper: function() {
            var helper;
            helper = jQuery(blockDragHelper).clone();
            helper.find('.title').text('im a helper');
            return helper;
          },
          start: function(e, ui) {
            jQuery('#canvas').addClass('aloha-block-dropzone');
            return jQuery(ui.helper).addClass('dragging');
          },
          refreshPositions: true
        });
      });
      return bindEvents(jQuery(document));
    });
    return Plugin.create('semanticblock', {
      init: function() {
        var _this = this;
        return Aloha.bind('aloha-editable-created', function(e, params) {
          var $root, classes, cls;
          $root = params.obj;
          classes = [];
          for (cls in activateHandlers) {
            classes.push("." + cls);
          }
          $root.find(classes.join()).each(function(i, el) {
            var $el;
            $el = jQuery(el);
            if (!$el.parents('.semantic-drag-source')[0]) {
              return $el.addClass('aloha-oer-block');
            }
          });
          if ($root.is('.aloha-block-blocklevel-sortable') && !$root.parents('.aloha-editable').length) {
            return $root.sortable('option', 'stop', function(e, ui) {
              var $el;
              $el = jQuery(ui.item);
              return $el.addClass('aloha-oer-block');
            });
          }
        });
      },
      insertAtCursor: function(template) {
        var element, range;
        element = blockTemplate.clone().append(template);
        range = Aloha.Selection.getRangeObject();
        element.addClass('semantic-temp');
        GENTICS.Utils.Dom.insertIntoDOM(element, range, Aloha.activeEditable.obj);
        element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return element.addClass('aloha-oer-block');
      },
      appendElement: function(element, target) {
        element = blockTemplate.clone().append(element);
        element.addClass('semantic-temp');
        target.append(element);
        element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return element.addClass('aloha-oer-block');
      },
      activateHandler: function(type, handler) {
        return activateHandlers[type] = handler;
      },
      deactivateHandler: function(type, handler) {
        return deactivateHandlers[type] = handler;
      },
      registerEvent: function(name, selector, callback) {
        return pluginEvents.push({
          name: name,
          selector: selector,
          callback: callback
        });
      }
    });
  });

}).call(this);
