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
#targetengine "octopus-2" 
#include "Startup Scripts/Octopus/Include.jsxinc";
var script_id = "assign-decoration";
__init();

var dbg = false;

AssignDecoration(); 
function AssignDecoration(){ 
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