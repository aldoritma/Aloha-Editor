// Generated by CoffeeScript 1.7.1
(function() {
  define(['aloha', 'jquery', 'overlay/overlay-plugin', 'ui/ui', 'aloha/console', 'aloha/ephemera', 'css!assorted/css/link.css'], function(Aloha, jQuery, Popover, UI, console, Ephemera) {
    var DETAILS_HTML, DIALOG_HTML, getContainerAnchor, getIcon, getTitle, populator, selector, shortString, shortUrl, showModalDialog, unlink;
    DIALOG_HTML = '<form class="modal" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true">\n  <div class="modal-dialog">\n  <div class="modal-content">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\n    <h3 id="linkModalLabel">Edit link</h3>\n  </div>\n  <div class="modal-body">\n    <div id="link-text">\n      <span>Text to display</span>\n      <div>\n        <input id="link-contents" class="input-xlarge form-control" type="text" placeholder="Enter a phrase here" required />\n      </div>\n    </div>\n\n    <hr/>\n\n      <div class="radio">\n        <label>\n          <input type="radio" name="link-type" value="link-internal"/>Link to a part of this page\n        </label>\n      </div>\n      <select class="link-internal link-input form-control collapse" name="linkinternal" id="link-internal">\n        <option value="">None</option>\n      </select>\n      <div class="radio">\n        <label>\n          <input type="radio" name="link-type" value="link-external"/>Link to webpage\n        </label>\n      </div>\n      <input class="link-input link-external form-control collapse" id="link-external" placeholder="http://"/>\n      <div class="radio">\n        <label>\n          <input type="radio" name="link-type" value="link-resource"/>Upload a Document and link to it\n        </label>\n      </div>\n      <div class="link-resource collapse">\n        <input id="link-resource-input" class="form-control" type="file" placeholder="path/to/file"/>\n        <input id="link-resource-url" class="link-input form-control hidden" placeholder="Upload a file first"/>\n      </div>\n  </div>\n  <div class="modal-footer">\n    <button class="btn btn-primary link-save">Submit</button>\n    <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>\n  </div>\n  </div>\n  </div>\n</form>';
    DETAILS_HTML = '<span class="link-popover-details">\n  <button class="btn-link edit-link" title="Change the link\'s text, location, or other properties">\n    <!-- <i class="fa fa-edit icon-edit"></i> -->\n    <span>Edit link...</span>\n  </button>\n  <button class="btn-link delete-link">\n    <!-- <i class="icon-delete"></i> -->\n    <span title="Remove the link, leaving just the text">Unlink</span>\n  </button>\n  <a class="visit-link" target="_blank" title="Visit the link in a new window or tab">\n    <i class=""></i>\n    <span class="title"></span>\n  </a>\n</span>\n<br/>';
    Ephemera.attributes('data-original-title');
    getTitle = function($el, href) {
      var $clone, caption;
      if ($el.is('h1,h2,h3,h4,h5,h6')) {
        $clone = $el.clone();
        $clone.find('.aloha-ephemera').remove();
        return $clone.text();
      } else if ($el.is('figure')) {
        caption = $el.find('figcaption');
        return caption.text() || 'Figure';
      } else if ($el.is('table')) {
        caption = $el.find('caption');
        return caption.text() || 'Table';
      } else {
        console.error('BUG! Trying to find title of unknown DOM element');
        return href;
      }
    };
    getIcon = function(href) {
      var $el;
      if (/^#/.test(href)) {
        $el = jQuery(href);
        if ($el.is('h1,h2,h3,h4,h5,h6')) {
          return 'fa fa-paragraph icon-paragraph';
        }
        if ($el.is('figure')) {
          return 'fa fa-file-image-o icon-image';
        }
        if ($el.is('table')) {
          return 'fa fa-table';
        }
        return '';
      } else {
        return 'fa fa-external-link icon-external-link';
      }
    };
    showModalDialog = function($el) {
      var $optGroup, a, appendOption, dialog, figuresAndTables, href, linkContents, linkExternal, linkInput, linkInternal, linkResource, linkResourceInput, linkResourceUrl, linkSave, massageUrlInput, orgElements, radios, root, uploadFile;
      root = Aloha.activeEditable.obj;
      dialog = jQuery(DIALOG_HTML);
      dialog.attr('data-backdrop', false);
      a = $el.get(0);
      linkContents = dialog.find('#link-contents');
      if (a.childNodes.length > 0) {
        linkContents.val($el.text());
      }
      linkExternal = dialog.find('.link-external');
      linkInternal = dialog.find('.link-internal');
      linkResource = dialog.find('.link-resource');
      linkResourceInput = dialog.find('#link-resource-input');
      linkResourceUrl = dialog.find('#link-resource-url');
      linkSave = dialog.find('.link-save');
      radios = dialog.find('[name="link-type"]');
      linkInput = dialog.find('.link-input');
      appendOption = function($el, $optGroup, text) {
        var href, option;
        option = jQuery('<option></option>');
        if (!$el.attr('id')) {
          $el.attr('id', GENTICS.Utils.guid());
        }
        href = "#" + ($el.attr('id'));
        text = getTitle($el, href);
        option.attr('value', href);
        option.append(text);
        return option.appendTo($optGroup);
      };
      orgElements = root.find('h1,h2,h3,h4,h5,h6');
      figuresAndTables = root.find('figure,table');
      orgElements.filter(':not([id])').each(function() {
        return jQuery(this).attr('id', GENTICS.Utils.guid());
      });
      if (orgElements[0]) {
        $optGroup = jQuery('<optgroup label="Headings"></optgroup>');
        $optGroup.appendTo(linkInternal);
        orgElements.each(function() {
          var item;
          item = jQuery(this);
          return appendOption(item, $optGroup);
        });
      }
      if (figuresAndTables[0]) {
        $optGroup = jQuery('<optgroup label="Figures and Tables"></optgroup>');
        $optGroup.appendTo(linkInternal);
        figuresAndTables.each(function() {
          var item;
          item = jQuery(this);
          return appendOption(item, $optGroup);
        });
      }
      linkInternal.on('change', function() {
        linkExternal.val('');
        linkResourceUrl.val('');
        return linkSave.toggleClass('disabled', !linkInternal.val());
      });
      linkExternal.on('change keyup', function() {
        linkInternal.val('');
        linkResourceUrl.val('');
        return linkSave.toggleClass('disabled', !linkExternal.val());
      });
      linkResourceUrl.on('change keyup', function() {
        linkInternal.val('');
        linkExternal.val('');
        return linkSave.toggleClass('disabled', !linkResourceUrl.val());
      });
      uploadFile = function(file, callback) {
        var f, settings, xhr;
        settings = Aloha.require('assorted/assorted-plugin').settings;
        xhr = new XMLHttpRequest();
        if (xhr.upload && settings.image.uploadurl) {
          xhr.onload = function() {
            var status, url, _ref;
            if (settings.image.parseresponse) {
              _ref = settings.image.parseresponse(xhr), status = _ref.status, url = _ref.url;
            } else {
              url = JSON.parse(xhr.response).url;
            }
            return callback(status, url);
          };
          xhr.open("POST", settings.image.uploadurl, true);
          xhr.setRequestHeader("Cache-Control", "no-cache");
          if (settings.image.uploadSinglepart) {
            xhr.setRequestHeader("Content-Type", "");
            xhr.setRequestHeader("X-File-Name", file.name);
            return xhr.send(file);
          } else {
            f = new FormData();
            f.append(settings.image.uploadfield || 'upload', file, file.name);
            return xhr.send(f);
          }
        }
      };
      linkResourceInput.on('change', function() {
        var files;
        files = linkResourceInput[0].files;
        if (files.length > 0) {
          return uploadFile(files[0], function(status, url) {
            if (status === 413) {
              return alert('The file is too large. Please upload a smaller one');
            } else {
              if (url) {
                linkResourceInput.addClass('hidden');
                linkResourceUrl.val(url);
                linkResourceUrl.removeClass('hidden');
                return linkResourceUrl.trigger('change');
              }
            }
          });
        }
      });
      href = $el.attr('href');
      if (!href || /^#/.test(href) && linkInternal.find("option[value='" + href + "']").length) {
        linkInternal.val(href);
        radios.val(['link-internal']);
        linkInternal.addClass('in');
      } else if (/^\/?resources\/.+/.test(href)) {
        linkResourceInput.addClass('hidden');
        linkResourceUrl.removeClass('hidden');
        linkResourceUrl.val(href);
        radios.val(['link-resource']);
        linkResource.addClass('in');
      } else {
        linkExternal.val(href);
        radios.val(['link-external']);
        linkExternal.addClass('in');
      }
      linkSave.toggleClass('disabled', !href);
      massageUrlInput = function($input) {
        var url;
        url = $input.val();
        if (/^[^\/]*#[^\/]+/.test(url)) {

        } else if (/^\/resources\/[^\/]{32}/.test(url)) {

        } else if (/^http/.test(url) || /^htp/.test(url) || /^htt/.test(url)) {

        } else {
          if (!/^https?:\/\//.test(url)) {
            return $input.val("http://" + url);
          }
        }
      };
      dialog.on('change', '[name="link-type"]', function(evt) {
        if (evt.target.value) {
          linkExternal.removeClass('in').val('');
          linkInternal.removeClass('in').val('');
          linkResource.removeClass('in');
          linkSave.addClass('disabled');
          switch (evt.target.value) {
            case 'link-external':
              return linkExternal.addClass('in');
            case 'link-internal':
              return linkInternal.addClass('in');
            case 'link-resource':
              return linkResource.addClass('in');
          }
        }
      });
      linkExternal.on('blur', function(evt) {
        return massageUrlInput(linkExternal);
      });
      linkExternal.bind('keydown', 'return', function(evt) {
        return massageUrlInput(linkExternal);
      });
      dialog.on('submit', (function(_this) {
        return function(evt) {
          evt.preventDefault();
          if (linkContents.val() && linkContents.val().trim()) {
            $el.contents().remove();
            $el.append(linkContents.val());
          }
          href = null;
          dialog.find('.link-input').each(function(i, input) {
            var $input;
            $input = jQuery(input);
            if ($input.val()) {
              return href = $input.val();
            }
          });
          if (href) {
            $el.attr('href', href);
            return dialog.modal('hide');
          }
        };
      })(this));
      dialog.modal('show');
      dialog.on('hidden.bs.modal', function() {
        return dialog.remove();
      });
      return dialog;
    };
    unlink = function($a) {
      var a, newRange, preserveContents;
      a = $a.get(0);
      $a.removeData('aloha-bubble-openTimer', 0);
      $a.removeData('aloha-bubble-closeTimer', 0);
      $a.removeData('aloha-bubble-selected', false);
      $a.popover('destroy');
      newRange = new GENTICS.Utils.RangeObject();
      newRange.startContainer = newRange.endContainer = a.parentNode;
      newRange.startOffset = GENTICS.Utils.Dom.getIndexInParent(a);
      newRange.endOffset = newRange.startOffset + 1;
      newRange.select();
      preserveContents = true;
      GENTICS.Utils.Dom.removeFromDOM(a, newRange, preserveContents);
      Aloha.activeEditable.smartContentChange({
        type: 'block-change'
      });
      newRange.startContainer = newRange.endContainer;
      newRange.startOffset = newRange.endOffset;
      newRange.select();
      return newRange;
    };
    selector = 'a:not(.aloha-ephemera)';
    shortUrl = function(linkurl, l) {
      var chunk_l, end_chunk, start_chunk;
      l = (typeof l !== "undefined" ? l : 50);
      chunk_l = l / 2;
      linkurl = linkurl.replace("http://", "");
      linkurl = linkurl.replace("https://", "");
      if (linkurl.length <= l) {
        return linkurl;
      }
      start_chunk = shortString(linkurl, chunk_l, false);
      end_chunk = shortString(linkurl, chunk_l, true);
      return start_chunk + ".." + end_chunk;
    };
    shortString = function(s, l, reverse) {
      var acceptable_shortness, i, short_s, stop_chars;
      stop_chars = [" ", "/", "&"];
      acceptable_shortness = l * 0.80;
      reverse = (typeof reverse !== "undefined" ? reverse : false);
      s = (reverse ? s.split("").reverse().join("") : s);
      short_s = "";
      i = 0;
      while (i < l - 1) {
        short_s += s[i];
        if (i >= acceptable_shortness && stop_chars.indexOf(s[i]) >= 0) {
          break;
        }
        i++;
      }
      if (reverse) {
        return short_s.split("").reverse().join("");
      }
      return short_s;
    };
    populator = function($el) {
      var $bubble, $edit, $linkTooltip, $remove, details, editable, href;
      editable = Aloha.activeEditable;
      $bubble = jQuery('<div class="link-popover"></div>');
      href = $el.attr('href');
      details = jQuery(DETAILS_HTML);
      $bubble.append(details);
      $edit = details.find('.edit-link');
      $edit.on('click', function() {
        var dialog;
        Aloha.activeEditable = editable;
        return dialog = showModalDialog($el);
      });
      $remove = details.find('.delete-link');
      $remove.on('click', function() {
        Aloha.activeEditable = editable;
        return unlink($el);
      });
      $linkTooltip = details.find('.visit-link');
      $linkTooltip.attr('href', href);
      $linkTooltip.find('i').addClass(getIcon(href));
      if (/^#/.test(href)) {
        $linkTooltip.removeAttr('target');
        $linkTooltip.find('.title').text(getTitle(jQuery(href), href));
      } else {
        $linkTooltip.find('.title').text(shortUrl(href, 30));
      }
      return $bubble.contents();
    };
    getContainerAnchor = function(a) {
      var el;
      el = a;
      while (el) {
        if (el.nodeName.toLowerCase() === "a") {
          return el;
        }
        el = el.parentNode;
      }
      return false;
    };
    UI.adopt('insertLink', null, {
      click: function() {
        var $a, a, dialog, editable, linkText, range;
        editable = Aloha.activeEditable;
        range = Aloha.Selection.getRangeObject();
        if (range.startContainer === range.endContainer) {
          a = getContainerAnchor(range.startContainer);
          if (a) {
            $a = jQuery(a);
            range.startContainer = range.endContainer = a;
            range.startOffset = 0;
            range.endOffset = a.childNodes.length;
            dialog = showModalDialog($a);
          } else {
            GENTICS.Utils.Dom.extendToWord(range);
            range.select();
            $a = jQuery('<a href="" class="aloha-new-link"></a>');
            linkText = range.isCollapsed() ? "" : range.getText();
            $a.append(linkText);
            dialog = showModalDialog($a);
          }
        } else {
          return;
        }
        return dialog.on('hidden.bs.modal', (function(_this) {
          return function() {
            var newLink;
            Aloha.activeEditable = editable;
            if ($a.hasClass('aloha-new-link')) {
              if (!$a.attr('href')) {
                return;
              }
              range = Aloha.Selection.getRangeObject();
              if (range.isCollapsed()) {
                GENTICS.Utils.Dom.insertIntoDOM($a, range, Aloha.activeEditable.obj);
                range.startContainer = range.endContainer = $a.contents()[0];
                range.startOffset = 0;
                range.endOffset = $a.text().length;
              } else {
                GENTICS.Utils.Dom.removeRange(range);
                GENTICS.Utils.Dom.insertIntoDOM($a, range, Aloha.activeEditable.obj);
              }
              newLink = Aloha.activeEditable.obj.find('.aloha-new-link');
              newLink.removeClass('aloha-new-link');
              return editable.smartContentChange({
                type: 'block-change'
              });
            }
          };
        })(this));
      }
    });
    Aloha.bind('aloha-editable-created', function(event, editable) {
      return editable.obj.on('click', 'a', function(e) {
        return e.preventDefault();
      });
    });
    return {
      selector: selector,
      populator: populator,
      markerclass: 'link-popover'
    };
  });

}).call(this);
