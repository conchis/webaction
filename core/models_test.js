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

module("models_test.js");

eval(base2.models.namespace);

test("value_model", function () {
	var got_message = false;
	var model = new ValueModel(false);
	model.addListener("value_changed", function () {
		got_message = true;
	});

	equals(got_message, false);
	equals(model.value, false);

	model.set(true);

	equals(model.value, true);
	equals(got_message, true);

	got_message = false;
	model.set(true);
	equals(got_message, false);

	model.set(false);
	equals(model.value, false);
	equals(got_message, true);
})

test("list_model_changed", function () {
	var change_count = 0;
	var change_data = null;

	function onChanged(index, value, prior) {
		change_count += 1;
		change_data = {index: index, value: value, prior: prior};;
	}

	var m1 = new ListModel();
	m1.addListener("changed", onChanged);
	m1.addListener("added", onChanged);

	m1.add("one");
	equals(change_count, 1);
	equals(change_data.index, 0);
	equals(change_data.value, "one");

	m1.add("two");
	equals(change_count, 2);
	equals(change_data.index, 1);
	equals(change_data.value, "two");

	equals(2, m1.size());
	equals(m1.get(0), "one");
	equals(m1.get(1), "two");

	m1.set(0, "one+");
	equals(change_count, 3);
	equals(change_data.index, 0);
	equals(change_data.value, "one+");
	equals(change_data.prior, "one");
});

test("list_model_remove", function () {
	var items = [2, 4, 6, 8];
	var m1 = new ListModel(items);

	var change_count = 0;
	var change_data = null;
	m1.addListener("removed", function (index, value) {
		change_count += 1;
		change_data = {index: index, value: value};
	});

	equals(m1.indexOf(6), 2);
	m1.remove(2);
	equals(change_count, 1);
	equals(change_data.index, 2);

	var items = m1.items;
	equals(items.length, 3);
	equals(items[0], 2);
	equals(items[1], 4);
	equals(items[2], 8);
});

test("set_model_changed", function () {
	var change_count = 0;
	var change_value = null;

	function onChanged(value) {
		change_count += 1;
		change_value = value;
	}

	var m1 = new SetModel();
	m1.addListener("added", onChanged);

	m1.add("one");
	equals(change_count, 1);
	equals(change_value, "one");

	m1.add("two");
	equals(change_count, 2);
	equals(change_value, "two");

	equals(2, m1.size());
	equals(m1.contains("one"), true);
	equals(m1.contains("two"), true);
});

test("set_model_remove", function () {
	var items = [2, 4, 6, 8];
	var m1 = new SetModel(items);

	var change_count = 0;
	var change_value = null;
	m1.addListener("removed", function (value) {
		change_count += 1;
		change_value = value;
	});

	m1.remove(2);
	equals(change_count, 1);
	equals(change_value, 2);
});

test("map_model_changed", function () {
	var change_count = 0;
	var change_data = null;

	function onChanged(key, value, prior) {
		change_count += 1;
		change_data = {key: key, value: value, prior: prior};;
	}

	var m1 = new MapModel();
	m1.addListener("changed", onChanged);

	m1.set(1, "one");
	equals(change_count, 1);
	equals(change_data.key, 1);
	equals(change_data.value, "one");

	m1.set(2, "two");
	equals(change_count, 2);
	equals(change_data.key, 2);
	equals(change_data.value, "two");

	equals(2, m1.size());
	equals(m1.get(1), "one");
	equals(m1.get(2), "two");
});

test("map_model_remove", function () {
	var items = {two: 2, four: 4, six: 6, eight: 8};
	var m1 = new MapModel(items);

	var change_count = 0;
	var change_data = null;
	m1.addListener("removed", function (key, value) {
		change_count += 1;
		change_data = {key: key, value: value};
	});

	m1.remove('six');
	equals(change_count, 1);
	equals(change_data.key, 'six');
	equals(change_data.value, 6);

	m1.remove('two');
	equals(change_count, 2);
	equals(change_data.key, 'two');
	equals(change_data.value, 2);

	m1.remove('ten');
	equals(m1.size(), 2);
});

}) ();