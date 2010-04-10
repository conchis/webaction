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

    var checklist = new base2.Package(this, {
        name:    "checklist",
        version: "0.1",
        imports: "observers,list_models,generator,controls",
        exports: "Checklist"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var DEFAULT_WIDTH = 210;
    var TABLE_BORDER   = 15;
    var CHECKBOX_WIDTH = 15;

    var Checklist = Control.extend({

        class_name: "Checklist",

        // Constructs a checklist

        constructor: function (options) {
            this.base(options, {css_class: 'wa_checklist'});

            this.initializeIdAccessor();
            this.initializeGroupAccessor();
            this.initializeLabelAccessor();

            this.setModel(this.option("model"));
            this.width = this.option("width", DEFAULT_WIDTH);

        },

         initializeIdAccessor: function () {
            var id_option = this.option("item_id");
             if (typeof(id_option) == "string")
                accessor = function (item) { return item[id_option]; };
            else if (id_option == null)
                accessor = function (item) { return "" };
            else
                accessor = id_option;
            this.getItemId = accessor;
        },

        initializeGroupAccessor: function () {
            var group_option = this.option("group");
            if (typeof(group_option) == "string")
                accessor = function (item) { return item[group_option]; };
            else if (group_option == null)
                accessor = function (item) { return item }
            else
                accessor = group_option;
            this.getGroup = accessor;
        },

        initializeLabelAccessor: function () {
            var label_option = this.option("label");
             if (typeof(label_option) == "string")
                accessor = function (record) { return record[label_option]; };
            else if (label_option == null)
                accessor = function (record) { return record }
            else
                accessor = label_option;
            this.getLabel = accessor;
        },

        setModel: function (model) {
            var getGroup = this.getGroup;
            var getLabel = this.getLabel;
            model = new ListFilter(model);
            model.orderBy(function (item_a, item_b) {
                var group_a = getGroup(item_a).toLowerCase();
                var group_b = getGroup(item_b).toLowerCase();
                if (group_a < group_b)
                    return -1;
                if (group_a > group_b)
                    return +1;
                var label_a = getLabel(item_a).toLowerCase();
                var label_b = getLabel(item_b).toLowerCase();
                if (label_a < label_b)
                    return -1;
                if (label_a > label_b)
                    return +1;
                return 0;
            });

            this.model = model;
            this.buildGroupIndex();
        },

        // Builds group index from the model, mapping groups to the index
        // of the first item in the group.

        buildGroupIndex: function () {
            var group_index = new Object();
            var group_names = new Array();
            var group = null;
            var getGroup = this.getGroup;
            this.model.each(function (item, index) {
                var item_group = getGroup(item);
                if (item_group != group) {
                    group = item_group;
                    group_names.push(group);
                    group_index[group] = index;
                }
            });
            this.group_names = new ListModel(group_names);
            this.group_index = group_index;
        },

        generate: function (dom_element) {
            var width = this.width;
            var selector = new GroupSelector({
                    model: this.group_names, width: width});
            selector.addListener("select", this, "selectGroup");
            selector.makeControl(dom_element);
            this.selector = selector;

            var item_list = new ItemList({
                    model: this.model, width: width, getItemId: this.getItemId,
                    getGroup: this.getGroup, getLabel: this.getLabel});
            item_list.makeControl(dom_element);
            item_list.addListener("scrolled", this);
            item_list.addListener("checked", this);
            item_list.addListener("unchecked", this);
            this.item_list = item_list;
        },

        selectGroup: function (group) {
            this.item_list.scroll(group);
        },

        scrolled: function (group) {
            this.selector.setSelected(group);
        },

        checked: function (item) {
            this.broadcast("checked", item);
        },

        unchecked: function (item) {
            this.broadcast("unchecked", item);
        },

        uncheck: function (item) {
            item.selected = false;
            var item_list = this.item_list;
            this.model.each(function (source_item, index) {
                if (item === source_item) {
                    item_list.updateRow(index);
                }
            });
        }

    });

    var GroupSelector = Control.extend({

        class_name: "GroupSelector",

        constructor: function (options) {
            this.base(options, {css_class:'wa_clist_select'});

            this.width = this.option("width");
            var model = this.option("model");
            model.addListener("changed", this, "update");
            this.model = model;

            this.selected = null;
        },

        generate: function (dom_element){
        },

        update: function () {
            var self = this;
            var dom_element = this.dom_element;
            dom_element.empty();
            this.model.each(function (item, index) {
                var button_id = self.id + "_" + index;
                dom_element.append(div({id: button_id,
                        'class':'wa_clist_group_buton'}, item));
                jQuery("#" + button_id, dom_element).click(function () {
                    self.select(item);
                });
            });
        },

        select: function (item) {
            if (this.selected == item) return;
            this.broadcast("select", item);
        },

        setSelected: function (item) {
            var button_id;
            var prior_selected = this.selected;
            if (prior_selected == item) return;

            var dom_element = this.dom_element;
            var model = this.model;

            if (typeof prior_selected != "undefined") {
                button_id = "#" + this.id + "_" +
                        model.indexOf(prior_selected);
                jQuery(button_id, dom_element).removeClass(
                        'wa_clist_group_selected');
            }

            this.selected = item;
            button_id = "#" + this.id + "_" + model.indexOf(item);
            jQuery(button_id, this.dom_element).addClass(
                    'wa_clist_group_selected');
        }
    });

    var ItemList = Control.extend({

        class_name: "ItemList",

        constructor: function (options) {
            this.base(options, {css_class:'wa_clist_items'});
            this.model = this.option("model");
            this.width = this.option("width");
            this.getLabel = this.option("getLabel");
            this.getGroup = this.option("getGroup");
            this.getItemId = this.option("getItemId");

            this.group_list = new Array();
            this.group_map = new Object();
        },

        generate: function (dom_element) {
            var self = this;
            dom_element.scroll(function () { self.scrolled(); });
              var element_top = dom_element.offset().top;
            this.element_top = element_top;

            var table_width = this.width - TABLE_BORDER;
            dom_element.append(table({style:'width:' + table_width + 'px;'}));
            var table_element = jQuery("table", dom_element);

            this.cell_width = this.width - 16 - 15;

            var group = null;
            var item_count = 0;
            var group_count = 0;
            var getGroup = this.getGroup;
            var getLabel = this.getLabel;
            this.model.each(function (item, index) {
                var item_group = getGroup(item);
                if (item_group != group) {
                    group = item_group;
                    self.generateGroupHeader(group, group_count, table_element);
                    group_count += 1;
                }
                self.generateItemRow(item, index, table_element);
            });
        },

        generateItemRow: function (item, index, table_element) {
            var getLabel = this.getLabel;
            var getItemId = this.getItemId;
            var row_id = this.id + "r" + index;
            table_element.append(tr({id: row_id},
                td({'class':'wa_clist_checkcol'}, div({'class':'wa_clist_checkbox'})),
                td({'class':'wa_clist_id'}, getItemId(item)),
                td({'class':'wa_clist_label'}, getLabel(item))
            ));
            var self = this;
            var row_element = jQuery("#" + row_id + " td", this.dom_element);
            row_element.click(function () {
                self.toggleRow(item, row_id);
            });
            this.updateRow(index);
        },

        updateRow: function (index) {
            var item = this.model.get(index);
            var row_id = this.id + "r" + index;
            var element = jQuery("#" + row_id + " .wa_clist_checkbox", this.dom_element);
            var is_selected = item.selected;
            if (typeof(is_selected) == "undefined")
                is_selected = false;
            if (is_selected)
                element.addClass('wa_clist_checkbox_selected');
            else
                element.removeClass('wa_clist_checkbox_selected');
        },

        generateGroupHeader: function (group, count, table_element) {
            group_id = this.id + 'g' + count;
            table_element.append(
                tr({id: group_id, 'class':'wa_clist_group_row'},
                    td({style:'width:' + CHECKBOX_WIDTH+ 'px'}),
                    td({colspan: 2}, group)));
            var group_element = jQuery("#" + group_id, table_element);
            var group_object = {group: group, element: group_element};
            this.group_list.push(group_object);
            this.group_map[group] = group_object;
        },

        toggleRow: function (item, row_id) {
            var element = jQuery("#" + row_id + " .wa_clist_checkbox", this.dom_element);
            if (typeof item.selected == "undefined")
                item.selected = false;
            item.selected = !item.selected;
            if (item.selected) {
                element.addClass('wa_clist_checkbox_selected');
                this.broadcast("checked", item);
            }
            else {
                element.removeClass('wa_clist_checkbox_selected');
                this.broadcast("unchecked", item);
            }
        },

        // Scroll to a group

        scroll: function (group) {
            var group_object = this.group_map[group];
                if (typeof group_object == "undefined") return;

                var dom_element = this.dom_element;
                var top = this.dom_element.offset().top;

            var element = group_object.element;
            var offset = element.offset().top - top + dom_element.scrollTop();

                dom_element.animate({'scrollTop':offset}, 'fast');
        },

        // Called when the list is scrolled

        scrolled: function () {
            var top = this.dom_element.offset().top;
            var group_list = this.group_list;
            for (var index = 1; index < group_list.length; index += 1) {
                var group_object = group_list[index];
                var element = group_object.element;
                var offset = element.offset().top;
                if (offset > top) {
                    this.broadcast("scrolled", group_list[index - 1].group);
                    break;
                }
            }
        }
    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};