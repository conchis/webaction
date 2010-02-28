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

    var trees = new base2.Package(this, {
        name:    "trees",
        version: "0.1",
        imports: "paths,observers",
        exports: "TreeNode"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // Class of generic, named, ordered tree nodes with properties.
    //
    // TreeNodes are observers.Broadcatser instances and so may transmit
    // broadcasts to listeners. Listeners at any node will receive
    // broadcasts from any node in the node's subtree.
    //
    // Tree nodes broadcast changes with the messages:
    // - added(new_node)
    // - removed(removed_node, parent)
    // - changed(name, value, prior_value)
    //
    // The next() and previous() methods allow client code to step through
    // nodes in forward or reverse in-order traversal. Because thes are
    // applied to a node, as long as that node is vald, the tree may be
    // changed while these methods are in use.
    //
    // Note: TreeNode supports the interface needed to allow a node to be
    // wrapped by a ListFilter insance (sse list_models).  The ListFilter can
    // be used as a filtered and sorted view of the node's children.

    var TreeNode = Broadcaster.extend({

        // TreeNode constructor

        constructor: function (name, properties) {
            this.base();

			// Name and map from name -> child
            this.name = name;
            this.child_map = {};

            // Parent and children
            this.parent = null;
            this.children = [];

            // Position
            this.index = -1;

            // Properties
            this.properties = {};
            this.visible = {};
            if (typeof(properties) == "object")
            	this.reset(properties);

            // Add children if any..
			for (var index = 2; index < arguments.length; index += 1)
				this.addChild(arguments[index]);
        },

        // ** Add Child Nodes

        // Adds a node as a child to this node. If the child has a parent it
        // is removed from that parent before being added to this node.

        addChild: function (child, index) {
        	if (typeof child.name != "string")
        		throw new Error("Node must be named");
            var children = this.children;

            // If no index specified, add at end
            if (typeof index == "undefined")
                    index = children.length;

            // Remove any child with the same name
            var child_map = this.child_map;
            var name = child.name;
            var prior_child = child_map[name];
            if (prior_child && prior_child !== child)
            	prior_child.remove();

            // If the new child's parent is this node, and the index is
            // before the specified index, decrement the specified index
            if (child.parent === this && child.index < index)
                    index -= 1;

            // Remove child from old parent if any
            if (child.parent != null)
                child.remove();

            // Add the child to this node
            children.splice(index, 0, child);
            child_map[name] = child;

            // Update indexes
            for (var child_index = 0; child_index < children.length;
            		child_index += 1)
            	children[child_index].index = child_index;

            // Tell the child node that it has been added
            child.addedTo(this);

            // Broadcast change
            this.broadcast("added", child.index, child);
        },

        // Called when this node is added to a parent node

        addedTo: function (parent) {
            this.parent = parent;
        },

        // Adds a new nodes to create a node with the specified path relative to
        // its parent node.

	  	addNode: function(path) {
	   		var tokens = paths.split(path);
	   		var examine = this;
	   		for (var index = 0; index < tokens.length; index += 1) {
	   			var name = tokens[index];
	   			if (name == "")
	   				examine = examine.getRoot();
	   			else {
	   				var next = examine.getChildNamed(name);
	   				if (next == null) {
	   					next = this.makeNode(name);
	   					examine.addChild(next);
	   				}
	   				examine = next;
	   			}
	   		}
	   		return examine;
	   	},

	   	// Creates a new node with a specified name. Override this to change the
	   	// behavior of addNode in a subclass.

	   	makeNode: function (name) {
	   		return new TreeNode(name);
	   	},

        // **** Removal

        // Removes a specified child node

        removeChild: function (child) {

            // Find location of node
            var children = this.children;
            var index = children.indexOf(child);

            // If node found in child array
            if (index >= 0) {
                // Remove child node from array and child map
                children.splice(index, 1);
                delete this.child_map[child.name];

                // Update index
                for (var child_index = index; child_index < children.length; child_index += 1)
                        children[child_index].index = child_index;

                // Tell child it has been removed
                child.removedFrom(this);

                // Broadcast change
                this.broadcast("removed", child.index, child, this);
            }
        },

        // Called when this node is removed from its parent.

        removedFrom: function (parent) {
            if (this.parent == parent) {
                this.parent = null;
                this.index = -1;
            }
        },

        // Removes this node from its parent node

        remove: function () {
            if (this.parent != null)
                this.parent.removeChild(this);
        },

        // ** Navigation

        // Returns the root of the tree

        getRoot: function ()
        {
            var examine = this;
            while (examine.parent)
                examine = examine.parent;
            return examine;
        },

        // Return a child by name or null if not found.

        getChildNamed: function (name) {
            var node = this.child_map[name];
            if (typeof node == "undefined")
                return null;
            return node;
        },

        // Get the node at a specified path

        getNode: function (path) {
            var tokens = paths.split(path);
            var examine = this;
            for (var index = 0; index < tokens.length; index += 1) {
                var name = tokens[index];
                if (name == "")
                    examine = this.getRoot();
                else
                    examine = examine.getChildNamed(name);
                if (examine == null)
                    return null;
            }
            return examine;
        },

        // Returns a child node by index. Note that the name 'get' is consistant with
        // ListFilter conventions.

        get: function (index) {
            return this.children[index];
        },

        // Returns the number of children. Note that the name 'size' is consistant with
        // ListFilter conventions.

        size: function () {
            return this.children.length;
        },

        // Returns the index of an item. In a TreeNode this is just the index.
        // ListFilter instances may hide or re-order items so this provides a
        // stable id number associated with each child.

        getItemIndex: function (index) {
            return index;
        },

        // Applies a closure to each child node.

        each: function (closure) {
            var children = this.children;
            for (var index = 0; index < children.length; index += 1) {
                closure(children[index], index);
            }
        },


        // Applies a function closure to each node in the subtree rooted in
        // this node in in-order order.

        eachNode: function (closure) {
            var examine = this;
            while (examine != null) {
                closure(examine);
                examine = examine.next();
            }
        },

        // ** Path

        // Returns the path of this node

        getPath: function () {
            var examine = this;
            var names = [];
            for (; examine != null; examine = examine.parent)
                names.push(examine.name);
            return paths.join.apply(null, names.reverse());
        },

        // Sets the base path of a node, used to determine the absolute path.

        setBasePath: function (base_path) {
        	this.base_path = base_path;
        },

        // Return the node's path relative to a specified base path

        getAbsolutePath: function () {
        	var base_path = this.base_path;
        	if (typeof base_path == "string")
        		return base_path;
        	var parent = this.parent;
        	if (parent != null)
        		return paths.join(parent.getAbsolutePath(), this.name);
        	return this.name;
        },

        // ** Pre-Order Traversal

        // Returns the next node in an pre-order traversal of the tree or null
        // if not found.

        next: function () {
            // If this node has children, return first child
            var children = this.children;
            if (children.length > 0)
                return children[0];

            // Look for next sibling of some ancestor
            var node = this;
            var ancestor = this.parent;
            while (ancestor != null) {
                var after = ancestor.childAfter(node);
                if (after != null)
                    return after;
                node = ancestor;
                ancestor = ancestor.parent;
            }

            // Finished traversing tree
            return null;
        },

        // Returns the previous node in an pre-order traversal of the tree
        // or null if not found.

        previous: function () {
            // Look for last sibling of parent
            var parent = this.parent;
            if (parent != null) {
                var before = parent.childBefore(this);
                if (before != null)
                    return before.lastDescendant();
            }

            // None found, return parent
            return this.parent;
        },

        // Returns the first child after a specified sibling. Returns null
        // if none.

        childAfter: function (sibling) {
            var children = this.children;
            var index = sibling.index;
            if (index == children.length - 1)
                return null;
            return children[index + 1];
        },

        // Returns the child before a specified sibling or null if none.

        childBefore: function (sibling) {
            var children = this.children;
            var index = sibling.index;
            if (index == 0)
                return null;
            return children[index - 1];
        },

        // Returns the last descendant of this node. (That is the last
        // child of the last child etc.) If no children, returns this.

        lastDescendant: function () {
            // If no children, return this
            var children = this.children;
            if (children.length == 0)
                return this;

            // Find last child of this node
            var last_child = children[children.length - 1];

            // Find last descendant of last child
            var descendant = last_child.lastDescendant();
            if (descendant != null)
                return descendant;

            // If no further descendants, return last child
            return last_child;
        },

        // ** Observers

        // Broadcasts a message to all listeners on all ancestor nodes.

        sendBroadcast: function (selector, argument_list, source)
        {
            this.base(selector, argument_list, source);
            if (this.parent != null)
                this.parent.sendBroadcast(selector, argument_list, source);
        },

        // ** Properties

        // Sets the vaue of a property. If the property name is not inherited,
        // the property is also set on the node itself (allowing for
        // more convienent access.) A message is broadcast to all listeners.

        setProperty: function (name, value) {
            var prior_value = this.properties[name];
            if (typeof(prior_value) != "undefined" &&
            		prior_value == value)
            	return;
            this.properties[name] = value;
            if (typeof(this[name]) == "undefined" || this.visible[name]) {
                this.visible[name] = true;
                this[name] = value;
            }

            this.broadcast("changed", this.index, name, value, prior_value);
        },

        // Returns the value of a specified property. If the the property has
        // a missing or null value and the caller provides a default value,
        // the default is returned instead.

        getProperty: function (name, default_value) {
            var value = this.properties[name];
            if ((typeof value == "undefined" || value == null)
                    && typeof default_value != "undefined")
                value = default_value;
            return value;
        },

        // Sets all non-inherited node attribtes to corresponding property
        // values.

        revert: function () {
            var properties = this.properties;
            for (var name in properties) {
                if (this.visible[name])
                    this[name] = properties[name];
            }
        },

        // Sets all properties from attributes if they have non-inheritted
        // values.

        commit: function (names) {
            var properties = this.properties;
            var visible = this.visible;

            // If names is not supplied, use the names of all visible properties
            if (typeof names == "undefined") {
            	names = [];
            	for (name in this.visible)
            		names.push(name);
            }

            // Set all properties with specified names
            for (var index = 0; index < names.length; index += 1) {
            	var name = names[index];
				visible[name] = true;
            	this.setProperty(name, this[name]);
            }

			// Revert any other changes
            this.revert();
        },

        // Initializes fields and properties from another node. Note that
        // while this changes property values and marks names visible, it
        // does not broadcast changes so should be used only for
        // (re)initialization.

        reset: function (properties) {

            // Remove any visible values
            var visible = this.visible;
            for (var name in visible)
                delete this[name];

            // Empty properties and visible maps
            this.properties = {};
            this.visible = {};

            // Copy properties to this node
            for (var name in properties) {
                var value = properties[name];
                this.properties[name] = value;
                if (typeof this[name] == "undefined") {
                    this.visible[name] = true;
                    this[name] = value;
                }
            }
        },

        // Compares the node's visible attributes to the property values.
        // Returns true if any are different.

        isChanged: function () {
        	var properties = this.properties;
        	var visible = this.visible;
        	for (name in visible) {
        		if (properties[name] != this[name])
        			return true;
        	}
        	return false;
        },

        // Returns an Object containing only the new values of changed
        // properties.

        getChanges: function () {
            var changes = new Object();
        	var properties = this.properties;
        	var visible = this.visible;
        	for (name in visible) {
        		if (properties[name] != this[name])
        			changes[name] = this[name];
        	}
            return changes;
        },

        // ** String Representation

        // Name of node class. Define this in subclasses

        class_name: 'TreeNode',

        // Returns a string representation of this node

        toString: function () {
       		var parts = [this.name];
            var children = this.children;
            for (var index = 0; index < children.length; index += 1)
            	parts.push(children[index].toString());
            return this.class_name + "(" + parts.join(', ') + ")";
        }
    });

    // **** Evaluate the exported namespace
    eval(this.exports);
};