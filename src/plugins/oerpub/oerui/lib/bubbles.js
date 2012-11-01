define(['aloha', 'jquery', 'bubble/bubble-plugin', 'image/image-plugin'], function(
    Aloha, $, BubblePlugin, ImagePlugin){

    // Register bubble for images
    bubbleconfig = {
        selector: 'img',
        populator: function(){
            var $el = this;
            var $bubble = $('<div />', {class: 'link-popover'});
            var $button1 = $('<button class="btn"><i class="icon-certificate"></i> Advanced Options</button>');
            var $button2 = $('<button class="btn btn-danger action-delete"><i class="icon-ban-circle icon-white"></i> Remove</button>');

            $bubble.append($button1);
            $bubble.append($button2);

            editable = Aloha.activeEditable; //squirel squirel
            $button1.on('click', function(e){
                Aloha.activeEditable = editable;
                // TODO call something on ImagePlugin for editing image
                e.preventDefault();
            });
            $button2.on('click', function(e){
                $el.remove();
            });
            return $bubble;
        },
        placement: 'bottom',
        toString: function(){ return 'image'; }
    };
    BubblePlugin.register(bubbleconfig)
});

