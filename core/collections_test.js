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

module("collections_test.js");

eval(base2.collections.namespace);

test("make_list", function () {
	var list = new List();
	equals(list.size(), 0);

	list.add(1);
	list.add(2);
	list.add(3);

	equals(list.size(), 3);
});

test("list_add", function () {
	var list = new List();
	list.add(1);
	list.add(2);
	list.add(3);
	equals(list.size(), 3);
	equals(list.get(0), 1);
	equals(list.get(1), 2);
	equals(list.get(2), 3);
});

test("list_set", function () {
	var list = new List([0, 0, 0]);
	list.set(1, 22);
	list.set(2, 900);
	equals(list.get(0), 0);
	equals(list.get(1), 22);
	equals(list.get(2), 900);
});

test("list_remove", function () {
	var list = new List([2, 4, 99, 6, 99, 8]);
	list.remove(2);
	list.remove(3);
	equals(list.size(), 4);
	equals(list.get(0), 2);
	equals(list.get(1), 4);
	equals(list.get(2), 6);
	equals(list.get(3), 8);
});

test("list_index_of", function () {
	var list = new List([2, 4, 6, 8, 10]);
	equals(list.indexOf(2), 0);
	equals(list.indexOf(6), 2);
	equals(list.indexOf(10), 4);
});

test("list_contains", function () {
	var list = new List([2, 4, 6, 8, 10]);
	equals(list.contains(2), true);
	equals(list.contains(4), true);
	equals(list.contains(10), true);
	equals(list.contains(1), false);
	equals(list.contains(3), false);
	equals(list.contains(9), false);
});

test("list_each", function () {
	var list = new List([2, 4, 6, 8, 10]);
	var count = 0;
	list.each(function (item, index) {
		equals(index, count);
		equals(item, (count + 1) * 2);
		count += 1;
	});
});

test("list_collect", function () {
	var list = new List([1, 2, 3, 4]);
	var changed = list.collect(function (item, index) {
		equals(item - 1, index);
		return item * 2;
	});
	equals(changed.size(), 4);
	equals(changed.get(0), 2);
	equals(changed.get(1), 4);
	equals(changed.get(2), 6);
	equals(changed.get(3), 8);
});

test("list_select", function () {
	var list = new List([1, 2, 3, 4, 5, 6, 7, 8]);
	var evens = list.select(function (item, index) {
		equals(item, index + 1);
		return (item & 1) == 0
	});
	equals(evens.size(), 4);
	equals(evens.get(0), 2);
	equals(evens.get(1), 4);
	equals(evens.get(2), 6);
	equals(evens.get(3), 8);
});

test("list_find", function () {
	var list = new List([1, 2, 3, 4, 5, 6, 7, 8]);

	var eql_test = function (value) {
		return function (item, index) {
			return item == value;
		};
	};

	equals(list.find(eql_test(1)), 1);
	equals(list.find(eql_test(2)), 2);
	equals(list.find(eql_test(3)), 3);
	equals(list.find(eql_test(4)), 4);
});

test("list_slice", function () {
	var list = new List([1, 2, 3, 4, 5, 6, 7, 8]);

	var l2 = list.slice(2, 4);
	equals(l2.size(), 2);
	equals(l2.get(0), 3);
	equals(l2.get(1), 4);

	var l3 = list.slice(5);
	equals(l3.size(), 3);
	equals(l3.get(0), 6);
	equals(l3.get(1), 7);
	equals(l3.get(2), 8);

	var l4 = list.slice();
	equals(l4.size(), list.size());
	equals(l4.get(0), 1);
	equals(l4.get(3), 4);
	equals(l4.get(7), 8);
});

test("list_append", function () {
	var l1 = new List([1, 2, 3]);
	var l2 = new List([4, 5, 6]);

	var l3 = l1.append(l2);
	equals(l3.size(), 6);
	equals(l3.get(0), 1);
	equals(l3.get(1), 2);
	equals(l3.get(2), 3);
	equals(l3.get(3), 4);
	equals(l3.get(4), 5);
	equals(l3.get(5), 6);

	var l4 = (new List()).append([4, 5]);
	equals(l4.size(), 2);
	equals(l4.get(0), 4);
	equals(l4.get(1), 5);

	var l5 = (new List([8, 9]).append([]));
	equals(l5.size(), 2);
	equals(l5.get(0), 8);
	equals(l5.get(1), 9);

	var l6 = (new List()).append([]);
	equals(l6.size(), 0);
});

test("list_to_string", function () {
	var l1 = new List([1, 2, 3, 4, 5, 6]);
	equals(l1.toString(), "new List([1, 2, 3, 4, 5, 6])");

	var l2 = new List(["one", "two", "three"]);
	equals(l2.toString(), "new List([\"one\", \"two\", \"three\"])");
});

