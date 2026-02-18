#include "./Octopus-include-2.jsxinc"
__init();
$.writeln( "guid: " + app.extractLabel("octopus_guid"));
enc();
function test() {
    var prefs = app.extractLabel( "octopus_collect_fonts" );
    var scriptPath, scriptFolderPath;
    try {
      return app.activeScript.parent.fullName;
    } catch (e) { 
      return e.fileName.replace(/\/[^\/]+$/, "");
    }
    return scriptPath;
  return;
  var a = '{"PATH_SCRIPT_PARENT":"/Users/singel/Library/Preferences/Adobe InDesign/Version 21.0/en_GB/Scripts","PATH_USER_FOLDER":"~/Library/Application Support/Octopus4","PATH_DATA_FOLDER":"~/Library/Application Support/Octopus4/Data","PATH_LOG_FILE":"~/Library/Application Support/Octopus4/Data/_log.json"}'
  app.insertLabel("Octopus4-Paths", a);
  return;
  var j = __readJson( "/Users/singel/Dropbox/PARA/01-Projekte/Satzkiste/Octopus/ScripteV4/Octopus/index.json" );
  for ( var n = 0; n < j.length; n++ ) {
    if ( j[n].id ) $.writeln( j[n].id );
  }
}
function enc() {
  var paths = [
    "/Users/singel/Desktop/encodings/utf.txt",
    "/Users/singel/Desktop/encodings/utf.txt",
    "/Users/singel/Desktop/encodings/utf.txt",
  ];
  var encs = [
    "utf-8",
    "Macintosh",
    "Windows-1252"
  ]
  var rows = [];
  for ( var i = 0; i < paths.length; i++ ) {
    var f = new File( paths[i] );
    f.encoding = encs[i];
    f.open("r");
    var c = f.read();
    f.close();
    rows.push( "Encoding: " + encs[i] + " - " + c.length + " chars" + ": " + c  );
    $.writeln( "Encoding: " + encs[i] + " - " + c.length + " chars" + ": " + c );
  }

  // alert( "enc: \n" + rows.join("\n") );
  // var w = new Window("dialog", "Encodings");
  // var l = w.add("statictext", undefined, rows.join("\n"), {multiline: true} );
  // w.cancelElement = w.add("button", undefined, "OK");
  // w.show();
  __alert( "info", rows.join("\n"), "Encodings", "OK", true );
}
// function __alert( level, msg, titel, btn, is_palette )