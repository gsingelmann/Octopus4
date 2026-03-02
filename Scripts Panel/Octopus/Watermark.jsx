/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Watermarks is a hidden InDesign-feature that can be used with this script

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
#targetengine "octopus_watermark"
#include "Startup Scripts/Octopus/Include.jsxinc"
__init(); 
var script_id = "Watermark"

if ( app.documents.length ) {
	__log("run", script_id, script_id );
	set_watermark( __("Wasserzeichen") );
} else {
	__alert( "stop", __('no-doc'), "", "OK" );
}

function set_watermark( title, version ) {
  var errs = [];

  var doc = app.activeDocument;

  // ---------------------------------------------------------------------------------------------------------------------------------
  //  Schriftenliste sammeln
  //  { families: ['arial', 'berial'], styles: [ ['regular'], ['regular', 'bold'] ] }
  // ---------------------------------------------------------------------------------------------------------------------------------
  var working_fonts = get_working_fonts();
  var font_ix = Math.floor(working_fonts.families.length / 2)
	for (var n = 0; n < working_fonts.families.length; n++) {
		if (working_fonts.families[n] == doc.watermarkPreferences.watermarkFontFamily ) {
			font_ix = n;
			break;
		}
	}

	// ---------------------------------------------------------------------------------------------------------------------------------
	//	Ich biete Material-Colors in TailwindStruktur zur Auswahl an. Url in der Funktion
	//	color_values['amber']['500'] = '#abcdef';
	// ---------------------------------------------------------------------------------------------------------------------------------
	var color_values = color_init();
	var color_names = [];
	for ( var cname in color_values ) {
    color_names.push( cname );
	}

  // ---------------------------------------------------------------------------------------------------------------------------------
  //  Die Eigenschaften definieren
  // ---------------------------------------------------------------------------------------------------------------------------------
  var props = [
    {
      name: "watermarkText",
      type: "text",
			panel: __('Inhalt')
    }, {
      name: "watermarkFontColor",
      type: "color",
			panel: __('Formatierung')
    }, {
      name: "watermarkFontFamily",
      type: "fonts",
			panel: __('Formatierung')
    }, {
      name: "watermarkFontStyle",
      type: "styles",
			panel: __('Formatierung')
    }, {
      name: "watermarkFontPointSize",
      type: "number",
			panel: __('Formatierung')
    }, {
      name: "watermarkHorizontalPosition",
      type: "enum",
			panel: __("Position")
    }, {
      name: "watermarkVerticalPosition",
      type: "enum",
			panel: __("Position")
    }, {
      name: "watermarkHorizontalOffset",
      type: "number",
			panel: __("Position")
    }, {
      name: "watermarkVerticalOffset",
      type: "number",
			panel: __("Position")
    }, {
      name: "watermarkOpacity",
      type: "number",
			panel: __("Sichtbarkeit")
    }, {
      name: "watermarkRotation",
      type: "number",
			panel: __("Sichtbarkeit")
    }, {
      name: "watermarkVisibility",
      type: "boolean",
			panel: __("Sichtbarkeit")
    }, {
      name: "watermarkDoPrint",
      type: "boolean",
			panel: __("Sichtbarkeit")
    }, {
      name: "watermarkDrawInBack",
      type: "boolean",
			panel: __("Sichtbarkeit")
    },
  ]
	var state = {};
	var saved_state = doc.extractLabel( "cs_octopus_watermark");
	if ( saved_state ) {
		state = JSON.parse( saved_state );
	}
  for ( var p in props ) {
    try {
      state[props[p].name] = doc.watermarkPreferences[props[p].name]
    } catch(e) {
      errs.push( __('read-error') + props[p].name + ": " + e );
    }
  }
	var was_visible = doc.watermarkPreferences.watermarkVisibility || doc.watermarkPreferences.watermarkDoPrint;

	var window_position = app.extractLabel('octopus_position_' + title);
  if ( window_position != "" ) {
		window_position = JSON.parse( window_position );
  }

	var ui_is_light = app.generalPreferences.uiBrightnessPreference > 0.5
	
  var width = 300, lw = 140;

  var w = new Window('dialog', title, ( window_position ? { x: window_position.x, y: window_position.y} : undefined ) );
	w.script_id = script_id;
  if ( "I want to be able to collapse this ") {
    w.orientation = 'column';
    w.alignChildren = ['fill', 'fill'];

		__insert_head( w, script_id );

    w.main = w.add( 'group {orientation: "column", alignChildren: ["fill","fill"]}');
    w.btns = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');
    w.footer = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');
    
  }

  w.fields = {};
	var crnt_panel_name = "";
	var crnt_panel = null;
  for ( var nprop = 0; nprop < props.length; nprop++ ) {
    var p = props[nprop];
		if ( p.panel != crnt_panel_name ) {
			crnt_panel = w.main.add("panel {text: '" + p.panel + "', alignChildren: ['left', 'top']}")
			crnt_panel_name = p.panel
		}
		var row = crnt_panel.add("group {orientation: 'row', alignChildren: ['left', 'top']}"); 
    row.add("statictext", [undefined, undefined, lw, 20], __(p.name));
    // -----------------------------------------------------------------------------------------------------
    //  input
    // -----------------------------------------------------------------------------------------------------
    if ( p.type == "text" || p.type == "number") {
      w.fields[p.name] = row.add("edittext", [undefined, undefined, width, 20], state[p.name] )
      w.fields[p.name]._id = p.name;
      w.fields[p.name]._type = p.type;
      w.fields[p.name].onChange = function() {
        if ( this._type == "number" ) {
					var aux = this.text.replace(/,/, ".")
          if ( isNaN( Number(aux) ) ) {
            this.text = state[ this._id ];
          } else {
            state[ this._id ] = Math.round( Number( aux ) );
          }
        } else {
					state[ this._id ] = this.text;
				}
      }
    } else if ( p.type == "color" ) {
			// -----------------------------------------------------------------------------------------------------
			//  color
			//	27.4.23: Ich bau, der Einfachheit halber, mal nur eine Farbe ein
			// -----------------------------------------------------------------------------------------------------
			var crnt_color = 0,
					crnt_tones = get_crnt_tones( crnt_color ),
					crnt_tone = 0;
			if ( state.hasOwnProperty( p.name + '_color') && state.hasOwnProperty( p.name + '_tone') ) {
				for ( var n = 0; n <  color_names.length; n++ ) {
					if ( color_names[n] == state[p.name + "_color"] ) {
						crnt_color = n;
						crnt_tones = get_crnt_tones( crnt_color );
						for ( var m = 0; m < crnt_tones.length; m++ ) {
							if ( crnt_tones[m] == state[p.name + "_tone"] ) crnt_tone = m;
						}
					}
				}
			} else {
				if ( state[p.name].toString() == "BLACK" ) {
					state[p.name] = hexToRgb( color_values['black']['_100'] );
					state[p.name + "_color"] = color_names[ crnt_color ];
					state[p.name + "_tone"] = crnt_tones[ crnt_tone ];
				}
			}
		
			w.cname = row.add("dropdownlist", undefined, color_names );
			w.cname.selection = crnt_color;
			w.cname._id = p.name;
			w.ctone = row.add("dropdownlist", undefined, crnt_tones);
			w.ctone.selection = crnt_tone;
			w.ctone._id = p.name;
			w.cshow = row.add("group", [undefined, undefined, 120, 25]);
			set_color( w.cshow, crnt_color, crnt_tones, crnt_tone );
			w.cname.onChange = function () {
				crnt_color = this.selection.index;
				crnt_tones = get_crnt_tones( crnt_color );
				var ix = w.ctone.selection.index;
				w.ctone.removeAll();
				for ( var n = 0; n < crnt_tones.length; n++ ) {
					w.ctone.add("item", crnt_tones[n]);
				}
				if ( ix > crnt_tones.length ) {
					w.ctone.selection = Math.floor( crnt_tones.length / 2 );
				} else {
					w.ctone.selection = ix;
				}
				state[ this._id ] = set_color( w.cshow, crnt_color, crnt_tones, crnt_tone );
				state[ this._id + "_color"] = color_names[ crnt_color ];
			}
			w.ctone.onChange = function () {
				if ( this.selection ) {
					crnt_tone = this.selection.index;
					state[ this._id ] = set_color( w.cshow, crnt_color, crnt_tones, crnt_tone );
					state[ this._id + "_tone"] = crnt_tones[ crnt_tone ];
				}		
			}

		} else if ( p.type == "fonts" ) {
			// -----------------------------------------------------------------------------------------------------
			//  Font Families
			// -----------------------------------------------------------------------------------------------------
			w.fields[p.name] = row.add("dropdownlist", [undefined, undefined, width, 20], working_fonts.families)
			w.fields[p.name]._id = p.name;
			w.fields[p.name].selection = font_ix;
			w.fields[p.name].onChange = function() {
				font_ix = this.selection.index;
				state[this._id] = this.selection.text;

				w.fields.watermarkFontStyle.removeAll();
				for ( var n = 0; n < working_fonts.styles[font_ix].length; n++ ) {
					w.fields.watermarkFontStyle.add("item", working_fonts.styles[font_ix][n] );
				}
			}
		} else if ( p.type == "styles" ) {
			// -----------------------------------------------------------------------------------------------------
			//  Font Styles
			// -----------------------------------------------------------------------------------------------------
			w.fields[p.name] = row.add("dropdownlist", [undefined, undefined, width, 20], working_fonts.styles[font_ix])
			w.fields[p.name]._id = p.name;
			w.fields[p.name].selection = state[ p.name ];
			w.fields[p.name].onChange = function() {
				if ( this.selection ) {
					font_ix = this.selection.index;
					state[this._id] = this.selection.text;
				} 
			}
		} else if ( p.type == "enum") {
			var h_enum = [ "WATERMARK_H_LEFT", "WATERMARK_H_CENTER", "WATERMARK_H_RIGHT"]
			var v_enum = [ "WATERMARK_V_TOP", "WATERMARK_V_CENTER", "WATERMARK_V_BOTTOM"]
			if ( p.name == "watermarkHorizontalPosition") {
				w.fields[p.name] = row.add("dropdownlist", [undefined, undefined, width, 20], [__('links'), __('mitte'), __('rechts')])
				if ( state[p.name] == h_enum[0] || state[p.name] == WatermarkHorizontalPositionEnum[ h_enum[0] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = h_enum[0];
					w.fields[p.name].selection = 0;
				}
				if ( state[p.name] == h_enum[1] || state[p.name] == WatermarkHorizontalPositionEnum[ h_enum[1] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = h_enum[1];
					w.fields[p.name].selection = 1;
				}
				if ( state[p.name] == h_enum[2] || state[p.name] == WatermarkHorizontalPositionEnum[ h_enum[2] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = h_enum[2];
					w.fields[p.name].selection = 2;
				}
				w.fields[p.name]._id = p.name;
				w.fields[p.name].onChange = function() {
					if ( this.selection ) {
						state[ this._id ] = h_enum[ this.selection.index ];
					}
				}
			} else if ( p.name == "watermarkVerticalPosition") {
				w.fields[p.name] = row.add("dropdownlist", [undefined, undefined, width, 20], [__('oben'), __('mitte'), __('unten')])
				if ( state[p.name] == v_enum[0] || state[p.name] == WatermarkVerticalPositionEnum[ v_enum[0] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = v_enum[0];
					w.fields[p.name].selection = 0;
				}
				if ( state[p.name] == v_enum[1] || state[p.name] == WatermarkVerticalPositionEnum[ v_enum[1] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = v_enum[1];
					w.fields[p.name].selection = 1;
				}
				if ( state[p.name] == v_enum[2] || state[p.name] == WatermarkVerticalPositionEnum[ v_enum[2] ] ) {
					// Der State soll String sein. Ist er anfangs nicht
					state[p.name] = v_enum[2];
					w.fields[p.name].selection = 2;
				}
				w.fields[p.name]._id = p.name;
				w.fields[p.name].onChange = function() {
					if ( this.selection ) {
						state[ this._id ] = v_enum[ this.selection.index ];
					}
				}
			}
		} else if ( p.type == "boolean" ) {
			w.fields[p.name] = row.add("checkbox")
			w.fields[p.name].value = state[p.name];
			w.fields[p.name]._id = p.name
			w.fields[p.name].onClick = function() {
				state[ this._id ] = this.value;
			}
    }	// elses
  }		// props loop

	// --------------------------------------------------------------------
	//	 Bug in ID: Print funzt nur, wenn Visibility an
	w.fields.watermarkDoPrint.enabled = w.fields.watermarkVisibility.value;
	w.fields.watermarkVisibility.onClick = function() {
		if ( this.value ) {
			w.fields.watermarkDoPrint.enabled = true;
		} else {
			w.fields.watermarkDoPrint.value = false;
			state.watermarkDoPrint = false;
			w.fields.watermarkDoPrint.enabled = false;
		}
	}



  w.defaultElement = w.btns.add('button', undefined, "OK")
  w.cancelElement = w.btns.add('button', undefined, "Abbrechen")

  // w.footer.add('statictext', undefined, 'v' + version)

  var r = w.show();
	if ( r == 1 ) {
		// Wenn vorher nicht sichtbar, wird bei OK sichtbar gemacht
		if ( ! was_visible ) {
			state.watermarkVisibility = true;
		}
		doc.insertLabel( "cs_octopus_watermark", JSON.stringify( state ) );
		// // $.writeln( JSON.stringify( state, undefined, 2))
		for ( var p in props ) {
			try {
				var nm = props[p].name;
				var v = state[nm];
				if ( nm == "watermarkVerticalPosition" ) {
					doc.watermarkPreferences[nm] = WatermarkVerticalPositionEnum[ v ];
				} else if ( nm == "watermarkHorizontalPosition" ) {
					doc.watermarkPreferences[nm] = WatermarkHorizontalPositionEnum[ v ];
				} else {
					doc.watermarkPreferences[nm] = v;
				}
			} catch(e) {
				errs.push( __('write-error') + nm + ": " + e );
			}
		}
	}


	function get_crnt_tones( crnt ) {
		var tones = [];
		for ( ctone in color_values[ color_names[ crnt ] ] ) {
			tones.push( ctone.substr(1) );
		}
		return tones;
	}
	function set_color( thing, _crnt_color, _crnt_tones, _crnt_tone ) {
		var cn = color_names[ _crnt_color ];
		var ct = "_" + _crnt_tones[ _crnt_tone ];
		var v = color_values[ cn ][ ct ];
		var v1 = hexToRgbSui( v );
		thing.graphics.backgroundColor = thing.graphics.newBrush(
			thing.graphics.BrushType.SOLID_COLOR,
			v1
		)
		return hexToRgb( v );
	}
}








// -------------------------------------------------------------------------------------------------------------------------
//  Manche Fonts funktionieren nicht. K.A. warum nicht
// -------------------------------------------------------------------------------------------------------------------------
function get_working_fonts() {
  doc = app.activeDocument;

  var prev1 = doc.watermarkPreferences.watermarkFontFamily;
  var prev2 = doc.watermarkPreferences.watermarkFontStyle;
  var prev3 = doc.watermarkPreferences.watermarkVisibility;
  doc.watermarkPreferences.watermarkVisibility = false;

  var working = [];
  var working_styles = [];
  var no_working = [];

  var allFonts = app.fonts.everyItem().getElements();
	var nFonts = allFonts.length;

  var count = -1;
  var last_family = "";
  for ( var n = 0; n < Math.min(200000, nFonts); n++ ) {
    var f = allFonts[n];
    if ( f.fontFamily != last_family ) {
      try {
        doc.watermarkPreferences.watermarkFontFamily = f.fontFamily;
        doc.watermarkPreferences.watermarkFontStyle = f.fontStyleName;
        count++;
        working[ count ] =  f.fontFamily;
        working_styles[ count ] = [ f.fontStyleName ];
      } catch(e) {
        no_working.push( f.fontFamily )
      }
      last_family = f.fontFamily;
    } else {
			try {	
				working_styles[ count ].push( f.fontStyleName );
			} catch(e) {
				working_styles[ count ].push("");
			}
    }
  }
	try {
		doc.watermarkPreferences.watermarkFontFamily = prev1;
		doc.watermarkPreferences.watermarkFontStyle = prev2;
		doc.watermarkPreferences.watermarkVisibility = prev3;
	} catch(e) {
		
	}

  var rs = {
    families: working,
    styles: working_styles
  }
  return rs;

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

// --------------------------------------------------------------------------------------------------------------------------
function hexToRgbSui(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var r = 0, g = 0, b = 0;
	if ( result ) {
		r = Math.round( parseInt(result[1], 16) / .255 ) / 1000;
		g = Math.round( parseInt(result[2], 16) / .255 ) / 1000;
		b = Math.round( parseInt(result[3], 16) / .255 ) / 1000;
	}
	return [ r, g, b ];
}
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var r = 0, g = 0, b = 0;
	if ( result ) {
		r = ( parseInt(result[1], 16) );
		g = ( parseInt(result[2], 16) );
		b = ( parseInt(result[3], 16) );
	}
	return [ r, g, b ];
}

function color_init() {
	// https://davidpiesse.github.io/tailwind-md-colours/
	var _colors = {
		"black-100": "#000000",
		"white-0": "#ffffff",
		"red-050": "#ffebee",
		"red-100": "#ffcdd2",
		"red-200": "#ef9a9a",
		"red-300": "#e57373",
		"red-400": "#ef5350",
		"red-500": "#f44336",
		"red-600": "#e53935",
		"red-700": "#d32f2f",
		"red-800": "#c62828",
		"red-900": "#b71c1c",
		"pink-050": "#fce4ec",
		"pink-100": "#f8bbd0",
		"pink-200": "#f48fb1",
		"pink-300": "#f06292",
		"pink-400": "#ec407a",
		"pink-500": "#e91e63",
		"pink-600": "#d81b60",
		"pink-700": "#c2185b",
		"pink-800": "#ad1457",
		"pink-900": "#880e4f",
		"purple-050": "#f3e5f5",
		"purple-100": "#e1bee7",
		"purple-200": "#ce93d8",
		"purple-300": "#ba68c8",
		"purple-400": "#ab47bc",
		"purple-500": "#9c27b0",
		"purple-600": "#8e24aa",
		"purple-700": "#7b1fa2",
		"purple-800": "#6a1b9a",
		"purple-900": "#4a148c",
		"deep-purple-050": "#ede7f6",
		"deep-purple-100": "#d1c4e9",
		"deep-purple-200": "#b39ddb",
		"deep-purple-300": "#9575cd",
		"deep-purple-400": "#7e57c2",
		"deep-purple-500": "#673ab7",
		"deep-purple-600": "#5e35b1",
		"deep-purple-700": "#512da8",
		"deep-purple-800": "#4527a0",
		"deep-purple-900": "#311b92",
		"indigo-050": "#e8eaf6",
		"indigo-100": "#c5cae9",
		"indigo-200": "#9fa8da",
		"indigo-300": "#7986cb",
		"indigo-400": "#5c6bc0",
		"indigo-500": "#3f51b5",
		"indigo-600": "#3949ab",
		"indigo-700": "#303f9f",
		"indigo-800": "#283593",
		"indigo-900": "#1a237e",
		"blue-050": "#e3f2fd",
		"blue-100": "#bbdefb",
		"blue-200": "#90caf9",
		"blue-300": "#64b5f6",
		"blue-400": "#42a5f5",
		"blue-500": "#2196f3",
		"blue-600": "#1e88e5",
		"blue-700": "#1976d2",
		"blue-800": "#1565c0",
		"blue-900": "#0d47a1",
		"light-blue-050": "#e1f5fe",
		"light-blue-100": "#b3e5fc",
		"light-blue-200": "#81d4fa",
		"light-blue-300": "#4fc3f7",
		"light-blue-400": "#29b6f6",
		"light-blue-500": "#03a9f4",
		"light-blue-600": "#039be5",
		"light-blue-700": "#0288d1",
		"light-blue-800": "#0277bd",
		"light-blue-900": "#01579b",
		"cyan-050": "#e0f7fa",
		"cyan-100": "#b2ebf2",
		"cyan-200": "#80deea",
		"cyan-300": "#4dd0e1",
		"cyan-400": "#26c6da",
		"cyan-500": "#00bcd4",
		"cyan-600": "#00acc1",
		"cyan-700": "#0097a7",
		"cyan-800": "#00838f",
		"cyan-900": "#006064",
		"teal-050": "#e0f2f1",
		"teal-100": "#b2dfdb",
		"teal-200": "#80cbc4",
		"teal-300": "#4db6ac",
		"teal-400": "#26a69a",
		"teal-500": "#009688",
		"teal-600": "#00897b",
		"teal-700": "#00796b",
		"teal-800": "#00695c",
		"teal-900": "#004d40",
		"green-050": "#e8f5e9",
		"green-100": "#c8e6c9",
		"green-200": "#a5d6a7",
		"green-300": "#81c784",
		"green-400": "#66bb6a",
		"green-500": "#4caf50",
		"green-600": "#43a047",
		"green-700": "#388e3c",
		"green-800": "#2e7d32",
		"green-900": "#1b5e20",
		"light-green-050": "#f1f8e9",
		"light-green-100": "#dcedc8",
		"light-green-200": "#c5e1a5",
		"light-green-300": "#aed581",
		"light-green-400": "#9ccc65",
		"light-green-500": "#8bc34a",
		"light-green-600": "#7cb342",
		"light-green-700": "#689f38",
		"light-green-800": "#558b2f",
		"light-green-900": "#33691e",
		"lime-050": "#f9fbe7",
		"lime-100": "#f0f4c3",
		"lime-200": "#e6ee9c",
		"lime-300": "#dce775",
		"lime-400": "#d4e157",
		"lime-500": "#cddc39",
		"lime-600": "#c0ca33",
		"lime-700": "#afb42b",
		"lime-800": "#9e9d24",
		"lime-900": "#827717",
		"yellow-050": "#fffde7",
		"yellow-100": "#fff9c4",
		"yellow-200": "#fff59d",
		"yellow-300": "#fff176",
		"yellow-400": "#ffee58",
		"yellow-500": "#ffeb3b",
		"yellow-600": "#fdd835",
		"yellow-700": "#fbc02d",
		"yellow-800": "#f9a825",
		"yellow-900": "#f57f17",
		"amber-050": "#fff8e1",
		"amber-100": "#ffecb3",
		"amber-200": "#ffe082",
		"amber-300": "#ffd54f",
		"amber-400": "#ffca28",
		"amber-500": "#ffc107",
		"amber-600": "#ffb300",
		"amber-700": "#ffa000",
		"amber-800": "#ff8f00",
		"amber-900": "#ff6f00",
		"orange-050": "#fff3e0",
		"orange-100": "#ffe0b2",
		"orange-200": "#ffcc80",
		"orange-300": "#ffb74d",
		"orange-400": "#ffa726",
		"orange-500": "#ff9800",
		"orange-600": "#fb8c00",
		"orange-700": "#f57c00",
		"orange-800": "#ef6c00",
		"orange-900": "#e65100",
		"deep-orange-050": "#fbe9e7",
		"deep-orange-100": "#ffccbc",
		"deep-orange-200": "#ffab91",
		"deep-orange-300": "#ff8a65",
		"deep-orange-400": "#ff7043",
		"deep-orange-500": "#ff5722",
		"deep-orange-600": "#f4511e",
		"deep-orange-700": "#e64a19",
		"deep-orange-800": "#d84315",
		"deep-orange-900": "#bf360c",
		"brown-050": "#efebe9",
		"brown-100": "#d7ccc8",
		"brown-200": "#bcaaa4",
		"brown-300": "#a1887f",
		"brown-400": "#8d6e63",
		"brown-500": "#795548",
		"brown-600": "#6d4c41",
		"brown-700": "#5d4037",
		"brown-800": "#4e342e",
		"brown-900": "#3e2723",
		"grey-050": "#fafafa",
		"grey-100": "#f5f5f5",
		"grey-200": "#eeeeee",
		"grey-300": "#e0e0e0",
		"grey-400": "#bdbdbd",
		"grey-500": "#9e9e9e",
		"grey-600": "#757575",
		"grey-700": "#616161",
		"grey-800": "#424242",
		"grey-900": "#212121",
		"blue-grey-050": "#eceff1",
		"blue-grey-100": "#cfd8dc",
		"blue-grey-200": "#b0bec5",
		"blue-grey-300": "#90a4ae",
		"blue-grey-400": "#78909c",
		"blue-grey-500": "#607d8b",
		"blue-grey-600": "#546e7a",
		"blue-grey-700": "#455a64",
		"blue-grey-800": "#37474f",
		"blue-grey-900": "#263238",
	};
	var rs = {};
	var ln = "";
	for ( var id in _colors ) {
		var c = id.split("-");
		var tone = c.pop();
		var name = c.join("-");
		if ( name != ln ) {
			// // $.writeln( name );
			ln = name;
			rs[ name ] = {};
		}
		rs[ name ][ "_" + tone ] = _colors[ id ];
		// // $.writeln( " - " + tone );
	}
	return rs;
}