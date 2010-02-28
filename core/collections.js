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

	var collections = new base2.Package(this, {
		name:	 "collections",
		version: "0.1",
		imports: "",
		exports: "List,Set,Map,IndexError"
	});

	// evaluate the imported namespace
	eval(this.imports);

	// Error thrown when index is out of bounds.
	var IndexError = new Error("Index out of bounds");

	// List (Array - like) class.

	var List = base2.Base.extend({

		// Constructs a List. The new_items is optional and may be an Array or a
		// List. If new_items are provided the List is initialized to contain
		// new_items's contents.

		constructor: function (new_items) {
			new_items = asArray(new_items);
			this.items = new_items.slice(0);
		},

		// ** Get, set, add, and remove

		// Returns an item at a specified index. Raises IndexError if the index
		// is out of bounds.

		get: function (index) {
			var items = this.items;
			if (index < 0 || index >= items.length)
				throw IndexError;
			return items[index];
		},

		// Sets an element in the list. If index is < 0 or > the length, raises
		// an IndexError. Note this allows additional items to be added at the
		// end of the list.

		set: function (index, value) {
			var items = this.items;
			if (index < 0 || index > items.length)
				throw IndexError;
			items[index] = value;
			return this;
		},

		// Adds an element to the list at index position (moving other elements
		// over as needed). If index is not provided the element is added at the
		// end. If index is < 0 or > the length, raises an IndexError.

		add: function (value, index) {
			var items = this.items;
			if (typeof index == "undefined")
				index = items.length;
			else if (index < 0 || index > items.length)
				throw IndexError;
			items.splice(index, 0, value);
			return this;
		},

		// Removes an element from the list at a specified index.

		remove: function (index) {
			var items = this.items;
			if (index < 0 || index >= items.length)
				throw IndexError;
			items.splice(index, 1);
		},

		// ** Queries

		// Returns the number of elements in the list

		size: function () {
			return this.items.length;
		},

		// Returns the position of value in the list after the start position.
		// If a start index is not provided, beings the search with the first
		// element.

		indexOf: function (value, start) {
			var items = this.items;
			start = start || 0;
			for (var index = start; index < items.length; index += 1) {
				if (items[index] == value) return index;
			}
			return -1;
		},

		// Returns true only if value is found in the list. Returns false
		// otherwise.

		contains: function (value) {
			var items = this.items;
			for (var index = 0; index < items.length; index += 1) {
				if (items[index] == value) return true;
			}
			return false;
		},

		// ** Iteration

		// Executes a function on each element of the list. Does not return a
		// result.

		each: function (closure) {
			var items = this.items;
			for (var index = 0; index < items.length; index += 1) {
				closure(items[index], index);
			}
		},

		// Executes a function on each element of the list. Collects and returns
		// all the results as a new List. Note that undefined values are not
		// added and the passed function may also filter by returning undefined
		// when no value is to be appended.

		collect: function (closure) {
			var result = new Array();
			var items = this.items;
			for (var index = 0; index < items.length; index += 1) {
				var value = closure(items[index], index);
				if (typeof value != "undefined")
					result.push(value);
			}
			return new List(result);
		},

		// Returns a list of elements for which test_function(element, index)
		// returns true.

		select: function (test_function) {
			var items = this.items;
			var result = [];
			for (var index = 0; index < items.length; index += 1) {
				var item = items[index];
				if (test_function(item, index))
					result.push(item);
			}
			return new List(result);
		},

		// Returns the first element e such that test_function(e, index)
		// yields true. Returns null if no element is found.

		find: function (test_function) {
			var items = this.items;
			for (var index = 0; index < items.length; index += 1) {
				var item = items[index];
				if (test_function(item, index))
					return item;
			}
			return null;
		},

		// ** Slice and append

		// Returns a new List with elements from start to end - 1. Slice
		// with no arguments copies the list.

		slice: function (start, end) {
			if (typeof start == "undefined")
				start = 0;
			if (typeof end == "undefined")
				end = this.items.length;
			var new_items = this.items.slice(start, end);
			return new List(new_items);
		},

		// Returns a new list with new_items appended. new_items may be any
		// object that can be converted to an array.

		append: function (new_items) {
			new_items = asArray(new_items);
			var new_list = this.slice();
			for (var index in new_items)
				new_list.add(new_items[index]);
			return new_list;
		},

		// ** Sorting

		// Sorts the list using a specified compare function

		sort: function (compare) {
			this.items = this.items.sort(compare);
			return this;
		},

		// ** String Representation

		// Returns a string representation of this List.

		toString: function () {
			var result = [];
			this.each(function (value, index) {
				if (typeof(value) != "string")
					result.push(value);
				else
					result.push('"' + value + '"');
			})
			return "new List([" + result.join(", ") + "])";
		}

	});

	var Set = base2.Base.extend({

		// Constructs a Set object. The constructor may be passed a
		// List, Set, or Array to initialize its contents.

		constructor: function (new_items) {
			// Initialize map
			var map = new Object();
			this.map = map;

			// Add new items to the set
			new_items = asArray(new_items);
			for (var index in new_items)
				this.add(new_items[index]);
		},

		// ** Add and remove

		// Adds a value to the set

		add: function (value) {
			this.map[value] = value;
		},

		// Removes a value from the set

		remove: function (value) {
			delete this.map[value];
		},

		// ** Contains

		// Returns true only if the specified value is in the set.

		contains: function (value) {
			return (typeof(this.map[value]) != "undefined");
		},

		// ** Iteration

		// Executes a function on each element of the list. Does not return a
		// result.

		each: function (closure) {
			var map = this.map;
			for (var key in map)
				closure(map[key]);
		},

		// Executes a function on each element of the set. Collects and returns
		// all the results as a new Set.

		collect: function (closure) {
			var map = this.map;
			var result = new Set();
			for (var key in map)
				result.add(closure(map[key]));
			return result;
		},

		// Returns a Set of elements for which test_function(element)
		// returns true.

		select: function (test_function) {
			var map = this.map;
			var result = new Set();
			for (var key in map) {
				var value = map[key];
				if (test_function(value))
					result.add(value);
			}
			return result;
		},

		// Returns an element e such that test_function(e) yields true.

		find: function (test_function) {
			var map = this.map;
			for (var key in map) {
				var value = map[key];
				if (test_function(value))
					return value;
			}
		},

		// ** Union, intersection, and difference

		// Returns a new Set with items added.

		union: function (new_items) {
			new_items = asArray(new_items);
			var result = new Set(this);
			for (var index in new_items)
				result.add(new_items[index]);
			return result;
		},

		// Returns a new set with the intersection of elements from each set.

		intersection: function (other_items) {
			if (!(other_items instanceof Set))
				other_items = new Set(asArray(other_items));
			var result = new Set();
			this.each(function (item) {
				if (other_items.contains(item))
					result.add(item);
			});
			return result;
		},

		// Returns a new set with all elements in other_items removed.

		difference: function (other_items) {
			if (!(other_items instanceof Set))
				other_items = new Set(asArray(other_items));
			var result = new Set();
			this.each(function (item) {
				if (!other_items.contains(item))
					result.add(item);
			});
			return result;
		},

		// ** Queries

		// Returns true only if the set is empty

		isEmpty: function () {
			var count = 0;
			for (var value in this.map)
				count += 1;
			return count == 0;
		},

		// Returns the number of elements in the set

		size: function () {
			var count = 0;
			for (var value in this.map)
				count += 1;
			return count;
		},

		// Returns the values in the set as a List

		values: function () {
			var map = this.map;
			var result = new Array();
			for (var key in map)
				result.push(map[key]);
			return new List(result);
		},

		// ** String Representation

		// Returns a string representation of this List.

		toString: function () {
			var result = [];
			this.each(function (item) {
				if (typeof item != "string")
					result.push(item.toString());
				else
					result.push('"' + item + '"');
			});
			return "new Set([" + result.join(", ") + "])";
		}
	});

	// Converts any List or Set or undefined object into an array. If the
	// argument is an array it is returned. If the argument is undefined, an
	// empty Array is returned.

	function asArray(things) {
		if (things instanceof List)
			return things.items;
		if (things instanceof Set)
			return things.values().items;
		var things_type = typeof(things);
		if (things_type == "object" && typeof things.length == "number")
			return things;
		if (things_type == "undefined")
			return new Array();
		throw new Error("Must be array");
	}

	// A ordered map class.

	var Map = base2.Base.extend({

		// Constructs a Map object. The constructor may be passed a
		// Map or Object with initial values.

		constructor: function (new_items) {
			// Initialize map
			this.map = new Object();;

			if (new_items instanceof Map) {
				var me = this;
				new_items.each(function (value, key) {
					me.set(key, value);
				})
			}
			else if (typeof new_items == "object") {
				for (var key in new_items)
					this.set(key, new_items[key]);
			}
			else if (!(typeof new_items == "undefined"))
				throw new Error("Argument must be Map or object");
		},

		// ** Get, set, remove

		// Returns an item at a specified key or null if not found.

		get: function (key) {
			var pair = this.map[key] || null;
			if (pair == null) return null;
			return pair.value;
		},

		// Associates a key, value pair in the map.

		set: function (key, value) {
			this.map[key] = {key: key, value: value};
			return this;
		},

		// Remove a pair with a specified key

		remove: function (key) {
			delete this.map[key];
			return this;
		},

		// ** Contains

		// Returns true only if the specified key is in the map.

		contains: function (key) {
			return (typeof(this.map[key]) != "undefined");
		},

		// ** Iteration

		// Executes a function on each element of the list. Does not return a
		// result.

		each: function (closure) {
			var map = this.map;
			for (var key in map) {
				var pair = map[key];
				closure(pair.value, pair.key);
			}
		},

		// Executes a function on each element of the set. Collects and returns
		// all the results as a new Map.

		collect: function (closure) {
			var result = new Map();
			var map = this.map;
			for (var key in map) {
				var pair = map[key];
				result.set(pair.key, closure(pair.value, pair.key));
			}
			return result;
		},

		// Returns a Map of pairs for which test_function(value, key)
		// returns true.

		select: function (test_function) {
			var map = this.map;
			var result = new Map();
			for (var key in map) {
				var pair = map[key];
				if (test_function(pair.value, pair.key))
					result.set(pair.key, pair.value);
			}
			return result;
		},

		// Returns an element e such that test_function(e) yields true.

		find: function (test_function) {
			var map = this.map;
			for (var key in map) {
				var pair = map[key];
				if (test_function(pair.value, pair.key))
					return pair.value;
			}
		},

		// ** Queries

		// Returns true only if the set is empty

		isEmpty: function () {
			var count = 0;
			for (var key in this.map)
				count += 1;
			return count == 0;
		},

		// Returns the number of elements in the set

		size: function () {
			var count = 0;
			for (var key in this.map)
				count += 1;
			return count;
		},

		// Returns a Set of keys

		keys: function () {
			var map = this.map;
			var result = [];
			for (var key in map)
				result.push(map[key].key);
			return new Set(result);
		},

		// Returns a List of values

		values: function () {
			var map = this.map;
			var result = [];
			for (var key in map)
				result.push(map[key].value);
			return new Set(result);
		},

		// Returns a list of {key, value} association objects containing each
		// key, value pair in the Map.

		associations: function () {
			var map = this.map;
			var result = [];
			for (var key in map)
				result.push(map[key]);
			return new List(result);
		},

		// ** String Representation

		// Returns a string representation of this List.

		toString: function () {
			var result = [];
			this.each(function (value, key) {
				if (typeof value != "string")
					result.push(key + ": " + value.toString());
				else
					result.push(key + ': "' + value + '"');
			});
			return "new Map({" + result.join(", ") + "})";
		}
	});

	// evaluate the exported namespace
	eval(this.exports);
};