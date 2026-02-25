/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Helps you check your Language

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2025-01-20

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
#targetengine "octopus-ua-languages";
#include "../Octopus-include-2.jsxinc"
var script_id = "check-language"
__init();
__log("run", script_id, script_id)


var dbg = false;
var indic_colour = { h: 200, s: 20, b: 100 }; // HSB für die erste Bedingung, die anderen sind berechnet;

handle();

function handle() {
  if ( app.documents.length == 0 ) return;
  var doc = app.activeDocument;
  app.findTextPreferences = NothingEnum.NOTHING;

  var prev_pref = doc.conditionalTextPreferences.showConditionIndicators;
  doc.insertLabel("octopus_language_prevpref", prev_pref.toString())
  doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode.SHOW_INDICATORS;

  var found = [];
  // -----------------------------------------------------------------------------------------------------
  //  Welche Sprachen haben wir?
  // -----------------------------------------------------------------------------------------------------
  var langs = app.languagesWithVendors.everyItem().getElements();
  var total_char_count = 0;
  for ( var nl = 0; nl < langs.length; nl++ ) {
    var icu = langs[nl].icuLocaleName;

    app.findTextPreferences.appliedLanguage = langs[nl];
    var aux = doc.findText();
    // $.writeln( [langs[nl].icuLocaleName, langs[nl].name, langs[nl].spellingVendor, aux.length].join(", ") );
    if ( aux.length ) {
      var f = { icu: icu, name: langs[nl].name, vendor: langs[nl].spellingVendor, char_count: 0, hits: aux, crnt_ix: 0 };
      var cond = get_condition( "∴ " + icu );
      for ( var na = 0; na < aux.length; na++ ) {
        if ( ! dbg ) set_condition( aux[na], cond );
        f.char_count += aux[na].characters.length;
        // $.writeln( aux[na].contents.substr(0,32) )
      }
      total_char_count += f.char_count;
      found.push( f );
    }
  }
  // -----------------------------------------------------------------------------------------------------
  //  Bedingungen einfärben
  // -----------------------------------------------------------------------------------------------------
  if ( ! dbg ) {
    var conditions = doc.conditions.everyItem().getElements();
    var palette = build_palette( found.length );
    var cix = 0;
    for ( var n = 0; n < conditions.length; n++ ) {
      if ( conditions[n].name.charAt(0) == "∴") {
        conditions[n].visible = true;
        conditions[n].indicatorColor = palette[ cix ];
        cix++;
      }
    }
  }

  found.sort( function(a,b) {
    return b.char_count - a.char_count;
  })

  // --------------------------------------------------------------------------------------
  //  Die häufigste Sprache soll als Vorgabe nicht markiert sein
  // try {
  //   var c = doc.conditions.item("∴ " + found[0].icu);
  //   alert( c.isValid + ", " + found[0].icu ) ;
  //   for ( var na = 0; na < found[0].length; na++ ) {
  //     unset_condition( found[0][na], c );
  //   }
  // } catch(e) {
  //   __log_error(e, "hiding 'most' language")
  //   alert(e);
  // }
  interaktion();

  function interaktion( ) {
    var w = new Window( "palette {alignChildren: ['fill', 'fill']}" );
    w.script_id = script_id

    __insert_head( w );

    w.lb = w.add("listbox", undefined, "", {
      numberOfColumns: 4, 
      showHeaders: true, 
      columnTitles: [
        __('language'), 
        __('share'), 
        __('chars'), 
        __('ranges')
      ],
      columnWidths: [ 250, 60, 60, 60]
    });
    w.lb.preferredSize = {width: 440, height: Math.min( 400, (found.length+1) * 24)};
    for ( var n = 0; n < found.length; n++ ) {
      var f = found[n];
      var l = w.lb.add("item", found[n].name);
      l.subItems[0].text = Math.round(100 * found[n].char_count / total_char_count).toString() + "%"
      l.subItems[1].text = found[n].char_count.toString();
      l.subItems[2].text = found[n].hits.length.toString();
    }

    w.cbs = w.add("group {orientation: 'column', alignChildren: 'left', margin: [1,1,1,1]}")
    w.hide_most = w.cbs.add("checkbox", undefined, __('hide main'));
    w.hide_most.value = false;
    w.hide_most.onClick = function() {
      if ( ! found.length ) return;
      var c = doc.conditions.item("∴ " + found[0].icu);
      if ( c.isValid ) {
        for ( var n = 0; n < found[0].hits.length; n++ ) {
          if ( this.value ) {
            unset_condition( found[0].hits[n], c );
          } else {
            set_condition( found[0].hits[n], c );
          }
        }
      }
    }
    w.hide_marker = w.cbs.add("checkbox", undefined, __('hide marker'));
    w.hide_marker.onClick = function() {
      if ( this.value ) {
        doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode.HIDE_INDICATORS;
      } else {
        doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode.SHOW_INDICATORS;
      }
    }


    w.btns0 = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.prev = w.btns0.add("button", undefined, __("prev")/*, {margins: [1,1,1,1] } */)
    w.next = w.btns0.add("button", undefined, __("next")/*, {margins: [1,1,1,1] } */)
    w.prev.enabled = false;
    w.next.enabled = false;
    w.prev.onClick = function() {
      if ( ! w.lb.selection ) return;
      decrease( w.lb.selection.index );
    }
    w.next.onClick = function() {
      if ( ! w.lb.selection ) return;
      increase( w.lb.selection.index );
    }
    function decrease( nth ) {
      found[nth].crnt_ix--;
      if ( found[nth].crnt_ix < 0 ) found[nth].crnt_ix = found[nth].hits.length-1;
      show_text( found[nth].hits[ found[nth].crnt_ix ] );
    }
    function increase( nth ) {
      found[nth].crnt_ix++;
      if ( found[nth].crnt_ix > found[nth].hits.length-1 ) {
        found[nth].crnt_ix = 0;
      }
      show_text( found[nth].hits[ found[nth].crnt_ix ] );
    }
    function show_text( text ) {
      if ( text.parentTextFrames.length == 0 ) {
        w.msg.text = __('in overset');
        // try {
        //   app.select(text)
        //   var ma = app.menuActions.item("$ID/Edit Story");
        //   if ( ma && ma.isValid ) {
        //     ma.invoke();
        //   }
        // } catch(e) {
        //   alert(e + " on " + e.line);
        // }
      } else {
        w.msg.text = "";
        var layer = text.parentTextFrames[0].itemLayer;
        layer.locked = false;
        layer.visible = true;
        text.parentTextFrames[0].locked = false;
        text.parentTextFrames[0].visible = true;
        try {
          app.select( text );
          var ma = app.menuActions.item("$ID/Fit Selection in Window");
          ma.invoke();
          doc.layoutWindows[0].zoomPercentage = Math.min( doc.layoutWindows[0].zoomPercentage, 150 );
        } catch(e) {
          is_error = true;
          // alert(e);
        } finally {
          if ( is_error ) {
            doc.layoutWindows[0].zoomPercentage = Math.min( doc.layoutWindows[0].zoomPercentage, 100 );
          }
        }
      }
    }
    w.lb.onChange = function () {
      if ( this.selection ) {
        this.window.prev.enabled = true;
        this.window.next.enabled = true;
      } else {
        this.window.prev.enabled = false;
        this.window.next.enabled = false;
      }
    }

    w.msg = w.add("statictext", [undefined, undefined, 300, 20], "");

    w.btns1 = w.add("group {orientation: 'row'}");
    w.defaultElement = w.btns1.add("button", undefined, "OK");
    w.defaultElement.onClick = function() {
      this.window.close();
      delete_markers();
    }
    w.onClose = function () {
      delete_markers();
    }

    w.onMove = function() {
      app.insertLabel( "octopus_panelpos_ualanguages", JSON.stringify( w.location ));
    }
  
    doc.addEventListener( "beforeDeactivate", function() {
      w.close();
    })
    w.show();
    w.hide_most.notify("onClick");
  
    var aux = app.extractLabel( "octopus_panelpos_ualanguages" );
    try {
      aux = JSON.parse( aux );
      __move_scriptui_to( w, aux.x, aux.y );
    } catch(e) {}
  
    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------

    function delete_markers() {
      for ( var n = 0; n < found.length; n++ ) {
        var c = doc.conditions.item("∴ " + found[n].icu);
        if ( c.isValid ) c.remove();
      }
      try {
        var prev_pref = doc.extractLabel("octopus_language_prevpref")
        doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode[prev_pref];
      } catch(e) {}
    }
  }
  function set_condition( text, cond ) {
    var rngs = text.textStyleRanges.everyItem().getElements();
    for ( var n = 0; n < rngs.length; n++ ) {
      var a = rngs[n].appliedConditions;
      var gotit = false;
      for ( var m = 0; m < a.length; m++ ) {
        if ( a[m] == cond ) gotit = true;
      }
      if ( gotit ) continue;
      a.push( cond );
      rngs[n].appliedConditions = a;
    }
  }
  function unset_condition( text, cond ) {
    var rngs = text.textStyleRanges.everyItem().getElements();
    for ( var nr = 0; nr < rngs.length; nr++ ) {
      var a = rngs[nr].appliedConditions;
      if ( a.length == 1 ) {
        rngs[nr].appliedConditions = [];
      } else {
        for ( var n = a.length-1; a >= 0; a-- ) {
          if ( a[n] == cond ) a.splice(n,1)
        }
        rngs[nr].appliedConditions = a;
      }
    }
  }
  function get_condition( name ) {
    var cond = doc.conditions.item( name );
		if ( ! cond.isValid ) cond = app.activeDocument.conditions.add({
			name:name,
			// indicatorColor: prefs.indicatorColor,
			indicatorMethod: ConditionIndicatorMethod[ "USE_HIGHLIGHT" ],
			underlineIndicatorAppearance: ConditionUnderlineIndicatorAppearance[ "SOLID" ]
		});
		return cond;
  }
}

