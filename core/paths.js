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

    var paths = new base2.Package(this, {
        name:    "paths",
        version: "0.1",
        imports: "",
        exports: "split,append,join,normalize"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // Splits a path into tokens while normalizing the resulting path.

    function split(path)
    {
        var tokens = path.split("/");
        var result = [];

        // Add any initial slashes
        for (var index = 0;
                index < tokens.length && tokens[index] == ""; index += 1)
            result.push(tokens[index]);

        // Remove any additional slashes
        for (; index < tokens.length; index += 1)
        {
            var token = tokens[index];
            if (token != "")
                result.push(token);
        }

        return result;
    }

    // Given an array of tokens and any number of additional arrays of path
    // tokens, appends the additional tokens to the end of the path.

    function append(tokens, others)
    {
        return tokens;
    }

    // Joins one or more paths in to a single normalized path.

    function join() // arguments
    {
        var segments = [];
        for (var index = 0; index < arguments.length; index += 1)
        {
            var argument = arguments[index]
            if (argument == '/') argument = '';
            var tokens = split(argument);
            for (var token_index = 0; token_index < tokens.length; token_index += 1)
                segments.push(tokens[token_index]);

        }
        return normalize(segments.join("/"));
    }

    // Normalize Path

    function normalize(path)
    {
        return split(path).join("/");
    }

    // evaluate the exported namespace
    eval(this.exports);
};


