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
#targetengine octopus_check_tags
#include "Startup Scripts/Octopus/Include.jsxinc"
var script_id = "check-tags"
__init();
__log("run", script_id, script_id);

var w = new Window( "palette {alignChildren: ['fill', 'fill']}" );

check_tags();

function check_tags() {
    if ( app.documents.length == 0 ) return;
    var doc = app.activeDocument;

    var msg = check_doc_state( doc );

    __insert_head( w, script_id );

    w.btns = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    w.add_btn = w.btns.add("button", undefined, __('add-btn'));
    w.remove_btn = w.btns.add("button", undefined, __('rm-btn'));
    // w.cancel_btn = w.btns.add("button", undefined, __('cancel'));

    if ( msg ) {
        w.add("statictext", [undefined, undefined, undefined, 100], msg, {multiline: true});
    }
    
    w.add_btn.onClick = function() {
        create_markers();
    }
    w.remove_btn.onClick = function() {
        delete_markers();
    }
    // w.cancel_btn.onClick = function() {
    //     w.close();
    //     btn_pressed = "cancel";
    //     return 2;
    // }

    delete_markers();

    var prev_pref = doc.conditionalTextPreferences.showConditionIndicators;
    doc.insertLabel("octopus_checktags_prevpref", prev_pref.toString())
    doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode.SHOW_INDICATORS;

    panel_visibility( "$ID/#CondTextUI_WinMenu", true);

    var a = w.show();

    //  Ursprünglich war "delete_marker" auf der Alt-Taste
    // var pressed_key = ScriptUI.environment.keyboardState.keyName;
    // if ( ! pressed_key ) pressed_key = ScriptUI.environment.keyboardState.shiftKey ? "d" : "";
    // if ( pressed_key.toLowerCase() == "d" ) {
    //     delete_markers();
    //     return;
    // } 




    function create_markers() {
        app.findTextPreferences = NothingEnum.NOTHING;
        with (app.findChangeTextOptions) {
            includeMasterPages = true;
            includeFootnotes = true;
        }
        // -------------------------------------------------------------------------------------
        //  Tags hängen an Absatzformaten, also gehen wir die die Reihe nach durch.
        // -------------------------------------------------------------------------------------
        var pstyles = doc.allParagraphStyles;
        for (var np = 1; np < pstyles.length; np++) {
            var ps = pstyles[np];
            $.writeln("------------");
            $.writeln(ps.name);
            $.bp(ps.name == "Zitat");
            // ---------------------------------------------------------------------------------
            //  setms hat 0 bis 2 items: auto, epub und/oder pdf
            // ---------------------------------------------------------------------------------
            var setms = ps.styleExportTagMaps;
            var tag = "Automatisch"
            for (var ns = 0; ns < setms.length; ns++) {
                var s = setms[ns];
                $.writeln( s.exportType.toString() + " - " + s.exportTag.toString() )
                if ( s.exportType.toString() == "PDF" ) tag = s.exportTag.toString();
            }
            // ---------------------------------------------------------------------------------
            //  Listen haben Sonderregeln
            // ---------------------------------------------------------------------------------
            var is_list = ps.bulletsAndNumberingListType != ListType.NO_LIST;
            var apply_these = [];
            if ( is_list && tag == "Automatisch" ) {
                apply_these.push( get_condition("List") );
            } else if ( is_list && tag != "Automatisch" ) {
                apply_these.push( get_condition(tag) );
                apply_these.push( get_condition("Alarm-List") );
            } else {
                apply_these.push( get_condition(tag) );
            }
            // ---------------------------------------------------------------------------------
            //  Alle Texte mit dem Absatzformat suchen
            // ---------------------------------------------------------------------------------
            app.findTextPreferences.appliedParagraphStyle = ps;
            var texts = doc.findText();
            for ( var nt = 0; nt < texts.length; nt++ ) {
                for ( var nc = 0; nc < apply_these.length; nc++ ) {
                    set_condition(texts[nt], apply_these[nc] );
                }
            }
        }    
    }
    function delete_markers() {
        var conds = doc.conditions.everyItem().getElements();
        for ( var n = conds.length-1; n >= 0; n-- ) {
            var lbl = conds[n].extractLabel("octopus-purpose");
            // if ( conds[n].name.charAt(0) == "\u2234" ) {
            if ( lbl == "CheckTags" ) {
                conds[n].remove();
            }
        }
        try {
            var prev_pref = doc.extractLabel("octopus_checktags_prevpref")
            doc.conditionalTextPreferences.showConditionIndicators = ConditionIndicatorMode[prev_pref];
        } catch (e) { }
    }



    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------
    function check_doc_state( doc ) {
        var locked_stories = 0,
            locked_layers = 0,
            hidden_layers = 0;
        var msg = "";
        var stories = doc.stories.everyItem().getElements();
        for ( var n = 0; n < stories.length; n++ ) {
            var is_locked = false;
            for ( var m = 0; m < stories[n].textContainers.length; m++ ) {
                if (stories[n].textContainers[m].locked) is_locked = true;
            }
            if ( is_locked ) locked_stories++;
        }
        var layers = doc.layers.everyItem().getElements();
        for ( var n = 0; n < layers.length; n++ ) {
            if ( layers[n].locked ) locked_layers++;
            if ( layers[n].visible == false ) hidden_layers++;
        }
        if ( locked_stories ) msg += locked_stories + " " + __('locked-stories') + "\n";
        if ( locked_layers ) msg += locked_layers + " " + __('locked-layers') + "\n";
        if ( hidden_layers ) msg += hidden_layers + " " + __('hidden-layers') + "\n";
        return msg;
    }

    function set_condition(text, cond) {
        var rngs = text.textStyleRanges.everyItem().getElements();
        for (var n = 0; n < rngs.length; n++) {
            var a = rngs[n].appliedConditions;
            var gotit = false;
            for (var m = 0; m < a.length; m++) {
                if (a[m] == cond) gotit = true;
            }
            if (gotit) continue;
            a.push(cond);
            rngs[n].appliedConditions = a;
        }
    }
    function unset_condition(text, cond) {
        var rngs = text.textStyleRanges.everyItem().getElements();
        for (var nr = 0; nr < rngs.length; nr++) {
            var a = rngs[nr].appliedConditions;
            if (a.length == 1) {
                rngs[nr].appliedConditions = [];
            } else {
                for (var n = a.length - 1; a >= 0; a--) {
                    if (a[n] == cond) a.splice(n, 1)
                }
                rngs[nr].appliedConditions = a;
            }
        }
    }
    function get_condition(name) {
        var color = get_color( name );
        var cond = doc.conditions.item("\u2234 " + name);
        if (!cond.isValid) cond = app.activeDocument.conditions.add({
            name: "\u2234 " + name,
            indicatorColor: color,
            indicatorMethod: ConditionIndicatorMethod["USE_HIGHLIGHT"],
            underlineIndicatorAppearance: ConditionUnderlineIndicatorAppearance["SOLID"]
        });
        cond.insertLabel("octopus-purpose", "CheckTags")
        return cond;
    }
    function get_color( name ) {
        name = name.toLowerCase();
        var map = {
            automatisch: [ 3, 169, 244 ],
            p: [ 3, 169, 244 ],
            h1: [ 156, 39, 176 ],
            h2: [ 103, 58, 183 ],
            h3: [ 63, 81, 181 ],
            h4: [ 33, 150, 243 ],
            h5: [ 33, 150, 150 ],
            h6: [ 33, 150, 100 ],
            list: [ 250, 193, 7 ],
            "alarm-h": [ 255, 0, 0 ],
            "alarm-list": [ 255, 0, 0 ],
            "artifact": [ 190, 235, 150 ],
        };
        if ( map.hasOwnProperty( name ) ) {
            return map[ name ];
        } else {
            return map[ "alarm-h" ];
        }
    }
    function panel_visibility(menu_action, visibility) {
        var dbg = false;
        visibility = !!visibility;

        var panels = app.panels.everyItem().getElements();
        var vis = [];
        for (var n = 0; n < panels.length; n++) {
            try {
            if (dbg) $.writeln( n + ": " + panels[n].name + "   ")
                vis[n] = panels[n].visible;
            } catch (e) {
                if (dbg) $.writeln( e.message + " on " + e.line )
            }
        }
        var ma = app.menuActions.item(menu_action);
        if (ma && ma.isValid) {
            if (dbg) $.writeln( "toggling " + menu_action );
            ma.invoke();
        } else {
            if (dbg) $.writeln( "invalid: " + menu_action );
            return null;
        }
        for (var n = 0; n < panels.length; n++) {
            try {
                if (vis[n] !== panels[n].visible) {
                    if (dbg) $.writeln( "setting " + panels[n] + " name" );
                    panels[n].visible = visibility;
                    return true;
                }
            } catch (e) {
                if (dbg) $.writeln( e.message + " on " + e.line )
            }
        }
    return false;
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