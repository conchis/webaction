#!/usr/bin/env rake

require 'rubygems'
require 'jsmin'

# Output files
COMBINED_JS_FILE  = 'webaction.js'
COMBINED_CSS_FILE = 'webaction.css'

# Source files
BASE_DIRECTORY = File.dirname(__FILE__)
CORE_DIRECTORY = File.join(BASE_DIRECTORY, 'core')
CONTROLS_DIRECTORY = File.join(BASE_DIRECTORY, 'controls')

def find_scripts_in(directory)
  Dir.glob(File.join(directory, "*.js")).reject do | name |
    name =~ /.*_test.js$/
  end
end

def find_css_in(directory)
  Dir.glob(File.join(directory, "*.css"))
end

LICIENCE=%q[/**
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
 */]

SCRIPT_FILES = [
  "core/options.js",
  "core/observers.js",
  "core/collections.js",
  "core/strings.js",
  "core/cookies.js",
  "core/generator.js",
  "core/controls.js",
  "core/list_models.js",
  "core/tag_index.js",
  "core/paths.js",
  "core/trees.js",
  "core/connectors.js",
  "core/jsonStringify.js",
  "controls/buttons.js",
  "controls/tabs.js",
  "controls/forms.js",
  "controls/tables.js",
  "controls/tag_selector.js",
  "controls/text_selector.js",
  "controls/dialogs.js",
  "controls/checklist.js",
  "controls/addlist.js",
  "controls/label.js",
  "controls/scroller.js"
]

CSS_FILES = [
  "core/controls.css",
  "controls/buttons.css",
  "controls/tabs.css",
  "controls/forms.css",
  "controls/tables.css",
  "controls/dialogs.css",
  "controls/checklist.css",
  "controls/addlist.css",
  "controls/tag_selector.css",
  "controls/text_selector.css",
  "controls/label.css",
  "controls/scroller.css"
]

desc "Generate script and CSS files"
task :default => [COMBINED_JS_FILE, COMBINED_CSS_FILE] do
end

desc "Create a combined Javascript file"
file COMBINED_JS_FILE => SCRIPT_FILES do
    script = LICIENCE.clone
    SCRIPT_FILES.each do | file_name |
        puts "adding: #{file_name}"
        script << "\n\n// #{file_name}"
        script << JSMin.minify(File.new(file_name))
        #script << IO.read(file_name)
    end
    puts "writing #{COMBINED_JS_FILE}.."
    File.new(COMBINED_JS_FILE, 'w').write(script)
end

desc "Create a combined CSS file"
file COMBINED_CSS_FILE => CSS_FILES do
    css = LICIENCE.clone
    CSS_FILES.each do | file_name |
      puts "adding: #{file_name}"
      css << JSMin.minify(File.new(file_name))
    end
    puts "writing #{COMBINED_CSS_FILE}.."
    File.new(COMBINED_CSS_FILE, 'w').write(css)
end

Rake::Task[:default].invoke