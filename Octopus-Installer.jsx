#targetengine "octopus_v2"
#include "Octopus-include.jsxinc"

__init();

__push_logs();
__log("\n---------------------------------\nlos", "installer");

// ---------------------------------------------------------------------------
//  Vor dem Beenden das Menü wieder entfernen, sicherheitshalber
// ---------------------------------------------------------------------------
app.eventListeners.add("beforeQuit", function () {
  try {
    __log("uninstalling scripthub-menu on closedown", "uninstall menu");

    var _main = app.menus.item("$ID/Main");
    var hub_menu = _main.submenus.item("Octopus");
    if (hub_menu && hub_menu.isValid) {
      __log("removing menu", "uninstall menu")
      hub_menu.remove();
      __log("removed menu", "uninstall menu");
    } else {
      __log("hub menu not valid", "uninstall menu");
    }
  } catch (e) { __log(e) }
})
app.eventListeners.add('afterOpen', function (evt) {
  // doc_msg_log = new File(Folder.desktop.fullName + "/logs/onOpen.txt");
  // doc_msg_log.open("a");
  // doc_msg_log.writeln("afterOpen");
  // var doc_msg_log_open = true;
  try {
    if ( evt.target.constructor.name == "Document" ) {
      // doc_msg_log.writeln("Ist doc");
      var o = evt.target.extractLabel("cuppa-onOpen-message");
      if ( o ) {
        // doc_msg_log.writeln( "Has msg: " + o);
        // doc_msg_log.close();
        // doc_msg_log_open = false;
        handle_doc_msg( evt.target );
      }
    }
  } catch(e) {
  }
  // if ( doc_msg_log_open ) doc_msg_log.close();

  try {
    if ( evt.target.constructor.name.toLowerCase().indexOf("window") != -1 ) {
      var display_prefs = __read_pref( "display_options");
      if ( display_prefs && display_prefs.use_default ) {
        var display_script = __get_script_file( "Display2" );
        if ( display_script ) {
          app.insertLabel("octopus-display-argument", display_prefs.default_cfg)
          app.doScript( display_script );
        }
      }
    }
  } catch(e) {
    alert(evt.target.toString() + "\n" + e);
  }
})

// ---------------------------------------------------------------------------
//  Integration anderer Octopus-Scripte
// ---------------------------------------------------------------------------
// close_item = app.menus.item("$ID/Main").submenus.item("$ID/&File").menuItems.item("$ID/&Close");
// close_item.associatedMenuAction.eventListeners.add('beforeInvoke', function (evt) {
//   doc_msg_log = new File(Folder.desktop.fullName + "/logs/onOpen.txt");
//   doc_msg_log.open("a");
//   try {
//     doc_msg_log.writeln( "Closing" );
//     var doc = app.activeDocument;
//     // if ( evt.target.constructor.name == "Document" ) {
//       var o = doc.extractLabel("cuppa-onOpen-message");
//       doc_msg_log.writeln( "got msg: " + o );
//       if ( o ) {
//         o = JSON.parse( o );
//         if ( o.showonclose ) {
//           handle_doc_msg( doc, "is-before-close" );
//         }
//       }
//     // }
//   } catch(e) {
//     doc_msg_log.writeln( e + "\n" + e.line );
//   }
// })



// ---------------------------------------------------------------------------
//  Was gelöscht wird, neu ist oder ins Menü kommt, wird in hub_download_configs gesetzt
//  local_cfgs muss am Ende, wenn kein Fehler auftrat, gespeichert werden
// ---------------------------------------------------------------------------
var neu= [], weg = [], menu = [];
var set_cfg = __load_set_config();
var local_cfgs = {};

try {
  __log( "Download configs", "installer")
  hub_download_configs();
} catch(e) {
  __log_error(e, "Installer", "loading configs");
  exit();
}
try {
  __log( "Download assets", "installer")
  hub_download_assets();
} catch(e) {
  __log_error(e, "Installer", "downloading assets");
  exit();
}
try {
  __log( "install menus", "installer")
  hub_install_menus();
} catch(e) {
  __log_error(e, "Installer", "installing menu");
  exit();
}
try {
  __log( "install custom menus", "installer")
  hub_install_custom_menus();
} catch(e) {
  __log_error(e, "Installer", "installing custom menu");
  exit();
}

