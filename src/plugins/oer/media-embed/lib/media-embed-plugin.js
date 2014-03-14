// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'figure/figure-plugin', 'semanticblock/semanticblock-plugin', 'css!media-embed/css/media-embed-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, Figure, semanticBlock) {
    var CONFIRM_DIALOG, DIALOG, TEMPLATE, embed, endpoints,
      _this = this;
    DIALOG = '<div id="mediaEmbedDialog" class="modal hide fade" tabindex="-1" role="dialog" data-backdrop="false">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n    <h3>Add video, slides or other media</h3>\n  </div>\n  <div class="modal-body">\n    <form>\n      <label style="display: inline-block">\n        URL: \n        <input type="text" name="videoUrl" size="90">\n      </label>\n      <button class="btn">Go</button>\n\n      <div class="text-error hide">\n        We could not determine how to include the media. Please check the URL for the media and try again or cancel.\n      </div>\n    </form>\n  </div>\n  <div class="modal-footer">\n    <button class="btn" data-dismiss="modal">Cancel</button>\n  </div>\n</div>';
    CONFIRM_DIALOG = '<div id="mediaConfirmEmbedDialog" class="modal hide fade" tabindex="-1" role="dialog" data-backdrop="false">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n    <h3>Add video, slides or other media</h3>\n  </div>\n  <div class="modal-body">\n    <div class="embed-preview"></div>\n  </div>\n  <div class="modal-footer">\n    <button class="btn cancel">Back</button>\n    <button class="btn primary embed">Insert Now</button>\n  </div>\n</div>';
    TEMPLATE = '<figure>\n  <div data-type="title"></div>\n  <div data-type="alternates"> \n  </div>\n  <meta itemprop="url" content=""/>\n  <span itemscope="itemscope" itemtype="http://schema.org/Person" itemprop="author">\n      <meta itemprop="name" content="Mr. Bees" />\n      <meta itemprop="url" content="http://www.flickr.com/photos/bees/" />\n  </span>\n  <meta itemprop="accessibilityFeature" content="captions" />\n  <figcaption>\n    <a itemprop="url" href="">Source</a>: by \n    <a itemprop="author" href=""></a>\n  </figcaption>\n</figure>';
    endpoints = {
      "default": 'http://noembed.com/embed'
    };
    return embed = Plugin.create('mediaEmbed', {
      placeholder: void 0,
      ignore: '[data-type="title"],[data-type="alternates"],.noembed-embed,.noembed-embed *',
      create: function(thing) {
        var $caption, $figure, $thing;
        $thing = $(TEMPLATE);
        $thing.find('[data-type="title"]').text(thing.title);
        $thing.find('[itemprop="url"]').attr('content', thing.url);
        $thing.find('[itemprop="author"] [itemprop="name"]').attr('content', thing.author);
        $thing.find('[itemprop="author"] [itemprop="url"]').attr('content', thing.authorUrl);
        $thing.find('a[itemprop="author"]').attr('href', thing.authorUrl);
        $thing.find('a[itemprop="author"]').text(thing.author);
        $thing.find('figcaption').append(thing.caption);
        $thing.find('[data-type="alternates"]').html(thing.html);
        $caption = $thing.find('figcaption').remove();
        $figure = Figure.insertOverPlaceholder($thing.contents(), this.placeholder);
        return $figure.find('figcaption').find('.aloha-editable').html($caption.contents());
      },
      confirm: function(thing) {
        var $dialog;
        $dialog = $('#mediaConfirmEmbedDialog');
        if (!$dialog.length) {
          $dialog = $(CONFIRM_DIALOG);
        }
        $dialog.find('.embed-preview').empty().append(thing.html);
        if ($dialog.find('iframe').attr('height') > 350) {
          $dialog.find('iframe').attr('height', 350);
        }
        if ($dialog.find('iframe').attr('width') > 500) {
          $dialog.find('iframe').attr('width', 500);
        }
        $dialog.find('input,textarea').val('');
        if (thing.title) {
          $dialog.find('input[name="figureTitle"]').val(thing.title);
        }
        $dialog.find('.cancel').off('click').click(function(e) {
          e.preventDefault(true);
          $dialog.modal('hide');
          return embed.showDialog();
        });
        $dialog.find('.embed').off('.embed').click(function(e) {
          e.preventDefault(true);
          $dialog.modal('hide');
          return embed.create({
            url: thing.url,
            html: thing.html,
            author: thing.author,
            authorUrl: thing.authorUrl
          });
        });
        return $dialog.modal({
          show: true
        });
      },
      embedByUrl: function(url) {
        var bits, domain, endpoint, promise;
        bits = url.match(/(?:https?:\/\/)?(?:www\.)?([^\.]*)/);
        promise = new $.Deferred();
        if (bits.length === 2) {
          domain = bits[1];
          endpoint = endpoints[domain] || endpoints['default'];
          $.ajax({
            url: endpoint,
            data: {
              format: 'json',
              url: url
            },
            dataType: 'json'
          }).done(function(data) {
            if (data.error) {
              return promise.reject();
            } else {
              promise.resolve();
              return embed.confirm({
                url: data.url || url,
                html: data.html,
                title: data.title,
                author: data.author_name,
                authorUrl: data.author_url
              });
            }
          }).fail(function() {
            return promise.reject();
          });
        }
        return promise;
      },
      showDialog: function() {
        var $dialog,
          _this = this;
        $dialog = $('#mediaEmbedDialog');
        if (!$dialog.length) {
          $dialog = $(DIALOG);
        }
        $dialog.find('.text-error').hide();
        $dialog.find('input').val('');
        $dialog.find('form').off('submit').submit(function(e) {
          e.preventDefault(true);
          return _this.embedByUrl($dialog.find('input[name="videoUrl"]').val()).done(function() {
            return $dialog.modal('hide');
          }).fail(function() {
            return $dialog.find('.text-error').show();
          });
        });
        return $dialog.modal('show');
      },
      init: function() {
        var _this = this;
        UI.adopt("insert-mediaEmbed", Button, {
          click: function() {
            return _this.showDialog();
          }
        });
        UI.adopt("insertMediaEmbed", Button, {
          click: function() {
            _this.placeholder = Figure.insertPlaceholder();
            return _this.showDialog();
          }
        });
        return semanticBlock.register(this);
      }
    });
  });

}).call(this);