if ( ! confirm( localize({
  "de": "Script ausführen?\nDieses Script deinstalliert Version 1 von Projekt Octopus und installiert stattdessen Version 2",
  "en": "Really execute script?\nThis script uninstalls Octopus v1 and then installs version 2."
}), true)) {
  exit();
}

var msg = [];
msg = msg.concat( uninstall_v1() );
msg = msg.concat( install() );

if ( msg.length ) {
  alert( localize({"de": "Es sind Probleme aufgetreten:\n%1", "en": "Problems: \n%1"}, msg.join("\n")) );
} else {
  alert(localize({
    "de": "Octopus-Installer V2 wurde installiert.\nNach dem nächsten InDesign-Neustart sollte alles (wieder) da sein.",
    "en": "Octopus-Installer V2 has been installed\nEverything should be in order after restarting InDesign."
  }) );
}

function uninstall_v1() {
  var msg = []
  var spaths = get_paths_to_script_folder();
  var elter = Folder( spaths.panel ).parent;

  var src_panel = new Folder(spaths.panel + "/octopus" );
  var tgt_panel = new Folder(spaths.panel + " Off/octopus");
  var src_startup = new Folder(elter.fullName + "/Startup Scripts/octopus");
  var tgt_startup = new Folder(elter.fullName + "/Startup Scripts Off/octopus");

  if ( src_panel.exists ) {
    try {
      folder_move( src_panel, tgt_panel, false, 0)
    } catch(e) {
      msg.push("\nFehler beim Entfernen der Scriptpanel-Scripte")
      msg = msg.concat( e.message.split("\n") );
    }
  }
  if ( src_startup.exists ) {
    try {
      folder_move( src_startup, tgt_startup, false, 0)
    } catch(e) {
      msg.push("\nFehler bei Entfernen der Startup-Scripte:")
      msg = msg.concat( e.message.split("\n") );
    }
  }

  // -----------------------------------------------------------------------------------------
  //  Preferences kopieren  
  // -----------------------------------------------------------------------------------------
  var ud = unescape(Folder.userData.fullName);
  var src1 = new Folder(ud + "/cs_octopus");
  var src2 = new Folder(ud + "/cs_octopus_" + app.version.split(".").shift() );
  var tgt1 = new Folder(ud + "/octopus");
  var tgt2 = new Folder(ud + "/octopus_" + app.version.split(".").shift() );
  if ( src1.exists && tgt1.exists == false ) {
    try {
      folder_move( src1, tgt1, true, 0)
    } catch(e) {
      msg.push("\n" + localize({"de": "Fehler beim Kopieren der Preferences:", "en": "Error copying Octopus-preferences:"}) );
      msg = msg.concat( e.message.split("\n") );
    }
  }
  if ( src2.exists && tgt2.exists == false ) {
    try {
      folder_move( src2, tgt2, true, 0)
    } catch(e) {
      msg.push("\n" + localize({"de": "Fehler beim Kopieren der Preferences:", "en": "Error copying Octopus-preferences:"}))
      msg = msg.concat( e.message.split("\n") );
    }
  }
  return msg;
}
function install() {
  var msg = []
  var spaths = get_paths_to_script_folder();
  var octopath = get_config_path("scripts");

  ensure_path_exists("octopus", spaths.startup, true)
  ensure_path_exists("octopus/My-Scripts", spaths.panel, true)

  download_and_copy( 
    "Installer",
    "https://daten.project-octopus.net/Octopus/Octopus-Installer.jsx",
    octopath + "/Octopus-Installer.jsx",
    File( spaths.startup + "/octopus/Octopus-Installer.jsx" )
  )
  download_and_copy( 
    "Includes",
    "https://daten.project-octopus.net/Octopus/Octopus-include.jsxinc",
    octopath + "/Octopus-include.jsxinc",
    [File( spaths.startup + "/octopus/Octopus-include.jsxinc" ), File( spaths.panel + "/octopus/Octopus-include.jsxinc" )]
  )
  download_and_copy( 
    "CleanContentTypes.jsx",
    "https://daten.project-octopus.net/Octopus/CleanContentTypes.jsx",
    octopath + "/CleanContentTypes.jsx",
    [File( spaths.panel + "/octopus/CleanContentTypes.jsx" )]
  )
  download_and_copy( 
    "Color-Script.jsx",
    "https://daten.project-octopus.net/Octopus/Color-Script.jsx",
    octopath + "/Color-Script.jsx",
    [File( spaths.panel + "/octopus/Color-Script.jsx" )]
  )
  download_and_copy( 
    "Dashboard.jsx",
    "https://daten.project-octopus.net/Octopus/Dashboard.jsx",
    octopath + "/Dashboard.jsx",
    [File( spaths.panel + "/octopus/Dashboard.jsx" )]
  )
  download_and_copy( 
    "Display-Config.jsx",
    "https://daten.project-octopus.net/Octopus/Display-Config.jsx",
    octopath + "/Display-Config.jsx",
    [File( spaths.panel + "/octopus/Display-Config.jsx" )]
  )
  download_and_copy( 
    "Display.jsx",
    "https://daten.project-octopus.net/Octopus/Display.jsx",
    octopath + "/Display.jsx",
    [File( spaths.panel + "/octopus/Display.jsx" )]
  )
  download_and_copy( 
    "Fontinstaller.jsx",
    "https://daten.project-octopus.net/Octopus/Fontinstaller.jsx",
    octopath + "/Fontinstaller.jsx",
    [File( spaths.panel + "/octopus/Fontinstaller.jsx" )]
  )
  download_and_copy( 
    "InDesign-Help.jsx",
    "https://daten.project-octopus.net/Octopus/InDesign-Help.jsx",
    octopath + "/InDesign-Help.jsx",
    [File( spaths.panel + "/octopus/InDesign-Help.jsx" )]
  )
  download_and_copy( 
    "OctoLock.jsx",
    "https://daten.project-octopus.net/Octopus/OctoLock.jsx",
    octopath + "/OctoLock.jsx",
    [File( spaths.panel + "/octopus/OctoLock.jsx" )]
  )
  download_and_copy( 
    "OctoLock-Daemon.jsx",
    "https://daten.project-octopus.net/Octopus/OctoLock-Daemon.jsx",
    octopath + "/OctoLock-Daemon.jsx",
    [File( spaths.startup + "/octopus/OctoLock-Daemon.jsx" )]
  )
  download_and_copy( 
    "OpenType-Features.jsx",
    "https://daten.project-octopus.net/Octopus/OpenType-Features.jsx",
    octopath + "/OpenType-Features.jsx",
    [File( spaths.panel + "/octopus/OpenType-Features.jsx" )]
  )
  download_and_copy( 
    "Setup-Baselinegrid.jsx",
    "https://daten.project-octopus.net/Octopus/Setup-Baselinegrid.jsx",
    octopath + "/Setup-Baselinegrid.jsx",
    [File( spaths.panel + "/octopus/Setup-Baselinegrid.jsx" )]
  )
  download_and_copy( 
    "Show-Overflow.jsx",
    "https://daten.project-octopus.net/Octopus/Show-Overflow.jsx",
    octopath + "/Show-Overflow.jsx",
    [File( spaths.panel + "/octopus/Show-Overflow.jsx" )]
  )
  download_and_copy( 
    "Watermark.jsx",
    "https://daten.project-octopus.net/Octopus/Watermark.jsx",
    octopath + "/Watermark.jsx",
    [File( spaths.panel + "/octopus/Watermark.jsx" )]
  )

  return msg;

  function download_and_copy( name, url, temp_path, tgt ) {
    try {
      var temp = call_request( url, "file", temp_path, true);
    
      var aux = tgt.constructor.name;
      if ( tgt.constructor.name !== "Array" ) {
        tgt = [ tgt ]
      };
      for ( var n = 0; n < tgt.length; n++ ) {
        if ( ! temp.copy( tgt[n] ) ) {
          msg.push( localize({"de": "Problem beim Kopieren von %1 in den InDesign-Ordner", "en": "Problem copying %1 into InDesign-fodler"}, name))
        }
      }
    } catch(e) {
      msg.push( localize({"de": "Fehler beim Download von %1: %2", "en": "Problem downloading %1: %2" }, name, e.message ) );
    }
  }
}