// ---------------------------------------------------------------------------
//  Wenn alles fehlerfrei passiert ist, local-configs wegschreiben
// ---------------------------------------------------------------------------
for ( var ns = 0; ns < set_cfg.sets.length; ns++ ) {
  __write_file( 
    __get_appconfig_path() + "/" + set_cfg.sets[ns] + "_local.json", 
    JSON.stringify( local_cfgs[ set_cfg.sets[ns] ], undefined, 2)
  );
}
__write_file( 
  __get_config_path("logs") + "/installer_local.json", 
  JSON.stringify( 
    { neu: neu, weg: weg, menu: menu }
  , undefined, 2)
);
app.insertLabel( "octopus_config", JSON.stringify( local_cfgs ));
app.insertLabel( "octopus_base_url", set_cfg.baseurl );

if ( neu.length || weg.length ) {
  var msg = [];
  if (weg.length ) {
    msg.push( localize({de: "Entfernt:", en: "Removed:"}) );
    for ( var n = 0; n < weg.length; n++ ) {
      if ( weg[n].type == "script" ) {
        msg.push( "• " + localize( weg[n].title ) + " " + weg[n].version );
      }
    }
    msg.push(" ");
  }
  if ( neu.length ) {
    msg.push( localize({de: "Installiert:", en: "Installed:"}) );
    for ( var n = 0; n < neu.length; n++ ) {
      if ( neu[n].type == "script" ) {
        msg.push( "• " + localize( neu[n].title ) + " " + neu[n].version );
      }
    }
  }
  __alert( "glasses", msg.join("\n"), "Octopus-Update", "OK", "palette");
}

// ---------------------------------------------------------------------------
//   Muss für andere Script noch etwas getan werden?
// ---------------------------------------------------------------------------
var display_prefs = __read_pref( "display_options")
if ( display_prefs && display_prefs.show_panel ) {
  var display_script = __get_script_file( "Display2" );
  if ( display_script ) {
    app.doScript( display_script );
  }
}





