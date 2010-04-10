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

    var observers = new base2.Package(this, {
        name:    "observers",
        version: "0.1",
        imports: "",
        exports: "Broadcaster, BroadcasterMixin"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // BroadcasterMixin is a mixin (Module) that adds functions to a class to
    // implement the observer design pattern.

    var BroadcasterMixin = base2.Module.extend({

        // Adds a listener associated with a specified selector and listener
        // method. The listener argument may be either a function to be called
        // when a broadcast is received, or an object. If the listener argument
        // is an object, a broadcast will cause the named method to be called
        // on the object. If no method_name is specified, a method with the same
        // same as the selector will be called.

        addListener: function (broadcaster, selector, listener, method_name) {
        	// Get listener map, if necessary create it
        	var listener_map = broadcaster.listener_map;
        	if (typeof(listener_map) == "undefined") {
        		listener_map = new Object();
        		broadcaster.listener_map = listener_map;
        	}

			// Get listeners array for the selector. If none found,
			// create a new one.
            var listeners = listener_map[selector];
            if (typeof(listeners) == "undefined") {
                listeners = new Array();
                listener_map[selector] = listeners;
            }

            // Add listener function
            if (typeof(listener) == "function")
                listeners.push(listener);
            else {
            	if (typeof(method_name) == "undefined")
            		method_name = selector;
                listeners.push(function () {
                	listener[method_name].apply(listener, arguments);
                });
            }
        },

        // Removes a specified listener. Note this only works for
        // functions.

        removeListener: function (broadcaster, selector, listener) {
        	// Get listener map, if not found, return
        	var listener_map = broadcaster.listener_map;
        	if (typeof(listener_map) == "undefined")
        		return false;

            var listeners = listener_map[selector];
            if (listeners == null)
                return false;

            var index = listeners.indexOf(listener);
            if (index < 0) return false;

            listeners.splice(index, 1);
            return true;
        },

        // Tests if the broadcaster has a specified listener.

        hasListener: function (broadcaster, selector, listener) {
         	// Get listener map, if not found, return
        	var listener_map = broadcaster.listener_map;
        	if (typeof(listener_map) == "undefined")
        		return false;

        	// Get listeners for selector
            var listeners = listener_map[selector];
            if (listeners == null)
                return false;

			// Find listener in array
            return listeners.indexOf(listener) >= 0;
        },

        // Broadcasts a message to all listeners

        broadcast: function (broadcaster, selector) { // Other arguments
            var argument_list = new Array();
            for (var index = 2; index < arguments.length; index += 1)
                argument_list.push(arguments[index]);
            argument_list.push(broadcaster);
            broadcaster.sendBroadcast(selector, argument_list);
        },

        // Broadcasts a message to all listeners

        sendBroadcast: function (broadcaster, selector, argument_list, source) {
         	// Get listener map, if not found, return
        	var listener_map = broadcaster.listener_map;
        	if (typeof(listener_map) == "undefined") return;

        	// Set default source
            if (typeof(source) == "undefined")
                source = broadcaster;

            // Inform listeners for the specified selector
            var listeners = listener_map[selector];
            if (listeners == null) return;
            for (var index in listeners)
                listeners[index].apply(null, argument_list);
        }

    });

    // Class of objects that broadcast messages to listeners. This implements
    // the classic observer design pattern with function closures. Most of the

    var Broadcaster = base2.Base.extend({});
    Broadcaster.implement(BroadcasterMixin);

    // evaluate the exported namespace
    eval(this.exports);
};


