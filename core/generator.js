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

    var generator = new base2.Package(this, {
        name:    "generator",
        version: "0.1",
        imports: "",
        exports: "element,tag,div,span,table,tr,th,td,p,a,br,form,"
        	   + "input,textarea,select,option,img,style"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // Given a map from attribue names to values, returns a string in HTML
    // format " name1=value1 name2=value2..". If attributes has no attributes,
    // returns an empty string. Note that the special name 'style' may have
    // an object value, if so it is processed as specified in the 'style'
    // function below.

    function attributes(attribute_map) {
        if (typeof attribute_map == "undefined" || attribute_map == null)
            return "";
        var results = new Array();
        for (var name in attribute_map) {
        	if (name == 'style')
        		results.push("style=\"" + style(attribute_map[name]) + "\"");
        	else
            	results.push(name + "=\"" + attribute_map[name].toString() + "\"");
        }
        if (results.length == 0)
            return "";
        return " " + results.join(" ");
    }
    
    // Converts a CSS attribute value to a string. Numbers are assumed to be in
    // pixels ('px'). Each value in an array is converted and the result joined
    // with a blank character.
    
    function styleValue(value) {
    	if (typeof value == 'number')
    		return value + 'px';
    	else if (typeof(value) == 'object' && typeof(value.length) == 'number') {
    		var collect = [];
    		for (var index = 0; index < value.length; index += 1)
    			collect.push(styleValue(value[index]));
    		return collect.join(' ');
    	}
    	else
    		return value.toString();
    }
    
    // Converts an identified to a style name by replacing all '_' characters 
    // with a dash '-'.
    
    function styleName(name) {
    	return name.replace(/_/g, '-');
    }
    
    // Handle object representation of 'style' attribute by creating a CSS
    // string. In general fields become css attributes. Numeric values will
    // have 'px' appended. Array values are joined with a ' ' separator.
    
    function style(style_object) {
    	if (typeof(style_object) == 'string')
    		return style_object;
    	var out = [];
    	for (var field in style_object) {
    		var value = styleValue(style_object[field]);
    		out.push(styleName(field) + ':' + value);
    	}
    	return out.join(';');
    }

    // Flatten a nested array, skipping null elements. If the argument
    // is undefined or null, returns an empty array.

    function flatten(items) {

        function flattenInto(items, results) {
            for (var index = 0; index < items.length; index += 1) {
                var an_item = items[index];
                if (an_item instanceof Array)
                    flattenInto(an_item, results);
                else if (an_item != null)
                    results.push(an_item);
            }
        }

        if (typeof items == "undefined" || items == null)
            return;

        var results = new Array();
        flattenInto(items, results);
        return results;
    }
    
    // Constructs an HTML element <name attribute1=value1..></name> inserting
    // all strings in contents into the the element.

    function element(name, attribute_map, contents) {
        if (typeof contents == "undefined" || contents.length == 0)
            return "<" + name +  attributes(attribute_map) + "/>";

        var results = new Array();
        results.push("<" + name + attributes(attribute_map) + ">");
        contents = flatten(contents);
        for (var index = 0; index <= contents.length; index += 1)
            results.push(contents[index]);
        results.push("</" + name + ">");
        return results.join("");
    }

    // Constructs an HTML element <name attribute1=value1..></name> inserting
    // any additional arguments as contents of the element.

    function tag(name, attribute_map) {
        var contents = new Array();
        for (var index = 2; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element(name, attribute_map, contents);
    }

    // Constructs a div HTML element <div attribute1=value1..></div> inserting
    // any additional arguments as contents of the element.

    function div(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("div", attribute_map, contents);
    }

    // Constructs a span HTML element <span attribute1=value1..></span>
    // inserting any additional arguments as contents of the element.

    function span(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("span", attribute_map, contents);
    }

    // Constructs a table HTML element <table attribute1=value1..></table> inserting
    // any additional arguments as contents of the element.

    function table(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("table", attribute_map, contents);
    }

    // Constructs a tr HTML element <tr attribute1=value1..></tr> inserting
    // any additional arguments as contents of the element.

    function tr(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("tr", attribute_map, contents);
    }

    // Constructs a th HTML element <th attribute1=value1..></th> inserting
    // any additional arguments as contents of the element.

    function th(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("th", attribute_map, contents);
    }

    // Constructs a td HTML element <td attribute1=value1..></td> inserting
    // any additional arguments as contents of the element.

    function td(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("td", attribute_map, contents);
    }

    // Constructs a p HTML element <p attribute1=value1..></p> inserting
    // any additional arguments as contents of the element.

    function p(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("p", attribute_map, contents);
    }

    // Constructs a 'a' HTML element <a attribute1=value1..></a> inserting
    // any additional arguments as contents of the element.

    function a(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("a", attribute_map, contents);
    }

    // Constructs a br HTML element <br/>.

    function br() {
        if (arguments.length > 0)
            throw new Error('Invalid <br/>');
        return element("br");
    }

    // Constructs a form HTML element <form attribute1=value1..></form> inserting
    // any additional arguments as contents of the element.

    function form(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("form", attribute_map, contents);
    }

    // Constructs a input HTML element <input attribute1=value1..></input> inserting
    // any additional arguments as contents of the element.

    function input(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("input", attribute_map, contents);
    }

    // Constructs a textarea HTML element <textarea attribute1=value1..></textarea> inserting
    // any additional arguments as contents of the element.

    function textarea(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("textarea", attribute_map, contents);
    }

    // Constructs a select HTML element <select attribute1=value1..></select>
    // inserting any additional arguments as contents of the element.

    function select(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("select", attribute_map, contents);
    }

    // Constructs an option HTML element <choice attribute1=value1..></choice>
    // inserting any additional arguments as contents of the element.

    function option(attribute_map) {
        var contents = new Array();
        for (var index = 1; index < arguments.length; index += 1)
            contents.push(arguments[index]);
        return element("option", attribute_map, contents);
    }

    // Constructs an img HTML element <img attribute1=value1../>

    function img(attribute_map) {
        var contents = new Array();
        return element("img", attribute_map);
    }

    // **** Evaluate the exported namespace
    eval(this.exports);
};



