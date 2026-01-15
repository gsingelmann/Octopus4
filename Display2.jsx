/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Toggles all display settings to your defaults

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
#targetengine octopus_display
#include "./Octopus-include.jsxinc"
__init();
var script_name = "Display2"
var script_version = __get_script_version( script_name);

// Hier übergebe ich vom Config-Script, wenn ein SEtting gleich angewendet werden soll
appl_arg = app.extractLabel("octopus-display-argument");
app.insertLabel( "octopus-display-argument", "" );

var dbg = false;
var w;

// if (app.documents.length) {
  handle_doc();
// }
 
// ------------------------------------------------------------------------------------------------------------------
//	Die Arbeit
// ------------------------------------------------------------------------------------------------------------------
function handle_doc() {

  // ---------------------------------------------------------------------
  //  User-gespeicherte JSON finden
  // ---------------------------------------------------------------------
  try {
    var cfg_folder_path = __get_config_path( "Display"),
        cfg_folder = new Folder( cfg_folder_path ),
        cfg_files = cfg_folder.getFiles( "*.json" );
  } catch(e) {
    __alert('stop', __('alert_wrong_params') + "\n\n" + e, "Stop", "OK");
    return;
  }
  if ( cfg_files.length == 0 ) {
    __alert( "warning", __('start_config_first'), "", "OK")
    return;
  }
  cfg_files.sort( function(a,b) {
    if ( a.name < b.name ) return -1;
    if ( a.name > b.name ) return 1;
    return 0;
  })


  var configs = {}
  for ( var nf = 0; nf < cfg_files.length; nf++ ) {
    var aux = __read_file( cfg_files[nf] );
    // cfg_files[nf].open("r");
    // var aux = cfg_files[nf].read();
    // cfg_files[nf].close();
    var config = JSON.parse(aux);
    configs[config.name] = config;
  }

  if ( appl_arg ) {
    apply_config( configs[ appl_arg ] );
  } else {
    // 240808: Bisher kann die Palette mehrfach geöffnet werden. Lässt sich das so verhindern?
    try {
      if ( w ) w.close();
    } catch(e) {}

    w = new Window("palette {orientation: 'column', alignChildren: ['fill', 'top']}");

    var cfg_script = new File( __get_script_path(true) + "/Display-Config2.jsx");
    var icon = new File( __get_appconfig_path() + "/icons/krake.png" );
    if ( icon.exists || cfg_script.exists ) {
      w.g = w.add("group {orientation: 'row', alignChildren: ['center', 'center']}")
      if ( icon.exists ) {
        w.g.add("image", undefined, icon );
      }
      if ( cfg_script.exists ) {
        var cog = new File( __get_appconfig_path() + "/icons/cogwheel_sm.png" );
        if ( cog.exists ) {
          w.cfg_btn = w.g.add("iconbutton", undefined, cog, {style: 'toolbutton'})
        } else {
          w.cfg_btn = w.g.add("button", [undefined, undefined, 50, 25], __('Edit'));
        }
        w.cfg_btn.onClick = function() {
          // this.window.close();
          app.doScript( cfg_script );
        }
      }
      w.add("panel", [undefined, undefined, 100, 3])
    }

    w.btns = {};
    var fst = null;
    for ( var p in configs ) {
      if ( ! fst ) fst = p;
      // w.btns[p] = w.add("button", [undefined, undefined, 100 , 20], p );
      w.btns[p] = w.add("button", undefined, p );
      w.btns[p].onClick = function() {
        var is_alt = ( ScriptUI.environment.keyboardState.altKey );
        __log_run(script_name);
        if ( is_alt && app.documents.length > 1 ) {
          var __w = new Window("palette");
          __w.pb = __w.add("progressbar", [undefined, undefined, 400, 10]);
          __w.pb.maxvalue = app.documents.length; 
          __w.show();
          for ( var n = 0; n < app.documents.length; n++ ) {
            __w.pb.value = n;
            apply_config( configs[this.text], app.documents[n] );
          }
          __w.close();
        } else {
          apply_config( configs[this.text] );
        }
      }
    }
    // w.defaultElement = w.add("button", undefined, "OK")
    // w.defaultElement.onClick = function() { this.window.close() }
    w.onMove = function() {
      app.insertLabel( "octopus_panelpos_display", JSON.stringify( w.location ));
    }
  
    w.show();
    var aux = app.extractLabel( "octopus_panelpos_display" );
    try {
      aux = JSON.parse( aux );
      __move_scriptui_to( w, aux.x, aux.y );
    } catch(e) {}
  
    // apply_config( configs[fst]);
  }
}
  
