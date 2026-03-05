/* ----------------------------------------------------------------------------------------------------------------------
//DESCRIPTION:Makes all overset text easily visible

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
#targetengine octopus_overflow
#include "Startup Scripts/Octopus/Include.jsxinc"
__init();
var script_id = "show-overflow";
__log("run", script_id, script_id);

cellBox = null;	// wird in init gesetzt, will ich global haben
init_cellbox();

var dev = false;
if (! dev ) {
	app.doScript(main, undefined, undefined, UndoModes.ENTIRE_SCRIPT, "Show Overflow");
} else {
	main();
}

function main() {
	if (app.documents.length == 0) return;
	var doc = app.activeDocument;

	var sk_special_edition = true;
	var slots_per_clm = 5;
	var slot_gap = 2;

	var colors = [
		{
			name: "Blue",
			value: [100, 0, 0, 0]
		},
		{
			name: "Orange",
			value: [0, 50, 100, 0]
		},
		{
			name: "Green",
			value: [50, 0, 100, 0]
		},
	];
	get_prefs();



	function get_prefs() {
		var do_update = doc.layers.item(__('OF-Frames')).isValid;

		var _state = doc.extractLabel("gs_show_overflow_prefs");
		if (!_state) {
			_state = app.extractLabel("gs_show_overflow_prefs");
			if (_state) {
				_state = JSON.parse(_state);
			} else {
				_state = {
					mark_frames: true,
					show_count: true,
					show_thread: true,
					inspect_tables: true,
					mirror_layout: true,
					color: 0,
					pos: 0
				}
			}
		} else {
			_state = JSON.parse(_state);
		}

		var w = new Window('dialog' );
		w.script_id = script_id;
		w.orientation = 'column';
		w.alignChildren = ['fill', 'fill'];

		__insert_head( w, script_id );

		w.main = w.add( 'group {orientation: "column", alignChildren: ["fill","fill"]}');
		w.btns = w.add('group {orientation: "row", alignChildren: ["right", "fill"]}');

		w.state = _state;
		w.opt = w.main.add("panel { text: '" + __('Options') + "', alignChildren: ['fill', 'fill'] }");
		w.mf = w.opt.add("checkbox {text: '" + __('Mark Textframes') + "'}");
		w.mf.value = w.state.mark_frames;
		w.mf.onClick = function () {
			this.window.state.mark_frames = this.value;
		}
		w.scc = w.opt.add("checkbox {text: '" + __('Show Char-Count') + "'}");
		w.scc.value = w.state.show_count;
		w.scc.onClick = function () {
			this.window.state.show_count = this.value;
		}
		w.st = w.opt.add("checkbox {text: '" + __('Show Threadlines') + "'}");
		w.st.value = w.state.show_thread;
		w.st.onClick = function () {
			this.window.state.show_thread = this.value;
		}
		if (!sk_special_edition) {
			w.tc = w.opt.add("checkbox {text: '" + __('Inspect Tablecells') + "'}");
			w.tc.value = w.state.inspect_tables;
			w.tc.onClick = function () {
				this.window.state.inspect_tables = this.value;
			}
		}
		if (! do_update) {
			w.ml = w.opt.add("checkbox {text: '" + __('Mirror Layout') + "'}");
			w.ml.value = w.state.mirror_layout;
			w.ml.enabled = ( w.state.pos == 0 );
			w.ml.onClick = function () {
				this.window.state.mirror_layout = this.value;
			}
		}

		w.colors = w.main.add("panel {text: '" + __('Colors') + "', alignChildren: ['fill', 'fill'], orientation: 'row'}");
		w.col = [];
		for (var n = 0; n < colors.length; n++) {
			w.col[n] = w.colors.add("radiobutton {text: '" + __(colors[n].name) + "', value: " + (w.state.color == n) + "}");
			w.col[n].ix = n
			if (n == w.state.color) w.col[n].value = true;
			w.col[n].onClick = function () {
				w.state.color = this.ix;
			}
		}

		if (!do_update) {
			w.rb = [];
			w.position = w.main.add("panel {text: '" + __('Position') + "', alignChildren: ['fill', 'fill']}");
			w.rb[0] = w.position.add("radiobutton {text: '" + __('Right of Page') + "' }")
			w.rb[1] = w.position.add("radiobutton {text: '" + __('Right of Frame') + "' }")
			//			w.rb[2] = w.position.add("radiobutton {text: '" + __('Below Page') + "' }")
			w.rb[2] = w.position.add("radiobutton {text: '" + __('Below Frame') + "' }")
			w.rb[w.state.pos].value = true;
			for (var n = 0; n < w.rb.length; n++) w.rb[n].ix = n;
			for (var n = 0; n < w.rb.length; n++) {
				w.rb[n].onClick = function () { 
					this.window.state.pos = this.ix 
					if ( this.ix == 0 ) {
						w.st.value = true;
						w.state.show_thread = true
						w.ml.enabled = true;
					} else {
						w.st.value = false;
						w.state.show_thread = false;
						w.ml.enabled = false;
					}
				}
			}
		}


		w.defaultElement = w.btns.add("button {text: '" + __('Go') + "'}")
		w.state.process = "build"
		if (do_update) {
			w.defaultElement.text = __('Update');
			w.state.process = "update"
		}
		w.defaultElement.onClick = function () {
			this.window.state.wpos = this.window.frameLocation;
			this.window.close(1);
		}
		if (do_update) {
			w.reset = w.btns.add("button {text: '" + __('Remove') + "'}")
			w.reset.enabled = do_update;
			w.reset.onClick = function () {
				this.window.state.wpos = this.window.frameLocation;
				this.window.close(2);
			}
		}
		w.cancelElement = w.btns.add("button {text: '" + __('Cancel') + "'}")
		w.cancelElement.onClick = function () {
			this.window.state.wpos = this.window.frameLocation;
			this.window.close(3);
		}
		var rs = w.show();
		doc.insertLabel("gs_show_overflow_prefs", JSON.stringify(w.state))
		app.insertLabel("gs_show_overflow_prefs", JSON.stringify(w.state))
		if (rs == 1) {
			show_overflow(w.state);
		} else if (rs == 2) {
			clear_overflow();
		}
	}


	function show_overflow(prefs) {

		var wpb = new Window("palette");
		wpb.task = wpb.add("statictext", [undefined, undefined, 400, 20]);
		var pb = wpb.add("progressbar", [undefined, undefined, 400, 20]);
		pb.value = 1;
		wpb.show();


		var do_update = prefs.process !== "build";
		if (!do_update) {
			clear_overflow();
		}
		// --------------------------------------------------------------------------------------------------------------
		//	Default Einstellungen
		// --------------------------------------------------------------------------------------------------------------
		wpb.task.text = "settings"
		if (!prefs) {
			prefs = doc.extractLabel("gs_show_overflow_prefs");
			if (prefs) {
				try {
					prefs = JSON.parse(prefs)
				} catch (e) {
					prefs = null;
				}
			}
			if (!prefs) {
				prefs = {
					mark_frames: true,
					show_count: true,
					show_thread: true,
					inspect_tables: true,
					mirror_layout: true,
					color: 0,
					pos: 0
				}
			}
		}

		// --------------------------------------------------------------------------------------------------------------
		//	Farbe
		// --------------------------------------------------------------------------------------------------------------
		var swatch = doc.swatches.item(__('Overflow'));
		if (!swatch.isValid) {
			swatch = doc.colors.add({
				name: __('Overflow'),
				space: ColorSpace.CMYK,
				colorValue: colors[prefs.color].value
			})
		} else {
			swatch.colorValue = colors[prefs.color].value;
		}


		var anschnitt_w = doc.documentPreferences.documentBleedOutsideOrRightOffset;
		var anschnitt_h = doc.documentPreferences.documentBleedBottomOffset;

		// --------------------------------------------------------------------------------------------------------------
		//	Ich will hinterher alles wiederherstellen können
		// --------------------------------------------------------------------------------------------------------------
		wpb.task.text = "fallback values"
		if (!do_update) {
			var fallback_values = {};
			fallback_values.ruler_origin = doc.viewPreferences.rulerOrigin.toString();
			doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN
			fallback_values.slug = {
				uniform: doc.documentPreferences.documentSlugUniformSize,
				top: doc.documentPreferences.slugTopOffset,
				left: doc.documentPreferences.slugInsideOrLeftOffset,
				bottom: doc.documentPreferences.slugBottomOffset,
				right: doc.documentPreferences.slugRightOrOutsideOffset,
			}
			fallback_values.screen_mode = doc.layoutWindows[0].screenMode.toString();
			doc.layoutWindows[0].screenMode = ScreenModeOptions.PREVIEW_OFF;
			fallback_values.frame_edges = doc.viewPreferences.showFrameEdges;
			doc.viewPreferences.showFrameEdges = false;
			fallback_values.pasteboard_margins = doc.pasteboardPreferences.pasteboardMargins

			doc.insertLabel("gs_overflow_fallback_values", JSON.stringify(fallback_values));
		}

		// --------------------------------------------------------------------------------------------------------------
		//	Platz schaffen
		//	Edit: "Unter der Seite" machen wir nciht mehr und neben der Seite brauchen wir auch nur bei pos==0 Platz
		// --------------------------------------------------------------------------------------------------------------
		if (!do_update) {
			if (prefs.pos == 0) {
				var min = doc.documentPreferences.pageWidth * 1.1;
				doc.documentPreferences.documentSlugUniformSize = false;
				doc.documentPreferences.slugRightOrOutsideOffset = min + anschnitt_w;
			}
			// if ( prefs.pos == 0 || prefs.pos == 1 ) {
			// 	var min = doc.documentPreferences.pageWidth * 1.1;
			// 	doc.documentPreferences.documentSlugUniformSize = false;
			// 	doc.documentPreferences.slugRightOrOutsideOffset = min + anschnitt_w;
			// }
			// if ( prefs.pos == 2 || prefs.pos == 3 ) {
			// 	var min = doc.documentPreferences.pageHeight * 1.1;
			// 	doc.documentPreferences.documentSlugUniformSize = false;
			// 	doc.documentPreferences.slugBottomOffset = min + anschnitt_h;
			// }
		}

		// --------------------------------------------------------------------------------------------------------------
		//	Aufräumen und Neubau
		// --------------------------------------------------------------------------------------------------------------
		wpb.task.text = "layers"
		var of_layer = doc.layers.item(__('OF-Frames'));
		if (!do_update) {
			if (of_layer.isValid) of_layer.remove();
			of_layer = doc.layers.add({ name: __('OF-Frames'), layerColor: UIColors.TAN });
		}
		of_layer.locked = false;
		of_layer.move(LocationOptions.AT_BEGINNING);
		if (prefs.pos == 0 && !prefs.mirror_layout) {
			var slot_layer = doc.layers.item("of_slots");
			if (!slot_layer.isValid) slot_layer = doc.layers.add({ name: "of_slots" });
			slot_layer.move( LocationOptions.AT_BEGINNING );
		}

		// --------------------------------------------------------------------------------------------------------------
		//	Wenn wir OTFs stapeln, Zielrahmen erstellen und Überlappungen entfernen
		// --------------------------------------------------------------------------------------------------------------
		if (!prefs.mirror_layout && prefs.pos == 0) {
			wpb.task.text = "create slots"
			pb.maxvalue = doc.pages.length;
			var empty_otfs = [];
			for (var np = 0; np < doc.pages.length; np++) {
				pb.value = np;
				empty_otfs[np] = [];
				// ----------------------------------------------------------
				// --------- Rahmen neben der Setie ermitteln ---------
				var pg = doc.pages[np];
				var _dir = (pg.side == PageSideOptions.LEFT_HAND) ? -1 : 1;
				var _all = pg.parent.pageItems.everyItem().getElements();
				var _sides = [];
				for (var n = 0; n < _all.length; n++) {
					// is neben Seite
					if (
						(_dir > 0 && _all[n].geometricBounds[1] > pg.bounds[3]) ||
						(_dir < 0 && _all[n].geometricBounds[1] < pg.bounds[1])
					) {
						_sides.push(_all[n]);
					}
				}		// all loop

				// ------------------------------------------------
				// --------- erst mal alle slots zeichnen ---------
				var slot_width = (pg.bounds[3] - pg.bounds[1] - (slots_per_clm - 1) * slot_gap) / slots_per_clm;
				var _h = (pg.bounds[2] - pg.bounds[0] - (slots_per_clm - 1) * slot_gap) / slots_per_clm;
				var _zero_x = (_dir < 0) ? pg.bounds[1] - slot_gap * 2 : pg.bounds[3] + slot_gap * 2;
				var _zero_y = pg.bounds[0];
				for (var x = 0; x < Math.floor(slots_per_clm / 2); x++) {
					for (var y = 0; y < slots_per_clm; y++) {
						if (_dir < 0) {
							empty_otfs[np].push(pg.parent.textFrames.add({
								fillColor: "Cyan",
								fillTint: 20,
								itemLayer: slot_layer,
								geometricBounds: [
									_zero_y + y * (_h + slot_gap),
									_zero_x - x * (slot_width + slot_gap) - slot_width,
									_zero_y + y * (_h + slot_gap) + _h,
									_zero_x - x * (slot_width + slot_gap),
								]
							}));
						} else {
							empty_otfs[np].push(pg.parent.textFrames.add({
								fillColor: "Cyan",
								fillTint: 20,
								itemLayer: slot_layer,
								geometricBounds: [
									_zero_y + y * (_h + slot_gap),
									_zero_x + x * (slot_width + slot_gap),
									_zero_y + y * (_h + slot_gap) + _h,
									_zero_x + x * (slot_width + slot_gap) + slot_width,
								]
							}));
						}	// links oder rechts
					}		// y slots
				}			// x slots

				// -------------------------------------------------------------------
				// --------- dann alle löschen für die es Überlappungen gibt ---------
				var tol = 0;
				for (var n = empty_otfs[np].length - 1; n >= 0; n--) {
					var _slot_gb = empty_otfs[np][n].geometricBounds;
					piloop: for (var m = 0; m < _sides.length; m++) {
						var _da_gb = _sides[m].geometricBounds;
						if (
							_slot_gb[0] - _da_gb[2] > tol || 	// da drüber
							_da_gb[1] - _slot_gb[3] > tol || 	// da rechts
							_da_gb[0] - _slot_gb[2] > tol || 	// da drunter
							_slot_gb[1] - _da_gb[3] > tol			// da links
						) { /* do nothing, slot OK */ } else {
							empty_otfs[np][n].remove()
							empty_otfs[np].splice(n, 1);
							break piloop;
						}	// Slot check
					}		// pi loop
				}			// slot loop
			}				// pg loop
		}					// if Stapel




		// --------------------------------------------------------------------------------------------------------------
		//	Bei Update müssen indicatoren etc ggf gelöscht werden, wenn die Option jetzt aus ist
		// --------------------------------------------------------------------------------------------------------------
		if (do_update) {
			wpb.task.text = "remove stuff"
			var tfs = doc.pageItems.everyItem().getElements();
			for (var n = tfs.length - 1; n >= 0; n--) {
				var aux = tfs[n];
				if (tfs[n].hasOwnProperty("name") && tfs[n].name) {
					if (!prefs.show_count && tfs[n].name.substr(0, 4) == "cctf") {
						tfs[n].remove();
					} else if (!prefs.show_thread && tfs[n].name.substr(0, 4) == "oln-") {
						tfs[n].remove();
					} else if (!prefs.mark_frames && tfs[n].name.substr(0, 4) == "itf-") {
						tfs[n].remove();
					}
				}
			}
		}


		// --------------------------------------------------------------------------------------------------------------
		//	Stories durchgehen - #### Es muss noch gelöscht werden von Stories, die nicht mehr überlaufen
		// --------------------------------------------------------------------------------------------------------------
		wpb.task.text = "inspect stories"
		var all_stories = doc.stories.everyItem().getElements();

		var stories = [];
		var tf;
		for (var n = 0; n < all_stories.length; n++) {
			tf = all_stories[n].textContainers[all_stories[n].textContainers.length - 1]
			if (all_stories[n].overflows && tf.parentPage) {
				stories.push(all_stories[n]);
			}
		}
		// --------------------------------------------------------------------------------------------------------------
		pb.maxvalue = stories.length;
		for (var n = 0; n < stories.length; n++) {
			var sid = stories[n].id;
			pb.value = n;
			if (stories[n].overflows) {	// eigentlich überflüssig, weil oben schon gecheckt
				var tf = stories[n].textContainers[stories[n].textContainers.length - 1]
				var parent = tf.parentPage;
				if ( parent ) {
					if ( parent.parent.constructor.name == "Spread" ) {
						if (prefs.show_count) {
							var cctf = make_cctf(tf, sid)
						}
						var otf = make_otf(tf, sid);
						if (prefs.mark_frames) {
							var itf = make_itf(tf, sid);
						}
					}
				}
			}
		}		// story loop

		// --------------------------------------------------------------------------------------------------------------
		//	Tabellenzellen durchgehen
		// --------------------------------------------------------------------------------------------------------------
		if (prefs.inspect_tables) {
			wpb.task.text = "inspect tables"
			pb.maxvalue = all_stories.length;
			var tables = [];
			var tables_in_of = [];
			for (var n = 0; n < all_stories.length; n++) {
				pb.value = n;
				// Ich weiß nicht, warum es sein kann, dass eine Story hier nicht mehr valid ist, aber es passiert.
				if (all_stories[n].isValid) {
					var _tables = all_stories[n].tables.everyItem().getElements();
					for (var m = 0; m < _tables.length; m++) {
						if (_tables[m].parent.constructor.name == "TextFrame") {
							tables.push(_tables[m]);
						} else {
							tables_in_of.push(_tables[m]);
						}	// tab in rahmen
					}		// tab loop
				}
			}			// story loop
			// --------------------------------------------------------------------------------------------------------------
			for (var n = 0; n < tables.length; n++) {
				var cells = tables[n].cells.everyItem().getElements();
				for (var c = 0; c < cells.length; c++) {
					if (cells[c].overflows) {
						if (prefs.show_count) {
							var cctf = make_cctf(cells[c], cells[c].id)
						}
						make_otf(cells[c], cells[c].id)
						if (prefs.mark_frames) {
							make_itf(cells[c], cells[c].id)
						}
					}
				}
			}
		}


		// --------------------------------------------------------------------------------------------------------------
		//	Wenn Update, muss der Kram gelöscht werden, ,der nicht mehr überfliesst
		// --------------------------------------------------------------------------------------------------------------
		if (do_update) {
			var _dbg = false;
			var all_frames = of_layer.textFrames.everyItem().getElements();
			wpb.task.text = "remove empty overflows"
			pb.maxvalue = all_frames.length;
			var ids = [];
			for (var n = all_frames.length - 1; n >= 0; n--) {
				pb.value = all_frames.length - n;
				var id = (all_frames[n].name.substr(0, 3) == "otf") ? all_frames[n].name.substr(4) : null;
				if (id) {
					var story = doc.stories.itemByID(Number(id));
					if (story && story.isValid && story.overflows == false) {
						all_frames[n].remove();
						ids.push(id);
					}
				}
			}
			wpb.task.text = "remove empty indicators"
			for (var n = 0; n < ids.length; n++) {
				var items = of_layer.rectangles.everyItem().getElements();
				pb.maxvalue = items.length;
				for (var m = 0; m < items.length; m++) {
					pb.value = m;
					if (items[m].name == "itf-" + ids[n]) items[m].remove();
				}
			}
			wpb.task.text = "remove empty indicators"
			for (var n = 0; n < ids.length; n++) {
				var items = of_layer.pageItems.everyItem().getElements();
				pb.maxvalue = items.length;
				for (var m = 0; m < items.length; m++) {
					pb.value = m;
					if (items[m].name == "oln-" + ids[n]) {
						items[m].remove();
					}
				}
			}
			wpb.task.text = "remove empty counters"
			for (var n = 0; n < ids.length; n++) {
				var items = of_layer.textFrames.everyItem().getElements();
				pb.maxvalue = items.length;
				for (var m = 0; m < items.length; m++) {
					pb.value = m;
					if (items[m].name == "cctf-" + ids[n]) items[m].remove();
				}
			}
		}

		// --------------------------------------------------------------------------------------------------------------
		//	Wenn Neben-der-Seite, muss der Infobereich an den Status Quo angepasst werden
		// --------------------------------------------------------------------------------------------------------------
		if (prefs.pos == 0) {
			if (!prefs.mirror_layout) {
				slot_layer.remove();
			}

			var max_w = 0;
			for (var n = 0; n < doc.spreads.length; n++) {
				var all_frames = doc.spreads[n].textFrames.everyItem().getElements();
				var min_x = doc.spreads[n].pages.firstItem().bounds[1],
					max_x = doc.spreads[n].pages.lastItem().bounds[3];
				for (var m = 0; m < all_frames.length; m++) {
					var _gb = all_frames[m].geometricBounds;
					if (_gb[1] > max_x) {
						max_w = Math.max(max_w, _gb[3] - max_x);
					} else if (_gb[3] < min_x) {
						max_w = Math.max(max_w, min_x - _gb[1]);
					}
				}
			}
			var slug_width = max_w + slot_gap;
			doc.documentPreferences.slugRightOrOutsideOffset = slug_width;
			//doc.documentPreferences.slugInsideOrLeftOffset = slug_width;
		}

		// --------------------------------------------------------------------------------------------------------------
		//	CharacterCounter sollen ganz nach vorne
		//	OTFs sollen in der Höhe angepasst werden
		// --------------------------------------------------------------------------------------------------------------
		var all_frames = doc.textFrames.everyItem().getElements();
		for ( var n = 0; n < all_frames.length; n++ ) {
			if ( all_frames[n].name.substr(0,4) == "cctf") {
				all_frames[n].bringToFront();
			}
			if ( all_frames[n].name.substr(0,3) == "otf") {
				all_frames[n].fit( FitOptions.FRAME_TO_CONTENT)
				if ( all_frames[n].overflows ) {
					all_frames[n].geometricBounds = [
						all_frames[n].geometricBounds[0],
						all_frames[n].geometricBounds[1],
						doc.pages[0].bounds[2],
						all_frames[n].geometricBounds[3]
					]
					all_frames[n].fit( FitOptions.FRAME_TO_CONTENT)
				}
			}
		}



		of_layer.locked = true;
		wpb.close();

















		// -----------------------------------------------------------------------------------------------------
		// -----------------------------------------------------------------------------------------------------
		// -----------------------------------------------------------------------------------------------------

		function make_itf(tf, sid) {
			var itf = doc.rectangles.itemByName("itf-" + sid);
			if (!itf.isValid) {
				if (tf.constructor.name == "Cell") {
					// var box = get_cell_coordinates(tf);
					// if ( ! box ) return;
					// var pg = box.pg;
					// var gb = box.gb;
					// itf = box.pg.rectangles.add({ geometricBounds: box.gb, itemLayer: of_layer })
					var box = cellBox( tf, "Cyan" );
					if ( ! box ) return;
					itf = box.box;
					itf.itemLayer = of_layer;
					var pg = itf.parentPage;
					var gb = itf.geometricBounds;
				} else {
					var pg = tf.parentPage;
					var gb = tf.geometricBounds;
					itf = pg.rectangles.add({ geometricBounds: gb, itemLayer: of_layer });
				}
				itf.name = "itf-" + sid;
			} else {
				if (tf.constructor.name == "Cell") {
					var box = cellBox( tf, "Cyan" );
					if ( ! box ) return;
					var pg = box.box.parentPage;
					var gb = box.box.geometricBounds;
					box.box.remove();
					// var box = get_cell_coordinates(tf);
					// if ( ! box ) return;
					// var pg = box.pg;
					// var gb = box.gb;
				} else {
					var pg = tf.parentPage;
					var gb = tf.geometricBounds;
				}
				itf.move(pg);
				itf.geometricBounds = gb;
			}
			itf.contentType = ContentType.UNASSIGNED;
			itf.fillColor = "None";
			itf.strokeColor = swatch;
			itf.strokeWeight = 2;
		}
		function make_cctf(tf, sid) {
			var cctf = doc.textFrames.itemByName("cctf-" + sid);
			if (cctf.isValid) cctf.remove();
			if (tf.constructor.name == "Cell") {
				var box = cellBox( tf, "Cyan" );
				if ( ! box ) return;
				var pg = box.box.parentPage;
				var gb = box.box.geometricBounds;
				box.box.remove();
				// var box = get_cell_coordinates(tf);
				// if ( ! box ) return;
				// var pg = box.pg;
				// var gb = box.gb;
				var visible_content = tf.contents;
				var all_content = tf.characters.everyItem().contents.join("");
				var cc = all_content.length - visible_content.length;
	
			} else {
				var pg = tf.parentPage;
				var gb = tf.visibleBounds;
				var cc = tf.parentStory.insertionPoints.lastItem().index - tf.insertionPoints.lastItem().index;
			}
			if (pg) {
				var cctf = pg.textFrames.add();
				cctf.name = "cctf-" + sid;
				cctf.itemLayer = of_layer;
				cctf.fillColor = swatch;
				cctf.fillTint = 40
				cctf.strokeColor = swatch;
				cctf.strokeTint = 80;
				cctf.textFramePreferences.insetSpacing = 2;
				cctf.visibleBounds = [gb[0] - 10, gb[3] - 20, gb[0], gb[3]];
				cctf.contents = n_format(cc);
				cctf.paragraphs[0].applyParagraphStyle(doc.paragraphStyles[0], true);
				cctf.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_RIGHT_POINT;
				cctf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
				return cctf;
			}
			return null;
		}
	
		function make_otf(tf, sid) {
			app.select( tf );
			if (tf.constructor.name == "Cell") {
				var box = cellBox( tf, "Cyan" );
				if ( ! box ) return;
				var pg = box.box.parentPage;
				var gb = box.box.geometricBounds;
				box.box.remove();
				// var box = get_cell_coordinates(tf);
				// if ( ! box ) return;
				// var gb = box.gb;
				// var pg = box.pg;
			} else {
				var gb = tf.geometricBounds;
				var pg = tf.parentPage;
			}
			// Überfluss auf der Montagefläche machen wir nicht
			if (pg) {
				if (!prefs.mirror_layout) {

				}
				// --------------------------------------------------------------------------------------------------------------
				//	Neuen Rahmen positionieren
				// --------------------------------------------------------------------------------------------------------------
				var bds = pg.bounds;
				otf = doc.textFrames.itemByName("otf-" + sid);
				if (!otf.isValid) {
					var otf = create_tf_at_proper_position(pg, gb, sid);
					if (!sk_special_edition && prefs.mirror_layout) {
						otf.textFramePreferences.minimumWidthForAutoSizing = (otf.geometricBounds[3] - otf.geometricBounds[1]);
						otf.textFramePreferences.useMinimumWidthForAutoSizing = true;
						if (pg.side == PageSideOptions.LEFT_HAND) {
							otf.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_RIGHT_POINT;
						} else {
							otf.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
						}
						otf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
					}
				}

				// --------------------------------------------------------------------------------------------------------------
				//	Füllen und Säubern
				// --------------------------------------------------------------------------------------------------------------
				if (tf.constructor.name == "Cell") {
					var visible_content = tf.contents,
						all_content = tf.characters.everyItem().contents.join(""),
						of_content = all_content.substr(visible_content.length);
					otf.contents = of_content;

				} else {
					otf.parentStory.contents = "";
					var _von = tf.insertionPoints.lastItem().index,
						_bis = tf.parentStory.characters.lastItem().index
					var range = tf.parentStory.characters.itemByRange(_von, _bis)
					if (range.isValid) {
						range.duplicate(LocationOptions.AT_END, otf);
					}
				}

				clean_text(otf);

				// --------------------------------------------------------------------------------------------------------------
				//	Indikatorlinie
				// --------------------------------------------------------------------------------------------------------------
				if (prefs.show_thread) {
					var line = doc.graphicLines.itemByName("oln-" + sid);
					if (!line.isValid) {
						line = pg.graphicLines.add({
							strokeColor: swatch,
							strokeTint: 50,
							strokeWeight: 2,
							itemLayer: of_layer,
							name: "oln-" + sid
						})
					}
					if (pg.side == PageSideOptions.LEFT_HAND && prefs.pos == 0) {
						line.paths[0].entirePath = [
							[gb[1], gb[2]],
							[otf.geometricBounds[3], otf.geometricBounds[0]],
						]
					} else {
						line.paths[0].entirePath = [
							[gb[3], gb[2]],
							[otf.geometricBounds[1], otf.geometricBounds[0]],
						]
					}
				}

				// --------------------------------------------------------------------------------------------------------------
				//	Wenn otf breiter als die Seite, dann keine Autobreite mehr
				// --------------------------------------------------------------------------------------------------------------
				if (!sk_special_edition && prefs.mirror_layout) {
					var pw = bds[3] - bds[1]
					if ((otf.geometricBounds[3] - otf.geometricBounds[1]) > pw) {
						otf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.OFF;
						if (pg.side == PageSideOptions.LEFT_HAND) {
							otf.geometricBounds = [
								otf.geometricBounds[0],
								otf.geometricBounds[3] - pw,
								otf.geometricBounds[2],
								otf.geometricBounds[3]
							]
						} else {
							otf.geometricBounds = [
								otf.geometricBounds[0],
								otf.geometricBounds[1],
								otf.geometricBounds[2],
								otf.geometricBounds[1] + pw
							]
						}
					}
				} else {
					var aux1 = otf.geometricBounds;
					var aux2 = otf.lines.lastItem().baseline;
					otf.geometricBounds = [
						aux1[0],
						aux1[1],
						aux2 + 4,
						aux1[3],
					]
				}


				return otf;
			}	// is on page
			return null;
		}		// make_otf

		// --------------------------------------------------------------------------------------------------------------
		//	CS will, dass das Layout nicht gespiegelt wird. Dadurch wird die Positionierung komplex
		// --------------------------------------------------------------------------------------------------------------
		function create_tf_at_proper_position(pg, gb, sid) {

			var otf = pg.textFrames.add({ itemLayer: of_layer, geometricBounds: gb });
			otf.textFramePreferences.insetSpacing = slot_gap + "mm";
			otf.name = "otf-" + sid;
			otf.insertLabel("gs_overflow_of_frame", "true");
			otf.fillColor = swatch;
			otf.fillTint = 50;
			// otf.fillTransparencySettings.blendingSettings.opacity = 60;

			var dir = (pg.side == PageSideOptions.LEFT_HAND) ? -1 : 1;
			// -------- Neben Rahmen --------
			if (prefs.pos == 1) {
				otf.geometricBounds = [
					gb[0],
					gb[3] + slot_gap,
					gb[2],
					gb[3] + (gb[3] - gb[1]) + slot_gap
				]
			}
			// -------- Unter Rahmen --------
			else if (prefs.pos == 2) {
				otf.geometricBounds = [
					gb[2] + anschnitt_h,
					gb[1],
					gb[2] + anschnitt_h + (gb[2] - gb[0]),
					gb[3]
				]
			}
			// -------- Neben Seite Layout spiegelnd --------
			else if (prefs.pos == 0 && prefs.mirror_layout) {
				var _pw = pg.bounds[3] - pg.bounds[1];
				otf.geometricBounds = [
					gb[0],
					gb[1] + dir * (slot_gap + _pw),
					gb[2],
					gb[3] + dir * (slot_gap + _pw)
				]
			}
			// -------- Neben Seite gestapelt --------
			else if (prefs.pos == 0 && !prefs.mirror_layout) {
				var aux = pg.name;
				var aux1 = pg.appliedMaster;
				var np = pg.documentOffset;
				for (var n = 0; n < empty_otfs[np].length; n++) {
					if (empty_otfs[np][n].contents == "") {
						otf.geometricBounds = empty_otfs[np][n].geometricBounds;
						empty_otfs[np][n].contents = "filled";
						break;
					}
				}

			}			// neben Seite gestapelt

			return otf;
		}


		function get_cell_coordinates(cell) {

			try {
				cell.insertionPoints[0].contents = ".\n";
				cell.characters.itemByRange(0, 1).pointSize = 2;
				cell.characters.itemByRange(0, 1).leading = 2;

				var w = cell.columns[0].width;
				var h = cell.rows[0].height;
				var dx = cell.leftInset;
				var _j = cell.insertionPoints[0].justification
				if (_j.toString().search(/CENTER/) != -1) dx = dx + (w - cell.leftInset - cell.rightInset) / 2;
				if (_j.toString().search(/RIGHT/) != -1) dx = dx + (w - cell.leftInset - cell.rightInset);
				var dy = cell.topInset;
				if (cell.verticalJustification == VerticalJustification.CENTER_ALIGN) dy = dy + (h - cell.topInset - cell.bottomInset) / 2;
				if (cell.verticalJustification == VerticalJustification.BOTTOM_ALIGN) dy = dy + (h - cell.topInset - cell.bottomInset);

				// app.select( cell );
				var c = cell.characters[0];
				var o = c.createOutlines(false)[0];
				var pg = o.parentPage
				cell.characters.itemByRange(0, 1).remove();
				var gb = o.geometricBounds;
				o.remove();
				var _gb = [
					gb[0] - dy,
					gb[1] - dx,
					gb[0] + h - dy,
					gb[1] + w - dx,
				];
				return { pg: pg, gb: _gb };
			} catch(e) {
				app.select( cell );
				return null;
			}
		}
	}			// show overflow


	function clean_text(tf) {
		var s = tf.parentStory;
		var scs = [
			{ von: "^M", zu: "<" + __('ColumnBreak') + ">\n" },
			{ von: "^R", zu: "<" + __('FrameBreak') + ">\n" },
			{ von: "^P", zu: "<" + __('PageBreak') + ">\n" },
			{ von: "^L", zu: "<" + __('OddPageBreak') + ">\n" },
			{ von: "^E", zu: "<" + __('EvenPageBreak') + ">\n" },
		]
		app.findTextPreferences = NothingEnum.nothing;
		app.changeTextPreferences = NothingEnum.nothing;
		for (var n = 0; n < scs.length; n++) {
			app.findTextPreferences.findWhat = scs[n].von;
			app.changeTextPreferences.changeTo = scs[n].zu;
			s.changeText();
		}
		try {
			s.paragraphs.everyItem().alignToBaseline = false;
			s.paragraphs.everyItem().appliedFont = "Minion Pro";
			s.paragraphs.everyItem().pointSize = 10;
			s.paragraphs.everyItem().leading = 12; 
			s.paragraphs.everyItem().justification = Justification.LEFT_ALIGN;
			s.paragraphs.everyItem().fillColor = "Black";
			s.paragraphs.everyItem().strokeColor = "None";
			s.paragraphs.everyItem().fontStyle = "Italic";
		} catch (e) { }
		for (var n = s.tables.length - 1; n >= 0; n--) {
			var t = s.tables[n];
			var ix = t.storyOffset.index;
			t.remove();
			s.insertionPoints[ix].contents = "<" + __('Table') + ">\n";
		}
		for (var n = s.pageItems.length - 1; n >= 0; n--) {
			var t = s.pageItems[n];
			var ix = t.parent.index;
			t.remove();
			s.insertionPoints[ix].contents = "<" + __('Anchored Object') + ">\n";
		}
		app.findGrepPreferences = NothingEnum.NOTHING;
		app.changeGrepPreferences = NothingEnum.NOTHING;
		app.findGrepPreferences.findWhat = "<.*?>";
		//app.changeGrepPreferences.appliedFont = "Courier";
		app.changeGrepPreferences.noBreak = true;
		s.changeGrep();
	}
	function n_format(n) {
		n = Math.round(n);
		if (n > 999999) {
			var rs = Math.floor(n / 1000000) + __('dec_sep');
			n = n - Math.floor(n / 1000000);
			rs += ("000" + (Math.floor(n / 1000) + __('dec_sep') + (n % 1000))).substr(-3);
			return rs;
		} else if (n > 999) {
			return Math.floor(n / 1000) + __('dec_sep') + ( "000" + (n % 1000) ).substr(-3);
		} else {
			return n.toString();
		}
	}



	function clear_overflow() {
		// --------------------------------------------------------------------------------------------------------------
		//	Die Fallback Werte wieder einrichten
		// --------------------------------------------------------------------------------------------------------------
		var fallback_values = doc.extractLabel("gs_overflow_fallback_values");
		if (fallback_values) {
			fallback_values = JSON.parse(fallback_values);

			try { doc.viewPreferences.rulerOrigin = RulerOrigin[fallback_values.ruler_origin]; } catch (e) { }

			try { doc.documentPreferences.documentSlugUniformSize = fallback_values.slug.uniform; } catch (e) { }
			try { doc.documentPreferences.slugTopOffset = fallback_values.slug.top; } catch (e) { }
			try { doc.documentPreferences.slugInsideOrLeftOffset = fallback_values.slug.left; } catch (e) { }
			try { doc.documentPreferences.slugBottomOffset = fallback_values.slug.bottom; } catch (e) { }
			try { doc.documentPreferences.slugRightOrOutsideOffset = fallback_values.slug.right; } catch (e) { }

			try { doc.layoutWindows[0].screenMode = ScreenModeOptions[fallback_values.screen_mode] } catch (e) { }

			try { doc.viewPreferences.showFrameEdges = fallback_values.frame_edges; } catch (e) { }
			try { doc.pasteboardPreferences.pasteboardMargins = fallback_values.pasteboard_margins } catch (e) { }

			doc.insertLabel("gs_overflow_fallback_values", "");
		}

		var swatchgroup = doc.colorGroups.item(__('Overflow'));
		if (swatchgroup.isValid) swatchgroup.remove();

		var of_layer = doc.layers.item(__('OF-Frames'));
		if (of_layer.isValid) of_layer.remove();

		var tfs = doc.textFrames.everyItem().getElements();
		for (var n = tfs.length - 1; n >= 0; n--) {
			if (tfs[n].extractLabel("gs_overflow_of_frame") == "true") tfs[n].remove();
		}
	}





	function __( id ) {
		var txt = "";
		loc_strings = __readJson( get_script_folder_path() + "/Strings.json");
		if ( ! loc_strings || ! loc_strings.hasOwnProperty(script_id) ) {
			return id;
		}
		loc_strings = loc_strings[ script_id ];

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
}













