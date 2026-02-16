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
#include "./Octopus-include-2.jsxinc"
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
        "Sie haben " + n_modified + " geänderte und " + n_unsaved + " niemals gesicherte Dokumente offen.\n\nSollen die Änderungen soweit möglich gespeichert werden?", 
        "Watt nu?",
        [
          {value: "save", text: "Speichern"},
          {value: "egal", text: "Alles Egal"}
        ], 
        false
      );
      if ( rs == "egal" ) {
        app.documents.everyItem().close( SaveOptions.NO );
      } else {
        app.documents.everyItem().close( SaveOptions.YES );
      }
      $.bp();
    } else {
      app.documents.everyItem().close( SaveOptions.NO );
    }
  }
}