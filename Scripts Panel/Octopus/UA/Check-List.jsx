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
#targetengine octopus_check_lists;
#include "../Octopus-include-2.jsxinc"

var script_id = "check-list"
__init();
__log("run", script_id, script_id);

check_list();

function check_list() {
    if ( app.documents.length == 0 ) return;

    var doc = app.activeDocument;
    var search_strings = {
        bullets: "(?i)^[^a-z0-9\\s](?=\\s)",
        // bullets: "(?i)^\\W(?=\\s)",
        graphics: "(?i)^~a(?=\\s)",
        arabic: "(?i)^[0-9]+[\\.\\)]?(?=\\s)",
        latin: "^[IVXLCDM]+[\\.\\)]?(?=\\s)",
        letters: "(?i)^[a-z][\\.\\)](?=\\s)",
    }
    if ( app.documents.length ) {
        var stories = doc.stories.everyItem().getElements();
        var pixs = get_p_indexes( doc)
        var listen = get_fakes( doc, pixs );
        handle_fakes( doc, listen );
    }   

    function handle_fakes( doc, listen ) {
        if ( ! listen.length ) {
            __alert("warnung", __('nothing-found') );
            return;
        }

        crnt = 0;

        var w = new Window("palette");
        __insert_head( w, script_id );
    
        w.place = w.add("statictext", [undefined, undefined, 400, 20]);
        w.pb = w.add("progressbar", [undefined, undefined, 400, 10]);

        w.pn_group = w.add("group {orientation: 'row', alignChildren: 'center'}");
        w.prev_btn = w.pn_group.add("button", undefined, __('previous'))
        w.next_btn = w.pn_group.add("button", undefined, __('next'))

        w.refresh_group = w.add("group {orientation: 'row', alignChildren: 'center'}");
        w.refresh_btn = w.refresh_group.add("button", undefined, __('refresh'));

        if ( listen.length == 1 ) {
            toggle_btns( false );
        }

        w.place.text = (crnt+1) + "/" + listen.length + " -- " + listen[0].kind + ", " + listen[0].texts.length + " " + __('paragraphs');
        show_hit( listen[0] );

        w.pb.maxvalue = listen.length-1;

        w.prev_btn.onClick = function () {
            // alert("prev " + crnt + "/" + listen.length)
            try {
                crnt--;
                update();
            } catch(e) {
                // alert( e.message + " on " + e.line );
            }
        }
        w.next_btn.onClick = function () {
            // alert("next " + crnt + "/" + listen.length)
            try {
                crnt++;
                update();
            } catch(e) {
                // alert( e.message + " on " + e.line );
            }
        }

        w.refresh_btn.onClick = function() {
            try {
                refresh()
            } catch(e) {
                // alert( e.message + " on " + e.line );
            }
        };

        w.show();

        function toggle_btns( state ) {
            w.prev_btn.enabled = !!state;
            w.next_btn.enabled = !!state;
            w.refresh_btn.enabled = !!state; 

        }
        function update() {
            try {
                if ( crnt >= listen.length ) crnt = 0;
                if ( crnt < 0 ) crnt = listen.length - 1;
                w.place.text = (crnt+1) + "/" + listen.length + " -- " + listen[0].kind + ", " + listen[0].texts.length + " " + __('paragraphs');
                show_hit( listen[crnt] )
            } catch(e) {
                // alert( e.message + " on " + e.line );
            }
        }
        function refresh() {
            try {
                stories = doc.stories.everyItem().getElements();
                pixs = get_p_indexes( doc)
                listen = get_fakes( doc, pixs );

                if ( listen.length == 0 ) {
                    w.close();
                    exit();
                }

                w.pb.maxvalue = listen.length;
                update();
                toggle_btns( listen.length > 1 );
            } catch(e) {
                // alert( e.message + " on " + e.line );
            }
        }
        function show_hit( liste ) {
            app.select( NothingEnum.NOTHING );
            try {
                app.select( liste.texts[0].paragraphs.firstItem() );
                var ma = app.menuActions.item("$ID/Fit Selection in Window");
                ma.invoke();          
            } catch(e) {
                // alert( e.message + " on " + e.line );
            } finally {
                doc.layoutWindows[0].zoomPercentage = Math.min( doc.layoutWindows[0].zoomPercentage, 75 );
            }
        }
    }
    function get_fakes( doc ) {
        var hits = {};
        var rs = [];
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.findGrepPreferences.bulletsAndNumberingListType = ListType.NO_LIST;
        // -----------------------------------------------------------------------------------------------
        //  Wir haben x Suchbegriffe, die gehen wir einzeln durch
        // -----------------------------------------------------------------------------------------------
        rs = [];
        for ( var gname in search_strings ) {
            app.findGrepPreferences.findWhat = search_strings[ gname ];
            hits[ gname ] = doc.findGrep();
            var last_pix = -2, last_c = " ", clct = [];
            // -------------------------------------------------------------------------------------------
            //  Die Treffer des x. Greps analysieren
            // -------------------------------------------------------------------------------------------
            for ( var n = 0; n < hits[gname].length; n++ ) {
                // ---------------------------------------------------------------------------------------
                //  Welche Aufzählung im wievielten Absatz?
                // ---------------------------------------------------------------------------------------
                var c = hits[gname][n].contents.toString(),
                    pix = get_p_index( hits[gname][n]);
                // -------------------------------------------------------------------------------------------
                //  Alle Zusammengehörigen sammeln wir in clct
                // -------------------------------------------------------------------------------------------
                if ( clct.length == 0 ) {
                    clct.push( hits[gname][n] );
                } else if ( (gname != "bullets" || c == last_c) && pix == last_pix + 1 ) {
                    clct.push( hits[gname][n] );
                } else {
                    if ( clct.length > 1 ) {
                        rs.push( {texts: clct, kind: gname} );
                    } else {
                    }
                    var clct = [ hits[gname][n] ]
                }
                last_pix = pix;
                last_c = c;

            }   // loop hits
            if ( clct.length > 1 ) {
                rs.push( {texts: clct, kind: gname} );
            }
        }
        rs.sort( function(a,b) {
            try {
                // if ( a.kind < b.kind ) return -1;
                // if ( a.kind > b.kind ) return 1;
                var at = a.texts[0].parentStory.id * 1000000 + a.texts[0].index,
                    bt = b.texts[0].parentStory.id * 1000000 + b.texts[0].index;
                return at - bt;
            } catch(e) {
                return 0;
            }
        })
        return rs;
    }
    function get_p_indexes( doc ) {
        var ixs = {};
        for ( var ns = 0; ns < stories.length; ns++ ) {
            var st = stories[ns];
            var id = "_" + st.id;
            ixs[id] = [];
            var paras = st.paragraphs.everyItem().getElements();
            for ( var np = 0; np < paras.length; np++ ) {
                ixs[id].push( paras[np].index );
            }
        }
        return ixs;
    }
    function get_p_index( txt ) {
        var id = "_" + txt.parentStory.id;
        var pix = pixs[id];
        for ( var n = pix.length-1; n >= 0; n-- ) {
            if ( txt.index >= pix[n] ) return n;
        }
        return -1;
    }

}

function __(id) {
    var txt = "";
        // loc_strings = __readJson(get_script_folder_path() + "/Strings.json");
        loc_strings = __readJson( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/Strings.json");
        if (!loc_strings || !loc_strings.hasOwnProperty(script_id)) {
            return id;
        }
        loc_strings = loc_strings[script_id];
        if (DBG) $.writeln("loaded loc-strings");

    if (loc_strings.hasOwnProperty(id)) {
        txt = localize(loc_strings[id]);
    } else {
        txt = id
    }
    var re;
    for (var n = 1; n < arguments.length; n++) {
        try {
            re = new RegExp("_" + n.toString() + "_");
            txt = txt.replace(re, arguments[n].toString());
        } catch (e) {
            __log("error", e.message + " on " + e.line, script_id);
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