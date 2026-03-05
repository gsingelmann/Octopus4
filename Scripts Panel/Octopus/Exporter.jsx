/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Exports a bunch of documents to PDF

+    This script is part of project-octopus.net

+   Author: Gerald Singelmann, gs@cuppascript.com
+   Supported by: Satzkiste GmbH, post@satzkiste.de

+    Modified: 2023-11-22

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
#include "Startup Scripts/Octopus/Include.jsxinc"
__init();
var script_id = "exporter";
__log( "run", script_id, script_id);

batch_export();

function batch_export() {
  if (app.documents.length == 0 && app.books.length == 0 ) {
    __alert("stop", __('need_something_open'), 'Stop', 'OK')
    return
  }
  var choice = null;
  var preset_names = app.pdfExportPresets.everyItem().name;
  var aux = preset_names.constructor.name;
  preset_names.sort( function (a,b) {
    if ( a[0] == "[" && b[0] != "[") return 1;
    if ( a[0] != "[" && b[0] == "[") return -1;
    if ( a.toLowerCase() < b.toLowerCase() ) return -1;
    if ( a.toLowerCase() > b.toLowerCase() ) return 1;
    return 0;
  });

  var use_tgt_path = app.extractLabel("octopus_exporter_usetgtpath") == "true";
  var tgt_path_def = app.extractLabel("octopus_exporter_tgtpath");
  if ( ! tgt_path_def ) tgt_path_def = Folder.myDocuments.fullName;
  var rel_path_def = app.extractLabel("octopus_exporter_relpath");
  if ( ! rel_path_def ) rel_path_def = "./";
  var preset_def = app.extractLabel("octopus_exporter_preset");
  if ( ! preset_def ) preset_def = 3;
  var preset_snd_def = app.extractLabel("octopus_exporter_preset");
  if ( ! preset_snd_def ) preset_snd_def = preset_def;
  var package_def = app.extractLabel("octopus_exporter_package");
  var package_def = app.extractLabel("octopus_exporter_package");
  if ( package_def) {
    package_def = JSON.parse( package_def )
  } else {
    package_def = {
      copy_fonts: true,
      copy_links: true,
      copy_icc: false,
      update_links: true,
      hidden_layers: true,
      ignore_preflight: true,
      create_report: true,
      idml: true,
      pdf: false,
      pdf_style: preset_names[ preset_def ],
      hyph: false
    }      
  }


  var w = new Window("dialog {alignChildren: ['fill', 'fill']}");
  w.script_id = script_id;
  
  var aux = app.extractLabel("octopus_exporter_checkboxes");
  if ( aux ) {
    w.todo_selection = JSON.parse( aux );
  } else {  
    w.todo_selection = {
      pdf: true,
      pdf2: false,
      saveas: false,
      idml: false,
      pckg: false,
      png: false,
      jpg: false
    }
  }
  // -----------------------------------------------------------------------------------------------------------------------------------
  //  KOPF
  // -----------------------------------------------------------------------------------------------------------------------------------
  __insert_head( w, script_id );

  // -----------------------------------------------------------------------------------------------------------------------------------
  //  Welche Dokumente
  // -----------------------------------------------------------------------------------------------------------------------------------
  w.doc_group = w.add("panel {orientation: 'row', alignChildren: ['left', 'fill'], text: '" + __('doc-group') + "'}")
  // row.add("radiobutton", undefined, __("ui_on")
  w.which = [];
  w.which.push( w.doc_group.add("radiobutton", undefined, __('crnt_doc')) );
  w.which.push( w.doc_group.add("radiobutton", undefined, __('open_docs')) );
  w.which.push( w.doc_group.add("radiobutton", undefined, __('crnt_book')) );
  // w.which.push( w.doc_group.add("radiobutton", undefined, __('folder_content')) );
  default_which();

  // -----------------------------------------------------------------------------------------------------------------------------------
  //  Speicherort
  // -----------------------------------------------------------------------------------------------------------------------------------
  w.where_group = w.add("panel {orientation: 'row', alignChildren: ['left', 'center'], text: '" + __('save_location_hd') + "'}")
  w.tgt_btn = w.where_group.add("radiobutton", undefined, __('targetfolder'));
  w.rel_btn = w.where_group.add("radiobutton", undefined, __('relativefolder'));
  w.tgt_btn.value = use_tgt_path;
  w.rel_btn.value = ! use_tgt_path;
  w.rel_path = w.where_group.add("edittext", [undefined, undefined, 200, 20], rel_path_def);

  // -----------------------------------------------------------------------------------------------------------------------------------
  //  PDF und Verpacken nebeneinander
  // -----------------------------------------------------------------------------------------------------------------------------------
  w.btn_row = w.add("group { orientation: 'row', alignChildren: ['fill', 'fill']}")

  w.left_column = w.btn_row.add("group {orientation: 'column', alignChildren: ['fill', 'top']}");

  w.pdf_group = w.left_column.add("panel {orientation: 'column', text: '" + __('pdf_group') + "', alignChildren: ['fill', 'top']} ")
  w.pdf_yesno = w.pdf_group.add("checkbox", undefined, __('pdfexport'))
  w.pdf_yesno.value = w.todo_selection.pdf;
  // w.pdf_btn = w.pdf_group.add("button", undefined, __('pdfexport'));
  w.preset_dd = w.pdf_group.add("dropdownlist", undefined, preset_names);
  try { w.preset_dd.selection = Number(preset_def); } catch(e){}
  w.snd_pdf_yesno = w.pdf_group.add("checkbox", undefined, __('pdfexport'))
  w.snd_pdf_yesno.value = w.todo_selection.pdf2;
  w.snd_preset_dd = w.pdf_group.add("dropdownlist", undefined, preset_names);
  try { w.snd_preset_dd.selection = Number(preset_snd_def); } catch(e){}
  w.preset_dd.enabled = w.pdf_yesno.value;
  w.snd_preset_dd.enabled = w.snd_pdf_yesno.value;

  w.id_group = w.left_column.add("panel {orientation: 'column', text: 'InDesign', alignChildren: ['fill', 'top']} ")
  w.saveas_yesno = w.id_group.add("checkbox", undefined, __('saveas'));
  w.idml_yesno = w.id_group.add("checkbox", undefined, __('idmlexport'));
  w.saveas_yesno.value = w.todo_selection.saveas;
  w.idml_yesno.value = w.todo_selection.idml;
  // w.indd_btn = w.id_group.add("button", undefined, __('saveas'));
  // w.idml_btn = w.id_group.add("button", undefined, __('idmlexport'));

  w.px_group = w.left_column.add("panel {orientation: 'column', text: '" + __('images') + "', alignChildren: ['fill', 'top']} ")
  w.png_yesno = w.px_group.add("checkbox", undefined, __('pngexport'));
  w.jpg_yesno = w.px_group.add("checkbox", undefined, __('jpgexport'));
  w.png_yesno.value = w.todo_selection.png;
  w.jpg_yesno.value = w.todo_selection.jpg;

  
  w.package_group = w.btn_row.add("panel {orientation: 'column', text: '" + __('package_group') + "', alignChildren: ['fill', 'top']} ")
  // w.package_btn = w.package_group.add("button", undefined, __('package'))
  w.package_yesno = w.package_group.add("checkbox", undefined, __('package'))
  w.package_yesno.value = w.todo_selection.pckg;
  w.package_group.add("panel", [undefined, undefined, 200, 1 ])
  w.package_group.copy_fonts = w.package_group.add("checkbox", undefined, __('copy_fonts'))
  w.package_group.copy_links = w.package_group.add("checkbox", undefined, __('copy_links'))
  w.package_group.update_links = w.package_group.add("checkbox", undefined, __('update_links'))
  w.package_group.hidden_layers = w.package_group.add("checkbox", undefined, __('hidden_layers'))
  w.package_group.create_report = w.package_group.add("checkbox", undefined, __('create_report'))
  w.package_group.idml = w.package_group.add("checkbox", undefined, __('idml'))
  w.package_group.pdf = w.package_group.add("checkbox", undefined, __('pdf'))
  w.package_group.pdf_style = w.package_group.add("dropdownlist", undefined, preset_names);

  w.package_group.copy_fonts.value = package_def.copy_fonts;
  w.package_group.copy_links.value = package_def.copy_links;
  w.package_group.update_links.value = package_def.update_links;
  w.package_group.hidden_layers.value = package_def.hidden_layers;
  w.package_group.create_report.value = package_def.create_report;
  w.package_group.idml.value = package_def.idml;
  w.package_group.pdf.value = package_def.pdf;
  try { w.package_group.pdf_style.selection = Number(package_def.pdf_style); } catch(e){}
  w.package_group.pdf_style.enabled = package_def.pdf;


  w.cancel_group = w.add("group {orientation: 'row', alignChildren: ['center', 'center']}");
  w.cancelElement = w.cancel_group.add("button", undefined, __('cancel'));
  w.defaultElement = w.cancel_group.add("button", undefined, __('export'));

  // -----------------------------------------------------------------------------------------------------------------------------------
  //  Button Handler
  // -----------------------------------------------------------------------------------------------------------------------------------
  // w.package_btn.onClick = function() { choice = "package"; this.window.close() }
  // w.pdf_btn.onClick = function() { choice = "pdf"; this.window.close() }
  // w.indd_btn.onClick = function() { choice = "saveas"; this.window.close() }
  // w.idml_btn.onClick = function() { choice = "idml"; this.window.close() }
  w.package_group.pdf.onClick = function () { w.package_group.pdf_style.enabled = this.value; }

  w.pdf_yesno.onClick = function () { 
    // w.todo_selection.pdf = this.value; 
    w.preset_dd.enabled = this.value;
  }
  w.snd_pdf_yesno.onClick = function () { 
    // w.todo_selection.pdf = this.value; 
    w.snd_preset_dd.enabled = this.value;
  }
  // w.saveas_yesno.onClick = function () { w.todo_selection.saveas = this.value; }
  // w.idml_yesno.onClick = function () { w.todo_selection.idml = this.value; }
  // w.package_yesno.onClick = function () { w.todo_selection.pckg = this.value; }
  // w.jpg_yesno.onClick = function () { w.todo_selection.jpg = this.value; }
  // w.png_yesno.onClick = function () { w.todo_selection.png = this.value; }

  if ( w.show() == 2 ) return

  w.todo_selection = {
    pdf: w.pdf_yesno.value,
    pdf2: w.snd_pdf_yesno.value,
    saveas: w.saveas_yesno.value,
    idml: w.idml_yesno.value,
    pckg: w.package_yesno.value,
    jpg: w.jpg_yesno.value,
    png: w.png_yesno.value,
  }

  var pdf_preset_export, snd_pdf_preset_export, pdf_preset_package;
  for ( var n = 0; n < app.pdfExportPresets.length; n++ ) {
    var aux = w.preset_dd.selection.text;
    if ( w.preset_dd.selection.text == app.pdfExportPresets.item(n).name ) pdf_preset_export = app.pdfExportPresets.item(n);
    if ( w.snd_preset_dd.selection.text == app.pdfExportPresets.item(n).name ) snd_pdf_preset_export = app.pdfExportPresets.item(n);
    if ( w.package_group.pdf_style.selection.text == app.pdfExportPresets.item(n).name ) pdf_preset_package = app.pdfExportPresets.item(n);
  }
  // var pdf_preset = app.pdfExportPresets.item( w.preset_dd.selection.index );
  var pp = {
    copy_fonts: w.package_group.copy_fonts.value,
    copy_links: w.package_group.copy_links.value,
    update_links: w.package_group.update_links.value,
    hidden_layers: w.package_group.hidden_layers.value,
    create_report: w.package_group.create_report.value,
    idml: w.package_group.idml.value,
    pdf: w.package_group.pdf.value,
    pdf_style: pdf_preset_package.name,
    copy_icc: false,
    ignore_preflight: true,
    hyph: false
  }

  app.insertLabel( "octopus_exporter_relpath", w.rel_path.text );
  app.insertLabel( "octopus_exporter_preset", w.preset_dd.selection.index.toString() );
  app.insertLabel( "octopus_exporter_snd_preset", w.snd_preset_dd.selection.index.toString() );
  app.insertLabel( "octopus_exporter_usetgtpath", w.tgt_btn.value.toString() );
  app.insertLabel( "octopus_exporter_package", JSON.stringify(pp) );
  app.insertLabel( "octopus_exporter_checkboxes", JSON.stringify( w.todo_selection ));



  // --------------------------------------------------------------------------------------------------------------------------------
  //   Ggf Target Folder wählen
  // --------------------------------------------------------------------------------------------------------------------------------
  // if ( " saveas package pdf idml jpg png ".indexOf( choice ) != -1 ) {
    if ( w.tgt_btn.value ) {
      var tgt_is_relative = false;
      var tgt_location = new Folder( tgt_path_def );
      var tgt_location = tgt_location.selectDlg( __('choose_tgt_folder') );
      if ( ! tgt_location ) return;
      app.insertLabel("octopus_exporter_tgtpath", tgt_location.fullName );
    } else {
      var tgt_is_relative = true;
      var tgt_location = w.rel_path.text;
    }
  // }






  // -----------------------------------------------------------------------------------------------------------------------------------
  //  DOCs-Array sammeln
  // -----------------------------------------------------------------------------------------------------------------------------------
  var aux = get_which(),
      docs = [];
  if ( aux == 1 ) {
    docs = [ app.activeDocument ];
  } else if ( aux == 2 ) {
    docs = app.documents.everyItem().getElements();
  } else if ( aux == 4 ) {
    for (var n = 0; n < app.books.item(0).bookContents.length; n++) {
      docs.push( app.books.item(0).bookContents.item(n).fullName );
    }
  } 

  var pbw = new Window("palette");
  pbw.pb = pbw.add("progressbar", [undefined, undefined, 400, 20]);
  pbw.pb.maxvalue = docs.length; 
  pbw.show();
  var errors = [];
  for ( var n = 0; n < docs.length; n++ ) {
    pbw.pb.value = n+1;
    // --------------------------------------------------------------------------------------------------------------------------------
    //   Ggf File öffnen
    // --------------------------------------------------------------------------------------------------------------------------------
    var was_file = docs[n].constructor.name == "File";      
    if ( was_file ) {
      app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
      try {
        docs[n] = app.open( docs[n] );
      } catch(e) {
        errors.push( docs[n].name + ": " + e );
      } finally {
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.iNTERACT_WITH_ALL;
      }
    }
    app.activeDocument = docs[n];
    // --------------------------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------------------------
    //  Verteiler
    // --------------------------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------------------------
    // if ( choice == "save" ) {
    //   try { docs[n].save() } catch(e) { errors.push( docs[n].name + ": " + e )}
    // }

    // if ( choice == "saveclose" ) {
    //   try { 
    //     docs[n].save();
    //     docs[n].close( SaveOptions.NO ) 
    //   } catch(e) { errors.push( docs[n].name + ": " + e )}
    // }

    var aux = w.todo_selection;
    if ( w.todo_selection.saveas ) {
      var tgt = get_target( docs[n], tgt_location, "indd", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].save( tgt );
    }

    if ( choice == "package" || w.todo_selection.pckg ) {
      var tgt = get_target( docs[n], tgt_location, "", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].packageForPrint( tgt, pp.copy_fonts, pp.copy_links, pp.copy_icc, pp.update_links, pp.hidden_layers, pp.ignore_preflight, pp.create_report, pp.idml, pp.pdf, pdf_preset_package.name, pp.hyph );
    }

    if ( choice == "close" ) {
      docs[n].close( SaveOptions.NO);
    }

    if ( choice == "pdf" || w.todo_selection.pdf ) {
      app.pdfExportPreferences.viewPDF = false;
      var tgt = get_target( docs[n], tgt_location, "pdf", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].exportFile( ExportFormat.PDF_TYPE, tgt, false, pdf_preset_export )
    }
    if ( choice == "pdf" || w.todo_selection.pdf2 ) {
      app.pdfExportPreferences.viewPDF = false;
      // tgt setzen und rename ist einfacher
      var tgt = get_target( docs[n], tgt_location, "pdf", tgt_is_relative )
      if ( ! tgt ) continue;
      var tgt2 = new File( tgt.fullName.replace(/\.pdf/i, "-2.pdf") );
      docs[n].exportFile( ExportFormat.PDF_TYPE, tgt2, false, snd_pdf_preset_export )
    }

    if ( choice == "idml" || w.todo_selection.idml ) {
      var tgt = get_target( docs[n], tgt_location, "idml", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].exportFile( ExportFormat.INDESIGN_MARKUP, tgt, false )  
    }

    if ( choice == "jpg" || w.todo_selection.jpg ) {
      var tgt = get_target( docs[n], tgt_location, "jpg", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].exportFile( ExportFormat.JPG, tgt, false )
    }

    if ( choice == "png" || w.todo_selection.png ) {
      var tgt = get_target( docs[n], tgt_location, "png", tgt_is_relative )
      if ( ! tgt ) continue;
      docs[n].exportFile( ExportFormat.PNG_FORMAT, tgt, false )
    }
  }
  pbw.close();
  if ( errors.length ) {
    __alert( "warnung", "errors: \n" + errors.join("\n") );
  }






  // returns folder if ext == ""s
  function get_target( doc, loc, ext, tgt_is_relative ) {
    if ( ! doc.saved && tgt_is_relative ) {
      errors.push( __('doc_not_saved', doc.name));
      return null;
    }
    if ( typeof loc == "string" ) {
      var folder = doc.fullName.parent;
      if ( loc !== "" ) {
        folder.changePath( loc );
        ensure_path_exists( folder.fullName, false );
      }
    } else {
      var folder = loc;
    }
    if ( ext ) {
      return new File( folder.fullName.toString() + "/" + doc.name.replace(/\.indd$/i, "") + "." + ext );
    } else {
      return new Folder( folder.fullName.toString() + "/" + doc.name.replace(/\.indd$/i, ""));
    }
  }
  function ensure_path_exists( path, is_file ) {
    path = path.replace(/^\/+/, "");
    var bits = path.split("/");
    var base_path = "";
    var ix = 0;
    if ( bits[0] == "~" ) {
      base_path = bits[0] + "/" + bits[1];
      ix = 2;
    }
    var max = is_file ? bits.length-1 : bits.length;
    for ( var n = ix; n < max; n++ ) {
      var _aux = base_path + "/" + bits[n];
      if ( ! Folder( base_path + "/" + bits[n] ).exists ) {
        Folder( base_path + "/" + bits[n] ).create();
      }
      if ( n == 0 && bits[n] == "~" ) {
        base_path += bits[n];
      } else {
        base_path += "/" + bits[n];
      }
    }
    return unescape(base_path);
  }

  // 1≈active, 2≈all, 4≈book .8≈folder
  function get_which() {
    var v = 0;
    for ( var n = 0; n < w.which.length; n++ ) v += w.which[n].value * Math.pow(2, n);
    return v;
  }
  function default_which() {
    w.which[0].enabled = app.documents.length > 0;
    w.which[1].enabled = app.documents.length > 1;
    w.which[2].enabled = app.books.length > 0;
    if ( app.documents.length > 1 ) {
      w.which[1].value = true;
    } else if ( app.documents.length == 1 ) {
      w.which[0].value = true;
    } else if ( app.books.length > 0 ) {
      w.which[2].value = true;
    } else {
      // w.which[3].value = true;
    }
  }

}

function __( id ) {
  var txt = "";
    loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
    if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
      return id;
    }
    loc_strings = loc_strings[ script_id ];
    if (DBG) $.writeln("loaded loc-strings");

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