test("set_constructor", function () {
	var s1 = new Set();
	equals(s1.isEmpty(), true);

	var s2 = new Set([1, 2, 3]);
	equals(s2.size(), 3);
	equals(s2.contains(1), true);
	equals(s2.contains(1), true);
	equals(s2.contains(3), true);
	equals(s2.contains(4), false);

	var s3 = new Set(new List([4, 5, 6]));
	equals(s3.size(), 3);
	equals(s3.contains(4), true);
	equals(s3.contains(5), true);
	equals(s3.contains(6), true);

	var s4 = new Set(new Set([9, 8]));
	equals(s4.size(), 2);
	equals(s4.contains(9), true);
	equals(s4.contains(8), true);
});

test("set_add", function () {
	var s1 = new Set([]);
	s1.add(1);
	s1.add(2);
	s1.add(3);
	s1.add(2);
	s1.add(2);

	equals(s1.size(), 3);
	equals(s1.contains(1), true);
	equals(s1.contains(2), true);
	equals(s1.contains(3), true);
});

test("set_remove", function () {
	var s1 = new Set([2, 4, 6, 8]);
	equals(s1.contains(2), true);

	equals(s1.contains(4), true);
	s1.remove(4);
	equals(s1.contains(8), true);
	s1.remove(8);

	equals(s1.contains(4), false);
	equals(s1.contains(8), false);

	equals(s1.size(), 2);
	equals(s1.contains(2), true);
	equals(s1.contains(6), true);
});

test("set_each", function () {
	var s1 = new Set([2, 4, 6, 8]);
	var count = 0;
	var seen = {};
	s1.each(function (item) {
		equals(typeof seen[item], "undefined");
		equals(s1.contains(item), true);
		count += 1;
		seen[item] = true;
	});
	equals(count, 4);
});

test("set_collect", function () {
	var s1 = new Set([2, 4, 6, 8]);
	var s2 = s1.collect(function (item) { return Math.floor(item / 2); });
	equals(s2.size(), 4);
	equals(s2.contains(1), true);
	equals(s2.contains(2), true);
	equals(s2.contains(3), true);
	equals(s2.contains(4), true);
});

test("set_select", function () {
	var s1 = new Set([2, 4, 6, 8]);
	var s2 = s1.select(function (item) { return item > 5; });
	equals(s2.size(), 2);
	equals(s2.contains(6), true);
	equals(s2.contains(8), true);
});

test("set_find", function () {
	var s1 = new Set([2, 4, 6, 8]);

	var v1 = s1.find(function (item) { return item > 5; });
	equals(v1, 6);

	var v2 = s1.find(function (item) { return item > 2; });
	equals(v2, 4);

	var v3 = s1.find(function (item) { return item > 100; });
	equals(v3, null);
});

test("set_union", function () {
	var s1 = new Set([2, 4]);
	var s2 = new Set([4, 6, 8]);
	var s3 = s1.union(s2);
	equals(s3.size(), 4);
	equals(s3.contains(2), true);
	equals(s3.contains(4), true);
	equals(s3.contains(6), true);
	equals(s3.contains(8), true);

	var s4 = s1.union(new Set());
	equals(s4.size(), 2);
	equals(s4.contains(2), true);
	equals(s4.contains(4), true);

	var s5 = (new Set()).union(s1);
	equals(s5.size(), 2);
	equals(s5.contains(2), true);
	equals(s5.contains(4), true);

	var s6 = (new Set()).union(new Set());
	equals(s6.isEmpty(), true);
});

test("set_intersection", function () {
	var s1 = new Set([2, 4, 6]);
	var s2 = new Set([4, 6, 8]);
	var s3 = s1.intersection(s2);
	equals(s3.size(), 2);
	equals(s3.contains(4), true);
	equals(s3.contains(6), true);

	var s4 = s1.intersection(new Set());
	equals(s4.isEmpty(), true);

	var s5 = (new Set()).intersection(s1);
	equals(s5.isEmpty(), true);

	var s6 = (new Set()).intersection(new Set());
	equals(s6.isEmpty(), true);
});

test("set_difference", function () {
	var s1 = new Set([2, 4, 6, 8, 10]);
	var s2 = new Set([4, 10]);
	var s3 = s1.difference(s2);
	equals(s3.size(), 3);
	equals(s3.contains(2), true);
	equals(s3.contains(6), true);
	equals(s3.contains(8), true);

	var s4 = s1.difference(new Set());
	equals(s4.size(), 5);
	equals(s4.contains(2), true);
	equals(s4.contains(10), true);

	var s5 = (new Set()).difference(s1);
	equals(s5.isEmpty(), true);

	var s6 = (new Set()).difference(new Set());
	equals(s6.isEmpty(), true);
});

