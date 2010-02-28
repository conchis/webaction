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

	var models = new base2.Package(this, {
		name:	 "models",
		version: "0.1",
		imports: "observers,collections",
		exports: "ValueModel,ListModel,SetModel,MapModel"
	});

	// evaluate the imported namespace
	eval(this.imports);

	// A ValueModel holds a single value and broadcasts to listeners when
	// that value is changed.

	var ValueModel = Broadcaster.extend({

		// Initializes the ValueModel with a specified value or null.

		constructor: function (initial_value) {
			this.base();
			this.value = null;
			if (typeof initial_value != "undefined")
				this.value = initial_value;
		},

		// Sets the model's value. Broadcasts the change to listeners.

		set: function (new_value) {
			// If no change, do not broadcast
			var prior_value = this.value;
			if (new_value == prior_value) return;

			// Replace value and broadcast to listeners
			this.value = new_value;
			this.broadcast("value_changed", new_value, prior_value);
		}

	});

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
			this.base(index);
			this.broadcast("removed", index, prior_value);
		}
	});
	ListModel.implement(BroadcasterMixin);

	// A SetModel is a Set that broadcasts to listeners when any change
	// is made.

	var SetModel = Set.extend({

		// Adds an element to the set.  If the element is not already a member
		// of the set, broadcasts informs listeners of the addition.

		add: function (value) {
			if (this.contains(value)) return;
			this.base(value);
			this.broadcast("added", value);
		},

		// Removes an element from the set. If the element removed
		// broadcasts the change to listeners.

		remove: function (value) {
			if (!this.contains(value)) return;
			this.base(value);
			this.broadcast("removed", value);
		}
	});
	SetModel.implement(BroadcasterMixin);

	// A MapModel is a Map that broadcasts to listeners when any change
	// is made.

	var MapModel = Map.extend({

		// Sets a value in the map. If the value is new or if the value
		// is changed, broadcasts the change to listeners.

		set: function (key, value) {
			var prior_value = this.get(key);
			if (prior_value == value) return;
			this.base(key, value);
			this.broadcast("changed", key, value, prior_value);
		},

		// Removes a value from the map associated with a specified key.
		// If the value is removed, broadcasts the change to listeners.

		remove: function (key) {
			if (!this.contains(key)) return;
			var prior_value = this.get(key);
			this.base(key);
			this.broadcast("removed", key, prior_value);
		}
	});
	MapModel.implement(BroadcasterMixin);

	// evaluate the exported namespace
	eval(this.exports);
};