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

	var sorting = new base2.Package(this, {
		name:	 "sorting",
		version: "0.1",
		imports: "",
		exports: "Sorter"
	});

	// evaluate the imported namespace
	eval(this.imports);

	var Sorter = Options.extend({

		constructor: function (options) {
			this.base(options);
		},

		sort: function (items) {
		},

		index_sort: function (items) {
		}

	});

	// evaluate the exported namespace
	eval(this.exports);
};