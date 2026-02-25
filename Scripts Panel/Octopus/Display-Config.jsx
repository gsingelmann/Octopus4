/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Defines the settings for the "display" script

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-04-26

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
// #targetengine octopus_displayconfig
#targetengine octopus_display
#include "./Octopus-include-2.jsxinc"
__init();

var script_id = "display-config"
__log( "run", script_id, script_id);

// ----------------------------------------------------------------------------------------------------------------
//   Wenn ich die Presets hier auslese, kann ich sie auch gleich anwenden.
// ----------------------------------------------------------------------------------------------------------------
var presets = [];
try {
  var cfg_folder_path = PATH_DATA_FOLDER + "/prefs/display-configs";
  __ensureFolder( cfg_folder_path );
  var cfg_folder = new Folder( cfg_folder_path ),
      cfg_files = cfg_folder.getFiles( "*.json" );
  cfg_files.sort( function(a,b) {
    if ( a.name < b.name ) return -1;
    if ( a.name > b.name ) return 1;
    return 0;
  })
  for ( var n = 0; n < cfg_files.length; n++ ) { 
    var aux = __readJson( cfg_files[n] );
    if (aux) presets.push( aux );
  }
} catch(e) {
  __alert('stop', __('alert_wrong_params') + "\n\n" + e, "Stop", "OK");
  exit();
}

// ----------------------------------------------------------------------------------------------------------------
//   Prefs beziehen sich auf das, was automstisch passieren soll
// ----------------------------------------------------------------------------------------------------------------
var prefs = __readJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json" );
if ( ! prefs ) {
  prefs = {default_cfg: "", use_default: false, show_panel: false};
  __writeJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json", prefs );
}

var to_be_applied = preset_manager();
if ( to_be_applied ) {
  var script_path;
  for ( var n = 0; n < presets.length; n++ ) {
    if ( presets[n].name == to_be_applied ) {
      script_path = __get_script_path( true );
      script_path += "/Display2.jsx";
      break;
    }
  }
  app.insertLabel("octopus-display-argument", to_be_applied)
  app.doScript( File( script_path ) );
}

function is_debugger() {
	try {
		var scriptPath  = app.activeScript.fullName;
		return false;
	} 
	catch (e) { 
		return true;
	}
}

