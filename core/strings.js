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

	var strings = new base2.Package(this, {
		name:	 "strings",
		version: "0.1",
		imports: "",
		exports: "trim,pad,padLeft,repeated"
	});

	// evaluate the imported namespace
	eval(this.imports);

	// Removes whitespace from the beginning and end of a string

	function trim(text) {
		matches = text.match(/\W*[^\W]+/g)
		if (matches == null)
			return "";
		var left_match = matches[0].match(/\W*(.*)/);
		if (left_match != null)
			matches[1] = left_match[1];
		return matches.join("");
	}

	// Adds additional pad characters (default blank) to the right of the
	// string to extend it to a specified length.

	function pad(text, width, pad_char) {
		if (typeof pad_char == "undefined")
			pad_char = ' ';
		var parts = [text];
		for (var count = text.length; count < width; count += 1)
			parts.push(pad_char);
		return parts.join("");
	}

	// Adds additional pad characters (default blank) to the left of the
	// string to extend it to a specified length.

	function padLeft(text, width, pad_char) {
		if (typeof pad_char == "undefined")
			pad_char = ' ';
		var parts = new Array();
		for (var count = text.length; count < width; count += 1)
			parts.push(pad_char);
		parts.push(text);
		return parts.join("");
	}

	// Returns a repeated string

	function repeated(text, count) {
		var parts = new Array();
		for (var index = 0; index < count; index += 1)
			parts.push(text);
		return parts.join("");
	}

	// evaluate the exported namespace
	eval(this.exports);
};