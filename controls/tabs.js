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

    var tabs = new base2.Package(this, {
        name:    "tabs",
        version: "0.1",
        imports: "observers,generator,controls",
        exports: "TabRow"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var DEFAULT_TAB_WIDTH = 80;

    // **** TabRow Control

    // Options:
    //   choices 	-- Array of tab labels
    //	 select   	-- Tab number (from 0) selected

    var TabRow = Control.extend({

    	// Constructs a TabRow

    	constructor: function (options) {
    		this.base(options, {css_class:'wa_tab_row'});

    		this.choices = this.option("choices", []);
    		this.selected = -1;
    		this.value = this.option("value", null);
    		this.tabs = new Array();
    	},

    	// Generate HTML and set up events for this control.

    	generate: function (dom_element) {
    		dom_element.append(
                div({'class':'wa_tab_slide'},
                    table({'class':'wa_tab_table'},
                           tr({}))));
    		var row = jQuery("tr", dom_element);
    		var choices = this.choices;
    		for (var index = 0; index < this.choices.length; index += 1) {
    			var choice = choices[index];
    			if (typeof choice == "string")
    				this.addTab(dom_element, choice, index);
    			else {
    				value = choice.value;
    				if (typeof value == "undefined")
    					value = index;
    				this.addTab(dom_element, choice.label, value,
    					choice.width, choice.has_close);
    			}
    		}
            this.update();
    	},

    	// Adds a new tab

    	addTab: function (dom_element, label, value, width, has_close) {
    		if (typeof width == "undefined")
    			width = null;
    		if (typeof has_close == "undefined")
    			has_close = false;
			var tab_button = new TabButton(label, value, width, has_close);
    		var row = jQuery("tr", dom_element);
			tab_button.makeControl(row);
			tab_button.tabAddedTo(this, this.tabs.length);
			this.tabs.push(tab_button);
    	},

    	// Select a specific tab

    	selectTab: function (index) {
    		if (index == this.selected) return;
    		this.value = this.tabs[index].value;
    		this.update();
    		this.broadcast("changed", this.value, this.index);
    	},

    	// Close a specified tab

    	closeTab: function (index) {
			var tabs = this.tabs;
			var removed = tabs[index];
			tabs.splice(index, 1);
			removed.tabRemovedFrom(this);
			this.renumberTabs();
			if (index <= this.selected)
				this.selectTab(this.selected - 1);
			this.update();
			this.broadcast("closed", removed.value);
    	},

    	// Renumber tabs

    	renumberTabs: function () {
    		var tabs = this.tabs;
			for (var index = 0; index < tabs.length; index += 1)
				tabs[index].index = index;
    	},

    	// Deselect all tabs

    	deselectAll: function () {
    		var tabs = this.tabs;
    		for (var index = 0; index < tabs.length; index += 1)
    			tabs[index].setSelected(false);
    		this.selected = -1;
    	},

    	// Update HTML to match the current state of the control and model.

    	update: function () {
    		this.deselectAll();

    		var value = this.value;
    		var tabs = this.tabs;
    		for (var index = 0; index < tabs.length; index += 1) {
    			if (tabs[index].value == value) {
    				tabs[index].setSelected(true);
    				this.selected = index;
    			}
    		}
    	}
    });

    // Single tab control

    var TabButton = Control.extend({

    	// Tab constructor

    	constructor: function (label, value, width, has_close) {
    		this.base({}, {css_class:'wa_tab', width: width});
    		this.label = label;
    		this.value = value;
    		this.has_close = has_close;
    		this.selected = false;
    	},

    	// Called when this tab is added to a tab row

    	tabAddedTo: function (tab_row, index) {
    		this.tab_row = tab_row;
    		this.index = index;
    	},

    	// Reports that this tab has been removed

    	tabRemovedFrom: function (tab_row) {
    		if (tab_row != this.tab_row) return;
    		this.tab_row = null;
    		this.dom_element.hide("fast");
    	},

    	// Tag to use in primary element

 		element_tag: 'td',

    	// Generate tab HTML

    	generate: function (dom_element) {
    		var span_html = span({'class':'wa_tab_label'}, this.label);
			dom_element.append(span_html);
			dom_element.append(span({}));
			if (this.has_close)
				jQuery("span:eq(1)", dom_element).addClass('wa_tab_close');
			this.attach(dom_element);
    	},

    	// Attach events to the tab

    	attach: function (dom_element) {
    		var me = this;
    		dom_element.click(function () {
    			me.select();
    		});
    		jQuery("span:eq(1)", dom_element).click(function () {
    			me.close();
    		});
    	},

    	// Called when tab is selected

    	select: function () {
    		var tab_row = this.tab_row;
    		if (tab_row == null) return;
    		tab_row.selectTab(this.index);
    	},

    	// Set this tab as selected or deselected.

    	setSelected: function (is_selected) {
    		if (this.is_selected == is_selected) return;
    		this.is_selected = is_selected;
    		this.update();
    	},

    	// Called when tab is closed

    	close: function () {
    		var tab_row = this.tab_row;
    		if (tab_row == null) return;
    		tab_row.closeTab(this.index);
    	},

    	// Update the tab

    	update: function () {
    		var dom_element = this.dom_element;
    		if (this.is_selected)
  				dom_element.addClass("wa_tab_pressed");
  			else
				dom_element.removeClass("wa_tab_pressed");
    	}

    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};