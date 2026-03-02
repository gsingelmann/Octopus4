// =============================================================================
// OCTOPUS Starter
// =============================================================================
// Version: 1.0.0
// =============================================================================
__init();

var base_path;
var nu = [], old = [], updated = [], failed = [];
if ( pre_check() ) {
  install();
}

function pre_check() {
  var f1 = new Folder( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus");
  var f2 = new Folder( PATH_SCRIPT_PARENT + "/Startup Scripts/Octopus");
  if ( f1.exists || f2.exists ) {
    if ( File( f2.fullName + "/Octopus-Installer.jsx" ).exists ) {
      var abort = confirm( __('already-there') );
      if ( abort ) {
        if ( f1.exissts ) f1.execute();
        if ( f2.exists ) f2.execute();
        return false;
      } 
    }
  }
  return true;
}
function install() {
  var json;
  var _set = select_source();
  if (!_set) return;
  __writeJson(PATH_DATA_FOLDER + "/Sets/" + _set.set_name + ".json", _set);
  var configs = [];
  for (var m = 0; m < _set.configs.length; m++) {
    // Set-Info in die einzelnen Configs schreiben
    _set.configs[m].set_name = _set.set_name;
    _set.configs[m].base_url = _set.base_url;
    _set.configs[m].project_name = _set.project_name;
    configs.push(_set.configs[m]);
  }
  for (var n = 0; n < configs.length; n++) {
    configs[n].ix = n;
    if (!configs[n].hasOwnProperty("order")) configs[n].order = Infinity;
  }
  configs.sort(function (a, b) {
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return a.ix - b.ix;
  })

  update_resources( configs );

  show_log( 
    [
      { a: nu, key: "nu-script" },
      { a: old, key: "old-script" },
      { a: updated, key: "updated-script" },
      { a: failed, key: "failed-script" },
    ],
    _set
  )

  return;

  function select_source( offer_fileserver_option ) {
    var jsons = [ null, null, null];

    var w = new Window ( "dialog" );
    w.row = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.panels = w.row.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}");
    w.lpanel = w.row.add("panel {text: '" + __('content') + "', alignChildren: ['fill', 'fill']}");
    w.list = w.lpanel.add("listbox");
    w.list.minimumSize.width = 350;
    w.panel1 = w.panels.add("panel {text: 'Offline', alignChildren: ['fill', 'fill']}");
    if ( offer_fileserver_option ) {
      w.panel2 = w.panels.add("panel {text: 'Local', alignChildren: ['fill', 'fill']}");
    }
    w.panel3 = w.panels.add("panel {text: 'Online', alignChildren: ['fill', 'fill']}");
    w.cb1 = w.panel1.add("checkbox", undefined, __('offline'))
    if ( offer_fileserver_option ) {
      w.cb2 = w.panel2.add("checkbox", undefined, __('server'))
    }
    w.cb3 = w.panel3.add("checkbox", undefined, __('remote'))
    w.cb3.value = true;

    w.srcrow1 = w.panel1.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.src1 = w.srcrow1.add("edittext", [undefined, undefined, 350, 20] );
    w.sel_btn1 = w.srcrow1.add("button", undefined, "?");
    w.sel_btn1.id = "offline"
    w.sel_btn1.onClick = select_folder;

    if ( offer_fileserver_option ) {
      w.srcrow2 = w.panel2.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
      w.src2 = w.srcrow2.add("edittext", [undefined, undefined, 350, 20] );
      w.sel_btn2 = w.srcrow2.add("button", undefined, "?");
      w.sel_btn2.id = "server"
      w.sel_btn2.onClick = select_folder;
    }

    w.srcrow3 = w.panel3.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.src3 = w.srcrow3.add("edittext", [undefined, undefined, 350, 20], "https://daten.project-octopus.net/Octopus4", {readonly: true, enabled: false} );
    w.sel_btn3 = w.srcrow3.add("button", undefined, "?");
    w.sel_btn3.id = "online"
    w.sel_btn3.onClick = function() {
      make_request();
      display_config( jsons[2] );
    }

    w.btns = w.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
    w.cancelElement = w.btns.add("button", undefined, __('cancel'));
    w.defaultElement = w.btns.add("button", undefined, __('install-online'));


    w.cb1.onClick = cb_click;
    if ( offer_fileserver_option ) w.cb2.onClick = cb_click;
    w.cb3.onClick = cb_click;
    
    make_request();

    var do_what = w.show();
    if ( do_what == 2 ) {
      return false;
    }
    if ( w.cb1.value ) {
      return jsons[0]
    } else if ( offer_fileserver_option && w.cb2.value ) {
      return jsons[1]
    } else {
      return jsons[2]
    }

    function cb_click() {
      w.cb1.value = false;
      if ( offer_fileserver_option ) w.cb2.value = false;
      w.cb3.value = false;
      this.value = true;
      fix_btn_and_set_basepath();
    }
    function fix_btn_and_set_basepath() {
      if ( w.cb1.value ) {
        w.defaultElement.text = __('install-offline')
        base_path = w.src1.text;
      } else if ( offer_fileserver_option && w.cb2.value ) {
        w.defaultElement.text = __('install-server')
        base_path = w.src2.text;
      } else {
        w.defaultElement.text = __('install-online')
        base_path = w.src3.text;
      }
    }
    function select_folder() {
      var me = this.id;
      var f = Folder.selectDialog( __('where-is') );
      if ( ! f ) return;

      w.cb1.value = false;
      if ( offer_fileserver_option ) w.cb2.value = false;
      w.cb3.value = false;

      var cfg = __readJson( f.fullName + "/index.json" );
      if ( ! cfg ) {
        alert( __('no-index'))
        return;
      }
      base_path = f.fullName;
      display_config( cfg )

      if ( me == "offline" ) {
        w.src1.text = f.fullName;
        w.cb1.value = true;
        cfg.base_url = "";
        jsons[0] = cfg;
      } else {
        if ( offer_fileserver_option ) {
          w.src2.text = f.fullName;
          w.cb2.value = true;
          jsons[1] = cfg;
        }
      }
      fix_btn_and_set_basepath();
    }
    function make_request( default_url ) {
      if ( ! default_url ) default_url = w.src3.text;
      if ( ! check_url( default_url ) ) return;
      try {
        var raw = __call_request( default_url, "index.json" );
        jsons[2] = JSON.parse(raw);
      } catch(e) {
        alert( __('failed-download') + "\n" + e.message + " on " + e.line );
      }
    }
    function check_url( url ) {
      if ( ! url || url.search(/^http/i) == -1 ) {
        alert( __('no-url') );
        return false;
      }
      return true;
    }
    function display_config( cfg ) {
      if ( typeof cfg == "string" ) cfg = JSON.parse( cfg );
      w.list.removeAll();
      for ( var n = 0; n < cfg.configs.length; n++ ) {
        w.list.add("item", cfg.configs[n].filename);
      }
    }
  }   // get source


  function update_resources(configs) {
    try {

      for (var _nc = 0; _nc < configs.length; _nc++) {
        var c = configs[_nc];

        try {
          var tgt_path = get_tgt_path(c);
          __ensureFolder(tgt_path);
        } catch (e) {
          $.writeln( e.message + " on " + e.line );
          continue;
        }
        var tgt_file = new File(tgt_path), done;
        var is_new = !tgt_file.exists;
        if (is_new || !eq_filesize(c.check, tgt_path)) {
          
          // --------------------------------------------------------------------
          // ------------------------------------------------------- URL
          if (c.base_url.search(/^http/i) != -1) {
            var src_path = (c.base_url + "/" + c.subpath).replace(/\/$/, "");
            install_from_url( c, src_path, tgt_path );
            
          } else {
            // --------------------------------------------------------------------
            // ----------------------------------------------------- File
            var src_path = (base_path + "/" + c.subpath).replace(/\/$/, "");
            install_from_fileserver( c, src_path, tgt_path );
          }
        } else {
          old.push( c.filename );
        }
      }
    } catch (e) {
  
    } finally {
      _pbw.close();
    }

    function install_from_url( c, src_path, tgt_path ) {
      try {
    
        var tgt_file = __call_request(
          src_path,
          c.filename,
          "file",
          tgt_path,
          true
        )
        if ( ! tgt_file.exists ) throw new Error( "Download gescheitert" );
    
        if (is_new) {
          nu.push(c.filename);
        } else {
          updated.push(c.filename);
        }
      } catch (e) {
        $.writeln( e.message + " on " + e.line );
        failed.push(c.filename);
      }
      $.sleep(100);

    }
    function install_from_fileserver( c, src_path, tgt_path ) {
      try {
        var src = new File(src_path + "/" + c.filename);
        if (src.exists) {
          var done = src.copy(tgt_path);
          if (!done) {
        
            failed.push(c.filename);
          } else {
        
            if (c.id != "index") {  // Ich will nicht sehen, ob das JSON wackelt
              if (is_new) {
                nu.push(c.filename);
              } else {
                updated.push(c.filename);
              }
            }
          }
        } else {
          $.writeln( e.message + " on " + e.line );
          failed.push(c.filename);
        }
      } catch (e) {
        $.writeln( e.message + " on " + e.line );
        failed.push(c.filename);
      }
    }
  }   // update_resources

  function show_log( what, set ) {
    try {
      var w = new Window("dialog {orientation: 'column', alignChildren: ['left', 'top']}");
      var lb;
      for ( var n = 0; n < what.length; n++ ) {
        var i = what[n];
        if ( i.a.length ) {
          w.add("statictext", undefined, __(i.key));
          lb = w.add("listbox", undefined, i.a);
          lb.preferredSize = [300, Math.min(180, (i.a.length * 20) + 20)];
        }
      }
      w.defaultElement = w.add("button", undefined, "OK");
      w.show();
    } catch(e) {
      $.writeln( e.message + " on " + e.line)
    }
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
    // $.writeln("Vergleiche: " + check + " mit " + tgt_size + " für " + tgt_path);
    // Ich weiß nicht, ob "exakt identische Länge" zu restriktiv ist
    return Math.abs(tgt_size - check) < 4;
  }

}






  function __(key) {
    switch(key) {
      case "abc": 
        return localize({
          "de": "abc",
          "en": "def"
        });
      case "where-is": 
        return localize({
          "de": "Wo liegt das entpackte Paket?",
          "en": "Where is the unzipped package?"
        });
      case "cancel": 
        return localize({
          "de": "Abbrechen",
          "en": "Cancel"
        });
      case "local": 
        return localize({
          "de": "lokale Installation",
          "en": "Local Installation"
        })
      case "remote": 
        return localize({
          "de": "Online Installation",
          "en": "Online Installation"
        })
      case "offline": 
        return localize({
          "de": "Offline Installation",
          "en": "Offline Installation"
        })
      case "server": 
        return localize({
          "de": "Fileserver Installation",
          "en": "Fileserver Installation"
        })
      case "online": 
        return localize({
          "de": "Online Quelle benutzens",
          "en": "Use Online Source"
        })
      case "local_desc": 
        return localize({
          "de": "Sie können ein lokal geladenes Paket installieren",
          "en": "You can install from a downloaded, local package"
        })
      case "online_desc": 
        return localize({
          "de": "Sie können von der Online-Quelle installieren",
          "en": "You can install from our Online-Repository"
        })
      case "no-url": 
        return localize({
          "de": "Error\nGeben Sie bitte eine URL ein, bevor Sie die Config laden",
          "en": "Error\nPlease enter a URL before attempting to load the config"
        })
      case "failed-download": 
        return localize({
          "de": "Unter dieser Adresse konnte keine Config geladen werden",
          "en": "No config could be loaded with this address"
        })
      case "no-index": 
        return localize({
          "de": "Dieser Ordner enthält keine index.json",
          "en": "No index.json in this folder"
        })
      case "content": 
        return localize({
          "de": "Inhalt des ausgewählten Pakets",
          "en": "Content of the selected package"
        })
      case "install-online": 
        return localize({
          "de": "Online-Paket installieren",
          "en": "Install online-package"
        })
      case "install-offline": 
        return localize({
          "de": "Offline-Paket installieren",
          "en": "Install offline-package"
        })
      case "install-server": 
        return localize({
          "de": "Server-Paket installieren",
          "en": "Install server-package"
        })
      case "already-there": 
        return localize({
          "de": "Anscheinend existiert bereits die alte Version von Octopus\n\nWollen Sie abbrechen, um diese zu entfernen?",
          "en": "Apparently an old version of Octopus already exists\n\nDo you want to cancel to remove it?"
        })
      case "nu-script": 
        return localize({
          "de": "Folgende Dateien wurden installiert",
          "en": "The following files have been installed"
        })
      case "old-script": 
        return localize({
          "de": "Folgende Dateien waren bereits installiert",
          "en": "The following files were already installed"
        })
      case "updated-script": 
        return localize({
          "de": "Folgende Dateien wurden aktualisiert",
          "en": "The following files have been updated."
        })
      case "failed-script": 
        return localize({
          "de": "Folgende Dateien konnten nicht installiert werden",
          "en": "The following files could not be installed"
        })
        
      default:
        return key;
    }
  }







