/**
 * Copyright 2009, 2010 Jonathan A. Smith
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

    var buttons = new base2.Package(this, {
        name:    "buttons",
        version: "0.1",
        imports: "observers,generator,controls",
        exports: "Button"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // **** Button Control

    // Options:
    //   label   -- Button label (overrides HTML element)
    //   active  -- True if button may be pressed
    //   toggles -- If true buttons toggles on and off
    //   pressed -- Initially pressed

    var Button = Control.extend({

        class_name: "Button",

    	constructor: function (options) {
    		this.base(options);

    		this.is_pressed 	= this.option("pressed", false);
     		this.label 			= this.option("label", null);
     		this.toggles 		= this.option("toggles", false);
     		this.is_active 		= this.option("active", true);

     		this.is_down = this.is_pressed;
    	},

    	// Tag to use in primary element

 		element_tag: 'span',

    	// Generate HTML and set up events for this control.

    	generate: function (dom_element) {
    		var label = this.label;

            dom_element.addClass("wa_button")
                       .append(label);

    		var me = this;
            dom_element.bind('mousedown', function () {
                me.toggle();
            });
            dom_element.bind('mouseup', function () {
            	me.action();
            });
    	},

    	// Update the control appearance

    	update: function () {
    		var dom_element = this.dom_element;
       		if (!this.is_active)
				dom_element.addClass('wa_button_grey');
    		else if (this.is_down)
    			dom_element.addClass('wa_button_pressed');
    		else
    			dom_element.removeClass('wa_button_pressed');
    	},

    	// Called when the user clicks on the button. Temporarily
    	// changes button state and appearance.

    	toggle: function () {
    		this.is_down = !this.is_down;
            this.update();
    	},

        // Set the pressed state

        setPressed: function (is_pressed) {
            // If no change, return
            if (is_pressed == this.is_pressed)
                return;

            // Adjust button state, update
            this.is_pressed = is_pressed;
            this.is_down = is_pressed;
            this.update();

            // Broadcast changed state
            this.broadcast("changed", this.is_pressed);
        },

    	// Change state on button release.

    	action: function () {
            // Return if not active
            if (!this.is_active) return;

    		if (this.toggles) {
    			this.is_pressed = !this.is_pressed;
    			this.broadcast("changed", this.is_pressed);
    		}
    		else {
    			this.is_pressed = true;
    			this.broadcast("changed", this.is_pressed);
    			this.is_pressed = false;
    		}
    		this.is_down = this.is_pressed;
    		this.update();
    	}
    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};