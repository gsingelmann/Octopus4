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
__init();
var script_id = "octolock"; 
__log( "run", script_id, script_id);
octolock_config();

function octolock_config() {
  var f_prefs = PATH_DATA_FOLDER + "/prefs/octolock.txt";
  var prefs = __readFile( f_prefs );
  prefs = (prefs && prefs.length) ? prefs.split("\n") : [];

  var w = new Window('dialog' );
  w.script_id = script_id;
  w.orientation = 'column';
  w.alignChildren = ['fill', 'fill'];

  __insert_head( w, script_id );

  w.pnl = w.add("group {orientation: 'column', alignChildren: ['fill', 'fill']} ");
  w.btns = w.add("group {orientation: 'row', alignChildren: ['center', 'top']}");
  // w.footer = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');
  // w.footer.add('statictext', undefined, __get_script_version(w.script_id) );
  
  w.namerow = w.pnl.add("group {orientation: 'row', alignChildren: ['left', 'fill']}")
  w.namerow.add("statictext", undefined, __('username'));
  w.username = w.namerow.add("edittext", [undefined, undefined, 300, 20], app.extractLabel("octolock_user"));
  w.pnl.add("statictext", undefined, __('open_head'))
  w.olist = w.pnl.add("listbox");
  w.pnl.add("statictext", undefined, __('locked_dirs'))
  w.list = w.pnl.add("listbox");
  w.pnlbtns = w.pnl.add("group {orientation: 'row', alignChildren: ['center', 'top']}")
  w.addbtn = w.pnlbtns.add("button", undefined, __("add_dir"));
  w.rmbtn = w.pnlbtns.add("button {text: '" + __("rm_dir") + "', enabled: false}");
  w.cancelElement = w.btns.add("button", undefined, __('cancel'));
  w.defaultElement = w.btns.add("button", undefined, "OK");

  // ----------------------------------------------------
  // Liste der gemerkten octolock-Dateien
  // ----------------------------------------------------
  w.olist.preferredSize.height = 120;
  w.olist.alignment = "fill";
  fill_ofile_list( w.olist );
  w.olist.onChange = function() {
    if( this.selection ) {
      var path = this.selection.text.split("\t");
      var file = new File( path[0] );
      file.parent.execute();
    }
  }
  
  // ----------------------------------------------------
  //  Liste der geschützten Pfade
  // ----------------------------------------------------
  w.list.preferredSize.height = 180;
  w.list.alignment = "fill";
  for ( var n = 0; n < prefs.length; n++ ) {
    var aux = w.list.add("item", prefs[n] );
  }
  w.list.onChange = function() {
    if ( this.selection ) {
      this.window.rmbtn.enabled = true;
    } else {
      this.window.rmbtn.enabled = false;
    }
  }

  w.addbtn.onClick = function() {
    var f = Folder.selectDialog(__('which_dir'));
    if ( ! f ) return;
    this.window.list.add("item", f.fullName.toString() );
  }
  w.rmbtn.onClick = function() {
    if ( this.window.list.selection) {
      this.window.list.remove( this.window.list.selection );
      this.enabled = false;
    }
  }


  
  if ( w.show() == 1 ) {
    app.insertLabel("octolock_user", w.username.text );
    var rs = [];
    for ( var n = 0; n < w.list.items.length; n++ ) {
      rs.push( w.list.items[n].text )
    }
    __writeFile( f_prefs, rs.join("\n") );
  } else {
    
  }


  function fill_ofile_list( box ) {
    var logpath = PATH_DATA_FOLDER + "/octolock-logs/" + app.version.split(".").shift() + ".txt";
    var aux = __readFile( logpath );
    aux = split_log( aux );
    for ( var n = 0; n < aux.length; n++ ) {
      //// $.writeln( File.decode(aux[n][0]) + " -- " + aux[n][0])
      var since = "?";
      var d = __parse_now_string( aux[n][1] );
      if (d) {
        var now = new Date();
        //// $.writeln( aux[n][1] + " -> " + d.toString() + " ≈ " + now.toString() );
        now = now.getTime();
        d = d.getTime();
        
        since = now - d;
        since = Math.ceil( since / (60 * 1000) )
      }
      box.add("item", File.decode(aux[n][0]) + "\t(seit " + since + " min)");
    }
  

    function split_log( log ) {
      if ( ! log ) return [];
      if ( typeof log != "string" ) throw new Error(__('no_string',  log.constructor.name ) );
      if ( log == "" ) return [];
      log = log.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n\n+/g, "\n");
      log = log.split("\n");
      for (var n = 0; n < log.length; n++ ) {
        log[n] = log[n].split("\t");
      }
      return log;
    }    
  }
  function __parse_now_string(s) {
    try {
      var d = new Date(
        Number( s.substr(0,4) ),
        Number( s.substr(4,2) )-1,
        Number( s.substr(5,2) ),
        Number( s.substr(8,2) ),
        Number( s.substr(10,2) ),
        Number( s.substr(12,2) ),
      )
      return d;
    } catch(e) {
      return null;
    }
  }
}

function __( id ) {
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