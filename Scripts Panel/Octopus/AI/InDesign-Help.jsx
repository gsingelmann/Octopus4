/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Experimental script that uses OpenAI to answer questions about Indesign

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-04-26

+    License (MIT)
		Copyright 2020 Gerald Singelmann/Satzkiste GmbH
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

#targetengine "octopus_help" 
#include "Startup Scripts/Octopus/Include.jsxinc"
__init(); 
script_id = "indesign-help";
__log("run", script_id, script_id);

_ui( );

function _ui( ) {
	var position = app.extractLabel('octopus_position_' + script_id);
  if ( position != "" ) {
		position = JSON.parse( position );
  }
	
  var width = 500;

  var w = new Window('dialog', "InDesign-Help", ( position ? { x: position.x, y: position.y} : undefined ) );
  w.script_id = script_id;
  w.orientation = 'column';
  w.alignChildren = ['fill', 'fill'];

  __insert_head( w, script_id );

  w.main = w.add( 'group {orientation: "column", alignChildren: ["fill","fill"]}');
  w.btns = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');
  w.footer = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');

  var saved_questions = read_questions();

  // ----------------------------------------------------------------------------------------------------------------------
  //  Die Controls
  // ----------------------------------------------------------------------------------------------------------------------
  w.main.add("statictext", undefined, __('ui_saved_questions'))
  w.saved_dd = w.main.add('dropdownlist', [undefined, undefined, width, 20], saved_questions)

  w.main.add('statictext', undefined, __('q'), );
  w.q = w.main.add('edittext', [undefined, undefined, width, 60], "", {multiline:true});

  w.g1 = w.main.add("group {orientation: 'row', alignChildren: ['right', 'top']}")

  w.ok_btn = w.g1.add('button', undefined, __("ui_ok"))
  w.ok_btn.enabled = false;

  w.main.add('statictext', undefined, __('a'), );
  w.a = w.main.add('edittext', [undefined, undefined, width, width/2], "", {multiline:true});

  w.cancelElement = w.btns.add('button', undefined, __('ui_cancel'))
  w.cancelElement.onClick = function() {
    this.window.close();
  }

  w.wait_msg = w.main.add("statictext", undefined, __("wait_msg"), {multiline: true})
  w.wait_msg.visible = false;

  // ----------------------------------------------------------------------------------------------------------------------
  //  Die Interaction
  // ----------------------------------------------------------------------------------------------------------------------
  w.saved_dd.onChange = function() {
    w.q.text = this.selection.text;
    w.q.notify("onChange");
    var a = get_answer( this.selection.index );
    w.a.text = a;
  }
  w.q.onChanging = w.q.onChange = function() {
    if ( /* w.q.text.toLowerCase().search(/indesign/) == -1 || */ w.q.text.length < 20 && ! w.ok_btn.enabled ) {
      w.ok_btn.enabled = false;
      // w.hint.visible = true;
    } else {
      w.ok_btn.enabled = true;
      w.a.text = __('wait');
      // w.hint.visible = false;
    }
  }

  w.ok_btn.onClick = function() {
    w.ok_btn.enabled = false;

    var _aux3 = JSON.stringify( {prompt: w.q.text, huba: "hopp"} );
    var request = {
      url: "https://www.cuppascript.com/stuff",
      command: "call_openai.php",
      method: "POST",
      body: _aux3,
      headers: [{name:"Content-Type", value:"application/json"}]
      // headers: [{name:"Content-type", value:"application/json; charset=UTF-8"}]
    }
    var response = restix.fetch(request);
    var a;
    if (response.error) {
      a = response.httpStatus + ": " + response.errorMsg;
    } else if ( response.httpStatus != 200 ) {
      a = "Error: API replied with Status " + response.httpStatus;
    } else {
      write_question( w.q.text );
      if ( DBG) $.writeln( response.body );
      a = JSON.parse( response.body );
      if ( a.success ) {
        a = a.text;
        write_answer( a );
      }
    }
    w.a.text = a;
    w.ok_btn.enabled = true;
  }

  w.show();

  function write_question( txt ) {
    var qa = __readJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json");
    if ( ! qa ) qa = [];
    var now = new Date().getTime();
    qa.push( {question: txt, answer: "", ts: now } );
    __writeJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json", qa );
  }
  function write_answer( txt ) {
    var qa = __readJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json");
    if ( ! qa ) qa = [];
    if ( qa.length && qa[ qa.length-1 ].answer == "" ) {
      qa[ qa.length-1 ].answer = txt;
      __writeJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json", qa );
    }
  }
}

function read_questions() {
  var qa = __readJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json" );
  if ( ! qa ) return [];
  var rs = [];
  for ( var n = 0; n < qa.length; n++ ) rs.push( qa[n].question );
  return rs;
}
function get_answer(nth) {
  var qa = __readJson( PATH_DATA_FOLDER + "/Prefs/" + script_id + ".json" );
  try {
    var a = qa[ nth ].answer;
    return a;
  } catch(e) {
    return "Error: " + e;
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
  if (DBG) $.writeln("loaded loc-strings");

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
