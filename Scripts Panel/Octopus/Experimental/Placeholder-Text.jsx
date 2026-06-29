/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Experimental script that uses OpenAI to generate placeholder text about a topic you define

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    2026-05-17: Text geändert, der nach dem Prompting im Frame angezeigt wird
+    2026-06-29: Ollama eingebaut
  
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
#targetengine "octopus_placeholder";
#include "Startup Scripts/Octopus/Include.jsxinc"
var script_id = "placeholder" 
var response, response_text = "", tf;
__init();
__log("run", script_id, script_id);
main();

function main() {
  if (app.documents.length
    && app.selection.length
    && (app.selection[0].constructor.name == "TextFrame"
      || (app.selection[0].hasOwnProperty("baseline") && app.selection[0].parentTextFrames.length))
  ) {
    tf = app.selection[0];
    if (tf.hasOwnProperty("baseline")) tf = tf.parentTextFrames[0]

    // ui is a palette, selection can be changed while it's open, so we have to check the selection again when the button is clicked. 
    _ui("Octopus Placeholder");
  } else {
    __alert("stop", __('no_frame'), "no selection", "OK")
  }
}


function _ui(title) {
  var width = 500;

  try {
    var olist = try_to_get_ollama_models();
    if ( olist ) {
      olist = JSON.parse(olist);
      var omodels = [];
      for ( var n = 0; n < olist.models.length; n++ ) omodels.push( olist.models[n].model );
    } 
  } catch(e) {}

  var w = new Window('dialog', title);
  // var w = new Window('palette', title);
  w.script_id = "Placeholder"
  w.orientation = 'column';
  w.alignChildren = ['fill', 'fill'];

  __insert_head(w, script_id);

  w.main = w.add('group {orientation: "column", alignChildren: ["fill","fill"]}');
  w.btns = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');

  // ----------------------------------------------------------------------------------------------------------------------
  //  Die Controls
  // ----------------------------------------------------------------------------------------------------------------------
  w.main.add("statictext", undefined, __('what_topic'))
  w.topic = w.main.add('edittext', [undefined, undefined, width, 60], "", { multiline: true });

  w.main.add( "panel", [undefined, undefined, 300, 2])

  // markdown format
  w.frow = w.main.add("group {orientation: 'column', alignChildren: 'left', spacing: 4}")
  w.formatting = w.frow.add("checkbox", undefined, __('use-formatting'));
  w.formatting.value = false;
  w.show_template = w.frow.add("button", [undefined, undefined, 200, 20], __('show-template'))

  w.main.add( "panel", [undefined, undefined, 300, 2])

  // local llm
  if ( olist ) {
    w.lrow = w.main.add("group {orientation: 'column', alignChildren: 'left', spacing: 4}")
    w.ollama_cb = w.lrow.add("checkbox", undefined, "Use Ollama");
    w.o_cfg_row = w.lrow.add("group {orientation: 'row', alignChildren: 'fill', spacing: 4}")
    w.o_url = w.o_cfg_row.add("edittext", [undefined, undefined, width/2, 20], "http://localhost:11434/api/generate");
    w.o_model = w.o_cfg_row.add("dropdownlist", [undefined, undefined, width/2, 20], omodels);
    w.o_model.onChange = function() {
      app.insertLabel("octopus_placeholder_ollamamodel", w.o_model.selection.index.toString() )
    }
    var aux = app.extractLabel("octopus_placeholder_ollamamodel");
    if ( aux ) {
      try {
        w.o_model.selection = aux;
        $.writeln(aux);
      } catch(e) {
        $.writeln( e );
      }
    }
  }

  w.defaultElement = w.btns.add('button', undefined, __("ui_ok"))
  w.cancelElement = w.btns.add('button', undefined, __('ui_cancel'))

  w.cancelElement.onClick = function () {
    this.window.close();
  }
  w.defaultElement.onClick = do_the_work
  w.show_template.onClick = function() {
    var fld = new Folder( PATH_DATA_FOLDER + "/Assets" );
    if (fld.exists) {
      fld.execute();
    } else {
      alert("template not found");
    }
  }

  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_placeholder", JSON.stringify( w.location ));
  }
  w.onActivate = function() {
    var aux = app.extractLabel( "octopus_panelpos_placeholder" );
    try {
      aux = JSON.parse( aux );
      __move_scriptui_to( w, aux.x, aux.y );
    } catch(e) {}
  }
  w.show();
  



  function do_the_work() {
    var dbg = true;
    __log("dbg", "clicked ok", script_id)
    if (app.documents.length
      && app.selection.length
      && (app.selection[0].constructor.name == "TextFrame"
        || (app.selection[0].hasOwnProperty("baseline") && app.selection[0].parentTextFrames.length))
    ) {
      var _vorher = tf.contents;
      tf.contents = TextFrameContents.PLACEHOLDER_TEXT;
      var count = tf.characters.length,
          n_lines = tf.lines.length,
          n_per_line = Math.round( count / n_lines );
      count = Math.floor(count / 10) * 10;
      $.writeln("Zeichen: " + count + ", Zeilen: " + n_lines + ", pro Zeile: " + n_per_line);

      try {
        tf.characters.itemByRange(_vorher.length, tf.contents.length - 1).remove();
      } catch (e) {
        tf.contents = _vorher;
      }

    } else {
      // $.writeln("Kein Textfeld ausgewählt");
      __alert("stop", __('no_frame'), "no selection", "OK")
      return;
    }

    var locale = app.locale.toString().toLowerCase().replace(/_locale/,"");
    var s = app.selection[0];
    try {
      if ( s.hasOwnProperty("baseline") ) {
        locale = s.appliedLanguage.icuLocaleName;
      } else if ( s.constructor.name == "TextFrame" ) {
        locale = s.insertionPoints.firstItem().appliedLanguage.icuLocaleName;
      }
    } catch(e) {
    }


    this.enabled = false; 
    var _q = "Write a text using the language '" + locale + "'. It should contain about " + ( w.formatting.value ? count * 1.3 : count ) + " characters. The topic is: " + w.topic.text + ". ";
    if ( w.formatting.value ) {
        _q += " Use simple Markdown formatting, sparingly: subheadings, bold and italics, bulleted lists, tables; but only if it fits the content"
    }
    var request_string = JSON.stringify({ prompt: _q, huba: "hopp" });
    this.window.close();
    // tf.contents = __("wait") + "\nprompt: \n" + _q;
    var pbwin = new Window("palette");
    pbwin.msg = pbwin.add("statictext", [undefined, undefined, 400, 200], __("wait") + "\nprompt: \n" + _q, {multiline:true, enabled: false} );
    pbwin.show();

    $.writeln("Wating to send");
    wait_to_send = app.idleTasks.add({ name: "wait_to_send", sleep: 500 });
    wait_to_send.addEventListener("onIdle", function () {
      alert("is idle");
      __log("dbg", "sending: " + request_string + "", script_id)
      wait_to_send.sleep = 0;

      try {
        // ----------------------------------------------------------------------------------------------------------
        //  Ollama fragen, falls gewünscht
        // ----------------------------------------------------------------------------------------------------------
        if ( w.hasOwnProperty("ollama_cb") && w.ollama_cb.value ) {
          pbwin.msg.text = "...waiting for Ollama...\n" + pbwin.msg.text;
          __log("dbg", "trying ollama", script_id)
          var request = {
            url: "http://localhost:11434/api",
            command: "generate",
            method: "POST",
            body: JSON.stringify({
              model: w.o_model.selection.text,
              stream: false,
              prompt: _q
            })
          }
          response = restix.fetch( request );
          
          if ( response && response.httpStatus == 200 ) {
            __log("dbg", "response: " + response.body, script_id );
            var body = JSON.parse( response.body );
            // ### Checken, ob body.done == true?
            response_text = body.response.replace(/\n+/g, "\r");
            __log("dbg", "response: " + response.body, script_id)
          } else {
            pbwin.msg.text = "\nOllama Error-Code: " + response.httpStatus + "\nTrying online LLM\n" + pbwin.msg.text;
            __log("dbg", "error: " + response.httpStatus, script_id)
          }

        }

        // ----------------------------------------------------------------------------------------------------------
        //  Falls Ollama fail oder sowieso nicht
        // ----------------------------------------------------------------------------------------------------------
        if ( ! response_text ) {
          pbwin.msg.text = "...waiting for LLM...\n" + pbwin.msg.text;
          $.writeln("Sending request: " + request_string);
          var request = {
            url: "https://www.cuppascript.com/stuff",
            command: "call_openai.php", // defaults to ""
            method: "POST",
            body: request_string,
            headers: [{ name: "Content-type", value: "application/json" }]
            // headers: [{ name: "Content-type", value: "application/json; charset=UTF-8" }]
          }
          response = restix.fetch(request);
          // __log("dbg", "response: " + aux, script_id );
          try {
            var aux = JSON.parse(response.body);
            if ( aux.hasOwnProperty("text")) {
              aux = aux.text;
              response_text = aux.replace(/\n/g, "\r");
            }
          } catch (e) { 
            __log("error",  e.message + " on " + e.line, script_id )
            response_text = e.message + " on " + e.line
          }
          $.writeln( "response: " + response_text );
        }
      } catch(e) {
        alert( e.message + " on " + e.line );
      }
      // ----------------------------------------------------------------------------------------------------------
      //  Wenn alles geklappt hat, steht jetzt in response_text der Blindtext
      // ----------------------------------------------------------------------------------------------------------
      pbwin.close();
      wait_to_write = app.idleTasks.add({ name: "wait_to_write", sleep: 500 });
      wait_to_write.addEventListener("onIdle", function () {
        $.writeln("Trying to write text...");
        wait_to_write.sleep = 0;
        try {
          // __log("dbg", "Writing text", script_id)
          var doc = app.activeDocument;

          var tf = app.selection[0];
          tf.insertionPoints.lastItem().contents = response_text;
          
          // -------------------------------------------------------------------------------------------
          //  Markdown formatieren
          // -------------------------------------------------------------------------------------------
          if (w.formatting.value) {
            var format_script = new File( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Utilities/Format-Markdown.jsx");
            if ( format_script.exists ) {
              app.select( tf );
              app.doScript( format_script, ScriptLanguage.JAVASCRIPT );
            }
          }

          // -------------------------------------------------------------------------------------------
          // Übersatz löschen
          // -------------------------------------------------------------------------------------------
          var st = tf.parentStory;
          if (st.characters.length > tf.characters.length) {
            __log("dbg", (st.characters.length - tf.characters.length) + " Zeichen Übersatz", script_id)
            st.characters.itemByRange(tf.characters.lastItem().index + 1, st.characters.lastItem().index).remove();
          }


          // -------------------------------------------------------------------------------------------
          //  Ggf als Platzhalter markieren
          // -------------------------------------------------------------------------------------------
          var prefs = null;
          var dprefs = doc.extractLabel("octopus_checkplaceholder_prefs");
          var aprefs = app.extractLabel("octopus_checkplaceholder_prefs");
          if (dprefs) {
            // __log("dbg", "Markiere mit dprefs", script_id)
            prefs = JSON.parse(dprefs)
          } else if (aprefs) {
            if (aprefs) {
              // __log("dbg", "Markiere mit aprefs", script_id)
              prefs = JSON.parse(aprefs)
            }
          }

          if (prefs && prefs.aktiv) {
            var methods = ["USE_UNDERLINE", "USE_HIGHLIGHT"];
            var appearances = ["WAVY", "SOLID", "DASHED"];
            var cname = prefs.name;
            if (cname[0] != "ᴥ") cname = "ᴥ " + cname;
            var cond = doc.conditions.item(cname);
            if (!cond.isValid) {
              // in den prefs ist für methods etal nur der Index gespeichert.
              cond = doc.conditions.add({
                name: cname,
                indicatorColor: prefs.indicatorColor,
                indicatorMethod: ConditionIndicatorMethod[methods[prefs.indicatorMethod]],
                underlineIndicatorAppearance: ConditionUnderlineIndicatorAppearance[appearances[prefs.underlineIndicatorAppearance]]
              });
            }
            // 2026-03-13: Hier ist noch die rabiate Zuweisung drin, die andere Bedingungen überschreibt, das hatte ich schon mal besser...
            // st.texts.everyItem().appliedConditions = [cond];
            set_condition( st, cond );
          } else {
            // __log("dbg", "Mark nicht aktiv", script_id);
          }
        } catch (e) {
          __log("error", e.message + " on " + e.line, script_id)
        }
      });
    });
    
  }

  function set_condition( text, cond ) {
    var rngs = text.textStyleRanges.everyItem().getElements();
    // $.writeln( text.contents.substr(0,32) +  " - ranges: " + rngs.length );
    for ( var n = 0; n < rngs.length; n++ ) {
      var a = rngs[n].appliedConditions;
      a.push( cond );
      rngs[n].appliedConditions = a;
      // for ( var m = 0; m < a.length; m++ ) {
      //   $.write( a[m].name + " .. ");
      // }
      // $.writeln("   " + rngs[n].contents.substr(0,32) )
    }
  }
}

