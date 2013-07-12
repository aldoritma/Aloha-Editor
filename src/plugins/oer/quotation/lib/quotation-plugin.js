// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!quotation/css/quotation-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TEMPLATE;
    TEMPLATE = "<blockquote class=\"quote\"></blockquote>";
    return Plugin.create('quotation', {
      init: function() {
        var _this = this;
        semanticBlock.activateHandler('.quote', function($element) {
          $element.attr('placeholder', 'Type the text of you quotation here.');
          return $element.aloha();
        });
        semanticBlock.deactivateHandler('.quote', function($element) {
          $element.mahalo();
          return $element.attr('class', 'quote');
        });
        UI.adopt("insert-quotation", Button, {
          click: function(e) {
            e.preventDefault();
            return semanticBlock.insertAtCursor(jQuery(TEMPLATE));
          }
        });
        return UI.adopt("insertQuotation", Button, {
          click: function(e) {
            e.preventDefault();
            return semanticBlock.insertAtCursor(jQuery(TEMPLATE));
          }
        });
      }
    });
  });

}).call(this);
