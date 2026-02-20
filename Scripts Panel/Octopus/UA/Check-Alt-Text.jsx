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
#include "../Octopus-include-2.jsxinc"
#targetengine "octopus-ua-checkalttext"
var script_id = "check-alt-text";
__init();
__log("run", script_id, script_id);

var w;


show_ui();

function show_ui() {
  if ( app.documents.length == 0 ) return;
  var doc = app.activeDocument;

  remove_listeners( doc, ["beforeDeactivate", "beforeClose", "beforeSave", "beforeSaveAs"], before_save );
  install_listeners( doc, [ "beforeSave"], before_save );
  install_listeners( doc, [ "afterClose"], after_close );
  
  var restore_images_backdoor = ( ScriptUI.environment.keyboardState.altKey );
  if (restore_images_backdoor) {
    try {
      toggle_visibility("ok", true);
      toggle_visibility("deco", true);
    } catch(e){}
  } 
  
  var frames = handle_links( doc, true );
  var visibility = {};
  for ( var p in frames ) {
    for ( var n = 0; n < frames[p].length; n++ ) {
      var fs = frames[p], f = fs[n];
      visibility[ frames[p][n].frame ] = frames[p][n].vstate;
    }
  }
  doc.insertLabel("octopus-checkalttext-initialvisibility", JSON.stringify(visibility));

  w = new Window( "palette {orientation: 'column', alignChildren: ['fill', 'fill']}");
  w.script_name = "Check-Alt-Text";

  __insert_head(w, script_id );

  w.hidegroup = w.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}")
  w.layergroup = w.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}")
  w.okgroup = w.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}")
  
  w.toggle_alts = w.hidegroup.add("button", undefined, __('hide alts'));
  w.toggle_decos = w.hidegroup.add("button", undefined, __('hide deco'));
  w.make_layer = w.layergroup.add("button", undefined, __('make layer'));
  w.cancelElement = w.okgroup.add("button", undefined, "OK");

  w.toggle_alts.state = "shown"
  w.toggle_decos.state = "shown"

  w.layergroup.margins.top = 10;
  w.layergroup.margins.bottom = 10;

  w.toggle_alts.onClick = function () {
    // $.writeln( "clicked on " + this.state );
    try {
      if (this.state == "shown") {
        frames = handle_links( doc )
        this.state = "hidden";
        this.text = __('show alts');
        toggle_visibility("ok", false)
      } else {
        this.state = "shown";
        this.text = __('hide alts');
        toggle_visibility("ok", true)
      }
    } catch(e) {
      alert( e.message + " on " + e.line )
      __log("error", e.message + " on "  + e.line, script_id );
    }
  }
  w.toggle_decos.onClick = function () {
    // $.writeln( "clicked on " + this.state );
    try {
      if (this.state == "shown") {
        frames = handle_links( doc, true )
        this.state = "hidden";
        this.text = __('show deco');
        toggle_visibility("deco", false)
      } else {
        this.state = "shown";
        this.text = __('hide deco');
        toggle_visibility("deco", true)
      }
    } catch(e) {
      alert( e.message + " on " + e.line )
      __log("error", e.message + " on "  + e.line, script_id );
    }
  }
  w.make_layer.onClick = function() {
    try {
      toggle_visibility( "ok", true );
      toggle_visibility( "deco", true );
      make_layer()
      this.window.close();
    } catch(e) {
      __log("error", e.message + " on "  + e.line, script_id );
    }
  }

  w.onClose = function() {
    // $.writeln( "triggered w.onClose")
    restore_images();
    // this.close()
  }
  w.cancelElement.onClick = function() {
    this.window.close();
  }



  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_uaalttext", JSON.stringify( w.location ));
  }
  w.show();
  var aux = app.extractLabel( "octopus_panelpos_uaalttext" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( w, aux.x, aux.y );
  } catch(e) {
    __log("error", e.message + " on "  + e.line, script_id );
  }

  function after_close(e) {
    try {
      w.close();
    } catch(e) {}
  }
  function before_save(e) {
    var stop = -1;
    try {
      stop = w.toggle_decos.state == "hidden" || w.toggle_alts.state == "hidden";
    } catch(e) {}

    if ( stop === true ) {
      var aux = __alert("warnung", __('still hidden'), __('save warning'), [{text: "Ja", value: true}, {text: "Nein", value: false}], false )
      if ( ! aux ) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        try {
          w.close();
        } catch(e) {}
      }
    }

    // alert("closing doc \n" + e.target.name + "\n" + e.target.constructor.name );
    // // if ( e.target.constructor.name == "LayoutWindow" ) {
    //   restore_images();
    // // }
    // // doc.removeEventListener("beforeDeactivate", before_save )
    // remove_listeners( doc, ["beforeDeactivate", "beforeClose", "beforeSave", "beforeSaveAs"], before_save );
  }
  function restore_images() {
    try {
      toggle_visibility( "ok", true );
    } catch(e){
      alert( e.message + " on " + e.line );
    }
    try {
      toggle_visibility( "deco", true );
    } catch(e){
      alert( e.message + " on " + e.line );
    }
    // try {
    //   w.close();
    // } catch(e){
    //   alert( e.message + " on " + e.line );
    // }
  }

  function toggle_visibility( lname, state ) {
    if ( ! doc.isValid ) return;
    // ---------------------------------------------------------
    // ausblenden können wir immer
    // ---------------------------------------------------------
    if ( ! state ) {
      try {
        for ( var n = 0; n < frames[lname].length; n++ ) {
          // if ( ! confirm(n + ", id: "+ frames[lname][n].frame) ) return;
          var _fr = doc.pageItems.itemByID( frames[lname][n].frame );
          if ( _fr.isValid ) {
            _fr.visible = false;
          } else {
            // alert( "id " + frames[lname][n].frame + " not valid ")
          }
        }
      } catch(e) {
        alert( e.message + " on " + e.line + "\nlist: " + lname + "\nframes: " + frames[lname].toStource());
      } finally {
        return;
      }
    }
    // ---------------------------------------------------------
    // "einblenden" bedeutet, auf den gespeicherten State setzen
    // ---------------------------------------------------------
    var _v = doc.extractLabel("octopus-checkalttext-initialvisibility");
    if ( ! _v ) throw new Error( "visibility-state not saved in doc");
    var visibility = JSON.parse( _v );
    if ( ! frames ) frames = handle_links( doc, true );
    try {
      var list = frames[ lname ];
      // __log( lname + ", " + list.length + " to " + state.toString(), "toggling" );
      for ( var n = 0; n < list.length; n++ ) {
        var _id = list[n].frame;
        var _fr = doc.pageItems.itemByID( _id );
        var _v = visibility.hasOwnProperty( _id ) ? visibility[_id] : true;
        _fr.visible = _v;
      }
    } catch(e) {
      alert( e.message + " on " + e.line );
    }
  }
  function make_layer() {
    try {
      make_indic( frames.ok, "Alt-Text")
      make_indic( frames.nok, "no-Alt-Text")
      make_indic( frames.deco, "purely-decorative")

    } catch(e) {
      __log("error", e.message + " on "  + e.line, script_id );
    }
    function make_indic( list, name ) {
      // __log("indicatorlayer: " + name, "make indic");
      try {
        var _ro = doc.viewPreferences.rulerOrigin;
        doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
        var layer = doc.layers.item("alt-text-indicator");
        if ( ! layer.isValid ) layer = doc.layers.add({name: 'alt-text-indicator'});
        for ( var n = 0; n < list.length; n++ ) {
          var fr = doc.pageItems.itemByID(list[n].frame);
          var spread = get_spread(fr);
          var colour = get_color( name );
          if ( name == "no-Alt-Text" ) {
            var dup = spread.polygons.add({fillColor: "None", strokeColor: colour, strokeWeight: 4});
          } else {
            var dup = spread.textFrames.add({fillColor: "None", strokeColor: colour, strokeWeight: 4});
          }
          dup.itemLayer = layer;
          dup.paths[0].entirePath = fr.paths[0].entirePath;
          /*
          {frame: fr.id, kind: fr.constructor.name, link: link, altText: altText, actText: actualText, altDeco: (altTST == "SOURCE_DECORATIVE_IMAGE"), actDeko: (aTT == "TAG_ARTIFACT"), vstate: fr.visible }
          */
          if ( name !== "no-Alt-Text" ) {
            dup.contents = "Alt-Text: \"" + list[n].altText + "\"\nActual Text: \"" + list[n].actText + "\"";
            dup.parentStory.paragraphs[0].applyParagraphStyle( doc.paragraphStyles[0], true )
            dup.parentStory.paragraphs.everyItem().fillColor = "Black";
            dup.parentStory.paragraphs.everyItem().strokeColor = "Paper";
            var pts = 28;
            dup.parentStory.paragraphs.everyItem().pointSize = pts;
            while ( dup.overflows && pts >= 8 ) {
              pts -= 4;
              dup.parentStory.paragraphs.everyItem().pointSize = pts;
            }
            dup.fillColor = "Paper";
            dup.fillTransparencySettings.blendingSettings.opacity = 70;
          }
        }
      } catch(e) {
        __log("error", e.message + " on "  + e.line, script_id );
      } finally {
        doc.viewPreferences.rulerOrigin = _ro;
      }
    }
    function get_spread(fr) {
      // __log( "getting spread: " + fr.constructor.name , "getspread");
      while( fr.constructor.name != "Spread" && fr.constructor.name != "MasterSpread" ) {
        if ( fr.hasOwnProperty("baseline") ) {
          var aux = fr.parentTextFrames;
          if (aux && aux.length) {
            fr = aux[0];
          } else {
            fr = fr.parentStory.textContainers[fr.parentStory.textContainers.length-1];
          }
        } else {
          fr = fr.parent;
        }
        // __log( " step spread: " + fr.constructor.name , "getspread");
        if ( fr.constructor.name == "Document" ) return null;
      }
      return fr;
    }
    function get_color( name ) {
      // __log( name, "getcolour");
      var c = doc.colors.item( name );
      if ( c.isValid ) return c;

      c = doc.colors.add({space: ColorSpace.RGB, model: ColorModel.PROCESS, name: name, colorValue: [0, 255, 0]});
      if ( name == "no-Alt-Text") {
        c.colorValue = [255, 0, 0];
      } else if ( name == "purely-decorative") {
        c.colorValue = [0, 0, 255];
      }
      return c;
    }
  }
  function install_listeners( doc, types, handler ) {
    for ( var n = 0; n < types.length; n++ ) {
      doc.eventListeners.add( types[n], handler );
      // $.writeln( "installed " + types[n] );
    }
  }
  // // $.writeln( n + ": " + _e.name + ", " + _e.handler.name  + ", " + _e.eventType);
  function remove_listeners( doc, types, handler ) {
    try {
      var _t = " " + types.join(" ") + " ";
      for ( var n = doc.eventListeners.length-1; n >= 0; n-- ) {
        var _e = doc.eventListeners[n];
        if ( _t.indexOf( " " + _e.eventType + " ") != -1 && _e.handler.name == handler.name ) {
          // $.writeln( "removing EL " + n );
          _e.remove();
        }
      }
    } catch(e) {
      alert( e.message + " on " + e.line );
    }
  }
}

