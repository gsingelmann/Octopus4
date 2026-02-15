/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Dashboard for Project Octopus

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    License (MIT) 
		Copyright 2023 Gerald Singelmann/Satzkiste GmbH
		Permission is hereby granted, free of charge, to any person obtaining 
		a copy of this software and associated documentation files (the "Software"), 
		to deal in the Software without restriction, including without limitation 
		the rights to use, copy, modify, merge, publish, distribute, sublicense, 
		and/or sell copies of the Software, and to permit persons to whom the 
		Software is furnished to do so, subject to the following conditions:
		The above copyright notice and this permission notice shall be included 
		in all copies or substantial portions of the Software.
		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
		OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
		THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
		FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
		DEALINGS IN THE SOFTWARE.
// ---------------------------------------------------------------------------------------------------------------------- */
#targetengine octopus_dashboard
#include "./Octopus-include-2.jsxinc"
#include "./Octopus-Tools.jsxinc"
__init(); 
script_id = "dashboard";

var cfg = get_configs();
show_dashboard( cfg );

function get_configs() {
  var configs =  __readJson( PATH_DATA_FOLDER  + "/config.json" );
  return configs;
}
function show_dashboard( cfg ) {
  var w = new Window("dialog", "Dahboard", undefined /*, {closeButton: false} */);
  w.tabbed_panel = w.add("tabbedpanel {alignChildren: ['fill', 'fill']}");
  w.tabbed_panel.alignChildren = ['fill', 'fill'];
  w.script_tab = w.tabbed_panel.add("tab {text: '" +  __('tab1') + "', orientation: 'column', alignChildren: 'fill'}");
  w.sets_tab = w.tabbed_panel.add("tab", undefined, __('tab2'), {alignChildren: ['fill', 'fill']})

  w.script_list = w.script_tab.add("listbox", [undefined, undefined, 500, 300], "", {minimumSize: [500,400], numberOfColumns: 2, showHeaders: true, columnTitles: ['Script', 'last updated']});
  for ( var n = 0; n < cfg.length; n++ ) {
    if ( cfg[n].filename.search(/\.jsx$/i) == -1 ) continue;
    var dt = cfg[n].updated || "";
    if ( dt ) dt = dt.substr(0,10);
    var a = w.script_list.add("item", localize(cfg[n].label));
    a.subItems[0].text = dt;
    a.checked = true;
    a.ix = n;
    a.url = cfg[n].help_url;
  }
  w.script_btns = w.script_tab.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
  w.activate_btn = w.script_btns.add("button", undefined, __('activate'));
  w.deactivate_btn = w.script_btns.add("button", undefined, __('deactivate'));
  w.help_btn = w.script_btns.add("button", undefined, __('help'));
  w.activate_btn.enabled = false;
  w.deactivate_btn.enabled = false;
  w.help_btn.enabled = false;

  w.script_list.onChange = function() {
    var s = this.selection;
    if ( ! s ) {
      w.activate_btn.enabled = false;
      w.deactivate_btn.enabled = false;
      w.help_btn.enabled = false;
    } else {
      w.help_btn.enabled = true;
      if ( s.checked ) {
        w.deactivate_btn.enabled = true;
      } else {
        w.activate_btn.enabled = true;
      }
    }
  }
  w.activate_btn.onClick = toggle_active;
  w.deactivate_btn.onClick = toggle_active;
  w.help_btn.onClick = call_url;

  w.sets_tab.add("panel {text: 'huba'}")
  w.show();

  function toggle_active() {
    try {
      w.script_list.selection.checked = ! w.script_list.selection.checked;
      this.enabled = false;
      if ( this.text == __('activate') ) {
        w.deactivate_btn.enabled = true;
      } else {
        w.activate_btn.enabled = true;
      }
    } catch(e) {
      alert( e.message + " on " + e.line );
    }
  }
  function call_url() {
    if ( ! w.script_list.selection ) return;
    __open_website( w.script_list.selection.url );
  }
}

function __( id ) {
  var txt = "";
  try {
    var a = loc_strings;
  } catch(e) {
    loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    if (DBG) $.writeln("loaded loc-strings");
  }

  if (loc_strings.hasOwnProperty(id)) {
    txt = localize(loc_strings[id]);
  } else {
    txt = id
  }
	var re;
	for ( var n = 1; n < arguments.length; n++ ) {
		try {
			re = new RegExp( "_" + n.toString() + "_" );
			txt = txt.replace( re,  arguments[n].toString() );
		} catch(e) {
			__log( "error", e.message + " on " + e.line, script_id);
		}
	}
	return txt;
}
function get_script_folder_path() {
    try {
      return app.activeScript.parent.fullName;
    } catch (e) { 
      return e.fileName.replace(/\/[^\/]+$/, "");
    }
}