function init_cellbox() {
	cellBox = function(/*Cell|PageItem*/target,/*?str*/fillColor,/*?Document*/doc, bkStrokeMu, wrk, K, cell, pp, t, i, q, r)
	//----------------------------------
	// Create a rectangle that exactly (?) matches the `target` object
	// (single or plural specifier) w.r.t to transform states and
	// stroke weight. Return a { box, left, top, right, bottom }
	// structure, `box` being the created Rectangle. The coordi-
	// nates (in pt) are all given in the INNER space.
	// [REM] Master items not supported!
	// [ADD220803] `target` can be the cell's pageitem as well; the
	// client code can provide `doc` if the host document is already
	// known.
	// [ADD220801] Added `innerWidth`, `innerHeight` props.
	
	// => { box: new Rectangle, ... }  [OK]  |  false [KO]
	{
		// Boring enums.
		// ---
		const MX = callee.MX || (callee.MX =
		{
			muPT: +MeasurementUnits.POINTS,
			ctGC: +CellTypeEnum.GRAPHIC_TYPE_CELL,
			ctTX: +CellTypeEnum.TEXT_TYPE_CELL,
			loBEG: +LocationOptions.AT_BEGINNING,
			// ---
			apTL: +AnchorPoint.TOP_LEFT_ANCHOR,
			apBR: +AnchorPoint.BOTTOM_RIGHT_ANCHOR,
			apCC: +AnchorPoint.CENTER_ANCHOR,
			// ---
			bbVIS: +BoundingBoxLimits.OUTER_STROKE_BOUNDS,
			// ---
			csPB: +CoordinateSpaces.PASTEBOARD_COORDINATES,
			csSP: +CoordinateSpaces.SPREAD_COORDINATES,
			csPR: +CoordinateSpaces.PARENT_COORDINATES,
			csIN: +CoordinateSpaces.INNER_COORDINATES,
			// ---
			mcSHR: [+(t = MatrixContent).scaleValues, +t.shearValue, +t.rotationValue],
		});
	
		// Checkpoint and settings.
		// ---
		if (!(target || 0).isValid) {
			return false;
		}
		if ('Document' != (doc || 0).constructor.name) {
			t = 'function' == typeof (target.toSpecifier) && target.toSpecifier();
			if ('string' != typeof t) return false;
			t = t.split('//')[0];
			try { doc = resolve(0 === t.indexOf('(') ? t.slice(1) : t) }
			catch (_) { doc = 0 }
			if (!doc.isValid) return false;
		}
		if ('Cell' != target.constructor.name && 'Cell' != (target = target.parent || 0).constructor.name) {
			return false;
		}
		('string' == typeof fillColor && (doc.colors.itemByName(fillColor).isValid || doc.swatches.itemByName(fillColor).isValid))
			|| (fillColor = 'Black');
		callee.BOX_PROPS =
		{
			strokeColor: 'None',
			fillColor: fillColor,
			// Add safety attributes: corner options, etc
		};
	
		// Temporarily force stroke weights in PT.
		// ---
		MX.muPT == (bkStrokeMu = +doc.viewPreferences.strokeMeasurementUnits)
			? (bkStrokeMu = false)
			: (doc.viewPreferences.strokeMeasurementUnits = MX.muPT);
	
		// Supports multiple cells.
		// ---
		for (wrk = {}, K = target.cells, i = K.length; i--;) {
			pp = (cell = K[i]).properties;
			if( MX.ctGC == +pp.cellType ) {
				var aux3 = callee.GRAC;
			} else {
				var aux4 = callee.TEXC;
			}
			t = callee[MX.ctGC == +pp.cellType ? 'GRAC' : 'TEXC'];
			t.call(callee, wrk, doc, cell, pp, MX);
		}
	
		// Apply final reframe and format result.
		// ---
		r = [];
		for (t in wrk) {
			if (!wrk.hasOwnProperty(t)) continue;
			q = wrk[t];
			q.box.reframe(MX.csIN, [[q.L, q.T], [q.R, q.B]]);
			r[r.length] =
			{
				box: q.box,
				top: q.T,
				left: q.L,
				bottom: q.B,
				right: q.R,
				innerWidth: q.R - q.L,
				innerHeight: q.B - q.T,
			}
		}
	
		// Restore stroke unit if necessary.
		// ---
		bkStrokeMu && (doc.viewPreferences.strokeMeasurementUnits = bkStrokeMu);
	
		return 0 < (t = r.length) && (1 < t ? r : r[0]);
	};
	
	cellBox.TEXC = function (/*Work&*/wrk,/*Document*/doc,/*Cell&*/cell,/*CellProp*/pp,/*Enums*/MX, reGrow, sto, tf, bx)
	//----------------------------------
	// (Process-Text-Cell.) `cell` is a regular Cell.
	// this :: cellBox (fct)
	// => {} [OK]  |  false [KO]
	{
		(reGrow = pp.autoGrow) && (cell.autoGrow = false);
	
		sto = (tf = doc.textFrames.add()).parentStory;               // Dummy frame/story.
		cell.texts[0].move(MX.loBEG, sto);                       // Assert: Cell is now empty.
		cell.convertCellType(MX.ctGC);                           // Assert: Cell.pageItems[0] is a Rectangle.
	
		bx = this.GRAC(wrk, doc, cell, pp, MX);
	
		cell.convertCellType(MX.ctTX);                           // Restore Text cell.
		sto.move(MX.loBEG, cell.texts[0].insertionPoints[0]);     // Restore contents.
		tf.remove();                                             // Remove dummy fame.
	
		reGrow && (cell.autoGrow = true);                          // Restore autoGrow if necessary.
		return bx;
	};
	
	cellBox.GRAC = function (/*Work&*/wrk,/*Document*/doc,/*Cell*/cell,/*CellProp*/pp,/*Enums*/MX, gco, spd, bx, q, k, t, m, lt, rb)
	//----------------------------------
	// (Process-Graphic-Cell.) `cell` is a GC.
	// this :: cellBox (fct)
	// => {} [OK]  |  false [KO]
	{
		const myTL = callee.LOC_TL || (callee.LOC_TL = [MX.apTL, MX.bbVIS, MX.csPR]);
		const myBR = callee.LOC_BR || (callee.LOC_BR = [MX.apBR, MX.bbVIS, MX.csPR]);
	
		// 1. Determine the destination SPREAD.
		// ---
		gco = cell.pageItems[0];                                      // Could be any kind of PageItem (incl. Button, MSO etc.)
		if (!gco.properties.visibleBounds) return false;             // Make sure `gco` is not a 'ghost'.
		t = gco.resolve(MX.apCC, MX.csPB)[0][1];                       // Y-coord of the center point *in PASTEBOARD space*.
		spd = this.Y2SP(t, doc, MX);                                    // Host spread.
	
		// 2. Get/create the box (SPREAD item).
		// ---
		if (wrk.hasOwnProperty(k = '_' + spd.id)) {
			q = wrk[k];
			bx = q.box;                                               // Recover existing box.
			m = q.tsf;                                                // Recover PB->boxInner matrix.
		}
		else {
			bx = this.IBOX(spd, gco, MX);                               // New box.
			m = bx.transformValuesOf(MX.csPB)[0].invertMatrix();      // PB->boxInner
			q = wrk[k] = { box: bx, tsf: m, L: 1 / 0, T: 1 / 0, R: -1 / 0, B: -1 / 0 }; // Save.
		}
	
		// 3. The whole cellBox trick is here: get the opposite
		// corners of the *VISIBLE IN-PARENT* box of `gco`.
		// ---
		lt = m.changeCoordinates(gco.resolve(myTL, MX.csPB)[0]);       // Translate the resolved (L,T) from PB to boxInner.
		(t = pp.leftEdgeStrokeWeight || 0) && (lt[0] -= t / 2);             // Left edge shift.
		(t = pp.topEdgeStrokeWeight || 0) && (lt[1] -= t / 2);             // Top edge shift.
		// ---
		rb = m.changeCoordinates(gco.resolve(myBR, MX.csPB)[0]);       // Translate the resolved (R,B) from PB to boxInner
		(t = pp.rightEdgeStrokeWeight || 0) && (rb[0] += t / 2);             // Right edge shift.
		(t = pp.bottomEdgeStrokeWeight || 0) && (rb[1] += t / 2);             // Rottom edge shift.
	
		// 4. Basically, all we have to do is reframing the box
		// in its inner space along [lt,rb]. But since we may
		// address multiple cells, just update the metrics.
		// ---
		(t = lt[0]) < q.L && (q.L = t);
		(t = lt[1]) < q.T && (q.T = t);
		(t = rb[0]) > q.R && (q.R = t);
		(t = rb[1]) > q.B && (q.B = t);
	
		return bx;
	};
	
	cellBox.IBOX = function (/*Spread*/spd,/*PageItem*/gco,/*Enums*/MX, r, t)
	//----------------------------------
	// (Initialize-Box.) Create a new box in appropriate transform state.
	// this :: cellBox (fct)
	// => Rectangle.
	{
		const TVO = 'transformValuesOf';
		const INV = 'invertMatrix';
	
		// 1. Create a fresh rectangle in `spd`.
		// ---
		r = spd.rectangles.add(gco.itemLayer);
		r.properties = this.BOX_PROPS;
	
		// 2. Adjust the transform state (diregarding translation)
		// so that: recInner->Spread  fits  gcoParent->Spread.
		// [REM] Since gco.transformValuesOf(<Spread>) is unsafe,
		// rely on spd->PB matrix:
		// Parent->Spread = Parent->Inner × Inner->PB × PB->Spread
		// ---
		t = gco[TVO](MX.csPR)[0][INV]()                               //   Parent->Inner
			.catenateMatrix(gco[TVO](MX.csPB)[0])                   // × Inner->PB
			.catenateMatrix(spd[TVO](MX.csPB)[0][INV]());           // × PB->Spread
		r.transform(MX.csSP, MX.apCC, t, MX.mcSHR);                   // Replace the existing S•H•R components.
	
		return r;
	};
	
	cellBox.Y2SP = function (/*num*/Y,/*Document*/doc,/*Enums*/MX, K, a, t, k, i, z, b)
	//----------------------------------
	// Get the Spread that contains the absolute Y coordinate (in Pasteboard space.)
	// [REM] Master spreads not supported!!
	// => Spread.
	{
		// Spread y-positions. (Cached.)
		// ---
		K = doc.spreads;
		a = (t = callee.Q || (callee.Q = {})).hasOwnProperty(k = doc.toSpecifier()) && t[k];
		if (!a) {
			a = K.everyItem().resolve([MX.apTL, MX.bbVIS, MX.csPB], MX.csPB)[0];
			for (i = z = a.length; i--; a[i] = i ? a[i][1] : -1 / 0);
			a[z] = 1 / 0;
			t[k] = a;
		}
		else {
			z = -1 + a.length;
		}
	
		// Binary search. Looks for the unique `i` s.t.
		// `a[i] <= Y < a[i+1]` (i is then the spread index.)
		// ---
		for
			(
			t = [0, z];
			Y < a[i = (t[b = 0] + t[1]) >> 1] || Y >= a[(b = 1) + i];
			t[1 - b] = b + i
		);
	
		return K[i];
	};		
}



