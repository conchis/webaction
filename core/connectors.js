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

    var connectors = new base2.Package(this, {
        name:    "connectors",
        version: "0.1",
        imports: "paths,trees,options,observers",
        exports: "Connector,Node"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // A connector manages a connection between an application and the nodes controller.

    var Connector = base2.Base.extend({

    	// Constructs the Connector

    	constructor: function (url, options) {
    		this.base(options);
            // Request queue
            this.requests = [];

            // Server information
    		this.server_url = url;

            // Node tree information
    		var root_node = new Node('/');
    		root_node.setConnector(this);
    		this.root_node = root_node;

            // User information (will be loaded from server)
            this.user = null;
            this.loadUser();
        },

        // *** Requests

        // Sends a request to the server server. Requests are placed in a queue and executed
        // in sequence so as to insure consistancy. Requests complete in the order
        // they are requested. The argument 'options' is the same as jQuery.ajax options.

        request: function (options) {
            var request = new Request(options);
            request.addedTo(this);
            this.requests.push(request);
            this.next();
        },

        // Start next request in the queue if any.

        next: function () {
            // If no requests, return
            var requests = this.requests;
            if (requests.length == 0) return;

            // Deque and start next request
            var next_request = requests[0];
            requests.splice(0, 1);

            // Start request
            next_request.start();
        },

        // *** User Information

        loadUser: function (continuation) {
            if (this.user != null && continuation)
                continuation(this.user);

            var url = paths.join(this.server_url, 'whoami');
            var self = this;
            this.request({url: url, success: function (user) {
                self.user = user;
                if (continuation)
                    continuation(user);
            }});
        },

        // *** Nodes

    	// Loads a node at a specified path (if not already loaded).
    	// Calls continuation on the specified node when loaded, or
    	// immediately if already available.

    	load: function (path, continuation) {
    		var node = this.root_node.addNode(path);
    		if (node.is_loaded)
    			continuation(node);
    		else {
    			var url = paths.join(this.server_url, path);
    			jQuery.get(url, {}, function (json) {
    				var node_data = eval('(' + json + ')');
    				node.initializeFrom(node_data);
   					continuation(node);
    			});
    		}
    	},

    	// Finds and loads all visible nodes under a specified root node within
    	// a maximum depth. Calls continuation on the specified root when
    	// complete.

    	find: function (path, depth, continuation) {
    	},

    	// Adds and returns a new node with a specified path. Note that this
    	// does not save the node on the server until the save method is called.

    	create: function (path) {
    		var node = this.root_node.addNode(path);
    		node.is_new = true;
    		return node;
    	},

    	// Saves all changed nodes and creates any nodes added to the tree.

    	save: function (continuation) {
    		var self = this;
    		this.root_node.eachNode(function (node) {
    			if (node.isChanged())
    				self.update(node);
    		});
    	},

    	update: function (node) {
    		var url = paths.join(this.server_url, node.getPath());
            var changes = JSONstring.make(node.getChanges());
            jQuery.ajax({type: "PUT", url: url, data: {properties: changes}});
            node.commit();
    	}
    });

    // A Node is a TreeNode that represents data in the content tree
    // on the connected server.

    var Node = TreeNode.extend({

    	// Class name for output
    	class_name: "Node",

    	// Constructs a new Node

    	constructor: function (name, properties) {
    		this.base(name, properties);

    		// Node is not loaded
    		this.is_loaded = false;

    		// Node is not new
    		this.is_new = false;

    		// Add children if any..
			for (var index = 2; index < arguments.length; index += 1)
				this.addChild(arguments[index]);
    	},

    	// Sets the connector in this and all descendant nodes

    	setConnector: function (connector) {
			this.eachNode(function (node) {
				node.connector = connector;
			});
    	},

    	// Creates a new node with a specified name.

    	makeNode: function (name) {
    		return new Node(name);
    	},

        // Called when this node is added to a parent node. Sets the connector
        // in each child node.

        addedTo: function (parent) {
        	this.base(parent);
        	var connector = parent.connector;
        	if (connector)
        		this.setConnector(connector);
        },

        // Initialize this node from node data

        initializeFrom: function (node_data) {
			this.class_name = node_data['class'];
			this.uuid       = node_data.uuid;
            this.tags       = node_data.tags;
            this.permission = node_data.permission;

			this.setProperty('title', node_data.title);

			// Initialize content
			var content = node_data.content;
			for (var name in content)
				this.setProperty(name, content[name]);

			// Initialize children
			this.initializeChildren(node_data.children);

			this.is_loaded = true;
        },

        initializeChildren: function (children) {
        	for (var index = 0; index < children.length; index += 1) {
        		var child_data = children[index];
        		var child = this.addNode(child_data.name);
        		if (child.is_loaded)
        			continue;
				child.class_name = child_data['class'];
				child.uuid  = child_data.uuid;
                child.tags  = child_data.tags;
                child.count = child_data.count;
				child.setProperty('title', child_data.title);

                var content = child_data.content;
                for (var name in content)
                    child.setProperty(name, content[name]);
        	}
        }

    });

    // Queued request

    var Request = Options.extend({

        // Create a Request object

        constructor: function (options) {
            this.base(options);

            // Defaults
            options.type     = this.option("type", "GET");
            options.dataType = this.option("dataType", "json");

            // Save callbacks
            this.on_success = this.option('success', null);
            this.on_error = this.option('error', null);

            // Mark not started, not complete
            this.is_started = false;
            this.is_complete = false;
        },

        // Called when this request is added to a connector

        addedTo: function (connector) {
            this.connector = connector;
        },

        // Initiate request to server

        start: function () {
            var self = this;
            this.options.success = function (result, status) {
                self.onSuccess(result, status);
            };
            this.options.error = function (request, status) {
                self.onError(request, status);
            };
            this.is_started = true;
            jQuery.ajax(this.options);

        },

        // Called when success occurs. Reports completion to the connector,
        // and calls a success continuation if any.

        onSuccess: function (result, status) {
            this.is_complete = true;
            this.connector.next();
            var on_success = this.on_success;
            if (on_success != null)
                on_success(result, status);
        },

        // Called when an error occurs. Reports completion to the connector,
        // and calls an error continuation if any.

        onError: function (request, status) {
            this.is_complete = true;
            this.connector.next();
            var on_error = this.on_error;
            if (on_error != null)
                on_error(request, status);
        }

    });
    Request.implement(OptionsMixin);

    // **** Evaluate the exported namespace
    eval(this.exports);
};