/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Simple UI that defines which volumes should get Lock-Files

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
#include "./Octopus-include-2.jsxinc"
#targetengine collect_docfonts
__init(); 
var script_id = "collect-docfonts";
__log("run", script_id, script_id);

open_config();

function open_config() {
	var prefs = read_prefs( );

	// ---------------------------------------------------------------------------------------------------
	// Interface aufbauen
	// ---------------------------------------------------------------------------------------------------
	var w = new Window( "palette {orientation: 'column', alignChildren: ['fill', 'top']}" );
	w.toggle = create_toggle( w, "onoff", __("Collect-Fonts", script_id), __("Dont-Collect-Fonts", script_id), prefs.onoff );

	// ---------------------------------------------------------------------------------------------------
	// Aktive Ordner oder Ordner blocken
	w.active_or_block_group = w.add("panel { text: '" + __("active-or-blocking", script_id) + "', orientation: 'column', alignChildren: ['left', 'fill']}");
	w.active_rb = w.active_or_block_group.add("radiobutton", undefined, __("Paths-active", script_id));
	w.block_rb = w.active_or_block_group.add("radiobutton", undefined, __("Paths-blocking", script_id));
	w.active_rb.value = true;
	// ---------------------------------------------------------------------------------------------------
	// Pfadliste
	w.add_row = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
	w.add_et = w.add_row.add("edittext", [undefined, undefined, 500, 200], prefs.path ? prefs.paths.join("\n") : "", {multiline: true, scrolling: true});

	// ---------------------------------------------------------------------------------------------------
	// Listbutton
	w.btns = w.add_row.add("panel {orientation: 'column', alignChildren: ['fill', 'top']}");
	w.add_btn = w.btns.add("button", undefined, "+");

	w.add_btn.onClick = function() {
		var fld = Folder.selectDialog();
		if ( fld != null ) {
			var addlist = w.add_et.text.split("\n");
			addlist.push( fld.fullName );
			w.add_et.text = addlist.join("\n");
		}
	}

	// ---------------------------------------------------------------------------------------------------
	// OK Buttons
	w.ok_btns = w.add("group {orientation: 'row', alignChildren: ['right', 'top']}");

	w.help_btn = w.ok_btns.add("button", undefined, "?");
	w.help_btn.onClick = function() {
		__alert("krake", __("help-text", script_id), "", "OK", false);
	}

	var config_data;
	w.close_btn = w.ok_btns.add("button", undefined, __("close", script_id));
	w.close_btn.onClick = function() {
		try {
			this.window.close();
			var paths = w.add_et.text;
			paths.replace(/\r/g, "\n").replace(/^\n+/, "").replace(/\n+$/, "").replace(/\n+/g, "\n");
			paths = paths.split("\n");
			for ( var n = 0; n < paths.length; n++ ) paths[n] = trim( paths[n] );
			config_data = {
				"onoff": w.toggle.state,
				"switch": w.active_rb.value ? "active" : "blocking",
				"paths": paths
			};
			app.insertLabel( "octopus_collect_fonts", JSON.stringify(config_data) );
		} catch(e) {
			alert( e.message + " on " + e.line );
		}
	}

	w.show();

	function create_toggle( w, toggle_id, on_string, off_string, def_value ) {
		var on_img = unescape("%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00*%00%00%00%19%08%06%00%00%00G-%BCX%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD%7E%FC%00%00%02%E9IDATX%85%C5%97OH%93q%18%C7%3F%7B%B7p%9B%DA%5E%9D%8D%B6%1A%BE%26%18%18%E2%C2K%E8%E5%ED%90%15%15%D9%21%C2%9B%5D%EA%F4B%D7nJ%D0Y%1A%1E%F2%24Dy%B5%84%88a6%03%0F%15%A1%1E%B4%18D%990%CD%9C%CD6%D9L%ED%ED%F0%BE.%F7n%AEM%7D%F3%0B/%E3%7D%FEl%1F%9E%F7%B7%E7%7D%1E%8B%AA%AA%14%92%25%D8%1E%00%3A%00I%BF%9A%815%20%0D%2C%01%C9%82_%F0W%15@%0D%60%07%CA%80%29%E0%8B%7E%0D%A9Jh%B2%20%C7N%A0%96%60%7B%17%D0%0D%D4%16%09%B2W%CD%02%DD%AA%12%1A%C8%CBc%04%D5+8%C4%FF%034j%16%E80VX%D8%7E%A3W1%CC%C1A%A2%FFvXg%C9%28SQK%B0%5D%06%5E%99MQi%B3%D3P%EE%03%20%B2%1A%25%B1%91.%14%7EVUBa%D0A-%C1v%11%EDP%BB%CC%02%BC%E2i%A1%D3%DBFC%B97%CB%1EY%9Dgp%7E%9C%E1%C5%F7%F9%D2V%00IUBq%9Bn%E85%0B%B2%D2f%E7%E1%A9%5B4%94%7B%B1Z%AD%88%A2%88%28%8AX%ADV%00%7CI%1F%81%23%F5t%7Eo%E3%F6t%BF%B1%C2.%9D%AD%CB%C2%83s%12%F0%D9lH%B7%DB%8D%DF%EF%CF%00%1A%15%8F%C7y9%F3%86%9BS%7D%F9%8EC%9D%95%8B%F5%DD%C0%193@%95%DA%0B%C8%D5%8D%B8%DDn%24IB%10%84%1Dc%EDv%3Bu5%C7X%FF%99%E2u%EC%83%D1m%11%00%D9%0CH_Y%15%9D%DE6%9CN%27%92%24%15%95%E3p8PN_%C3WVet%C9%02%DA%9Bf%DF%25W7%02%E0%F5z%FF%11%99-%8F%C7%C3u%7F%AB%D1%DC%BC%F3%B3%D8%A3*l%0E%00DQ%2C9%B7%F5xS%8E%CD4P%00%A7%D3%B9%BB%BCCe96SAw%FA%87%EFF%A6%81%CE%AF%FD%20%91H%EC*7%B1%99%FB%B6%12%80%B1%3D2%E5Uxy%9A%E4f%9AT*Urn%DF%CC%B0%D14%26%A0MJ%FB%AE%C4F%9A%27%D1q%A2%D1hIy%91%A59%C6%17f%8C%E6%21%01%18%D8%27%B6%1C%F5%CF%8D0%FAu%82X%2CVT%FC%AF%8Dun%8C%DC%CF%E7%1A%B0%AA%CF%3F%A5%7B%DE%3E%B2%60R%E3%0F/Oc%5B%FDMS%B5T%B0%0B%AC%A4%92%9C%7Fv%97w%8B%11%A3%ABGUB/%B6OO%93%988%87%B6%B8N%A0%9C%BC%CC%A5%86V%AA%0E%BB2%1D%E1%5B%22%C6%E3%8F%A3%DC%9B%18%24%BE%96%B3%D5%CC%02%01U%09%C5%B7%CF%A3%01%B4%A1%D9%B4Q%AFD%AD%00%F2%D6%A4%9FiO%BAA%D6%03%0EZY%90%60%E8%A3%BAC%C2%A4%96U%A4%C6%D0%86%E5%AC%9D%A9%D0%16*%03w%80%AB%A6%A3iz%0A%F4n%AD%1E9%3CE%EC%F5%22%DA%91%08%E8%26Y%FF%5C@%5B_%0A.%3D%DBdG%7BZG%F5%FB-%A0I%20%AC*%A1x%A1%E4%3F%EA%27%F6%D7%90%E2%DE%ED%00%00%00%00IEND%AEB%60%82")
		var off_img = unescape("%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00*%00%00%00%19%08%06%00%00%00G-%BCX%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD%7E%FC%00%00%02%CDIDATX%85%CD%97%3DO%DB@%18%80%9F%98X%01+2%95%28%92%91%1C5%C9%C0%C7%94%08%24%A8%98%DC%85%B5%FC%04%26%BC%F6%27%D0%7F%80%D8n%CBO%A0R%86n%0D%12%CA%C4%90%0E%0C0%90F%B1%84%85j%01%A6%8A%28%1E%E8%E0K%1A%9C%8F%26%80%A1%8FdE%7E%7D%F7%E6%D1%DD%E9%EE%BD%C4%FD%FD%3D%C3%B0m%BB%08l%02Y%F9%14%80%DF%C0-%F0%13%F854%C1_%D2%C0%5B%60%12H%01%DF%81%1F%F2%D9%17B%D4%86uN%0C%12%B5m%7B%0B%D8%01%DE%8D%28%F2T%1A%C0%8E%10%A2%D4%EFc%8F%A8%1C%C1%7D%5EN0J%03%D8%8C%8E%B0%D2%FD%22G%B1%C2%EBI%22%FF%BB%22%5D%3AtF%D4%B6m%0B%F86%A8%B7%AA%AA%E8%BA%0E%80%EF%FB%04A%10%97h7%1F%84%10%15%90%A2%B6m%BF%21%5C%D4%D3%D1%96%99L%86%7C%3E%DF%91l%E3%FB%3Eggg4%9B%CD8E%AF%81%AC%10%E2*%29%03%BBQIUUY__G%D7uTU%C50%0Cfff%98%9A%9A%02%C0%F3%3CL%D3%C4q%1C%AA%D5j%5C%23%3C-%DD%B6%12%DB%DB%DBY%A0%3EH%D20%0C%8A%C5%22%C9d%B2_%22%5C%D7%E5%F0%F0%90J%A5%12%E7r%C8M%AC%AC%AC%EC%00%EF%BB%A3KKK%18%86A%26%93ayy%19EQ%FAw%07%D2%E94%A6irqq%C1%F9%F9y%5C%A2%09%05%B0%BA%23%9A%A6%91%CF%E7%D14%8DB%A10R%16%5D%D7%D9%D8%D8@%D3%B4%18%1C%01%B0%14%C2%93%A6%83a%18%00%CC%CF%CF%8F%95%29%97%CB%B1%B0%B0%F0lf%11%0A%3Ds%AA%AA*%00%A6i%8E%9Dmqq%F1%E9J%03%E8%BB%F8%1E%3B%85%A9T%EAI2%C3%E8+%DA%DE%82%FE%27zD%5B%AD%16%9E%E7%3D*Y%9C%A7%95%02%1Ct%07%5C%D7%25%08%02%7C%DF%1F%3BY%B5Z%7D.%AF%28%07%0Aa%A5%D4%21%08%02%EA%F5%3A%A7%A7%A7cer%1C%87z%BD%FE%EF%86%8Fc_%01J%D1%E8%C9%C9%09%C7%C7%C78%8E3R%96%BB%BB%3BJ%A5%9E4%CFIi%E2%E8%E8%E8%B6%5C.%27%88l%FC%AE%EBryy%C9%DC%DC%5COA%D2%CD%CD%CD%0D%7B%7B%7B4%1A%8D%B8%24%3F%0B%21%BEv%17%25%5Bt%D5%A1A%10P%AB%D5h6%9B%AC%AD%AD%B1%BA%BA%CA%EC%ECl%E7%CC%F7%3C%8FZ%ADF%B9%5C%A6%D5j%C5%25%D9%90n%0F%EA%D1%22a%D1%DCS%EA%BD%12%D7%80%D5%AE%F4%3B%DB%93%0CX%B2%C1k%F3@%12%22%FB%A8%FC%90%25%B2e%BD0%07%84%C5%F2%83%3B%D3%B0%5B%A8%05%7C%02%3E%C6%AE%16%F2%05%D8m_%3D%A2%0C%14m%23%AF%29%16P%94%21K%FE%BA%84%D7%97%DB%11E%26%09g%CB%90%EFm%A1%1AP%11B%5C%0D%EB%FC%07%80%7F%FC%A1%E6I%A8%85%00%00%00%00IEND%AEB%60%82")

		// ------------------------------------------------------------------------------------------------------------------
		//	Toggle-PNGs
		// ------------------------------------------------------------------------------------------------------------------			
		var ud = new Folder( Folder.userData + "/cuppascript" );
		if ( !ud.exists ) ud.create();

		// ------------------------------------------------------------------------------------------------------------------
		//	Bilder speichern
		// ------------------------------------------------------------------------------------------------------------------
		if ( ! w.hasOwnProperty( "on_png")) {
			w.on_png = new File( ud.fullName + "/on.png" );
			w.off_png = new File( ud.fullName + "/off.png" );
	
			if ( ! w.on_png.exists) {
				w.on_png.encoding = "BINARY";
				w.on_png.open("w");
				w.on_png.write( unescape( on_img ) );
				w.on_png.close();
			}
			if ( ! w.off_png.exists) {
				w.off_png.encoding = "BINARY";
				w.off_png.open("w");
				w.off_png.write( unescape( off_img ) );
				w.off_png.close();
			}
		}

		// ------------------------------------------------------------------------------------------------------------------
		//	Controls erstellen
		// ------------------------------------------------------------------------------------------------------------------
		var stw = Math.max( on_string.length, off_string.length ) * 7 + 10;
		w[ toggle_id] = w.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
		w[ toggle_id ].toggle_btn = w[ toggle_id ].add("iconbutton", [undefined, undefined, 60, 36], w.on_png);
		w[ toggle_id ].toggle_text = w[ toggle_id ].add("statictext", [undefined, undefined, stw, 20], on_string);
		w[ toggle_id ].toggle_btn.state = "on";
		w[ toggle_id ].toggle_btn.toggle_id = toggle_id;
		w[ toggle_id ].on_string = on_string;
		w[ toggle_id ].off_string = off_string;
		if ( def_value == "off" ) {	
			w[ toggle_id ].toggle_text.text = off_string;
			w[ toggle_id ].toggle_btn.state = "off";
			w[ toggle_id ].toggle_btn.image = w.off_png;
		}

		// ------------------------------------------------------------------------------------------------------------------
		//	Click-Handler
		// ------------------------------------------------------------------------------------------------------------------
		w[ toggle_id ].toggle_btn.onClick = function() {
			var toggle_id = this.toggle_id
			if ( this.state == "on" ) {
				this.window[toggle_id].toggle_text.text = this.window[toggle_id].off_string;
				this.state = "off";
				this.image = this.window.off_png;
			} else {
				this.window[toggle_id].toggle_text.text = this.window[toggle_id].on_string;
				this.state = "on";
				this.image = this.window.on_png;
			}
		}
		return w[toggle_id].toggle_btn;
	}
	function trim(s) {
		return s.replace(/^\s+|\s+$/g, '');
	}
  
	function read_prefs( ) {
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
	}







  // --------------------------------------------------------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------------------------------------------------------
  //  Localisation Strings
  // --------------------------------------------------------------------------------------------------------------------------------------------
	function __( id, script_id ) {
		var txt = "";
		try {
			var a = loc_strings;
		} catch(e) {
			loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
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
	}
	function get_script_folder_path() {
		try {
			return app.activeScript.parent.fullName;
		} catch (e) { 
			return e.fileName.replace(/\/[^\/]+$/, "");
		}
	}	

}



