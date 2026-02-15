/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:StartupScript that copies Document fonts on Save as

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2026-01-19

+    License (MIT) 
		Copyright 2026 Gerald Singelmann/Satzkiste GmbH
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

		Application Event: : afterSaveAs
		Target: : Document, 567.indd
		Current: : Application, Adobe InDesign
// ---------------------------------------------------------------------------------------------------------------------- */
#targetengine collect_docfonts

#include "./Octopus-include-su.jsxinc"
#include "./Octopus-Tools-su.jsxinc"

script_id = "collect-docfonts-daemon";

__init();

app.addEventListener( "afterSaveAs", saveas_handler );

function saveas_handler(event) {
	try {
		__log("info", "save-as event", script_id)
		if ( ! get_info(event, "after-save-as") ) return;
		collect_doc_main( event.target);
	} catch(e) {
		__log("error", e.message + " on " + e.line )
	}
}
function get_info( event, str ) {
	try {
		if ( str == "before-open" && event.target.constructor.name != "Application" ) {
			return false;
		} else if ( str != "before-open" && event.target.constructor.name != "Document" ) {
			return false;
		}
		return true;
	} catch(e) {
		__log("error", e.message + " on " + e.line )
		return false;
	}
}
function collect_doc_main( doc ) {
	try {
		var prefs = app.extractLabel( "octopus_collect_fonts" );
		if ( prefs ) {
			try {
				prefs = JSON.parse( prefs );
			} catch ( e ) {
				prefs = "";
			}
		}
		if ( ! prefs ) {
			return;
		}
		if ( ! prefs.paths ) {
			return;
		}
	} catch(e) {
		__log("error", e.message + " on " + e.line )
	}

  // var myEventListener2 = app.addEventListener("afterSaveAs", collect_fonts, false);
  collect_fonts( doc )


  function collect_fonts( doc ) {
		try {
			if ( ! doc ) doc = app.activeDocument;
			if ( ! doc.saved ) return;

			var prefs = read_prefs();
			if ( ! prefs ) return;
			if ( prefs.onoff != "on" ) return;
			if ( prefs.switch == "active" && ! prefs.paths ) return;

			__log( "run", script_id, script_id );

			var do_collect = prefs.switch == "blocking" ? true : false;
			var dpath = doc.fullName.fullName;
			for ( var n = 0; n < prefs.paths.length; n++ ) {
				var p = prefs.paths[n];
				if ( dpath.indexOf( p ) == 0 ) {
					do_collect = prefs.switch == "blocking" ? false : true;
					break;
				}
			}

			if ( do_collect ) {	
				__log("info", "Schriften für '" + doc.name.replace(/\.indd/i,"") + "' sollen gesammelt werden", script_id)
				var tgt_path = doc.filePath + "/Document fonts";
				var tgt_folder = new Folder( tgt_path );
				if ( ! tgt_folder.exists ) {
					tgt_folder.create();
				}
				var msgs = [];
				var fonts = doc.fonts.everyItem().getElements();
				for ( var n = 0; n < fonts.length; n++ ) {
					var f = fonts[n];
					var l = f.location;
					var fontfile = new File( l );
					var fname = l.split("/").pop();
					var tgt_file = new File( tgt_path + "/" + fname );
					if (tgt_file.exists) {
						continue;
					}
					if ( fontfile.exists  ) {
						try {
							fontfile.copy( tgt_file.fullName );
						} catch ( e ) {
							msgs.push( __("Fehler beim Kopieren von ") + fname + ": " + e.message );
						}
					} else {
						if ( l == "Added from Adobe Fonts" ) {
							msgs.push( __("adobe-fonts") + ": " + f.name );
						} else {
							msgs.push( __("does-not-exist") + ": " + fname );
						}
					}		// exists
				}			// font loop
				if ( msgs.length > 0 ) {
					__alert( "krake", __("Schriften sammeln") + "\n" + msgs.join("\n"), "", "OK", false );
				}
			} else {
				__log("info", "Doc erfüllt die Kriterien nicht", script_id)
			}				// do collect
		} catch(e) {
			__log("error", e.message + " on " + e.line )
		}
  }


	function read_prefs( ) {
		try {
			var prefs = app.extractLabel( "octopus_collect_fonts" );
			if ( prefs ) {
				try {
					prefs = JSON.parse( prefs );
				} catch ( e ) {
					prefs = null;
				}
			}
			if ( ! prefs ) {
				prefs = { "onoff": "off", "switch": "active", "paths": "" };
			}
			return prefs;
		} catch(e) {
			__log("error", e.message + " on " + e.line )
		}		
	}

}
// --------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------
//  Localisation Strings
// --------------------------------------------------------------------------------------------------------------------------------------------
function __( id, script_id ) {
	try {
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
	} catch(e) {
		__log("error", e.message + " on " + e.line )
		return id;
	}	
}
function get_script_folder_path() {
	try {
		return app.activeScript.parent.fullName;
	} catch (e) { 
		return e.fileName.replace(/\/[^\/]+$/, "");
	}
}	