test("set_is_empty", function () {
	var s1 = new Set([4, 10]);
	equals(s1.isEmpty(), false);

	var s2 = new Set();
	equals(s2.isEmpty(), true);

	var s3 = new Set([4]);
	s3.remove(4);
	equals(s3.isEmpty(), true);
});

test("set_values", function () {
	var s1 = new Set([2, 4, 6, 8, 10]);
	var v1 = s1.values();
	equals(v1.size(), 5);
	equals(v1.contains(2), true);
	equals(v1.contains(4), true);
	equals(v1.contains(6), true);
	equals(v1.contains(8), true);
	equals(v1.contains(10), true);
});

test("set_toString", function () {
	var s1 = new Set([2, 4, 6, 8, 10]);
	equals(s1.toString(), "new Set([2, 4, 6, 8, 10])");

	var s2 = new Set(["one", "two", "three"]);
	equals(s2.toString(), "new Set([\"one\", \"two\", \"three\"])");
});

test("map_constructor", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	equals(m1.size(), 3);
	equals(m1.get('x'), 1);
	equals(m1.get('y'), 2);
	equals(m1.get('z'), 3);

	var m2 = new Map(m1);
	equals(m2.size(), 3);
	equals(m2.get('x'), 1);
	equals(m2.get('y'), 2);
	equals(m2.get('z'), 3);
});

test("map_has_key", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	equals(m1.contains('x'), true);
	equals(m1.contains('y'), true);
	equals(m1.contains('z'), true);
	equals(m1.contains('m'), false);
});

test("map_set", function () {
	var m1 = new Map();
	m1.set('a', 1);
	m1.set('b', 8);
	equals(m1.get('a'), 1);
	equals(m1.get('b'), 8);
	equals(m1.size(), 2);
});

test("map_remove", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	m1.remove('x');
	m1.remove('y');
	equals(m1.contains('x'), false);
	equals(m1.contains('y'), false);
	equals(m1.contains('z'), true);
});

test("map_each", function () {
	var m1 = new Map();
	m1.set(0, 1);
	m1.set(1, 2);
	m1.set(2, 3);
	m1.set(3, 4);
	var count = 0;
	m1.each(function (value, key) {
		equals(key, count);
		equals(value, count + 1);
		count += 1;
	});
});

test("map_collect", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var m2 = m1.collect(function (value, key) { return value - 1; });
	equals(m2.get('x'), 0);
	equals(m2.get('y'), 1);
	equals(m2.get('z'), 2);
});

test("map_select", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var m2 = m1.select(function (value, key) { return key != 'y'; });
	equals(m2.contains('x'), true);
	equals(m2.contains('y'), false);
	equals(m2.contains('z'), true);
});

test("map_find", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var v1 = m1.find(function (value, key) { return key == 'z'; });
	equals(v1, 3);
	var v2 = m1.find(function (value, key) { return value > 1; });
	equals(v2, 2);
});

test("map_is_empty", function () {
	var m1 = new Map();
	equals(m1.isEmpty(), true);

	var m2 = new Map({x: 1, y: 2});
	equals(m2.isEmpty(), false);
	m2.remove('x');
	m2.remove('y');
	equals(m2.isEmpty(), true);
});

test("map_size", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	equals(m1.size(), 3);
	m1.remove('x');
	equals(m1.size(), 2);

	var m2 = new Map();
	equals(m2.size(), 0);
});

test("map_keys", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var k1 = m1.keys();
	equals(k1.size(), 3);
	equals(k1.contains('x'), true);
	equals(k1.contains('y'), true);
	equals(k1.contains('y'), true);

	var k2 = (new Map()).keys();
	equals(k2.isEmpty(), true);
});

test("map_values", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var v1 = m1.values();
	equals(v1.size(), 3);
	equals(v1.contains(1), true);
	equals(v1.contains(2), true);
	equals(v1.contains(3), true);

	var v2 = (new Map()).values();
	equals(v2.isEmpty(), true);
});

test("map_associations", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	var a1 = m1.associations();
	equals(a1.size(), 3);

	var assoc1 =  a1.find(function (assoc, index) { return assoc.key == 'x' });
	equals(assoc1.key, "x");
	equals(assoc1.value, 1);

	var assoc2 =  a1.find(function (assoc, index) { return assoc.key == 'y' });
	equals(assoc2.key, "y");
	equals(assoc2.value, 2);

	var assoc3 =  a1.find(function (assoc, index) { return assoc.key == 'z' });
	equals(assoc3.key, "z");
	equals(assoc3.value, 3);
});

test("map_to_string", function () {
	var m1 = new Map({x: 1, y: 2, z: 3});
	equals(m1.toString(), "new Map({x: 1, y: 2, z: 3})");
});

}) ();