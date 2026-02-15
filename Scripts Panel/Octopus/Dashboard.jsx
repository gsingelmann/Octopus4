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
// #targetengine octopus_dashboard
#include "./Octopus-include-2.jsxinc"
#include "./Octopus-Tools.jsxinc"
__init(); 
script_id = "dashboard";

// -----------------------------------------------------------------------------------------------------
//  Status-Quo / Prefs laden
// -----------------------------------------------------------------------------------------------------
var prefs = get_prefs();
var cfgs = get_configs();
var changes = { toggles: {}, sets: [] }
var w_width = 750;

show_dashboard( cfgs, prefs );

function show_dashboard( cfgs, prefs ) {
  // -----------------------------------------------------------------------------------------------------
  //  Fenster und zwei Tabs
  // -----------------------------------------------------------------------------------------------------
  var w = new Window("dialog", "Dahboard", undefined /*, {closeButton: false} */);
  w.tabbed_panel = w.add("tabbedpanel {alignChildren: ['fill', 'fill']}");
  w.tabbed_panel.alignChildren = ['fill', 'fill'];
  w.script_tab = w.tabbed_panel.add("tab {text: '" +  __('tab1') + "', orientation: 'column', alignChildren: 'fill'}");
  w.sets_tab = w.tabbed_panel.add("tab", undefined, __('tab2'), {alignChildren: ['left', 'fill']})

  // w.tabbed_panel.selection = w.sets_tab;

  // -----------------------------------------------------------------------------------------------------
  //  Liste aller Scripte
  // -----------------------------------------------------------------------------------------------------
  w.script_list = w.script_tab.add(
    "listbox", 
    undefined, "", 
    {
      minimumSize: [w_width,400], 
      numberOfColumns: 2, 
      showHeaders: true, 
      columnTitles: ['Script', __('last updated')],
      columnWidths: [calc_width(75), calc_width(25)]
    }
  );
  for ( var n = 0; n < cfgs.length; n++ ) {
    if ( cfgs[n].filename.search(/\.jsx$/i) == -1 ) continue;
    var dt = cfgs[n].updated || "";
    if ( dt ) dt = dt.substr(0,10);
    var a = w.script_list.add("item", localize(cfgs[n].label));
    a.subItems[0].text = dt;
    a.checked = ! prefs.ignore.hasOwnProperty( cfgs[n].id );
    a.ix = n;
    a.sid = cfgs[n].id;
    a.url = cfgs[n].help_url;
  }
  // -----------------------------------------------------------------------------------------------------
  //  Buttons
  // -----------------------------------------------------------------------------------------------------
  w.script_btns = w.script_tab.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
  w.activate_btn = w.script_btns.add("button", undefined, __('activate'));
  w.deactivate_btn = w.script_btns.add("button", undefined, __('deactivate'));
  w.help_btn = w.script_btns.add("button", undefined, __('help'));
  w.activate_btn.enabled = false;
  w.deactivate_btn.enabled = false;
  w.help_btn.enabled = false;
  w.ok_btns = w.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
  // w.ok_btns.margins.top = 20
  w.cancelElement = w.ok_btns.add("button", undefined, __('cancel'));
  w.defaultElement = w.ok_btns.add("button", undefined, __('ok'));
  w.dbg = w.add("edittext", [undefined, undefined, w_width, 150], "", {name: "debug", multiline: true, readonly: true});

  // -----------------------------------------------------------------------------------------------------
  //  Buttons ändern state, wenn ein Script ausgewählt ist
  // -----------------------------------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------------
  //  UI, um andere Config-Sets zu haben
  // -----------------------------------------------------------------------------------------------------
  w.setlist = w.sets_tab.add("panel {orientation: 'column', alignChildren: ['left', 'top'], text: '" + __('setlist') + "'}");
  w.setlist.minimumSize = [w_width,200];
  w.add_set_group = w.sets_tab.add("panel {orientation: 'row', alignChildren: ['left', 'fill'], text: '" + __('add_set_label') + "'}");
  w.add_set_group.minimumSize = [w_width,50];

  // -----------------------------------------------------------------------------------------------------
  // Darstellung der vorhandenen Sets
  w.setlist_dd = w.setlist.add("dropdownlist", [undefined, undefined, calc_width(80), 20], []);
  for ( var n = 0; n < prefs.config_paths.length; n++ ) {
    w.setlist_dd.add("item", prefs.config_paths[n].name);
  }
  var lblwidth = calc_width(20),
      valuewidth = calc_width(80);
  w.sl_row1 = w.setlist.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
  w.sl_row2 = w.setlist.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
  w.sl_row3 = w.setlist.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
  w.sl_row1.add("statictext", [undefined, undefined, lblwidth, 20], __('settype'));
  w.sl_row2.add("statictext", [undefined, undefined, lblwidth, 20], __('setname'));
  w.sl_row3.add("statictext", [undefined, undefined, lblwidth, 20], __('setpath'));
  w.crnt_type_txt = w.sl_row1.add("statictext", [undefined, undefined, valuewidth, 20], "");
  w.crnt_name_txt = w.sl_row2.add("statictext", [undefined, undefined, valuewidth, 20], "");
  w.crnt_path_txt = w.sl_row3.add("statictext", [undefined, undefined, valuewidth, 20], "");

  w.setlist_dd.onChange = function() {
    if ( ! this.selection ) {
      w.crnt_type_txt.text = "";
      w.crnt_name_txt.text = "";
      w.crnt_path_txt.text = "";
      return;
    }
    var sel = this.selection.index;
    w.crnt_type_txt.text = prefs.config_paths[sel].type;
    w.crnt_name_txt.text = prefs.config_paths[sel].name;
    w.crnt_path_txt.text = prefs.config_paths[sel].path;
  }

  w.rm_set_btn = w.setlist.add("button", undefined, __('delete-set'));


  // -----------------------------------------------------------------------------------------------------
  //  UI-Elemente für neue Sets
  w.set_fields = w.add_set_group.add("group {orientation: 'column', alignChildren: ['left', 'fill']}");
  w.set_btns = w.add_set_group.add("group {orientation: 'column', alignChildren: ['left', 'fill']}");
  w.set_fields_row1 = w.set_fields.add("group {orientation: 'row', alignChildren: ['left', 'bottom']}");
  w.set_fields_row1.add("statictext", [undefined, undefined, calc_width(5), 20], "Name: ");
  w.set_fields_row2 = w.set_fields.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
  w.set_fields_row2.add("statictext", [undefined, undefined, calc_width(5), 20], "Path: ")

  w.set_name_fd = w.set_fields_row1.add("edittext", [undefined, undefined, calc_width(50), 20], "", {});
  // w.set_fields_row1.add("statictext", undefined, "Type: ");
  w.set_url_btn = w.set_fields_row1.add("radiobutton", undefined, "URL");
  w.set_path_btn = w.set_fields_row1.add("radiobutton", undefined, __('path'));
  w.set_path_fd = w.set_fields_row2.add("edittext", [undefined, undefined, calc_width(74), 20], "", {});

  // w.set_btns.add("statictext", undefined, " ")
  w.add_set_btn = w.set_btns.add("button", [undefined, undefined, calc_width(20), 25], __('add_set'));
  // w.set_btns.add("statictext", undefined, " ")
  w.choose_folder_btn = w.set_btns.add("button", [undefined, undefined, calc_width(20), 20], __('choose-folder'));

  w.set_url_btn.value = true;
  w.choose_folder_btn.enabled = false;

  w.set_path_btn.onClick = function() {w.choose_folder_btn.enabled = this.value;}
  w.set_url_btn.onClick = function() {w.choose_folder_btn.enabled = ! this.value;}
  w.choose_folder_btn.onClick = function() {
    var sel = Folder.selectDialog( __('choose_folder') );
    if ( sel ) w.set_path_fd.text = sel.fullName;
  }
  w.add_set_btn.onClick = function() {
    var name = w.set_name_fd.text,
        path = w.set_path_fd.text,
        type = w.set_url_btn.value ? "url" : "files";
    if (! path ) {
      alert( __('fill_out_all_fields') );
      return;
    }
    if ( ! name ) {
      name = path.split("/").pop();
    }
    var new_set = {name: name, path: path, type: type};
    prefs.config_paths.push( new_set );
    w.setlist_dd.add("item", name);
    w.setlist_dd.selection = w.setlist_dd.items.length - 1;
    w.set_name_fd.text = "";
    w.set_path_fd.text = ""; 
    changes.sets.push( {action: "add", set: new_set.path } );
    w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
  }
  w.rm_set_btn.onClick = function() {
    var sel = w.setlist_dd.selection;
    if ( ! sel ) return;
    var ix = sel.index;
    if ( ! confirm( __('delete_set_confirm', prefs.config_paths[ix].name) ) ) return;
    changes.sets.push( {action: "rm", set: prefs.config_paths[ix].path } );
    prefs.config_paths.splice(ix, 1);
    w.setlist_dd.remove(ix);
    w.crnt_type_txt.text = "";
    w.crnt_name_txt.text = "";
    w.crnt_path_txt.text = "";
    w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
  }


  // -----------------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------------
  //  Änderungen ausführen
  // -----------------------------------------------------------------------------------------------------

  w.defaultElement.onClick = function() {
    write_prefs( prefs );
    for ( var id in prefs.ignore ) {
      $.writeln( "ignoring " + id );
      uninstall( id );
    }
    w.close();

  }
  w.cancelElement.onClick = function() {
    var no_changes = JSON.stringify({ toggles: {}, sets: [] }),
        str_changes = JSON.stringify(changes);
    if ( no_changes != str_changes ) {
      if ( ! confirm( __('cancel_confirm') ) ) return;
    }
    w.close();
  }



  w.show();

  function toggle_active() {
    try {
      w.script_list.selection.checked = ! w.script_list.selection.checked;
      var id = w.script_list.selection.sid;      
      this.enabled = false;
      // -----------------------------------------------------------------------------------------------------
      //  Deactivate Script: add to ignore-list
      if ( this.text == __('activate') ) {
        changes.toggles[id] = "on";
        w.deactivate_btn.enabled = true;
        if (prefs.ignore.hasOwnProperty(id) ) delete prefs.ignore[id];
      } else {
        // -----------------------------------------------------------------------------------------------------
        //  Activate Script: remove from ignore-list
        changes.toggles[id] = "off";
        w.activate_btn.enabled = true;
        prefs.ignore[id] = true;
      }
      w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
    } catch(e) {
      alert( e.message + " on " + e.line );
    }
  }
  function call_url() {
    if ( ! w.script_list.selection ) return;
    __open_website( w.script_list.selection.url );
  }
  function calc_width(pct) {
    return Math.round(w_width * pct / 100);
  }
  function uninstall(id) {
    var cfg = null;
    for (var n = 0; n < cfgs.length; n++) {
      if (cfgs[n].id == id) {
        cfg = cfgs[n];
        break;
      }
    }
    if (!cfg) return;
    if (cfg.subpath) {
      var path = PATH_SCRIPT_PARENT + "/" + cfg.subpath + "/" + cfg.filename;
    } else {
      var path = PATH_SCRIPT_PARENT + "/" + cfg.filename;
    }
    var f = new File(path);
    if (!f.exists) {
      __log("error", "Script kann nicht deinstalliert werden: " + path, script_id);
      return;
    }
    var tgt_path = path.replace(/\/Scripts Panel\//, "/Scripts Panel Off/").replace(/\/Startup Scripts\//, "/Startup Scripts Off/");
    ensureFolder(tgt_path);
    if (__moveFile(f, tgt_path) ) {
      __log("info", "Script deinstalliert: " + path, script_id);
    } else {
      __log("error", "Script konnte nicht deinstalliert werden: " + path, script_id);
    }
  }
}

// -----------------------------------------------------------------------------------------------------
//  Ausnahmen und zusätzliche Configs
// -----------------------------------------------------------------------------------------------------
function get_prefs() {
  var prefs = __readJson( PATH_DATA_FOLDER  + "/prefs.json" );
  if ( ! prefs ) {
    prefs = {
      ignore: {},
      config_paths: []
    }
  }
  return prefs;
}
function write_prefs( prefs ) {
  __writeJson( PATH_DATA_FOLDER  + "/prefs.json", prefs );
}
// -----------------------------------------------------------------------------------------------------
// Lokale Liste der config-items
// -----------------------------------------------------------------------------------------------------
function get_configs() {
  var configs =  __readJson( PATH_DATA_FOLDER  + "/config.json" );
  return configs;
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
