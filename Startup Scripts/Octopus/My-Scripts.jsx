#targetengine "octopus-2"

#include "Octopus-include-su.jsxinc"
__init();

install_my_scripts();

function install_my_scripts() {
  try {
    // -----------------------------------------------------------------------------------------------------------------
    //  Ordner und Scripte finden
    // -----------------------------------------------------------------------------------------------------------------
    var my_scripts_folder = new Folder( PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus/My-Scripts");
    __ensureFolder( my_scripts_folder.fullName );

    var scripts = [];
    var files = my_scripts_folder.getFiles( )
    // __log("dbg", files.length + " files in '" + my_scripts_folder.fullName + "'", "my-scripts");
    for ( var n = 0; n < files.length; n++ ) {
      if ( files[n].name.charAt(0) =="." ) continue;
      var aux = files[n].name.search(/\.(js|jsx|jsbin|jsxbin|idjs)(\.lnk)?$/i );
      // __log("dbg", files[n].name + " -> " + aux );
      if ( aux == -1 ) continue;
      if ( files[n].alias ) {
        var aux = files[n].resolve();
        if ( aux ) {
          scripts.push( {file: aux, name: files[n].name.replace(/\.[^.]+$/, "") });
        } else {
          scripts.push( {file: files[n], name: files[n].name.replace(/\.[^.]+$/, "") });
        }
      } else {
        scripts.push( {file: files[n], name: files[n].name.replace(/\.[^.]+$/, "") });
      }
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  Menü erstellen
    // -----------------------------------------------------------------------------------------------------------------
    // __log("dbg", scripts.length + " Scripte in MS", "my-scripts");
    if ( scripts.length ) {
      __log("run", "my-scripts", "my-scripts");
      
      scripts.sort( function(a,b) { 
        if ( a.name < b.name ) return -1;
        if ( a.name > b.name ) return 1;
        return 0;
      })

      var o_menu = get_submenu( "Octopus", undefined, "$ID/Table");
      var ms_menu = get_submenu( "My-Scripts", o_menu );
      o_menu.menuSeparators.add(LocationOptions.BEFORE, ms_menu);

      for ( var n = 0; n < scripts.length; n++ ) {
        var menu_label = scripts[n].name;
        // __log("dbg", "try " + menu_label + " '" + scripts[n].file.fullName + "'", "my-scripts");
        var tgt_path = scripts[n].file.fullName;
        var action = app.scriptMenuActions.add(menu_label);
        action.insertLabel("script-path", tgt_path);
        (function (sPath, mtxt) {
          action.eventListeners.add("onInvoke", function (event) {
            try {
              app.doScript(new File(sPath), undefined, undefined, UndoModes.ENTIRE_SCRIPT, mtxt);
            } catch (e) {
              __log("error", "Script-Aufruf fehlgeschlagen (" + sPath + "): " + e.message + " on " + e.line, "installer");
              __alert("warnung", "Script-Aufruf fehlgeschlagen (" + sPath + "): " + e.message + " on " + e.line, "OK", false)
            }
          });
        })(tgt_path, menu_label);
        ms_menu.menuItems.add( action );
        // __log("dbg", "  success", "my-scripts");
      }
    }
  } catch(e) {
    __log("error", e.message + " on " + e.line, "my-scripts");
  }


  function get_submenu(menu_name, prnt_menu, after_menu) {
    try {
      // Parent MUSS da sein als menu, sonst MAIN
      if (!prnt_menu) prnt_menu = app.menus.item("$ID/Main");

      // IdR. ist `after` ein locale-independent string
      if (after_menu && typeof after_menu == "string") {
        after_menu = prnt_menu.menuElements.item(after_menu);
      }

      var menu = prnt_menu.menuElements.item(menu_name);
      if (!menu.isValid) {
        if (after_menu) {
          menu = prnt_menu.submenus.add(menu_name, LocationOptions.AFTER, after_menu);
        } else {
          menu = prnt_menu.submenus.add(menu_name, LocationOptions.AT_END);
        }
      }
      return menu.isValid ? menu : null;
    } catch (e) {
      __log("error", "Menü-Erstellung fehlgeschlagen (" + menu_name + "): " + e.message, "installer");
      if (DBG) $.writeln("get_submenu Fehler: " + e.message + " on " + e.line);
      return null;
    }
  }

}