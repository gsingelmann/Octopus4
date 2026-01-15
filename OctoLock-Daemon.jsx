/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:StartupScript that creates and checks Lock-Files

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-09-10

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

#include "./Octopus-include.jsxinc"
#targetengine octolock

/*
beforeOpen | target.type == Document  -  Das eigentliche: Ist die Datei woanders offen?
afterOpen | target.type == Document  -  Der Pfad steht in fullName
beforeClose | target-type == Document - Das Doc ist gleich nicht mehr offen
beforeSaveAs | target.type == Document  -  Das Doc ist gleich nicht mehr offen
afterSaveAs | target.type == Document  -  Der neue Pfad steht in fullName

Application Event: : beforeOpen
Target: : Application, Adobe InDesign
Current: : Application, Adobe InDesign

Application Event: : afterOpen
Target: : Document, 321.indd
Current: : Application, Adobe InDesign

Application Event: : beforeClose
Target: : Document, 678.indd
Current: : Application, Adobe InDesign

Application Event: : beforeSaveAs
Target: : Document, 567.indd
Current: : Application, Adobe InDesign

Application Event: : afterSaveAs
Target: : Document, 567.indd
Current: : Application, Adobe InDesign
*/
app.addEventListener( "beforeOpen", bo_handler );
app.addEventListener( "afterOpen", ao_handler );
app.addEventListener( "beforeClose", bc_handler );
app.addEventListener( "beforeSaveAs", bsa_handler );
app.addEventListener( "afterSaveAs", asa_handler );

