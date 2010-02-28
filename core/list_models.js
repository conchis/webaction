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

	var list_models = new base2.Package(this, {
		name:	 "list_models",
		version: "0.1",
		imports: "observers,collections",
		exports: "ListModel,ListFilter"
	});

	// evaluate the imported namespace
	eval(this.imports);

	// A ListModel is a List that broadcasts to listeners when any change
	// is made.

	var ListModel = List.extend({

		// Sets a specified element of the list. If the value changes
		// broadcasts the change to listeners.

		set: function (index, value) {
			var prior_value = this.get(index);
			if (value == prior_value) return;

			this.base(index, value);
			this.broadcast("changed", index, value, prior_value);
		},

		// Adds an element to the list (inserts). Broadcasts the change to
		// listeners.

		add: function (value, index) {
			index = index || this.size();
			this.base(value, index);
			this.broadcast("added", index, value);
		},

		// Removes an element from the list. If an element is removed,
		// broadcasts the change to listeners.

		remove: function (index) {
			var prior_value = this.get(index);
			this.broadcast("will_remove", index, prior_value);
			this.base(index);
			this.broadcast("removed", index, prior_value);
		},

		// Signals that an element has changed value. The caller may
		// optionally provide the prior value of the list element.
		// TODO test cases

		changed: function (index, prior_value) {
			if (typeof prior_value == "undefined")
				prior_value = null;
			this.broadcast("changed", index, this.get(index), prior_value);
		},

        // Returns the orignal index of an item. In a ListModel this is just
        // the index. Filters may hide or re-order items so this provides a stable
        // id number associated with each item.

        getItemIndex: function (index) {
            return index;
        },

        // Returns the new index of an item idenfitied by a original index.
        // This method is the inverse of the getItemIndex method (above).

        getBackIndex: function (original_index) {
            return original_index;
        }

	});
	ListModel.implement(BroadcasterMixin);

	// Provides a sorted and filtered view of a list. Note that this object
	// maintains an array of index values and does not alter the contained list.
	// When applied to a ListModel (or an object that implements the ListModel
	// interface), a ListFilter will pass on broadcasts, adjusting index values
	// to match the sorted order.

	var ListFilter = Broadcaster.extend({

		constructor: function (list) {
			// Map from sorter index to list index
			this.index_map = new Array();

			// Map from list index to sorter index
			this.back_index  = new Array();

			// True when changed and index needs updating
			this.changed = false;

			// Default compare function
			this.compare = function (item_a, item_b) {
			    return 0;
			}

			// Default filter function
			this.filter = function (item) { return true };

			// Set list
			if (typeof list != "undefinded")
				this.setList(list);
			else
				this.setList(new ListModel());
		},

		// Sets the list sorted by this decorator.

		setList: function (list) {
			this.list = list;

			list.addListener("changed",       this, 'onChanged'     );
			list.addListener("added",         this, 'onAdded'       );
			list.addListener("removed",       this, 'onRemoved'     );
            list.addListener("filtered",      this, 'onFiltered');

			var self = this;
			list.addListener("will_remove", function (index, prior_value) {
				self.update();
				self.removed_index = self.back_index[index];
			});

			this.changed = true;
		},


		// Sets a function to filter the contents of this list

		filterBy: function (filter) {
			this.filter = filter;
			this.changed = true;
            this.broadcast("filtered");
		},

		// Sets a function to order the contents of this list

		orderBy: function (compare_function) {
			this.compare = compare_function;
			this.changed = true;
            this.broadcast("filtered");
		},

		// Updates the index lists when list changes

		update: function (changed) {
			if (typeof changed != "undefined")
				this.changed = changed;
			if (!this.changed)
				return;
			this.applyFilter();
			this.applySort();
			this.backIndex();
			this.changed = false;
		},

		// Initializes the index_map to the index of each element of theater
		// list where the filter function returns true.

		applyFilter: function () {
			var index_map = new Array();
			var filter = this.filter;
			this.list.each(function (item, index) {
				if (filter(item, index))
					index_map.push(index);
			});
			this.index_map = index_map;
		},

		// Sorts the index_map array so that it will contain indexes of the
		// viewed list in sorted order.

		applySort: function () {
			var compare = this.compare;
			var list = this.list;
			var index_map = this.index_map;

			index_map.sort(function (index_a, index_b) {
				return compare(list.get(index_a), list.get(index_b));
			});
		},

		// Rebuilds the back_index so that it reverses the index_map.

		backIndex: function () {
			var index_map = this.index_map
			var back_index = new Array();
			for (var index = 0; index < index_map.length; index += 1)
				back_index[index_map[index]] = index;
			this.back_index = back_index;
		},

		// Queries

		// Returns an item at a specified index. Raises IndexError if the index
		// is out of bounds.

		get: function (index) {
			if (this.changed) this.update();
			return this.list.get(this.index_map[index]);
		},

		// Returns the number of elements in the view

		size: function () {
			if (this.changed) this.update();
			return this.index_map.length;
		},

		// Returns the position of value in the list after the start position.
		// If a start index is not provided, beings the search with the first
		// element.

		indexOf: function (value, start) {
			if (typeof start == "undefined") start = 0;
			var size = this.size();
			for (var index = start; index < size; index += 1) {
				if (this.get(index) == value)
					return index;
			}
			return -1;
		},

		// Returns true only if value is found in the list. Returns false
		// otherwise.

		contains: function (value) {
			var size = this.size();
			for (var index = 0; index < size; index += 1) {
				if (this.get(index) == value) return true;
			}
			return false;
		},

        // Returns the original index of the item as reported by the source model.

        getItemIndex: function (index) {
            if (this.changed) this.update();
            return this.list.getItemIndex(this.index_map[index]);
        },

        getBackIndex: function (original_index) {
            if (this.changed) this.update();
            return this.back_index[
                this.list.getBackIndex(original_index) ];
        },

		// ** Iteration

		// Executes a function on each element of the list. Does not return a
		// result.

		each: function (closure) {
			var size = this.size();
			for (var index = 0; index < size; index += 1)
				closure(this.get(index), index);
		},

		// Executes a function on each element of the list. Collects and returns
		// all the results as a new List. Note that undefined values are not
		// added and the passed function may also filter by returning undefined
		// when no value is to be appended.

		collect: function (closure) {
			var items = new Array();
			var size = this.size();
			for (var index = 0; index < size; index += 1)
				items.push(closure(this.get(index), index));
			return new List(items);
		},

		// Returns a list of elements for which test_function(element, index)
		// returns true.

		select: function (test_function) {
			var items = new Array();
			var size = this.size();
			for (var index = 0; index < size; index += 1) {
				var value = this.get(index);
				if (test_function(value, index))
					items.push(value);
			}
			return new List(items);
		},

		// Returns the first element e such that test_function(e, index)
		// yields true. Returns null if no element is found.

		find: function (test_function) {
			var size = this.size();
			for (var index = 0; index < size; index += 1) {
				var value = this.get(index);
				if (test_function(value, index))
					return value;
			}
			return null;
		},

		// ** Events

		// Called when 'changed' is broadcast by inside list

		onChanged: function (index, value, prior_value) {
			this.update(true);
			var mapped_index = this.back_index[index];
			if (typeof mapped_index != "undefined")
				this.broadcast("changed", mapped_index, value, prior_value);
		},

		// Called when 'added' is broadcast by inside list

		onAdded: function (index, value) {
			this.update(true);
			var mapped_index = this.back_index[index];
			if (typeof mapped_index != "undefined")
				this.broadcast("added", mapped_index, value);
		},

		// Called when 'removed' is broadcast by inside list

		onRemoved: function (index, prior_value) {
			this.update(true);
			var removed_index = this.removed_index;
			if (typeof removed_index != "undefined")
				this.broadcast("removed", removed_index, prior_value);
		},

		// Called when 'filtered' is broadcast by inside list

		onFiltered: function () {
			this.update(true);
		    this.broadcast("filtered");
		},

		// ** String Representation

		// Returns a string representation of this List.

		toString: function () {
			var size = this.size();
			var out = new Array();
			for (var index = 0; index < size; index += 1)
				out.push(this.get(index).toString());
			return "[" + out.join(", ") + "]";
		}

	});

	// evaluate the exported namespace
	eval(this.exports);
};