function hub_download_configs() { 
  for ( var ns = 0; ns < set_cfg.sets.length; ns++ ) {
    var set = set_cfg.sets[ns];
    // ---------------------------------------------------------------------------
    //  Remote laden
    // ---------------------------------------------------------------------------
    var _url = set_cfg.baseurl + "/" + set_cfg.sets[ns] + "/" + set_cfg.sets[ns] + ".json";
    var r_raw = __call_request( _url)
    try {
      var r_cfg = JSON.parse( r_raw );
    } catch(e) {
      //  Fehlermeldung ist HTML-Seite, also ist ein Catch das einfachste
      continue;
    }
    // ---------------------------------------------------------------------------
    //  Local laden (oder kopieren)
    // ---------------------------------------------------------------------------
    var l_raw = __read_file( __get_appconfig_path() + "/" + set_cfg.sets[ns] + "_local.json")
    if ( ! l_raw ) {
      var l_cfg = [];
    } else {
      var l_cfg = JSON.parse( l_raw );
    }
    // ---------------------------------------------------------------------------
    //  Was ist neu oder anders?
    // ---------------------------------------------------------------------------
    var props_on_change = ['subpath', 'submenu', 'version', 'url', 'help_url', 'full_url', 'title', 'description', 'order'];
    var props_anyway = ['subpath', 'submenu', 'help_url', 'title', 'description', 'order', 'put_in_menu'];
    for ( var nr = 0; nr < r_cfg.length; nr++ ) {
      // $.writeln( JSON.stringify( r_cfg[nr], undefined, 2));
      if ( r_cfg[nr].hasOwnProperty("status") && r_cfg[nr].status == "hidden" ) continue;
      r_cfg[nr].full_url = set_cfg.baseurl + "/" + set_cfg.sets[ns] + "/" + r_cfg[nr].url;
      var rc = r_cfg[nr];
      var found = false, changed = false;
      for ( var nl = 0; nl < l_cfg.length; nl++ ) {
        if ( l_cfg[nl].script_id == rc.script_id ) {
          found = true;
          if ( hub_vnr( l_cfg[nl].version ) < hub_vnr( rc.version ) ) {
            changed = true;
            weg.push( __deep_copy(l_cfg[nl]) );
            neu.push( __deep_copy(r_cfg[nr]) );
            for ( var n = 0; n < props_on_change.length; n++) {
              if ( r_cfg[nr].hasOwnProperty( props_on_change[n] )) {
                l_cfg[nl][props_on_change[n]] = r_cfg[nr][props_on_change[n]];
              }
            }
          } else {
            for ( var n = 0; n < props_anyway.length; n++) {
              if ( r_cfg[nr].hasOwnProperty( props_anyway[n] )) {
                l_cfg[nl][props_anyway[n]] = r_cfg[nr][props_anyway[n]];
              }
            }
          } // new version
        }   // same id
      }     // local loop
      if ( ! found ) {
        neu.push( __deep_copy(r_cfg[nr]) );
        l_cfg.push( __deep_copy(r_cfg[nr]) );
      }
    }       // remote loop
    // ---------------------------------------------------------------------------
    //  Was soll weg?
    // ---------------------------------------------------------------------------
    for ( var nl = l_cfg.length-1; nl >= 0; nl-- ) {
      var found = false;
      for ( var nr = 0; nr < r_cfg.length; nr++ ) {
        if ( l_cfg[nl].script_id == r_cfg[nr].script_id ) found = true;
      }   // remote_loop
      if ( ! found ) {
        weg.push( __deep_copy( l_cfg[nl]) );
        l_cfg.splice( nl,1);
      }
    }     // local_loop
    // ---------------------------------------------------------------------------
    //  Was kommt ins Menü?
    // ---------------------------------------------------------------------------
    for ( var nl = 0; nl < l_cfg.length; nl++ ) {
      // redundante Entscheidung, falls config nicht vollständig
      if ( l_cfg[nl].hasOwnProperty("put_in_menu") && l_cfg[nl].put_in_menu == false ) continue;
      if ( 
        l_cfg[nl].type == "script" && 
        typeof l_cfg[nl].submenu == "string" &&
        ( 
          l_cfg[nl].subpath.indexOf("[panel]") != -1 || 
          l_cfg[nl].subpath.indexOf("[hybrid]") != -1 
        )
      ) {
        // Scripts aus früheren Sets entfernen
        var sid = l_cfg[nl].script_id;
        for ( var n = menu.length-1; n >= 0; n-- ) {
          if ( menu[n].script_id == sid ) {
            menu.splice(n, 1);
          }
        }
        menu.push( __deep_copy(l_cfg[nl]) );
      }
    }
    // ---------------------------------------------------------------------------
    //  Lokal merken, später speichern
    // ---------------------------------------------------------------------------
    local_cfgs[ set ] = __deep_copy( l_cfg );      
  }       // set loop
}