function bo_handler( event ) {
  if ( ! get_info(event, "before-open") ) return;
	try {
		var data = get_lock_data( event );
		if ( data ) {
			var bits = data.split("\n");
			bits = bits[0].split("\t");
			var myname = get_user_name();
			if ( bits[0] == myname ) {
				return;
			}
			var msg = __(
				'is_opened', 
				unescape( event.fullName.toString().split("/").pop() ),
				bits[0],
				bits[1]
			);
			msg += "\n\n";
			msg += __('cancel_opening');
			var aux = __alert( "question", msg, "", [ {text: __('no'), value: false}, {text: __('yes'), value: true}])
			if ( aux ) {
			// if ( confirm( msg ) ) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	} catch(e) {
		__log_error( e, "OctoLock-Daemon", "octolock before open" );
	}
} 
function ao_handler( event ) {
  if ( ! get_info(event, "after-open") ) return;
	write_lock_data( event.target );
}
function bc_handler( event ) {
  if ( ! get_info(event, "before-close") ) return;
	remove_lock_data( event.target );
}

function bsa_handler(event) {
  if ( ! get_info(event, "before-save-as") ) return;
	remove_lock_data( event.target );
}
function asa_handler(event) {
  if ( ! get_info(event, "after-save-as") ) return;
	write_lock_data( event.target );
}

function get_lock_data( event ) {
	var volumes = read_volumes_from_prefs();

	var data = "";
	try {
		var ct = event.currentTarget;
		var path = "";
		if ( ct.constructor.name == "Application" ) {
			var fn = event.hasOwnProperty("fullName") ? event.fullName : "";
			if ( fn ) {
				path = get_path_to_lock( fn.toString() );
			}
		}
		if (path) {
			var f = new File( path );
			f.encoding = "UTF-8";
			f.open("r");
			data = f.read();
			f.close();
		}
	} catch(e) {
		__log_error( e, "OctoLock-Daemon", "octolock get-data");
	}
	return data;
}
function write_lock_data( doc ) {
	var volumes = read_volumes_from_prefs();

	try {
		if ( doc.constructor.name == "Document" && doc.saved ) {
			var fn = doc.fullName;
			if ( fn ) {
				var path = get_path_to_lock( fn.toString() );
				if ( path ) {
					__write_file( 
						path, 
						get_user_name() + "\t" + __get_now_string() + "\n\n" + __("lock_text"),
						"w"
					);
					__log_run("OctoLock-Daemon");
				}
				create_log_entry( path );
			} else {
			}
		} else {
		}
	} catch(e) {
		__log_error( e, "OctoLock-Daemon", "octolock write-data");
	}
}
function remove_lock_data( doc ) {
	try {
		if ( doc.constructor.name == "Document" && doc.saved ) {
			var fn = doc.fullName;
			if ( fn ) {
				var path = get_path_to_lock( fn.toString() );
				var f = new File( path );
				if ( f.exists ) f.remove();
				remove_log_entry( path );
				// f.rename( f.name.replace(/oclk/, "oclk_"));
			} else {
			}
		} else {
		}
	} catch(e) {
		__log_error( e, "OctoLock-Daemon", "octolock remove-data");
	}
}
// Wunsch: Es soll eine Liste geben, welche lock-Dateien noch existieren.
// also muss ich loggen, wann diese hergestellt und wann sie gelöscht werden.
function create_log_entry( path ) {
	var logpath = __get_config_path("octolock-logs") + "/" + app.version.split(".").shift() + ".txt";
	var log = __read_file( logpath );
	log = split_log( log );
	// Ich fürchte, es kann passieren, dass derselbe Pfad mehrfach im Log steht.
	var old = false;
	for ( var n = log.length-1; n >= 0; n-- ) {
		if ( log[n].constructor.name == "Array" && log[n][0] == path ) {
			if ( old ) {
				log.splice(n,1);
			} else {
				old = true;
				log[n][1] = __get_now_string();
			}
		}
	}
	if ( ! old ) {
		log.push( [path, __get_now_string(), "" ] );
	}
	__write_file( logpath, join_log(log), "w" );
}
function remove_log_entry( path ) {
	var logpath = __get_config_path("octolock-logs") + "/" + app.version.split(".").shift() + ".txt";
	var log = __read_file( logpath );
	log = split_log( log );
	var hline = "";
	for ( var n = log.length-1; n >= 0; n-- ) {
		if ( log[n][0] == path ) {
			hline = log[n].join("\t") + "\t" + __get_now_string();
			log.splice(n,1);
		}
	}
	__write_file( logpath, join_log(log), "w" );
	
	var historypath = __get_config_path("octolock-logs") + "/history-" + app.version.split(".").shift() + ".txt";
	__write_file( historypath, hline + "\n", "a" );
}
// Log ist ein TSV. Ich brauch oben ein normalen 2dim Array
function split_log( log ) {
	if ( typeof log != "string" ) throw new Error("Der Parameter, der in ein Array gewandelt werden soll, ist kein String, sondern " + log.constructor.name );
	if ( log == "" ) return [];
	log = log.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n\n+/g, "\n");
	log = log.split("\n");
	for (var n = 0; n < log.length; n++ ) {
		log[n] = log[n].split("\t");
	}
	return log;
}
function join_log( log ) {
	if ( log.constructor.name !== "Array") return log.toString();
	for ( var n = 0; n < log.length; n++ ) {
		if (log[n].constructor.name == "Array") log[n] = log[n].join("\t");
	}
	return log.join("\n");
}
function get_path_to_lock( fn ) {
	var volumes = read_volumes_from_prefs();
		
	var path = "";
	for ( var n = 0; n < volumes.length; n++ ) {
		var v = volumes[n];
		if ( unescape(fn).substr(0, v.length).toLowerCase() == v.toLowerCase() ) {
			path = fn.replace(/\.indd/i, "_octolock.txt");
		}
	}
	return path; 
}
function get_user_name() {
	var rs = app.extractLabel("octolock_user");
	if ( ! rs ) {
		if($.os.substring(0, 7)=="Windows"){ 
			rs = $.getenv("USERNAME");
		} else { 
			rs = $.getenv("USER");
		} 
	}
	return rs;
}
function read_volumes_from_prefs() {
	var f_volumes = __get_config_path() + "/octolock.txt";
  var volumes = __read_file( f_volumes );
  volumes = volumes.length ? volumes.split("\n") : [];
	return volumes;
}

function get_info( event, str ) {
	if ( str == "before-open" && event.target.constructor.name != "Application" ) {
		return false;
	} else if ( str != "before-open" && event.target.constructor.name != "Document" ) {
		return false;
	}
	
	for ( var p in event ) {
		if ( "bubbles eventPhase parent userInteractionLevel cancelable timeStamp propagationStopped defaultPrevented id index properties isValid".indexOf(p) != -1 ) continue;
		try {
			var nm = event[p].hasOwnProperty("name") ? " / " + event[p].name : "";
		} catch(e) {
		}
	}
	return true;
}

function __( id ) {
	var txt = "";
  loc_strings = load_translation();
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
			__log_error( e, "OctoLock-Daemon", "localize octolock" );
		}
	}
	return txt;
}

function  load_translation() {
  return {
		"is_opened": {
			"de": "Die Datei '_1_' ist anscheinend bereits von '_2_' seit dem Zeitpunkt _3_ geöffnet.",
			"en": "The file '_1_' apparently has been opened by user '_2_' since _3_."
		},
		"cancel_opening": {
			"de": "Öffnen abbrechen?",
			"en": "Cancel opening?"
		},
		"lock_text": {
			"de": "Diese Datei wird vom Script OctoLock aus dem Projekt Octopus verwendet, um auch in komplizierten Situationen zu kontrollieren, ob Dokumente bereits von anderen Anwendern verwendet werden.",
			"en": "This file is used by the OctoLock script from the Octopus project to check whether documents are already in use by other users, even in complicated situations."
		},
		"yes": {
			"de": "Ja",
			"en": "Yes"
		},
		"no": {
			"de": "Nein",
			"en": "No"
		}
	}
}
