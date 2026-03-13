/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Experimental script that uses OpenAI to generate placeholder text about a topic you define

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
#targetengine "octopus_placeholder";
#include "Startup Scripts/Octopus/Include.jsxinc"
var script_id = "Placeholder-Text" 
var response;
__init();
__log("run", script_id, script_id);
main();

function main() {
  if (app.documents.length
    && app.selection.length
    && (app.selection[0].constructor.name == "TextFrame"
      || (app.selection[0].hasOwnProperty("baseline") && app.selection[0].parentTextFrames.length))
  ) {
    var tf = app.selection[0];
    if (tf.hasOwnProperty("baseline")) tf = tf.parentTextFrames[0]
    var _vorher = tf.contents;
    tf.contents = TextFrameContents.PLACEHOLDER_TEXT;
    var count = tf.characters.length,
        n_lines = tf.lines.length,
        n_per_line = Math.round( count / n_lines );

    var a = _vorher.length, b = tf.contents.length;
    try {
      tf.characters.itemByRange(_vorher.length, tf.contents.length - 1).remove();
    } catch (e) {
      tf.contents = _vorher;
    }
    _ui("Octopus Placeholder", tf, count);
  } else {
    // alert( "Es muss ein Textrahmen markiert sein")
    __alert("stop", __('no_frame'), "no selection", "OK")
  }
}


function _ui(title, tf, count) {
  count = Math.floor(count / 10) * 10;

  var width = 500;

  var w = new Window('palette', title);
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
  w.formatting = w.main.add("checkbox", undefined, __('use-formatting'));
  w.formatting.value = false;

  w.defaultElement = w.btns.add('button', undefined, __("ui_ok"))
  w.cancelElement = w.btns.add('button', undefined, __('ui_cancel'))

  w.cancelElement.onClick = function () {
    this.window.close();
  }
  w.defaultElement.onClick = do_the_work

  w.show();

  function do_the_work() {
    // __log("dbg", "clicked ok", script_id)
    this.enabled = false;
    // if (app.locale.toString() == "GERMAN_LOCALE") {
    //   var _q = "Schreib einen Text. Der Text sollte etwa " + count + " Zeichen enthalten. Das Thema ist: " + w.topic.text;
    // } else {
      var _q = "Write a text using the language '" + app.locale.toString().toLowerCase().replace(/_locale/,"") + "'. It should contain about " + count + " characters. The topic is: '" + w.topic.text + "'. ";
    // }
    if ( w.formatting.value ) {
      // if (app.locale.toString() == "GERMAN_LOCALE") {
      //   _q += " Der Text sollte mit einfachen Markdown-Formatierungen versehen sein: Zwischenüberschriften, fett und kursiv, Punktlisten,; alles aber nur, wenn der Inhalt das erfordert."
      // } else {
        _q += " Use simple Markdown formatting, sparingly: subheadings, bold and italics, bulleted lists, tables; but only if it fits the content"
      // }

    }
    var request_string = JSON.stringify({ prompt: _q, huba: "hopp" });
    this.window.close();
    tf.contents = _q;
    var pbwin = new Window("palette");
    pbwin.add("statictext", undefined, "...waiting...")
    pbwin.show();
    wait_to_send = app.idleTasks.add({ name: "wait_to_send", sleep: 500 });
    wait_to_send.addEventListener("onIdle", function () {
      // __log("dbg", "sending: '" + request_string + "'", script_id)
      wait_to_send.sleep = 0;
      var request = {
        url: "https://www.cuppascript.com/stuff",
        command: "call_openai.php", // defaults to ""
        method: "POST",
        body: request_string,
        headers: [{ name: "Content-type", value: "application/json" }]
        // headers: [{ name: "Content-type", value: "application/json; charset=UTF-8" }]
      }
      response = restix.fetch(request);
      // __log("dbg", "response0: " + JSON.stringify( response ), script_id );
      pbwin.close();
      $.writeln( response.body );
      wait_to_write = app.idleTasks.add({ name: "cs_reopen_doc", sleep: 500 });
      wait_to_write.addEventListener("onIdle", function () {
        try {
          // __log("dbg", "Writing text", script_id)
          var doc = app.activeDocument;
          wait_to_write.sleep = 0;

          var aux = response.body;
          // __log("dbg", "response: " + aux, script_id );
          try {
            aux = JSON.parse(aux);
            if ( aux.hasOwnProperty("text")) {
              aux = aux.text;
              aux = aux.replace(/\n/g, "\r");
              tf.contents = aux;
            }
          } catch (e) { 
            __log("error",  e.message + " on " + e.line, script_id )
            tf.contents = e.message + " on " + e.line
          }
          // -------------------------------------------------------------------------------------------
          // Übersatz löschen
          // -------------------------------------------------------------------------------------------
          var st = tf.parentStory;
          if (st.characters.length > tf.characters.length) {
            __log(("dbg", st.characters.length - tf.characters.length) + " Zeichen Übersatz", script_id)
            st.characters.itemByRange(tf.characters.lastItem().index + 1, st.characters.lastItem().index).remove();
          }
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

function __(id) {
  loc_strings = load_translation();
  if (loc_strings.hasOwnProperty(id)) {
    return localize(loc_strings[id]);
  } else {
    return id
  }
}
function load_translation() {
  return {
    "select_text": {
      "de": "Bitte wählen Sie einen Textrahmen",
      "en": "Please select a textframe"
    },
    "ui_ok": {
      "de": "Anfrage senden",
      "en": "Send Request"
    },
    "ui_cancel": {
      "de": "Schließen",
      "en": "Close"
    },
    "what_topic": {
      "de": "Worum geht's?",
      "en": "What's the topic?"
    },
    "wait": {
      "de": "Die Anfrage wird über einen einfachen Account gestellt. Das kann je nach Auslastungen zwischen 5 und 20sec dauern.",
      "en": "The request is made with a low-prio account. This can take between 5 and 20 seconds"
    },
    "no_frame": {
      "de": "Es muss ein Textrahmen markiert sein",
      "en": "You need to select a textframe first"
    }
  }
}

