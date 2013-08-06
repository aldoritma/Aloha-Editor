define ['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'copy/copy-plugin', 'css!semanticblock/css/semanticblock-plugin.css'], (Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button, Copy) ->

  # hack to accomodate multiple executions
  return pluginManager.plugins.semanticblock  if pluginManager.plugins.semanticblock

  DIALOG_HTML = '''
    <div class="semantic-settings modal hide" id="linkModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="false">
      <div class="modal-header">
        <h3></h3>
      </div>
      <div class="modal-body">
        <div style="margin: 20px 10px 20px 10px; padding: 10px; border: 1px solid grey;">
            <strong>Custom class</strong>
            <p>
                Give this element a custom "class". Nothing obvious will change in your document.
                This is for advanced book styling and requires support from the publishing system.
            </p> 
            <input type="text" placeholder="custom element class" name="custom_class">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary action submit">Save changes</button>
        <button class="btn action cancel">Cancel</button>
      </div>
    </div>'''

  blockTemplate = jQuery('<div class="semantic-container aloha-ephemera-wrapper"></div>')
  blockControls = jQuery('<div class="semantic-controls aloha-ephemera"><button class="semantic-delete" title="Remove this element."><i class="icon-remove"></i></button><button class="semantic-settings" title="advanced options."><i class="icon-cog"></i></button></div>')
  blockControls = jQuery('''
    <div class="semantic-controls aloha-ephemera">
      <button class="semantic-delete" title="Remove this element."><i class="icon-remove"></i></button>
      <button class="semantic-settings" title="advanced options."><i class="icon-cog"></i></button>
      <button class="copy" title="copy"><i class="icon-file"></i></button>
    </div>''')
  blockDragHelper = jQuery('<div class="semantic-drag-helper aloha-ephemera"><div class="title"></div><div class="body">Drag me to the desired location in the document</div></div>')
  registeredTypes = []
  copyBuffer = null
  pluginEvents = [
    name: 'mouseenter'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container').addClass 'drag-active'
  ,
    name: 'mouseleave'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container')
        .removeClass 'drag-active'  unless jQuery(this).parents('.semantic-container').is('.aloha-oer-dragging')
  ,
    name: 'mouseenter'
    selector: '.semantic-delete'
    callback: ->
      jQuery(this).parents('.semantic-container').addClass 'delete-hover'
  ,
    name: 'mouseleave'
    selector: '.semantic-delete'
    callback: ->
      jQuery(this).parents('.semantic-container').removeClass 'delete-hover'
  ,
    name: 'mousedown'
    selector: '.aloha-block-draghandle'
    callback: (e) ->
      e.preventDefault()
      jQuery(this).parents('.semantic-container').addClass 'aloha-oer-dragging', true
  ,
    name: 'mouseup'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container').removeClass 'aloha-oer-dragging'
  ,
    name: 'click'
    selector: '.semantic-container .semantic-delete'
    callback: () ->
      jQuery(this).parents('.semantic-container').first().slideUp 'slow', ->
        jQuery(this).remove()
  ,
    name: 'click'
    selector: '.semantic-container .semantic-controls .copy'
    callback: (e) ->
      # grab the content of the block that was just clicked
      $element = jQuery(this).parents('.semantic-container').first()
      Copy.buffer $element.outerHtml()
  ,
    name: 'click'
    selector: '.semantic-container .semantic-settings'
    callback: (e) ->

      if jQuery('.semantic-settings.modal:visible').length
        return

      dialog = jQuery(DIALOG_HTML)
      dialog.modal 'show'

      # put the dialog in the middle of the window
      dialog.css({'margin-top':(jQuery(window).height()-dialog.height())/2,'top':'0'})

      $element = jQuery(this).parents('.semantic-controls').siblings('.aloha-oer-block')
      elementName = getLabel($element)
      dialog.find('h3').text('Edit options for this ' + elementName)
      dialog.find('[name=custom_class]').val $element.attr('data-class')
      dialog.data 'element', $element
  ,
    name: 'click'
    selector: '.modal.semantic-settings .action.cancel'
    callback: (e) ->
      $dialog = jQuery(this).parents('.modal')
      $dialog.modal 'hide'
  ,
    name: 'click'
    selector: '.modal.semantic-settings .action.submit'
    callback: (e) ->
      $dialog = jQuery(this).parents('.modal')
      $dialog.modal 'hide'
      $element = $dialog.data('element')
      $element.attr 'data-class', $dialog.find('[name=custom_class]').val()
      $element.removeAttr('data-class') if $element.attr('data-class') is ''
  ,
    name: 'mouseover'
    selector: '.semantic-container'
    callback: ->
      jQuery(this).parents('.semantic-container').removeClass('focused')
      jQuery(this).addClass('focused') unless jQuery(this).find('.focused').length
      jQuery(this).find('.aloha-block-handle').attr('title', 'Drag this element to another location.')
  ,
    name: 'mouseout'
    selector: '.semantic-container'
    callback: ->
      jQuery(this).removeClass('focused')
  ,
    # Toggle a class on elements so if they are empty and have placeholder text
    # the text shows up.
    # See the CSS file more info.
    name: 'blur'
    selector: '[placeholder],[hover-placeholder]'
    callback: ->
      $el = jQuery @
      # If the element does not contain any text (just empty paragraphs)
      # Clear the contents so `:empty` is true
      $el.empty() if not $el.text().trim() and not $el.find('.aloha-oer-block').length
  ]
  insertElement = (element) ->
  
  getLabel = ($element) ->
    for type in registeredTypes
      if $element.is(type.selector)
        return type.getLabel $element

  activate = ($element) ->
    unless $element.is('.semantic-container')
      $element.addClass 'aloha-oer-block'
      $element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock()
      
      for type in registeredTypes
        if $element.is(type.selector)
          type.activate $element
          matched = true
          break 

      return if matched
      # if we make it this far none of the activators have run
      # just make it editable

      # this might could be more efficient
      $element.find('*').andSelf().filter('[placeholder],[hover-placeholder]').each ->
        jQuery(@).empty() if not jQuery(@).text().trim()

      # if there is a title, give it a placeholder and make it editable
      $title = $element.children('.title').first()
      $title.attr('hover-placeholder', 'Add a title')
      $title.aloha()

      $contents = $element.children().not($title)
      $contents.wrap(jQuery('<div class="body"></body>'))
      $element.children('.body').aloha()

  deactivate = ($element) ->
    $element.removeClass 'aloha-oer-block ui-draggable'
    $element.removeAttr 'style'

    for type in registeredTypes
      if $element.is(type.selector)
        type.deactivate $element
        return

    # if we make it this far none of the deactivators have run
    $title = $element.children('.title').first()
      .mahalo()
      .removeClass('aloha-editable aloha-block-blocklevel-sortable ui-sortable')
      .removeAttr('hover-placeholder')
    $element.find('.body').children().unwrap()
    $element.attr('data-unknown', 'true')

  bindEvents = (element) ->
    return  if element.data('oerBlocksInitialized')
    element.data 'oerBlocksInitialized', true
    event = undefined
    i = undefined
    i = 0
    while i < pluginEvents.length
      event = pluginEvents[i]
      element.on event.name, event.selector, event.callback
      i++

  cleanIds = (content) ->
    elements = content.find('[id]')
    ids = {}

    for i in [0..elements.length]
      element = jQuery(elements[i])
      id = element.attr('id')
      if ids[id]
        element.attr('id', '')
      else
        ids[id] = element

  Aloha.ready ->
    bindEvents jQuery(document)

  Plugin.create 'semanticblock',

    defaults: {
      defaultSelector: 'div:not(.title,.aloha-oer-block,.aloha-editable,.aloha-block,.aloha-ephemera-wrapper,.aloha-ephemera)'
    }
    makeClean: (content) ->

      content.find('.semantic-container').each ->
        if jQuery(this).children().not('.semantic-controls').length == 0
          jQuery(this).remove()

      content.find(".aloha-oer-block").each ->
        deactivate jQuery(this)

      cleanIds(content)

    init: ->
      Aloha.bind 'aloha-editable-created', (e, params) =>
        $root = params.obj

        classes = []
        classes.push type.selector for type in registeredTypes
        selector = @settings.defaultSelector + ',' + classes.join()

        $root.find(selector).each (i, element) ->
          activate jQuery(element) if not jQuery(element).parents('.semantic-drag-source').length

        if $root.is('.aloha-block-blocklevel-sortable') and not $root.parents('.aloha-editable').length

          # setting up these drag sources may break if there is more than one top level editable on the page
          jQuery('.semantic-drag-source').children().each ->
            element = jQuery(this)
            elementLabel = element.attr('class').split(' ')[0]
            element.draggable
              connectToSortable: $root
              revert: 'invalid'
              helper: ->
                helper = jQuery(blockDragHelper).clone()
                helper.find('.title').text elementLabel
                helper

              start: (e, ui) ->
                $root.addClass 'aloha-block-dropzone'
                jQuery(ui.helper).addClass 'dragging'

              refreshPositions: true

          $root.sortable 'option', 'stop', (e, ui) ->
            $el = jQuery(ui.item)
            activate $el if $el.is(selector)
          $root.sortable 'option', 'placeholder', 'aloha-oer-block-placeholder aloha-ephemera'

    insertAtCursor: (template) ->
      $element = jQuery(template)
      range = Aloha.Selection.getRangeObject()
      $element.addClass 'semantic-temp'
      GENTICS.Utils.Dom.insertIntoDOM $element, range, Aloha.activeEditable.obj
      $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      activate $element

    appendElement: ($element, target) ->
      $element.addClass 'semantic-temp'
      target.append $element
      $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      activate $element

    register: (plugin) ->
      registeredTypes.push(plugin)
      @settings.defaultSelector += ':not('+plugin.ignore+')' if plugin.ignore

    registerEvent: (name, selector, callback) ->
      pluginEvents.push
        name: name
        selector: selector
        callback: callback
