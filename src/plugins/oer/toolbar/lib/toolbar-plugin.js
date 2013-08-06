// Generated by CoffeeScript 1.5.0
(function() {

  define(['jquery', 'aloha', 'aloha/plugin', 'ui/ui', 'PubSub', 'copy/copy-plugin'], function(jQuery, Aloha, Plugin, Ui, PubSub, Copy) {
    var $ROOT, adoptedActions, buildMenu, formats, makeItemRelay, squirreledEditable;
    squirreledEditable = null;
    $ROOT = jQuery('body');
    makeItemRelay = function(slot) {
      var ItemRelay;
      ItemRelay = (function() {

        function ItemRelay() {}

        ItemRelay.prototype.show = function() {
          return $ROOT.find(".action." + slot).removeClass('hidden');
        };

        ItemRelay.prototype.hide = function() {};

        ItemRelay.prototype.setActive = function(bool) {
          if (!bool) {
            $ROOT.find(".action." + slot).removeClass('active');
          }
          if (bool) {
            return $ROOT.find(".action." + slot).addClass('active');
          }
        };

        ItemRelay.prototype.setState = function(bool) {
          return this.setActive(bool);
        };

        ItemRelay.prototype.enable = function(bool) {
          if (bool == null) {
            bool = true;
          }
          if ($ROOT.find(".action." + slot).is('.btn')) {
            if (!bool) {
              $ROOT.find(".action." + slot).attr('disabled', 'disabled');
            }
            if (bool) {
              return $ROOT.find(".action." + slot).removeAttr('disabled');
            }
          } else {
            if (!bool) {
              $ROOT.find(".action." + slot).parent().addClass('disabled');
            }
            if (bool) {
              return $ROOT.find(".action." + slot).parent().removeClass('disabled');
            }
          }
        };

        ItemRelay.prototype.disable = function() {
          return this.enable(false);
        };

        ItemRelay.prototype.setActiveButton = function(a, b) {
          return console && console.log("" + slot + " TODO:SETACTIVEBUTTON:", a, b);
        };

        ItemRelay.prototype.focus = function(a) {
          return console && console.log("" + slot + " TODO:FOCUS:", a);
        };

        ItemRelay.prototype.foreground = function(a) {
          return console && console.log("" + slot + " TODO:FOREGROUND:", a);
        };

        return ItemRelay;

      })();
      return new ItemRelay();
    };
    adoptedActions = {};
    Ui.adopt = function(slot, type, settings) {
      var evt;
      evt = $.Event('aloha.toolbar.adopt');
      $.extend(evt, {
        params: {
          slot: slot,
          type: type,
          settings: settings
        },
        component: null
      });
      PubSub.pub(evt.type, evt);
      if (evt.isDefaultPrevented()) {
        evt.component.adoptParent(toolbar);
        return evt.component;
      }
      adoptedActions[slot] = settings;
      return makeItemRelay(slot);
    };
    Aloha.bind('aloha-ready', function(event, editable) {
      return jQuery.each(adoptedActions, function(slot, settings) {
        var selector;
        selector = ".action." + slot;
        $ROOT.on('click', selector, function(evt) {
          var $target;
          evt.preventDefault();
          Aloha.activeEditable = Aloha.activeEditable || squirreledEditable;
          $target = jQuery(evt.target);
          if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
            this.element = this;
            return settings.click.bind(this)(evt);
          }
        });
        if (settings.preview) {
          $ROOT.on('mouseenter', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.preview.bind(this)(evt);
            }
          });
        }
        if (settings.unpreview) {
          return $ROOT.on('mouseleave', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.unpreview.bind(this)(evt);
            }
          });
        }
      });
    });
    formats = {};
    buildMenu = function(options, selected) {
      var $container, label, tag;
      $container = $ROOT.find('.headings ul');
      $container.empty();
      for (tag in options) {
        label = options[tag];
        $container.append("<li><a href=\"#\" class=\"action changeHeading\" data-tagname=\"" + tag + "\">" + label + "</a></li>");
      }
      return $ROOT.find('.headings .currentHeading').text(formats[selected]);
    };
    /*
     register the plugin with unique name
    */

    return Plugin.create("toolbar", {
      defaults: {
        defaultFormat: 'p',
        formats: {
          'p': 'Normal Text',
          'h1': 'Heading',
          'h2': 'Subheading',
          'h3': 'SubSubHeading'
        }
      },
      init: function() {
        var changeHeading, copyButton, toolbar,
          _this = this;
        toolbar = this;
        formats = this.settings.formats;
        jQuery.extend(toolbar.settings, this.defaults);
        changeHeading = function(evt) {
          var $el, $newEl, $oldEl, hTag, rangeObject;
          evt.preventDefault();
          $el = jQuery(this);
          hTag = $el.attr('data-tagname');
          rangeObject = Aloha.Selection.getRangeObject();
          if (rangeObject.isCollapsed()) {
            GENTICS.Utils.Dom.extendToWord(rangeObject);
          }
          Aloha.Selection.changeMarkupOnSelection(Aloha.jQuery("<" + hTag + "></" + hTag + ">"));
          jQuery('.currentHeading')[0].innerHTML = $el[0].innerHTML;
          $oldEl = Aloha.jQuery(rangeObject.getCommonAncestorContainer());
          $newEl = Aloha.jQuery(Aloha.Selection.getRangeObject().getCommonAncestorContainer());
          $newEl.addClass($oldEl.attr('class'));
          if ($newEl.is('h1,h2,h3') && !$newEl.children('.copy').length) {
            return $newEl.append(copyButton);
          } else {
            return $newEl.children('.copy').remove();
          }
        };
        copyButton = '<button class="copy btn aloha-ephemera" style="float: right; padding: 2px; margin: 0 5px 0 0;" title="copy"><i class="icon-file"></i></button>';
        Aloha.bind('aloha-editable-created', function(e, params) {
          var $editable;
          $editable = params.obj;
          $editable.find('h1,h2,h3').each(function() {
            return jQuery(this).append(copyButton);
          });
          return $editable.on('click', 'h1 > .copy,h2 > .copy,h3 > .copy', function() {
            var $element, $elements, element, html, selector, _i, _len;
            $element = jQuery(this).parent();
            selector = "h1,h2,h3".substr(0, "h1,h2,h3".indexOf($element[0].nodeName.toLowerCase()) + 2);
            $elements = jQuery(this).parent().nextUntil(selector).andSelf();
            html = '';
            for (_i = 0, _len = $elements.length; _i < _len; _i++) {
              element = $elements[_i];
              html += jQuery(element).outerHtml();
            }
            return Copy.buffer(html);
          });
        });
        $ROOT.on('click', '.action.changeHeading', changeHeading);
        $ROOT.on('mousedown', ".action", function(evt) {
          return evt.stopPropagation();
        });
        Aloha.bind('aloha-editable-activated', function(event, data) {
          return squirreledEditable = data.editable;
        });
        return PubSub.sub('aloha.selection.context-change', function(data) {
          var allowedFormats, blacklist, currentHeading, el, label, parents, tag, whitelist;
          el = data.range.commonAncestorContainer;
          parents = $(el).parents().andSelf();
          currentHeading = parents.filter(Object.keys(formats).join(',')).first();
          blacklist = [];
          parents.filter('[data-format-blacklist]').each(function() {
            return blacklist += jQuery(this).data('formatBlacklist');
          });
          whitelist = [];
          parents.filter('[data-format-whitelist]').each(function() {
            return whitelist += jQuery(this).data('formatWhitelist');
          });
          allowedFormats = [];
          for (tag in formats) {
            label = formats[tag];
            if ((!blacklist.length || blacklist.indexOf(tag) === -1) && (!whitelist.length || whitelist.indexOf(tag) !== -1)) {
              allowedFormats[tag] = label;
            }
          }
          if (currentHeading.length) {
            currentHeading = currentHeading.get(0).tagName.toLowerCase();
          } else {
            currentHeading = toolbar.settings.defaultFormat;
          }
          return buildMenu(allowedFormats, currentHeading);
        });
      },
      childVisible: function(childComponent, visible) {
        var evt;
        evt = $.Event('aloha.toolbar.childvisible');
        evt.component = childComponent;
        evt.visible = visible;
        return PubSub.pub(evt.type, evt);
      },
      childFocus: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childfocus');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      childForeground: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childforeground');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      /*
       toString method
      */

      toString: function() {
        return "toolbar";
      }
    });
  });

}).call(this);