function handle_links( doc, page_items_too ) {
  if ( page_items_too ) {
    var frames = doc.pageItems.everyItem().getElements();
    var links = [];
    for ( var n = 0; n < frames.length; n++ ) {
      if ( frames[n].allGraphics.length == 1 && frames[n].allGraphics[0].itemLink ) {
        links.push( frames[n].allGraphics[0].itemLink );
      } else {
        links.push( null );
      }
    }
  } else {
    var links = doc.links.everyItem().getElements();
    var frames = [];
    for ( var n = 0; n < links.length; n++ ) {
      frames[n] = links[n].parent.parent;
    }
  }
  var has_alt = [],
      has_no_alt = [],
      is_decorative = [];

  for ( var nf = 0; nf < frames.length; nf++ ) {
    var fr = frames[nf],
        link = links[nf],
        // xmp = link ? link.linkXmp : null,
        oeo = fr.objectExportOptions,
        actualText = oeo.actualText(),
        altText = oeo.altText(),
        altTST = oeo.altTextSourceType.toString(),
        actualTST = oeo.actualTextSourceType.toString(),
        aTT = oeo.applyTagType.toString(),
        end_of_vars = true;
        // att = oeo.applyTagType,
        // amp = oeo.altMetadataProperty,
        // acmp = oeo.actualMetadataProperty,
        // cat = oeo.customAltText,
        // txt = "",
        // huba = oeo.actualText(),
        // hopp = oeo.altText();
      // oeo.customActualText -> pdf-custom-text

    if ( altTST == "SOURCE_DECORATIVE_IMAGE" || aTT == "TAG_ARTIFACT" ) {
      is_decorative.push( {
        frame: fr.id, 
        kind: fr.constructor.name, 
        link: link, 
        altText: altText, 
        actText: actualText, 
        altDeco: (altTST == "SOURCE_DECORATIVE_IMAGE"), 
        actDeko: (aTT == "TAG_ARTIFACT"), 
        vstate: fr.visible 
      } );
    } else {
      if ( actualText || altText) {
        has_alt.push( {
          frame: fr.id, 
          kind: fr.constructor.name, 
          link: link, 
          altText: altText, 
          actText: actualText, 
          altDeco: false, 
          actDeko: false, 
          vstate: fr.visible 
        } );
      } else {
        has_no_alt.push( {
          frame: fr.id, 
          kind: fr.constructor.name, 
          link: link, 
          altText: altText, 
          actText: actualText, 
          altDeco: false, 
          actDeko: false, 
          vstate: fr.visible 
        } );
      }
    }

    // if ( atst.toString() == "SOURCE_XML_STRUCTURE" ) {
    //   var xnode = fr.associatedXMLElement;
    //   if ( xnode && xnode.isValid ) {
    //     var xatts = xnode.xmlAttributes.everyItem().getElements();
    //     for ( n = 0; n < xatts.length; n++ ) {
    //       if ( xatts[n].name.search(/Alt/) != -1 ) txt = xatts[n].value;
    //     }
    //   } 

    // } else if ( atst.toString() == "SOURCE_CUSTOM" ) {
    //   txt = cat;

    // } else if ( atst.toString() == "SOURCE_XMP_TITLE" ) {
    //   txt = xmp ? xmp.documentTitle : "";

    // } else if ( atst.toString() == "SOURCE_XMP_DESCRIPTION" ) {
    //   txt = xmp ? xmp.description : "";

    // } else if ( atst.toString() == "SOURCE_XMP_HEADLINE" ) {
    //   txt = get_custom_xmp( xmp, "photoshop:Headline");

    // } else if ( atst.toString() == "SOURCE_XMP_EXTENDED_DESCRIPTION" ) {
    //   txt = get_custom_xmp( xmp, "Iptc4xmpCore:ExtDescrAccessibility[1]");

    // } else if ( atst.toString() == "SOURCE_XMP_OTHER" ) {
    //   txt = get_custom_xmp( xmp, amp);

    // } else if ( atst.toString() == "SOURCE_XMP_ALT_TEXT" ) {
    //   txt = get_custom_xmp(xmp, ["Iptc4xmpCore", "AltTextAccessibility[1]"]);

    // } else if ( atst.toString() == "SOURCE_DECORATIVE_IMAGE" ) {
    //   txt = "decorative image"
    // }
    // if ( ! txt ) {
    //   has_no_alt.push( {frame: fr.id, kind: fr.constructor.name, link: link, text: "", vstate: fr.visible } );
    // } else if ( txt == "decorative image" ) {
    //   is_decorative.push( {frame: fr.id, kind: fr.constructor.name, link: link, text: "deco", vstate: fr.visible } );
    // } else {
    //   has_alt.push( {frame: fr.id, kind: fr.constructor.name, link: link, text: txt, vstate: fr.visible } );
    // }
  }
  return {ok: has_alt, nok: has_no_alt, deco: is_decorative };
}


