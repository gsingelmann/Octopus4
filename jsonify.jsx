var dbg = true;
init();

main();

function main() {
	var pref = app.extractLabel( "octopus_jsonify_path" );
	if ( pref ) {
		var base_folder = new Folder( pref );
		base_folder = base_folder.selectDlg("Bitte wählen Sie einen Ordner aus:")
	} else {
		var base_folder = Folder.selectDialog("Bitte wählen Sie einen Ordner aus:");
	}

  if (!base_folder) {
    alert("Kein Ordner ausgewählt. Vorgang abgebrochen.");
    return;
  }
	app.insertLabel( "octopus_jsonify_path", base_folder.fullName )
	var base_folder_name = base_folder.name;

	var ignore_file = new File( base_folder.fullName + "/octignore.txt" );
	var ignore_list = [];
	if ( ignore_file.exists ) {
		ignore_file.encoding = "utf-8";
		ignore_file.open("r");
		var raw = ignore_file.read();
		ignore_file.close();
		ignore_list = raw.replace(/\r/g, "\n").replace(/\n\n+/g, "\n").split("\n");
	}

	var index_file = new File(base_folder.fullName + "/index.json");
	if ( index_file.exists ) {
		index_file.encoding = "utf-8";
		index_file.open("r");
		var raw = index_file.read();
		index_file.close();
		var config = JSON.parse( raw );
		fileList = config.configs;
	} else {
		var config = {
			"project_name": "Octopus4",
			"set_name": slugify( base_folder.name ),
			"base_url": ""
		};
		var fileList = [];
	}
	var not_found = [];
	for ( var n = 0; n < fileList.length; n++ ) not_found.push( fileList[n].id );

  scanFolder(base_folder, base_folder, fileList);

	if ( not_found.length ) {
		for ( var o = 0; o < not_found.length; o++ ) {
			for ( var i = fileList.length-1; i>=0; i-- ) {
				if ( fileList[i].id == not_found[o] ) fileList.splice( i, 1 );
			}
		}
	}

	fileList.sort( function(a,b) {
		if ( a.subpath.search(/panel/i) != -1 && b.subpath.search(/panel/i) == -1 ) return -1;
		if ( a.subpath.search(/panel/i) == -1 && b.subpath.search(/panel/i) != -1 ) return 1;
		if ( a.subpath.search(/panel/i) != -1 && b.subpath.search(/panel/i) != -1 ) {
			if ( a.id < b.id ) return -1;
			if ( a.id > b.id ) return 1;
			return 0;
		}
		if ( a.subpath.search(/startup/i) != -1 && b.subpath.search(/startup/i) == -1 ) return -1;
		if ( a.subpath.search(/startup/i) == -1 && b.subpath.search(/startup/i) != -1 ) return 1;
		if ( a.subpath.search(/startup/i) != -1 && b.subpath.search(/startup/i) != -1 ) {
			if ( a.id < b.id ) return -1;
			if ( a.id > b.id ) return 1;
			return 0;
		}
		if ( a.id < b.id ) return -1;
		if ( a.id > b.id ) return 1;
		return 0;
	})

  // JSON erstellen
	config.configs = fileList;
  var jsonString = JSON.stringify(config, null, 2);

  // JSON-Datei schreiben
  if (index_file.open("w")) {
    index_file.write(jsonString);
    index_file.close();
    alert("index.json wurde erfolgreich erstellt!\n\nAnzahl Dateien: " + fileList.length);
  } else {
    alert("Fehler beim Schreiben der Datei.");
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  function getFilenameWithoutExtension(filename) {
    var lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return filename;
    return filename.substring(0, lastDot);
  }
  function getExtension(filename) {
    return filename.split(".").pop();
  }
  function isHiddenFile(filename) {
    return filename.charAt(0) === '.' || filename.charAt(0) === '~' || filename.search(/\/\./) != -1;
  }
  function getSubpath(file, rootFolder) {
    var filePath = file.parent.fsName;
    var rootPath = rootFolder.fsName;

    if (filePath === rootPath) {
      return "";
    }

    var subpath = filePath.substring(rootPath.length + 1);
    // Konvertiere Windows-Backslashes zu Forward-Slashes
    subpath = subpath.replace(/\\/g, '/');

    return subpath;
  }
	function ignore_this( filename ) {
		if ( isHiddenFile(filename) ) return true;
		for ( var n = 0; n < ignore_list.length; n++ ) {
			if ( filename.search( ignore_list[n] ) != -1 ) {
				if (dbg) $.writeln( "   IGNORE " + filename + " because of " + ignore_list[n] );
				return true;
			}
		}
		return false;
	}

  function scanFolder(folder, rootFolder, fileList) {
		if (dbg) $.writeln( "->" + folder.name )
		if ( folder.name.charAt(0) == "." ) return;
    var files = folder.getFiles();

		var now = new Date();
		var now_str = now.getFullYear() + "-" +
				( "0" + (now.getMonth() + 1)).substr(-2) + "-" +
				( "0" + now.getDate() ).substr(-2);
		
    for (var i = 0; i < files.length; i++) {
      if (files[i] instanceof Folder) {
        scanFolder(files[i], rootFolder, fileList);
      } else {
        var filename = files[i].name;
				if (dbg) $.writeln( " ... " + filename );

				// $.bp( filename.search(/jpg/) != -1);
        // Überspringe versteckte Dateien und Einträge aus octignore
        if ( ignore_this( folder.fullName.substr( base_folder.fullName.length + 1 ) + "/" +filename ) ) {
          continue;
        }

        var filenameWithoutExt = getFilenameWithoutExtension(filename);
        var ext = getExtension(filename).toLowerCase();
				var id = slugify( filenameWithoutExt );
        var ix = find_file_obj( id );
				if ( ix !== null ) {
					var aux = getSubpath( files[i], rootFolder );
					if (dbg) $.writeln( "     " + fileList[ix].subpath + " -> " + aux + " | " + fileList[ix].check + " -> " + files[i].length );
					fileList[ix].subpath = aux;
					fileList[ix].check = files[i].length;
					// fileList[ix].set = base_folder_name;
					fileList[ix].updated = now_str;
					for ( var n = not_found.length-1; n >= 0; n-- ) {
						if ( not_found[n] == id ) {
							if (dbg) $.writeln( "      rm " + not_found[n] + " from nf");
							not_found.splice(n,1);
						}
					}
				} else {
					if ( ext.substr(0,3) == "jsx" ) {
						var sp = getSubpath(files[i], rootFolder);
						// Startups nicht ins Menü
						var mn = (sp.search(/startup/i) == -1 && ext != "jsxinc") ? "Octopus" : "";
						fileObj = {
							id: id,
							filename: filename,
							subpath: sp,
							label: { de: filenameWithoutExt, en: filenameWithoutExt },
							help_url: "https://www.project-octopus.net/",
							menu: mn,
							submenu: "",
							after_item: "",
							order: 100,
							check: files[i].length,
							updated: now_str,
						};
					} else {
						fileObj = {
							id: id,
							filename: filename,
							subpath: getSubpath(files[i], rootFolder),
							check: files[i].length,
							updated: now_str,
						};
					}
					fileList.push(fileObj);
				}	// schon drin
      }		// File oder Folder
    }			// File-Loop

		function find_file_obj( id ) {
			for ( var n = 0; n < fileList.length; n++ ) {
				if ( fileList[n].id == id ) {
					return n;
				}
			}
			return null;
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
