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

module("controls_test.js");
eval(base2.controls.namespace);

test("id_generation", function () {
	var c1 = new Control({id:"c1"});
	equals(c1.id, "c1");

	var c2 = new Control();
	equals(c2.id, "Control_1");

	var c3 = new Control();
	equals(c3.id, "Control_2");
});

test("contents", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2'}),
        new Control({id: 'c3'})
    ]});

    equals(2, c1.size());
    equals('c2', c1.contents[0].id);
    equals('c3', c1.contents[1].id);

    equals('c1', c1.contents[0].parent.id);
    equals('c1', c1.contents[1].parent.id);
});

test("remove", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2'}),
        new Control({id: 'c3'})
    ]});

    var c2 = c1.contents[0];
    c1.remove(c2);
    equals(1, c1.size());
    equals(null, c2.parent);

    var c3 = c1.contents[0];
    c3.remove();
    equals(0, c1.size());
    equals(null, c3.parent);
});

test("eachChild", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2'}),
        new Control({id: 'c3'})
    ]});

    var seen = {};
    c1.eachChild(function (child) {
        seen[child.id] = true;
    });

    equals(true, seen.c2);
    equals(true, seen.c3);
    equals("undefined", typeof seen.c1);
});

test("findChild", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2'}),
        new Control({id: 'c3'})
    ]});

    var c2 = c1.findChild(function (child) { return child.id == 'c2'; });
    equals('c2', c2.id);

    var c3 = c1.findChild(function (child) { return child.id == 'c3'; });
    equals('c3', c3.id);

    var c4 = c1.findChild(function (child) { return child.id == 'c4'; });
    equals(c4, null);
});

test("each", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2',  contents: [
            new Control({id: 'c3'}),
            new Control({id: 'c4'})
        ]}),
        new Control({id: 'c5',  contents: [
            new Control({id: 'c6'})
        ]})
    ]});

    var seen = [];
    c1.each(function (child) { seen.push(child.id); });
    equals(seen.length, 5);
    equals(seen[0], 'c2');
    equals(seen[1], 'c3');
    equals(seen[2], 'c4');
    equals(seen[3], 'c5');
    equals(seen[4], 'c6');
});

test("find", function () {
    var c1 = new Control({id: 'c1', contents: [
        new Control({id: 'c2',  contents: [
            new Control({id: 'c3'}),
            new Control({id: 'c4'})
        ]}),
        new Control({id: 'c5',  contents: [
            new Control({id: 'c6'})
        ]})
    ]});

    var c4 = c1.find(function (child) { return child.id == 'c4'; });
    equals(c4.id, 'c4');

    var c6 = c1.find(function (child) { return child.id == 'c6'; });
    equals(c6.id, 'c6');

    var c7 = c1.find(function (child) { return child.id == 'c7'; });
    equals(c7, null);
});


}) ();