/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Exports a bunch of documents to PDF

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-11-22

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
#include "Startup Scripts/Octopus/Include.jsxinc"
__init();
var script_id = "close-all";
__log( "run", script_id, script_id);

close_all();

function close_all() {
  if ( app.documents.length == 0 ) {
    return;
  } else {
    var docs = app.documents.everyItem().getElements();
    var n_unsaved = 0, n_modified = 0;
    for ( var n = 0; n < docs.length; n++ ) {
      var nm = docs[n].name.replace(/\.indd$/i,"");
      var s = docs[n].saved;
      var m = docs[n].modified;
      if ( ! s ) n_unsaved++;
      if ( m ) n_modified++;
    }
    if ( n_modified || n_unsaved ) {
      var rs = __alert( 
        "question", 
        __("message", n_modified, n_unsaved), 
        __("question"),
        [
          {value: "save", text: __("save")},
          {value: "egal", text: __("discard")},
          {value: "abbrechen", text: __("cancel")}
        ], 
        false
      );
      if ( rs == "egal" ) {
        app.documents.everyItem().close( SaveOptions.NO );
      } else if ( rs == "save" ) {
        app.documents.everyItem().close( SaveOptions.YES );
      } else if ( rs == "abbrechen" ) {
        return;
      }
      $.bp();
    } else {
      app.documents.everyItem().close( SaveOptions.NO );
    }
  }  
}

function __( id ) {
  var txt = "";
    loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
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