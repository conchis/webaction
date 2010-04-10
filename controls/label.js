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
 
 new function(_) {

    var label = new base2.Package(this, {
        name:    "label",
        version: "0.1",
        imports: "generator,controls",
        exports: "Label"
    });

    // evaluate the imported namespace
    eval(this.imports);

    var Label = Control.extend({

        constructor: function (text, options) {
            this.base(options, {css_class: 'wa_label'});
            this.text = text;
        },

     	// Tag to use in primary element

 		element_tag: 'span',

        // Generate HTML

        generate: function (dom_element) {
            dom_element.append(this.text);
        },

        // Set label text

        setText: function (text) {
            this.dom_element.html(text);
        }

    });

    // ** Evaluate the exported namespace
    eval(this.exports);
};