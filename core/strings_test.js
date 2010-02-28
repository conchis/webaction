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
 
 (function () {

	module("string_test.js");

	eval(base2.strings.namespace);

	test("trim", function () {
		equals(trim("hello"), "hello");
		equals(trim("    hello  "), "hello");
		equals(trim("    hello world "), "hello world");
		equals(trim("\thello world\n\n"), "hello world");
	});

	test("pad", function () {
		equals(pad("hello", 10), "hello     ");
		equals(pad("hello", 4), "hello");
		equals(pad("hello", 10, "*"), "hello*****");
	});

	test("padLeft", function () {
		equals(padLeft("hello", 10), "     hello");
		equals(padLeft("hello", 4), "hello");
		equals(padLeft("hello", 10, "*"), "*****hello");
	});

	test("repeated", function () {
		equals(repeated("-", 10), "----------");
		equals(repeated("-*", 3) + "-", "-*-*-*-");
	});

})();