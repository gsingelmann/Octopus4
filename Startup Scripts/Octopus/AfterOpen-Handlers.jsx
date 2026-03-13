#targetengine "octopus4"
#include "Include.jsxinc"
__init();


app.eventListeners.add('afterOpen', function (evt) {
  // -------------------------------------------------------------------------
  // Document-Messages: https://trello.com/c/VSfYODwp/202-neu-dokumenten-hinweis-notizen
  // -------------------------------------------------------------------------
  try {
    if ( evt.target.constructor.name == "Document" ) {
      var o = evt.target.extractLabel("cuppa-onOpen-message");
      if ( o ) {
        handle_doc_msg( evt.target );
      }
    }
  } catch(e) {
    __log("error", e.message + " on " + e.line, "doc-message" );
  }

  // -------------------------------------------------------------------------
  //  Anzeige-Default anwenden
  // -------------------------------------------------------------------------
  try {
    if ( evt.target.constructor.name.toLowerCase().indexOf("window") != -1 ) {
      var display_prefs = __readJson( PATH_DATA_FOLDER + "/Prefs/display-config-pref.json" );
      if ( display_prefs && display_prefs.use_default ) {
        var display_script = new File( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Display.jsx")
        if ( display_script.exists ) {
          app.insertLabel("octopus-display-argument", display_prefs.default_cfg)
          app.doScript( display_script, ScriptLanguage.JAVASCRIPT );
        }
      }
    }
  } catch(e) {
    __log("error", e.message + " on " + e.line + " in " + evt.target.toString() );
  }
})

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

