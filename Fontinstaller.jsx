/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Allows you to define collections of fonts (ie. everything inside a folder) and install these for the active document

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
#targetengine octopus_fontinstaller
#include "./Octopus-include.jsxinc"
__init();
var script_name = "Fontinstaller";
__log_run(script_name);

var script_version = __get_script_version(script_name);

var scriptPath, scriptFolderPath, is_debug = false;
try {
	scriptPath  = app.activeScript.fullName;
	scriptFolderPath  = app.activeScript.parent.fullName;
} 
catch (e) { 
	/* We're running from the ESTK*/
	is_debug = true;
	scriptPath = e.fileName;
	var aux = scriptPath.split("/");
	aux.pop();
	scriptFolderPath = aux.join("/");
}
if ( ! is_debug ) {
	#targetengine "cs_octopus_fontinstaller"
}

var fonthub_path = __ensure_path_exists( "fontinstaller", __get_config_path(), true );
var fonthub_folder = new Folder( fonthub_path );

var dev = false;
var dbg = true;

var doc = null;
if ( app.documents.length == 0 ) {
	// alert ( __("need-open-doc"));
	// _alert("stop", __("need-open-doc"), "", "OK")
	// exit();
} else {
	doc = app.activeDocument;
	if ( ! doc.saved ) {
		// alert(__("need to be saved"))
		__alert('warning', __('need to be saved'), "", "OK")
		exit();
	}
};

var state = {
	all_lists: [],
	crnt_list: {},
	crnt_family_names: [],
	all_styles: [],
	crnt_style: ""
}

state.all_lists = load_all_lists();
state.crnt_list = null;
if ( state.all_lists.length  ) {
	state.crnt_list = state.all_lists[0].list;
}
state.crnt_family_names = [];
state.all_styles = [];
state.crnt_style = "";

what_to_do( __("Fonthub"), script_version, doc );

