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

    var addlist = new base2.Package(this, {
        name:    "addlist",
        version: "0.1",
        imports: "observers,list_models,buttons,generator,controls,dialogs,checklist",
        exports: "AddList"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // Control that provides a list of items that lets the user add or
    // remove items.

    var AddList = Control.extend({

        constructor: function (options) {
            this.base(options);
            this.selected = -1;

            this.initializeIdAccessor();
            this.initializeGroupAccessor();
            this.initializeLabelAccessor();

            this.is_sorted = this.option("sorted", true);

            var items = this.option("items", new ListModel());
            items.addListener("added", this, "onAdd");
            items.addListener("removed", this, "onRemove");
            this.items = items;

            var source = this.option("source", new ListModel());
            this.source = source;
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
                    accessor = function (item) { return item[label_option]; };
            else if (label_option == null)
                    accessor = function (item) { return item };
            else
                    accessor = label_option;
            this.getLabel = accessor;
        },

         initializeIdAccessor: function () {
            var id_option = this.option("item_id");
            if (typeof(id_option) == "string")
                accessor = function (item) { return item[id_option]; };
            else if (id_option == null)
                accessor = function (item) { return item };
            else
                accessor = id_option;
            this.getItemId = accessor;
        },

        generate: function (dom_element) {
            var frame_id = this.id + "_frame";
            dom_element.append(div({
                    id: frame_id,
                    'class':'wa_addlist_list'
            }));

            var add_button = new Button({
                    label: "Add...", width: 54});
            add_button.makeControl(dom_element);
            add_button.addListener("changed", this, "add");

            var remove_button = new Button({
                    label: "Remove", width: 54});
            remove_button.makeControl(dom_element);
            remove_button.addListener("changed", this, "remove");

            this.generateDialog(dom_element);
            this.generateItemTable(jQuery('#' + frame_id));
        },

        generateDialog: function (dom_element) {
            var dialog = new AddDialog({items: this.items,
                            source: this.source, getLabel: this.getLabel,
                            getGroup: this.getGroup, getItemId: this.getItemId});
            dialog.makeControl(dom_element);
            this.dialog = dialog;
        },

        // Generates an item table

        generateItemTable: function (element) {
            var table_id = this.id + "_table";
            element.append(table({id: table_id}));
            this.table_element = jQuery('#' + table_id);
        },

        // Updates the view when the item model changes.

        update: function () {
            var self = this;
            var items = this.items;

            // If sorted, sort the elements
            if (this.is_sorted) {
                var getItemId = this.getItemId;
                items.sort(function (item_a, item_b) {
                                var id_a = getItemId(item_a);
                                var id_b = getItemId(item_b);
                                if (id_a == id_b)
                                        return 0;
                                else if (id_a < id_b)
                                        return -1;
                                else
                                        return +1;
                });
            }

            // Replace table rows
            var table_element = this.table_element;
            table_element.empty();
            var getLabel = this.getLabel;
            this.items.each(function (item, index) {
                    self.generateItemRow(table_element, item, index);
            });
        },

        generateItemRow: function (table_element, item, index) {
            var item_id = this.getItemId(item);
            var item_label = this.getLabel(item);
            table_element.append(
                tr({},
                    td({'class':'wa_addlist_id'}, item_id),
                    td({'class':'wa_addlist_label'}, item_label)
                ));
            var row_element = jQuery('tr:eq(' + index + ') > td', table_element);

             var self = this;
            row_element.click(function () { self.select(index); });
           },

           select: function (index) {
               var table_element = this.table_element;
               var selected = this.selected;
               if (selected >= 0) {
                   var prior_element =
                       jQuery('tr:eq(' + selected + ') > td', table_element);
                   prior_element.removeClass('wa_addlist_selected');
               }
               var row_element = jQuery('tr:eq(' + index + ') > td', table_element);
               row_element.addClass('wa_addlist_selected');
               this.selected = index;
           },

           // Adds items to the list via the checklist

        add: function () {
            this.dialog.show();
        },

        // Called when an item is added to the list

        onAdd: function (index, value) {
            this.update();
            this.broadcast("added", value, index);
        },

        // Called when an item is removed from the list

        onRemove: function (index, value) {
            this.update();
            this.broadcast("removed", value, index);
        },

        // Removes the selected item from the list

        remove: function () {
            // Get selected index
            var selected = this.selected;
            if (selected < 0) return;

            // Get selected item, remove from items list
            var item = this.items.get(selected);
            this.items.remove(selected);
            this.selected = -1;

            // Toggle in source list
            var getItemId = this.getItemId;
            var item_id = getItemId(item);
            var dialog = this.dialog;
            this.source.each(function (source_item, source_index) {
                if (getItemId(source_item) == item_id) {
                    dialog.remove(source_item);
                }
            });

        }

    });

    var AddDialog = Dialog.extend({

        constructor: function (options) {
            this.base(options, {width: 216, height: 325});

            this.getLabel  = this.option("getLabel");
            this.getGroup  = this.option("getGroup");
            this.getItemId = this.option("getItemId");

            var items = this.option('items', new ListModel());
            this.items = items;

            var source = this.option('source', new ListModel());
            this.source = source;

            this.initializedSelected(items, source);

            var checklist = new Checklist({model: this.source,
                item_id: this.getItemId, label: this.getLabel, group: this.getGroup,
                left: 5, top: 5});
            this.checklist = checklist;
            checklist.addListener("checked", this, "onAdd");
            checklist.addListener("unchecked", this, "onRemove");
            this.add(checklist);

            var close_button = new Button({label:"Ok", width: 40,
                position: 'absolute', left: this.width - 75, top: this.height - 30});
            this.add(close_button);
            close_button.addListener("changed", this, "onClose");
        },

        initializedSelected: function (items, source) {
            var getItemId = this.getItemId;
            var id_map = {};
            items.each(function (item) {
                    id_map[getItemId(item)] = true;
            });
            source.each(function (source_item) {
                if (id_map[getItemId(source_item)])
                    source_item.selected = true;
            });
        },

        generate: function (dom_element) {
            this.base(dom_element);
            dom_element.hide();
        },

        show: function () {
            this.base();
            this.checklist.show();
        },

        onAdd: function (check_item) {;
            this.items.add(check_item);
        },

        onRemove: function (check_item) {
            var getItemId = this.getItemId;
            var check_id = getItemId(check_item);
            var items = this.items;
            items.each(function (item, index) {
                var item_id = getItemId(item);
                if (item_id == check_id)
                    items.remove(index);
            });
        },

        remove: function (item) {
            this.checklist.uncheck(item);
        },

        onClose: function () {
            this.hide();
        }
    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};