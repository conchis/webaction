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
 
(function () {

module("observers_test.js");

var Broadcaster = base2.observers.Broadcaster;

test("make broadcaster", function () {
	var b = new Broadcaster();
	var caught = false;
	b.addListener("onChange", function () { caught = true; });
	ok(!caught, "!caught");
	b.broadcast("onChange");
	ok(caught, "caught");
});

test("method_call", function () {
	var caught = false;

	function TestClass() { }

	function onChange() {
		caught = true;
	}

	TestClass.prototype = { onChange: onChange };

	var listener = new TestClass();
	var b = new Broadcaster();
	b.addListener("onChange", listener);

	ok(!caught, "!caught");

	b.broadcast("onChange");
	ok(caught, "caught");
});

test("named_method_call", function () {
	var caught = false;

	function TestClass() { }

	function respond() {
		caught = true;
	}

	TestClass.prototype = { respond: respond };

	var listener = new TestClass();
	var b = new Broadcaster();
	b.addListener("onChange", listener, "respond");

	ok(!caught, "!caught");

	b.broadcast("onChange");
	ok(caught, "caught");
});

test("has listener / remove listener", function () {
	var caught = false;
	var fn = function () { caught = true; };

	var b = new Broadcaster();
	b.addListener("onChange", fn);

	ok(b.hasListener("onChange", fn), "has");

	b.removeListener("onChange", fn);

	ok(!b.hasListener("onChange", fn), "!has");
});

})();