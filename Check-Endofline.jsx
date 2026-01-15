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
#targetengine "octopus-ua-checktypo";
#include "../Octopus-include.jsxinc"
__init();
var script_name = "Check-Endofline";
var script_version = __get_script_version( script_name);
var grep_list = list_greps();

if ( app.documents.length ) { 
  __log_run(script_name);
  show_panel();
}

function show_panel() {
  var doc = app.activeDocument;

  var hits = register();
  if ( hits.length == 0 ) {
    __alert( 'krake', __('nothing found'))
    return;
  }

  var ix = 0;

  var w = new Window("palette {orientation: 'column', alignChildren: ['fill', 'top']}");
  w.script_name = script_name;

  __insert_head( w );
  
  // -----------------------

  w.r0 = w.add("group {orientation: 'row', alignChildren: 'center'}")
  w.r0.margins.left = 15;
  w.msg = w.r0.add("statictext", [undefined, undefined, 500, 20], __('found') + "1/" + hits.length + " | ", {justify: 'left'} );
  w.msg.justify = 'left';
  w.r1 = w.add("group {orientation: 'row', alignChildren: ['', 'fill']}")
  w.r2 = w.add("group {orientation: 'row', alignChildren: ['', 'fill']}")
  w.r3 = w.add("group {orientation: 'row', alignChildren: ['', 'fill']}")
  w.prev = w.r1.add("button", undefined, __("prev"));
  w.next = w.r1.add("button", undefined, __("next"));
  w.fix = w.r1.add("button", undefined, __('fix'));
  w.fix_all = w.r1.add("button", undefined, __('fix_all'));
  w.refresh = w.r2.add("button", undefined, __('refresh'));

  w.prev.onClick = function () {
    ix--;
    update_view();
  }
  w.next.onClick = function () {
    ix++;
    update_view();
  }
  w.refresh.onClick = function () {
    hits = register()
    ix = 0;
    update_view();
  }
  w.fix.onClick = function () {
    try {
      app.loadFindChangeQuery( hits[ix].kind, SearchModes.GREP_SEARCH );
      var txt = hits[ix].text,
          s = txt.parentStory,
          max = s.characters.length,
          ix1 = txt.insertionPoints.firstItem().index,
          ix2 = txt.insertionPoints.lastItem().index,
          fw = app.findGrepPreferences.findWhat;
      app.select( s.characters.itemByRange(
        Math.max( 0, ix1 - 5 ),
        Math.min( ix2 + 5, max )
      ));
      var search_here = app.selection[0];
      search_here.changeGrep();
    } catch(e) {
      alert( e.message + " on " + e.line );
      __log_error( e, "Check-EoL");
    }
    hits.splice( ix, 1 );
    if ( ! hits.length ) w.close();
    w.msg.text = __('found') + "-/" + hits.length  + " | " + "…";
  }


  w.fix_all.onClick = function () {
    try {
      app.loadFindChangeQuery( hits[ix].kind, SearchModes.GREP_SEARCH );
      var rs = doc.changeGrep();
      __alert("krake", __('corrected') + "" + rs.length );
    } catch(e) {
      alert( e.message + " on " + e.line );
      __log_error( e, "fixing hits");
    }
    hits = register();
    if ( ! hits.length ) w.close();
    w.msg.text = __('found') + "-/" + hits.length  + " | " + "…";
  }

  // ----------------------------------------------------------------------

  var si_prev = doc.textPreferences.showInvisibles;
  doc.textPreferences.showInvisibles = true;
  update_view();

  w.onClose = function() {
    doc.textPreferences.showInvisibles = si_prev;
  }

  w.onMove = function() {
    app.insertLabel( "octopus_panelpos_checkhyphens", JSON.stringify( w.location ));
  }
  w.show();
  var aux = app.extractLabel( "octopus_panelpos_checkhyphens" );
  try {
    aux = JSON.parse( aux );
    __move_scriptui_to( w, aux.x, aux.y );
  } catch(e) {}


  function update_view( ) {
    if ( ix < 0 ) ix = hits.length-1;
    if ( ix >= hits.length ) ix = 0;
    w.msg.text = __('found') + (ix+1) + "/" + hits.length + " | " + /*__('type') + */ __( hits[ix].kind );
    // w.kind.text = __('type') + __( hits[ix].kind );

    try { 
      app.select( hits[ix].text );
      var ma = app.menuActions.item("$ID/Fit Selection in Window");
      ma.invoke();
    } catch(e) {
      // alert(e);
    } finally {
      doc.layoutWindows[0].zoomPercentage = Math.min( doc.layoutWindows[0].zoomPercentage, 200 );
    }

  }


  function register() {
    var hits = [];

    for ( var ng = 0; ng < grep_list.length; ng++ ) {
      var p = grep_list[ng];
      app.loadFindChangeQuery( p, SearchModes.GREP_SEARCH );
      var matches = doc.findGrep();
      for ( var n = 0; n < matches.length; n++ ) {
        hits.push( {kind: p, text: matches[n] });
      }
    }
    hits.sort( function(a,b) {
      if ( a.text.parentStory.id < b.text.parentStory.id ) return -1;
      if ( a.text.parentStory.id > b.text.parentStory.id ) return 1;
      if ( a.text.insertionPoints.firstItem().index < b.text.insertionPoints.firstItem().index ) return -1;
      if ( a.text.insertionPoints.firstItem().index > b.text.insertionPoints.firstItem().index ) return 1;
      return 0;
    })

    return hits;
  }
}

