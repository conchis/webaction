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

module("options_test.js");

eval(base2.options.namespace);

test("test_options", function () {
	var options = new Options({x: 10, y: 2});

	equals(options.option('x', 0), 10);
	equals(options.option('y', 0), 2);
	equals(options.option('z', 0), 0);
	equals(options.option('height'), null);
});

test("test_defaults", function () {
	var options = new Options({color: 'red', z: 22});
    options.setOptions({x: 3, y: 4});

	equals(options.option('x'), 3);
	equals(options.option('y'), 4);
	equals(options.option('z'), 22);
    equals(options.option('color'), 'red');
});

})();