// ------------------------------------------------------------------------------------------------------------------------
//  UI
// ------------------------------------------------------------------------------------------------------------------------
function what_to_do( title, version, doc) {
	if ( is_debug ) {
		var w = new Window('dialog', title );
	} else {
		var w = new Window('palette', title );
	}
	w.script_name = script_name;
	w.orientation = 'column';
	w.alignChildren = ['fill', 'fill'];

	__insert_head( w );

	w.main = w.add( 'group {orientation: "row", alignChildren: ["fill","fill"]}');
	w.interactive = w.main.add( 'group {orientation: "column", alignChildren: ["fill","fill"]}');
	w.btns = w.add('group {orientation: "row", alignChildren: ["fill", "fill"]}');
	w.footer = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');

	// ------------------------------------------------------------------------------------------------------------------
	//	Unterkante
	// ------------------------------------------------------------------------------------------------------------------
	w.btns.add("statictext", undefined, __('Ruhig bleiben'));
  w.cancelElement = w.btns.add('button', undefined, __('Cancel'))
	w.cancelElement.onClick = function() {
		this.window.close();
	}
  w.footer.add('statictext', undefined, 'v' + version)

	// ------------------------------------------------------------------------------------------------------------------
	//	Die eigentliche UI
	// ------------------------------------------------------------------------------------------------------------------
	
	// ----------------------   Liste der Fontordner --------------------------------------------------------------------
	w.lists = w.interactive.add("panel {orientation: 'row', alignChildren: ['fill', 'fill'], text: '" + __('Fontlists') + "'}")
	w.lists_main = w.lists.add('group {alignChildren: ["fill", "fill"], bounds: [undefined, undefined, 400, 200]}')
	w.lists_btns = w.lists.add('group {orientation: "column", alignChildren: ["fill", "top"], bounds: [undefined, undefined, 300, 200]}')

	w.listbox = w.lists_main.add('listbox' );
	for ( var n = 0; n < state.all_lists.length; n++ ) {
		var aux = w.listbox.add('item', state.all_lists[n].name )
	}
	w.listbox.selection = 0;
	// state.crnt_list = state.all_lists[0].list;

	w.btn_add_list = w.lists_btns.add('button', undefined, __("Liste hinzufügen"));
	w.btn_rm_list = w.lists_btns.add('button', undefined, __("Liste entfernen"));
	w.btn_rename_list = w.lists_btns.add('button', undefined, __("Liste umbenennen"));
	w.btn_reload_list = w.lists_btns.add('button', undefined, __("Schriftenliste aktualisieren"));
	if (doc) {
		w.btn_docinstall_global = w.lists_btns.add('button', undefined, __("Global Dokument-Schriften installieren"));
	}

	w.btn_add_list.onClick = function () { add_list(); }
	w.btn_rm_list.onClick = function () { remove_list(); }
	w.btn_rename_list.onClick = function () { rename_crnt_list(); }
	w.btn_reload_list.onClick = function () { reload_crnt_list(); }



	// -----------------------------------------------------------------------------------------------------------------
	// ----------------------   Liste der Fonts im Ordner --------------------------------------------------------------
	w.fonts = w.interactive.add("panel {orientation: 'row', alignChildren: ['fill', 'fill'], text: '" + __('Fonts in List') + "'}")
	w.fonts_main = w.fonts.add('group {alignChildren: ["fill", "fill"], bounds: [undefined, undefined, 400, 300]}')
	w.fonts_btns = w.fonts.add('group {orientation: "column", alignChildren: ["fill", "top"], bounds: [undefined, undefined, 300, 300]}')

  w.fg = w.fonts_main.add('group {spacing: 0, alignChildren: ["fill", "fill"]}');
	w.fontbox = w.fg.add('listbox', undefined, undefined, {multiselect: true})
	w.stylebox = w.fg.add('listbox')

	build_family_list();
	build_style_list();

	w.listbox.onChange = function () {
		if ( this.selection ) {
			state.crnt_list = state.all_lists[ this.selection.index ].list;
			if (doc) {
				w.btn_docinstall.enabled = true;
				w.btn_allinstall.enabled = true;
				w.btn_selinstall.enabled = true;
				w.btn_update.enabled = true;
			}
		} else {
			state.crnt_list = null;
			state.all_styles = [];
			if (doc) {
				w.btn_docinstall.enabled = false;
				w.btn_allinstall.enabled = false;
				w.btn_selinstall.enabled = false;
				w.btn_update.enabled = false;
			}
		}
		build_family_list();
		build_style_list();
	}
	w.fontbox.onChange = function () {
		var aux = this.selection;
		if ( this.selection ) {
			state.crnt_family_names = [];
			for ( var n = 0; n < this.selection.length; n++ ) state.crnt_family_names.push( this.selection[n].text );
			if ( this.selection.length > 1 ) {
				state.all_styles = [];
				state.crnt_style = "";
			} else {
				state.all_styles = state.crnt_list[ state.crnt_family_names[0] ];
			}
			if (doc) w.btn_selinstall.enabled = true;
		} else {
			state.crnt_family_names = null;
			state.all_styles = [];
			state.crnt_style = "";
			if (doc) w.btn_selinstall.enabled = false;
		}
		build_style_list();
	}
	w.stylebox.onChange = function() {
		state.crnt_style = w.stylebox.selection.text;
	}

	if ( doc ) {
		w.btn_allinstall = w.fonts_btns.add('button', undefined, __("Alle Schriften installieren"));
		w.btn_selinstall = w.fonts_btns.add('button', undefined, __("Ausgewählte Schriften installieren"));
		w.btn_docinstall = w.fonts_btns.add('button', undefined, __("Dokument-Schriften installieren"));
		w.btn_docinstall.onClick = install_document_fonts;
		w.btn_docinstall_global.onClick = install_document_fonts_global;
		w.btn_allinstall.onClick = install_all_fonts;
		w.btn_selinstall.onClick = install_sel_fonts;
	}


	if ( doc ) {
		// -----------------------------------------------------------------------------------------------------------------
		// ----------------------  Liste der Fonts im Dokument --------------------------------------------------------------
		var dfonts = app.activeDocument.fonts.everyItem().getElements();
		var txt = [];
		for ( var n = 0; n < dfonts.length; n++ ) {
			txt.push( dfonts[n].postscriptName );
		}
		txt.sort();
		w.main.add("statictext", undefined, "        ");
		w.docfont_clm = w.main.add('panel {orientation: "column", enabled: true, alignChildren: ["fill", "fill"], text: "'+ __('Documentfonts') + '"}')
		w.docfont_clm.preferredSize = [250, 500 ];
		w.docfont_clm.maximumSize.height = 500;
		var aux = w.docfont_clm.add('listbox', undefined, txt, {enabled: false} /*, {multiline:true, scrolling: true, readonly:true}*/);
		aux.onChange = function() {
			this.selection = null;
		}
	}		
	
  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_displaycfg", JSON.stringify( w.location ));
  }

  w.show();
	
  var aux = app.extractLabel( "octopus_panelpos_displaycfg" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( w, aux.x, aux.y );
  } catch(e) {}


	// ---------------------------------------------------------------------------------------------
	//	Font-Liste aufbauen
	// ---------------------------------------------------------------------------------------------
	function build_family_list() {
		w.fontbox.removeAll();
		if ( state.crnt_list ) {
			// 230418: Wir wollen die Fontliste sortiert haben.
			// for ( var f in state.crnt_list ) {
			// 	if ( f != "path_to_folder" ) {
			// 		w.fontbox.add("item", f );
			// 	}
			// }
			var sorted = [];
			for ( var f in state.crnt_list ) {
				sorted.push( unescape( f ) );
			}
			sorted.sort();
			for ( var n = 0; n < sorted.length; n++ ) {
				if ( sorted[n] != "path_to_folder" ) {
					w.fontbox.add("item", sorted[n] );
				}
			}
			if ( state.crnt_family_names ) {
				w.fontbox.selection = state.crnt_family_names
			}
		}
	}
	// ---------------------------------------------------------------------------------------------
	//	Schnitte aufbauen
	// ---------------------------------------------------------------------------------------------
	function build_style_list() {
		w.stylebox.removeAll();
		if ( state.all_styles && state.all_styles.length ) {
			for ( var n = 0; n < state.all_styles.length; n++ ) {
				if ( state.all_styles[n].style.search(/\.pfb$/i) == -1 ) {
					w.stylebox.add("item", state.all_styles[n].style);
				}
			}
			if ( state.crnt_style != -1 ) {
				w.stylebox.selection = state.crnt_style;
			}
		}
	}
	// ---------------------------------------------------------------------------------------------
	//	Liste hinzufügen
	// in f KANN ein Pfad stehen
	// ---------------------------------------------------------------------------------------------
	function add_list( f ) {
		var nu_json = collect_new_font_list( f );
		if ( nu_json ) {
			var ix = state.all_lists.length;

			state.all_lists.push( {
				name: unescape( nu_json.name.replace(/\.json/i, "") ),
				list: read_json( nu_json )
			});

			state.crnt_list = state.all_lists[ix].list;
			for ( var f in state.crnt_list ) {
				state.crnt_family_names = [f];
				break;
			}
			state.all_styles = state.crnt_list[ state.crnt_family_names[0] ]
			state.crnt_style = 0;
			w.listbox.add('item', unescape( state.all_lists[ix].name ) )
			w.listbox.selection = ix;
			build_family_list();
		}
	}
	// ---------------------------------------------------------------------------------------------
	//	Liste entfernen
	// ---------------------------------------------------------------------------------------------
	function remove_list( no_alert ) {
		if ( ! state.crnt_list ) return null;
		var ix = w.listbox.selection.index;
		var name = w.listbox.selection.text;
		if ( ! no_alert ) {
			if ( ! __alert('question', __('really_remove'), '', [
				{ text: __('yes'), value: true },
				{ text: __('no'), value: false },
			])) {
				return null;
			}
			// if ( ! confirm( __('really_remove')) ) {
			// 	return null;
			// }
		}
		var f = new File( fonthub_folder.fullName + "/" + name + ".json" );
		f.remove();
		state.all_lists.splice( ix, 1 );
		w.listbox.remove( w.listbox.selection );
		state.crnt_list = null;
		state.all_styles = [];
		build_family_list();
		build_style_list();
	}
	// ---------------------------------------------------------------------------------------------
	//	Liste umbenennen
	// ---------------------------------------------------------------------------------------------
	function rename_crnt_list() {
		// alert("los\n" + JSON.stringify( state.crnt_list ) );
		if ( ! state.crnt_list ) return;
		var name = w.listbox.selection.text;
		var nu_name = prompt( __("Neuer Name für die Liste"), name );
		if ( nu_name ) {
			try {
				var file = new File( fonthub_folder.fullName + "/" + name + ".json" );
				if ( file.exists ) {
					file.rename( nu_name + ".json" );
					w.listbox.selection.text = nu_name;
					w.layout.layout();
				} else {
					// alert( "Datei nicht gefunden" );
					__alert("stop", "Listfile not found", "Not found", "OK")
				}
			} catch(e) {
				for ( var p in e ) {
					if ( p != "source" ) {
						// $.writeln( p + ": " + e[p] );
					}
				}
				// alert( "Fehler beim Umbenennen\n" + e)
				__alert("warning", "Rename-Error: " + e, "", "OK");
			}
		}

	}

	// Das ist derzeit zu knifflig
	function reload_crnt_list() {
		if ( ! state.crnt_list ) return;
		var name = w.listbox.selection.text;
		try {
			var path = state.crnt_list['path_to_folder'][0].path;
			remove_list( true )
			add_list( path )
		} catch(e) {
		}
	}

	// ---------------------------------------------------------------------------------------------
	//	Dokument-Schriften installieren
	// ---------------------------------------------------------------------------------------------
	function install_document_fonts() { install_fonts('doc')}
	function install_document_fonts_global() { install_fonts('doc_global')}
	function install_all_fonts() { install_fonts('all')}
	function install_sel_fonts() { install_fonts('sel')}
	function do_this() {}

	// ------------------------------------------------------------------------------------------------------------------------
	//  Fonts im aktuellen Dokument installieren
	// ------------------------------------------------------------------------------------------------------------------------
	function install_fonts( which ) {
		var _log = [];
		var doc_fonts_path = doc.fullName.parent.fullName + "/Document fonts";
		var created_folder = false;
		if ( Folder( doc_fonts_path ).exists == false ) {
			Folder( doc_fonts_path ).create();
			created_folder = true;
		}
		var these_styles = [];
		if ( which == "all" ) {
			// { <family>: [ {<path>, <stylename> }, ... ], ... }
			_log.push( __("install-all"))
			for ( var f in state.crnt_list ) {
				for ( var s = 0; s < state.crnt_list[f].length; s++ ) {
					these_styles.push( state.crnt_list[f][s].path );
					_log.push( "- " + f + "-" + state.crnt_list[f][s].style );
				}
			}
		} else if ( which == "sel") {
			_log.push( __("install-sel"))
			// Stile können nur ausgewählt werden, wenn nur eine Familie ausgewählt ist.
			// Ist kein Stil ausgewählt, werden alle installiert
			if ( state.crnt_family_names.length == 1 ) {
				var crnt_fam = state.crnt_list[ state.crnt_family_names[0] ];
				
				if ( state.crnt_style ) {
					// ------------------------  Eine Familie und ein Stil gewählt -------------------------------
					for ( var n = 0; n < crnt_fam.length; n++  ) {
						if ( crnt_fam[n].style == state.crnt_style ) {
							these_styles.push( crnt_fam[n].path );
							_log.push( "- " + state.crnt_family_names[0] + "-" + crnt_fam[n].style );
						}
					}
				} else {
					// ------------------------  Eine Familie und KEIN Stil gewählt -------------------------------
					for ( var n = 0; n < crnt_fam.length; n++  ) {
						these_styles.push( crnt_fam[n].path );
						_log.push( "- " + state.crnt_family_names[0] + "-" + crnt_fam[n].style );
					}
				}
			} else if ( state.crnt_family_names.length > 1) {
				// ------------------------  Mehrere Familien gwählt -------------------------------
				for ( var f = 0; f < state.crnt_family_names.length; f++ ) {
					for ( var s = 0; s < state.crnt_list[ state.crnt_family_names[f] ].length; s++ ) {
						these_styles.push( state.crnt_list[ state.crnt_family_names[f] ][s].path );
						_log.push( "- " + state.crnt_family_names[f] + "-" + state.crnt_list[ state.crnt_family_names[f] ][s].style );
					}
				}
			}
		} else if (which == "doc" || which == "doc_global") {
			_log.push( __("install-doc"))
			// state.crnt_list = state.all_lists[ this.selection.index ].list;
			// all_lists: [ {name: "", list: {} } ]
			var the_lists = [];
			if ( w.listbox.selection ) {
				// ---------- Die ausgewählte(n) zuerst -------------------
				for ( var n = 0; n < state.all_lists.length; n++ ) {
					if ( n == w.listbox.selection.index ) {
						the_lists.push( state.all_lists[n] );
					}
				}
				if ( which == "doc_global" ) {
					for ( var n = 0; n < state.all_lists.length; n++ ) {
						if ( n != w.listbox.selection.index ) {
							the_lists.push( state.all_lists[n] );
						}
					}
				}
			} else {
				for ( var n = 0; n < state.all_lists.length; n++ ) {
					the_lists.push( state.all_lists[n] );
				}
			}		// fill the_list
			var dfonts = doc.fonts.everyItem().getElements();
			for ( var ndf = 0; ndf < dfonts.length; ndf++ ) {
				var dname = dfonts[ndf].postscriptName;
				_log.push( "\n- " + dname );
				if ( ! dname ) dname = dfonts[ndf].fullName;
				dname = normalize( dname );
				var found = false;
				listloop: for ( var ncl = 0; ncl < the_lists.length; ncl++ ) {
					var cl = the_lists[ncl].list;
					for ( var cf in cl ) {
						for ( ns = 0; ns < cl[ cf ].length; ns++ ) {
							var s = cl[ cf ][ ns ];
							var aux = levDist( normalize(cf + s.style), dname )
							if ( levDist( normalize(cf + s.style), dname ) < 3 ) {
								these_styles.push( s.path );
								found = true;
								_log.push( "   in \"" + the_lists[ncl].name + "\"")
								break listloop;
							}	// f+s == dname
							// Wenn eine Familie nur einen Schnitt hat, fehlt oft das "regular" im Dateinamen
							var aux = levDist( dname.substr(0, normalize(cf).length ), normalize(cf) );
							if ( cl[ cf ].length == 1 && levDist( dname.substr(0, normalize(cf).length ), normalize(cf) ) < 3 ) {
								these_styles.push( s.path );
								found = true;
								_log.push( "   in \"" + the_lists[ncl].name + "\"")
								break listloop;
							}	// kein style in dname
						}		// style loop
					}			// family loop
				}				// list loop
				if ( ! found ) {
					_log.push( __('not-found'))
				}
			}					// dfont loop
		}						// which == doc

		_log.push(" ");

		// -----------------------------------------------------------------------------------------------------
		//	Array mit Pfaden ist voll. Jetzt Kopieren
		// -----------------------------------------------------------------------------------------------------
		var oks = 0;;
		for ( var n = 0; n < these_styles.length; n++ ) {
			var src_path = these_styles[n]
			var src = new File (src_path);
			var tgt = new File( doc_fonts_path + "/" + src_path.split("/").pop() );
			var aux = src.copy( tgt );
			if ( ! aux ) _log.push( "· " + src.fullName.split("/").pop() + __("not-copied") );
			oks++;
			if ( src_path.search(/\.pfm/i) != -1 ) {
				src = new File( src_path.replace(/\.PFM$/, ".PFB").replace(/\.pfm$/, ".pfb") );
				if ( src.exists ) {
					tgt = new File( doc_fonts_path + "/" + src.fullName.split("/").pop() );
					aux = src.copy( tgt );
					if ( ! aux ) _log.push( "· " + src.fullName.split("/").pop() + __("not-copied") );
				}
			}
		}

		// -----------------------------------------------------------------------------------------------------
		//	Bescheid geben
		// -----------------------------------------------------------------------------------------------------
		if ( created_folder ) {
			if ( oks ) {
				if ( __alert('question', _log.join("\n") + "\n\n" + oks + " " + __('number-installed'), "", [ { text: "Ja", value: true }, { text: "Nein", value: false} ] ) ) {
					w.close();
					re_open();
				}
			} else {
				__alert("stop", _log.join("\n"), "fail", "ok" );
			}
		} else {
			__alert("warning", _log.join("\n") + "\n\n" + __('update-hint'), "ok", "ok" );
		}

		function normalize( name ) {
			return name.toLowerCase().replace(/[^a-z0-9A-Z]/g, "");
		}
		function levDist(w1, w2) {
			var d = []; //2d matrix
			var n1 = w1.length;
			var n2 = w2.length;		
			if (n1 == 0) return n2;
			if (n2 == 0) return n1;
			for (var i = n1; i >= 0; i--) d[i] = [];
			for (var i = n1; i >= 0; i--) d[i][0] = i;
			for (var j = n2; j >= 0; j--) d[0][j] = j;
			for (var i = 1; i <= n1; i++) {
					var w1_i = w1.charAt(i - 1);
					for (var j = 1; j <= n2; j++) {
							if (i == j && d[i][j] > 4) return n1;		
							var w2_j = w2.charAt(j - 1);
							var cost = (w1_i == w2_j) ? 0 : 1; // Step 5
							var mi = d[i - 1][j] + 1;
							var b = d[i][j - 1] + 1;
							var c = d[i - 1][j - 1] + cost;		
							if (b < mi) mi = b;
							if (c < mi) mi = c;
							d[i][j] = mi; // Step 6
							if (i > 1 && j > 1 && w1_i == w2.charAt(j - 2) && w1.charAt(i - 2) == w2_j) {
									d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
							}
					}
			}
			return d[n1][n2];
		}
	}
}
// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------


