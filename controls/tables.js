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

    var tables = new base2.Package(this, {
        name:    "tables",
        version: "0.1",
        imports: "observers,options,generator,controls,list_models",
        exports: "Table,Column,DateColumn"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var DEFAULT_COLUMN_WIDTH = 100;
    var DEFAULT_TABLE_HEIGHT = 260;
    var BORDER_WIDTH         =   0;
    var SCROLL_BORDER        =  17;
    var TOP_BAR_HEIGHT       =  26;
    var IE_PADDING           =   6;

    // A Column object defines a column in the table. Note that a column is
    // a model object. Options:
    //
    // label        -- Human readable column label
    // width        -- Column width in pixels
    // sortable     -- True only when column may be sorted by user
    // sorted       -- True when column should be sorted initially
    // ascending    -- When initial sort is ascending
    // get          -- Function used to get the column value from a data object

    // Column -- describes a table of a column

    var Column = Broadcaster.extend({

        constructor: function (id, options) {
            this.base();
            this.setOptions(options);

            this.id = id;
            this.index = -1;

            this.label          = this.option("label", id);
            this.width          = this.option("width", DEFAULT_COLUMN_WIDTH);
            this.sortable       = this.option("sortable", false);
            this.is_sorted      = this.option("sorted", false);
            this.is_ascending   = this.option("ascending", true);
            this.css_class      = this.option("class");

            // Function to obtain value from item
            this.getValue = this.option("get");
            if (this.getValue == null)
                this.getValue = function (source) { return source[id]; };
        },

        // Make this column sortable (or not)

        setSortable: function (is_sortable) {
            if (this.sortable == is_sortable) return;
            this.sortable = is_sortable;
            this.broadcast("changed");
        },

        // Set this column as sorted. (Not sorted means it will not have any
        // lasting influence on sort order.)

        setSorted: function (is_sorted) {
            if (this.is_sorted == is_sorted)
                return;
            this.is_sorted = is_sorted;
            this.broadcast("changed");
        },

        // Set sort direction (true if ascending.)

        setAscending: function (is_ascending) {
            if (!this.sortable || this.is_ascending == is_ascending)
                return;
            this.is_ascending = is_ascending;
            this.broadcast("changed");
        },
        
        // Returns the computed, total width of the column
        
        computedWidth: function () {
            var width = this.width - BORDER_WIDTH;
            if (jQuery.browser.msie)
                width -= IE_PADDING;
            return width;
        },

        // Compare function for sorting by this column's value.

        compareItems: function (item_a, item_b) {
            // If not sortable or not sorted return equal
            if (!(this.sortable && this.is_sorted))
                return 0;

            // Compare values
            var value_a = this.getValue(item_a);
            if (typeof(value_a) == "string") 
                value_a = value_a.toLowerCase();
            
            var value_b = this.getValue(item_b);
            if (typeof(value_b) == "string")
                value_b = value_b.toLowerCase();
            
            var result = 0;
            if (value_a < value_b)
                result = -1;
            else if (value_a > value_b)
                result = +1;

            // Reverse sign if direction not ascending
            if (!this.is_ascending)
                result = -result;
            return result;
        },

        // Render the column's value as a table cell. Override this method to
        // provide a special rendering.

        render: function (item, index) {
            var attributes = {};
            if (this.css_class != null)
                attributes['class'] = this.css_class;
            return td(attributes, this.getValue(item));
        }

    });
    Column.implement(OptionsMixin);
    
    // Column subclass for displaying and sorting dates in dd MMM yy format.
    
    var DateColumn = Column.extend({

        // Compare two encoded dates

		compareItems: function (item_a, item_b) {
			// If not sortable or not sorted return equal
			if (!(this.sortable && this.is_sorted))
				return 0;

			// Compare values
			var text_a = this.getValue(item_a);
 			var text_b = this.getValue(item_b);

            if (text_a == null || text_a == '') {
                if (text_b == null || text_b == '')
                    return 0;
                else
                    return -1;
            }

            if (text_b == null || text_b == '')
                return +1;

            var value_a = jQuery.datepicker.parseDate('dd M yy', text_a);
            var value_b = jQuery.datepicker.parseDate('dd M yy', text_b);

			var result = 0;
			if (value_a < value_b)
				result = -1;
			else if (value_a > value_b)
				result = +1;

			// Reverse sign if direction not ascending
			if (!this.is_ascending)
				result = -result;
			return result;
		}

    });

    // Table control. Options:
    //
    //   columns    -- Column names or objects.
    //   model      -- ListModel or ListFilter containing data objects
    //   height     -- Height of control

    var Table = Control.extend({

        class_name: "Table",

        // Constructs a Table

        constructor: function (options) {
            this.base(options);

            this.initializeColumns(this.option("columns", []));

            this.filter = null;
            var model = this.option("model", null);
            if (model != null)
                this.setModel(model);

            this.height = this.option("height", DEFAULT_TABLE_HEIGHT);

            this.selected = -1;
            this.row_elements = new Array();
        },

        // Sets the table columns. This must be done before HTML is generated.
        // Columns specifications may be either column names, or Column objects
        // with additional information.

        initializeColumns: function (columns) {
            for (var index = 0; index < columns.length; index += 1) {
                    var column = columns[index];
                    if (typeof column == "string")
                            columns[index] = new Column(column);
            }
            this.columns = columns;
            this.measure();
        },

        // Returns an object that captures the state of the table, that
        // can be used later to restore the state if the table.

        getState: function () {
            var state_object = {};

            // Save sorted column and direction
            var columns = this.columns;
            for (var index = 0; index < columns.length; index += 1) {
                if (columns[index].is_sorted) {
                    state_object.sort_column = index;
                    state_object.sort_ascending = columns[index].is_ascending;
                    break;
                }
            }

            this.table_body.saveState(state_object);
            return state_object;
        },

        restoreState: function (state_object) {
            var columns = this.columns;
            if (typeof(state_object.sort_column) == "number") {
                var column = columns[state_object.sort_column];
                column.setSorted(true);
                column.setAscending(state_object.sort_ascending);
            }

            this.table_body.restoreState(state_object);
        },

        // Computes the table and div widths (depending on column sizes).

        measure: function () {
            var columns = this.columns;
            var width = 0;
            for (var index = 0; index < columns.length; index += 1)
                    width += columns[index].width;
            if (jQuery.browser.msie)
                width += 1;
            this.inner_width = width;
            this.width = this.inner_width + SCROLL_BORDER;
        },

        // Set the table's model. This must be a ListModel or ListFilter or
        // another object that implements the same interface.

        setModel: function (model) {
            this.model = model;
            this.update();
        },

        // Generate HTML and set up events for this control.

        generate: function (dom_element) {
            var table_header = new TableHeader(this.columns, {
                width: this.width, inner_width: this.inner_width});
            table_header.makeControl(dom_element);

            var table_body = new TableBody(this.filter, this.columns, {
                width: this.width, inner_width: this.inner_width,
                height: this.height - TOP_BAR_HEIGHT});
            table_body.makeControl(dom_element);
            table_body.addListener("select", this);
            this.table_body = table_body;
        },

        update: function () {
            var model = this.model;
            if (model != null && this.filter == null &&
                    typeof(this.table_body) != "undefined") {
                this.filter = new ListFilter(model);
                this.table_body.setModel(this.filter);
            }
        },

        select: function (index, item) {
            this.broadcast("select", index, item);
        },

        // Returns the index of the table's currently selected item.'

        getSelectedIndex: function () {
            return this.table_body.getSelectedIndex();
        },

        // Returns the the table's currently selected item.'

        getSelectedItem: function () {
            return this.table_body.getSelectedItem();
        }

    });

    // TableHeader -- Row of column buttons to allow used to change the ordering
    // of table rows.

    var TableHeader = Control.extend({

        class_name: "TableHeader",

        // Constructs a TableHeader

        constructor: function (columns, options) {
            this.base(options, {css_class:"wa_table_header"});
            this.inner_width = this.option('inner_width');
            this.columns = columns;
        },

        generate: function (dom_element) {
            var table_id = this.id + "_table";
            var columns = this.columns;
            
            var col_html = [];
            for (var index = 0; index < columns.length; index += 1) {
                var column_width = columns[index].computedWidth();
                col_html.push(col({style:{width: column_width}}));
            }
            
            dom_element.append(table({id: table_id}, col_html, tr()));
            var row_element = jQuery("#" + table_id + " tr");
            
            for (var index = 0; index < columns.length; index += 1)
                this.addColumn(index, columns[index], row_element);
        },

        addColumn: function (index, column, row_element) {
            column.addListener("changed", this);
            var button = new ColumnButton({model: column});
            button.makeControl(row_element);
        },

        changed: function (source) {
            if (source.is_sorted) {
                var columns = this.columns;
                for (var index = 0; index < columns.length; index += 1) {
                    var column = columns[index];
                    column.setSorted(column === source);
                }
            }
        }
    });

    // ColumnButton -- button used to select and change the ordering of
    // column contents.

    var ColumnButton = Control.extend({

        class_name: "ColumnButton",

        // Constructs a ColumnButton

        constructor: function (options) {
            var model = options["model"];          
            this.base(options, {css_class: "wa_table_header_cell"}); 
            this.setModel(model);
        },

        // Set the control's model.

        setModel: function (model) {
            this.model = model;
            var self = this;
            model.addListener("changed", this, "update");
            this.resetTooltip();
        },

        // Generate HTML

        element_tag: 'th',

        generate: function (dom_element) {
            var model = this.model;
            dom_element.append(span({'class':'wa_sort_text'}, model.label));
            dom_element.append(span({}, " "));
            var self = this;
            dom_element.click(function () { self.toggle(); });
            this.resetTooltip();
        },
        
        // Set tooltip if column is sortable
        
        resetTooltip: function () {
            var model = this.model;
            var dom_element = this.dom_element;
            if (model == null || dom_element == null) 
              return;
            if (model.sortable)
                dom_element.attr('title', "Click to sort column");
            else
                dom_element.attr('title', null);       
        },

        // Toggle button

        toggle: function () {
            var model = this.model;
            if (model.is_sorted)
                model.setAscending(!model.is_ascending);
            else
                model.setSorted(true);
        },

        // Update button state

        update: function () {
            var dom_element = this.dom_element;
            var icon = jQuery("span:eq(1)", dom_element);
            var model = this.model;
            if (model.is_sorted) {
                dom_element.addClass("wa_table_cell_highlight");
                if (model.is_ascending) {
                    icon.removeClass("wa_sort_icon_down");
                    icon.addClass("wa_sort_icon_up");
                }
                else {
                    icon.addClass("wa_sort_icon_down");
                    icon.removeClass("wa_sort_icon_up");
                }
            }
            else {
                dom_element.removeClass("wa_table_cell_highlight");
                icon.removeClass("wa_sort_icon_down");
                icon.removeClass("wa_sort_icon_up");
            }
        }
    });

    // Scrolling area that includes table entries.

    var TableBody = Control.extend({

        class_name: "TableBody",

        constructor: function (model, columns, options) {
            this.base(options, {css_class: 'wa_table_body', height: 200, 
                width: options.width});
            this.inner_width = this.option('inner_width');

            this.initializeColumns(columns);

            this.selected = -1;

            this.rows = [];
            this.row_items = [];

            if (model != null)
                this.setModel(model);
        },

        setModel: function (model) {
            if (model === this.model) return;
            this.model = model;
            model.addListener("changed",  this);
            model.addListener("added",    this);
            model.addListener("removed",  this);
            model.addListener("filtered", this);

            if (this.dom_element)
                this.generateRows(this.dom_element);
        },

        // Called to initialize column models.

        initializeColumns: function (columns) {
            this.columns = columns;
            for (var index = 0; index < columns.length; index += 1)
                columns[index].addListener("changed", this, "columnsChanged");
        },

        // Inserts the state of the table body into a supplied state
        // object.

        saveState: function (state_object) {
            state_object.selected = this.selected;
            state_object.scroll = this.dom_element.scrollTop();
        },

        // Restores the selected state.

        restoreState: function (state_object) {
            var scroll = state_object.scroll;
            var selected = state_object.selected;

            this.dom_element.scrollTop(scroll);

            // Do nothing if the selection remains the same
            var prior_selected = this.selected;
            if (selected == prior_selected) return;

            // Hide old selection
            if (prior_selected != -1) {
                var row_id = this.id + "_" + prior_selected;
                var row = jQuery("#" + row_id + " > td", this.dom_element);
                row.removeClass("wa_table_selected");
            }

            // Show new selection
            this.selected = selected;
            var row_id = this.id + "_" + selected;
            var row = jQuery("#" + row_id + " > td", this.dom_element);
            row.addClass("wa_table_selected");
        },

        generate: function (dom_element) {
            dom_element.css({height: this.height, width: this.width});
            
            columns = this.columns;
            var col_html = [];
            for (var index = 0; index < columns.length; index += 1) {
                var column_width = columns[index].computedWidth();
                if (jQuery.browser.msie)
                    column_width -= 3;
                col_html.push(col({style:{width: column_width}}));
            }           
            
            dom_element.append(table({}, col_html));
            this.generateRows(dom_element);
        },

        generateRows: function (dom_element) {
            var model = this.model;
            if (this.model == null)
                return;

            var table = jQuery("#" + this.id + " table");
            this.table = table;
            //table.empty();

            var self = this;
            model.each(function (item, index) {
                    var row_id = self.id + "_" + index;
                    self.appendRow(table, row_id, item, index);
                    self.bindRow(row_id, index, item);
            });
            this.rows.length = model.size();
        },

        appendRow: function (table, row_id, item, index) {
            var model = this.model;
            var columns = this.columns;
            var cells = new Array();
            var rows = this.rows;
            var row_items = this.row_items;
            for (var column_index = 0; column_index < columns.length; column_index += 1)
                    cells.push(columns[column_index].render(item, index));
            table.append(tr({id: row_id}, cells));
            var item_index = model.getItemIndex(index);
            rows[item_index] = jQuery("#" + row_id);
            row_items[index] = item;
        },

        bindRow: function (row_id, index, item) {
            var self = this;
            jQuery("#" + row_id + " td").click(function () {
                    self.select(index, item);
            });
        },

        // Called when a row's data changes. Rebuilds the row's HTML for the new
        // values.

        changed: function (index) {
            var model = this.model;
            var item = model.get(index);
            var item_index = model.getItemIndex(index);
            var row = this.rows[item_index];
            var columns = this.columns;
            var cells = new Array();
            for (var column_index = 0; column_index < columns.length; column_index += 1)
                cells.push(columns[column_index].render(item, index));
            row.html(cells.join(""));
        },

        // Called when a row is added

        added: function (index) {
            this.update();
        },

        // Called when a row is removed

        removed: function (index) {
            this.update();
        },

        // Called when items are filtered or removed

        filtered: function () {
            this.update();
        },

        update: function () {
            if (this.model == null) return;

            var rows = this.rows;
            var model = this.model;
            var table = this.table;
            var visible = {};

            // Reorder all visible items
            var count = model.size();
            for (var index = 0; index < count; index += 1) {
                var item_index = model.getItemIndex(index);
                visible[item_index] = true;
                table.append(rows[item_index]);
            }

            // Hide all non-visible items
            for (var item_index = 0; item_index < rows.length; item_index += 1) {
                var row = rows[item_index];
                if (visible[item_index])
                    row.show();
                else
                    row.hide();
            }
        },

        // Change sort order when user clicks on column

        columnsChanged: function (column) {
            this.model.orderBy(function (item_a, item_b) {
                return column.compareItems(item_a, item_b);
            });
        },

        // Select a row by clicking on it

        select: function (selected, item) {
        
          // Redraw if selection changed
          var prior_selected = this.selected;         
          if (selected != prior_selected) {

              // Hide old selection
              if (prior_selected != -1) {
                      var row_id = this.id + "_" + prior_selected;
                      var row = jQuery("#" + row_id + " > td", this.dom_element);
                      row.removeClass("wa_table_selected");
              }
  
              // Show new selection
              this.selected = selected;
              var row_id = this.id + "_" + selected;
              var row = jQuery("#" + row_id + " > td", this.dom_element);
              row.addClass("wa_table_selected");
          }

          // Broadcast change
          this.broadcast("select", selected, item);
        },

        getSelectedIndex: function () {
            if (this.selected < 0) return null;
            return this.selected;
        },

        // Returns the the table's currently selected item.'

        getSelectedItem: function () {
            if (this.selected < 0) return null;
            return this.row_items[this.selected];
        }

    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};