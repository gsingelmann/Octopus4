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

		2026-04-24: Adobe Font Handling
								Auf Listbox umgestellt, diverse bugs
// ---------------------------------------------------------------------------------------------------------------------- */
#targetengine collect_docfonts

#include "./Include.jsxinc"

script_id = "collect-docfonts-daemon";

__init();

app.addEventListener( "afterSaveAs", saveas_handler );
app.addEventListener( "afterSave", saveas_handler );

function saveas_handler(event) {
	try {
		// __log("info", "save-as event", script_id)
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
				var fonts = doc.fonts.everyItem().getElements();
				if ( fonts.length == 0 ) {
					__log("info", "Keine Schriften in " + doc.name.replace(/\.indd/i,""), "collect-docfonts-daemon")
					return;
				}
				__log( "run", script_id, "collect-docfonts-daemon" );
				__log("info", "Schriften fuer " + doc.name.replace(/\.indd/i,"") + " sollen gesammelt werden", "collect-docfonts-daemon")
				var tgt_path = doc.filePath + "/Document fonts";
				var tgt_folder = new Folder( tgt_path );
				if ( ! tgt_folder.exists ) {
					tgt_folder.create();
				}
				var msgs = [];
				for ( var n = 0; n < fonts.length; n++ ) {
					try {
						var f = fonts[n];
						var fontfile;
						if ( ! f || ! f.location ) {
							fontfile = new File( Folder.desktop.fullName + "/this file does not exist.blah" );
						} else {
							var l = f.location;
							fontfile = new File( l );
							// l.split geht nicht wg Windows
							var fname = fontfile.fullName.split("/").pop();
							var tgt_file = new File( tgt_path + "/" + fname );
							if (tgt_file.exists) {
								continue;
							}
						}
						if ( fontfile.exists  ) {
							try {
								fontfile.copy( tgt_file.fullName );
							} catch ( e ) {
								msgs.push( [fname, __("Collect-Error", script_id) + ": " +e.message ] );
							}
						} else {
							// Ich brauche mehr log
							__log("dbg", "location: >" + l + "<, font: >" + f.name + "<, strg: >" + __("activated-adobe", script_id) + "<, PATH_SCRIPT_PARENT: " + PATH_SCRIPT_PARENT, "collect-docfonts-daemon")
							if ( l.search(/adobe/i) != -1 && l.search(/fonts/i) != -1  ) {
								msgs.push( [f.name, __("adobe-fonts", script_id)] );
							} else {
								msgs.push( [fname, __("does-not-exist", script_id)] );
							}
						}		// exists
					} catch(e) {
						__log("error", e.message + " on " + e.line, script_id )
						msgs.push( [ "", e.message ] );
					}
				}			// font loop
				if ( msgs.length > 0 ) {
					show_warnings( msgs );
					// __alert( "krake", __("Collect-Fonts", script_id) + "\n\n" + msgs.join("\n"), "", "OK", false );
				}
			} else {
				//__log("info", "Doc erfuellt die Kriterien nicht", script_id)
			}				// do collect
		} catch(e) {
			__log("error", e.message + " on " + e.line )
		}
  }

	function show_warnings( msgs ) {
		var w = new Window("dialog", "Test");
		__insert_head( w, "octopus" );
		w.add("statictext", undefined, __("warnings", script_id));
		var lb = w.add("listbox", undefined, "", {numberOfColumns: 2 });
		lb.maximumSize.height = 500;
		lb.preferredSize = { width: 800, height: 400 };
		for ( var n = 0; n < msgs.length; n++ ) {
			with ( lb.add("item", msgs[n][0]) ) {
				subItems[0].text = msgs[n][1];
				// subItems[1].text = msgs[n][2];
			}
		}
		w.defaultElement = w.add("button", undefined, "OK");
		w.show();

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
			__log("dbg", "loading loc_strings from >" +  PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json<" + ": " + File(  PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json" ).exists, script_id );
			loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
			if ( ! loc_strings ) {
				__log("error", "loc_Strings kann nicht geladen werden", script_id);
				return id;
			}
			if ( ! loc_strings.hasOwnProperty(script_id) ) {
				__log("error", script_id + " ist keine Property in strings.json", script_id );
			}
			loc_strings = loc_strings[ script_id ];
			__log("dbg", "loaded loc-strings", script_id);
		}

		if (loc_strings.hasOwnProperty(id)) {
			txt = localize(loc_strings[id]);
		} else {
			txt = id
		}
		// __log("dbg", "got string: " + txt, script_id );
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
		__log("error", e.message + " on " + e.line, script_id )
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

