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

    var scroll_bar = new base2.Package(this, {
        name:    "scroll_bar",
        version: "0.1",
        imports: "controls,options,generator",
        exports: "ScrollBar"
    });

    // **** evaluate the imported namespace
    eval(this.imports);
    
    var ScrollBar = Control.extend({

        class_name: "ScrollBar",
        
        BUTTON_HEIGHT: 14,

        constructor: function (options) {
            this.base(options, {css_class: 'wa_sbar'});
            this.value = this.option("value", 0);
            this.max = this.option("max", 100);
            this.shown = this.option("shown", -1);
            this.slide_top = this.BUTTON_HEIGHT;
            this.slide_height = this.height - 2 * this.BUTTON_HEIGHT;
            this.is_tracking = false;
            this.start_y = 0;
            this.start_value = 0;
        },

        generate: function (dom_element) { 
            var up_button = new ScrollButton({
                    css_class: "wa_sbar_up", pressed_css: "wa_sbar_up_pressed"});
            this.add(up_button);
            up_button.addListener("up", this, "onUpPressed");
            this.up_button = up_button;
            
            var handle = new Handle();
            this.add(handle);
            this.handle = handle;
            
            var down_button = new ScrollButton({css_class: "wa_sbar_down", 
                    pressed_css: "wa_sbar_down_pressed", 
                    top: this.height - this.BUTTON_HEIGHT - 1});
            this.add(down_button);
            down_button.addListener("up", this, "onDownPressed");
            this.down_button = down_button;
            
            this.connectEvents(dom_element);
            this.update();
        },
        
        connectEvents: function (dom_element) {
            var self = this;
            dom_element.mousedown(function (event) {
                self.startTracking(event);
            });
            
            var doc_element = jQuery(document);
            
            doc_element.mousemove(function (event) {
                if (self.is_tracking) self.track(event);
            });
            
            doc_element.mouseup(function (event) {
                self.stopTracking(event);
            });
        },
        
        update: function () {
            var slide_top = this.BUTTON_HEIGHT;
            var slide_height = this.slide_height;
            
            var handle_top = slide_top + Math.round(slide_height * this.value / this.max);
            
            var shown = this.shown;
            if (shown < 1)
                shown = Math.round(this.max / 10);
            var handle_height = Math.round(slide_height * shown / this.max);
                
            this.handle.adjust(handle_top, handle_height, this.is_tracking);
        },
        
        setScroll: function (value, shown) {
            if (shown == undefined)
                shown = this.shown;
            this.value = Math.round(value);
            this.shown = Math.round(shown);
            this.update();
        },
        
        setMax: function (max) {
            this.max = max;
            if (this.value > max)
                this.value = max;
            this.update();
        },
        
        onUpPressed: function () {
            if (this.value > 0) {
                this.value -= 1;
                this.update();
            }
        },
        
        onDownPressed: function () {
            if (this.value < (this.max - this.shown)) {
                this.value += 1;
                this.update();
            }
        },
        
        // *** Mouse Tracking
        
        startTracking: function (event) {
            this.is_tracking = true;
            this.start_y = event.clientY;
            this.start_value = this.value;
        },
        
        track: function (event) {
            var offset = event.clientY - this.start_y;
            var scaled_offset = Math.round(this.max * offset / this.slide_height); 
            var shown = this.shown;
            if (shown < 1) {
                shown = Math.round(this.max / 10);
                this.shown = shown;
            }
            var new_value = Math.min(Math.max(0, this.start_value + scaled_offset), 
                this.max - shown);
            if (new_value != this.value) {
                this.value = new_value;
                this.update();
            }
        },
        
        stopTracking: function (event) {
            this.is_tracking = false;
            this.update();
        }
    });

    var ScrollButton = Control.extend({
    
        class_name: "ScrollButton",
        
        constructor: function (options) {
            this.base(options, {css_class: "wa_sbar_button"});
            this.pressed_css = this.option("pressed_css", "wa_sbar_button_pressed");
        },
        
        generate: function (dom_element) {
    		var self = this;
            dom_element.mousedown(function () {
                self.onMouseDown();
            });
            dom_element.mouseup(function () {
            	self.onMouseUp();
            });
            dom_element.mouseleave(function () {
                self.onMouseLeave();
            })
        },
        
        onMouseDown: function () {
            this.dom_element.addClass(this.pressed_css);
            this.broadcast("down");
        },
        
        onMouseUp: function () {
            this.dom_element.removeClass(this.pressed_css);
            this.broadcast("up");
        },
        
        onMouseLeave: function () {
            this.dom_element.removeClass(this.pressed_css);    
        }
    });
    
    var Handle = Control.extend({
        
        class_name: "Handle",
        
        constructor: function (options) {
            this.base(options, {css_class: 'wa_sbar_handle',
                top: ScrollBar.BUTTON_HEIGHT});
        },

        generate: function (dom_element) {
        },
        
        adjust: function (top, height, is_tracking) {
            this.dom_element.css("top", top);
            this.dom_element.css("height", height - 2);
            
            if (is_tracking)
                this.dom_element.addClass("wa_sbar_handle_pressed");
            else
                this.dom_element.removeClass("wa_sbar_handle_pressed");
        }
     
    });

    // **** Evaluate the exported namespace
    eval(this.exports);
};