function folder_move( src, tgt, do_copy, depth ) {
  var log = [], errors = [];
  if (typeof src == "string") src = new Folder( src );
  if ( ! src.exists ) throw new Error( "Quelle existiert nicht");
  if (typeof tgt == "string") tgt = new Folder( tgt );
  if ( ! tgt.exists ) tgt.create();
  var dirs = src.getFiles( function(f) { return (f.constructor.name == "Folder" && f.name.charAt(0) != ".")} );
  for ( var n = dirs.length-1; n >=0; n-- ) {
    log = log.concat( folder_move( dirs[n], tgt.fullName + "/" + dirs[n].name, do_copy, depth+1 ) );
  }
  var files = src.getFiles( function(f) { return (f.constructor.name == "File" && f.name.charAt(0) != ".")} );
  for ( var n = files.length-1; n >=0; n-- ) {
    if ( files[n].copy( tgt.fullName + "/" + files[n].name) ) {
      log.push( files[n].fullName );
      if ( ! do_copy ) {
        try {
          files[n].remove();
        } catch(e) {
          errors.push( files[n].fullName );
        }
      } 
    }
  }
  if ( ! do_copy ) {
    try {
      src.remove();
    } catch(e) {
      errors.push( files[n].fullName );
    }
  }
  if ( errors.length ) {
    throw new Error("Nicht korrekt kopiert/gelöscht:\n" + errors.join("\n"));
  }
  return log.join("\n");
}




