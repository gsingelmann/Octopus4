/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Calls the display script to apply the default settings. You can assign a keyboard shortcut to this
+   This script is part of project-octopus.net
+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de
+   Modified: 2026-03-13

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
var script_id = "display"
__log( "run", script_id, script_id );
try {
  var display_prefs = __readJson( PATH_DATA_FOLDER + "/Prefs/display-config-pref.json" );
  if ( display_prefs && display_prefs.use_default ) {
    var display_script = new File( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Display.jsx")
    if ( display_script.exists ) {
      app.insertLabel("octopus-display-argument", display_prefs.default_cfg)
      app.doScript( display_script, ScriptLanguage.JAVASCRIPT );
    }
  }
} catch(e) {
  __log("error", e.message + " on " + e.line, script_id );
}