function hub_download_assets() {
  // ---------------------------------------------------------------------------
  //  Weg damit
  // ---------------------------------------------------------------------------
  for ( var n = 0; n < weg.length; n++ ) {
    if ( weg[n].script_id == "Octopus-Includes" || weg[n].script_id == "Octopus-Installer" ) continue;
    var pfade = hub_get_install_paths( weg[n] );
    for ( var i = 0; i < pfade.length; i++ ) {
      try {
        var name = weg[n].url.split("/").pop();
        var pfad = pfade[i] + "/" + name;
        hub_move_to_bin( pfad, weg[n] );
      } catch(e) {
        __log_error(e, "Installer", weg[n].script_id + " deinstallieren");
      }
    }
  }
  // ---------------------------------------------------------------------------
  //  Hin damit
  // ---------------------------------------------------------------------------
  for ( var n = 0; n < neu.length; n++ ) {
    var name = neu[n].url.split("/").pop(),
        temps = __ensure_path_exists( neu[n].type, __get_appconfig_path(), true ),
        temp = temps + "/" + name;
    try {
      __call_request( neu[n].full_url, "file", temp, true );
    } catch(e) {
      __log_error( e, "Installer", "Downloading asset" )
      continue;
    }

    var pfade = hub_get_install_paths( neu[n] );
    for ( var i = 0; i < pfade.length; i++ ) {  
      var pfad = pfade[i] + "/" + name;
      // $.writeln( "neu: " + pfad );
      __ensure_path_exists( pfad, undefined, false );
      File( temp ).copy( pfad );
    }
  }
}
function hub_install_menus() {
  try {
    var raw = __read_file( __get_config_path() + "/custom-menu-entries.json");
    if (  raw ) {
      var items = JSON.parse( raw );
      for ( var n = 0; n < items.length; n++ ) {
        menu.push({
          type: "script",
          script_id: items[n].name,
          put_in_menu: true,
          order: 900 + n,
          subpath: items[n].path,
          submenu: items[n].submenu,
          title: { de: items[n].name.replace(/\.jsx/i,""), en: items[n].name.replace(/\.jsx/i,"") }
        })
      }
    }
  } catch(e) {}
  // ------------------------------------------------------------------------------------------------------
  // 25.1.: "My Scripts" Unterordner in [panel]/octopus
  // ------------------------------------------------------------------------------------------------------
  var name_of_my_script_folder = "My-Scripts"
  try {
    var my_folder  = new Folder( app.scriptPreferences.scriptsFolder.fullName + "/octopus/" + name_of_my_script_folder);
    if ( ! my_folder.exists ) {
      var my_folder  = new Folder( app.scriptPreferences.scriptsFolder.fullName + "/Octopus/" + name_of_my_script_folder);
    }
    if ( my_folder.exists ) {
      function get_scripts( f ) {
        var files = f.getFiles( function(f) { return f.name.search(/\.(jsx|js|jsxbin)(.+\.lnk)?$/i) != -1 } );
        var folders = f.getFiles( function(f) { return f.constructor.name == "Folder" && f.name.charAt(0) != "." } );
        for ( var n = 0; n < folders.length; n++ ) {
          files = files.concat( get_scripts(folders[n]));
        }
        files.sort( function (a,b) {
          if ( a.name < b.name ) return -1;
          if ( a.name > b.name ) return 1;
          return 0;
        })
        return files;
      }
      var scripts = get_scripts( my_folder );
      var re = new RegExp( "/" + name_of_my_script_folder)
      var base = my_folder.fullName.replace(re, "");
      for ( var n = 0; n < scripts.length; n++ ) {
        var sub = scripts[n].fullName.substr( base.length+1 );
        sub = sub.split("/");
        var mt = __clean_filename( sub.pop() );
        var mitem = {
          type: "script",
          script_id: mt,
          put_in_menu: true,
          order: 1200 + n,
          subpath: __clean_filename( scripts[n].fullName ),
          submenu: __clean_filename(sub.join("/")),
          title: { de: mt.replace(/\.jsx/i,""), en: mt.replace(/\.jsx/i,"") }
        };
        menu.push( mitem );
        // __log( JSON.stringify(mitem, undefined, 2), "My menu item");
      }
    } else {
      my_folder.create();
    }
  } catch(e) {
    __log_error(e, "Installer", "My Scripts installieren");
  }

  // ------------------------------------------------------------------------------------------------------
  menu.sort( function(a,b) {
    if ( a.script_id == "Dashboard") return 1;
    if ( b.script_id == "Dashboard") return -1;
    a.order = Number(a.order)
    b.order = Number(b.order)
    if ( isNaN(a.order) ) return 1;
    if ( isNaN(b.order) ) return -1;
    return a.order - b.order;
  })

  var aux = menu;
  var _main = app.menus.item("$ID/Main");
  __log("Got main-menu object", "installer")
  var _table_menu = _main.menuElements.item("$ID/Table");
  var hub_menu = _main.submenus.add("Octopus", LocationOptions.AFTER, _table_menu);
  for ( var nm = 0; nm < menu.length; nm++ ) {
    __log("menu-item: " + localize(menu[nm].title))
    var script_menu_action = app.scriptMenuActions.add( localize(menu[nm].title) )
    script_menu_action.insertLabel("sid",  menu[nm].script_id );
    script_menu_action.eventListeners.add("onInvoke", call_script_from_menu);
    var submenu = get_submenu( hub_menu, menu[nm].submenu );
    if ( menu[nm].script_id == "Dashboard" ) {
      submenu.menuSeparators.add();
    }
    submenu.menuItems.add(script_menu_action);
  }
  function get_submenu( menu, sub ) {
    if ( ! sub ) return menu
    sub = sub.split("/");
    for ( var n = 0; n < sub.length; n++ ) {
      if ( ! menu.submenus.item(sub[n]).isValid ) {
        menu.submenus.add( sub[n], LocationOptions.AT_END );
      }
      menu = menu.submenus.item(sub[n]);
    }
    return menu;
  }
}
function call_script_from_menu(e) {
  var sid = e.target.extractLabel("sid");
  __log ("called: " + sid)
  for ( var nm = 0; nm < menu.length; nm++ ) {
    if ( menu[nm].script_id == sid ) {
      __log( " is Menu Item " + nm + "\n\n" + JSON.stringify(menu[nm]))

      var path = "";
      // custom menu entry?
      if (sid.search(/\.jsx/i) != -1 ) {
        path = menu[nm].subpath;
      } else {
        var paths = hub_get_install_paths( menu[nm] );
        for ( var np = 0; np < paths.length; np++ ) {
          if ( paths[np].search(/Scripts Panel/) != -1 ) {
            path = paths[np] + "/" + menu[nm].url.split("/").pop();
          }
        }
      }
      __log( "Calling " + path + ": " + File( path ).exists );
      try {
        app.doScript( File( path ), undefined, undefined, UndoModes.ENTIRE_SCRIPT, localize(menu[nm].title))
      } catch(e) {
        __log_error( e, "Installer", "invoking menu");
        __alert("stop", e.message )
      }
      break;
    }
  }
}

