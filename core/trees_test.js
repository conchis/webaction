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

	module("trees_test.js");

	eval(base2.trees.namespace);

	test("make", function () {
		var t1 = new TreeNode("a");
		equals(t1.name, "a");
		equals(0, t1.children.length);
	});

	test("children", function () {
		var t1 = new TreeNode("/", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));

		var children = t1.children;
		equals(children.length, 3);

		equals(children[0].name, 'a');
		equals(children[0].parent, t1);
		equals(children[0].index, 0);

		equals(children[1].name, 'b');
		equals(children[1].parent, t1);
		equals(children[1].index, 1);

		equals(children[2].name, 'c');
		equals(children[2].parent, t1);
		equals(children[2].index, 2);
	});

	test("replacement by name", function () {
		var a1 = new TreeNode('a');
		var b1 = new TreeNode('b');
		var t1 = new TreeNode('', {}, a1, b1);
		equals(t1.children[0], a1);

		var a2 = new TreeNode('a');
		t1.addChild(a2,0);

		equals(a1.parent, null);
		equals(a2.parent, t1);
		equals(t1.children[0], a2);
		equals(t1.children[1], b1);
		equals(t1.children.length, 2);
	});

	test("move down 1", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var a = t1.getChildNamed('a');
		t1.addChild(a, 2);
		equals(a.index, 1);
		equals(t1.children[1], a);
	});

	test("move down 2", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var a = t1.getChildNamed('a');
		t1.addChild(a, 3);
		equals(a.index, 2);
		equals(t1.children[2], a);
	});

	test("move up", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var c = t1.getChildNamed('c');
		t1.addChild(c, 0);
		equals(c.index, 0);
		equals(t1.children[0], c);
	});

	test("remove 1", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var b = t1.getChildNamed('b');
		b.remove();
		equals(b.parent, null);
		equals(t1.getChildNamed('a').index, 0);
		equals(t1.getChildNamed('c').index, 1);
	});

	test("remove 2", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var a = t1.getChildNamed('a');
		a.remove();
		equals(t1.children.length, 2);
		equals(t1.children[0].name, 'b');
		equals(t1.children[1].name, 'c');
	});

	test("remove 3", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b"),
			new TreeNode("c"));
		var c = t1.getChildNamed('c');
		c.remove();
		equals(t1.children.length, 2);
		equals(t1.children[0].name, 'a');
		equals(t1.children[1].name, 'b');
	});

	test("path", function () {
		var t1 = new TreeNode("/", {},
			new TreeNode("a", {},
				new TreeNode("b", {},
					new TreeNode("c"))));
		var abc = t1.getNode("/a/b/c");
		equals(abc.name, 'c');
		equals(abc.getPath(), '/a/b/c');
	});

	test("absolute path", function () {
		var t1 = new TreeNode("/", {},
			new TreeNode("a", {},
				new TreeNode("b", {},
					new TreeNode("c"))));
		t1.setBasePath("/universe");
		var abc = t1.getNode("/a/b/c");
		equals(abc.name, 'c');
		equals(abc.getAbsolutePath(), '/universe/a/b/c');
	});

	test("addNode", function () {
		var t1 = new TreeNode("");
		var a = t1.addNode("a");
		var b = a.addNode("b");
		equals(a.parent, t1);
		equals(b.parent, a);

		var x = t1.addNode('p1/p2/p3/p4/p5/x');
		equals(x.getPath(), '/p1/p2/p3/p4/p5/x');
		equals(x.parent.name, 'p5');
		equals(x.parent.parent.name, 'p4');
	});

	test("next", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b", {},
				new TreeNode("b1")),
			new TreeNode("c", {},
				new TreeNode("c1"), new TreeNode("c2")));
		var names = [];
		for (var node = t1; node != null; node = node.next())
			names.push(node.name);
		equals(names.join(', '), "t1, a, b, b1, c, c1, c2");
	});

	test("previous", function () {
		var t1 = new TreeNode("t1", {},
			new TreeNode("a"),
			new TreeNode("b", {},
				new TreeNode("b1")),
			new TreeNode("c", {},
				new TreeNode("c1"), new TreeNode("c2")));
		var c1 = t1.getNode('c/c2');
		var names = [];
		for (var node = c1; node != null; node = node.previous())
			names.push(node.name);
		equals(names.join(', '), "c2, c1, c, b1, b, a, t1");
	});

	test("set-get", function () {
		var t1 = new TreeNode('t1');
		t1.setProperty('x', 10);
		t1.setProperty('y',  7);

		equals(t1.getProperty('x'), 10);
		equals(t1.getProperty('y'),  7);

		equals(t1.x, 10);
		equals(t1.y,  7);

		equals(t1.getProperty('z', 55), 55);
	});

	test("commit", function () {
		var t1 = new TreeNode('t1');
		t1.x = 2;
		t1.y = 4;

		equals(typeof(t1.getProperty('x')), "undefined");
		equals(typeof(t1.getProperty('y')), "undefined");

		t1.commit(['x', 'y']);
		equals(t1.getProperty('x'), 2);
		equals(t1.getProperty('y'), 4);

		t1.x = 22;
		t1.y = 44;
		t1.commit();

		equals(t1.getProperty('x'), 22);
		equals(t1.getProperty('y'), 44);
	});

	test("revert", function () {
		var t1 = new TreeNode('t1');
		t1.setProperty('x', 2);
		t1.setProperty('y', 8);

		t1.x = 22;
		t1.y = 88;

		t1.revert();

		equals(t1.x, 2);
		equals(t1.y, 8);
	});

	test("reset", function () {
		var t1 = new TreeNode("t1");
		t1.reset({x: 7, y: 13});

		equals(t1.x, 7);
		equals(t1.y, 13);
		equals(t1.getProperty('x'), 7);
		equals(t1.getProperty('y'), 13);

		t1.reset({x: 8, y: 20});

		equals(t1.x, 8);
		equals(t1.y, 20);
		equals(t1.getProperty('x'), 8);
		equals(t1.getProperty('y'), 20);
	});

	test("changed", function () {
		var t1 = new TreeNode("t1");
		ok(!t1.isChanged(), "!changed");
		t1.reset({x: 7, y: 13, label: "hello"});
		ok(!t1.isChanged(), "!changed");
		t1.x = 0;
		t1.y = -1;
		ok(t1.isChanged(), "changed");
		t1.commit();
		ok(!t1.isChanged(), "!changed");
		t1.label = "hahaha";
		ok(t1.isChanged(), "changed");
		t1.commit();
		ok(!t1.isChanged(), "!changed");
	});

	test("initial properties", function () {
		var t1 = new TreeNode("t1", {x: 112, y:444});
		equals(t1.x, 112);
		equals(t1.y, 444);
		equals(t1.getProperty('x'), 112);
		equals(t1.getProperty('y'), 444);
	});

})();