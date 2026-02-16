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
#include "../Octopus-include-2.jsxinc"
var script_id = "placeholder-text"
__init();
__log("run", script_id, script_id);
main();

function main() {
  if (    app.documents.length 
    && app.selection.length 
    && (app.selection[0].constructor.name == "TextFrame" 
        || ( app.selection[0].hasOwnProperty("baseline") && app.selection[0].parentTextFrames.length) ) 
  ) {
    var tf = app.selection[0];
    if ( tf.hasOwnProperty("baseline") ) tf = tf.parentTextFrames[0]
    var _vorher = tf.contents;
    tf.contents = TextFrameContents.PLACEHOLDER_TEXT;
    var count = tf.characters.length;
    var a = _vorher.length, b = tf.contents.length;
    try {
      tf.characters.itemByRange( _vorher.length, tf.contents.length-1 ).remove();
    } catch(e) {
      tf.contents = _vorher;
    }
    _ui( "Octopus Placeholder", tf, count );
  } else {
    // alert( "Es muss ein Textrahmen markiert sein")
    __alert("stop", __('no_frame'), "no selection", "OK")
  }
}


function _ui( title, tf, count ) {
  count = Math.floor( count / 10 ) * 10;
	
  var width = 500;

  var w = new Window('palette', title );
  w.script_id = "Placeholder"
  w.orientation = 'column';
  w.alignChildren = ['fill', 'fill'];

  __insert_head( w, script_id);

  w.main = w.add( 'group {orientation: "column", alignChildren: ["fill","fill"]}');
  w.btns = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');
  // w.footer = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');    

  // ----------------------------------------------------------------------------------------------------------------------
  //  Die Controls
  // ----------------------------------------------------------------------------------------------------------------------
  w.main.add("statictext", undefined, __('what_topic'))
  w.topic = w.main.add('edittext', [undefined, undefined, width, 60], "", {multiline:true});

  w.defaultElement = w.btns.add('button', undefined, __("ui_ok"))
  w.cancelElement = w.btns.add('button', undefined, __('ui_cancel'))

  w.cancelElement.onClick = function() {
    this.window.close();
  }
  w.defaultElement.onClick = function() {
    this.enabled = false;
    if ( app.locale.toString() == "GERMAN_LOCALE" ) {
      var _q = "Schreib einen Text. Der Text sollte etwa " + count + " Zeichen enthalten. Das Thema ist: " +  w.topic.text;
    } else {
      var _q = "Write a text. It should contain about " + count + " characters. The topic is: " +  w.topic.text;
    }
    var request_string = JSON.stringify( {'q': _q} );
    this.window.close();
    tf.contents = _q;
    var pbwin = new Window("palette");
    pbwin.add("statictext", undefined, "...waiting...")
    pbwin.show();
    wait_to_send = app.idleTasks.add({name:"wait_to_send", sleep:500});
		wait_to_send.addEventListener("onIdle", function() {
      wait_to_send.sleep = 0;
      var request = {
        url: "https://octopus.cuppascript.de/api/v1/scripts/openai",
        command: "", // defaults to ""
        port: "", // defaults to ""
        method: "POST",
        body: request_string,
        headers: [{name:"Content-type", value:"application/json; charset=UTF-8"}]
      }
      response = restix.fetch(request);
      pbwin.close();
      // $.writeln( response.body );
      wait_to_write = app.idleTasks.add({name:"cs_reopen_doc", sleep:500});
      wait_to_write.addEventListener("onIdle", function() {
        try {
          // __log("info", "Writing text", script_id)
          var doc = app.activeDocument;
          wait_to_write.sleep = 0;
          
          var aux = response.body;
          try {
            aux = JSON.parse( aux );
            aux = aux.join("\n")
            aux = aux.replace(/\n\n+/g, "\r");
          } catch(e) {}
          tf.contents = aux;
          // -------------------------------------------------------------------------------------------
          // Übersatz löschen
          // -------------------------------------------------------------------------------------------
          var st = tf.parentStory;
          if ( st.characters.length > tf.characters.length ) {
            __log("info",  (st.characters.length - tf.characters.length) + " Zeichen Übersatz", script_id)
            st.characters.itemByRange( tf.characters.lastItem().index + 1, st.characters.lastItem().index ).remove();
          }
          // -------------------------------------------------------------------------------------------
          //  Ggf als Platzhalter markieren
          // -------------------------------------------------------------------------------------------
          
          var prefs = null;
          var dprefs = doc.extractLabel("octopus_checkplaceholder_prefs");
          var aprefs = app.extractLabel("octopus_checkplaceholder_prefs");
          if ( dprefs ) {
            // __log("info", "Markiere mit dprefs")
            prefs = JSON.parse( dprefs )
          } else if ( aprefs ) {
            if ( aprefs ) {
              // __log("info", "Markiere mit aprefs")
              prefs = JSON.parse( aprefs )
            }
          } 
      
          if ( prefs && prefs.aktiv ) {
            
            var methods = [ "USE_UNDERLINE", "USE_HIGHLIGHT" ];
            var appearances = ["WAVY", "SOLID", "DASHED"];
            var cname = prefs.name;
            if ( cname[0] != "ᴥ") cname = "ᴥ " + cname;
            var cond = doc.conditions.item( cname ); 
            if ( ! cond.isValid ) {
              // in den prefs ist für methods etal nur der Index gespeichert.
              cond = doc.conditions.add({
                name: cname,
                indicatorColor: prefs.indicatorColor,
                indicatorMethod: ConditionIndicatorMethod[ methods[prefs.indicatorMethod] ],
                underlineIndicatorAppearance: ConditionUnderlineIndicatorAppearance[ appearances[ prefs.underlineIndicatorAppearance ] ]
              });
            }
            st.texts.everyItem().appliedConditions = [ cond ];
          } else {
            // __log("info", "Mark nicht aktiv");
          }
        } catch(e) {
          __log("error", e.message + " on "  + e.line, script_id );
        }
    
      });
    });
  }

  w.show();
}



function __( id ) {
  var txt = "";
  try {
    var a = loc_strings;
  } catch(e) {
    loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    if (DBG) $.writeln("loaded loc-strings");
  }

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







