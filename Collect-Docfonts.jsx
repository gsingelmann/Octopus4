#targetengine collect_docfonts
init();
collect_doc_main();

function collect_doc_main() {
  if ( ScriptUI.environment.keyboardState.shiftKey ) {
    open_config();
    return;
  }
  // var myEventListener2 = app.addEventListener("afterSaveAs", collect_fonts, false);
  collect_fonts( app.activeDocument)


  function collect_fonts( doc ) {
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
				alert( __("Schriften sammeln") + "\n" + msgs.join("\n") );
			}
		}				// do collect
  }

  function save_handler() {
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
    var path_list = prefs.paths.replace(/\r/g, "\n").replace(/^\n+/, "").replace(/\n+$/, "").split("\n");
    var doc_path = app.activeDocument.path.fullName;
    var match_found = false;

  }


  function open_config() {
		var prefs = read_prefs( );
		// ---------------------------------------------------------------------------------------------------
		// Interface aufbauen
		// ---------------------------------------------------------------------------------------------------
    var w = new Window( "palette {orientation: 'column', alignChildren: ['fill', 'top']}" );
		w.toggle = create_toggle( w, "onoff", __("Schriften sammeln"), __("Schriften nicht sammeln"), prefs.onoff );

		// ---------------------------------------------------------------------------------------------------
		// Aktive Ordner oder Ordner blocken
		w.active_or_block_group = w.add("panel { text: '" + __("active-or-blocking") + "', orientation: 'column', alignChildren: ['left', 'fill']}");
		w.active_rb = w.active_or_block_group.add("radiobutton", undefined, __("Sammle Schriften, wenn in diesen Pfaden gespeichert wird"));
		w.block_rb = w.active_or_block_group.add("radiobutton", undefined, __("Sammle keine Schriften, wenn in diesen Pfaden gespeichert wird"));
		w.active_rb.value = true;
		// ---------------------------------------------------------------------------------------------------
		// Pfadliste
    w.add_row = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.add_et = w.add_row.add("edittext", [undefined, undefined, 500, 200], prefs.paths, {multiline: true, scrolling: true});

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
      alert(__("help-text"));
    }

		var config_data;
    w.close_btn = w.ok_btns.add("button", undefined, __("close"));
    w.close_btn.onClick = function() {
			try {
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
				this.window.close();
				alert(app.extractLabel( "octopus_collect_fonts" ));
			} catch(e) {
				alert( e.message + " on " + e.line );
			}
    }

    w.show();
		return config_data;

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
  function __( id ) {
    // if ( typeof loc_strings == "undefined" ) loc_strings = load_translation();
		loc_strings = load_translation();    
    if (loc_strings.hasOwnProperty(id)) {
      return localize(loc_strings[id]);
    } else {
      // __log( "'" + id + "' nicht in den Übersetzungen enthalten")
      return id
    }
  }
  
  function load_translation() {
    return {
			"Schriften sammeln": {
				"en": "Collect fonts",
				"it": "Raccogli i font",
				"fr": "Collecter les polices"
			},
			"Schriften nicht sammeln": {
				"en": "Do not collect fonts",
				"it": "Non raccogliere i font",
				"fr": "Ne pas collecter les polices"
      },
      "Sammle Schriften, wenn in diesen Pfaden gespeichert wird": {
        "en": "Collect fonts when saving to these paths",
        "it": "Raccogli i font quando si salva in questi percorsi",
				"fr": "Collecter les polices lors de l'enregistrement dans ces chemins"
      },
      "Sammle keine Schriften, wenn in diesen Pfaden gespeichert wird": {
        "en": "Do not collect fonts when saving to these paths",
        "it": "Non raccogliere i font quando si salva in questi percorsi",
				"fr": "Ne pas collecter les polices lors de l'enregistrement dans ces chemins"
      },
      "help-text": {
				"de": "Sie können Pfade eingeben, bei denen das Skript beim Speichern des Dokuments entscheidet, ob Schriften gesammelt werden sollen oder nicht. Geben Sie jeden Pfad in eine neue Zeile ein.",
        "en": "You can enter paths where the script will decide whether to collect fonts or not when saving the document. Enter each path on a new line.",
        "it": "È possibile inserire i percorsi in cui lo script deciderà se raccogliere o meno i font durante il salvataggio del documento. Inserisci ogni percorso su una nuova riga.",
				"fr": "Vous pouvez entrer des chemins où le script décidera de collecter ou non les polices lors de l'enregistrement du document. Entrez chaque chemin sur une nouvelle ligne."
      },
			"active-or-blocking": {
				"de": "Aktive Liste oder Blockliste",
				"en": "Active list or blocklist",
				"it": "Elenco attivo o elenco di blocco",
				"fr": "Liste active ou liste de blocage"
			},
			"close": {
				"de": "Schließen",
				"en": "Close",
				"it": "Chiudi",
				"fr": "Fermer"
			},
			"Fehler beim Kopieren von ": {
				"en": "Error copying ",
				"it": "Errore durante la copia di ",
				"fr": "Erreur lors de la copie de "
			},
			"adobe-fonts": {
				"de": "Adobe Fonts, die über die Creative Cloud hinzugefügt wurden, können nicht kopiert werden",
				"en": "Adobe Fonts added via Creative Cloud cannot be copied",
				"it": "I font Adobe aggiunti tramite Creative Cloud non possono essere copiati",
				"fr": "Les polices Adobe ajoutées via Creative Cloud ne peuvent pas être copiées"
			},
			"does-not-exist": {
				"de": "Die Schriftdatei existiert nicht",
				"en": "The font file does not exist",
				"it": "Il file del font non esiste",
				"fr": "Le fichier de police n'existe pas"
			}

    }
  }
}






// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------
function init() {

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