function try_to_get_ollama_models() {
  var request = {
    url: "http://localhost:11434/api",
    command: "tags",
    method: "GET",
    headers: [{ name: "Content-type", value: "application/json" }]
    // headers: [{ name: "Content-type", value: "application/json; charset=UTF-8" }]
  }
  var response = restix.fetch(request);
  if ( response.httpStatus != 200 ) {
    return null;
  } else {
    return response.body;
  }
}

function __(id) {
  var txt = "";
  // Nach Möglichkeit nur einmal laden
  try {
    if ( undefined === loc_strings ) {
      loc_strings = __readJson(get_script_folder_path() + "/Strings.json");
    }
  } catch(e) {
    // `undefined == loc_Strings`  wirft mitunter einen Fehler. k.A. warum
    loc_strings = __readJson(get_script_folder_path() + "/Strings.json");
  }
  // Beim Debuggen wurde die ID mitunter nachträglich hinzugefügt
  if (!loc_strings.hasOwnProperty(script_id)) {
    loc_strings = __readJson(get_script_folder_path() + "/Strings.json");
  }
  // Fallback, wenn die ID nicht da ist
  if (!loc_strings.hasOwnProperty(script_id)) {
    return id;
  }
  loc_strings = loc_strings[script_id];
  $.writeln("loaded loc-strings");

  if (loc_strings.hasOwnProperty(id)) {
    txt = localize(loc_strings[id]);
  } else {
    txt = id
  }
  var re;
  for (var n = 1; n < arguments.length; n++) {
    try {
      re = new RegExp("_" + n.toString() + "_");
      txt = txt.replace(re, arguments[n].toString());
    } catch (e) {
      __log("error", e.message + " on " + e.line, script_id);
    }
  }
  return txt;
}
function get_script_folder_path() {
  try {
    return app.scriptPreferences.scriptsFolder.fullName + "/Octopus";
    // return app.activeScript.parent.fullName;
  } catch (e) {
    return e.fileName.replace(/\/[^\/]+$/, "");
  }
}