function hub_install_custom_menus() {
  var raw = __read_file( __get_config_path() + "/custom-menu-entries.json");
  if ( ! raw ) return;
  var items = JSON.parse( raw );
  for ( var nc = 0; nc < items.length; nc++ ) {

  }
}

// Um kein file.remove() zu machen, bewege ich Dateien in einen Bin
function hub_move_to_bin( pfad, cfg ) {
  var f = new File( pfad );
  if ( ! f.exists ) return false;
  var name_proper = f.name.split(".");
  var ext = name_proper.pop();
  name_proper = name_proper.join(".");
  var tgt = __get_appconfig_path("_bin") + "/" + name_proper + "-" + weg.version + "." + ext;
  try {
    var done = f.changePath( tgt );
  } catch(e) {
    var done = false;
  }
  if ( ! done ) {
    try {
      f.remove();
    } catch(e) {
      __log_error(e, "Installer", "installer-remove-file")
    }
  }
}
// Wandelt 3-stellige Versionsnummer in Zahl.
function hub_vnr( v ) {
  if ( v.search(/^\d+\.\d+\.\d+/) != -1 ) {
    v = v.split(".");
    v = Number( v[0] ) * 10000 + Number( v[1] ) * 100 + Number( v[2] );
  }
  return v;
}

function hub_get_install_paths( asset ) {
  var id_pfade = hub_get_paths_to_script_folder();
  var wo_pfad = asset.subpath.split("/"),
      wo = wo_pfad.shift(),
      pfade = [];
  if ( wo == "[panel]" || wo == "[hybrid]" ) {
    pfade.push( unescape( id_pfade.panel + "/" + wo_pfad.join("/") ));
  }
  if ( wo == "[startup]" || wo == "[hybrid]" ) {
    pfade.push( unescape( id_pfade.startup + "/" + wo_pfad.join("/") ));
  }
  if ( wo == "[config]" ) {
    pfade.push( unescape(  __get_appconfig_path() + "/" + wo_pfad.join("/") ));
  }
  return pfade;
}

function hub_get_paths_to_script_folder() {
  var panel_folder = app.scriptPreferences.scriptsFolder
  var startup_folder_path = panel_folder.parent.fullName + "/Startup Scripts";
  var startup_folder = new Folder(startup_folder_path);
  if (!startup_folder.exists) startup_folder.create();

  return {
    "panel": panel_folder.fullName,
    "startup": startup_folder_path
  }
}

function log_(a, b) {
  var f = new File( Folder.desktop.fullName + "/acht-2.txt");
  f.open("a");
  f.writeln( a );
  f.close();
}

