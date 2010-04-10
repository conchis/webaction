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

    var cookies = new base2.Package(this, {
        name:   "cookies",
        version: "0.1",
        imports: "",
        exports: "putCookie,getCookie,deleteCookie"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // TODO do something smarter about expiraton some day..

    // Function to save a JS object as json in a session cookie.
    // This is used to save state across page loads.

    function putCookie(key, value) {
        var json_string = encodeURIComponent(JSONstring.make(value));
        //deleteCookie(key);
        document.cookie = key + "=" + json_string + ";path=/";
    }

    // Function to get a JS object from the JSON stored in a session
    // cookie.

    function getCookie(key) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, key.length + 1) == (key + '=')) {
                var json_string = decodeURIComponent(
                        cookie.substring(key.length + 1));
                return eval("(" + json_string + ")");
            }
        }
        return null;
    }

    // Delete all cookies with a specified key

    function deleteCookie(key) {
        var cookies = document.cookie.split(';');
        var now = (new Date()).toGMTString();
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, key.length + 1) == (key + '='))
                document.cookie = cookie + ";expires=" + now + ";path=/";
        }
    }

    // evaluate the exported namespace
    eval(this.exports);
};