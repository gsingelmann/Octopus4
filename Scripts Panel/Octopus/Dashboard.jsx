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
#include "Startup Scripts/Octopus/Include.jsxinc"
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
  if ( cfgs.length == 0 ) {
    __alert( "warnung", __('no_scripts_found'), script_id, "ok", false );
    return;
  }
  // -----------------------------------------------------------------------------------------------------
  //  Fenster und zwei Tabs
  // -----------------------------------------------------------------------------------------------------
  var w = new Window("dialog", "Dahboard", undefined /*, {closeButton: false} */);
  __insert_head(w, script_id)
  w.tabbed_panel = w.add("tabbedpanel {alignChildren: ['fill', 'fill']}");
  w.tabbed_panel.alignChildren = ['fill', 'fill'];
  w.script_tab = w.tabbed_panel.add("tab {text: '" +  __('tab1') + "', orientation: 'column', alignChildren: 'fill'}");
  w.sets_tab = w.tabbed_panel.add("tab", undefined, __('tab2'), {alignChildren: ['left', 'fill']})

  w.script_tab.margins = [20,20,20,20];
  w.sets_tab.margins = [20,20,20,20];

  // w.tabbed_panel.selection = w.sets_tab;

  // -----------------------------------------------------------------------------------------------------
  //  Liste aller Scripte
  // -----------------------------------------------------------------------------------------------------
  w.script_list = w.script_tab.add(
    "listbox", 
    undefined, "", 
    {
      minimumSize: [w_width, 200], 
      maximumSize: [w_width, 500],
      numberOfColumns: 3, 
      showHeaders: true, 
      columnTitles: ['Script', __('last updated'), "Set"],
      columnWidths: [calc_width(60), calc_width(20), calc_width(20)]
    }
  );
  w.script_list.maximumSize.height = 500;
  for ( var n = 0; n < cfgs.length; n++ ) {
    if ( cfgs[n].filename.search(/\.jsx$/i) == -1 ) continue;
    var dt = cfgs[n].updated || "";
    if ( dt ) dt = dt.substr(0,10);
    var a = w.script_list.add("item", localize(cfgs[n].label));
    a.subItems[0].text = dt;
    a.subItems[1].text = cfgs[n].set_name || "";
    a.checked = ( ! prefs.ignore ) || (! prefs.ignore.hasOwnProperty( cfgs[n].id ));
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
  w.showfolder_btn = w.script_btns.add("button", undefined, __('show-folder'));

  w.activate_btn.enabled = false;
  w.deactivate_btn.enabled = false;
  w.help_btn.enabled = false;
  w.ok_btns = w.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
  // w.ok_btns.margins.top = 20
  w.cancelElement = w.ok_btns.add("button", undefined, __('cancel'));
  w.defaultElement = w.ok_btns.add("button", undefined, __('ok'));
  // w.dbg = w.add("edittext", [undefined, undefined, w_width, 150], "", {name: "debug", multiline: true, readonly: true});

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
  w.showfolder_btn.onClick = open_folders;

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
  w.setlist_dd.selection = 0;
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

  w.set_name_fd = w.set_fields_row1.add("edittext", [undefined, undefined, calc_width(50), 20], "", {readonly: true});
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
    var path = w.set_path_fd.text,
        name = "",
        type = w.set_url_btn.value ? "url" : "file";
    if (! path ) {
      __alert( "warnung",  __('fill_out_all_fields'), "", "ok", false );
      return;
    } 
    var json = read_set_json( path + "/index.json" );
    if ( ! json ) {
      return;
    }
    name = json.set_name;
    w.set_name_fd.text = name;
    for ( var n = 0; n < prefs.config_paths.length; n++ ) {
      if ( prefs.config_paths[n].path == path ) {
        __alert( "warnung", "set exists", "", "ok", false );
        return;
      }
    }
    var new_set = {name: name, path: path, type: type};
    prefs.config_paths.push( new_set );
    w.setlist_dd.add("item", name);
    w.setlist_dd.selection = w.setlist_dd.items.length - 1;
    w.set_name_fd.text = "";
    w.set_path_fd.text = ""; 
    changes.sets.push( {action: "add", set: new_set.path } );
    // w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
  }
  w.rm_set_btn.onClick = function() {
    var sel = w.setlist_dd.selection;
    if ( ! sel ) return;
    var ix = sel.index;
    if ( ! confirm( __('delete_set_confirm', prefs.config_paths[ix].name) ) ) return;
    changes.sets.push( {action: "rm", set: prefs.config_paths[ix].path, set_name: prefs.config_paths[ix].name } );
    prefs.config_paths.splice(ix, 1);
    w.setlist_dd.remove(ix);
    w.crnt_type_txt.text = "";
    w.crnt_name_txt.text = "";
    w.crnt_path_txt.text = "";
    // w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
  }


  // -----------------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------------
  //  Änderungen ausführen
  // -----------------------------------------------------------------------------------------------------

  w.defaultElement.onClick = function() {
    $.bp();
    write_prefs( prefs );
    for ( var id in prefs.ignore ) {
      $.writeln( "ignoring " + id );
      __log("info", "Script '" + id + "' wird ignoriert/deinstalliert")
      uninstall( id );
    }
    for ( var n = 0; n < changes.sets.length; n++ ) {
      if ( changes.sets[n].action == "rm" ) {
        var f = new File( PATH_DATA_FOLDER + "/Sets/" + changes.sets[n].name + ".json");
        if ( f.exists ) f.remove();
      }
    }
    w.close(1);

  }
  w.cancelElement.onClick = function() {
    $.bp();
    var no_changes = JSON.stringify({ toggles: {}, sets: [] }),
        str_changes = JSON.stringify(changes);
    if ( no_changes != str_changes ) {
      if ( ! confirm( __('cancel_confirm') ) ) return;
    }
    w.close(2);
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
      // w.dbg.text = JSON.stringify(prefs, null, 2) + "\n\n" + JSON.stringify(changes, null, 2);
    } catch(e) {
      alert( e.message + " on " + e.line );
    }
  }
  function call_url() {
    if ( ! w.script_list.selection ) return;
    __open_website( w.script_list.selection.url );
  }
  function open_folders() {
    this.window.close();
    var f1 = new Folder( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus"),
        f2 = new Folder( PATH_SCRIPT_PARENT + "/Startup Scripts/Octopus"),
        f3 = new Folder( PATH_DATA_FOLDER );
    f1.execute();
    f2.execute();
    f3.execute();
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
    // var tgt_path = path.replace(/\/Scripts Panel\//, "/Scripts Panel Off/").replace(/\/Startup Scripts\//, "/Startup Scripts Off/");
    // __ensureFolder(tgt_path);
    // if (__moveFile(f, tgt_path) ) {
    if ( f.remove() ) {
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
  var prefs = { ignore: {}, config_paths: []};
  try {
    prefs.ignore = __readJson( PATH_DATA_FOLDER + "/Prefs/ignore.json" );
    if ( ! prefs.ignore ) prefs.ignore = {};
  } catch(e) {
    __log( "error", "prefs konnten nicht geladen werden: " + e.message + " on " + e.line, script_id);
  }
  try {
    var setdir = new Folder( PATH_DATA_FOLDER + "/Sets" );
    var sets = setdir.getFiles( function(f) { return f.name.charAt(0) != "." && f.name.search(/\.json/i) != -1});
    for ( var n = 0; n < sets.length; n++ ) {
      var aux = __readJson( sets[n] );
      if ( aux ) {
        prefs.config_paths.push( {name: aux.set_name, path: aux.base_url, type: (aux.base_url.search(/^http/i) == -1 ? "file" : "url")})
      }
    }
  } catch(e) {
    __log( "error", "configs konnten nicht geladen werden: " + e.message + " on " + e.line, script_id);
  }
  return prefs;
}
function write_prefs( prefs ) {
  $.bp();
  try {
    var setpath = PATH_DATA_FOLDER + "/Sets";
    var copied = [];
    for ( var n = 0; n < prefs.config_paths.length; n++ ) {
      var tgt_path = setpath + "/" + prefs.config_paths[n].name + ".json";
      if ( File( tgt_path ).exists ) continue;
      var json = read_set_json( prefs.config_paths[n].path + "/index.json" )
      var src = prefs.config_paths[n].path + "/index.json";
      if ( prefs.config_paths[n].type == "file" ) {
        File(src).copy( tgt_path );
      } else {
        __call_request( prefs.config_paths[n].path, "index.json", "file", tgt_path, true )
      }
      // Die prefs Datei sollte so heißen, wie im index.json
      if ( File(tgt_path).exists ) {
        var json = __readJson(tgt_path);
        if ( json.set_name != prefs.config_paths[n].name ) {
          File( tgt_path ).rename( json.set_name + ".json" );
        }
      }
    }
  } catch(e) {
    __log( "error", "prefs konnten nicht gespeichert werden: " + e.message + " on " + e.line, script_id);
    __alert( "warnung", __('prefs_save_error'), script_id, "ok", false );
  }
  try {
    __writeJson( PATH_DATA_FOLDER + "/Prefs/ignore.json", prefs.ignore )
  } catch(e) {
    __log( "error", "prefs konnten nicht gespeichert werden: " + e.message + " on " + e.line, script_id);
    __alert( "warnung", __('prefs_save_error'), script_id, "ok", false );
  }
}
function read_set_json( tgt_path ) {
  var json;
  if ( tgt_path.search(/^http/i) == -1 ) {
    json = __readJson( tgt_path );
  } else {
    var raw = __call_request( tgt_path, "index.json", "data" );
    if ( raw ) json = JSON.parse(raw);
  }
  if ( ! json ) {
    alert(__('no-config-read'));
  }
  return json;
}

// -----------------------------------------------------------------------------------------------------
// Lokale Liste der config-items
// -----------------------------------------------------------------------------------------------------
function get_configs() {
  try {
    var configs =  __readJson( PATH_DATA_FOLDER  + "/Global Set.json" );
  } catch(e) {
    __log( "error", "configs konnten nicht geladen werden: " + e.message + " on " + e.line, script_id);
    return [];
  }
  return configs;
}


function __( id ) {
  var txt = "";
    loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    // if (DBG) $.writeln("loaded loc-strings");

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
  