script_id = "check-articles"

#include "./Scripts Panel/Octopus/Octopus-include-2.jsxinc"
__init();
$.writeln( "guid: " + app.extractLabel("octopus_guid"));
test();
function test() {
  var doc = app.activeDocument;
  var layer_name = "ᴥ " + __("sequence");
  var layer = doc.layers.item(layer_name);
  if ( ! layer.isValid ) {
    layer = doc.layers.add({ name: layer_name });
  }

  var stories = {};
  for ( var n = 0; n < doc.stories.length; n++ ) {
    stories[ "_" + doc.stories[n].id ] = [];
  }
  for ( var na = 0; na < doc.articles.length; na++ ) {
    var a = doc.articles[na];
    for ( var nm = 0; nm < a.articleMembers.length; nm++ ) {
      var ref = a.articleMembers[nm].itemRef;
      if ( ref.hasOwnProperty("parentStory") ) {
        stories[ "_" + ref.parentStory.id ].push( a.id );
      }
    }
  }
  $.bp();
  for ( var sid in stories ) {
    if ( stories[sid].length < 2 ) continue;
    var names= [];
    for ( var n = 0; n < stories[sid].length; n++ ) {
      names.push( doc.articles.itemByID( stories[sid][n] ).name );
    }
    var s = doc.stories.itemByID( Number( sid.substr(1) ) );
    var tf = s.textContainers[0];
    var dup = tf.duplicate( layer );
    dup.strokeColor = "Magenta";
    dup.fillColor = "Paper";
    dup.fillTransparencySettings.blendingSettings.opacity = 80;
    dup.parentStory.contents = names.join("\n");
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