function get_config_path( subfolder ) {
	if ( ! subfolder ) {
		subfolder = [];
	} else if (typeof subfolder == "string" ) {
		subfolder = subfolder.split("/");
	}
  subfolder.unshift("octopus");
  var base = unescape(Folder.userData.fullName)
  return ensure_path_exists( subfolder.join("/"), base, true );
}
function get_appconfig_path() {
  var base = ensure_path_exists( "octopus_" + app.version.split(".").shift(), Folder.userData.fullName, true )
	return unescape( base );
}
function ensure_path_exists( path, base_path, is_folder ) {
  if ( path.constructor.name == "File" ) path = path.fullName;
  if ( path.constructor.name == "Folder" ) path = path.fullName;
  path = unescape( path );
  path = path.replace(/^\//, "");
  var bits = path.split("/");

  // Wenn kein base_path angegeben ist, gehe ich davon aus, dass der Pfad mit "/volumes/MacHD" oder "C:/..." anfängt
  if ( base_path ) {
    base_path = unescape(base_path);
  } else {
    base_path = [];
    base_path.push( bits.shift() );
    base_path.push( bits.shift() );
    base_path = base_path.join("/");
  }
  var nbits = is_folder ? bits.length : bits.length-1
  // Das letzte bit ist der Dateiname
  for ( var n = 0; n < nbits; n++ ) {
    if ( ! Folder( base_path + "/" + bits[n] ).exists ) Folder( base_path + "/" + bits[n] ).create();
    base_path += "/" + bits[n];
  }
  return base_path ;
}
function get_paths_to_script_folder() {
  var panel_folder = app.scriptPreferences.scriptsFolder
  var startup_folder_path = panel_folder.parent.fullName + "/Startup Scripts";
  var startup_folder = new Folder(startup_folder_path);
  if (!startup_folder.exists) startup_folder.create();

  return {
    "panel": panel_folder.fullName,
    "startup": startup_folder_path
  }
}



function call_request( url, type, tgt_path, overwrite ) {
  if (typeof JSON !== "object") {
    init();
  }
  if ( ! type ) type = "data";

  var request = {
    url: url,
    command: "", // defaults to ""
    port: "", // defaults to ""
    method: "GET",
  }

  if (type == "data") {
    var response = restix.fetch(request);
    if (response.error) throw new Error(response.error + "\n" + response.errorMsg);

    if ( tgt_path && (overwrite || !File(tgt_path).exists) ) {
      var f = new File( tgt_path );
      f.encoding = "UTF-8";
      f.open("w");
      f.write( response.body );
      f.close();
    }
    return response.body;

  } else {
    if ( ! tgt_path ) tgt_path = Folder.desktop.fullName + "/_tempdatei.txt";

    if (overwrite || !File(tgt_path).exists) {
      var temp = new File(tgt_path);
      var response = restix.fetchFile(request, temp);
      if (response.error) throw new Error(response.error + "\n" + response.errorMsg);
      if (response.httpStatus == 404) throw new Error( localize({"de": "Datei existiert nicht auf Server", "en": "File not present on server"}) );
      return temp;
    }
  }
}

// -------------------



// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
//  JSON und RESTIX
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
function init() {
  // ------------------------------------------------------------------------------------------------
  // Globale base64 Variablen
  // ------------------------------------------------------------------------------------------------
  END_OF_INPUT = -1;

  base64Chars = new Array(
    'A','B','C','D','E','F','G','H',
    'I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X',
    'Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n',
    'o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3',
    '4','5','6','7','8','9','+','/'
  );

  reverseBase64Chars = new Array();
  for (var i=0; i < base64Chars.length; i++){
    reverseBase64Chars[base64Chars[i]] = i;
  }


  // ------------------------------------------------------------------------------------------------
  // JSON
  // ------------------------------------------------------------------------------------------------
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
  


  // ------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------
  // HTTP
  // ------------------------------------------------------------------------------------------------

	/****************
	# Connect InDesign to the web
	* HTTPS supported 
	* Works form CS4 to CC 2018 (ExtendScript based library)
	* Based on VBScript/ServerXMLHTTP (Win) AppleScript/curl (Mac) relies on app.doScript()

	## Getting started
	See examples/connect.jsx

	* @Version: 1.2
	* @Date: 2019-02-20
	* @Author: Gregor Fellenz, http://www.publishingx.de
	* Acknowledgments: 
	** Library design pattern from Marc Aturet https://forums.adobe.com/thread/1111415
	*/

	$.global.hasOwnProperty('restix') || (function (HOST, SELF) {
		HOST[SELF] = SELF;

		/****************
		* PRIVATE
		*/
		var INNER = {};
		INNER.version = "2019-02-20-1.2";


		/** Returns if the operating system is windows 
		* @return {String} true | false
		*/
		INNER.isWindows = function () {
			return ($.os.indexOf("Windows") > -1);
		}

		/** Check the request information object and construct a full URL
		* @param {request} Request information object
		* @returns{request} Request information object or throws an error
		*/
		INNER.checkRequest = function (request) {
			if (request.url == undefined || request.url == "") throw Error("No property [url] found/set");
			if (request.url.toString().slice(-1) == "/") request.url = request.url.toString().slice(0, -1);

			if (request.command == undefined) request.command = "";
			if (request.command.toString()[0] == "/") request.command = request.command.toString().substr(1);

			if (request.port == undefined) request.port = "";
			if (isNaN(request.port)) throw Error("[port] is Not a Number");

			// Add port
			if (request.port != "") {
				request.fullURL = request.url + ":" + request.port;
			}
			else {
				request.fullURL = request.url;
			}

			// Add command 
			if (request.command != "") {
				request.fullURL = request.fullURL + "/" + request.command;
			}


			if (request.method == undefined || request.method == "") request.method = "GET";
			if (!(request.method == "GET" || request.method == "POST" || request.method == "PUT" || request.method == "PATCH" || request.method == "DELETE")) throw Error("Method " + request.method + " is not supported");  // Missing HEAD 

			if (request.method == "POST" && (request.binaryFilePath == undefined || request.binaryFilePath == "")) request.binaryFilePath = false;

			if (request.headers == undefined) request.headers = [];
			if (!(request.headers instanceof Array)) throw Error("Provide [headers] as Array of {name:'',value''} objects");
			if (request.body == undefined || request.body == "") request.body = false;

			if (request.body && request.binaryFilePath) throw Error("You must not provide [body] and [binaryFilePath]");

			request.unsafe = false;

			if (request.proxy == undefined) request.proxy = false;

			return request;
		}

		/** The main connection function. Need to be slashed
		* @return {response} Response result object 
		*/
		INNER.processRequest = function (request, outFile) {
			var response = {
				error: false,
				errorMsg: "",
				body: "",
				httpStatus: 900
			};

			var scriptCommands = [];
			var systemCmd = "";
			var result = "";

			if (INNER.isWindows()) {
				// Since Win10 Update Feb 2019 msxml3 does not work anymore...
				scriptCommands.push('Dim xHttp : Set xHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")');
				// Konstanten für ADODB.Stream
				scriptCommands.push('Const adTypeBinary = 1');
				scriptCommands.push('Const adSaveCreateOverWrite = 2');
				scriptCommands.push('Const adModeReadWrite = 3');

				scriptCommands.push('Dim res');
				scriptCommands.push('On Error Resume Next');
				scriptCommands.push('xHttp.Open "' + request.method + '", "' + request.fullURL + '", False');

				if (request.proxy != false) {
					// xHttp.SetProxy 1
					scriptCommands.push('xHttp.setProxy 2, "' + request.proxy + '"');
				}

				for (var i = 0; i < request.headers.length; i++) {
					scriptCommands.push('xHttp.setRequestHeader "' + request.headers[i].name + '","' + request.headers[i].value + '"');
				}
				if (request.unsafe) {
					//~ ' 2 stands for SXH_OPTION_IGNORE_SERVER_SSL_CERT_ERROR_FLAGS
					//~ ' 13056 means ignore all server side cert error
					scriptCommands.push('xHttp.setOption 2, 13056');
				}

				if (request.body) {
					scriptCommands.push('xHttp.Send "' + request.body.replace(/"/g, '""').replace(/\n|\r/g, '') + '"');
				}
				else if (request.method == "POST" && request.binaryFilePath) {
					// http://www.vbforums.com/showthread.php?418570-RESOLVED-HTTP-POST-a-zip-file
					scriptCommands.push('    Dim sFile');
					scriptCommands.push('    sFile = "' + request.binaryFilePath + '"');


					scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
					scriptCommands.push('    objStream.Type = adTypeBinary');
					scriptCommands.push('    objStream.Mode = adModeReadWrite');
					scriptCommands.push('    objStream.Open');
					scriptCommands.push('    objStream.LoadFromFile(sFile)');

					scriptCommands.push('    xHttp.SetRequestHeader "Content-Length", objStream.Size');
					scriptCommands.push('    xHttp.Send objStream.Read(objStream.Size)');
					scriptCommands.push('    Set objStream= Nothing');
				}
				else {
					scriptCommands.push('xHttp.Send');
				}
				
				scriptCommands.push('If err.Number = 0 Then');

				if (outFile) {
					scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
					scriptCommands.push('    objStream.Type = adTypeBinary');
					scriptCommands.push('    objStream.Mode = adModeReadWrite');
					scriptCommands.push('    objStream.Open');
					scriptCommands.push('    objStream.Write xHttp.responseBody');
					scriptCommands.push('    objStream.SaveToFile "' + outFile.fsName + '" , adSaveCreateOverWrite');
					scriptCommands.push('    objStream.Close');
					scriptCommands.push('    Set objStream= Nothing');
					/*	
						ADODB.Stream let's you also save text data and let's you specify charset (codepage) for text-to-binary data conversion (against of Scripting.TextStream object). 
						Const adTypeText = 2
						Const adSaveCreateOverWrite = 2
						
						'Create Stream object
						Dim BinaryStream
						Set BinaryStream = CreateObject("ADODB.Stream")
						
						'Specify stream type - we want To save text/string data.
						BinaryStream.Type = adTypeText
						
						'Specify charset For the source text (unicode) data.
						If Len(CharSet) > 0 Then
							BinaryStream.CharSet = CharSet
						End If
						
						'Open the stream And write binary data To the object
						BinaryStream.Open
						BinaryStream.WriteText Text
						
						'Save binary data To disk
						BinaryStream.SaveToFile FileName, adSaveCreateOverWrite
					End Function
						*/
					scriptCommands.push('	res = "outFile" & vbCr & "------http_code" &  xHttp.status');
				}
				else {
					// ' give respones
					scriptCommands.push('	res = xHttp.responseText  &  vbCr & "------http_code" &  xHttp.status');
				}

				scriptCommands.push('Else');
				scriptCommands.push('	res =  "xHttpError "  & Err.Description &  " " & Err.Number');
				scriptCommands.push('End If');

				scriptCommands.push('Set xHttp = Nothing');
				scriptCommands.push('returnValue = res');

				scriptCommands = scriptCommands.join("\r\n");

				try {
					result = app.doScript(scriptCommands, ScriptLanguage.VISUAL_BASIC);
				}
				catch (e) {
					result = "doScriptError: " + e.message;
          if ( e.message.toLowerCase().indexOf("type library") != -1 ) {
            var _add = localize( {
              "de": "Probleme mit der Type Library nach einem InDesign-Update lassen sich mitunter beheben, indem InDesign einmal mit Administratorrechten gestartet wird.\nKlicke im Explorer mit der rechten Maustaste auf die EXE und wählen 'Als Administrator starten'",
              "en": "Type Library problems occasionally occur after an InDesign update.\nThis may be fixed by starting InDesign once with administrator right.\nRight-click on the EXE and choose 'Run as administrator'"
            })
            result += _add;
          }
				}

			}
			else { // Mac
				// -L follow redirects 
				var curlString = 'curl --silent --show-error -g -L ';
				for (var i = 0; i < request.headers.length; i++) {
					curlString += (' -H \'' + request.headers[i].name + ': ' + request.headers[i].value + '\'');
				}
				if (request.unsafe) {
					// Es gab einen Fall wo am Mac mit -k es nicht funktioniert hat curl: (35) Server aborted the SSL handshake
					curlString += ' -k ';
				}

				if (request.proxy != false) {
					curlString += ' --proxy ' + request.proxy
				}

				curlString += ' -X ' + request.method;
				if (request.body) {
					curlString += ' -d \'' + request.body.replace(/"/g, '\\"').replace(/\n|\r/g, '') + '\'';
				}
				else if (request.method == "POST" && request.binaryFilePath) {
					curlString += ' --data-binary \'@' + request.binaryFilePath + '\'';
				}

				if (outFile) {
					curlString += ' -w \'outFile\n------http_code%{http_code}\'';
					curlString += ' -o \'' + outFile.fsName + '\''
				}
				else {
					curlString += ' -w \'\n------http_code%{http_code}\'';
				}
				curlString += ' \'' + request.fullURL + '\'';
				//~ 			$.writeln(curlString);
				try {
					result = app.doScript('do shell script "' + curlString + '"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
				}
				catch (e) {
					result = "doScriptError: " + e.message;
				}
			}

			// Fill response 
			if (typeof result == 'undefined') {
				throw Error("No result value. Probably System Script could not run?");
			}
			if (result.match(/^xHttpError|^curl: \(\d+\)|^doScriptError:/)) {
				response.error = true;
				response.errorMsg = result;
			}
			else {
				var resArray = result.split("\r------http_code");
				if (resArray.length == 2) {
					response.httpStatus = resArray[1] * 1;
					response.body = resArray[0];
				}
				else {
					throw Error("Wrong result value: [" + result + "]");
				}
			}

			return response;
		}


		/****************
			* API 
			*/
		/** Process an HTTP Request 
		* @param {request} Request object with connection Information
		* @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
		*/
		SELF.fetch = function (request) {
			request = INNER.checkRequest(request);
			return INNER.processRequest(request, false);
		}

		/** Process an HTTP Request and writes the result to a give File
		* @param {request} Request Object with connection Information
		* @param {outFile} File to write to
		* @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
		*/
		SELF.fetchFile = function (request, outFile) {
			if (outFile == undefined) throw Error("No file provided");
			if (outFile instanceof String) outFile = File(outFile);

			request = INNER.checkRequest(request);
			var response = INNER.processRequest(request, outFile);
			if (!outFile.exists) {
				response.error = true;
				response.errorMsg = "File was not created\n" + response.errorMsg;
			}
			return response;
		}



	})($.global, { toString: function () { return 'restix'; } });



  // ------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------
  // MD5
  // ------------------------------------------------------------------------------------------------
  md5 = function(s) {
    function md5cycle(x, k) {
      var a = x[0],
        b = x[1],
        c = x[2],
        d = x[3];

      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22, 1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);

    }

    function cmn(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s) {
      txt = '';
      var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878],
        i;
      for (i = 64; i <= s.length; i += 64) {
        md5cycle(state, md5blk(s.substring(i - 64, i)));
      }
      s = s.substring(i - 64);
      var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i = 0; i < s.length; i++)
        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
      tail[i >> 2] |= 0x80 << ((i % 4) << 3);
      if (i > 55) {
        md5cycle(state, tail);
        for (i = 0; i < 16; i++) tail[i] = 0;
      }
      tail[14] = n * 8;
      md5cycle(state, tail);
      return state;
    }

    /* there needs to be support for Unicode here,
    * unless we pretend that we can redefine the MD-5
    * algorithm for multi-byte characters (perhaps
    * by adding every four 16-bit characters and
    * shortening the sum to 32 bits). Otherwise
    * I suggest performing MD-5 as if every character
    * was two bytes--e.g., 0040 0025 = @%--but then
    * how will an ordinary MD-5 sum be matched?
    * There is no way to standardize text to something
    * like UTF-8 before transformation; speed cost is
    * utterly prohibitive. The JavaScript standard
    * itself needs to look at this: it should start
    * providing access to strings as preformed UTF-8
    * 8-bit unsigned value arrays.
    */
    function md5blk(s) { /* I figured global was faster.   */
      var md5blks = [],
        i; /* Andy King said do it this way. */
      for (i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = s.charCodeAt(i) +
          (s.charCodeAt(i + 1) << 8) +
          (s.charCodeAt(i + 2) << 16) +
          (s.charCodeAt(i + 3) << 24);
      }
      return md5blks;
    }

    var hex_chr = '0123456789abcdef'.split('');

    function rhex(n) {
      var s = '',
        j = 0;
      for (; j < 4; j++)
        s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
        hex_chr[(n >> (j * 8)) & 0x0F];
      return s;
    }

    function hex(x) {
      for (var i = 0; i < x.length; i++)
        x[i] = rhex(x[i]);
      return x.join('');
    }

    function add32(a, b) {
      return (a + b) & 0xFFFFFFFF;
    }

    return hex(md51(s));

  }
}
