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
 
module("forms_test.js");

// Import forms namespace
eval(base2.forms.namespace);

function makeForm() {
    var form = new Form({id: "test_form", method: 'post', action: "http://post",
                    enctype: "multipart/form-data", object: "item"},
        new TextItem("title"),
        new TextItem("item", {label: "Item Number", allow: /^[0-9]*$/, length: 5,
                optional: true}),
        new TextItem("creator"),
        new TagsItem("tags", {optional: true}),
        new TextItem("abstract", {lines: 5}),
        new PasswordItem("password", {confirm: true, optional: true}),
        new CheckboxItem("itunes", {comment:"Check to publish on iTunes"}),
        new PulldownItem("destination",
                {choices:["One", "Two", "Three"],values:["a", "b", "c"]}),
        new FileItem("video", {"extensions":["mp4", "m4v", "mp3", "m4a"]}),
        new RadioItem("radio", {choices:["This", "That", "Other"]}),
        new DateItem("date"),
        new SaveButton("save", {cancel: true})
    );
    return form;
}

test('get_item', function () {
    var form = makeForm();
    equals(form.getItem('itunes').name, 'itunes');
    equals(form.getItem('destination').name, 'destination');
    equals(form.getItem('title').name, 'title');
    equals(form.getItem('good'), null);
});

test('get_form', function () {
    var form = makeForm();

    var i1 = form.getItem('destination');
    equals(i1.getForm(), form);

    var i2 = form.getItem('tags');
    equals(i2.getForm(), form);
    
});

test('set_get_value', function () {
    var form = makeForm();
    var item = form.getItem('abstract');

    equals(item.value, "");
    form.setItemValue('abstract', 'A1');
    equals(item.value, 'A1');
    equals(form.getItemValue('abstract'), 'A1');

    item.setValue('B2');
    equals(item.value, 'B2');
    equals(form.getItemValue('abstract'), 'B2');
});

test('set_data', function () {
    var form = makeForm();
    form.setData({
        title: "T1",
        item: "004",
        creator: 'C1',
        tags: ['X1', 'X2'],
        abstract: 'A1',
        password: 'P1'
    });
    equals(form.getItemValue('title'),      'T1' );
    equals(form.getItemValue('item'),       '004');
    equals(form.getItemValue('creator'),    'C1' );
    equals(form.getItemValue('tags')[0],    'X1' );
    equals(form.getItemValue('abstract'),   'A1' );
    equals(form.getItemValue('password'),   'P1' );
});

test('update_dsta', function () {
    var form = makeForm();
    form.setData({
        title: "T1",
        item: "004",
        creator: 'C1',
        tags: ['X1', 'X2'],
        abstract: 'A1',
        password: 'P1'
    });
    var results = {mm: 42};
    form.updateData(results);
    equals(results.title,      'T1' );
    equals(results.item,       '004');
    equals(results.creator,    'C1' );
    equals(results.tags[0],    'X1' );
    equals(results.abstract,   'A1' );
    equals(results.password,   'P1' );
    equals(results.mm,         42   );
});