function list_greps() {
  var grepstrings = {
    'hyphengrep': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?> <Query> <Header> <Version major="5" minor="1"> </Version> <Application value="Adobe InDesign"> </Application> <QueryType value="Grep" qid="1"> </QueryType> </Header> <Description> <FindExpression value="(?&lt;=\\l)-\\s*(?=\\l)"> </FindExpression> <ReplaceExpression value="~-"> </ReplaceExpression> <FindChangeOptions> <IncludeLockedLayers value="0"> </IncludeLockedLayers> <IncludeLockedStories value="0"> </IncludeLockedStories> <IncludeMasterPages value="0"> </IncludeMasterPages> <IncludeHiddenLayers value="0"> </IncludeHiddenLayers> <IncludeFootnotes value="1"> </IncludeFootnotes> <KanaSensitive value="1"> </KanaSensitive> <WidthSensitive value="1"> </WidthSensitive> </FindChangeOptions> <FindFormatSettings> </FindFormatSettings> <ReplaceFormatSettings> <TextAttribute type="changecondmode" value="0"> </TextAttribute> </ReplaceFormatSettings> </Description> </Query> ',
    'linebreakgrep': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?> <Query> <Header> <Version major="5" minor="1"> </Version> <Application value="Adobe InDesign"> </Application> <QueryType value="Grep" qid="1"> </QueryType> </Header> <Description> <FindExpression value="([\\l\\u]|\\d)\\K\\s*\\n"> </FindExpression> <ReplaceExpression value=" \\n"> </ReplaceExpression> <FindChangeOptions> <IncludeLockedLayers value="0"> </IncludeLockedLayers> <IncludeLockedStories value="0"> </IncludeLockedStories> <IncludeMasterPages value="0"> </IncludeMasterPages> <IncludeHiddenLayers value="0"> </IncludeHiddenLayers> <IncludeFootnotes value="1"> </IncludeFootnotes> <KanaSensitive value="1"> </KanaSensitive> <WidthSensitive value="1"> </WidthSensitive> </FindChangeOptions> <FindFormatSettings> </FindFormatSettings> <ReplaceFormatSettings> <TextAttribute type="changecondmode" value="0"> </TextAttribute> </ReplaceFormatSettings> </Description> </Query>',
    'multispacegrep': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>  <Query>  <Header>  <Version major="5" minor="1">  </Version>  <Application value="Adobe InDesign">  </Application>  <QueryType value="Grep" qid="1">  </QueryType>  </Header>  <Description>  <FindExpression value="[~m~&gt;~f~|~S~s~&lt;~/~.~3~4~% ]{2,}">  </FindExpression>  <ReplaceExpression value=" ">  </ReplaceExpression>  <FindChangeOptions>  <IncludeLockedLayers value="0">  </IncludeLockedLayers>  <IncludeLockedStories value="0">  </IncludeLockedStories>  <IncludeMasterPages value="0">  </IncludeMasterPages>  <IncludeHiddenLayers value="0">  </IncludeHiddenLayers>  <IncludeFootnotes value="1">  </IncludeFootnotes>  <KanaSensitive value="0">  </KanaSensitive>  <WidthSensitive value="1">  </WidthSensitive>  </FindChangeOptions>  <FindFormatSettings>  </FindFormatSettings>  <ReplaceFormatSettings>  <TextAttribute type="changecondmode" value="0">  </TextAttribute>  </ReplaceFormatSettings>  </Description>  </Query>'
  }
  var sf = app.scriptPreferences.scriptsFolder;  
  var gf = new Folder( sf.parent.parent.fullName + "/Find-Change Queries/GREP" );

  for ( var p in grepstrings ) {
    var gfile = new File( gf.fullName + "/" + __( p ) + ".xml" );
    // if ( ! gfile.exists ) {
      gfile.open("w");
      gfile.write( grepstrings[p] );
      gfile.close();
    // }
  }

  var greps = gf.getFiles( function(f) { 
    return decodeURI(f.name).charAt(0) == "∴" && f.name.search(/\.xml/i) != -1 
  } );
  greps.sort( function(a,b) { 
    if ( a.name < b.name ) return -1;
    if ( a.name > b.name ) return 1;
    return 0;
  })
  var rs = [];
  for ( var n = 0; n < greps.length; n++ ) {
    rs[n] = decodeURI( greps[n].name.replace(/\.xml/i, "" ) );
  }
  return rs;
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
    "prev": {"de": "Vorherige Fundstelle", "en": "Previous"},
    "next": {"de": "Nachfolgende Fundstelle", "en": "Next"},
    "fix": {"de": "Korrigieren", "en": "Fix"},
    "fix_all": {"de": "Alle dieses Typs korrigieren", "en": "Fix all of this type"},
    "refresh": {"de": "Neu durchsuchen", "en": "Refresh"},
    "found": {"de": "Fundstelle: ", "en": "Match: "},
    "type": {"de": "Art: ", "en": "Type: "},
    "hyphen": {"de": "Harte Trennung", "en": "Rigid hyphen"},
    "break": {"de": "Harter Zeilenumbruch", "en": "Hard linebreak"},
    "spaces": {"de": "Mehrfache Leerzeichen", "en": "Multiple Spaces"},
    'nothing found': {"de": "Nichts gefunden", "en": "Nothing found"},
    'available greps': {"de": "Installierte Greps", "en": "Available Greps"},
    'corrected': {"de": "Korrigierte Wörter: ", "en": "Fixed words: "},
    'aux2': {"de": "", "en": ""},
    'hyphengrep': {"de": "∴ Octopus Falsche Trennzeichen", "en": "∴ Octopus Wrong Hyphen"},
    'linebreakgrep': {"de": "∴ Octopus Erzwungener Zeilenumbruch", "en": "∴ Octopus Forced Linebreak"},
    'multispacegrep': {"de": "∴ Octopus Mehrfache Leerzeichen", "en": "∴ Octopus Multiple Spaces"},
  }
}