function openWebsite(url) {
	url = url.split(" ");
	url = url.join("+");
	url = encodeURI( url );
	if (File.fs == "Macintosh") {
		var tempFile = File("~/Desktop/tempurl.webloc");
		tempFile.open("w");
		tempFile.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\
		<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\
		<plist version=\"1.0\">\
			<dict>\
				<key>URL</key>\
				<string>"+url+"</string>\
			</dict>\
		</plist>");
		tempFile.close();
		tempFile.execute();
		for (var aux = 0; aux < 100; aux++) {
			$.sleep(10);
		}
		tempFile.remove();
	} else {
		var tempFile = File("~/Desktop/cuppascript.url");
		tempFile.open("w");
		tempFile.write("[InternetShortcut]\
URL="+url);
		tempFile.close();
		tempFile.execute();
		for (var aux = 0; aux < 100; aux++) {
			$.sleep(10);
		}
		tempFile.remove();
	}
}

function re_open() {
	var path = doc.fullName;
	doc.close( SaveOptions.YES );	
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	try {
		doc = app.open( path );
	} catch(e) {
		// var f = new File( Folder.desktop.fullName + "/error.txt");
		// f.open("w");
		// for ( var p in e ) {
		// 	if ( p != source ) f.writeln( p + ": " + e[p] );
		// }
		// f.close();
	} finally {
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
		// myIdleTask.sleep = 0;
	}
}


