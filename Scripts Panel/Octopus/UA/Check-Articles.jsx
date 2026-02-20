/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Toggles all display settings to your defaults

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
#targetengine "octopus-kontrolle-artikel"
#include "../Octopus-include-2.jsxinc"
var script_id = "check-articles";
__init();
var panel;

if ( app.documents.length > 0 ) {
  var dbg = true;
  __log("run", script_id, script_id);
  show_panel();
}

function show_panel() {

  var doc = app.activeDocument;
  doc.addEventListener( "beforeSave", restore_doc );
  doc.addEventListener( "beforeClose", restore_doc );
  doc.addEventListener( "beforeSaveAs", restore_doc );
  doc.addEventListener( "beforeExport", restore_doc );
  doc.addEventListener( "beforeDeactivate", restore_doc );

  var state_is_visible = (doc.extractLabel("octopus-checkarticles-state") !== "hidden")

  if (dbg) __log( "info", "state: " + state_is_visible, script_id)

  panel = new Window("palette");
  panel.script_id = script_id;
  panel.doc = app.activeDocument;

  __insert_head( panel, script_id );

  panel.btn = panel.add("button", undefined, __("show articles"));
  if ( state_is_visible ) panel.btn.text = __('hide articles');
  panel.btn.onClick = function () {
    this.active = false;
    state_is_visible = ! state_is_visible
    if (dbg) __log( "info", "clicked button: " + state_is_visible, script_id)
    show_frames( panel.doc, state_is_visible )
    if ( state_is_visible ) {
      this.text = __('hide articles');
    } else {
      this.text = __('show articles');
    }
  }
  panel.orphan_btn = panel.add("button", undefined, __("collect orphans"));
  panel.orphan_btn.onClick = function() {
    collect_orphans();
  }
  panel.sequence_btn = panel.add("button", undefined, __("show sequence"));
  panel.sequence_btn.onClick = function() {
    show_sequence();
  }
  panel.rm_layers_btn = panel.add("button", undefined, __("remove layers"));
  panel.rm_layers_btn.onClick = function() {
    if ( ! app.documents.length ) return;
    var l = app.activeDocument.layers.item("ᴥ " + __("sequence"));
    if ( l.isValid ) {
      l.remove();
    }
  }
  panel.onClose = function() {
    if (dbg) __log( "info", "panel.onClose", script_id);
    restore_doc()

    // show_frames( panel.doc, true )
    // state_is_visible = true;
  }
  
  panel.onMove = function() {
    app.insertLabel( "octopus_panelpos_uaarticles", JSON.stringify( panel.location ));
  }
  panel.show();
  var aux = app.extractLabel( "octopus_panelpos_uaarticles" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( panel, aux.x, aux.y );
  } catch(e) {}



  panel.show();

  function restore_doc( e ) {
    show_frames( panel.doc, true );
    try { panel.doc.removeEventListener( "beforeSave", restore_doc ); } catch(e) {}
    try { panel.doc.removeEventListener( "beforeClose", restore_doc ); } catch(e) {}
    try { panel.doc.removeEventListener( "beforeSaveAs", restore_doc ); } catch(e) {}
    try { panel.doc.removeEventListener( "beforeExport", restore_doc ); } catch(e) {}
    try { panel.doc.removeEventListener( "beforeDeactivate", restore_doc ); } catch(e) {}
    panel.close();
  }

  function show_frames( doc, sichtbar ) {
    if ( ! app.documents.length ) return;
    if (sichtbar) {
      doc.insertLabel("octopus-checkarticles-state", "shown");
    } else {
      doc.insertLabel("octopus-checkarticles-state", "hidden");
    }
  
    var articles = doc.articles.everyItem().getElements();
    for ( var na = 0; na < articles.length; na++ ) {
      var article = articles[na];
      for ( var nm = 0; nm < article.articleMembers.length; nm++ ) {
        var member = article.articleMembers[nm];
        var ref = member.itemRef
        if ( ref.constructor.name == "TextFrame") {
          var story = ref.parentStory;
          for ( var nt = 0; nt < story.textContainers.length; nt++ ) {
            story.textContainers[nt].visible = sichtbar;
          }
        } else {
          ref.visible = sichtbar;
        }
      }
    }
  }

  function collect_orphans() {
    if ( ! app.documents.length ) return;
    var doc = app.activeDocument;
    // -----------------------------------------------------------------------------
    //  Alle Stories sammeln, die in Artikeln vorkommen
    // -----------------------------------------------------------------------------
    var arts = doc.articles.everyItem().getElements();
    var s_ids = {};
    for ( var na = 0; na < arts.length; na++ ) {
      for ( var nm = 0; nm < arts[na].articleMembers.length; nm++ ) {
        var id = "_" + arts[na].articleMembers[nm].itemRef.parentStory.id;
        s_ids[id] = true;
      }
    }
    // -----------------------------------------------------------------------------
    //  Alle Stories durchgehen und die Stories sammeln, die nicht in Artikeln vorkommen
    // -----------------------------------------------------------------------------
    var orphans = [];
    for ( var ns = 0; ns < doc.stories.length; ns++ ) {
      var s = doc.stories[ns];
      var id = "_" + s.id;
      if ( ! s_ids[id] ) {
        orphans.push(s);
      }
    }
    orphans.sort( function(a, b) { 
      var c1 = get_coord(a.textContainers[0]),
          c2 = get_coord(b.textContainers[0]);
      if ( c1.spread.index == c2.spread.index ) {
        if ( Math.abs(c1.x - c2.x) < 10 ) {
          return c1.y - c2.y;
        }
        return c1.x - c2.x;
      }
      return c1.spread.index - c2.spread.index;
    } );
    // -----------------------------------------------------------------------------
    //  Alle gefundenen Stories in je einen Artikel aufnehmen
    // -----------------------------------------------------------------------------
    for ( var no = 0; no < orphans.length; no++ ) {
      var a = doc.articles.add();
      a.name = __("orphan") + no;
      a.articleMembers.add(orphans[no].textContainers[0]);
    }
    
  }

  function show_sequence() {
    if ( ! app.documents.length ) return;
    var doc = app.activeDocument;
    if ( doc.articles.length == 0 ) return;

    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
    var layer_name = "ᴥ " + __("sequence");
    var layer = doc.layers.item(layer_name);
    if ( ! layer.isValid ) {
      layer = doc.layers.add({ name: layer_name });
    }
    // -----------------------------------------------------------------------------
    //  Objectstyles für die Pfeile
    // -----------------------------------------------------------------------------
    var ofname1 = "ᴥ " + __("next-frame");
        ofname2 = "ᴥ " + __("next-spread");
    var next_tf = doc.objectStyles.item(ofname1);
    if ( ! next_tf.isValid ) {
      var org = doc.objectStyles.item(1)
      next_tf = org.duplicate(); 
      next_tf.name = ofname1;
      next_tf.arrowHeadAlignment = ArrowHeadAlignmentEnum.INSIDE_PATH;
      next_tf.enableFill = true;
      next_tf.enableStroke = true;
      next_tf.fillColor = "None"
      next_tf.strokeColor = "Black"
      next_tf.strokeWeight = 4;
      next_tf.rightLineEnd = ArrowHead.SIMPLE_ARROW_HEAD;
    }
    var next_spread = doc.objectStyles.item(ofname2);
    if ( ! next_spread.isValid ) {
      next_spread = next_tf.duplicate();
      next_spread.name = ofname2;
      var st = doc.dashedStrokeStyles.add({ name: "ᴥ Dashed", dashArray: [4, 3] });
      next_spread.strokeType = st;
    }
    // -----------------------------------------------------------------------------
    //  Article Loop
    // -----------------------------------------------------------------------------
    for ( var na = 0; na < doc.articles.length; na++ ) {
      // $.writeln("Article " + na + ": " + doc.articles[na].name + " / " + doc.articles[na].articleMembers.length + " members" );
      var c = load_color(na, doc);
      var a = doc.articles[na];
      var frames = [];
      for ( var nm = 0; nm < a.articleMembers.length; nm++ ) {
        if ( a.articleMembers[nm].itemRef.constructor.name == "TextFrame" ) {
          for ( var ns = 0; ns < a.articleMembers[nm].itemRef.parentStory.textContainers.length; ns++ ) {
            frames.push( a.articleMembers[nm].itemRef.parentStory.textContainers[ns] );
          }
        } else {
          frames.push( a.articleMembers[nm].itemRef );
        }
      }
      for ( var nm = 0; nm < frames.length-1; nm++ ) {
        // $.writeln("frame " + nm + "/" + frames.length );
        var tf1 = frames[nm],
            tf2 = frames[nm+1],
            cd1 = get_coord(tf1),
            cd2 = get_coord(tf2);
        var r1 = tf1.resolve(
          AnchorPoint.CENTER_ANCHOR,
          CoordinateSpaces.PASTEBOARD_COORDINATES,
          true
        )
        var r2 = tf2.resolve(
          AnchorPoint.CENTER_ANCHOR,
          CoordinateSpaces.PASTEBOARD_COORDINATES,
          true
        )
        // $.writeln( tf1.name + ": " + r(r1[0][0]) + " / " + r(r1[0][1]) + " -> " + tf2.name + ": "+ r(r2[0][0]) + " / " + r(r2[0][1]) );

        if ( cd1.spread.index == cd2.spread.index ) {
          var l = cd1.spread.graphicLines.add({ itemLayer: layer });
          l.paths.firstItem().entirePath = [[cd1.x, cd1.y], [cd2.x, cd2.y]];
          l.applyObjectStyle( next_tf, true );
          l.strokeColor = c;
        } else {
          var l_out = cd1.spread.graphicLines.add({ itemLayer: layer });
          l_out.applyObjectStyle( next_spread, true );
          l_out.strokeColor = c;
          var l_in = cd2.spread.graphicLines.add({ itemLayer: layer });
          l_in.applyObjectStyle( next_spread, true );
          l_in.strokeColor = c;

          var dx = new UnitValue( r2[0][0] - r1[0][0], "pt" ),
              dy = new UnitValue( r2[0][1] - r1[0][1], "pt" ),
              angle = Math.atan2( dy.as("pt"), dx.as("pt") )
              len1 = Math.sqrt( cd1.w * cd1.w + cd1.h * cd1.h ) * .6,
              len2 = Math.sqrt( cd2.w * cd2.w + cd2.h * cd2.h ) * .6;
          // $.writeln( "angle: " + angle * 180 / Math.PI + ", " + angle );

          l_out.paths.firstItem().entirePath = [[cd1.x, cd1.y], [cd1.x + Math.cos(angle) * len1, cd1.y + Math.sin(angle) * len1]];
          l_in.paths.firstItem().entirePath = [[cd2.x - Math.cos(angle) * len2, cd2.y - Math.sin(angle) * len2], [cd2.x, cd2.y]];
        }
      }
    }
  }
  function r(x) {
    return Math.round(x);
  }
  function get_coord( item ) {
    var spread = item.parent;
    while ( spread.constructor.name != "Spread" && spread.constructor.name != "Document" ) {
      spread = spread.parent;
    }
    var gb = item.geometricBounds,
        x = (gb[1] + gb[3]) / 2,
        y = (gb[0] + gb[2]) / 2,
        w = gb[3] - gb[1],
        h = gb[2] - gb[0];

    return { x: x, y: y, w: w, h: h, spread: spread };
  }
  function load_color(n, doc) {
    if ( ! doc ) {
      if ( app.documents.length == 0 ) return null;
      doc = app.activeDocument;
    } 

    colours = [
      { name:  "ᴥ LIGHT BLUE", values: [79, 153, 255] },
      { name:  "ᴥ RED", values: [255, 0, 0] },
      { name:  "ᴥ GREEN", values: [79, 255, 79] },
      { name:  "ᴥ BLUE", values: [0, 0, 255] },
      { name:  "ᴥ YELLOW", values: [255, 255, 79]   },
      { name:  "ᴥ MAGENTA", values: [255, 79, 255] },
      { name:  "ᴥ CYAN", values: [0, 255, 255] },
      { name:  "ᴥ GRAY", values: [128, 128, 128] },
      { name:  "ᴥ ORANGE", values: [255, 102, 0] },
      { name:  "ᴥ DARK GREEN", values: [0, 84, 0] },
      { name:  "ᴥ TEAL", values: [0, 153, 153] },
      { name:  "ᴥ TAN", values: [204, 153, 102] },
      { name:  "ᴥ BROWN", values: [153, 51, 0] },
      { name:  "ᴥ VIOLET", values: [153, 51, 255] },
      { name:  "ᴥ GOLD", values: [255, 153, 0] },
      { name:  "ᴥ DARK BLUE", values: [0, 0, 135] },
      { name:  "ᴥ PINK", values: [255, 153, 204] },
      { name:  "ᴥ LAVENDER", values: [153, 153, 255] },
      { name:  "ᴥ BRICK RED", values: [153, 0, 0] },
      { name:  "ᴥ OLIVE GREEN", values: [102, 102, 0] },
      { name:  "ᴥ PEACH", values: [255, 153, 153] },
      { name:  "ᴥ BURGUNDY", values: [153, 0, 51] },
      { name:  "ᴥ GRASS GREEN", values: [153, 204, 0] },
      { name:  "ᴥ OCHRE", values: [153, 102, 0] },
      { name:  "ᴥ PURPLE", values: [102, 0, 102] },
      { name:  "ᴥ LIGHT GRAY", values: [186, 186, 186] },
      { name:  "ᴥ CHARCOAL", values: [171, 163, 181] },
      { name:  "ᴥ GRID BLUE", values: [122, 186, 217] },
      { name:  "ᴥ GRID ORANGE", values: [255, 181, 107] },
      { name:  "ᴥ FIESTA", values: [247, 89, 107] },
      { name:  "ᴥ LIGHT OLIVE", values: [140, 166, 107] },
      { name:  "ᴥ LIPSTICK", values: [207, 130, 181] },
      { name:  "ᴥ CUTE TEAL", values: [130, 207, 194] },
      { name:  "ᴥ SULPHUR", values: [207, 207, 130] },
      { name:  "ᴥ GRID GREEN", values: [156, 222, 156] },
    ];
    if ( ! n || n < 0 ) {
      n = 0;
    }
    n = n % colours.length;
    var c = doc.swatches.item(colours[n].name);
    if ( ! c.isValid ) {
      c = doc.colors.add({ name: colours[n].name, model: ColorModel.process, space: ColorSpace.RGB, colorValue: colours[n].values });
    }
    return c;
  }

}

function __( id ) {
  var txt = "";
  try {
    var a = loc_strings;
  } catch(e) {
    // loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
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