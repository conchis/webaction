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

module("list_models_test.js");

eval(base2.list_models.namespace);

test("default", function () {
	var l1 = new ListModel([8, 22, 3]);
	var l2 = new ListFilter(l1);
	equals(l2.size(), l1.size());
	equals(l2.get(0), l1.get(0));
	equals(l2.get(1), l1.get(1));
	equals(l2.get(2), l1.get(2));
});

test("simple_sort", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);

	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });
	equals(l2.size(), 10);
	for (var count = 0; count < 10; count += 1)
		equals(l2.get(count), count);

	l2.orderBy(function (item_a, item_b) { return item_b - item_a; });
	equals(l2.size(), 10);
	for (var count = 9; count >= 0; count -= 1)
		equals(l2.get(9 - count), count);
});

test("simple_filter", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item < 5); });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	equals(l2.size(), 5);
	for (var count = 0; count < 5; count += 1)
		equals(l2.get(count), count);
});

test("index_of", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item < 5); });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	equals(l2.indexOf(0),  0);
	equals(l2.indexOf(3),  3);
	equals(l2.indexOf(4),  4);
	equals(l2.indexOf(8), -1);
});

test("contains", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item < 5); });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	equals(l2.contains(0), true);
	equals(l2.contains(1), true);
	equals(l2.contains(4), true);
	equals(l2.contains(5), false);
});

test("each", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item < 5); });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var items = [];
	l2.each(function (item) {
		items.push(item);
	});
	equals(items.length, 5);
	for (count = 0; count < 5; count += 1)
		equals(items[count], count);
});

test("collect", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item < 5); });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var doubles = l2.collect(function (item) { return item * 2; });
	equals(doubles.size(), 5);
	for (var count = 0; count < 5; count += 1)
		equals(doubles.get(count), count * 2);
});

test("select", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var odds = l2.select(function (item) { return (item & 1) == 1; });
	equals(odds.size(), 5);
	for (var count = 0; count < 5; count += 1)
		equals(odds.get(count), 2 * count + 1);
});

test("find", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	equals(l2.find(function (item) { return item == 1; }), 1);
	equals(l2.find(function (item) { return item == 3; }), 3);
	equals(l2.find(function (item) { return item == 7; }), 7);

	equals(l2.find(function (item) { return item == 2; }), null);
	equals(l2.find(function (item) { return item == 4; }), null);
	equals(l2.find(function (item) { return item == 8; }), null);
});

test("changed", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var found = -1;
	l2.addListener("changed", function (index, value, prior) {
		found = {index: index, value: value, prior: prior};
	});

	l1.changed(2);
	equals(found.index, 4);
	equals(found.value, 9);

	l1.changed(3);
	equals(found.index, 2);
	equals(found.value, 5);
});

test("changed", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var found = null;
	l2.addListener("changed", function (index, value, prior) {
		found = {index: index, value: value, prior: prior};
	});

	l1.changed(2);
	equals(found.index, 4);
	equals(found.value, 9);

	l1.changed(3);
	equals(found.index, 2);
	equals(found.value, 5);
});

test("added", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var found = null;
	l2.addListener("added", function (index, value) {
		found = {index: index, value: value};
	});

	l1.add(13);
	equals(found.index, 5);
	equals(found.value, 13);

	l1.add(12);
	equals(found.index, 5);
	equals(found.value, 13);
});

test("removed", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

	var found = null;
	l2.addListener("removed", function (index, prior) {
		found = {index: index, prior: prior};
	});

	l1.remove(2);
	equals(found.index, 4);
	equals(found.prior, 9);
});

test("item_index", function () {
	var l1 = new ListModel([1, 0, 9, 5, 6, 8, 2, 4, 3, 7]);
	var l2 = new ListFilter(l1);
	l2.filterBy(function (item) { return (item & 1) == 1; });
	l2.orderBy(function (item_a, item_b) { return item_a - item_b; });

    equals(l2.getItemIndex(0), 0);
    equals(l2.getItemIndex(1), 8);
    equals(l2.getItemIndex(2), 3);
    equals(l2.getItemIndex(3), 9);
    equals(l2.getItemIndex(4), 2);
});


}) ();