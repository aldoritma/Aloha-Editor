// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'jquery', 'aloha/plugin', 'semanticblock/semanticblock-plugin', 'css!figure/css/figure-plugin.css'], function(Aloha, jQuery, Plugin, semanticBlock) {
    var activate, deactivate;
    activate = function(element) {
      $(element).find('div.title').aloha();
      if ($(element).find('figcaption').children().length !== 1) {
        $(element).find('figcaption').wrapInner('<p>');
      }
      return $(element).find('figcaption > p').aloha();
    };
    deactivate = function(element) {
      $(element).find('div.title').mahalo();
      return $(element).find('figcaption > p').mahalo();
    };
    return Plugin.create('oer-figure', {
      getLabel: function() {
        return 'Figure';
      },
      activate: activate,
      deactivate: deactivate,
      selector: 'figure',
      insertPlaceholder: function() {
        return semanticBlock.insertPlaceholder();
      },
      insertOverPlaceholder: function($content, $placeholder) {
        var $figure;
        $figure = $('<figure>').append('<div class="title">').append($content).append('<figcaption>');
        return semanticBlock.insertOverPlaceholder($figure, $placeholder);
      },
      init: function() {
        var plugin;
        plugin = this;
        return semanticBlock.register(plugin);
      }
    });
  });

}).call(this);