/**
 * Liest eine Datei und gibt den Inhalt als String zurück.
 * Gibt null zurück wenn die Datei nicht existiert.
 */
function __readFile(filePath) {
  var f = new File(filePath);
  if (!f.exists) return null;
  try {
    f.encoding = "UTF-8";
    f.open("r");
    var content = f.read();
    return content;
  } catch(e) {

    $.writeln("__readFile Fehler: " + e.message);
    return null;
  } finally {
    try { f.close(); } catch(e) {}
  }
  return content;
}

/**
 * Schreibt einen String in eine Datei (überschreibt).
 * Erstellt Elternordner falls nötig.
 */
function __writeFile(filePath, content, mode) {
  if ( ! mode ) mode = "w";
  try {
    var f = new File(filePath);
    __ensureFolder( f.parent.fullName );
    f.encoding = "UTF-8";
    f.open( mode );
    f.write(content);
    f.close();
  } catch(e) {
    $.writeln("__writeFile Fehler: " + e.message + " (" + filePath + ")");
    throw e;
  }
}

/**
 * Liest eine JSON-Datei und gibt das geparste Objekt zurück.
 * Gibt null zurück wenn die Datei nicht existiert oder nicht parsbar ist.
 */
function __readJson(filePath) {
  var content = __readFile(filePath);
  if (content === null || content === "") return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    $.writeln( e.message + " on " + e.line );
    return null;
  }
}

