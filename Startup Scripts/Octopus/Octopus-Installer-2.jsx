// =============================================================================
// OCTOPUS INSTALLER
// =============================================================================
// Liegt im Startup-Scripts Ordner von InDesign.
// Läuft beim Start automatisch, prüft auf Updates, installiert Dateien,
// richtet Menübefehle ein, sendet Logs an den Server.
//
// Abhängigkeiten:
//   Octopus-include-2.jsxinc  – muss im selben Ordner wie diese Datei liegen
//
// Version: 1.0.0
// =============================================================================

#targetengine "octopus-2"

#include "Octopus-include-su.jsxinc"
__init();


install();
app.eventListeners.add("beforeQuit", onQuitHandler);

function install() {
  // -------------------------------------------------------------------------------------------
  //  Globale Config
  // -------------------------------------------------------------------------------------------
  var basisurl = "https://singels.info/Octopus";
  var config_paths = [
    // {
    //   type: "url",
    //   path: "Main",
    //   name: "Default-Set"
    // },
    {
      type: "file",
      path: "/Users/singel/Dropbox/PARA/01-Projekte/Satzkiste/Octopus/ScripteV4/Octopus",
      name: "Default-Set"
    }
  ]
  var package_name = "Octopus4";

  __log("info", "Installation gestartet", "installer");

  // -------------------------------------------------------------------------------------------
  //  Ordnerpfade
  // -------------------------------------------------------------------------------------------
  PATH_SCRIPT_PARENT = app.scriptPreferences.scriptsFolder.parent.fullName;
  PATH_USER_FOLDER    = Folder.userData.fullName + "/" + package_name;
  PATH_DATA_FOLDER    = PATH_USER_FOLDER + "/Data";
  PATH_LOG_FILE = PATH_DATA_FOLDER + "/_log.json";
  try {
    __ensureFolder(PATH_USER_FOLDER);
    __ensureFolder(PATH_DATA_FOLDER);
  } catch(e) {
    alert("KRITISCHER FEHLER: Octopus kann notwendige Ordner nicht erstellen.\n\n" +
          "Pfad: " + PATH_USER_FOLDER + "\n\n" +
          "Fehler: " + e.message + "\n\n" +
          "Bitte prüfen Sie die Dateisystem-Berechtigungen.");
    return null; // Installation abbrechen
  }
  app.insertLabel( package_name + "-Paths", JSON.stringify( {PATH_SCRIPT_PARENT: PATH_SCRIPT_PARENT, PATH_USER_FOLDER: PATH_USER_FOLDER, PATH_DATA_FOLDER: PATH_DATA_FOLDER, PATH_LOG_FILE: PATH_LOG_FILE }))

  // -------------------------------------------------------------------------------------------
  //  Prefs und Configs
  // -------------------------------------------------------------------------------------------
  var prefs = __readJson( PATH_DATA_FOLDER + "/prefs.json");
  if (prefs) {
    __log("info", "Prefs geladen", "installer");
  }

  var configs = get_configs();
  __log("info", configs.length + " Configs gefunden", "installer");
  for ( var n = 0; n < configs.length; n++ ) {
    configs[n].ix = n;
    if ( ! configs[n].hasOwnProperty("order")) configs[n].order = Infinity;
  }
  configs.sort( function (a,b) {
    if ( a.order < b.order ) return -1;
    if ( a.order > b.order ) return 1;
    return a.ix - b.ix;
  })
  __writeJson( PATH_DATA_FOLDER + "/config.json", configs);

  // -------------------------------------------------------------------------------------------
  //  Installationsschleife
  // -------------------------------------------------------------------------------------------
  var nu = [], updated = [], failed = [], removed = [];
  var _pbw = new Window("palette");
  _pbw.pb = _pbw.add("progressbar", [undefined, undefined, 400, 20]);
  _pbw.pb.maxvalue = configs.length;
  try {
    _pbw.show();
    var then = new Date().getTime(), now;
    for ( var n = 0; n < configs.length; n++ ) {
      var c = configs[n];
      if ( prefs && prefs.ignore && prefs.ignore[ c.id ] ) {
        __log("info", c.id + " wird ignoriert", "installer");
        continue;
      }
      try {
        $.bp( c.filename.search(/gradient/i) != -1);
        var tgt_path = get_tgt_path( c );
        __ensureFolder( tgt_path );
      } catch(e) {
        __log("error", "Ordner für " + c.filename + " konnte nicht erstellt werden: " + e.message, "installer");
        continue;
      }
      var tgt_file = new File( tgt_path ), done;
      var is_new = ! tgt_file.exists;
      if ( ! eq_filesize( c.check, tgt_path )) {
        var src_path = (c.base_path + "/" + c.subpath).replace(/\/$/, "");

        // --------------------------------------------------------------------
        // ------------------------------------------------------- URL
        if ( c.base_path.search(/^http/i) != -1 ) {
          try {
            tgt_file = __call_request(
              src_path,
              c.filename,
              "file",
              tgt_path,
              true
            )
            __log("info", tgt_file.name + " installiert: " + tgt_file.exists, "installer" )
            if ( is_new ) {
              nu.push( c.id );
            } else {
              updated.push( c.id );
            }
          } catch(e) {
            __log("error", "Download fehlgeschlagen (" + c.filename + "): " + e.message, "installer");
            failed.push( c.id );
          }
          $.sleep(100);

        } else {
          // --------------------------------------------------------------------
          // ----------------------------------------------------- File
          try {
            var src = new File( src_path + "/" + c.filename );
            if ( src.exists ) {
              done = src.copy( tgt_path );
              if (!done) {
                __log("error", "Kopieren fehlgeschlagen: " + src.fsName + " -> " + tgt_path, "installer");
                failed.push( c.id );
              } else {
                __log("info", tgt_path + " installiert", "installer");
                if ( is_new ) {
                  nu.push( c.id );
                } else {
                  updated.push( c.id );
                }
              }
            } else {
              __log("error", "Quelldatei nicht gefunden: " + src.fsName, "installer");
              failed.push( c.id );
            }
          } catch(e) {
            __log("error", "Datei-Operation fehlgeschlagen (" + c.filename + "): " + e.message, "installer");
            failed.push( c.id );
          }
        }
      }

      // --------------------------------------------------------------------
      // ------------------------------------------------------- Menu finden
      if ( tgt_file.exists && c.menu ) {
        var menu = get_submenu( c.menu, undefined, "$ID/Table" );
        if (!menu) {
          __log("error", "Hauptmenü konnte nicht erstellt werden: " + c.menu + " für " + c.filename, "installer");
          continue;
        }
        if ( c.submenu ) {
          var sm = c.submenu.split("/");
          smloop: for ( var n = 0; n < sm.length; n++ ) {
            var aux = get_submenu( sm[n], menu );
            if ( aux ) {
              menu = aux
            } else {
              __log("warn", "Submenü nicht gefunden: " + sm[n] + " für " + c.filename, "installer");
              break smloop;
            }
          }
        }   // submenus erzeugen

        // --------------------------------------------------------------------
        // ------------------------------------------------------- MenuItem
        try {
          var menuLabel = localize( c.label );
          var action = app.scriptMenuActions.add( menuLabel );
          action.insertLabel("script-path", tgt_path);
          (function (sPath, mtxt) {
            action.eventListeners.add("onInvoke", function (event) {
              try {
                app.doScript(new File(sPath), ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, mtxt);
              } catch (e) {
                __log("error", "Script-Aufruf fehlgeschlagen (" + sPath + "): " + e.message + " on " + e.line, "installer");
                if (DBG) $.writeln(e.message + " on " + e.line);
              }
            });
          })(tgt_path, menuLabel);

          if ( c.after_item ) {
            var a_item = menu.menuElements.item( c.after_item );
            menu.menuItems.add( action, LocationOptions.AFTER, a_item );
          } else {
            menu.menuItems.add( action );
          }
        } catch(e) {
          __log("error", "MenuItem-Erstellung fehlgeschlagen (" + menuLabel + "): " + e.message + " on " + e.line, "installer");
        }

      }

      now = new Date().getTime();
      // $.writeln( c.filename + ": " + ((now-then)/1000) + " secs")
    }
    __log("info", "Installation abgeschlossen (" + configs.length + " Configs verarbeitet)", "installer");
    if ( nu.length > 0 || updated.length > 0 || failed.length > 0 ) {
      var msg = "";
      if ( nu.length > 0 ) msg += "Neue Installationen: " + nu.join(", ") + "\n";
      if ( updated.length > 0 ) msg += "Aktualisierte Installationen: " + updated.join(", ") + "\n";
      if ( failed.length > 0 ) msg += "Fehlerhafte Installationen: " + failed.join(", ") + "\n";
      __alert("info", msg, "Installation abgeschlossen");
    }
  } catch(e) {
    __log("error", e.message + " on " + e.line, "installer" );
  } finally {
    _pbw.close();
  }


  // -------------------------------------------------------------------------------------------
  //  Andere configs lesen und alles in ein Array
  // -------------------------------------------------------------------------------------------
  function get_configs() {
    if ( prefs && prefs.config_paths ) config_paths = config_paths.concat( prefs.config_paths )
    var cfgs = [];
    for ( var np = 0; np < config_paths.length; np++ ) {
      var json, cfg;
      var cp = config_paths[np]
      var base_path = cp.path;

      if ( cp.type == "file" ) {
        try {
          cfg = __readJson( cp.path + "/index.json" );
          if (!cfg) {
            __log("error", "Config-Datei nicht lesbar: " + cp.path + "/index.json", "installer");
            continue;
          }
        } catch(e) {
          __log("error", "Fehler beim Lesen der Config (" + cp.path + "/index.json): " + e.message, "installer");
          continue;
        }
      } else {
        try {
          if ( cp.path.substring(0,4).toLowerCase() == "http" ) {
            json = __call_request( cp.path, "index.json" );
          } else {
            base_path = basisurl + "/" + cp.path;
            json = __call_request( basisurl + "/" + cp.path, "index.json" );
          }
          if (!json || json === "") {
            __log("error", "Leere Antwort von Server: " + cp.path, "installer");
            cfg = [];
          } else {
            cfg = JSON.parse( json );
          }
        } catch(e) {
          __log("error", "Config konnte nicht geladen werden (" + cp.path + "): " + e.message, "installer");
          cfg = [];
        }
      }
      for ( var n = 0; n < cfg.length; n++ ) cfg[n].base_path = base_path;
      cfgs = cfgs.concat( cfg );
    }
    return cfgs;
  }
  // -------------------------------------------------------------------------------------------
  //  Get Installation-Path
  // -------------------------------------------------------------------------------------------
  function get_tgt_path( cfg ) {
    var p;
    if ( cfg.subpath.search(/^Scripts Panel/i) != -1 || cfg.subpath.search(/^Startup Scripts/i) != -1 ) {
      p = PATH_SCRIPT_PARENT + "/" + cfg.subpath;
    } else {
      if ( ! cfg.subpath ) {
        p = PATH_DATA_FOLDER;
      } else {
        p = PATH_DATA_FOLDER + "/" + cfg.subpath;
      }
    }
    p += "/" + cfg.filename;
    return p;
  }
  function eq_filesize( check, tgt_path ) {
    var tgt_file = new File( tgt_path );
    var tgt_size = tgt_file.length;
    $.writeln("Vergleiche: " + check + " mit " + tgt_size + " für " + tgt_path);
    // Ich weiß nicht, ob "exakt identische Länge" zu restriktiv ist
    return Math.abs( tgt_size - check ) < 4;
  }

  function get_submenu( menu_name, prnt_menu, after_menu ) {
    try {
      // Parent MUSS da sein als menu, sonst MAIN
      if ( ! prnt_menu ) prnt_menu = app.menus.item("$ID/Main");

      // IdR. ist `after` ein locale-independent string
      if ( after_menu && typeof after_menu == "string" ) {
        after_menu = prnt_menu.menuElements.item( after_menu );
      }

      var menu = prnt_menu.menuElements.item( menu_name );
      if ( ! menu.isValid ) {
        if ( after_menu ) {
          menu = prnt_menu.submenus.add( menu_name, LocationOptions.AFTER, after_menu );
        } else {
          menu = prnt_menu.submenus.add( menu_name, LocationOptions.AT_END );
        }
      }
      return menu.isValid ? menu : null;
    } catch(e) {
      __log("error", "Menü-Erstellung fehlgeschlagen (" + menu_name + "): " + e.message, "installer");
      if (DBG) $.writeln("get_submenu Fehler: " + e.message + " on " + e.line);
      return null;
    }
  }
}

function onQuitHandler() {
  try {
    var _main = app.menus.item("$ID/Main");
    var custom = ['Octopus', 'scripthub'];
    for ( var n = 0; n < custom.length; n++ ) {
      var c = custom[n];
      var hub_menu = _main.submenus.item( c );
      if (hub_menu && hub_menu.isValid) {
        hub_menu.remove();
        __log("info", "Menü deinstalliert: " + c, "installer");
      }
    }
  } catch (e) {
    __log("error", "Fehler beim Aufräumen: " + e.message + " on " + e.line, "installer");
    if (DBG) $.writeln( e.message + " on " + e.line );
  }
}
