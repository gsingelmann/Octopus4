/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Declares the selected objects to be for decorative purposes (Accessibility)
+   This script is part of project-octopus.net
+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de
+   Modified: 2026-06-18
-		catch(e)  zu log(dbg) geändert <- Hatte einen InsertionPoint im Log.

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
#targetengine "octopus-2" 
#include "Startup Scripts/Octopus/Include.jsxinc";
var script_id = "assign-decoration";
__init();

var dbg = false;

AssignDecoration(); 
function AssignDecoration(){ 
		__log("run", script_id, script_id)

		try { 
			//-----------------------
			var n = 0, m = 0;
			for ( var ns = 0; ns < app.selection.length; ns++ ) {
				try {
					var sel = app.selection[ns];
					sel.objectExportOptions.altTextSourceType = SourceType.SOURCE_DECORATIVE_IMAGE;
					sel.objectExportOptions.applyTagType = TagType.TAG_ARTIFACT;
					n++;
				} catch(e) {
					__log("dbg", "Could not set decoration for object " + sel.constructor.name + ": " + e.message + " on " + e.line, script_id);
					m++;
				}
			}
			__alert("info", localize({ 
				en: n + " object(s) marked as decoration.\n" + m + " object(s) failed", 
				de: n + " Objekt(e) als Dekoration gekennzeichnet.\n" + m + " Objekt(e) konnten nicht geändert werden." 
			}), "", "OK", false);
			//-----------------------
		} catch(e) {
			__log("error", "Error in loop: " + e.message + " on " + e.line, script_id);
		}
}