function __( id ) {
  var txt = "";
    // loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
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

function build_palette( count ) {
  var hsb = indic_colour;
  var colours = [];
  // ------------------------------------------------------------------
  //  Palette berechnen
  var hues = find_hue_values( count, 2, hsb.h );
  // ------------------------------------------------------------------
  //  Palette malen, mit einem Brightness-Wechsel von off von Step zu Step
  var off = 5;
  for ( var n = 0; n < hues.length; n++ ) {
    // ------------------------------------------------------------------
    // Helligkeit tanzen lassen -> Besser unterscheidbar
    var b;
    if ( hsb.b < 25 ) {
      b = hsb.b + ((n % 3) * off)
    } else if (hsb.b > 75) {
      b = hsb.b - ((n % 3) * off)
    } else {
      b = hsb.b + ((1 - (n % 3)) * off)
    }
    // ------------------------------------------------------------------
    //  Fertig
    colours.push( hsbToRgb( hues[n], hsb.s, b ));
  }
  return colours;


  // ------------------------------------------------------------------
  //  Erstellt das Array of Hues
  // ------------------------------------------------------------------
  function find_hue_values( ncolors, split, basehue ) {
    var alpha = 360 / ncolors;
    var step = findAlpha( split, ncolors )
    var hues = [];
    for ( n = 0; n < ncolors; n++ ) {
      var h = ((n*step*alpha) % 360);
      hues.push( (basehue + h) % 360 );
    }
    return hues;
  }
  // ------------------------------------------------------------------
  //  Größter gemeinsamer Nenner
  // ------------------------------------------------------------------
  function gcd(a, b) {
    while (b !== 0) {
      var temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  function findAlpha(desiredStep, jump) {
    if (!desiredStep) desiredStep = 3;
    if (!jump) jump = 12;
    // Start searching from desiredStep and adjust upwards and downwards
    for (var delta = 0; delta < jump; delta++) {
      // Check upwards
      var alphaUp = (desiredStep + delta) % jump;
      if (gcd(alphaUp, jump) === 1) {
        return alphaUp;
      }

      // Check downwards
      var alphaDown = (desiredStep - delta + jump) % jump;
      if (gcd(alphaDown, jump) === 1) {
        return alphaDown;
      }
    }
    // Fallback to standard step if no co-prime alpha found near desiredStep
    return 1;
  }
  function rgbToHsb(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), 
        min = Math.min(r, g, b);
    var h, s, v = max;
    var delta = max - min;
    if (delta === 0) {
        h = 0;
    } else if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
        h = 60 * (((b - r) / delta) + 2);
    } else {
        h = 60 * (((r - g) / delta) + 4);
    }
    if (h < 0) h += 360;
    s = max === 0 ? 0 : (delta / max);
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        b: Math.round(v * 100)
    };
  }
  function hsbToRgb(h, s, b) {
    // h = (h / 255) * 360;
    s = s / 100;
    b = b / 100;
    var c = b * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = b - c;
    var rPrime, gPrime, bPrime;
    if (h >= 0 && h < 60) {
        rPrime = c; gPrime = x; bPrime = 0;
    } else if (h >= 60 && h < 120) {
        rPrime = x; gPrime = c; bPrime = 0;
    } else if (h >= 120 && h < 180) {
        rPrime = 0; gPrime = c; bPrime = x;
    } else if (h >= 180 && h < 240) {
        rPrime = 0; gPrime = x; bPrime = c;
    } else if (h >= 240 && h < 300) {
        rPrime = x; gPrime = 0; bPrime = c;
    } else {
        rPrime = c; gPrime = 0; bPrime = x;
    }
    var r = Math.round((rPrime + m) * 255);
    var g = Math.round((gPrime + m) * 255);
    var bFinal = Math.round((bPrime + m) * 255);
    return [r, g, bFinal];
    // return { r: r, g: g, b: bFinal };
  }

} 