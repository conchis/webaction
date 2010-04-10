/**
 * Copyright 2009, 2010 Northwestern University, Jonathan A. Smith
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
 
 new function(_) {

    var dialogs = new base2.Package(this, {
        name:    "dialogs",
        version: "0.1",
        imports: "observers,generator,controls,buttons",
        exports: "Dialog,OkCancelDialog"
    });

    // evaluate the imported namespace
    eval(this.imports);
    
    var SHADOW_SIZE = 6;
    
    var Dialog = Control.extend({
    
    	// Constructs a Dialog
    
    	constructor: function (options, defaults) {
    		this.base(defaults, {width: 300, height: 260, css_class:'wa_dialog'});
            this.setOptions(options);
    	},
    	
    	// Generates HTML for this control
    	
    	generate: function (dom_element) {
    		var width = this.option('width');
    		var height = this.option('height');
    		
    		dom_element.append(div({
    			'class':'wa_dialog_shadow',
    			style: {width: width - SHADOW_SIZE, height: height - SHADOW_SIZE, 
    					left: SHADOW_SIZE, top: SHADOW_SIZE}
    		}));
    		dom_element.append(div({
    			'class':'wa_dialog_content',
    			style: {width: width - SHADOW_SIZE, height: height - SHADOW_SIZE}
    		}));
    		
    		this.setContentsElement(jQuery('.wa_dialog_content', dom_element));
    	},
    	
    	// Show the dialog
    	
    	show: function () {
    		this.dom_element.show("fast");
    	},
    	
    	// Hide the dialog
    	
    	hide: function () {
    		this.dom_element.hide();
    	}
    });
    
    // Dialog for asking a Ok / Cancel question.
    
    var OkCancelDialog = Dialog.extend({
    
    	constructor: function (options) {
    		this.base(options, {width: 300, height: 100, css_class:'wa_dialog'});
    	},
    	
    	generate: function (dom_element) {
            this.base(dom_element);
            
    		var width = this.width;
    		var height = this.height;

  		    var okay_button = new Button({position: 'absolute', left: width - 118,
                  top: height - 30, label:"Ok", width: 45});
    		this.add(okay_button);
    		okay_button.addListener("changed", this, "onOkPressed");

  		    var cancel_button = new Button({position: 'absolute', left: width - 63,
                  top: height - 30, label:"Cancel", width: 45});
    		this.add(cancel_button); 
    		cancel_button.addListener("changed", this, "onCancelPressed");

    		var contents_element = this.contents_element;
    		var message_id = this.id + "_message";
    		contents_element.append(div({id: message_id, 'class':'wa_dialog_message'}));
    		this.message_area = jQuery('#' + message_id);
    		dom_element.hide();
    	},
    	
    	ask: function (text, ok_callback, cancel_callback) {
    		this.ok_callback = ok_callback;
    		this.cancel_callback = cancel_callback;
    		this.message_area.html(text);
			this.show();
    	},
    	
    	onOkPressed: function () {
    		this.hide();
    		var ok_callback = this.ok_callback;
       		if (ok_callback) ok_callback();
    	},
    	
    	onCancelPressed: function () {
    		this.hide();
    		var cancel_callback = this.cancel_callback;
       		if (cancel_callback) cancel_callback();
    	}
    });


    // ** Evaluate the exported namespace
    eval(this.exports);
};


