/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Assumes the selected text to be Markdown and applies InDesign formatting
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

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
fc_prefs = null;

main();

function main(){
	var doc = app.activeDocument;
	if ( ! doc.isValid ) return;
	if ( doc.paragraphStyleGroups.item("markdown") == null){
		var src = new File( PATH_DATA_FOLDER + "/Assets/MarkdownStyles.indd" );
		if ( ! src.exists ) return;
		doc.importStyles(ImportFormat.TEXT_STYLES_FORMAT, src, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE )
		doc.importStyles(ImportFormat.TABLE_STYLES_FORMAT, src, GlobalClashResolutionStrategy.DO_NOT_LOAD_THE_STYLE )
	}

	var texts = [];
	if ( ! doc.selection.length ) {
		texts = doc.stories.everyItem().getElements();
	} else if ( doc.selection[0].constructor.name == "InsertionPoint" || doc.selection[0].constructor.name == "TextFrame" ) {
		texts.push( doc.selection[0].parentStory );
	} else {
		for ( var n = 0; n < doc.selection.length; n++ ) {
			if ( doc.selection[n].hasOwnProperty("baseline") || doc.selection[n].constructor.name == "TextFrame" ) {
				texts.push( doc.selection[n] );
			}
		}
	}
	for ( var n = texts.length-1; n >= 0; n-- ) {
		handle_replacements( texts[n] );
		handle_finetuning( texts[n] );
	}

	function handle_finetuning(scope) {
		fc_reset();
		app.findGrepPreferences.properties = { findWhat: "^\\|" };
		var found = scope.findGrep();
		for (var i = 0; i < found.length; i++) {
			found[i].appliedParagraphStyle = doc.paragraphStyleGroups.item("markdown").paragraphStyles.item("table");
		}

		// clean up table data	
		fc_reset();
		app.findGrepPreferences.findWhat = "(\\|.+\\|[\\r\\n])+(\\|.+\\|)+";
		var found = scope.findGrep();
		var t;
		for (var i = 0; i < found.length; i++) {
			app.select( found[i] )
			fc_grep( found[i], { findWhat: "^\\s*\\|\\s*(.+)\\|$" }, { changeTo: "$1" } )
			fc_grep( found[i], { findWhat: "\\s+$" }, { changeTo: "" } );
			// fc_grep( found[i], { findWhat: "---+.+\\r" }, { changeTo: "" } );
			t = found[i].convertToTable("|", "\r");
			t.rows[1].remove();
		}

		// This section formats tables:
		var tables;
		if (scope == app.documents.item(0)) {
			tables = scope.stories.everyItem().tables.everyItem().getElements();
		} else {
			tables = scope.tables.everyItem().getElements();
		}
		for (var i = 0; i < tables.length; i++) {
			tables[i].appliedTableStyle = doc.tableStyleGroups.item("markdown").tableStyles.item("niceTableStyle");
			var firstRow = tables[i].rows[0];
			firstRow.rowType = RowTypes.HEADER_ROW;
			tables[i].cells.everyItem().clearCellStyleOverrides(true);
		}

		// replace double hyphens with m-dashes:
		var found = fc_text ( scope, '{ findWhat: "--" }', '{ changeTo: "^_" }' )
		for (var i = 0; i < found.length; i++) {
			found[i].changeText();;
		}

		// last pass to remove trailing white space (esp in table cells):
		var found = fc_grep( scope, '{ findWhat: "[             ]{1,}$" }', '{ changeTo: "" }' );
		for (var i = 0; i < found.length; i++) {
			try {
				found[i].changeGrep();;
			} catch(e) {
				// insertion Points werfen Fehler und könne ignoriert werden.
			}
		}

		// format hyperlinks	
		var found = fc_grep( doc, '{ findWhat: "\\[.+?\\] ?\\(.+?\\)" }' );
		for (var i = 0; i < found.length; i++) {
			var urls = fc_grep( found[i], '{ findWhat: "(?<=\\().+?(?=\\))" }' );
			if ( ! urls || ! urls.length ) continue;
			var url = urls[0].contents;
			var txt = fc_grep( found[i], '{ findWhat: "(?<=\\[).+?(?=\\])" }' );
			if ( ! txt || ! txt.length ) continue;
			txt[0].appliedCharacterStyle = doc.characterStyleGroups.item("markdown").characterStyles.item("url");
			createHyperLink( txt[0], url, i);
			fc_grep( found[i], '{ findWhat: "\\[|\\] ?\\(.+?\\)" }' , '{ changeTo: "" }' );
		}

		function createHyperLink(textObject, url, i) {
			var textSource = doc.hyperlinkTextSources.add(textObject);
			var urlDestination = doc.hyperlinkURLDestinations.itemByName(url);
			urlDestination = doc.hyperlinkURLDestinations.add(url, { hidden: true });
			var hlink = doc.hyperlinks.add(textSource, urlDestination);
			hlink.name = textObject.contents + i;
		}
	}



	function handle_replacements(scope){
		if ( ! fc_prefs ) {
			var prefs_file = new File( PATH_DATA_FOLDER + "/Assets/FindChangeListMarkdown.txt");
			if ( ! prefs_file.exists ) return;
			fc_prefs = __readFile( prefs_file );
			fc_prefs = fc_prefs.replace(/\r/g, "\n").replace(/\n\n+/g, "\n").split("\n");
		}
		for ( var nl = 0; nl < fc_prefs.length; nl++ ) {
			var line = fc_prefs[nl];
			if( line.substring(0,4)!=="text" && line.substring(0,4)!=="grep" && line.substring(0,5)!=="glyph") continue;
			var bits = line.split("\t"),
					type = bits[0],
					find = bits[1],
					change = bits[2],
					options = bits[3];
			if (DBG) $.writeln( nl + ": " + find );
			if ( type == "text" ) {
				fc_text( scope, find, change, options );

			} else if ( type == "grep" ) {
				fc_grep( scope, find, change, options );

			} else if ( type == "glyph" ) {
				fc_glyph( scope, find, change, options );

			} else {

			}

		}
	}
	function fc_reset() {
		app.findTextPreferences = NothingEnum.NOTHING;
		app.changeTextPreferences = NothingEnum.NOTHING;
		app.findGrepPreferences = NothingEnum.NOTHING;
		app.changeGrepPreferences = NothingEnum.NOTHING;
		app.findGlyphPreferences = NothingEnum.NOTHING;
		app.changeGlyphPreferences = NothingEnum.NOTHING;
	}
	function fc_text( scope, find, change, options ) {
		try {
			fc_reset();
			var cmd = [];
			cmd.push( "app.findTextPreferences.properties = " + find + ";");
			if ( change ) {
				cmd.push( "app.changeTextPreferences.properties = " + change + ";");
			}
			if ( options ) {
				cmd.push( "app.findChangeTextOptions.properties = " + options + ";");
			}
			app.doScript( cmd.join("\n"), ScriptLanguage.javascript );
			if ( change ) {
				var found = scope.changeText();
			} else {
				var found = scope.findText();
			}
			return found;
		} catch(e) {}
	}
	function fc_grep( scope, find, change, options ) {
		try {
			fc_reset();
			var cmd = [];
			if ( typeof find == "string" ) {
				cmd.push( "app.findGrepPreferences.properties = " + find + ";");
			} else {
				app.findGrepPreferences.properties = find;
			}
			if ( change ) {
				if ( typeof change == "string" ) {
					cmd.push( "app.changeGrepPreferences.properties = " + change + ";");
				} else {
					app.changeGrepPreferences.properties = change;
				}
			}
			if ( options ) {
				if ( typeof options == "string" ) {
					cmd.push( "app.findChangeGrepOptions.properties = " + options + ";");
				} else {
					app.findChangeGrepOptions.properties = options
				}
			}
			if ( cmd.length ) {
				var c = cmd.length > 1 ? cmd.join("\n") : cmd[0];
				app.doScript( c, ScriptLanguage.javascript );
			}
			if ( change ) {
				var found = scope.changeGrep();
			} else {
				var found = scope.findGrep();
			}
			return found;
		} catch(e) {}
	}
	function fc_glyph( scope, find, change, options ) {
		fc_reset();
		var cmd = [];
		cmd.push( "app.findGlyphPreferences.properties = " + find + ";");
		if ( change ) {
			cmd.push( "app.changeGlyphPreferences.properties = " + change + ";");
		}
		if ( options ) {
			cmd.push( "app.findChangeGlyphOptions.properties = " + options + ";");
		}
		app.doScript( cmd.join("\n"), ScriptLanguage.javascript );
		if ( change ) {
			var found = scope.changeGlyph();
		} else {
			var found = scope.findGlyph();
		}
		return found;
	}



}