/**
 * Schreibt ein Objekt als JSON in eine Datei.
 */
function __writeJson(filePath, obj) {
  __writeFile(filePath, JSON.stringify(obj, null, 2));
}

/**
 * Erstellt einen Ordner rekursiv (auch verschachtelte Pfade).
 */
function __ensureFolder(folderPath) {
  // Wenn ein Punkt im Namen, gehe ich von einer Datei aus.
  if ( folderPath.split("/").pop().search(/\./) != -1 ){
    folderPath = File( folderPath ).parent.fullName
  }
  var f = new Folder(folderPath);
  if (f.exists) return f;

  try {
    var parent = f.parent;
    if (!parent.exists) {
      __ensureFolder(parent.fullName);
    }
    if (!f.create()) {
      throw new Error("'" + folderPath + "' was not created");
    }
    if (!f.exists) {
      throw new Error("'" + folderPath + "' was not created");
    }
    return f;
  } catch(e) {
    // __log("error", "Ordner konnte nicht erstellt werden (" + folderPath + "): " + e.message, "includes");
    throw e; // Exception weiterwerfen - Installation MUSS abbrechen
  }
}

function __call_request( url, command, type, tgt_path, replace ) {
  if (typeof JSON !== "object") {
    __init();
  }
  if ( ! type ) type = "data";

  var request = {
    url: url,
    command: command, // defaults to ""
    port: "", // defaults to ""
    method: "GET",
  }

  if (type == "data") {
    var response = restix.fetch(request);
    if (response.error) {
      throw new Error("HTTP Request fehlgeschlagen: " + url + "/" + command + " - " + response.errorMsg);
    }
    if (response.httpStatus >= 400) {
      throw new Error("HTTP Status " + response.httpStatus + ": " + url + "/" + command);
    }

    if ( tgt_path && (replace || !File(tgt_path).exists) ) {
      var f = new File( tgt_path );
      f.encoding = "UTF-8";
      f.open("w");
      f.write( response.body );
      f.close();
    }
    return response.body;

  } else {
    if ( ! tgt_path ) tgt_path = Folder.desktop.fullName + "/_tempdatei.txt";

    if (replace || !File(tgt_path).exists) {
      var temp = new File(tgt_path);
      var response = restix.fetchFile(request, temp);
      if ( response.httpStatus == 404 ) {
        throw new Error( "File '" + url + "' not found");
      }
      if (response.error) {
        throw new Error(response.error + "\n" + response.errorMsg);
      }
      return temp;
    }
  }
}
function __init() {
  PATH_SCRIPT_PARENT = app.scriptPreferences.scriptsFolder.parent.fullName;
  PATH_DATA_FOLDER = Folder.userData.fullName + "/Octopus4";
  PATH_LOG_FILE = PATH_DATA_FOLDER + "/Logs/log.json";
  __ensureFolder(PATH_LOG_FILE);

  // ------------------------------------------------------------------------------------------------
  // JSON
  // ------------------------------------------------------------------------------------------------
  if (typeof JSON !== "object") {
    JSON = {};
  }
  
  (function () {
    "use strict";
    
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    
    function f(n) {
      return (n < 10)
          ? "0" + n
          : n;
    }
    
    function this_value() {
      return this.valueOf();
    }
    
    if (typeof Date.prototype.toJSON !== "function") {
      
      Date.prototype.toJSON = function () {
        
        return isFinite(this.valueOf())
            ? (
                this.getUTCFullYear()
                + "-"
                + f(this.getUTCMonth() + 1)
                + "-"
                + f(this.getUTCDate())
                + "T"
                + f(this.getUTCHours())
                + ":"
                + f(this.getUTCMinutes())
                + ":"
                + f(this.getUTCSeconds())
                + "Z"
            )
            : null;
      };
      
      Boolean.prototype.toJSON = this_value;
      Number.prototype.toJSON = this_value;
      String.prototype.toJSON = this_value;
    }
    
    var gap;
    var indent;
    var meta;
    var rep;
    
    
    function quote(string) {
      rx_escapable.lastIndex = 0;
      return rx_escapable.test(string)
          ? "\"" + string.replace(rx_escapable, function (a) {
        var c = meta[a];
        return typeof c === "string"
            ? c
            : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + "\""
          : "\"" + string + "\"";
    }
    
    
    function str(key, holder) {
      var i;          // The loop counter.
      var k;          // The member key.
      var v;          // The member value.
      var length;
      var mind = gap;
      var partial;
      var value = holder[key];
      
      if (
          value
          && typeof value === "object"
          && typeof value.toJSON === "function"
      ) {
        value = value.toJSON(key);
      }
      
      if (typeof rep === "function") {
        value = rep.call(holder, key, value);
      }
      
      switch (typeof value) {
        case "string":
          return quote(value);
        
        case "number":
          
          return (isFinite(value))
              ? String(value)
              : "null";
        
        case "boolean":
        case "null":
          
          return String(value);
          
        case "object":
          
          if (!value) {
            return "null";
          }
          
          gap += indent;
          partial = [];
          
          if (Object.prototype.toString.apply(value) === "[object Array]") {
            
            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || "null";
            }
            
            v = partial.length === 0
                ? "[]"
                : gap
                    ? (
                        "[\n"
                        + gap
                        + partial.join(",\n" + gap)
                        + "\n"
                        + mind
                        + "]"
                    )
                    : "[" + partial.join(",") + "]";
            gap = mind;
            return v;
          }
          
          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              if (typeof rep[i] === "string") {
                k = rep[i];
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (
                      (gap)
                          ? ": "
                          : ":"
                  ) + v);
                }
              }
            }
          } else {
            
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (
                      (gap)
                          ? ": "
                          : ":"
                  ) + v);
                }
              }
            }
          }
          
          v = partial.length === 0
              ? "{}"
              : gap
                  ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                  : "{" + partial.join(",") + "}";
          gap = mind;
          return v;
      }
    }
    
    if (typeof JSON.stringify !== "function") {
      meta = {    // table of character substitutions
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\"": "\\\"",
        "\\": "\\\\"
      };
      JSON.stringify = function (value, replacer, space) {
        
        var i;
        gap = "";
        indent = "";
                
        if (typeof space === "number") {
          for (i = 0; i < space; i += 1) {
            indent += " ";
          }
          
        } else if (typeof space === "string") {
          indent = space;
        }
        
        rep = replacer;
        if (replacer && typeof replacer !== "function" && (
            typeof replacer !== "object"
            || typeof replacer.length !== "number"
        )) {
          throw new Error("JSON.stringify");
        }
        
        return str("", {"": value});
      };
    }
    
    
    if (typeof JSON.parse !== "function") {
      JSON.parse = function (text, reviver) {
        
        var j;
        
        function walk(holder, key) {
          
          var k;
          var v;
          var value = holder[key];
          if (value && typeof value === "object") {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }
        
        text = String(text);
        rx_dangerous.lastIndex = 0;
        if (rx_dangerous.test(text)) {
          text = text.replace(rx_dangerous, function (a) {
            return (
                "\\u"
                + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
            );
          });
        }
        
        if (
            rx_one.test(
                text
                    .replace(rx_two, "@")
                    .replace(rx_three, "]")
                    .replace(rx_four, "")
            )
        ) {
          
          j = eval("(" + text + ")");
          
          return (typeof reviver === "function")
              ? walk({"": j}, "")
              : j;
        }
        
        throw new SyntaxError("JSON.parse");
      };
    }
  }());

  // ------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------
  // HTTP
  // ------------------------------------------------------------------------------------------------

  /****************
  # Connect InDesign to the web
  * HTTPS supported 
  * Works form CS4 to CC 2022 (ExtendScript based library)
  * Based on VBScript/ServerXMLHTTP (Win) AppleScript/curl (Mac) relies on app.doScript()

  ## Getting started
  See examples/connect.jsx

  * @Version: 1.37
  * @Date: 2023-10-28
  * @Author: Gregor Fellenz, http://www.publishingx.de
  * Acknowledgments: 
  ** Library design pattern from Marc Autret https://forums.adobe.com/thread/1111415
  */

  $.global.hasOwnProperty('restix') || (function (HOST, SELF) {
    HOST[SELF] = SELF;

    /****************
    * PRIVATE
    */
    var INNER = {};
    INNER.version = "2025-11-04-1.4";


    /** Returns if the operating system is windows 
    * @return {String} true | false
    */
    INNER.isWindows = function () {
      return ($.os.indexOf("Windows") > -1);
    }

    /** Check the request information object and construct a full URL
    * @param {request} Request information object
    * @returns{request} Request information object or throws an error
    */
    INNER.checkRequest = function (request) {
      if (request.url == undefined || request.url == "") throw Error("No property [url] found/set");
      if (request.url.toString().slice(-1) == "/") request.url = request.url.toString().slice(0, -1);

      if (request.command == undefined) request.command = "";
      if (request.command.toString()[0] == "/") request.command = request.command.toString().substr(1);

      if (request.port == undefined) request.port = "";
      if (isNaN(request.port)) throw Error("[port] is Not a Number");

      // Add port
      if (request.port != "") {
        request.fullURL = request.url + ":" + request.port + "/";
      }
      else {
        request.fullURL = request.url + "/";
      }

      // Add command 
      if (request.command != "") {
        request.fullURL = request.fullURL + request.command;
      }

      // not encoded, we need to encode;
      if (decodeURI(request.fullURL) == request.fullURL) {
        request.fullURL = encodeURI(request.fullURL);
      }

      if (request.method == undefined || request.method == "") request.method = "GET";
      if (!(request.method == "GET" || request.method == "POST" || request.method == "PUT" || request.method == "PATCH" || request.method == "DELETE" || request.method == "HEAD")) throw Error("Method " + request.method + " is not supported");  // Missing HEAD 

      if (request.method == "POST" && (request.binaryFilePath == undefined || request.binaryFilePath == "")) request.binaryFilePath = false;

      if (request.headers == undefined) request.headers = [];
      if (!(request.headers instanceof Array)) throw Error("Provide [headers] as Array of {name:'',value''} objects");
      if (request.body == undefined || request.body == "") request.body = false;

      if (request.body && request.binaryFilePath) throw Error("You must not provide [body] and [binaryFilePath]");

      if (request.unsafe == undefined) request.unsafe = false;

      if (request.proxy == undefined) request.proxy = false;

      return request;
    }

    /** The main connection function. Need to be slashed
    * @return {response} Response result object 
    */
    INNER.processRequest = function (request, outFile) {
      var response = {
        error: false,
        errorMsg: "",
        body: "",
        httpStatus: 900
      };

      var scriptCommands = [];
      var result = "";

      if (INNER.isWindows()) {
        // Since Win10 Update Feb 2019 msxml3 does not work anymore...
        scriptCommands.push('Dim xHttp : Set xHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")');
        // Konstanten für ADODB.Stream
        scriptCommands.push('Const adTypeBinary = 1');
        scriptCommands.push('Const adSaveCreateOverWrite = 2');
        scriptCommands.push('Const adModeReadWrite = 3');

        scriptCommands.push('Dim res');
        scriptCommands.push('On Error Resume Next');
        scriptCommands.push('xHttp.Open "' + request.method + '", "' + request.fullURL + '", False');

        if (request.proxy != false) {
          // xHttp.SetProxy 1
          scriptCommands.push('xHttp.setProxy 2, "' + request.proxy + '"');
        }

        for (var i = 0; i < request.headers.length; i++) {
          scriptCommands.push('xHttp.setRequestHeader "' + request.headers[i].name + '","' + request.headers[i].value.replace(/"/g, '""') + '"');
        }
        if (request.unsafe) {
          //~ ' 2 stands for SXH_OPTION_IGNORE_SERVER_SSL_CERT_ERROR_FLAGS
          //~ ' 13056 means ignore all server side cert error
          scriptCommands.push('xHttp.setOption 2, 13056');
        }

        if (request.body) {
          scriptCommands.push('xHttp.Send "' + request.body.replace(/"/g, '""').replace(/\n|\r/g, '') + '"');
        }
        else if ((request.method == "POST" || request.method == "PUT") && request.binaryFilePath) {
          // http://www.vbforums.com/showthread.php?418570-RESOLVED-HTTP-POST-a-zip-file
          scriptCommands.push('    Dim sFile');
          scriptCommands.push('    sFile = "' + request.binaryFilePath + '"');


          scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
          scriptCommands.push('    objStream.Type = adTypeBinary');
          scriptCommands.push('    objStream.Mode = adModeReadWrite');
          scriptCommands.push('    objStream.Open');
          scriptCommands.push('    objStream.LoadFromFile(sFile)');

          scriptCommands.push('    xHttp.SetRequestHeader "Content-Length", objStream.Size');
          scriptCommands.push('    xHttp.Send objStream.Read(objStream.Size)');
          scriptCommands.push('    Set objStream= Nothing');
        }
        else {
          scriptCommands.push('xHttp.Send');
        }

        scriptCommands.push('If err.Number = 0 Then');

        if (outFile) {
          scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
          scriptCommands.push('    objStream.Type = adTypeBinary');
          scriptCommands.push('    objStream.Mode = adModeReadWrite');
          scriptCommands.push('    objStream.Open');
          scriptCommands.push('    objStream.Write xHttp.responseBody');
          scriptCommands.push('    objStream.SaveToFile "' + outFile.fsName + '" , adSaveCreateOverWrite');
          scriptCommands.push('    objStream.Close');
          scriptCommands.push('    Set objStream= Nothing');
          scriptCommands.push('	res = "outFile" &  vbCr & "-----http-----" & xHttp.getAllResponseHeaders &  vbCr & "-----http-----" &  xHttp.status');
        }
        else {
          scriptCommands.push('	res = xHttp.responseText  &  vbCr & "-----http-----" & xHttp.getAllResponseHeaders &  vbCr & "-----http-----" &  xHttp.status');
        }

        scriptCommands.push('Else');
        scriptCommands.push('	res =  "xHttpError "  & Err.Description &  " " & Err.Number');
        scriptCommands.push('End If');

        scriptCommands.push('Set xHttp = Nothing');
        scriptCommands.push('returnValue = res');

        scriptCommands = scriptCommands.join("\r\n");

        try {
          result = app.doScript(scriptCommands, ScriptLanguage.VISUAL_BASIC);
        }
        catch (e) {
          result = "doScriptError: " + e.message + " #" + e.number;
          if (e.number == 104705) {
            result += " Please start InDesign once with administrator rights. Close it and start it again as a normal user.";
          }
        }

      }
      else { // Mac
        // -L follow redirects 
        var curlString = 'curl --silent --max-time 30 --show-error -g -L ';
        for (var i = 0; i < request.headers.length; i++) {
          curlString += (' -H \'' + request.headers[i].name + ': ' + request.headers[i].value + '\'');
        }
        if (request.unsafe) {
          // Es gab einen Fall wo am Mac mit -k es nicht funktioniert hat curl: (35) Server aborted the SSL handshake
          curlString += ' -k ';
        }

        if (request.proxy != false) {
          curlString += ' --proxy ' + request.proxy
        }

        if (request.method == "HEAD") {
          curlString += ' -I --head ';
        }
        else if (outFile) {
          curlString += ' -X ' + request.method;
        }
        else {
          curlString += ' -X ' + request.method + ' -i ';
        }
        if (request.body) {
          curlString += ' -d \'' + request.body.replace(/'/g, "\\\\\"").replace(/"/g, "\\\"").replace(/\n|\r/g, '') + '\'';
        }
        else if ((request.method == "POST" || request.method == "PUT") && request.binaryFilePath) {
          curlString += ' --data-binary \'@' + request.binaryFilePath + '\'';
        }

        if (outFile) {
          curlString += ' -w \'outFile\n-----http-----%{http_code}\'';
          curlString += ' -o \'' + outFile.fsName + '\''
        }
        else {
          curlString += ' -w \'\n-----http-----%{http_code}\'';
        }
        curlString += ' \'' + request.fullURL + '\'';
        // $.writeln( "\n\n=========curl==============\n" + curlString + "\n=========/curl==============\n\n");
        try {
          result = app.doScript('do shell script "' + curlString + '"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
        }
        catch (e) {
          result = "doScriptError: " + e.message + " #" + e.number;
        }
      }

      // Fill response 
      if (typeof result == 'undefined') {
        throw Error("No result value. Probably System Script could not run?");
      }
      if (result.match(/^xHttpError|^curl: \(\d+\)|^doScriptError:/)) {
        response.error = true;
        response.errorMsg = result;
      }
      else {
        if (INNER.isWindows()) {
          var resArray = result.split("\r-----http-----");
          if (resArray.length == 3) {
            response.body = resArray[0];
            response.head = resArray[1];
            response.httpStatus = resArray[2] * 1;
          }
          else {
            throw Error("Wrong result value: [" + result + "]");
          }
        }
        else {
          // $.writeln( "-+-+-+-+-+-+-+-+\n\n" + result );
          var resArray = result.split("\r-----http-----");
          if (resArray.length == 2) {
            if (request.method == "HEAD") {
              response.head = resArray[0];
              response.body = "";
            }
            else {
              var headBodySplit = resArray[0].split(/\r\n?\r\n?/);
              if (headBodySplit.length > 2) {
                // multiple header sections (redirects)
                response.head = headBodySplit[headBodySplit.length - 2];
                response.body = headBodySplit.slice(-1)[0];
              }
              else if (headBodySplit.length == 2) {
                response.head = headBodySplit[0];
                response.body = headBodySplit[1];
              }
              else {
                response.body = resArray[0];
                response.head = "";
              }
            }
            response.httpStatus = resArray[1] * 1;
          }
          else {
            throw Error("Wrong result value: [" + result + "]");
          }
        }


        var headSplit = response.head.split(/\n|\r/);
        response.head = {}
        for (var h = 0; h < headSplit.length; h++) {
          var headProperty = headSplit[h];
          if (headProperty.replace(/\s/g, '') == "") continue;
          var colonIndex = headProperty.indexOf(":");
          response.head[headProperty.substring(0, colonIndex).toLowerCase()] = headProperty.substring(colonIndex + 1).replace(/^ +/, "");
        }
      }

      return response;
    }


    /****************
    * API 
    */
    /** Process an HTTP Request 
    * @param {request} Request object with connection Information
    * @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
    */
    SELF.fetch = function (request) {
      request = INNER.checkRequest(request);
      return INNER.processRequest(request, false);
    }

    /** Process an HTTP Request and writes the result to a give File
    * @param {request} Request Object with connection Information
    * @param {outFile} File to write to
    * @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
    */
    SELF.fetchFile = function (request, outFile) {
      if (outFile == undefined) throw Error("No file provided");
      if (outFile instanceof String) outFile = File(outFile);

      request = INNER.checkRequest(request);
      var response = INNER.processRequest(request, outFile);
      if (outFile.length == 0) {
        outFile.remove();
      }
      if (!outFile.exists) {
        response.error = true;
        response.errorMsg = "File was not created\n" + response.errorMsg;
      }
      return response;
    }

  })($.global, { toString: function () { return 'restix'; } });
}