function handle_doc_msg( doc, is_before_close ) {
  dbg = false;
  if ( ! doc ) return;

  if (dbg) doc_msg_log = new File(Folder.desktop.fullName + "/logs/onOpen.txt");
  if (dbg) doc_msg_log.open("a");
  if (dbg) doc_msg_log.writeln("----");

  try {
    // ---- Eine neue Msg braucht einen Bild-Auswahl-Button ----
    var is_new_msg = true;
    // ---- Schauen, ob im Doc eine msg gespeichert ist ----
    var msg = doc.extractLabel( "cuppa-onOpen-message" );
    if ( msg ) {
      is_new_msg = false;
      if (dbg) doc_msg_log.writeln( "existing msg: " + msg );
      msg = JSON.parse( msg );
    } else {
      if (dbg) doc_msg_log.writeln( "creating new msg");
      msg = { img_path: "", msg: "Nachricht", showonclose: false }
    }
    var img_exists = msg.img_path && File( msg.img_path ).exists;

    // ---- Palette einrichten ----
    var w = new Window("palette {orienation: 'column', alignChildren: ['fill', 'fill']}");

    // ---- Zeile fürs Bild ----
    w.g1 = w.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
    if ( is_new_msg || ! img_exists) {
      if (dbg) doc_msg_log.writeln("Kein Bild. Knopfs zum Auswählen");
      w.img_btn = w.g1.add("button", undefined, "Bild auswählen")
      w.ipath = w.g1.add("statictext", [undefined, undefined, 400, 20], msg.img_path)
    } else {
      if (dbg) doc_msg_log.writeln("Bild anzeigen");
      w.g1 = w.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
      w.g1.maximumSize = [ 600, 400 ];
      w.img_btn = w.g1.add("iconbutton", undefined, File( msg.img_path ) )
    }
    
    // ---- Die Nachricht ----  
    w.msg = w.add("edittext", undefined, msg.msg, {multiline: true});
    w.msg.preferredSize.height = 200;

    // ---- show on close ----
    //  bei beforeClose kann man das doc nicht mehr speichern :(
    // w.showonclose = w.add("checkbox", undefined, "Auch beim Schließen zeigen?")
    // w.showonclose.value = !!msg.showonclose;
    
    // ---- Die Buttons ----
    w.g = w.add("group {orientation: 'row', alignChildren: ['center', fill']}");
    w.cancelElement = w.g.add("button", undefined, "Abbrechen");
    w.defaultElement = w.g.add("button", undefined, "Speichern");

    // ---- Die Interaktion ----
    w.img_btn.onClick = function () {
      var f = File.openDialog("Welches Bild?");
      if ( f ) {
        if ( w.hasOwnProperty("ipath") ) {
          if (dbg) doc_msg_log.writeln("Neues Bild: " + f.fullName)
          w.ipath.text = decodeURI(f.fullName);
        } else {
          if (dbg) doc_msg_log.writeln("Bild tauschen");
          w.img_btn.image = f;
        }
        msg.img_path = decodeURI( f.fullName );
      }
    }
    w.msg.onChange = function() {
      if (dbg) doc_msg_log.writeln("Neuer Text: " + this.text)
      msg.msg = this.text;
    }
    w.showonclose.onClick = function () {
      msg.showonclose = this.value;
    }
    w.cancelElement.onClick = function () {
      w.close();
      if (dbg) doc_msg_log.close();
    }
    w.defaultElement.onClick = function () {
      w.close();   
      // Um zu löschen, Messagefeld leer lassen.
      if ( ! msg.msg ) {
        if (dbg) doc_msg_log.writeln( "label auf '' gesetzt");
        doc.insertLabel( "cuppa-onOpen-message", "" );
      } else {
        doc.insertLabel( "cuppa-onOpen-message", JSON.stringify(msg) );
      }
      if (dbg) doc_msg_log.writeln("inserted Label (" + is_before_close + ")");
      if ( is_before_close ) {
        if (dbg) doc_msg_log.writeln("Now Saving");
        var then = new Date().getTime();
        doc.save();
        var now = new Date().getTime();
        if (dbg) doc_msg_log.writeln( "Saved in " + (now - then) + " msecs");
      }
      if (dbg) doc_msg_log.close();
    }
    w.show();
  } catch(e) {
    if (dbg) doc_msg_log.writeln( e + "\nline: " + e.line );
  }
  
}