function get_custom_xmp( xmp, path ) {
  var map = {
    "xmp": "http://ns.adobe.com/xap/1.0/",
    "xmpMM": "http://ns.adobe.com/xap/1.0/mm/",
    "xmpBJ": "http://ns.adobe.com/xap/1.0/bj/",
    "xmpTPg": "http://ns.adobe.com/xap/1.0/t/pg/",
    "xmpDM": "http://ns.adobe.com/xmp/1.0/DynamicMedia/",
    "xmpRights": "http://ns.adobe.com/xap/1.0/rights/",
    "pdf": "http://ns.adobe.com/pdf/1.3/",
    "photoshop": "http://ns.adobe.com/photoshop/1.0/",
    "crs": "http://ns.adobe.com/camera-raw-settings/1.0/",
    "exif": "http://ns.adobe.com/exif/1.0/",
    "tiff": "http://ns.adobe.com/tiff/1.0/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "Iptc4xmpCore": "http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/",
    "Iptc4xmpExt": "http://iptc.org/std/Iptc4xmpExt/2008-02-29/"
  }

  if ( path.constructor.name != "Array" ) path = path.split(":");
  if ( path.length != 2 ) throw new Error("xmp-path not valid");
  if ( map.hasOwnProperty(path[0]) == false ) throw new Error("Unknown namespace: " + path[0])
  var uri = map[ path[0] ];
  var p = xmp.getProperty( uri, path[1] );
  if ( ! p ) p = xmp.getProperty( uri, path[1] + "[1]");
  var p1 = xmp.getProperty( path[0], path[1] );
  var cc = xmp.countContainer(path[0], path[1]);
  var ts = xmp.toSource();
  return p;
}


var dbg = false;

function __( id ) {
  var txt = "";
  try {
    var a = loc_strings;
  } catch(e) {
    loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
    // loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
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