// ----------------------------------------------------------------------------------------------------------------
//  Auswahl des Presets zum Bearbeiten
// ----------------------------------------------------------------------------------------------------------------
function preset_manager() {
  var location = app.extractLabel("octopus_display_wpos")
  if ( location ) location = JSON.parse(location);

  var wtype = is_debugger() ? "dialog" : "palette";

  var w = new Window( wtype + " {orientation: 'column', alignChildren: ['fill', 'fill'], text: '"+ __('manager_title')+"'}");
  w.apply_this = null;
  w.fstrow = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}")
  w.main = w.fstrow.add("group {alignChildren: ['fill', 'fill'], orientation: 'column'}");
  w.btns = w.fstrow.add("group {alignChildren: ['fill', 'top'], orientation: 'column'}");
  w.options = w.add("group {orientation: 'column', alignChildren: ['left', 'top']}");
  w.main.preferredSize.width = 250;
  // ---- Listbox ----
  w.lb = w.main.add("listbox");
  for ( var n = 0; n < presets.length; n++ ) {
    w.lb.add("item", presets[n].name );
    w.lb.items[n].file = cfg_files[n];
  }
  if ( prefs.default_cfg ) {
    w.lb.selection = 0
    for ( var n = 0; n < presets.length; n++ ) if (presets[n].name == prefs.default_cfg ) w.lb.selection = n;
  } else {
    w.lb.selection = 0;
  }
  w.lb.onChange = function() {
    if ( w.lb.selection ) {
      w.edit_btn.enabled = true;
      w.delete_btn.enabled = true;
      w.set_btn.enabled = true;
      w.export_btn.enabled = true;
    } else {
      w.edit_btn.enabled = false;
      w.delete_btn.enabled = false;
      w.set_btn.enabled = false;
      w.export_btn.enabled = false;
    }
  }

  // ---- Options ----
  w.options.one = w.options.add("group {orientation: 'row'}");
  w.options.show_panel = w.options.add("checkbox", undefined, __('show_on_startup'));
  w.options.show_panel.value = !!prefs.show_panel;
  var _label = __('ui_usedefault').replace(/___/, prefs.default_cfg ? prefs.default_cfg : "" );
  w.options.use_default = w.options.add("checkbox", [undefined, undefined, 450, 20], _label);
  w.options.use_default.value = !!prefs.use_default;
  if ( ! prefs.default_cfg ) w.options.use_default.enabled = false;
  w.options.use_default.onClick = function() {
    prefs.use_default = this.value;
    __writeJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json", prefs );
  }
  w.options.show_panel.onClick = function() {
    prefs.show_panel = this.value;
    __writeJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json", prefs );
  }

  // ---- Buttons ----
  w.defaultElement = w.btns.add("button", undefined, __('ui_ok'));
  w.new_btn = w.btns.add("button", undefined, __('new'));
  w.edit_btn = w.btns.add("button", undefined, __('edit'));
  w.delete_btn = w.btns.add("button", undefined, __('delete'));
  w.btns.add("panel", [undefined, undefined, 50, 2])
  w.import_btn = w.btns.add("button", undefined, __('import'));
  w.export_btn = w.btns.add("button", undefined, __('export'));
  w.btns.add("panel", [undefined, undefined, 50, 2])
  w.set_btn = w.btns.add("button", undefined, __('ui_setdefault'));

  w.defaultElement.onClick = function () {
    this.window.close();
  }
  w.new_btn.onClick = function() {
    
    var p = null;
    if ( w.lb.selection ) {
      p = __deep_copy( presets[ w.lb.selection.index ] );
    }
    var neu = main( "new", p );
    if ( neu ) {
      var new_name = neu.config.name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9]/g, "") + "_cfg.json";
      var tgt = new File( cfg_folder_path + "/" + new_name );
      var do_write = true;
      if (tgt.exists) {
        do_write = __alert(
          "stop", 
          __('file_exists'), undefined, 
          [
            {text: __('ui_ok'), value: true},
            {text: __('ui_cancel'), value: false},
          ]
        )
      }
      if (do_write ) {
        __writeJson( tgt, neu.config );
      }
      var aux = w.lb.add("item", neu.config.name);
      aux.file = tgt;

      if ( neu.apply ) {
        this.window.apply_this = neu.config.name;
        this.window.close();
      }
    }
    $.bp(false);
  }
  w.edit_btn.onClick = function() {
    if ( ! w.lb.selection ) return;
    var p = __deep_copy( presets[ w.lb.selection.index ] );
    var anders = main( "edit", p );
    if ( anders ) {
      w.lb.selection.text = anders.config.name;
      presets[ w.lb.selection.index ] = anders.config;
      __writeJson( w.lb.selection.file, anders.config );
      // $.writeln( "config geschrieben: " + aux);
      if ( anders.apply ) {
        w.apply_this = anders.config.name;
        w.close();
      }
    }

  }
  w.delete_btn.onClick = function() {
    var do_delete = __alert(
      "stop", 
      __('really_delete'), undefined, 
      [
        {text: __('ui_ok'), value: true},
        {text: __('ui_cancel'), value: false},
      ]
    )
    if ( do_delete ) {
      if ( w.lb.selection.text == prefs.default_cfg ) {
        prefs.default_cfg = "";
        w.options.use_default.enabled = false;
        __writeJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json", prefs );
      }
      w.lb.selection.file.remove();
      w.lb.remove(w.lb.selection);
    }
  }

  w.import_btn.onClick = function() {
    var fp = File.openDialog( __('import_from_where'), "*_cfg.json", true );
    var aux = fp.constructor.name;
    if ( ! fp ) return;
    for ( var n = 0; n < fp.length; n++ ) {
      var tgt = cfg_folder_path + "/" + fp[n].name;
      fp[n].copy( tgt );
      var aux = w.lb.add("item", fp[n].name.replace(/\.json/, "") );
      aux.file = new File( tgt );
    }
  }
  w.export_btn.onClick = function() {
    var fp = Folder.selectDialog( __('export_to_where') );
    if ( ! fp ) return;
    var tgt = fp.fullName + "/" + w.lb.selection.file.name;
    w.lb.selection.file.copy( File( tgt ) );
  }

  w.set_btn.onClick = function() {
    if ( ! w.lb.selection ) return;
    prefs.default_cfg = w.lb.selection.text;
    w.options.use_default.enabled = true;
    __writeJson( PATH_DATA_FOLDER + "/prefs/" + script_id + "-pref.json", prefs );
    var _t = __('ui_usedefault').replace(/___/, prefs.default_cfg )
    w.options.use_default.text = _t;
  }
  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_displaycfg", JSON.stringify( w.location ));
  }

  w.show();

  var aux = app.extractLabel( "octopus_panelpos_displaycfg" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( w, aux.x, aux.y );
  } catch(e) {}

  return w.apply_this;
}
// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------
//  Edit Preset
// ----------------------------------------------------------------------------------------------------------------
function main( what_to_do, preset ) {
  
  // In config stehen meine Default-Werte und die Struktur der Optionen
  // Die Struktur nehme ich, um die Werte aus den gespeicherten Configs in `configs` abzugleichen
  var config, enums;
  init_cfg();
  // Falls im Vorgabe-config localized vorkommt, jetzt übersetzen
  for ( var m = 0; m < config.optiongroups.length; m++ ) {
    for ( n = 0; n < config.optiongroups[m].options.length; n++ ) {
      var v = config.optiongroups[m].options[n].value;
      if ( v.constructor.name == "String" && v.substr(0,2) == "__" ) {
        config.optiongroups[m].options[n].value = eval( v );
      }
    }
  }
  
  // Die controlgroups etc werden unten von saved_prefs in config übertragen, der Name nicht.
  if ( what_to_do == "new" ) {
    if ( preset ) {
      saved_prefs = __deep_copy( preset );
      config.name = preset.name + "-1";
    } else {
      saved_prefs = __deep_copy( config );
      config.name = __('new_preset');
    }
  } else if ( what_to_do == "edit" ) {
    saved_prefs = __deep_copy( preset );
    config.name = preset.name;
  }
  
  // ----------------------------------  Array abgleichen ------------------
  // Es kann sein, dass neues Script = geänderte Default-Struktur
  // -> Wir mappen die gespeicherten Werte in die neue Struktur und speichern die dann
  for ( var a = 0; a < saved_prefs.optiongroups.length; a++ ) {
    for ( var m = 0; m < config.optiongroups.length; m++ ) {
      if ( config.optiongroups[m].id == saved_prefs.optiongroups[a].id ) {
        for ( b = 0; b < saved_prefs.optiongroups[a].options.length; b++ ) {
          for ( n = 0; n < config.optiongroups[m].options.length; n++ ) {
            if ( config.optiongroups[m].options[n].id == saved_prefs.optiongroups[a].options[b].id ) {
              // Ich brauche für die Workspaces die Option, localized als Value zu haben
              var v = saved_prefs.optiongroups[a].options[b].value
              if ( typeof v == "string" && v.substring(0,2) == "__" ) {
                var aux = saved_prefs.optiongroups[a].options[b].value,
                    aux2 = eval( saved_prefs.optiongroups[a].options[b].value );
                config.optiongroups[m].options[n].value = eval(v);
              } else {
                config.optiongroups[m].options[n].value = v;
              }
              config.optiongroups[m].options[n].aktiv = saved_prefs.optiongroups[a].options[b].aktiv;
            } // option-id ==
          }   // options loop
        }     // saved options loop
      }       // group-id ==
    }         // group loop
  }           // saved group loop


  var lblw = 180;
  var editw = 200;

  var w = new Window('dialog {text: "' + __("ui_config") + '", opacity: 1, orientation: "column", alignChildren: ["fill", "fill"]}');
  // ---------------------- rows ----------------------------------------------------------
  w.rows = {};
  // ---------------------- Octopus-CI ----------------------------------------------------------
  __insert_head( w, "Display-Config-v2" );

  w.name_group = w.add("panel {alignChildren: ['fill', 'bottom'], orientation: 'row', text: '" + __('new_preset_name') + "'}");
  w.main = w.add("group {preferredWidth: 600, alignChildren: ['fill', 'fill']}");
  w.btnarea = w.add("group {alignment: ['right', 'top'], orientation: 'row'}");

  w.opac = w.add("slider", undefined, 1, 0.1, 1);
  w.opac.onChanging = function () {
    this.window.opacity = this.value;
  }

  // w.name_group.add("statictext", undefined, __('new_preset_name'));
  w.preset_name = w.name_group.add("edittext", undefined, config.name);
  w.preset_name.onChange = function() {
    config.name = this.text;
  }

  w.main.row = w.main.add("group {alignment: ['fill', 'fill'], alignChildren: 'fill', orientation: 'row'}");
  w.main.columns = [];
  w.main.columns[0] = w.main.row.add("group {alignment: ['fill', 'fill'], alignChildren: 'fill', orientation: 'column'}");
  w.main.columns[1] = w.main.row.add("group {alignment: ['fill', 'fill'], alignChildren: 'fill', orientation: 'column'}");
//  w.main.columns[2] = w.main.row.add("group {alignment: ['fill', 'fill'], alignChildren: 'fill', orientation: 'column'}");

  for (var n_group = 0; n_group < config.optiongroups.length; n_group++) {
    var column = w.main.columns[config.optiongroups[n_group].column];
    var pnl = column.add("panel {alignChildren: ['fill', 'fill'], text: '" + config.optiongroups[n_group].name + "'}");

    for (var n_option = 0; n_option < config.optiongroups[n_group].options.length; n_option++) {
      var option = config.optiongroups[n_group].options[n_option];

      var row = pnl.add("group {orientation: 'row'}")
      row.option_id = option.id;
      row.group_id = config.optiongroups[n_group].id;
      row.kind = option.type;

      row.add('statictext', [undefined, undefined, lblw, 20], option.name + ":");

      // row.aktiv = row.add("checkbox {text: 'aktiv', value: " + option.aktiv + "}");
      row.aktiv = row.add("checkbox {text: '" + __("ui_active") + "', value: " + option.aktiv + "}");
      row.aktiv.onClick = function () {
        var row = this.parent;
        // state aktualisieren
        update_state( row.group_id, row.option_id, undefined, this.value );
        // alle felder (de)aktivieren
        for (var n = 0; n < row.fields.length; n++) {
          row.fields[n].enabled = this.value;
        }
      }

      row.add("statictext", [undefined, undefined, 20, 20], "  ")

      row.fields = [];
      // ----------------------------------------------  BOOLEAN --------------------------------
      if (option.type == "boolean") {
        row.fields.push(row.add("radiobutton", undefined, __("ui_on")));
        row.fields.push(row.add("radiobutton", undefined, __("ui_off")));
        row.fields[0].onClick = handle_rb;
        row.fields[1].onClick = handle_rb;
        if (option.value) {
          row.fields[0].value = true;
        } else {
          row.fields[1].value = true;
        }
        
      } else if ( option.id == "workspace" ) {
        // ----------------------------------------------  Workspace --------------------------------
        var entries = [];
        var aux = get_list_of_workspaces();
        var sel = 0;
        for (var n = 0; n < aux.length; n++) {
          entries.push( aux[n] );
          if (aux[n] == option.value) sel = n;
        }
        row.fields.push(row.add('dropdownlist', [undefined, undefined, editw, 20], entries));
        row.fields[0].selection = sel;
        row.fields[0].enabled = option.aktiv;
        row.fields[0].onChange = function () {
          var row = this.parent;
          var id = row._id;
          var n = this.selection.index;
          update_state( row.group_id, row.option_id, get_list_of_workspaces()[n] , undefined);
        }

      } else if (option.type == "string") {
        // ----------------------------------------------  String --------------------------------
        row.fields.push(row.add('edittext', [undefined, undefined, editw, 20], option.value));
        row.fields[0].enabled = option.aktiv;
        row.fields[0].onChange = function () {
          var row = this.parent;
          var aux = this;
          update_state( row.group_id, row.option_id, this.text , undefined);
        }
        
      } else if (option.type == "number") {
        // ----------------------------------------------  Number --------------------------------
        row.fields.push(row.add('edittext', [undefined, undefined, editw, 20], option.value));
        row.fields[0].enabled = option.aktiv;
        row.fields[0].onChange = function () {
          var row = this.parent;
          this.text = this.text.replace(/,/, ".");
          if (isNaN(Number(this.text))) {
            this.text = get_state( row.group_id, row.option_id );
          } else {
            update_state( row.group_id, row.option_id, Number(this.text) , undefined);
          }
        }
        
      } else if (option.type == "enum") {
        // ----------------------------------------------  Enum --------------------------------
        var entries = [];
        var sel = 0;
        for (var n = 0; n < enums[option.enum_options_id].values.length; n++) {
          entries.push(enums[option.enum_options_id].values[n].name);
          if (enums[option.enum_options_id].values[n].value == option.value) sel = n;
        }
        row.fields.push(row.add('dropdownlist', [undefined, undefined, editw, 20], entries));
        row.fields[0].selection = sel;
        row.fields[0].enabled = option.aktiv;
        row.fields[0].enum_id = option.enum_options_id;
        row.fields[0].onChange = function () {
          var row = this.parent;
          var id = row._id;
          var n = this.selection.index;
          update_state( row.group_id, row.option_id, enums[ this.enum_id ].values[n].value , undefined);
        }
      }
      // w.rows.push( row );
      w.rows[row.group_id + "." + row.option_id] = row;
    }   // option loop
  }     // optiongroup loop


  function update_state( group_id, option_id, value, aktiv ) {
    for ( var n = 0; n < config.optiongroups.length; n++ ) {
      if ( config.optiongroups[n].id == group_id ) {
        for ( var m = 0; m < config.optiongroups[n].options.length; m++ ) {
          if ( config.optiongroups[n].options[m].id == option_id ) {
            if (undefined !== value) {
              config.optiongroups[n].options[m].value = value;
            }
            if (undefined !== aktiv) {
              config.optiongroups[n].options[m].aktiv = aktiv;
            }
            return true;
          }
        }
      }
    }
    return false;
  }

  function get_state( group_id, option_id ) {
    for ( var n = 0; n < config.optiongroups.length; n++ ) {
      if ( config.optiongroups[n].id == group_id ) {
        for ( var m = 0; m < config.optiongroups[n].options.length; m++ ) {
          if ( config.optiongroups[n].options[m].id == option_id ) {
            return config.optiongroups[n].options[m].value;
          }
        }
      }
    }
    return false;
  }

  function handle_rb() {
    var row = this.parent;
    if (this.text == __("ui_on")) {
      update_state( row.group_id, row.option_id, true, undefined );
    } else {
      update_state( row.group_id, row.option_id, false, undefined );
    }
  }
  

  w.cancelElement = w.btnarea.add("button", undefined, __("ui_cancel"));
  w.ok_element = w.btnarea.add("button", undefined, __('ui_done'))
  w.defaultElement = w.btnarea.add("button", undefined, __("ui_apply"));
  if ( app.documents.length == 0 ) w.defaultElement.enabled = false;
  w.ok_element.onClick = function() {
    this.window.close("done");
  }


  var rs = w.show();

  if ( rs == 0 ) {  // clicked "done"
    return {config: config, apply: false }
  } else if (rs == 1) {
    return {config: config, apply: true };
  } else {
    return null;
  }




  function init_cfg() {
    enums = {
      proofingType: {
        enumbase: ProofingType,
        values: [
          {
            name: __("proof_off"),
            value: "PROOF_OFF"
          },
          {
            name: __("proof_work"),
            value: "WORKING_CMYK"
          },
          {
            name: __("proof_doc"),
            value: "DOCUMENT_CMYK"
          },
        ]
      },
      screenMode: {
        enumbase: ScreenModeOptions,
        values: [
          {
            name: __("mode_off"),
            value: "PREVIEW_OFF"
          },
          {
            name: __("mode_page"),
            value: "PREVIEW_TO_PAGE"
          },
          {
            name: __("mode_bleed"),
            value: "PREVIEW_TO_BLEED"
          },
          {
            name: __("mode_info"),
            value: "PREVIEW_TO_SLUG"
          },
        ]
      },
      transformReferencePoint: {
        enumbase: AnchorPoint,
        values: [
          {
            name: __("anchor_topleft"),
            value: "TOP_LEFT_ANCHOR"
          },
          {
            name: __("anchor_center"),
            value: "CENTER_ANCHOR"
          },
        ]
      },
      viewDisplaySettings: {
        enumbase: ViewDisplaySettings,
        values: [
          {
            name: __("quality_opt"),
            value: "OPTIMIZED"
          },
          {
            name: __("quality_normal"),
            value: "TYPICAL"
          },
          {
            name: __("quality_high"),
            value: "HIGH_QUALITY"
          },
        ]
      },
      zoom: {
        enumbase: ZoomOptions,
        values: [
          {
            name: "100%",
            value: "ACTUAL_SIZE"
          },
          {
            name: __("zoom_page"),
            value: "FIT_PAGE"
          },
          {
            name: __("zoom_spread"),
            value: "FIT_SPREAD"
          },
          {
            name: __("zoom_pasteboard"),
            value: "SHOW_PASTEBOARD"
          },
        ]
      },
      measurementUnits: {
        enumbase: MeasurementUnits,
        values: [
          {
            name: __("measure_mm"),
            value: "MILLIMETERS"
          },
          {
            name: __("measure_cm"),
            value: "CENTIMETERS"
          },
          {
            name: __("measure_point"),
            value: "POINTS"
          },
          {
            name: __("measure_pixel"),
            value: "PIXELS"
          }
        ]
      },
      rulerOrigin: {
        enumbase: RulerOrigin,
        values: [
          {
            name: __("origin_page"),
            value: "PAGE_ORIGIN"
          },
          {
            name: __("origin_spread"),
            value: "SPREAD_ORIGIN"
          },
          {
            name: __("origin_spine"),
            value: "SPINE_ORIGIN"
          },
        ]
      },
      uicolors: {
        enumbase: UIColors,
        values: [
          { name: __("colors_lightblue"), value: "LIGHT_BLUE", },
          { name: __("colors_red"), value: "RED", },
          { name: __("colors_green"), value: "GREEN", },
          { name: __("colors_blue"), value: "BLUE", },
          { name: __("colors_yellow"), value: "YELLOW", },
          { name: __("colors_magenta"), value: "MAGENTA", },
          { name: __("colors_cyan"), value: "CYAN", },
          { name: __("colors_grey"), value: "GRAY", },
          { name: __("colors_black"), value: "BLACK", },
          { name: __("colors_orange"), value: "ORANGE", },
          { name: __("colors_darkgreen"), value: "DARK_GREEN", },
          { name: __("colors_teal"), value: "TEAL", },
          { name: __("colors_tan"), value: "TAN", },
          { name: __("colors_brown"), value: "BROWN", },
          { name: __("colors_violet"), value: "VIOLET", },
          { name: __("colors_gold"), value: "GOLD", },
          { name: __("colors_darkblue"), value: "DARK_BLUE", },
          { name: __("colors_pink"), value: "PINK", },
          { name: __("colors_lavender"), value: "LAVENDER", },
          { name: __("colors_brick"), value: "BRICK_RED", },
          { name: __("colors_olivegreen"), value: "OLIVE_GREEN", },
          { name: __("colors_peach"), value: "PEACH", },
          { name: __("colors_burgundy"), value: "BURGUNDY", },
          { name: __("colors_grassgreen"), value: "GRASS_GREEN", },
          { name: __("colors_ochre"), value: "OCHRE", },
          { name: __("colors_purple"), value: "PURPLE", },
          { name: __("colors_lightgrey"), value: "LIGHT_GRAY", },
          { name: __("colors_charcoal"), value: "CHARCOAL", },
          { name: __("colors_gridblue"), value: "GRID_BLUE", },
          { name: __("colors_gridorange"), value: "GRID_ORANGE", },
          { name: __("colors_fiesta"), value: "FIESTA", },
          { name: __("colors_lightolive"), value: "LIGHT_OLIVE", },
          { name: __("colors_lipstick"), value: "LIPSTICK", },
          { name: __("colors_cuteteal"), value: "CUTE_TEAL", },
          { name: __("colors_suplhur"), value: "SULPHUR", },
          { name: __("colors_gridgreen"), value: "GRID_GREEN", },
          { name: __("colors_white"), value: "WHITE", },
        ]
      }
    };
    config_test = {
      "name": "Default",
      "optiongroups": [
        {
          "name": "Fenster-Einstellungen", 
          "id": "layoutWindows",
          "column": 0,
          "options": [
            {
              "type": "boolean",
              "name": "Überdruckenvorschau",
              "object": "doc.layoutWindows[0]",
              "id": "overprintPreview",
              "value": false,
              "aktiv": true
            },
            {
              "type": "enum",
              "name": "Proof",
              "id": "proofingType",
              "object": "doc.layoutWindows[0]",
              "enumerator": "ProofingType",
              "value": "PROOF_OFF",
              "enum_options_id": "proofingType",
              "aktiv": false
            },
            {
              "type": "string",
              "name": "Proof-Profil",
              "id": "proofingProfile",
              "object": "doc.layoutWindows[0]",
              "value": "PSO Coated v3",
              "aktiv": false
            }
          ]
        },
        {
          "name": "Ansicht",
          "id": "viewPreferences",
          "column": 0,
          "options": [
            {
              "type": "boolean",
              "name": "Lineale einblenden",
              "id": "showRulers",
              "object": "doc.viewPreferences",
              "value": true,
              "aktiv": true
            },
            {
              "type": "enum",
              "name": "Linealeinheit horizontal",
              "id": "horizontalMeasurementUnits",
              "object": "doc.viewPreferences",
              "enumerator": "MeasurementUnits",
              "enum_options_id": "measurementUnits",
              "value": "MILLIMETERS",
              "aktiv": true
            }
          ]
        }
      ]
    }



    config = {
      name: "Default",
      optiongroups: [
        {
          name: __("window_settings"),
          id: "layoutWindows",
          column: 0,
          options: [
            {
              type: "boolean",
              name: __("preview_oppreview"),
              object: "doc.layoutWindows[0]",
              id: "overprintPreview",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("view_page_1"),
              object: "doc.layoutWindows[0]",
              id: "activePage",
              value: true,
              aktiv: true
            },
            {
              type: "enum",
              name: __("preview_proof"),
              id: "proofingType",
              object: "doc.layoutWindows[0]",
              enumerator: "ProofingType",
              value: "PROOF_OFF",
              enum_options_id: "proofingType",
              aktiv: false
            },
            {
              type: "string",
              name: __("preview_profile"),
              id: "proofingProfile",
              object: "doc.layoutWindows[0]",
              value: "PSO Coated v3",
              aktiv: false
            },
            {
              type: "boolean",
              name: __("preview_preserve_cmyk"),
              id: "preserveColorNumbers",
              object: "doc.layoutWindows[0]",
              value: true,
              aktiv: false
            },
            {
              type: "boolean",
              name: __("preview_sim_black"),
              id: "simulateBlackInk",
              object: "doc.layoutWindows[0]",
              value: true,
              aktiv: false
            },
            {
              type: "boolean",
              name: __("preview_sim_paper"),
              id: "simulatePaperWhite",
              object: "doc.layoutWindows[0]",
              value: false,
              aktiv: false
            },
            {
              type: "enum",
              name: __("view_trp"),
              id: "transformReferencePoint",
              object: "doc.layoutWindows[0]",
              enumerator: "AnchorPoint",
              enum_options_id: "transformReferencePoint",
              value: "TOP_LEFT_ANCHOR",
              aktiv: true
            },
            {
              type: "enum",
              name: __("view_screenmode"),
              id: "screenMode",
              object: "doc.layoutWindows[0]",
              enumerator: "ScreenModeOptions",
              enum_options_id: "screenMode",
              value: "PREVIEW_TO_PAGE",
              aktiv: true
            },
            {
              type: "enum",
              name: __("view_quality"),
              id: "viewDisplaySetting",
              object: "doc.layoutWindows[0]",
              enumerator: "ViewDisplaySettings",
              enum_options_id: "viewDisplaySettings",
              value: "TYPICAL",
              aktiv: true
            },
            {
              type: "enum",
              name: __("view_zoom"),
              id: "zoom",
              object: "doc.layoutWindows[0]",
              enumerator: "ZoomOptions",
              enum_options_id: "zoom",
              value: "FIT_SPREAD",
              aktiv: true
            }
          ]
        },
        {
          name: __("view_view"),
          id: "viewPreferences",
          column: 0,
          options: [
            {
              type: "boolean",
              name: __("show_rulers"),
              id: "showRulers",
              object: "doc.viewPreferences",
              value: true,
              aktiv: true
            },
            {
              type: "enum",
              name: __("ruler_unit_horz"),
              id: "horizontalMeasurementUnits",
              object: "doc.viewPreferences",
              enumerator: "MeasurementUnits",
              enum_options_id: "measurementUnits",
              value: "MILLIMETERS",
              aktiv: true
            },
            {
              type: "enum",
              name: __("ruler_unit_vert"),
              id: "verticalMeasurementUnits",
              object: "doc.viewPreferences",
              enumerator: "MeasurementUnits",
              enum_options_id: "measurementUnits",
              value: "MILLIMETERS",
              aktiv: true
            },
            {
              type: "enum",
              name: __("show_ruler_enum"),
              id: "rulerOrigin",
              object: "doc.viewPreferences",
              enumerator: "RulerOrigin",
              enum_options_id: "rulerOrigin",
              value: "PAGE_ORIGIN",
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_frame_edges"),
              id: "showFrameEdges",
              object: "doc.viewPreferences",
              value: true,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_notes"),
              id: "showNotes",
              object: "doc.viewPreferences",
              value: false,
              aktiv: true
            },
          ]
        },
        {
          "name": __('workspace'),
          "id": "workspace",
          "column": 0,
          "options": [
            {
              "type": "string",
              "name": __('workspace'),
              "id": "workspace",
              "object": null,
              "value": "__('default_workspace')",
              "aktiv": true
            }
          ]
        },
        {
          name: __("show_typo"),
          id: "textPreferences",
          column: 1,
          options: [
            {
              type: "boolean",
              name: __("show_keeps"),
              id: "highlightKeeps",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_subst_fonts"),
              id: "highlightSubstitutedFonts",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_subst_glyphs"),
              id: "highlightSubstitutedGlyphs",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_hjviolation"),
              id: "highlightHjViolations",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("show_kerning"),
              id: "highlightCustomSpacing",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("styles_show_diverge"),
              id: "enableStylePreviewMode",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("styles_hiddenchars"),
              id: "showInvisibles",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "boolean",
              name: __("styles_reset"),
              id: "reset_styles",
              object: "doc.textPreferences",
              value: false,
              aktiv: true
            },
          ]
        },
        {
          name: __("grid_grid1"),
          id: "gridPreferences",
          column: 1,
          options: [
            {
              type: "boolean",
              name: __("grid_baseline"),
              id: "baselineGridShown",
              object: "doc.gridPreferences",
              value: false,
              aktiv: true
            },
            {
              type: "number",
              name: __("grid_threshold"),
              id: "baselineViewThreshold",
              object: "doc.gridPreferences",
              value: 200,
              aktiv: true
            },
            {
              type: "enum",
              name: __("grid_baselinecolor"),
              id: "baselineColor",
              object: "doc.gridPreferences",
              enumerator: "UIColors",
              enum_options_id: "uicolors",
              value: "GRID_BLUE",
              aktiv: true
            },
            {
              name: __("grid_grid"),
              id: "documentGridShown",
              object: "doc.gridPreferences",
              type: "boolean",
              value: false,
              aktiv: true
            },
            {
              type: "enum",
              name: __("grid_color"),
              id: "gridColor",
              object: "doc.gridPreferences",
              enumerator: "UIColors",
              enum_options_id: "uicolors",
              value: "GRID_ORANGE",
              aktiv: true
            },
            {
              name: __("grid_inback"),
              id: "gridsInBack",
              object: "doc.gridPreferences",
              type: "boolean",
              value: true,
              aktiv: true
            },
          ]
        },
        {
          name: __("guides_guides"),
          id: "guidePreferences",
          column: 1,
          options: [
            {
              name: __("guides_show"),
              id: "guidesShown",
              object: "doc.guidePreferences",
              type: "boolean",
              value: true,
              aktiv: true
            },
            {
              name: __("guides_inback"),
              id: "guidesInBack",
              object: "doc.guidePreferences",
              type: "boolean",
              value: false,
              aktiv: true
            },
            {
              name: __("guides_lock"), 
              id: "guidesLocked",
              object: "doc.guidePreferences",
              type: "boolean",
              value: false,
              aktiv: true
            },
            {
              type: "enum",
              name: __("guides_color"),
              id: "rulerGuidesColor",
              object: "doc.guidePreferences",
              enumerator: "UIColors",
              enum_options_id: "uicolors",
              value: "CYAN",
              aktiv: false
            },
            {
              name: __("display_threshold"),
              id: "rulerGuidesViewThreshold",
              object: "doc.guidePreferences",
              type: "number",
              value: 5,
              aktiv: false
            },
            {
              name: __("smart_guides"), 
              id: "showSmartGuides",
              object: "app.smartGuidePreferences",
              type: "boolean",
              value: false,
              aktiv: true
            },
          ]
        },
      ]
    }
  }
  function get_list_of_workspaces() {
    // --------------------------------------------------------------------------
    //  Die Workspaces im App-Verzeichnis
    // --------------------------------------------------------------------------
    var ap = app.fullName;
    var aws_folder = new Folder( ap.parent.fullName + "/Presets/InDesign_Workspaces" );
    var aws = aws_folder.getFiles( function(f) { return f.constructor.name == "Folder" && f.name[0] != "." })
    if ( aws.length > 1 ) {
      var ietf = which_locale();
      ietf_folder = Folder( aws_folder.fullName + "/" + ietf);
      if ( ietf_folder.exists ) {
        aws = ietf_folder.getFiles( function(f) { return f.name.search(/\.xml$/i) != -1 && f.name[0] != "."})
      } else {
        aws = ['App-Configs nicht lesbar'];
      }
    } else {
      aws = aws[0].getFiles( function(f) { return f.name.search(/\.xml$/i) != -1 && f.name[0] != "."})
    }
  
    // --------------------------------------------------------------------------
    //  Die Workspaces im User-Verzeichnis
    // --------------------------------------------------------------------------
    var sf = app.scriptPreferences.scriptsFolder;
    var uws = new Folder( sf.parent.parent.fullName + "/Workspaces" );
    uws = uws.getFiles( function(f) { 
      return f.name.search(/\.xml$/i) != -1 
              && f.name[0] != "."
              && f.name.search(/CurrentWorkspace/i) == -1
    })
    
    // --------------------------------------------------------------------------
    //  Combine
    // --------------------------------------------------------------------------
    var aws_names = ["  "];
    for ( var n = 0; n < aws.length; n++ ) aws_names.push( decodeURI( aws[n].name.replace(/\.xml/i, "") ) );
    for ( var n = 0; n < uws.length; n++ ) aws_names.push( decodeURI( uws[n].name.replace(/\.xml/i, "") ) );
  
    return aws_names;
  
  
    function which_locale() {
      var lmap = {
        'DANISH_LOCALE': 'da_DK', 
        'ENGLISH_LOCALE': 'en_US', 
        'INTERNATIONAL_ENGLISH_LOCALE': 'en_GB', 
        'FINNISH_LOCALE': 'fi_FI', 
        'FRENCH_LOCALE': 'fr_FR', 
        'GERMAN_LOCALE': 'de_DE', 
        'ITALIAN_LOCALE': 'it_IT', 
        'PORTUGUESE_LOCALE': 'pt_PT', 
        'SPANISH_LOCALE': 'es_ES', 
        'SWEDISH_LOCALE': 'sv_SE', 
        'JAPANESE_LOCALE': 'ja_JP', 
        'ARABIC_LOCALE': 'ar_SA', 
        'CZECH_LOCALE': 'cs_CZ', 
        'GREEK_LOCALE': 'el_GR', 
        'HEBREW_LOCALE': 'he_IL', 
        'HUNGARIAN_LOCALE': 'hu_HU', 
        'POLISH_LOCALE': 'pl_PL', 
        'ROMANIAN_LOCALE': 'ro_RO', 
        'RUSSIAN_LOCALE': 'ru_RU', 
        'TURKISH_LOCALE': 'tr_TR', 
        'UKRAINIAN_LOCALE': 'uk_UA', 
        'KOREAN_LOCALE': 'ko_KR', 
        'SIMPLIFIED_CHINESE_LOCALE': 'zh_CN', 
        'TRADITIONAL_CHINESE_LOCALE': 'zh_TW', 
      };
      if ( lmap.hasOwnProperty( app.locale )) {
        return lmap[ app.locale ];
      } else {
        return null;
      }
    }
  }
  
}






function __( id ) {
  var txt = "";
    loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    if (DBG) $.writeln("loaded loc-strings");

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