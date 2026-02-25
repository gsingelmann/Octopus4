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
#targetengine "octopus-ua-checkhyphens";
#include "../Octopus-include-2.jsxinc"
__init();
var script_id = "check-hyphenation";

if ( app.documents.length ) { 
  __log("run", script_id, script_id);
  show_panel();
}

function show_panel() {
  var doc = app.activeDocument;

  var hits = register();
  if ( hits.length == 0 ) {
    __alert( 'krake', __('nothing found'))
    return;
  }

  var ix = 0;

  var w = new Window("palette {orientation: 'column', alignChildren: ['center', 'top']}");
  w.script_id = script_id;

  __insert_head( w, script_id );
  
  w.r0 = w.add("group {orientation: 'row', alignChildren: 'center'}")
  w.msg = w.r0.add("statictext", [undefined, undefined, 200, 20], __('found') + "1/" + hits.length + " | ", {justify: 'right'} );
  w.msg.justify = 'right';
  w.kind = w.r0.add("statictext", [undefined, undefined, 200, 20], "", {justify: 'left'} );
  w.r1 = w.add("group {orientation: 'row', alignChildren: ['', 'fill']}")
  w.r2 = w.add("group {orientation: 'row', alignChildren: ['', 'fill']}")
  w.prev = w.r1.add("button", undefined, __("prev"));
  w.next = w.r1.add("button", undefined, __("next"));
  w.fix = w.r2.add("button", undefined, __('fix'));

  w.prev.onClick = function () {
    ix--;
    update_view();
  }
  w.next.onClick = function () {
    ix++;
    update_view();
  }
  w.fix.onClick = function () {
    if ( hits[ix].kind == "hyphen" ) {
      doc.selection[0].contents = SpecialCharacters.DISCRETIONARY_HYPHEN;
    } else if ( hits[ix].kind == "break" ) {
      doc.selection[0].contents = SpecialCharacters.DISCRETIONARY_LINE_BREAK;
    } else if ( hits[ix].kind == "schwobbl" ) {
      doc.selection[0].contents = " ";
    } else {
      return;
    }
    hits.splice( ix, 1 );
    if ( ! hits.length ) w.close();
    w.msg.text = __('found') + "-/" + hits.length  + " | ";
    w.kind.text = "...";
  }

  var si_prev = doc.textPreferences.showInvisibles;
  doc.textPreferences.showInvisibles = true;
  update_view();

  w.onClose = function() {
    doc.textPreferences.showInvisibles = si_prev;
  }

  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_checkhyphens", JSON.stringify( w.location ));
  }

  w.show();

  var aux = app.extractLabel( "octopus_panelpos_checkhyphens" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( w, aux.x, aux.y );
  } catch(e) {}


  function update_view( ) {
    if ( ix < 0 ) ix = hits.length-1;
    if ( ix >= hits.length ) ix = 0;
    w.msg.text = __('found') + (ix+1) + "/" + hits.length;
    w.kind.text = __('type') + __( hits[ix].kind );

    try {
      app.select( hits[ix].text );
      var ma = app.menuActions.item("$ID/Fit Selection in Window");
      ma.invoke();
    } catch(e) {
      // alert(e);
    } finally {
      doc.layoutWindows[0].zoomPercentage = Math.min( doc.layoutWindows[0].zoomPercentage, 100 );
    }

  }


  function register() {
    var hits = [];

    app.findGrepPreferences = NothingEnum.NOTHING;
    app.findGrepPreferences.findWhat = "(?<=[[:alpha:]])-[[:space:]]*(?=[[:alpha:]])";
    var matches = doc.findGrep();
    for ( var n = 0; n < matches.length; n++ ) {
      var m = matches[n],
          st = m.parentStory,
          ix1 = m.insertionPoints.firstItem().index,
          ix2 = m.insertionPoints.lastItem().index;
      // ignore overset
      if ( st.insertionPoints[ix2].parentTextFrames.length ) {
        // there should be a "next" character, but who knows
        try {
          if ( Math.abs( st.characters[ix1].baseline - st.characters[ix2].baseline ) > 3 ) {
            hits.push( {kind: "hyphen", text: matches[n] });
          }
        } catch(e){}
      }
    }

    // app.findGrepPreferences.findWhat = "(?<!\-)\n";
    // var matches = doc.findGrep();
    // for ( var n = 0; n < matches.length; n++ ) {
    //   hits.push( {kind: "break", text: matches[n] });
    // }

    app.findGrepPreferences.findWhat = "([\\u\\l]\\d)\\K(?=\n)";
    var matches = doc.findGrep();
    for ( var n = 0; n < matches.length; n++ ) {
      hits.push( {kind: "schwobbl", text: matches[n] });
    }
    return hits;
  }
}

function handle() {

  var ix = 0;


}

function __( id ) {
  var txt = "";
    // loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    if (DBG) $.writeln("loaded loc-strings");

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