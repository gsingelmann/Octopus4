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
#include "../Octopus-include.jsxinc"
__init();
var script_name = "Check-Articles";
var panel;

if ( app.documents.length > 0 ) {
  var dbg = true;
  __log_run(script_name);
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

  if (dbg) __log( "state: " + state_is_visible, "article")

  panel = new Window("palette");
  panel.script_name = script_name;
  panel.doc = app.activeDocument;

  __insert_head( panel );

  panel.btn = panel.add("button", undefined, __("show articles"));
  if ( state_is_visible ) panel.btn.text = __('hide articles');
  panel.btn.onClick = function () {
    this.active = false;
    state_is_visible = ! state_is_visible
    if (dbg) __log( "clicked button: " + state_is_visible, "article")
    show_frames( panel.doc, state_is_visible )
    if ( state_is_visible ) {
      this.text = __('hide articles');
    } else {
      this.text = __('show articles');
    }
  }
  panel.onClose = function() {
    if (dbg) __log( "panel.onClose", "article");
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
}

function __( id ) {
  loc_strings = load_translation();
  if (loc_strings.hasOwnProperty(id)) {
    return localize(loc_strings[id]);
  } else {
    return id
  }
}
function load_translation() {
  return {
    "hide articles": {"de": "Rahmen in Artikeln ausblenden", "en": "Hide frames that are part of an article"},
    "show articles": {"de": "Rahmen in Artikeln einblenden", "en": "Show frames that are part of an article"}
  }
}
