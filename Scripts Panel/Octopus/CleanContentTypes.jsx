/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Checks all frames if their content-types are correct

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-11-02

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
#targetengine octopus_framecleaner
#include "Startup Scripts/Octopus/Include.jsxinc"
__init();
var script_id = "cleancontenttypes";
__log( "run", script_id, script_id );

var dbg = false;

if ( app.documents.length ) {
  var doc = app.activeDocument;
  var screenMode = doc.layoutWindows[0].screenMode,
      showFrameEdges = doc.viewPreferences.showFrameEdges,
      baselineGridShown = doc.gridPreferences.baselineGridShown,
      documentGridShown = doc.gridPreferences.documentGridShown,
      guidesShown = doc.guidePreferences.guidesShown;

  doc.layoutWindows[0].screenMode = ScreenModeOptions.PREVIEW_OFF;
  doc.viewPreferences.showFrameEdges = true;
  doc.gridPreferences.baselineGridShown = false;
  doc.gridPreferences.documentGridShown = false;
  doc.guidePreferences.guidesShown = false;

  //app.doScript( cleanup_frames, undefined, undefined, UndoModes.ENTIRE_SCRIPT, __("scriptname"))
  cleanup_frames();
}

function cleanup_frames() {
  // ---------------------------------------------------------------------------------
  // Das Sammeln dauert ggf etwas
  var pbw = new Window("palette");
  pbw.msg = pbw.add("statictext", [undefined, undefined, 400, 20], "");
  pbw.pb = pbw.add("progressbar", [undefined, undefined, 400, 20]);
  pbw.show();

  // ---------------------------------------------------------------------------------
  // Sammeln
  var doc = app.activeDocument;
  var items = get_all_items( doc, 0 )
  pbw.msg.text = "Rahmen inspizieren"
  pbw.pb.maxvalue = items.length;
  var these = [];
  var next_item = -1;
  // for ( var n = items.length-1; n >= 0; n-- ) {
  for ( var n = 0; n < items.length; n++ ) {
    pbw.pb.value = n;
    var i = items[n];
    if ( ! i.hasOwnProperty("contentType") ) continue;
    if ( i.contentType == ContentType.GRAPHIC_TYPE && i.pageItems.length == 0 ) {
      these.push( i );
    } else if ( i.contentType == ContentType.TEXT_TYPE && i.parentStory.characters.length == 0 ) {
      these.push( i );
    }
  }
  pbw.close();

  // ---------------------------------------------------------------------------------
  // Nix zu tun
  if ( ! these || these.length == 0 ) {
    __alert( "warnung", __('none_found'), "", "OK")
    return;
  }


  var w = new Window( "palette" );
	w.script_id = script_id
  __insert_head( w, script_id );

  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_clearcontenttypes", JSON.stringify( w.location ));
  }

  w.row = w.add("group {orienation: 'row', alignChildren: ['fill', 'fill']}")
  w.alle_row = w.add("group {orienation: 'row', alignChildren: ['fill', 'fill']}")

  w.defaultElement = w.row.add("button", undefined, __("convert"));
  w.weg = w.row.add("button", undefined, __("remove"));
  w.nix = w.row.add("button", undefined, __("ignore"));
  w.all = w.row.add("button", undefined, __("all"));
  w.cancelElement = w.row.add("button", undefined, __("cancel"));

  w.defaultElement.onClick = function() {
    app.selection[0].contentType = ContentType.UNASSIGNED;
    this.window.hide();
    handle_next();
  }
  w.weg.onClick = function() {
    app.selection[0].remove();
    this.window.hide();
    handle_next();
  }
  w.nix.onClick = function() {
    this.window.hide();
    handle_next();
  }
  w.cancelElement.onClick = function() {
    this.window.close();
    exit();
  }
  w.convert_all = false;
  w.all.onClick = function() {
    next_item--;
    app.activeDocument.layoutWindows[0].zoomPercentage = 10;
    this.window.convert_all = true;
    this.window.close();

    handle_next();
  }
  w.onClose = function() {
    doc.layoutWindows[0].screenMode = screenMode;
    doc.viewPreferences.showFrameEdges = showFrameEdges;
    doc.gridPreferences.baselineGridShown = baselineGridShown;
    doc.gridPreferences.documentGridShown = documentGridShown;
    doc.guidePreferences.guidesShown = guidesShown;
  }


  handle_next();

  function handle_next() {
    next_item++;
    if ( next_item >= these.length ) {
      doc.layoutWindows[0].zoom( ZoomOptions.FIT_SPREAD );
      exit();
    }
    var item = these[ next_item ];
    var p = item;
    while( p.hasOwnProperty("locked") && p.locked ) {
      try {
        p.locked = false;
      } catch(e) {
      } finally {
        p = p.parent;
      }
    }
    app.select( item );
    
    if ( w.convert_all ) {
      app.selection[0].contentType = ContentType.UNASSIGNED;
      handle_next();
    } else {
      
      _fit_menu_action = app.menuActions.item( "$ID/Fit Selection in Window" );
      _fit_menu_action.invoke();
      // app.activeDocument.layoutWindows[0].zoomPercentage = Math.round( 100 + (Math.random() * 10) - 5 );
      w.show();
      var aux = app.extractLabel( "octopus_panelpos_clearcontenttypes" );
      try {
        aux = JSON.parse( aux );
        __move_scriptui_to( w, aux.x, aux.y );
      } catch(e) {
      }
    
    }
  }

  function get_all_items( item, depth ) {
    var items = [];
    var doc_items = item.pageItems.everyItem().getElements();
    var group_items, sub_items, nest_items;
    var doc_item, group_item, sub_item, nest_item;
    pbw.msg.text = doc_items.length + " Rahmen im Dokument"
    pbw.pb.maxvalue = doc_items.length;


    for ( var nd = 0; nd < doc_items.length; nd++ ) {
      doc_item = doc_items[nd];
      // $.writeln( nd + ": " + doc_item.constructor.name );
      if ( doc_item.hasOwnProperty("pageItems") && doc_item.pageItems.length ) {
        group_items = doc_item.pageItems.everyItem().getElements();
        for ( var ng = 0; ng < group_items.length; ng++ ) {
          group_item = group_items[ng];
          // $.writeln( ".  " + ng + ": " + group_item.constructor.name );
          if ( group_item.hasOwnProperty("pageItems") && group_item.pageItems.length ) {
            sub_items = group_item.pageItems.everyItem().getElements();
            for ( var ns = 0; ns < sub_items.length; ns++ ) {
              sub_item = sub_items[ns];
              // $.writeln( ".  .  " + ns + ": " + sub_item.constructor.name );
              if ( sub_item.hasOwnProperty("pageItems") && sub_item.pageItems.length ) {
                nest_items = sub_item.pageItems.everyItem().getElements();
                for ( var nn = 0; nn < nest_items.length; nn++ ) {
                  nest_item = nest_items[nn];
                  // $.writeln( ".  .  .  " + nn + ": " + nest_item.constructor.name );
                  if ( nest_item.hasOwnProperty( "contentType" ) ) {
                    items.push( nest_item )
                  }
                }
              } else {
                items.push( sub_item );
              }
            } // sub item loop
          } else {
            items.push( group_item );
          }
        }   // group item loop
      } else {
        items.push( doc_item );
      }
    }       // docitems loop
    return items;
  }
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