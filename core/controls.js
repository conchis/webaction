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

    var controls = new base2.Package(this, {
        name:    "controls",
        version: "0.1",
        imports: "options,observers,generator",
        exports: "Control"
    });

    // evaluate the imported namespace
    eval(this.imports);

	// Counter used to generate ids
	var id_counter = 0;

    // ** Control -- Abstract class of control widgets.

    var Control = Broadcaster.extend({

		// Class name for string representation and id generation
		class_name: "Control",

    	// Constructs a Control

    	constructor: function (options, defaults) {
    		  this.base();

          // Set default and specified options
          if (typeof defaults != "undefined")
  		    this.setOptions(defaults);
      		this.setOptions(options);
  
          // Initialize standard parameters and contents
          this.initializeParameters();
          this.initializeContents();
  
    	    // Initialized dom and contents elements
      		this.dom_element = null;
      		this.contents_element = null;
    	},

    	// Initializes id, dimensions, position, and style if provided as
    	// options.

    	initializeParameters: function () {
    		// Sets the id if provided, otherwise generates one
    		this.id = this.option("id");
    		if (this.id == null) this.getId();

    		// Set dimensions if provided
    		this.width = this.option('width');
    		this.height = this.option('height');

    		// Set position if provided
    		this.position = this.option('position');
    		this.left = this.option('left');
    		this.top = this.option('top');

    		// Set style and class if provided
    		this.style = this.option('style');
    		this.css_class = this.option('css_class');

            // Set title if provided
            this.title = this.option("title");
    	},

    	// Adds any controls that are passed via the contents option.

    	initializeContents: function () {
    		// Initialize parent and contents
    		this.parent = null;
    		this.contents = null;

            // Add initial contents
    		var contents = this.option("contents", []);
    		for (var index = 0; index < contents.length; index += 1)
    		    this.add(contents[index]);
    	},

    	// ** Control Ids

		// Returns an existing or generated id for the component

		getId: function () {
			var id = this.id;
			if (typeof id != "undefined" && id != null)
				return id;
			id_counter += 1;
			this.id = this.class_name + "_" + id_counter;
			return this.id;
		},

		// Generates an id based on this control's id

		makeId: function (postfix) {
			if (typeof postfix == "undefined")
				postfix = "";
			return this.getId() + "_" + postfix;
		},

		// ** Parents and contents

		// Adds a new control to this one

		add: function (control) {
		    // Get contents array, create a new one if necessary
		    var contents = this.contents;
		    if (contents == null) {
		        contents = [];
		        this.contents = contents;
		    }

		    // Add and inform control that it has been added
		    contents.push(control);
		    control.addedTo(this);

            // If visible, generate new control
            var contents_element = this.contents_element;
		    if (contents_element != null)
		        control.makeControl(contents_element);
		},

		// Called when this control is added to a parent

		addedTo: function (parent) {
		    this.parent = parent;
		},

		// Removes a control from this one (if control is specified) or removes
		// this control from its parent (otherwise).

		remove: function (control) {
		    if (typeof(control) != "undefined") {
		        var contents = this.contents;
		        var index = 0;
		        while (index < contents.length) {
		          if (contents[index] === control)
		            break;
		          index += 1;
		        }
		        if (index == contents.length)
		          index = -1;
		        if (index >= 0)
		            contents.splice(index, 1);
                control.removedFrom(this);
		    }
		    else if (this.parent != null)
		        this.parent.remove(this);
		},

		// Called when this control is removed from a parent

		removedFrom: function (parent) {
		    if (this.dom_element != null) {
		        this.dom_element.remove();
		    }
		    this.parent = null;
		},

		// Returns the number of child controls

		size: function () {
		    var contents = this.contents;
		    if (contents == null)
		        return 0;
		    else
		        return contents.length;
		},

        // ** Iteration and Search

        // Executes a function on each child control.

        eachChild: function (callback) {
            var contents = this.contents;
            if (contents != null){
                for (var index = 0; index < contents.length; index += 1)
                    callback(contents[index], index);
            }
        },

        // Searches child controls for one that satisfies a predicate.

        findChild: function(predicate) {
            var contents = this.contents;
            if (contents == null) return null;

            for (var index = 0; index < contents.length; index += 1) {
                var child = contents[index];
                if (predicate(child, index))
                    return child;
            }
            
            return null;
        },

        // Applies a callback function to each descendant control under this
        // control.

        each: function (callback) {
            var contents = this.contents;
            if (contents == null) return;

            for (var index = 0; index < contents.length; index += 1) {
                var child = contents[index];
                callback(child);
                child.each(callback);
            }
        },

        // Returns a descendant control that satisfies a specified predicate.
        // Returns null if none found.

        find: function (predicate) {
            var contents = this.contents;
            if (contents == null) return null;

            for (var index = 0; index < contents.length; index += 1) {
                var child = contents[index];
                if (predicate(child)) return child;

                var found = child.find(predicate);
                if (found != null) return found;
            }
            return null;
        },

		// ** HTML Generation

		element_tag: 'div',

		// Creates the primary dom_element of the control.

		createDomElement: function (parent_element) {
		    var id = this.getId();
		    parent_element.append(tag(this.element_tag, {id: id}));
		    var dom_element = jQuery("#" + id);

            // Add CSS class if specified
            var css_class = this.css_class;
            if (css_class != null)
                dom_element.addClass(css_class);

            // Add style if specified
		    var style = this.makeStyle();
		    if (style != {})
		        dom_element.css(style);

            // Add title if specified
            var title = this.title;
            if (title != null)
                dom_element.attr('title', title);

		    return dom_element;
		},

		// returns a style object with control defaults

		makeStyle: function () {
		    var style = this.style || {};
		    if (this.width      != null)    style.width     = this.width;
		    if (this.height     != null)    style.height    = this.height;
		    if (this.position   != null)    style.position  = this.position;
		    if (this.top        != null)    style.top       = this.top;
		    if (this.left       != null)    style.left      = this.left;
		    return style;
		},

		// Generate each of the contents controls (if any) if not yet
        // generated.

		generateContents: function () {
		    var contents = this.contents;
		    var contents_element = this.contents_element;
		    if (contents == null) return;
		    for (var index = 0; index < contents.length; index += 1) {
                var control = contents[index];
                if (control.dom_element == null)
		            control.makeControl(contents_element);
            }
		},

    	// Generates HTML for the control and appends it to the container.
    	// Returns the top level element for the control.

    	generate: function () {
    		throw new Error("Implement generate in subclasses");
    	},

    	// Sets the contents element (where each of the contents controls
    	// are added.) Note this must be done in generate, before child
    	// controls are generated.

    	setContentsElement: function (contents_element) {
    	    this.contents_element = contents_element;
    	},

    	// Initializes the control from a DOM element, the generates HTML
    	// to replace that element.

    	makeControl: function (container) {
            container = this.makeQuery(container);
    		this.dom_element = this.createDomElement(container);
    		this.contents_element = this.dom_element;
    		this.generate(this.dom_element);
    		this.generateContents();
    		this.update();
    	},

        // Converts a string to a jQuery object. If the string starts with "#" or
        // "." it is used as a selector, otherwise "#' is appeneded to the beginning.
        // If the argument is not a string, it is returned unchanged.

        makeQuery: function (selector) {
            if (typeof(selector) != "string")
                return selector;
            var first_char = selector.charAt(0);
            if (first_char != "#" && first_char != ".")
                selector = "#" + selector;
            return jQuery(selector);
        },

    	// ** Initialization from a DOM object

    	// Initialize from a query object

    	initializeFrom: function (query) {
    		throw new Error("Implement initializeFrom in subclasses");
    	},

    	// Update HTML to match the current state of the control and model.

    	update: function () {
    	},

    	// ** Show / Hide

    	// Hide this control

    	hide: function (option) {
    		this.dom_element.hide(option);
    	},

    	// Show this control after hiding

    	show: function (option) {
    		this.dom_element.show(option);
    	}

    });
    Control.implement(OptionsMixin);

    // jQuery plug-in to create webaction controls

    jQuery.fn.makeControl = function (control) {
    	control.makeControl(this);
    }

    // ** Evaluate the exported namespace
    eval(this.exports);
};