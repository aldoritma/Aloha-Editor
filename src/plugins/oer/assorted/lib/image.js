// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'jquery', 'aloha/plugin', 'image/image-plugin', 'ui/ui', 'semanticblock/semanticblock-plugin', 'css!assorted/css/image.css'], function(Aloha, jQuery, AlohaPlugin, Image, UI, semanticBlock) {
    var DIALOG_HTML, DIALOG_HTML2, DIALOG_HTML_CONTAINER, WARNING_IMAGE_PATH, activate, deactivate, insertImage, setEditText, setThankYou, setWidth, showModalDialog, showModalDialog2;
    WARNING_IMAGE_PATH = '/../plugins/oer/image/img/warning.png';
    DIALOG_HTML_CONTAINER = '<form class="plugin image modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false" />';
    DIALOG_HTML = '<div class="modal-header">\n  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n  <h3>Insert image</h3>\n</div>\n<div class="modal-body">\n  <div class="image-options">\n      <div class="image-selection">\n        <div class="dia-alternative">\n          <span class="upload-image-link btn-link">Choose an image to upload</span>\n        </div>\n        <div class="dia-alternative">\n          OR\n        </div>\n        <div class="dia-alternative">\n          <span class="upload-url-link btn-link">get image from the Web</span>\n        </div>\n      </div>\n      <div class="placeholder preview hide">\n        <img class="preview-image"/>\n      </div>\n  </div>\n  <input type="file" class="upload-image-input" />\n  <input type="url" class="upload-url-input" placeholder="Enter URL of image ..."/>\n  <div>\n    <strong>Image title:</strong><input class="image-title" type="text" placeholder="Shows up above image"></textarea>\n  </div>\n  <div>\n    <strong>Image caption:</strong><input class="image-caption" type="text" placeholder="Shows up below image"></textarea>\n  </div>\n  <div class="image-alt">\n    <div class="forminfo">\n      <i class="icon-warning"></i><strong>Describe the image for someone who cannot see it.</strong> This description can be read aloud, making it possible for visually impaired learners to understand the content.\n    </div>\n    <div>\n      <textarea name="alt" type="text" placeholder="Enter description ..."></textarea>\n    </div>\n  </div>\n</div>\n<div class="modal-footer">\n  <button type="submit" disabled="true" class="btn btn-primary action insert">Next</button>\n  <button class="btn action cancel">Cancel</button>\n</div>';
    DIALOG_HTML2 = '<div class="modal-header">\n  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n  <h3>Insert image</h3>\n</div>\n<div class="modal-body">\n  <div>\n    <strong>Source for this image (Required)</strong>\n  </div>\n  <div class="source-selection">\n    <ul style="list-style-type: none; padding: 0; margin-left: 0;">\n      <li>\n      <input type="radio" name=image-source-selection" value="i-own-this" checked="checked">\n        <span>I own it (no citation needed)</span><br/>\n      </li>\n      <li>\n      <input type="radio" name=image-source-selection" value="i-got-permission">\n        <span>I am allowed to reuse it:</span><br/>\n      </li>\n      <li>\n      <input type="radio" name=image-source-selection" value="i-dont-know">\n        <span>I don\'t know (skip citation for now)</span><br/>\n      </li>\n    </ul>\n  </div>\n</div>\n<div class="modal-footer">\n  <button type="submit" class="btn btn-primary action insert">Save</button>\n  <button class="btn action cancel">Cancel</button>\n</div>';
    showModalDialog = function($el) {
      var $caption, $figure, $imageselect, $img, $placeholder, $submit, $title, $uploadImage, $uploadUrl, deferred, dialog, editing, imageAltText, imageSource, loadLocalFile, promise, root, setImageSource, settings,
        _this = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      root = Aloha.activeEditable.obj;
      dialog = jQuery(DIALOG_HTML_CONTAINER);
      dialog.append(jQuery(DIALOG_HTML));
      $imageselect = dialog.find('.image-selection');
      $placeholder = dialog.find('.placeholder.preview');
      $uploadImage = dialog.find('.upload-image-input').hide();
      $uploadUrl = dialog.find('.upload-url-input').hide();
      $submit = dialog.find('.action.insert');
      $img = $el;
      imageSource = $img.attr('src');
      imageAltText = $img.attr('alt');
      $figure = jQuery($img.parents('figure')[0]);
      $title = $figure.find('div.title');
      $caption = $figure.find('figcaption');
      if (imageSource) {
        dialog.find('.action.insert').removeAttr('disabled');
      }
      editing = Boolean(imageSource);
      dialog.find('[name=alt]').val(imageAltText);
      if (editing) {
        dialog.find('.image-options').hide();
        dialog.find('.btn-primary').text('Save');
      }
      (function(img, baseurl) {
        return img.onerror = function() {
          var errimg;
          errimg = baseurl + WARNING_IMAGE_PATH;
          if (img.src !== errimg) {
            return img.src = errimg;
          }
        };
      })(dialog.find('.placeholder.preview img')[0], Aloha.settings.baseUrl);
      setImageSource = function(href) {
        imageSource = href;
        return $submit.removeAttr('disabled');
      };
      loadLocalFile = function(file, $img, callback) {
        var reader;
        reader = new FileReader();
        reader.onloadend = function() {
          if ($img) {
            $img.attr('src', reader.result);
          }
          setImageSource(reader.result);
          if (callback) {
            return callback(reader.result);
          }
        };
        return reader.readAsDataURL(file);
      };
      dialog.find('.upload-image-link').on('click', function() {
        $placeholder.hide();
        $uploadUrl.hide();
        $uploadImage.click();
        return $uploadImage.show();
      });
      dialog.find('.upload-url-link').on('click', function() {
        $placeholder.hide();
        $uploadImage.hide();
        return $uploadUrl.show().focus();
      });
      $uploadImage.on('change', function() {
        var $previewImg, files;
        files = $uploadImage[0].files;
        if (files.length > 0) {
          if (settings.image.preview) {
            $previewImg = $placeholder.find('img');
            loadLocalFile(files[0], $previewImg);
            $placeholder.show();
            return $imageselect.hide();
          } else {
            return loadLocalFile(files[0]);
          }
        }
      });
      $uploadUrl.on('change', function() {
        var $previewImg, url;
        $previewImg = $placeholder.find('img');
        url = $uploadUrl.val();
        setImageSource(url);
        if (settings.image.preview) {
          $previewImg.attr('src', url);
          $placeholder.show();
          return $imageselect.hide();
        }
      });
      deferred = $.Deferred();
      dialog.on('submit', function(evt) {
        var altAdded;
        evt.preventDefault();
        altAdded = (!$el.attr('alt')) && dialog.find('[name=alt]').val();
        $el.attr('src', imageSource);
        $el.attr('alt', dialog.find('[name=alt]').val());
        if (dialog.find('input.image-title').val()) {
          $title.html(dialog.find('input.image-title').val());
        }
        if (dialog.find('input.image-caption').val()) {
          $caption.html(dialog.find('input.image-caption').val());
        }
        if (altAdded) {
          setThankYou($el.parent());
        } else {
          setEditText($el.parent());
        }
        return deferred.resolve({
          target: $el[0],
          files: $uploadImage[0].files
        });
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        if (!editing) {
          $el.parents('.semantic-container').remove();
        }
        deferred.reject({
          target: $el[0]
        });
        return dialog.modal('hide');
      });
      dialog.on('hidden', function(event) {
        if (deferred.state() === 'pending') {
          deferred.reject({
            target: $el[0]
          });
        }
        return dialog.remove();
      });
      promise = jQuery.extend(true, deferred.promise(), {
        show: function(title) {
          if (title) {
            dialog.find('.modal-header h3').text(title);
          }
          return dialog.modal('show');
        }
      });
      return {
        dialog: dialog,
        figure: $figure,
        img: $img,
        promise: promise
      };
    };
    showModalDialog2 = function($figure, $img, $dialog) {
      var deferred,
        _this = this;
      $dialog.children().remove();
      $dialog.append(jQuery(DIALOG_HTML2));
      deferred = $.Deferred();
      $dialog.off('submit').on('submit', function(evt) {
        evt.preventDefault();
        deferred.resolve({
          target: $img[0]
        });
        return $figure.removeClass('aloha-ephemera');
      });
      $dialog.off('click').on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        $img.parents('.semantic-container').remove();
        deferred.reject({
          target: $img[0]
        });
        return $dialog.modal('hide');
      });
      return deferred.promise();
    };
    insertImage = function() {
      var $dialog, $figure, $img, blob, newEl, promise, source_this_image_dialog, template,
        _this = this;
      template = $('<figure class="figure aloha-ephemera"><div class="title" /><img /><figcaption /></figuren>');
      semanticBlock.insertAtCursor(template);
      newEl = template.find('img');
      blob = showModalDialog(newEl);
      promise = blob.promise;
      $figure = blob.figure;
      $img = blob.img;
      $dialog = blob.dialog;
      promise.show();
      source_this_image_dialog = function() {
        var next_promise;
        next_promise = showModalDialog2($figure, $img, $dialog);
        return next_promise;
      };
      promise.then(function(data) {
        var promise2;
        if (data.files.length) {
          newEl.addClass('aloha-image-uploading');
          _this.uploadImage(data.files[0], newEl, function(url) {
            if (url) {
              jQuery(data.target).attr('src', url);
            }
            return newEl.removeClass('aloha-image-uploading');
          });
        }
        promise2 = source_this_image_dialog();
        return promise2.then(function() {
          $dialog.modal('hide');
        });
      });
    };
    $('body').bind('aloha-image-resize', function() {
      return setWidth(Image.imageObj);
    });
    setWidth = function(image) {
      var wrapper;
      wrapper = image.parents('.image-wrapper');
      if (wrapper.length) {
        return wrapper.css('width', image.css('width'));
      }
    };
    setThankYou = function(wrapper) {
      var editDiv;
      editDiv = wrapper.children('.image-edit');
      editDiv.html('<i class="icon-edit"></i> Thank You!').removeClass('passive');
      editDiv.css('background', 'lightgreen');
      return editDiv.animate({
        backgroundColor: 'white',
        opacity: 0
      }, 2000, 'swing', function() {
        return setEditText(wrapper);
      });
    };
    setEditText = function(wrapper) {
      var alt, editDiv;
      alt = wrapper.children('img').attr('alt');
      editDiv = wrapper.children('.image-edit').css('opacity', 1);
      if (alt) {
        return editDiv.html('<i class="icon-edit"></i>').addClass('passive');
      } else {
        editDiv.html('<i class="icon-warning"></i><span class="warning-text">Description missing</span>').removeClass('passive');
        editDiv.off('mouseenter').on('mouseenter', function(e) {
          return editDiv.find('.warning-text').text('Image is missing a description for the visually impaired. Click to provide one.');
        });
        return editDiv.off('mouseleave').on('mouseleave', function(e) {
          return editDiv.find('.warning-text').text('Description missing');
        });
      }
    };
    activate = function(element) {
      var $caption, $img, $title, edit, wrapper;
      wrapper = $('<div class="image-wrapper aloha-ephemera-wrapper">').css('width', element.css('width'));
      edit = $('<div class="image-edit aloha-ephemera">');
      $title = element.find('.title');
      $img = element.find('img');
      $caption = element.find('figcaption');
      element.children().remove();
      $title.appendTo(element);
      $img.appendTo(element).wrap(wrapper);
      $caption.appendTo(element);
      setEditText(element.children('.image-wrapper').prepend(edit));
      return element.find('img').load(function() {
        return setWidth($(this));
      });
    };
    deactivate = function(element) {
      var $caption, $figure, $img, $title;
      $figure = element;
      $title = $figure.find('div.title');
      $img = $figure.find('img');
      $caption = $figure.find('figcaption');
      $figure.children().remove();
      $figure.append($title);
      $figure.append($img);
      $figure.append($caption);
    };
    return AlohaPlugin.create('oer-image', {
      getLabel: function() {
        return 'Image';
      },
      activate: activate,
      deactivate: deactivate,
      selector: '.figure',
      init: function() {
        var plugin;
        plugin = this;
        UI.adopt('insertImage-oer', null, {
          click: function(e) {
            return insertImage.bind(plugin)(e);
          }
        });
        semanticBlock.register(this);
        semanticBlock.registerEvent('click', '.aloha-oer-block .image-edit', function() {
          var img, promise,
            _this = this;
          img = $(this).siblings('img');
          promise = showModalDialog(img);
          promise.show('Edit image');
          $.when(promise).then(function(data) {
            return data.dialog.modal('hide');
          });
        });
      },
      uploadImage: function(file, el, callback) {
        var f, plugin, settings, xhr;
        plugin = this;
        settings = Aloha.require('assorted/assorted-plugin').settings;
        xhr = new XMLHttpRequest();
        if (xhr.upload) {
          if (!settings.image.uploadurl) {
            throw new Error("uploadurl not defined");
          }
          xhr.onload = function() {
            var url;
            if (settings.image.parseresponse) {
              url = parseresponse(xhr);
            } else {
              url = JSON.parse(xhr.response).url;
            }
            return callback(url);
          };
          xhr.open("POST", settings.image.uploadurl, true);
          xhr.setRequestHeader("Cache-Control", "no-cache");
          f = new FormData();
          f.append(settings.image.uploadfield || 'upload', file, file.name);
          return xhr.send(f);
        }
      }
    });
  });

}).call(this);
