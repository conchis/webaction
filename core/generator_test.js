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
 
 module("generator_test.js");

// Import forms namespace
eval(base2.generator.namespace);

test('element', function () {
    equals(element('b'), '<b/>');
    equals(element('hr', {size: 1}), '<hr size="1"/>');
    equals(element('a', {href: '#', onclick: 'okay(11)'}),
            '<a href="#" onclick="okay(11)"/>');
    equals(element('p', {"class": "large"}, ["Some text here"]),
            '<p class="large">Some text here</p>');
    equals(element('p', {}, [element('br'), "Hello world", element('br')]),
            "<p><br/>Hello world<br/></p>");
});

test('tag', function () {
    equals(tag('b'), '<b/>');
    equals(tag('hr', {size: 1}), '<hr size="1"/>');
    equals(tag('a', {href: '#', onclick: 'okay(11)'}),
            '<a href="#" onclick="okay(11)"/>');
    equals(tag('p', {"class": "large"}, "Some text here"),
            '<p class="large">Some text here</p>');
    equals(tag('p', {}, tag('br'), "Hello world", tag('br')),
            "<p><br/>Hello world<br/></p>");
});

test('nested', function () {
    var rows = [ tr({}, td(), td()), tr({}, td(), td()), tr({}, td(), td()) ];
    var tab = table({}, tr({}, th(), th()), rows);
    equals(tab, '<table><tr><th/><th/></tr><tr><td/><td/></tr><tr><td/><td/></tr><tr><td/><td/></tr></table>');
});

// "br,form,input,textarea"

test("div", function () {
    equals(div({"class": "s1"}, "inside"), '<div class="s1">inside</div>');
});

test("span", function () {
    equals(span({"class": "s1"}, "inside"), '<span class="s1">inside</span>');
});

test("table", function () {
    equals(table({"class": "s1"}, "inside"), '<table class="s1">inside</table>');
});

test("tr", function () {
    equals(tr({"class": "s1"}, "inside"), '<tr class="s1">inside</tr>');
});

test("th", function () {
    equals(th({"class": "s1"}, "inside"), '<th class="s1">inside</th>');
});

test("td", function () {
    equals(td({"class": "s1"}, "inside"), '<td class="s1">inside</td>');
});

test("p", function () {
    equals(p({"class": "s1"}, "inside"), '<p class="s1">inside</p>');
});

test("a", function () {
    equals(a({"class": "s1"}, "inside"), '<a class="s1">inside</a>');
});


test("form", function () {
    equals(form({"class": "s1"}, "inside"), '<form class="s1">inside</form>');
});


test("input", function () {
    equals(input({"class": "s1"}, "inside"), '<input class="s1">inside</input>');
});


test("textarea", function () {
    equals(textarea({"class": "s1"}, "inside"), '<textarea class="s1">inside</textarea>');
});

test("br", function () {
    equals(br(), '<br/>');
});

test("style", function () {
	equals(style({width: 120, height: 33}), "width:120px;height:33px");
	equals(style({border:['solid', 1, '#AAAAAA']}), "border:solid 1px #AAAAAA");
	equals(style({position:'absolute',border_left: 1}), 'position:absolute;border-left:1px');
	equals(style({border_position_left:22}), 'border-position-left:22px');
	equals(style("width:11px"), "width:11px");
	
});

test("style2", function () {
	equals(div({style:{width:10, height:32}}), '<div style="width:10px;height:32px"/>');
});