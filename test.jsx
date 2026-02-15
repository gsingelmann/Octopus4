#include "./Startup Scripts/Octopus/Octopus-include-2.jsxinc"
__init();
$.writeln( test() );

function test() {
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