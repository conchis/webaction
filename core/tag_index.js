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

    var tag_index = new base2.Package(this, {
        name:    "tag_index",
        version: "0.1",
        imports: "observers,options",
        exports: "TagIndex"
    });

    // evaluate the imported namespace
    eval(this.imports);

    // A TagIndex provides a way of finding elements of a List via item tags.

    var TagIndex = Broadcaster.extend({

        // Constructs a TagIndex

        constructor: function (options) {
            this.base();
            this.setOptions(options);

            // Indexed list
            this.list = null;

            // Map from tag name -> { name, locations } where locations
            // is a list of item indexes of items with the specified tag.
            this.tag_table = {};

            // Map from item index ->  list of tags. Used to reindex a single
            // item if it's tsgs change.
            this.item_tags = {};

            // Initialize the function used to extract tags from an element
            var tags = this.option("tags");
            if (typeof(tags) == "function")
                this.getItemTags = tags;
            else if (typeof(tags) == "string")
                this.getItemTags = function (item) { return item[tags]; };
            else
                this.getItemTags = function (item) { return item.tags;  };

            // Initialize the indexed list
            var list = this.option("list");
            if (list != null)
                this.setList(list);
        },

        // Sets the list that will be indexed by this object

        setList: function (list) {
            this.list = list;
            list.addListener("changed", this, "indexItem");
            list.addListener("added", this, "indexAll");
            list.addListener("removed", this, "indexAll");
            this.indexAll();
        },

        // *** Item indexing

        // Update tag index for all list items

        indexAll: function () {
            this.tag_table = {};
            this.item_tags = {};
            var size = this.list.size();
            for (var item_index = 0; item_index < size; item_index += 1)
                this.indexItem(item_index);
        },

        // Associate an item with its tags

        indexItem: function (item_index) {
            // Remove old item index if any
            this.removeItem(item_index);

            // Get item tags
            var item = this.list.get(item_index);
            var tags = this.getItemTags(item);

            // Save tags for future removal
            this.item_tags[item_index] = tags.slice(0);

            // For esch tag, install item index in tag records
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                var tag_record = this.makeTagRecord(tag);
                tag_record.locations.push(item_index);
            }
        },

        // Removes an association between an item and its tags

        removeItem: function (item_index) {
            // Get prior item's tags, return if none
            var tags = this.item_tags[item_index];
            if (typeof(tags) == "undefined") return;


            // Remove this item's index from each tag record
            var tag_table = this.tag_table;
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                var tag_record = tag_table[tag];
                var locations = tag_record.locations;
                var position = locations.indexOf(item_index);
                if (position >= 0)
                    locations.splice(position, 1);
            }

            // Remove the item from the map
            delete this.item_tags[item_index];
        },

        // Returns the tag record associated with a tag name. Creates and
        // installs a new tag record if none is found.

        makeTagRecord: function (tag) {
            var tag_table = this.tag_table;
            var tag_record = tag_table[tag];
            if (typeof(tag_record) != "undefined")
                return tag_record;
            tag_record = {tag: tag, count: 0, locations: []}
            tag_table[tag] = tag_record;
            return tag_record;
        },

        // *** Queries

        // Returns a sorted list of all tags

        getTags: function () {
            var tags = [];
            for (var tag in this.tag_table)
                tags.push(tag);
            tags.sort();
            return tags;
        },

        // Returns a list of indexes of items that have a specified tag

        getLocations: function (tag) {
            var tag_record = this.tag_table[tag];
            if (tag_record == null)
                return [];
            return tag_record.locations;
        },

        // Returns items associated with a specified tag

        getItems: function (tag) {
            var locations = this.getLocations(tag);

            var list = this.list;
            var items = [];
            for (var index = 0; index < locations.length; index += 1)
                items.push(list.get(locations[index]));
            return items;
        },

        // Returns the normalized frequency for a specified tag

        frequency: function (tag) {
            var tag_record = this.tag_table[tag];
            if (typeof(tag_record) == "undefined")
                return 0;
            return tag_record.locations.length / this.list.size();
        },

        // *** Collect Items with Tags

        // Returns an Array of items assoicated with specified tags

        collectItems: function (tags, intersection) {
            var locations = this.collectLocations(tags, intersection);
            var list = this.list;
            var items = [];
            for (var index = 0; index < locations.length; index += 1)
                items.push(list.get(locations[index]));
            return items;
        },

        // Returns an Array of locations of all list items with a specified tag

        collectLocations: function (tags, intersection) {
            if (typeof(tags) == "undefined" || tags.length == 0)
                return this.collectAllLocations();
            if (typeof(intersection) == "undefined" || !intersection)
                return this.collectTagLocations(tags, {});
            else
                return this.collectIntersect(tags);
        },

        // Collect and mark all values associated with all selected tags.

        collectIntersect: function (tags)
        {
            var markers = {};
            var locations = this.collectTagLocations(tags, markers);
            var result = [];
            for (var index = 0; index < locations.length; index += 1)
            {
                var location = locations[index];
                if (markers[location] >= tags.length)
                    result.push(location);
            }
            return result;
        },

        // Collects indexes of all items with any specified tag. Returns an
        // array of list indexes in order.

        collectTagLocations: function(tags, markers) {
            var result = [];
            for (var tag_index = 0; tag_index < tags.length; tag_index += 1) {
                var tag = tags[tag_index];
                var locations = this.tag_table[tag].locations;
                for (var index = 0; index < locations.length; index += 1) {
                    var location = locations[index];
                    var count = markers[location];
                    if (typeof(count) =="undefined") count = 0;
                    if (count == 0)
                        result.push(locations[index]);
                    markers[location] = count + 1;
                }
            }
            result.sort();
            return result;
        },
        
        // Collects indexes of all items. Returns an array of list
        // indexes in order.

        collectAllLocations: function() {
            var result = [];
            var size = this.list.size();
            for (var index = 0; index < size; index += 1)
                result.push(index);
            return result;
        },

        // **** Finding Best Selectors

        // Find the count best selectors. Tags are better selectors if 
        // they appear closer to half the number of items.

        findBestSelectors: function (count) {
            var tag_table = this.tag_table;

            // Attach weights to records
            var tags = [];
            var half = this.list.size() / 2;
            for (var tag in tag_table) {
                var tag_record = tag_table[tag];
                tags.push({
                    tag: tag_record.tag,
                    weight: Math.abs(tag_record.locations.length - half)
                });
            }

            // Sort tags in reverse order by weight
            tags.sort(
                    function (first, second) {
                        return first.weight - second.weight;
                    });

            // Take only the first count tags
            tags = tags.slice(0, count);

            // Extract the tags and sort them alphabetically
            var result = [];
            for (var index = 0; index < tags.length; index += 1)
                result.push(tags[index].tag);
            result.sort();

            return result;
        },

        // Returns a table of tags to frequency, scaled to the range within
        // the supplied set of tags.

        getNormalizedFrequencies: function (tags) {
            //construct a map from tag to frequency
            result = {};
            var maximum = 0.0;
            var minimum = -1.0;
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                var frequency = this.frequency(tag);
                result[tag] = frequency;
                if (frequency > maximum)
                    maximum = frequency;
                if (frequency < minimum || minimum == -1)
                    minimum = frequency;
            }

            // Scale frequencies
            for (var tag in result) {
                if (result[tag] > minimum)
                    result[tag] = (result[tag] - minimum) / (maximum - minimum);
                else
                    result[tag] = 0;
            }

            return result;
        },

        // String representation

        toString: function () {
            var tags = this.getTags();
            
            var parts = [];
            for (var index = 0; index < tags.length; index += 1) {
                var tag = tags[index];
                var locations = this.getLocations(tag);
                parts.push(tag + ": " + locations.length);
            }

            return parts.join("\n");
        }

    });
    TagIndex.implement(OptionsMixin);

    // **** Evaluate the exported namespace
    eval(this.exports);
};