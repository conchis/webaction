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

    var tag_selector = new base2.Package(this, {
        name:    "text_selector",
        version: "0.1",
        imports: "observers,generator,controls,buttons,label",
        exports: "TextSelector"
    });

    // evaluate the imported namespace
    eval(this.imports); 
    
    var CLEAR_BUTTON_WIDTH = 14;
    
    // A simple input field for constructing a filter function to select only
    // objects with values that match the input text. This control broadcasts
    // each time its value is changed, so may be used to interactivly search
    // a list of values.   
    
    var TextSelector = Control.extend({ 
    
        // Constructs a TextSelector
    
        constructor: function (options) {
            this.base(options);
            this.width = this.option("width", 180);
            this.fields = this.option("fields", ["title"]);
            this.has_focus = false;
        },
        
        // Generates an input field for the selector
        
        generate: function (dom_element) {  
            dom_element.addClass('wa_text_sel');
        
            var control_name = this.id + "_input";               
            dom_element.append(input({
                type: 'text', 
                'class':'wa_text_sel_input', 
                name: control_name,
                style: {width: this.width - CLEAR_BUTTON_WIDTH - 16}
            }));
            
            this.control = jQuery("> input", dom_element);
            var self = this;
            this.control.keyup(function (event) {
                self.onChanged();    
            }); 
            this.control.focus(function () {
                self.onFocus();
            });
            this.control.blur(function () {
                self.onBlur();
            });
            
            var clear_button = new Button({label: "x", width: CLEAR_BUTTON_WIDTH});
            this.clear_button = clear_button;
            clear_button.makeControl(dom_element);
            clear_button.setActive(false);
            clear_button.addListener("changed", function () { self.clear(); });
            
            var search_label = new Label("Search");
            this.search_label = search_label;
            search_label.makeControl(dom_element);
            var self = this;
            jQuery("#"+search_label.id).live('click', function(){
              self.control.focus();
            });
            this.clear();
        },
        
        // Clears the value of the text field
        
        clear: function () {
            this.control.val("");
            this.onChanged();
        },
        
        // Sets the value of the control
        
        setValue: function (text) {
            if (text != this.text) {
                this.text = text;
                this.pattern = new RegExp(text, "i");
                this.broadcast("changed", this.pattern);
            }
        },
        
        // On a change in the field value, compiles a regular expression
        // pattern and broadcasts to listeners.
        
        onChanged: function () {
            var text = this.control.val();
            if (text.length == 0 && !this.has_focus)
                this.search_label.show();   
            this.clear_button.setActive(text.length > 0);
            this.setValue(text);
        },
        
        // Called when the control receives focus
        
        onFocus: function () {
            this.has_focus = true;
            this.search_label.hide();    
        },
        
        // Called when the control looses focus
        
        onBlur: function () {
            this.has_focus = false;
            if (this.text.length == 0)
                this.search_label.show();      
        },
        
        // Returns a filter function to select items in a ListModel
        // using this selector's pattern from specified fields.
        
        getFilter: function () {
            var self = this;
            return function(item, index) {
                var fields = self.fields;
                var pattern = self.pattern;
                for (var index = 0; index < fields.length; index += 1) {
                    var field_name = fields[index];
                    var text = item[field_name].toString();
                    if (text.match(pattern) != null)
                        return true;
                }
                return false; 
            }
        },
        
        // Returns an object that includes selector state information
        // so that it's state can be restored later.'

        getState: function () {
            return {text: this.text};
        },

        // Restores saved state information

        restoreState: function (state_object) {
            this.control.val(state_object.text); 
            this.onChanged();   
        }
    
    });  
    
    // ** Evaluate the exported namespace
    eval(this.exports);
};
