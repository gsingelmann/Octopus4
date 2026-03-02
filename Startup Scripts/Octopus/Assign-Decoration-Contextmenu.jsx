// placeByContext.jsx
// © Gerald Singelmann, 09/2008
// Dateien platzieren per Kontextmenu. 
//
// Versucht, die ausgewählte Datei auf das markierte Objekt zu platzieren. 
// Funktioniert auch mit mehreren ausgewählten Objekten bzw. mehreren Dateien
//
// Gebrauch wie immer auf eigene Gefahr, 
// wir können nicht garantieren, dass das Script nicht mal unerwartete Ergebnisse erzeugt
// 
#targetengine "assign-decoration" 
#include "Include.jsxinc";
var script_id = "assign-decoration-cm";
__init();

var dbg = false;
// app.eventListeners.add("beforeQuit", onQuitHandler);

var sMenuName = { en: "ᴥ Assign Decoration", de: "ᴥ Als Dekoration kennzeichnen" };

AssignDecoration(); 
function AssignDecoration(){ 
	var myLayoutContextMenu = app.menus.item("$ID/RtMouseLayout"); 

	try{ 
		var myAssignAction = app.scriptMenuActions.item(localize(sMenuName)); 
		myAssignAction.name; 
	} catch(myError){
		var myAssignAction = app.scriptMenuActions.add(localize(sMenuName)); 
	} 
	var myEventListener = myAssignAction.eventListeners.add("onInvoke", myAssignHandler, false); 
	myAssignAction.eventListeners.add("beforeDisplay", function(){ myAssignAction.enabled = (app.selection.length > 0) }, false);
	
	var myLSep = myLayoutContextMenu.menuSeparators.add();
	var myLAssignMenuItem = myLayoutContextMenu.menuItems.add(myAssignAction); 

	function myAssignHandler(myEvent){ 
		__log("run", script_id, script_id)
		try { 
			//-----------------------
			var n = 0;
			for ( var ns = 0; ns < app.selection.length; ns++ ) {
				try {
					var sel = app.selection[ns];
					sel.objectExportOptions.altTextSourceType = SourceType.SOURCE_DECORATIVE_IMAGE;
					sel.objectExportOptions.applyTagType = TagType.TAG_ARTIFACT;
					n++;
				} catch(e) {
					__log("error", "Could not set decoration for object " + sel.constructor.name + ": " + e.message + " on " + e.line, script_id);
				}
			}
			__alert("info", localize({ en: n + " object(s) marked as decoration.", de: n + " Objekt(e) als Dekoration gekennzeichnet." }), "", "OK", false);
			//-----------------------
		} catch(e) {
			__log("error", "Error in loop: " + e.message + " on " + e.line, script_id);
		}
	}
}
function onQuitHandler() {
	try {
		var action = app.scriptMenuActions.item(localize(sMenuName)); 
		action.remove();
		__log("dbg", "assign action removed", script_id)
	} catch (e) {
		__log("error", "Fehler beim Aufräumen: " + e.message + " on " + e.line, "installer");
		if (DBG) $.writeln(e.message + " on " + e.line);
	}
}
