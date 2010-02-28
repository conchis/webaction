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
 
 new function(_) {

    var scroller = new base2.Package(this, {
        name:    "scroller",
        version: "0.1",
        imports: "controls,options,generator",
        exports: "Scroller"
    });

    // **** evaluate the imported namespace
    eval(this.imports);

    // A Scroller contains other controls arranged vertically
    // in a scrolling pane.

    var Scroller = Control.extend({

        class_name: "Scroller",

        constructor: function (options) {
            this.base(options, {css_class: 'wa_scroller'});
        },

        generate: function (dom_element) {
            var content_id = this.id + "_content";
            dom_element.append(
                div({id: content_id, 'class':'wa_scroller_content'}));
            this.setContentsElement(jQuery("#" + content_id));
        }
    });

    // **** Evaluate the exported namespace
    eval(this.exports);
};