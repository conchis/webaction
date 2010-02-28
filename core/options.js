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

	var options = new base2.Package(this, {
		name:	 "options",
		version: "0.1",
		imports: "",
		exports: "OptionsMixin,Options"
	});

	// evaluate the imported namespace
	eval(this.imports);

	// Mixin for classes that support initialization options with defaults.

	var OptionsMixin = base2.Module.extend({

		// Sets fields on the options object that will be used to look for
        // specific options via the option method (below). Note this merges
        // new options into any already set.

		setOptions: function (self, new_options) {
            var options = self.options;
            if (typeof(options) == "undefined") {
                options = {};
                self.options = options;
            }
            for (var name in new_options)
                options[name] = new_options[name];
		},

    	// Returns a named option's value or a default value if the option is
    	// not found. Returns null if the option has no value and no default is
    	// provided.

    	option: function (self, name, default_value) {
    		// If no options, return default value or null
    		if (typeof self.options == "undefined") {
    			if (typeof default_value != "undefined")
    				return default_value;
    			return null;
    		}

    		// If options value, return value
    		var value = self.options[name];
    		if (typeof value != "undefined")
    			return value;

    		// Otherwise return default value or null
    		if (typeof default_value != "undefined")
    			return default_value;
			return null;
    	}

	});

    // Class of objects that support initialization options with defaults.

    var Options = base2.Base.extend({

    	// Constructs an Options object.

    	constructor: function (options, defaults) {
    		this.setOptions(options, defaults);
    	}
    });
    Options.implement(OptionsMixin);

	// evaluate the exported namespace
	eval(this.exports);
};