// =============================================================================
// OCTOPUS INSTALLER
// =============================================================================
// Liegt im Startup-Scripts Ordner von InDesign.
// Läuft beim Start automatisch, prüft auf Updates, installiert Dateien,
// richtet Menübefehle ein, sendet Logs an den Server.
//
// Abhängigkeiten:
//   Include.jsxinc  – muss im selben Ordner wie diese Datei liegen
//
// Version: 1.0.0
// =============================================================================
#targetengine "octopus4"
  // #include "Startup Scripts/Octopus/Include.jsxinc"
  #include "Include.jsxinc"
__init();




install();
app.eventListeners.add("beforeQuit", onQuitHandler);

function install() {
  __log("info", "Installation gestartet", "installer");

  var nu = [], updated = [], failed = [], removed = [];

  var configs = load_configuration();
  update_resources( configs );
  install_menus( configs );
  send_log();

  function load_configuration() {
    // ---------------------------------------------------------------------------------
    // Welche Sets haben wir installiert
    var locals = load_local_sets();

    // ---------------------------------------------------------------------------------
    //  Haben die remote Sets Updates?
    var configs = [];
    for ( var n = 0; n < locals.length; n++ ) {
      var _set = check_set_4_update( locals[n] );

      // -------------------------------------------
      // Aktualisiertes abspeichern
      __writeJson( PATH_DATA_FOLDER + "/Sets/" + _set.set_name + ".json", _set );

      // -------------------------------------------
      // Ein globales Array für alle Resourcen bauen
      for ( var m = 0; m < _set.configs.length; m++ ) {
        // Set-Info in die einzelnen Configs schreiben
        _set.configs[m].set_name = _set.set_name;
        _set.configs[m].base_url = _set.base_url;
        _set.configs[m].project_name = _set.project_name;
        configs.push( _set.configs[m] );
      }
    }

    // ------------------------------------------------------
    // Config-Array sortieren
    // Im Wesentlichen `.order` gibt die Menüreihenfolge
    for (var n = 0; n < configs.length; n++) {
      configs[n].ix = n;
      if (!configs[n].hasOwnProperty("order")) configs[n].order = Infinity;
    }
    configs.sort(function (a, b) {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return a.ix - b.ix;
    })

    __writeJson( PATH_DATA_FOLDER  + "/Global Set.json", configs );
    return configs;

    function load_local_sets() {
      var dir = new Folder( PATH_DATA_FOLDER + "/Sets" );
      if ( ! dir.exists ) dir.create();
      var jfiles = dir.getFiles( function(f) {
        return f.name.charAt(0) != "." && f.name.search(/\.json/i) != -1 ;
      });
      var jsons = [];
      for ( var n = 0; n < jfiles.length; n++ ) {
        jsons.push( __readJson( jfiles[n] ) );
      }
      return jsons;
    }

    function check_set_4_update( cfg ) {
      if ( ! cfg.base_url ) {
        return cfg;
      } else {
        if ( cfg.base_url.search(/^http/i) != -1 ) {
          try {
            var remote = __call_request( cfg.base_url, "index.json" );
            if (remote) remote = JSON.parse( remote );
          } catch(e) {
            __log("error", "Fehler beim Download von Set '" + cfg.set_name + "':  " + e.message + " on " + e.line );
            remote = cfg;
          }
        } else {
          var remote = __readJson( cfg.base_url + "/index.json" );
        }
      }
      if ( ! remote ) {
        __log("error", "'" + cfg.base_url + "' enthält kein parse-bares JSON", "installer");
        return cfg;
      }
      return remote;
    }
  }   // load_configuration
  function update_resources(configs) {
    // Im Dashboard kann der User bestimmen, dass Scripte ausgeschlossen werden
    var ignore_these = __readJson( PATH_DATA_FOLDER + "/Prefs/ignore.json" );
    if ( ! ignore_these ) ignore_these = [];

    var _pbw = new Window("palette");
    _pbw.pb = _pbw.add("progressbar", [undefined, undefined, 400, 20]);
    _pbw.pb.maxvalue = configs.length;
    try {
      _pbw.show();

      for (var _nc = 0; _nc < configs.length; _nc++) {
        var c = configs[_nc];

        if ( ! c.base_url ) {
          // Wurde offline installiert -> keine Updates
          continue;
        }
        if ( ignore_these[ c.id ] ) {
          __log("info", c.id + " wird ignoriert", "installer");
          continue;
        }
        try {
          var tgt_path = get_tgt_path(c);
          __ensureFolder(tgt_path);
        } catch (e) {
          __log("error", "Ordner für " + c.filename + " konnte nicht erstellt werden: " + e.message, "installer");
          continue;
        }
        var tgt_file = new File(tgt_path), done;
        var is_new = !tgt_file.exists;
        if (!eq_filesize(c.check, tgt_path)) {
          
          // --------------------------------------------------------------------
          // ------------------------------------------------------- URL
          if (c.base_url.search(/^http/i) != -1) {
            var src_path = (c.base_url + "/" + c.subpath).replace(/\/$/, "");
            install_from_url( c, src_path, tgt_path );
            
          } else {
            // --------------------------------------------------------------------
            // ----------------------------------------------------- File
            var src_path = (c.base_url + "/" + c.subpath).replace(/\/$/, "");
            install_from_fileserver( c, src_path, tgt_path );
          }
        }
      }
    } catch (e) {
      __log("error", e.message + " on " + e.line, "installer");
    } finally {
      _pbw.close();
    }

    function install_from_url( c, src_path, tgt_path ) {
      try {
        __log("dbg", "Request: " + JSON.stringify({ url: src_path, filename: c.filename, tgt: tgt_path }), "installer");
        var tgt_file = __call_request(
          src_path,
          c.filename,
          "file",
          tgt_path,
          true
        )
        if ( ! tgt_file.exists ) throw new Error( "Download gescheitert" );
        __log("info", tgt_file.name + " installiert: " + tgt_file.exists, "installer")
        if (is_new) {
          nu.push(c.id);
        } else {
          updated.push(c.id);
        }
      } catch (e) {
        __log("error", "Download fehlgeschlagen (" + c.filename + "): " + e.message, "installer");
        failed.push(c.id);
      }
      $.sleep(100);

    }
    function install_from_fileserver( c, src_path, tgt_path ) {
      try {
        var src = new File(src_path + "/" + c.filename);
        if (src.exists) {
          done = src.copy(tgt_path);
          if (!done) {
            __log("error", "Kopieren fehlgeschlagen: " + src.fsName + " -> " + tgt_path, "installer");
            failed.push(c.id);
          } else {
            __log("info", tgt_path + " installiert", "installer");
            if (c.id != "index") {  // Ich will nicht sehen, ob das JSON wackelt
              if (is_new) {
                nu.push(c.id);
              } else {
                updated.push(c.id);
              }
            }
          }
        } else {
          __log("error", "Quelldatei nicht gefunden: " + src.fsName, "installer");
          failed.push(c.id);
        }
      } catch (e) {
        __log("error", "Datei-Operation fehlgeschlagen (" + c.filename + "): " + e.message, "installer");
        failed.push(c.id);
      }
    }
  }   // update_resources
  function install_menus( configs ) {
    var custom_menus = {};
    for (var _nc = 0; _nc < configs.length; _nc++) {
      var c = configs[_nc];
      var tgt_path = get_tgt_path(c);
      var tgt_file = new File( tgt_path );

      // --------------------------------------------------------------------
      // ------------------------------------------------------- Menu finden
      if (tgt_file.exists && c.menu) {
        if ( ! c.menu.charAt(0) != "$" ) {
          custom_menus[ c.menu ] = true;
        }
        var menu = get_submenu(c.menu, undefined, "$ID/Table");
        if (!menu) {
          __log("error", "Hauptmenü konnte nicht erstellt werden: " + c.menu + " für " + c.filename, "installer");
          continue;
        }
        if (c.submenu) {
          var sm = c.submenu.split("/");
          smloop: for (var n = 0; n < sm.length; n++) {
            var aux = get_submenu(sm[n], menu);
            if (aux) {
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
          var menuLabel = localize(c.label);
          var action = app.scriptMenuActions.add(menuLabel);
          action.insertLabel("script-path", tgt_path);
          (function (sPath, mtxt) {
            action.eventListeners.add("onInvoke", function (event) {
              try {
                app.doScript(new File(sPath), ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, mtxt);
              } catch (e) {
                __log("error", "Script-Aufruf fehlgeschlagen (" + sPath + "): " + e.message + " on " + e.line, "installer");
                __alert("warnung", "Script-Aufruf fehlgeschlagen (" + sPath + "): " + e.message + " on " + e.line, "OK", false)
                if (DBG) $.writeln(e.message + " on " + e.line);
              }
            });
          })(tgt_path, menuLabel);

          if (c.after_item) {
            var a_item = menu.menuElements.item(c.after_item);
            if ( a_item.isValid ) {
              menu.menuItems.add(action, LocationOptions.AFTER, a_item);
            } else {
              menu.menuItems.add(action);
            }
          } else {
            menu.menuItems.add(action);
          }
          // ----------------------------------------------------------------------
          // 2026-02-23: Alle Menüeinträge, die custom sind, werden zusätzlich
          //  ins Octopus-Menü gepackt.
          if ( c.set == "octopus" && c.menu != "Octopus" ) {
            var omenu = get_submenu( "Octopus", undefined, "$ID/Table" );
            omenu.menuItems.add( action );
          }
        } catch (e) {
          __log("error", "MenuItem-Erstellung fehlgeschlagen (" + menuLabel + "): " + e.message + " on " + e.line, "installer");
        }

      } // Menü erstellen
    }   // config-loop
    app.insertLabel("octopus_custom_menus", JSON.stringify(custom_menus));

    // --------------------------------------------------------------------------
    //  Separator vors Dashboard
    var _octmenu = app.menus.item("$ID/Main").menuElements.item("Octopus");
    if (_octmenu && _octmenu.isValid) {
      var _db_item = _octmenu.menuElements.lastItem();
      if (_db_item || _db_item.isValid) {
        _octmenu.menuSeparators.add(LocationOptions.BEFORE, _db_item);
      }
    }

  }
  function send_log() {
    // -------------------------------------------------------------------------------------------
    //  Logs zum Server und Reset
    // -------------------------------------------------------------------------------------------
    try {
      var _data = __readJson(PATH_LOG_FILE);
      if ( _data ) {
        if ( ! _data.guid ) _data.guid = "na";
        _data = JSON.stringify( _data );
        var log_url = "https://singels.info/Octopus/Octopus4Log";
        var request = {
          url: log_url,
          method: "POST",
          body: "{\"data\": \"" + encodeURIComponent(_data) + "\"}",
          headers: [
            {name:"Content-Type", value:"application/json; charset=UTF-8"},
            {name: "x-project-octopus", value: "true"}
          ]
        }
        var response = restix.fetch(request);
        if ($.getenv("USER") == "singel") {
          try {
            __writeJson( PATH_DATA_FOLDER + "/Logs/last_response.json", response );
          } catch(e) {
            __log("error", "Fehler beim Schreiben der letzten Server-Antwort: " + e.message, "installer");
          }
        }
      }
    } catch (e) {
      __log("error", "Fehler beim Pushen  der Log-Datei: " + e.message + " on " + e.line, "installer");
    }
    __log("reset_log", "Log zurückgesetzt", "installer");
  }

  // -------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------
  //  Anzeigen, was installiert wurde
  // -------------------------------------------------------------------------------------------
  if (nu.length > 0 || updated.length > 0 || failed.length > 0) {
    var msg = [];
    if (nu.length > 0) {
      msg.push("New: ");
      nu = ("  " + nu.join("\n  ")).split("\n");
      msg = msg.concat(nu);
    }
    if (updated.length > 0) {
      msg.push("Updated: ");
      updated = ("  " + updated.join("\n  ")).split("\n");
      msg = msg.concat(updated);
    }
    if (failed.length > 0) {
      msg.push("Failed: ");
      failed = ("  " + failed.join("\n  ")).split("\n");
      msg = msg.concat(failed);
    }
    var w = new Window("palette");
    __insert_head(w, "installer")
    var _lb = w.add("listbox", undefined, msg);
    _lb.minimumSize = [450, 300]
    w.cancelElement = w.add("button", undefined, "OK");
    w.cancelElement.onClick = function () {
      w.close();
    }
    w.show();
  }



  // -------------------------------------------------------------------------------------------
  //  Get Installation-Path
  // -------------------------------------------------------------------------------------------
  function get_tgt_path(cfg) {
    var p;
    if (cfg.subpath.search(/^Scripts Panel/i) != -1 || cfg.subpath.search(/^Startup Scripts/i) != -1) {
      p = PATH_SCRIPT_PARENT + "/" + cfg.subpath;
    } else {
      if (!cfg.subpath) {
        p = PATH_DATA_FOLDER;
      } else {
        p = PATH_DATA_FOLDER + "/" + cfg.subpath;
      }
    }
    p += "/" + cfg.filename;
    return p;
  }
  function eq_filesize(check, tgt_path) {
    var tgt_file = new File(tgt_path);
    var tgt_size = tgt_file.length;
    $.writeln("Vergleiche: " + check + " mit " + tgt_size + " für " + tgt_path);
    // Ich weiß nicht, ob "exakt identische Länge" zu restriktiv ist
    return Math.abs(tgt_size - check) < 4;
  }

  function get_submenu(menu_name, prnt_menu, after_menu) {
    try {
      // Parent MUSS da sein als menu, sonst MAIN
      if (!prnt_menu) prnt_menu = app.menus.item("$ID/Main");

      // IdR. ist `after` ein locale-independent string
      if (after_menu && typeof after_menu == "string") {
        after_menu = prnt_menu.menuElements.item(after_menu);
      }

      var menu = prnt_menu.menuElements.item(menu_name);
      if (!menu.isValid) {
        if (after_menu) {
          menu = prnt_menu.submenus.add(menu_name, LocationOptions.AFTER, after_menu);
        } else {
          menu = prnt_menu.submenus.add(menu_name, LocationOptions.AT_END);
        }
      }
      return menu.isValid ? menu : null;
    } catch (e) {
      __log("error", "Menü-Erstellung fehlgeschlagen (" + menu_name + "): " + e.message, "installer");
      if (DBG) $.writeln("get_submenu Fehler: " + e.message + " on " + e.line);
      return null;
    }
  }
}

function onQuitHandler() {
  try {
    var custom = app.extractLabel("octopus_custom_menus");
    if ( ! custom ) return;
    custom = JSON.parse( custom );
    var _main = app.menus.item("$ID/Main");
    for (var n in custom) {
      var c = custom[n];
      var hub_menu = _main.submenus.item(c);
      if (hub_menu && hub_menu.isValid) {
        hub_menu.remove();
        __log("info", "Menü deinstalliert: " + c, "installer");
      }
    }
  } catch (e) {
    __log("error", "Fehler beim Aufräumen: " + e.message + " on " + e.line, "installer");
    if (DBG) $.writeln(e.message + " on " + e.line);
  }
}