function apply_config( config, doc ) {
  if ( !doc ) doc = app.activeDocument;
  var msgs = [];
  for (ng = 0; ng < config.optiongroups.length; ng++) {
    var group = config.optiongroups[ng];
    var id = group.id;
    for (var n = 0; n < group.options.length; n++) {
      var option = group.options[n]
      try {
        if ( option.aktiv ) {
          var obj = eval( option.object );
        
          // Extrawürste
          if ( option.id == "activePage") {
            doc.layoutWindows[0].activePage = doc.pages.firstItem();

          } else if ( option.id == "reset_styles" ) {
            doc.textDefaults.appliedParagraphStyle = doc.paragraphStyles[0];
            doc.textDefaults.appliedCharacterStyle = doc.characterStyles[0];
            doc.pageItemDefaults.appliedGraphicObjectStyle = doc.objectStyles[1];
            doc.pageItemDefaults.appliedTextObjectStyle = doc.objectStyles[2];

          } else if ( option.id == "zoom" ) {
            // LayoutWindow.zoom( ZoomOptions.SHOW_PAGE )
            obj[ option.id ]( eval( option.enumerator + "." + option.value ) )

          } else if ( option.id == "showRulers" ) {
            doc.viewPreferences.showRulers = option.value;
            // var _m = app.menus.item("$ID/Main"),
            //     _v = _m.submenus.item('$ID/&View'),
            //     _sr = _v.menuItems.item('$ID/Show &Rulers'),
            //     _hr = _v.menuItems.item('$ID/Hide &Rulers');
            // if ( ! option.value && _hr.isValid ) {
            //   _hr.associatedMenuAction.invoke();
            // } else {
            //   if ( option.value &&  _sr.isValid ) {
            //     _sr.associatedMenuAction.invoke();
            //   }
            // }
          } else if ( option.id == "showSmartGuides") {
            app.smartGuidePreferences.enabled = option.value;
          
          } else if ( option.id == "workspace" ) {
            try {
              __log("Apply Workspace '" + option.value + "'")
              app.applyWorkspace( option.value );
            } catch(e) {
              __log_error( e );
            }

          } else {
            if ( option.type == "enum" ) {
              obj[ option.id ] = eval( option.enumerator + "." + option.value );

            } else {
              obj[ option.id ] = option.value;
            }
          } // case extrawürste
        }   // if option aktiv
      } catch (e) {
        msgs.push(id + ", " + option.id + ", " + option.value + ": " + e);
      }
    }       // options loop
  }         // group loop
  if (msgs.length) {
    //alert("Probleme\n" + msgs.join("\n"));
    __alert('stop', "Problems:\n" + msgs.join("\n"), "", "OK")
  }
}           // function apply



function __( id ) {
  loc_strings = load_translation();
  if (loc_strings.hasOwnProperty(id)) {
    return localize(loc_strings[id]);
  } else {
    return id
  }
}
function load_translation() {
  return {
    "start_config_first": {"de": "Starten Sie zuerst das 'Anzeige konfigurieren', um Ihre Einstellungen festzulegen", "en": "Start the config-script once to define your own preferences"},
    "Edit": {"de": "Edit", "en": "Edit"}
  }
}



function ensure_path_exists(path, base_path) {
  base_path = unescape(base_path);
  path = path.replace(/^\//, "");
  var bits = path.split("/");
  // Das letzte bit ist der Dateiname
  for (var n = 0; n < bits.length; n++) {
    if (!Folder(base_path + "/" + bits[n]).exists) Folder(base_path + "/" + bits[n]).create();
    base_path += "/" + bits[n];
  }
  return base_path;
}




