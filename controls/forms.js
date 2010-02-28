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

    var forms = new base2.Package(this, {
        name:    "forms",
        version: "0.2",
        imports: "controls,generator",
        exports: "Form,LabelItem,TextItem,PasswordItem,TagsItem,CheckboxItem,PulldownItem,"
            + "FileItem,RadioItem,DateItem,SaveButton"
    });

    // **** evaluate the imported namespace
    eval(this.imports);

    var FormItem = Control.extend({

        // Name of class for ID generation
        class_name: "FormItem",

        // Tag of element used in main element of the control
        element_tag: 'tr',

        // Constructs a FormItem

        constructor: function (name, options) {
            this.base(options);
            this.name = name;
            this.is_valid = true;

            this.setValue(this.option('value'));
        },

        // ** Navigation

        // Returns the form that contains this item.

        getForm: function () {
            var examine = this;
            while (examine != null && !(examine instanceof Form))
                examine = examine.parent;
            return examine;
        },

        // Returns an item by name

        getItem: function (name) {
            var form = this.getForm();
            if (form == null) return null;
            return form.getItem(name);
        },

        // When this item is added to a parent, if the new item has a form
        // register this and all children with the form.

        addedTo: function (parent) {
            this.base(parent);
            var form = this.getForm();
            if (form != null) {
                form.registerItem(this);
                this.each(function (child) { form.registerItem(child); });
            }
        },

        // ** Values and Updates

        // Sets this item's value

        setValue: function (new_value) {
            // Return if no change.
            if (new_value == this.value) return;

            // Set value and update item's HTML
            this.value = new_value;
            this.update();
        },

        // Updates the HTML to reflect a new value

        update: function () { },

        // ** Messages

        // Displays a message in the form's message area

        say: function () {
            var parts = [];
            for (var index = 0; index < arguments.length; index += 1)
                parts.push(arguments[index]);
            var message_div = jQuery("div.wa_form_message", this.control_cell);
            message_div.html(parts.join(""));
        },

        // ** Validation

        // Validates a single field

        check: function () {
            this.say("");
            this.is_valid = this.validate();
            return this.is_valid;
        },

        // Request to validate this item. Return false if in error. Also
        // use the 'say' method to report the error.

        validate: function () {
            return this.validateRequired();
        },

        // Validate that the field has a value if not marked as options.

        validateRequired: function () {
            var is_optional = this.option("optional", false);
            if (!is_optional) {
                var value = jQuery.trim(this.value);
                if (value == "") {
                    this.say('*' + this.getLabel() + ' is required');
                    return false;
                }
            }
            return true;
        },


        // ** HTML Generation

        // Returns an item name that should be used as control 'name' in html
        // generation. This can be for a specific item id, or, if omitted, from
        // this item's id. formId is used to help generate forms for Rails or
        // similar frameworks.

        itemName: function (name) {
            if (typeof name == "undefined")
                name = this.name;
            var form = this.getForm();
            var object = form.object;
            if (object == null)
                return name;
            else
                return object + '[' + name + ']';
        },

        // Returns a human-readable label -- ether specified as an option, or
        // the control's name capitalized.

        getLabel: function () {
            var label = this.option("label");
            if (label == null) {
                label = this.name;
                label = label.charAt(0).toUpperCase() + label.substr(1);
            }
            return label;
        },

        // Generates HTML for the FormItem (always as a table row)

        generate: function (dom_element) {
            var label_text = this.getLabel();
            if (label_text != "")
                dom_element.append(td({'class':'wa_form_label'}, this.getLabel() + ":"));
            else
                dom_element.append(td());
            dom_element.append(td({}, ""));
            var control_cell = jQuery("td:eq(1)", dom_element);
            this.control_cell = control_cell;
            this.generateControl(control_cell);
            control_cell.append(div({'class':'wa_form_message'}));
        },

        // Generates the HTML for a control. Override in subclasses.

        generateControl: function (control_cell) {
            throw new Error("Implement in subclasses.");
        }

    });

    var LabelItem  = FormItem.extend({

        // Name of class for ID generation
        class_name: "LabelItem",

        // Constructs a LabelItem

        constructor: function (name, options) {
            this.base(name, options);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            control_cell.append(
                    span({'class':'wa_text'}, this.value));
        }
    });

    var TextItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "TextItem",

        // Constructs a TextItem

        constructor: function (name, options) {
            this.base(name, options);
            this.lines = this.option('lines', 1);
            this.length = this.option('length');

            // Regular expression that must always match input
            this.allow = this.option('allow');

            // Regular expression that must match value
            // when validated.
            this.match = this.option('match');
            this.value = '';
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            if (this.lines > 1)
                this.generateTextArea(control_cell);
            else
                this.generateTextItem(control_cell);
        },

        // Generate a text item control

        generateTextItem: function (control_cell) {
            var item_name = this.itemName();

            var attributes = {type: 'text', name: item_name};
            if (this.length == null) {
                attributes['class'] = 'wa_text_item';
            }
            else {
                attributes['maxlength'] = this.length;
                attributes['size'] = this.length;
                attributes['class'] = 'wa_form_text_var';
            }

            control_cell.append(input(attributes));
            this.attach(jQuery("> input", control_cell));

        },

        // Generate a text area (multiline) control

        generateTextArea: function (control_cell) {
            var item_name = this.itemName();
            control_cell.append(textarea({
                name: item_name, "class":'wa_text_area', rows: this.lines
            }));
            this.control = jQuery("> textarea", control_cell);
            this.attach(this.control);
        },

        // Event handling for control

        attach: function (control) {
            this.control = control;
            var self = this;
            control.blur(function (event) {
                self.setValue(control.val());
                self.check();
            });
            if (this.allow != null) {
                control.keyup(function (event) {
                    self.onChange(control, event);
                });
            }
        },

        onChange: function (control, event) {
            var value = control.val();
            if (value.match(this.allow))
                this.value = value;
            else
                control.val(this.value);
        },

        validate: function () {
            if (!this.base())
                return false;
            if (this.match != null && !this.value.match(this.match)) {
                this.say("Invalid input");
                return false;
            }
            return true;
        },

        // Update HTML when value changes

        update: function () {
            if (typeof(this.control) != "undefined")
                this.control.val(this.value);
        }

    });

    var CheckboxItem  = FormItem.extend({

        // Name of class for ID generation
        class_name: "CheckboxItem",

        // Constructs a CheckboxItem

        constructor: function (name, options) {
            options.optional = true;
            this.base(name, options);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            var comment = this.option("comment", "");
            control_cell.append(input({type: 'checkbox', name: item_name,
                "class": 'wa_checkbox_item'}) + comment);
            this.checkbox = jQuery('input', control_cell);

            var self = this;
            this.checkbox.change(
                function (event) { self.onChange(event); });
        },

        // Update the attached DOM element to reflect the item's value

        update: function () {
            if (this.checkbox != null)
                this.checkbox.attr("checked", this.value);
        },

        // On change, set value

        onChange: function (event) {
            var value = jQuery(event.target).attr("checked");
            this.setValue(value);
        }

    });

    var RadioItem  = FormItem.extend({

        // Name of class for ID generation
        class_name: "RadioItem",

        // Constructs a RadioItem

        constructor: function (name, options) {
            this.base(name, options);
            this.choices = this.option("choices", []);
            this.values = this.option("values", this.choices);
        },

        // Generates HTML for the control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            var choices = this.choices;
            var controls = [];
            for (var index in choices)
                controls.push(input({name: item_name, type: "radio", value: index}
                        , choices[index]));
            control_cell.append(controls.join(""));

            var self = this;
            this.control = jQuery("input[name='" + item_name + "']");
            this.control.change(function (event) { self.onChange(event); });
        },

        // Update the attached DOM element to reflect the item's value

        update: function () {
            if (this.control == null || (typeof this.value) == "undefined")
                return;
            var values = this.values;
            var value = this.value;
            var index = 0;
            this.control.each(function () {
                this.checked = (values[index] == value);
                index += 1;
            });
        },

        onChange: function (event) {
            var index = jQuery(event.target).val();
            var value = this.values[index];
            this.setValue(value);
        }

    });

    var FileItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "FileItem",

        // Constructs a FileItem

        constructor: function (name, options) {
            this.base(name, options);
            var extensions = this.option("extensions", []);
            this.setExtensions(extensions);
        },

        // Generates HTML for the control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            control_cell.append(input({type: 'file', name: item_name,
                "class": 'wa_file_item'}));
            var control = jQuery('input', control_cell);
            this.control = control;
            var self = this;
            control.blur(function (event) {
                self.onBlur();
            });
            control.change(function (event) {
                 self.onChange(event);
            });
        },

        // Sets the array of allowed extensions

        setExtensions: function (extensions) {
            // Convert to array if needed
            if (typeof extensions == "string")
                extensions = [extensions];

            // Append '.' to each.
            for (var index = 0; index < extensions.length; index += 1) {
                var extension = extensions[index];
                if (extension[0] != '.') {
                    extensions[index] = '.' + extension;
                }
            }
            this.extensions = extensions;
        },

        // Update the attached DOM element to reflect the item's value

        update: function () {
            if (this.dom_element != null) {
                var value = this.value;
                if (typeof(value) == "undefined" || value == null)
                    value = '';
                this.dom_element.val(value);
            }
        },

        // Check the for a valid file name

        validate: function () {
            this.base();
            if (this.extensions.length == 0)
                return false;
            var name = this.control.val();
            if (!this.matchesExtension(name, this.extensions)) {
                this.say("*Must end with: "
                    + formatList(this.extensions, "or"));
                return false;
            }
            return true;
        },

        // Returns true if the file name matches one extension in
        // extensions.

        matchesExtension: function (name, extensions) {
            for (var index = 0; index < extensions.length; index += 1) {
                var extension = extensions[index];
                var part  = name.substring(name.length - extension.length);
                if (part == extension)
                    return true;
            }
            return false;
        },

        // Validate the file name on blur

        onBlur: function () {
            this.setValue(this.control.val());
            this.validate();
        },

        // When the selected file changes, set the value

        onChange: function (event) {
            var value = this.control.val();
            this.setValue(value);
            this.check();
        }
    });

    var PulldownItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "PulldownItem",

        // Constructs a PulldownItem

        constructor: function (name, options) {
            this.base(name, options);
            this.choices = this.option("choices", []);
            this.values = this.option("values", this.choices);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var controls = [];
            var choices = this.choices;
            var item_name = this.itemName();
            for (var index = 0; index < choices.length; index += 1)
                controls.push(option({value: index}, choices[index]));
            control_cell.append(
                select({"class":"wa_select_item"}, controls) +
                input({name: item_name, type: "hidden"}));

            this.attach(control_cell);
        },

        // Attach a generated DOM element to this FormItem.

        attach: function (control_cell) {
            var self = this;

            this.selector = jQuery("select", control_cell);
            this.selector.change(function (event) {
                self.onChange(event);
            });

            this.value_field = jQuery('input', control_cell);
        },

        // Update the attached DOM element to reflect the item's value

        update: function () {
            var values = this.values;
            for (var index = 0; index < values.length; index += 1) {
                if (this.value == values[index])
                    this.selector.val(index);
            }
        },

        onChange: function (event) {
            var index = jQuery("option:selected", event.target).val();
            var value = this.values[index];
            this.setValue(value);
            this.setHiddenField(value);
        },

        // Sets the hidden field with the tag value

        setHiddenField: function (value) {
            var hidden_field = jQuery("input[type=hidden]", this.dom_element);
            hidden_field.val(value);
        }
    });

    var TagsItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "TagsItem",

        // Constructs a TagsItem

        constructor: function (name, options) {
            this.base(name, options);
            this.tag_value = this.value;
            if (this.tag_value == null)
                this.tag_value = "";
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            control_cell.append(
              div({"class":"wa_tag_selector"}, "-- no tags --"),
              div({style:"position:relative;"},
                input({type: 'text', "class": 'wa_tag_field'}),
                input({type: 'hidden', name: item_name}),
                div({"class":"wa_tag_button"},
                              a({href:"#", "class":"wa_tag_link"}, "Add Tag"))
              )
            );
            this.attach(control_cell);
        },

         // Attach a generated DOM element to this FormItem.

        attach: function (control_cell) {
            var self = this;
            this.selector = jQuery(".wa_tag_selector", control_cell);

            this.tag_field = jQuery("input:eq(0)", control_cell);
            this.tag_field.keyup(function (event) {
                self.onChange(event);
            });
            this.tag_field.blur(function (event) {
                self.onAction();
                return false;
            });

            this.tag_button = jQuery(".wa_tag_link", control_cell);
            this.tag_button.click(function (event) {
                self.onAction();
                return false;
            });
        },

        onChange: function (event) {
            var tag_field = this.tag_field;
            var tag_value = tag_field.val();

            if (tag_value.match(/^[ a-zA-Z0-9,]*$/)) {
                var tokens = tag_value.split(",");
                var count = tokens.length;
                
                for (var index = 0; index < (count - 1); index += 1) 
                    this.addTag(tokens[index]);
                
                if (count > 1) {
                    tag_value = reduceBlanks(tokens[tokens.length - 1]);
                    tag_field.val(tag_value);
                }
                
                this.tag_value = tag_value;
            }
            else
                tag_field.val(this.tag_value);

            this.updateSelection();
        },

        onAction: function () {
            var field_text = jQuery.trim(this.tag_field.val());
            if (field_text == "") return;

            var tags = this.value.slice(0);
            var index = this.findTag(field_text);
            if (index >= 0) {
                tags.splice(index, 1);
                this.setValue(tags);
                this.tag_field.val("");
                this.updateSelection();
                this.update();
            }
            else {
                tags.push(field_text);
                this.setValue(tags);
                this.tag_field.val("");
                this.updateSelection();
                this.update();
            }
        },
        
        addTag: function(tag_value) {  
            // Ignores invalid tags
            if (!tag_value.match(/^[ a-zA-Z0-9]*$/))
                return;
              
            // Removes extra blanks
            var tag_value = reduceBlanks(tag_value);
            
            // Adds only if no other tag with that name
            var index = this.findTag(tag_value);
            if (index == -1) {
                var tags = this.value.slice(0);
                tags.push(tag_value);
                this.setValue(tags);
                this.update();
            }    
        },

        // Sets this item's value. Tags are always stored as arrays
        // strings. If a single string is passed in it is converted
        // from a comma separated list of values to an array.

        setValue: function (value) {
            if (value == null)
                value = [];
            if (typeof value == "string")
                value = value.split(",");
            for (var index = 0; index < value.length; index += 1) {
                var tag = reduceBlanks(value[index]);
                if (tag != "")
                    value[index] = tag;
            }
            this.base(value);
            this.setHiddenField(value);
        },

        // Sets the hidden field with the tag value

        setHiddenField: function (tags) {
            var hidden_field = jQuery("input[type='hidden']", this.dom_element);
            hidden_field.val(tags.join(","));
        },

       // Update the attached DOM element to reflect the item's value

        update: function () {
            if (this.dom_element == null) return;

            var tags = this.value;
            if (tags == null)
                tags = [];
            var links = new Array();
            if (tags.length == 0)
                links.push("-- no tags --");
            for (var index = 0; index < tags.length; index += 1)
                links.push(a({href:"#"}, tags[index]));
            this.selector.html(links.join(", "));

            var me = this;
            jQuery("a", this.selector).each(function (index, element) {
                me.setupTagLink(tags[index], element);
            });
        },

        // Create a link for a tag.

        setupTagLink: function (tag, element) {
            var me = this;
            jQuery(element).click(function () {
                me.selectTag(tag);
                return false;
            });
        },

        selectTag: function (tag) {
            this.tag_field.val(tag);
            this.updateSelection();
        },

        // Returns the index of a tag in the value, or -1 if not found.

        findTag: function (tag) {
            tag = reduceBlanks(tag);
            var tags = this.value;
            for (var index = 0; index < tags.length; index += 1) {
                if (tags[index] == tag) return index;
            }
            return -1;
        },

        // Highlights a tag that matches the current tag field value.

        updateSelection: function () {
            jQuery("a", this.selector).removeClass("wa_tag_selected");
            var field_text = this.tag_field.val();
            var index = this.findTag(field_text);
            if (index >= 0) {
                this.tag_button.html("Remove Tag");
            }
            else {
                this.tag_button.html("Add Tag");
            }

        },

        // Validate that the field has a value if not marked as options.

        validateRequired: function () {
            var is_optional = this.option("optional", false);
            if (!is_optional) {
                var value = this.value;
                if (typeof(value) == "undefined" || value == null ||
                        value.length == 0) {
                    this.say('*' + this.getLabel() + ' is required');
                    return false;
                }
            }
            return true;
        }

    });

    var PasswordItem  = FormItem.extend({

        // Name of class for ID generation
        class_name: "PasswordItem",

        // Constructs a PasswordItem

        constructor: function (name, options) {
            this.base(name, options);
            this.confirm = this.option('confirm', false);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            control_cell.append(
                input({type: 'password', name: item_name, "class": 'wa_text_item'}));
            if (this.confirm) {
                var confirm_name = item_name + "_confirm";
                control_cell.append(
                    div({'class':'wa_form_password_confirm'}, "Confirm Password:") +
                    input({type: 'password', "class": 'wa_text_item'}));
            }

            this.attach(control_cell);
        },

        // Attaches events to entry fields.

        attach: function (control_cell) {
            var self = this;

            // Attach events for password entry field
            var password_field = jQuery("input", control_cell);
            password_field.keydown(
                function (event) { self.onChange(event); });
            password_field.blur(
                function (event) { self.onBlur(); });
            this.password_field = password_field;

            // If confirming, respond to confirm field events
            if (this.confirm) {
                var confirm_field = jQuery('input:eq(1)', control_cell);
                confirm_field.keydown(
                    function (event) { self.onChange(event); });
                confirm_field.blur(
                    function (event) { self.onBlur(); });
                this.confirm_field = confirm_field;
            }
        },

         onChange: function (event) {
            //var key_code = event.keyCode;
            //if (key_code == 32)
            //    event.preventDefault();
        },

        // Validate on blur

        onBlur: function () {
            this.setValue(this.dom_element.val());
            this.check();
        },

        // Check the for a valid password

        validate: function () {
            this.base();
            var password = this.password_field.val();

            // Check password length
            var length = password.length;
            if (length > 0 && length < this.count) {
                this.say("*At least " +
                    this.count + " characters");
                return false;
            }

            // Check for match with confirm field
            if (this.confirm) {
                var confirm_password = this.confirm_field.val();
                if (confirm_password !='' && password != confirm_password) {
                    this.say("*Passwords do not match");
                    return false;
                }
            }

            return true;
        },

        // Update HTML when value changes

        update: function () {

        }

    });

    var MONTH_NAMES = [
            "jan", "january", "feb", "february",  "mar", "march",
            "apr", "april",   "may", "may",       "jun", "june",
            "jul", "july",    "aug", "august",    "sep", "september",
            "oct", "october", "nov", "november",  "dec", "december"
    ];

    var DATE_PATTERN = new RegExp("^[0-3][0-9] *("
            + MONTH_NAMES.join('|') + ") [12]*[0-9]{3}$");

    var DateItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "DateItem",

        // Constructs a TextItem

        constructor: function (name, options) {
            this.base(name, options);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var item_name = this.itemName();
            control_cell.append(input({name: item_name, 'class':'wa_form_text_var'}));
            this.control = jQuery('input', control_cell);
            this.control.datepicker({dateFormat: 'dd M yy',
                changeMonth: true, changeYear: true});

            var self = this;
            this.control.change(function (event) { self.onChange(event); });
        },

        onChange: function (event) {
            var value = this.control.val();
            this.setValue(value);
            this.check();
        },

        validate: function () {
            this.base();
            var value = this.control.val().toLowerCase();
            if (!value.match(DATE_PATTERN)) {
                this.say("*Must use \"12 Jan 2001\" format")
                return false;
            }
            return true;
        },

        // Update HTML when value changes

        update: function () {
            var value = this.value;
            if (value == null || typeof(value) == "undefined")
                value = '';
            if (value instanceof Date)
                value = jQuery.datepicker.formatDate('dd M yy', value);
            this.control.val(value);
        }

    });

    var SaveButton = FormItem.extend({

        // Name of class for ID generation
        class_name: "SaveButton",

        // Constructs a SaveButton

        constructor: function (name, options) {
            this.base(name, options);
        },

         // Generates HTML for the FormItem (always as a table row)

        generate: function (dom_element) {
            dom_element.append(td({'class':'wa_form_label'}));
            dom_element.append(td({}, ""));
            var control_cell = jQuery("td:eq(1)", dom_element);
            this.control_cell = control_cell;
            this.generateControl(control_cell);
            control_cell.append(div({'class':'wa_form_message'}));
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
            var label = this.getLabel();

            var button_type = "button";
            if (this.option("submit", false))
                button_type = "submit";

            control_cell.append(
                input({type: button_type, value: label, 'class': 'wa_form_submit'}));
            this.submit_button = jQuery('input:eq(0)', control_cell);
            var self = this;
            this.submit_button.click(function (event) {
                self.onSave(event);
            });

            if (this.option('cancel', false)) {
                control_cell.append('&nbsp;'+
                        input({type: 'button', 'value': "Cancel",
                            'class': 'wa_form_cancel'}));
                this.cancel_button = jQuery('input:eq(1)', control_cell);
                this.cancel_button.click(function (event) {
                    self.onCancel(event);
                });
            }
        },

        // Submit buttons always validate

        validate: function () {
            this.is_valid = true;
            return true;
        },

        // Respond to save button

        onSave: function (event) {
            var form = this.getForm();
            if (form == null)
            	return false;
            if (form.onSave())
            	return true;
           	event.preventDefault();
            return false;
        },

        // Respond to cancel button

        onCancel: function () {
            var form = this.getForm();
            if (form != null)
                return form.onCancel();
            return false;
        }
    });

    var GroupItem = FormItem.extend({

        // Name of class for ID generation
        class_name: "GroupItem",

        // Constructs a GroupItem

        constructor: function (name, options) {
            this.base(name, options);
        },

        // Generates the HTML for a control.

        generateControl: function (control_cell) {
        }

    });

    var Form = GroupItem.extend({

        // Name of class for ID generation
        class_name: "Form",

        // Tag of element used in main element of the control
        element_tag: 'div',

        // Constructs a Form

        constructor: function (options) {
            this.base("Form", options);

            // Object identifier
            this.object = this.option('object');

            // Map from item name to item
            this.item_map = {};

            // Add any child form items
            if (arguments.length > 1)
                for (var index = 1; index < arguments.length; index += 1)
                    this.add(arguments[index]);
        },

        // ** Registering and Finding Items

        // Register an item by name

        registerItem: function (item) {
            this.item_map[item.name] = item;
        },

        // Returns the item with a specified name

        getItem: function (name) {
            var item = this.item_map[name];
            if (typeof item == "undefined")
                return null;
            else
                return item;
        },

        // ** Data and Field Values

        // Sets a field in the data object. If the value has not been set or
        // if it is not equal to the old value, broadcasts "onSetValue" to
        // all listeners.

        setItemValue: function (name, value) {
            var item = this.getItem(name);
            if (item != null)
                item.setValue(value);
        },

        // Returns the value of a field in the data object, or null if not set.

        getItemValue: function (name) {
            var item = this.getItem(name);
            if (item == null)
                return null;
            var value = item.value;
            if (typeof value == "string")
                value = encodeUnicode(value);
            return value;
        },

        // Sets all data fields from a source object.

        setData: function (source_object) {
            this.each(function (item) {
                var value = source_object[item.name];
                if (typeof value == "undefined")
                    value = null;
                if (typeof value == "string")
                    value = decodeUnicode(value);
                item.setValue(value);
            });
        },

        // Sets all fields in a destination object from field values
        // stored in the form.

        updateData: function (destination_object) {
            var me = this;
            this.each(function (item) {
                var value = item.value;
                if (typeof value == "string")
                    value = encodeUnicode(value);
                destination_object[item.name] = value;
            });
        },

        // Gets the changed data as a JSON string

        getJSONString: function () {
            var data = {};
            this.updateData(data);
            return JSONstring.make(data);
        },

        // ** Events

        // Called when form is saved. Note that this broadcasts the
        // event to listeners.

        onSave: function () {
            if (this.checkForm()) {
                this.broadcast("onSave");
                return true;
            }
            else {
                this.broadcast("onInvalid");
                return false;
            }
        },

        // Called when this form is canceled. Note that this broadcasts
        // the event to listeners.

        onCancel: function () {
            this.broadcast("onCancel");
            return false;
        },

        // ** Messages and validation

        // Flash a message from a specific item

        message: function (item, message) {
            this.message_element.html(message);
        },

        // Validate all form fields. Returns true if all a valid, false
        // otherwise.

        checkForm: function () {
            var error_item = this.find(function (item) {
                return !item.check();
            });
            return error_item == null;
        },

        // ** HTML Generation

        generate: function (dom_element) {
            var form_options = this.makeFormOptions();

            // Set up form and form table
            dom_element.append(
                    form(form_options,
                            table({'class':'wa_form_table'})));
            this.generateAuthToken(jQuery('form', dom_element));
            this.setContentsElement(jQuery('table', dom_element));
        },

        // Collects form options into an object

        makeFormOptions: function () {
            var form_options = {};
            var method = this.option("method");
            if (method != null)
                form_options.method = method;
            var action = this.option("action");
            if (action != null)
                form_options.action = action;
            var enctype = this.option("enctype");
            if (enctype != null)
                form_options.enctype = enctype;
            return form_options;
        },


        // Add Authenticity token (if specified)

        generateAuthToken: function (form_element) {
            var token = this.option("auth_token");
            if (token == null) return;
            form_element.append(
                input({name: "authenticity_token", type: "hidden",
                    value: token}));
        }

    });

    // Removes blanks from the beginning and end of a string, as well as changing
    // any sequence of more than one blank to a single blank.

    function reduceBlanks(text) {
        var out = [];
        var blank_count = 0;
        for (var index = 0; index < text.length; index += 1) {
            var next_char = text.charAt(index);
            if (next_char == ' ')
                blank_count += 1;
            else {
                if (blank_count > 0 && out.length > 0)
                    out.push(' ');
                blank_count = 0;
                out.push(next_char);
            }
        }
        return out.join('');
    }

    // format a list of items 'a1, a2, .. or an'.

    function formatList(items, or_and) {
        if (typeof or_and == "undefined")
            or_and = "or";
        var parts = new Array();
        var last_index = items.length - 1;
        for (var index = 0; index <= last_index; index += 1) {
            if (index == last_index && last_index > 0)
                parts.push(", " + or_and + " ");
            else if (index > 0)
                parts.push(", ");
            parts.push(items[index].toString());
        }
        return parts.join("");
    }

    // Convert unicode characters to HMTL entities: &#000;

    function encodeUnicode(text) {
        var result = new Array();
        for (var index = 0; index < text.length; index += 1) {
            var character = text.charAt(index);
            if (character <= "\u007F")
                result.push(character);
            else
                result.push("&#" + character.charCodeAt(0) + ";");
        }
        return result.join("");
    }

    // Convert a string containing unicode entities to unicode

    function decodeUnicode(text) {
        var parts = text.split(/(&#[0-9]+;)/g);
        for (var index = 0; index < parts.length; index += 1) {
            var part = parts[index];
            var digits = part.match(/&#([0-9]+);/);
            if (digits != null) {
                parts[index] = String.fromCharCode(digits[1]);
            }
        }
        return parts.join("");
    }

    // **** Evaluate the exported namespace
    eval(this.exports);
};