function ensure_path_exists(path, base_path) {
  base_path = unescape(base_path);
  path = path.replace(/^\//, "");
  var bits = path.split("/");
  // Das letzte bit ist der Dateiname
  for (var n = 0; n < bits.length; n++) {
    if (!Folder(base_path + "/" + bits[n]).exists) Folder(base_path + "/" + bits[n]).create();
    base_path += "/" + bits[n];
  }
  return base_path;
}

// ------------------------------------------------------------------------------------------------------------------------
//  Ordner-Listen Admin
// ------------------------------------------------------------------------------------------------------------------------
function load_all_lists() {
	var all_lists = [];

	var all_jsons = fonthub_folder.getFiles( function(f) {
		return f.name.search(/\.json/i) != -1;
	})
	for ( var n = 0; n < all_jsons.length; n++ ) {
		all_lists.push( {
			name: unescape( all_jsons[n].name.replace(/\.json/i, "") ),
			list: read_json( all_jsons[n] )
		});
	}
	return all_lists;
}
function collect_new_font_list( f ) {
	if ( ! f ) {
		f = Folder.selectDialog( __("Where") );
	} else {
		if ( typeof f == "string" ) {
			f = new Folder( f );
		}
	}
  if ( ! f ) return null;
  var fonts = collect_fonts_in_folder( f );
  fonts.path_to_folder = f.fullName;
  var flist = new File( fonthub_folder.fullName + "/" + f.name + ".json" );
  flist.encoding = "UTF-8";
  flist.open("w");
  flist.write( JSON.stringify(fonts, undefined, 2) );
  flist.close();
  return flist;
}

function collect_fonts_in_folder( folder ) {
  var then = new Date().getTime();
  if ( typeof folder == "string" ) {
    folder = unescape( folder );
    folder = new Folder( folder );
  }
  var fonts = get_files_in_folder( folder, 0 );
  // var now = new Date().getTime();
	// var n = 0; 
	// for ( var _f in fonts ) n++;
  // if ( dbg ) alert( "Done in " + ((now-then)/1000 ) + " Seconds for " + n + " Fonts" );
  return fonts;

  function get_files_in_folder( folder, indent ) {
    var files = folder.getFiles( function(f) { return f.constructor.name !== "Folder" && f.name.charAt(0) != "." && f.name.search(/\.(pfm|ttf|otf)$/i) != -1 } );
    var folders = folder.getFiles( function(f) { return f.constructor.name == "Folder" && f.name.charAt(0) != "." } );
    for ( var n = 0; n < folders.length; n++ ) {
      files = files.concat( get_files_in_folder( folders[n], indent+1 ) );
    }
    if ( indent > 0 ) {
      return files;
    } else {
      var rs = {};
      for ( var n = 0; n < files.length; n++ ) {
        rs[ files[n].name.replace(/\.(pfm|ttf|otf)$/i, "" ) ] = files[n].toString();
      }
      return rs;
    }
  }
}

// ------------------------------------------------------------------------------------------------------------------------
// Alle Listen aktualisieren (falls Fonts dazugekommen sind oä.)
// ------------------------------------------------------------------------------------------------------------------------
function update_font_lists() {
  var lists = fonthub_folder.getFiles( function(f) { return f.name.search(/\.json/) != -1 });
  
  var w = new Window("palette");
  w.pb = w.add("progressbar", [undefined, undefined, 400, 20 ]);
  w.pb.maxvalue = lists.length;
  w.show();

  for ( var n = 0; n < lists.length; n++ ) {
    w.pb.value = n+1;
    var flist = lists[n];
    var list = read_json( flist );
    if ( list && list.hasOwnProperty("path_to_folder") ) {
      // $.writeln( "read list ");
      var new_list = collect_fonts_in_folder( list.path_to_folder );
      new_list.path_to_folder = list.path_to_folder;
      flist.encoding = "UTF-8";
      flist.open("w");
      flist.write( JSON.stringify(new_list, undefined, 2) );
      flist.close(); 
    } 
  }
  w.close();
}

// ------------------------------------------------------------------------------------------------------------------------
//  Liste entfernen
// ------------------------------------------------------------------------------------------------------------------------
function remove_font_list() {
  var lists = fonthub_folder.getFiles( function(f) { return f.name.search(/\.json/) != -1 });
  var w = new Window("dialog");
  w.alignChildren = ['fill', 'fill'];
  w.add("statictext", [undefined, undefined, 400, 20], __("Select Font"));
  //w.lb = w.add("listbox", [undefined, undefined, 400, 400]);
  w.lb = w.add("listbox", undefined, [], {multiselect: true});
  for ( var n = 0; n < lists.length; n++ ) {
    var aux = unescape( lists[n].name.replace(/\.json$/, ""));
    w.lb.add("item", aux);
    // $.writeln( aux );
  }
  w.defaultElement = w.add("button", undefined, __("Delete"));
  w.cancelElement = w.add("button", undefined, __("Cancel"));

  if( w.show() == 1 ){
    var sel = w.lb.selection;
    for ( var ni = sel.length-1; ni >= 0; ni-- ) {
      inner: for ( var nl = lists.length-1; nl >= 0; nl-- ) {
        var a = unescape(lists[nl].name).replace(/\.json$/, "");
        var b = sel[ni].text;
        if ( unescape(lists[nl].name).replace(/\.json$/, "") == sel[ni].text ) {
          lists[nl].remove();
          break inner;
        }
      }
    }
  }
}






function read_json( file ) {
	var j = __read_file( file );
  if ( j ) {
    j = JSON.parse( j );
		var list = {};
		for ( var f in j ) {
			var aux = f.split("-");
			if ( aux.length > 1 ) {
				var style = aux.pop();
			} else {
				var style = "Regular";
			}
			var family = aux.join("-");
			if ( ! list.hasOwnProperty( family ) ) {
				list[ family ] = [];
			}
			list[family].push( {
				style: style,
				path: j[f]
			})
		}
		for ( l in list ) {
			list[l].sort( function(a,b) {
				if ( a.style < b.style ) return -1;
				if ( a.style > b.style ) return 1;
				return 0;
			})
		}
		return list;
	
  } else {
    return {};
  }
}

function show_ready_dialog(msg, msec) {
	var dialog = new Window('palette');
	dialog.add('statictext', undefined, msg);
  dialog.sec = dialog.add("statictext")
  var now = new Date().getTime();
	var then = new Date().getTime();
	dialog.show();
	while (now - then < msec) {
    if ( (now-then) % 1000 < 10 ) {
      dialog.sec.text = Math.ceil( (now-then) / 1000 );
    }
    now = new Date().getTime();
	}
	dialog.close();

}



function __( id ) {
  loc_strings = load_translation();
  if (loc_strings.hasOwnProperty(id)) {
    return localize(loc_strings[id]);
  } else {
    return id
  }
}

function  load_translation() {
  return {
    "Fonthub": {"de": "Octopus-Fontinstaller", "en": "Octopus-Fontinstaller"},
    "Add Folder": {"de": "Fontordner hinzufügen", "en": "Add Fontfolder"},
    "Remove": {"de": "Fontordner vergessen", "en": "Remove Fontfolder from List"},
    "Update": {"de": "Fontliste aktualisieren", "en": "Update Fontlist"},
    "Install": {"de": "Schriften des Dokuments installieren", "en": "Install Fonts of Document"},
    "Install manually": {"de": "Schriften aus Liste installieren", "en": "Install Fonts from List"},
    "Cancel": {"de": "Schließen", "en": "Close"},
    "Delete": {"de": "Listen-Dateien löschen", "en": "Remove List-Files"},

		'yes': { "de": "Ja", "en": "Yes"},
		'no': {"de": "Nein", "en": "No"},

		"Fontlists": { "de": "Schriftenlisten", "en": "Lists of Fonts"},
		"Liste hinzufügen": {"de": "Liste aus Ordner erzeugen", "en": "Add List"},
		"Liste entfernen": {"de": "Liste aus Script entfernen", "en": "Remove List"},
		"Fonts in List": {"de": "Schriften im Ordner", "en": "Fonts in List"},
		"Schriften installieren": {"de": "Schriften installieren", "en": "Install all Fonts"},
		"Global Dokument-Schriften installieren": {"de": "Dok.-Schriften aus allen Listen installieren", "en": "Install Document-Fonts from all lists"},
		"Dokument-Schriften installieren": {"de": "Dok.-Schriften aus dieser Liste installieren", "en": "Install Document-Fonts from current list"},
		"Alle Schriften installieren": {"de": "Alle Schriften installieren", "en": "Install all Fonts"},
		"Ausgewählte Schriften installieren": {"de": "Ausgewählte Schriften installieren", "en": "Install selected Fonts"},
		"Schriftenliste aktualisieren": {"de": "Liste erneut aus Ordner erzeugen", "en": "Update Fontlist"},
		"Liste umbenennen": {"de": "Liste im Script umbenennen", "en": "Rename List"},
		"Documentfonts": {"de": "Dokument-Schriften", "en": "Documentfonts"},
		'really_remove': {
			"de": "Soll die Liste wirklich entfernt werden?\nDies betrifft nur die Liste und nicht den Fontordner auf der Festplatte.",
			"en": "Really remove the list?\nThis affects only the list, not the folder on your disk."
	},

    "Where": {"de": "Wo liegen die Fonts?", "en": "Which folder contains the new fonts?"},
		"none-missing": {"de": "Es sind keine Schriften als fehlend markiert", "en": "Apparently no fonts are missing"},
		"install_fail": {"de": "Folgende Schriften wurden nicht installiert", "en": "Some fonts could not be installed"},
		"number-installed": { 
			"de": "Schriftschnitte wurden installiert\n\nSoll das Dokument gleich neu geöffnet werden, um die Schriften zu aktivieren? \n\nEs muss dafür zuvor gespeichert werden.",
			"en": "Font-styles were installed\n\nDo you want the document re-opened to activate the fonts?\n\nIt needs to be saved first."
		},
		"install-all": {"de": "Installiere alle Schriften in Liste","en": "Install all Fonts in List"},
		"install-sel": { "de": "Installiere ausgewählte Schrift", "en": "Install selected Font"},
		"install-doc": { "de": "Installiere Dokumentschriften", "en": "Install document fonts"},
		"not-found": {"de": "nicht gefunden", "en": "not found"},
		"not-copied": {"de": " konnte nicht kopiert werden", "en": " could not be copied"},
		"update-hint": {"de": "Es dauert meistens einen Moment, bis InDesign die Schriften in 'Document fonts' entdeckt...", "en": "Usually it takes a moment or two until InDesign recognises new Fonts in 'Document fonts'"},

    "Select Font": {"de": "Wählen Sie die zu löschende Liste(n)", "en": "Select the list(s) you want to remove"},
    "Installed Msg": {"de": "Diese Schriften wurden gefunden", "en": "These fonts were found"},
    "none found": {"de": "Keine der fehlenden Schriften wurden im Depot gefunden", "en": "None of the missing fonts were found"},
    "wait": {"de": "Normalerweise braucht InDesign einen Moment, bis er die Schriften entdeckt hat", "en": "Please wait a moment for InDesign to recognize the new fonts"},
    "need to be saved": {"de": "Es können nur für gespeicherte Dokumente die Schriften nachinstalliert werden", "en": "The document needs to be saved before you can install fonts"},
		"need-open-doc": {"de": "Kein Dokument offen\nEs muss ein gespeichertes Dokument offen sein, um Fonts für dieses Dokument zu installieren.", "en": "No open document\nThis script installs Fonts in the 'Document fonts' folder of the active Document."},

		"Ruhig bleiben": {"de": "Die Schriftenordner, aus denen die Listen ausgelesen werden, werden vom Script NICHT verändert.", "en": "This script will NOT make any changes in the font-folders the lists are extracted from" }
  }
}
function init_alt() {

	if (typeof JSON !== "object") {
		JSON = {};
	}

	(function () {
		"use strict";

		var rx_one = /^[\],:{}\s]*$/;
		var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
		var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
		var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
		var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

		function f(n) {
			// Format integers to have at least two digits.
			return (n < 10)
				? "0" + n
				: n;
		}

		function this_value() {
			return this.valueOf();
		}

		if (typeof Date.prototype.toJSON !== "function") {

			Date.prototype.toJSON = function () {

				return isFinite(this.valueOf())
					? (
						this.getUTCFullYear()
						+ "-"
						+ f(this.getUTCMonth() + 1)
						+ "-"
						+ f(this.getUTCDate())
						+ "T"
						+ f(this.getUTCHours())
						+ ":"
						+ f(this.getUTCMinutes())
						+ ":"
						+ f(this.getUTCSeconds())
						+ "Z"
					)
					: null;
			};

			Boolean.prototype.toJSON = this_value;
			Number.prototype.toJSON = this_value;
			String.prototype.toJSON = this_value;
		}

		var gap;
		var indent;
		var meta;
		var rep;


		function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

			rx_escapable.lastIndex = 0;
			return rx_escapable.test(string)
				? "\"" + string.replace(rx_escapable, function (a) {
					var c = meta[a];
					return typeof c === "string"
						? c
						: "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
				}) + "\""
				: "\"" + string + "\"";
		}


		function str(key, holder) {

	// Produce a string from holder[key].

			var i;          // The loop counter.
			var k;          // The member key.
			var v;          // The member value.
			var length;
			var mind = gap;
			var partial;
			var value = holder[key];

	// If the value has a toJSON method, call it to obtain a replacement value.

			if (
				value
				&& typeof value === "object"
				&& typeof value.toJSON === "function"
			) {
				value = value.toJSON(key);
			}

	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.

			if (typeof rep === "function") {
				value = rep.call(holder, key, value);
			}

	// What happens next depends on the value's type.

			switch (typeof value) {
			case "string":
				return quote(value);

			case "number":

	// JSON numbers must be finite. Encode non-finite numbers as null.

				return (isFinite(value))
					? String(value)
					: "null";

			case "boolean":
			case "null":

	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce "null". The case is included here in
	// the remote chance that this gets fixed someday.

				return String(value);

	// If the type is "object", we might be dealing with an object or an array or
	// null.

			case "object":

	// Due to a specification blunder in ECMAScript, typeof null is "object",
	// so watch out for that case.

				if (!value) {
					return "null";
				}

	// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

	// Is the value an array?

				if (Object.prototype.toString.apply(value) === "[object Array]") {

	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || "null";
					}

	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.

					v = partial.length === 0
						? "[]"
						: gap
							? (
								"[\n"
								+ gap
								+ partial.join(",\n" + gap)
								+ "\n"
								+ mind
								+ "]"
							)
							: "[" + partial.join(",") + "]";
					gap = mind;
					return v;
				}

	// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === "object") {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === "string") {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (
									(gap)
										? ": "
										: ":"
								) + v);
							}
						}
					}
				} else {

	// Otherwise, iterate through all of the keys in the object.

					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (
									(gap)
										? ": "
										: ":"
								) + v);
							}
						}
					}
				}

	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.

				v = partial.length === 0
					? "{}"
					: gap
						? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
						: "{" + partial.join(",") + "}";
				gap = mind;
				return v;
			}
		}

	// If the JSON object does not yet have a stringify method, give it one.

		if (typeof JSON.stringify !== "function") {
			meta = {    // table of character substitutions
				"\b": "\\b",
				"\t": "\\t",
				"\n": "\\n",
				"\f": "\\f",
				"\r": "\\r",
				"\"": "\\\"",
				"\\": "\\\\"
			};
			JSON.stringify = function (value, replacer, space) {

	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.

				var i;
				gap = "";
				indent = "";

	// If the space parameter is a number, make an indent string containing that
	// many spaces.

				if (typeof space === "number") {
					for (i = 0; i < space; i += 1) {
						indent += " ";
					}

	// If the space parameter is a string, it will be used as the indent string.

				} else if (typeof space === "string") {
					indent = space;
				}

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.

				rep = replacer;
				if (replacer && typeof replacer !== "function" && (
					typeof replacer !== "object"
					|| typeof replacer.length !== "number"
				)) {
					throw new Error("JSON.stringify");
				}

	// Make a fake root object containing our value under the key of "".
	// Return the result of stringifying the value.

				return str("", {"": value});
			};
		}


	// If the JSON object does not yet have a parse method, give it one.

		if (typeof JSON.parse !== "function") {
			JSON.parse = function (text, reviver) {

	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.

				var j;

				function walk(holder, key) {

	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.

					var k;
					var v;
					var value = holder[key];
					if (value && typeof value === "object") {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}


	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.

				text = String(text);
				rx_dangerous.lastIndex = 0;
				if (rx_dangerous.test(text)) {
					text = text.replace(rx_dangerous, function (a) {
						return (
							"\\u"
							+ ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
						);
					});
				}

	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with "()" and "new"
	// because they can cause invocation, and "=" because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.

	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
	// replace all simple value tokens with "]" characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or "]" or
	// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

				if (
					rx_one.test(
						text
							.replace(rx_two, "@")
							.replace(rx_three, "]")
							.replace(rx_four, "")
					)
				) {

	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.

					j = eval("(" + text + ")");

	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.

					return (typeof reviver === "function")
						? walk({"": j}, "")
						: j;
				}

	// If the text is not JSON parseable, then a SyntaxError is thrown.

				throw new SyntaxError("JSON.parse");
			};
		}
	}());
}
