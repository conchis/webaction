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

    var tag_selector = new base2.Package(this, {
        name:    "tag_selector",
        version: "0.1",
        imports: "observers,generator,controls,buttons,tag_index",
        exports: "TagSelector"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var TagSelector = Control.extend({

        class_name: "TagSelector",

        // Constructs the TagSelector

        constructor: function (options) {
            this.base(options);
            this.model = this.option("model");
            this.tag_index = new TagIndex({list: this.model});

            // Table mapping tag -> true or false if selected
            this.selected = {};

            // Combine mode: 'one', 'and', or 'all'
            this.mode = this.option("mode", "one");

            // Map of item index -> true
            this.included = {};
        },

        setModel: function (model) {
            this.model = model;
            this.tag_index = new TagIndex({list: model});
            this.generateTags(this.dom_element);
            this.update();
        },

        // Generate HTML

        generate: function (container) {
            container.append(div({id: this.id}));
            var dom_element = jQuery("#" + this.id);

            var readout_id = this.id + "_readout";
            dom_element.append(div({id: readout_id, 'class':'wa_tags_readout'}));
            this.readout = jQuery("#" + readout_id);

            var tag_panel_id = this.id + "_tags";
            dom_element.append(div({id: tag_panel_id, 'class':'wa_tags_select'}));
            this.tag_panel = jQuery("#" + tag_panel_id);

            this.generateTags(dom_element);
            this.generateButtons(dom_element);

            return dom_element;
        },

        generateButtons: function (dom_element) {
            var button_panel_id = this.id + "_buttons";
            dom_element.append(div({id: button_panel_id, 'class': 'wa_tags_buttons'}));
            var button_panel = jQuery("#" + button_panel_id);

            var clear_button = new Button({label: "Clear", width: 74});
            clear_button.makeControl(button_panel);
            clear_button.addListener("changed", this, "clear");

            var self = this;

            var one_button = new Button({label: "One", toggles: true, width: 30});
            one_button.makeControl(button_panel);
            one_button.addListener("changed", function (is_pressed) {
                if (is_pressed) self.setMode("one");
            });
            this.one_button = one_button;

            var and_button = new Button({label: "And", toggles: true, width: 30});
            and_button.makeControl(button_panel);
            and_button.addListener("changed", function (is_pressed) {
                if (is_pressed) self.setMode("and");
            });
            this.and_button = and_button;

            var or_button = new Button({label: "Or", toggles: true, width: 30});
            or_button.makeControl(button_panel);
            or_button.addListener("changed", function (is_pressed) {
                if (is_pressed) self.setMode("or");
            });
            this.or_button = or_button;
        },

        // Generate tag panel

        generateTags: function (dom_element) {
            var tag_panel = this.tag_panel;
            tag_panel.empty();

            var self = this;
            var tags = this.tag_index.findBestSelectors(16);
            this.tags = tags;   // FIXME separate
            var frequencies = this.tag_index.getNormalizedFrequencies(tags);
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                var size = 10 + Math.round(8 * frequencies[tag]);
                tag_panel.append(span({style: {font_size: size}, 'class':'wa_tags_tag'},
                     tag) + " ");
                var link = $("span:eq(" + index + ")", tag_panel);
                link.bind("click", tag, function (event) {
                    self.selectTag(event.data);
                });
            }
        },

        // *** State save and restore

        // Returns an object that includes selector state information
        // so that it's state can be restored later.'

        getState: function () {
            var state_object = {};

            // Record mode: "one", "and"..
            state_object.mode = this.mode;

            // Add array of selected tags
            var selected = this.selected;
            var tags = [];
            for (var name in selected) {
                if (selected[name]) tags.push(name);
            }
            state_object.tags = tags;

            return state_object;
        },

        // Restores saved state information

        restoreState: function (state_object) {
            this.setMode(state_object.mode);
            
            var tags = state_object.tags;
            for (var index = 0; index < tags.length; index += 1)
                this.selectTag(tags[index]);
        },

        // *** Tag Selection

        // Set selection mode: 'one', 'and', or 'or'

        setMode: function (mode) {
            if (mode == this.mode) return;
            if (mode == "one")
                this.selected = {};
            this.mode = mode;
            this.update();
        },

       // Toggles selection of a tag

        selectTag: function (tag) {
            if (this.mode == "one")
                this.selected = {};
            var is_selected = this.selected[tag];
            if (typeof(is_selected) == "undefined")
                is_selected = false;
            is_selected = !is_selected;
            this.selected[tag] = is_selected;
            this.update();
        },

        // Clears all selected tags

        clear: function () {
            this.selected = {};
            this.update();
        },

        // *** Control Appearence

        update: function () {
            this.updateReadout();
            this.updateTags();
            this.updateButtons();
            this.updateIncluded();
        },

        // Update tag display

        updateTags: function () {
            var selected = this.selected;
            var tags = this.tags;
            var tag_panel = this.tag_panel;

            for (var index = 0; index < tags.length; index += 1) {
                var link = $("span:eq(" + index + ")", tag_panel);
                if (selected[tags[index]])
                    link.addClass("wa_tags_selected");
                else
                    link.removeClass("wa_tags_selected");
            }
        },

        // Update readout

        updateReadout: function () {
            var readout = this.readout;
            var selected = this.selected;
            var tags = this.tags;

            var parts = [];
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                if (selected[tag])
                    parts.push(tag);
            }

            var separater = " and ";
            if (this.mode == "or")
                separater = " or ";

            var message = parts.join(separater);
            if (message == "") message = "-- All Items --";
            readout.html(message);
        },

        // Update button panel

        updateButtons: function () {
            var mode = this.mode;
            if (mode == "one") {
                this.one_button.setPressed(true);
                this.and_button.setPressed(false);
                this.or_button.setPressed(false);
            }
            else if (mode == "and") {
                this.one_button.setPressed(false);
                this.and_button.setPressed(true);
                this.or_button.setPressed(false);
            }
            else if (mode == "or") {
                this.one_button.setPressed(false);
                this.and_button.setPressed(false);
                this.or_button.setPressed(true);
            }
        },

        // Updates the included map

        updateIncluded: function () {
            var tags = [];
            for (var tag in this.selected) {
                if (this.selected[tag])
                    tags.push(tag);
            }
            var locations = this.tag_index.collectLocations(
                    tags, (this.mode == "and"));
            var included = {};
            for (var index = 0; index < locations.length; index += 1)
                included[locations[index]] = true;
            this.included = included;
            this.broadcast("changed", included);
        }
       
    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};
