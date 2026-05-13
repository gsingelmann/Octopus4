#targetengine "addBookmarks"

/* DESCRIPTION: Add Bookmarks to Paragraph Style, Character Style or GREP */ 

/*
  
    + Adobe InDesign Version: CS6+
    + Autor: Roland Dreger 
    + Datum: 22. September 2014
    
    + Zuletzt aktualisiert: 30. September 2018
    
    
    + Freies Script fuer private und kommerzielle Nutzung (Creativ Commons Lizenz: Roland Dreger, CC BY 3.0 AT). 
    + Verwendung auf eigene Gefahr.
    
    + Free Script for private and commercial use (Creativ Commons Licence: Roland Dreger, CC BY 3.0 AT). 
    + Use at your own risk.
    
*/


#include "Startup Scripts/Octopus/Include.jsxinc"
var script_id = "add_bookmarks";
__log("run", script_id, script_id);



var _global = {};

__main(); 





function __main() { 
  
  if(app.documents.length == 0) { 
    _global = null; 
    return; 
  }
  
  var _bookmarkPanelVisible = __openBookmarkPanel();
	if(!_bookmarkPanelVisible) {
		return false;
	}
	
  __showDialog(); 
  
  return;
} /* END function __main */


/* Lesezeichen-Panel einblenden            */
/* (Bug in CC2018 bei geschlossenem Panel) */
function __openBookmarkPanel() {
	
	var _bookmarkPanel = app.panels.itemByName("$ID/Bookmarks");
	if(_bookmarkPanel.isValid && _bookmarkPanel.visible) {
		return true;
	}
	
	var _openBookmarkPanelSMA = app.scriptMenuActions.itemByID(95489);
	if(!_openBookmarkPanelSMA.isValid || !_openBookmarkPanelSMA.hasOwnProperty("invoke")) {
		return false;
	}
	
	_openBookmarkPanelSMA.invoke();
	
	if(!_bookmarkPanel.isValid || !_bookmarkPanel.visible) {
		return false;
	}
	
	return true;
} /* END function __openBookmarkPanel */



function __showDialog() {

  var _doc = app.activeDocument,
      _icons = __defineIconsForUI(),
      _ui,
      _maingroup;
  
  __defLocalizeStrings();
  
  _ui = new Window ("palette",localize(_global.addBookmarks));
  _ui.script_name = "Check-Add-Bookmarks";
  __insert_head( _ui, script_id );
  _maingroup = _ui.add("group");
  with (_maingroup) {
    orientation = "row";
    alignChildren = ["fill", "fill"];   
    spacing = 50;
    var _mainGroup = add("group");
    with(_mainGroup) {
      orientation = "column";
      spacing = 0;
      alignChildren = ["fill","fill"];
      var _optionsButtonGroup = add ("group");
      with (_optionsButtonGroup) {
        var _pStyleButton = add ("button", undefined, localize(_global.pStyleButtonLabel));
        with (_pStyleButton) {
          minimumSize.height = 30;
          minimumSize.width = 120;
        } /* END _pStyleButton */ 
        var _cStyleButton = add ("button", undefined, localize(_global.cStyleButtonLabel));
        with (_cStyleButton) {
          minimumSize.height = 30;
          minimumSize.width = 120;
        } /* END _cStyleButton */
        var _grepButton = add ("button", undefined, localize(_global.grepButtonLabel));
        with (_grepButton) {
          minimumSize.height = 30;
          minimumSize.width = 120;
        } /* END _grepButton */
      } /* END _optionsButtonGroup */ 
      var _arrowGroup = add("group");
      with(_arrowGroup) {
        alignChildren = ["fill", "fill"];
        var _arrowPStyleGroup = add("group");
        with(_arrowPStyleGroup) {
          alignChildren = ["center","bottom"];
          var _arrowPStyle = add ("image",undefined,_icons.arrow); 
          with (_arrowPStyle) { 
            visible = false;
          } /* END _arrowPStyle */
        } /* END _arrowPStyleGroup */      
        var _arrowCStyleGroup = add("group");
        with(_arrowCStyleGroup) {
          alignChildren = ["center","bottom"];
          var _arrowCStyle = add ("image",undefined,_icons.arrow); 
          with (_arrowCStyle) { 
            visible = false;
          } /* END _arrowCStyle */
        } /* END _arrowCStyleGroup */      
        var _arrowGrepGroup = add("group");
        with(_arrowGrepGroup) {
          alignChildren = ["center","bottom"];
          var _arrowGrep = add ("image",undefined,_icons.arrow); 
          with (_arrowGrep) { 
            visible = false;
          } /* END _arrowGrep */
        } /* END _arrowGrepGroup */       
      } /* END _optionsButtonGroup */     
      var _inputGroup = add("group");
      with(_inputGroup) {
        orientation = "stack";
        margins = [10,10,10,10];
        alignChildren = ["fill", "fill"];
        graphics.backgroundColor = graphics.newBrush(graphics.BrushType.SOLID_COLOR,[0.8,0.8,0.8], 1);
        var _placeholder = add("statictext", undefined, localize(_global.placeholder));
        with(_placeholder) {
          graphics.font = "dialog:15";
          graphics.foregroundColor = graphics.newPen(graphics.PenType.SOLID_COLOR,[0.4,0.4,0.38],1);
        }
        var _pStyleDropDown = add("dropdownlist", undefined, [_doc.allParagraphStyles[0].name,_doc.allParagraphStyles[1].name]);
        with(_pStyleDropDown) {
          visible = false;
          selection = 1;
        } /* END _cStyleDropDown */
        var _cStyleDropDown = add("dropdownlist", undefined, [_doc.allCharacterStyles[0].name]);
        with(_cStyleDropDown) {
          visible = false;        
          selection = 0;
        } /* END _cStyleDropDown */
        var _grepInputField = add("edittext", undefined, "", {multiline: false});
        with(_grepInputField) {
          visible = false;
        } /* END _grepInputField */
      } 
      var _parentBookmarkGroup = add("group");
      with(_parentBookmarkGroup) {
        margins = [10,20,10,0];
        alignChildren = ["fill","bottom"];
        spacing = 0;
        var _parentBookmarkCheck = add ("checkbox", undefined, localize(_global.parentBookmarkCheckboxLabel));
        with(_parentBookmarkCheck) {
          value = false; 
        } /* END _parentBookmarkCheck */
        var _parentBookmarkDropdown = add("dropdownlist", undefined, undefined);
        with(_parentBookmarkDropdown) {
          preferredSize.width = 140;
          visible = false;
        } /* END _parentBookmarkDropdown */
      } /* END _parentBookmarkGroup */
    
    } /* END _mainGroup */
    var _cancelButtonGroup = add ("group");
    with (_cancelButtonGroup) {
      orientation = "column";
      alignChildren = ["left","top"];
      var _startButton = add ("button", undefined, localize(_global.startButtonLabel), {name: "ok"});
      with (_startButton) {
        minimumSize.height = 30;
        minimumSize.width = 100;
      }
      var _cancelButton = add ("button", undefined, localize(_global.cancelButtonLabel), {name: "cancel"});  
      with (_cancelButton) {
        minimumSize.height = 30;
        minimumSize.width = 100;
      }
    } /* END _cancelButtonGroup */    
  } /* END _ui window */




  
  /* Callbacks ++++++++++++++++++++++++++++ */
    
  if (app.scriptPreferences.version < 9) {
    _inputGroup.onDraw = function() {      
      with(_inputGroup) {
        var _fillBrushInputGroup = graphics.newBrush(graphics.BrushType.SOLID_COLOR, [0.8, 0.8, 0.8, 1]);
        graphics.rectPath(0,0,size[0],size[1]);
        graphics.fillPath(_fillBrushInputGroup);
      }
    }
  }


  _pStyleButton.onClick = function() {     
    __showSelectedItem(this);
  }
  
  
  _pStyleDropDown.addEventListener("mousedown", __pStyleDropDownHandler); /* CS6 */   
  _pStyleDropDown.addEventListener("focus", __pStyleDropDownHandler); /* CC */
  
  function __pStyleDropDownHandler() {
    
    if(app.documents.length == 0) { return; }

    __refreshStylesDropDown(_pStyleDropDown,"Pragraph Styles");
    return;
  } /* END function __pStyleDropDownHandler */
  
  
  _cStyleButton.onClick = function() {         
    __showSelectedItem(this);
  }

  
  _cStyleDropDown.addEventListener("mousedown", __cStyleDropDownHandler); /* CS6 */   
  _cStyleDropDown.addEventListener("focus", __cStyleDropDownHandler); /* CC */

  function __cStyleDropDownHandler() {
    
    if(app.documents.length == 0) { return; } 
    
    __refreshStylesDropDown(_cStyleDropDown,"Character Styles");
    return;
  } /* END function __cStyleDropDownHandler */


  _grepButton.onClick = function() {
    __showSelectedItem(this);    
  }

 
  _parentBookmarkCheck.onClick = function() {
    
    if(app.documents.length == 0) { return; }
    
    var _allBookmarks;
    
    if(this.value == true) {  
      _parentBookmarkDropdown.show();      
      __refreshParentBookmarkDropdown(_parentBookmarkDropdown); 
    } else {    
      _parentBookmarkDropdown.hide();
    }
  }

  
  _parentBookmarkDropdown.addEventListener("mousedown", __parentBookmarkDropdownHandler); /* CS6 */   
  _parentBookmarkDropdown.addEventListener("focus", __parentBookmarkDropdownHandler); /* CC */
  
  function __parentBookmarkDropdownHandler() {  
    
    if(app.documents.length == 0) { return; }     
    
    __refreshParentBookmarkDropdown(_parentBookmarkDropdown);
    
    return;
  } /* END function __parentBookmarkDropdownHandler */


  _startButton.onClick = function() { 
         
    if(app.documents.length == 0) { return; }
    
    var _selection = null,
        _addedBookmarks,
        _allBookmarks = [],
        _parentBookmark,
        _userInteractionLevel,
        _selectedStyle,
        _inputGrepString;
   
    /* Paragraph Style */
    if(_pStyleDropDown.visible == true) {  
      if(_pStyleDropDown.selection != null) {         
        _selectedStyle = app.activeDocument.allParagraphStyles[_pStyleDropDown.selection.index];
        if(_selectedStyle != null) { 
          _selection = _selectedStyle; 
        } else {
          _selection = null;
        }
      } else {
        _selection = null;
      }  
    }
       
    /* Character Style */
    if(_cStyleDropDown.visible == true) {  
      if(_cStyleDropDown.selection != null) {
        _selectedStyle = app.activeDocument.allCharacterStyles[_cStyleDropDown.selection.index];
        if(_selectedStyle != null) { 
          _selection = _selectedStyle; 
        } else {
          _selection = null;
        }
      } else {
        _selection = null;
      }
    }
  
    /* GREP */
    if(_grepInputField.visible == true) {     
      _inputGrepString = _grepInputField.text;
      if(_inputGrepString != "") {
        _selection = _inputGrepString;
      } else {
        _selection = null; 
      }
    }
    
    if(_parentBookmarkCheck.value == true && _parentBookmarkDropdown.selection != null) {
      
      if (app.scriptPreferences.version >= 6) {
        _allBookmarks = app.doScript(__getAllBookmarks, ScriptLanguage.JAVASCRIPT , undefined, UndoModes.ENTIRE_SCRIPT, localize(_global.refreshBookmarkListDoScriptLabel));  
      } else { 
        _allBookmarks = __getAllBookmarks(); 
      } 
      _parentBookmark = _allBookmarks[_parentBookmarkDropdown.selection.index]; 
    }
  
    if (app.scriptPreferences.version >= 6) {
      _addedBookmarks = app.doScript(__makeBookmarks, ScriptLanguage.JAVASCRIPT , [_selection,_parentBookmark], UndoModes.ENTIRE_SCRIPT, "Add Bookmarks");  
    } else { 
      _addedBookmarks = __makeBookmarks([_selection,_parentBookmark]); 
    }

    _ui.text = __alertResult(_addedBookmarks);
  }


  _cancelButton.onClick = function() {     
    _ui.close();
  }


  _ui.onClose = function() {
    _global = null;
  }


  _ui.onShow = function() {
    _pStyleButton.notify();
  }
  /* END Callbacks ++++++++++++++++++++++++ */
  
  
  _ui.show ();
  
  
  return;
  
  
  
  
  function __showSelectedItem(_item) {
    
    var _selectedItem;
    
    _inputGroup.children[0].visible = false;
    
    for(var i=0; i < _item.parent.children.length; i++) {     
      if(_item.parent.children[i] === _item) {       
        _selectedItem = _inputGroup.children[i+1];
        _selectedItem.visible = true;
        _arrowGroup.children[i].children[0].visible = true;           
      } else {
        _inputGroup.children[i+1].visible = false;
        _arrowGroup.children[i].children[0].visible = false;
      }   
    }
    return;
  } /* END function __showSelectedItem */
  
  
  
  
  function __refreshStylesDropDown(_dropDown,_styles) {
    
    var _dropDownList,
        _selectionIndex;
        
    if(_dropDown.selection != null)  {
      _selectionIndex = _dropDown.selection.index;
    } else {
      _selectionIndex = 1;
    }
    
    if(_styles == "Pragraph Styles") {
      _dropDownList = __getAllStyleNames("allParagraphStyles","ParagraphStyleGroup");     
    } else {
      _dropDownList = __getAllStyleNames("allCharacterStyles","CharacterStyleGroup");
    }
    
    _dropDown.removeAll();
    
    for(var i=0; i<_dropDownList.length; i++) {
      _dropDown.add("item", _dropDownList[i]);    
    }
  
    _dropDown.selection = _selectionIndex;
    return;
  } /* END function __refreshStylesDropDown */




  
  function __refreshParentBookmarkDropdown(_dropDown) {
    
    var _allBookmarks,
        _selectionIndex;
    
    if(_dropDown.selection != null)  {
      _selectionIndex = _dropDown.selection.index;
    } else {
      _selectionIndex = 0;
    }
       
    _dropDown.removeAll(); 
    
    if (app.scriptPreferences.version >= 6) {
      _allBookmarks = app.doScript(__getAllBookmarks, ScriptLanguage.JAVASCRIPT , undefined, UndoModes.ENTIRE_SCRIPT, localize(_global.refreshBookmarkListDoScriptLabel));  
    } else { 
      _allBookmarks = __getAllBookmarks(); 
    } 
    
    for(var i=0;i<_allBookmarks.length;i++) {
      _dropDown.add("item",_allBookmarks[i].extractLabel("fullName"));  
    } 
  
    _dropDown.selection = _selectionIndex; 
    return;
  }  /* END function __refreshParentBookmarkDropdown */
  
  
  
  
  
  function __getAllStyleNames(_allStylesPropertyName,_instanceName) {
 
    var _doc = app.activeDocument,
        _allStyles = _doc[_allStylesPropertyName],
        _allStylesLength = _allStyles.length,
        _style,
        _styleName = "",
        _allStyleNames = [], 
        i;
    
    for (i=0; i<_allStylesLength; i++) { 
      _style = _allStyles[i];
      _styleName = _style.name;
      _styleName = __getStyleName(_style,_styleName); 
      _allStyleNames.push(_styleName);
    }

    function __getStyleName(_style,_styleName) {
      
      var _styleGroupName,
          _maxLength = 14,
          _suffix;
          
      if (_style.parent.constructor.name == _instanceName) { 
        
        _styleGroupName = _style.parent.name;
        
        if (_styleGroupName.length > _maxLength) {
          _suffix = "... > ";
        } else {
          _suffix = " > ";
        }   
        _styleName = _styleGroupName.substring(0,_maxLength) + _suffix + _styleName;
        _styleName = __getStyleName(_style.parent,_styleName); 
      }
      
      return _styleName;
    } /* END function __getStyleName */

    return _allStyleNames;
  } /* END function __getAllStyleNames */
} /* END function __showDialog */





function __alertResult(_addedBookmarks) { 
  return _addedBookmarks[0] + " " + localize(_global.bookmarksAddedAlert) + "\u2003|\u2003" + _addedBookmarks[1] + " " + localize(_global.errorsAlert); 
} /* END function __alertResult */





function __makeBookmarks(_selectedValues) {
  
  if(app.documents.length == 0) { return false; }
  
  var _doc = app.activeDocument, 
      _selectedValue = _selectedValues[0],
      _parentBookmark = _selectedValues[1],
      _allParagraphs,
      _allTextStyleRanges,
      _bookmarkCondition,
      _hits,
      _result,
      _continue = true,
      i;
  
  if(_selectedValue == null || _selectedValue == "") { return [0,0]; }
  
  switch (_selectedValue.constructor.name) {
    case "ParagraphStyle" :
      _allParagraphs = __getAllParagraphs();
      _result = __addBookmarksTo(_allParagraphs,"appliedParagraphStyle",_selectedValue,_parentBookmark);
      break;
    case "CharacterStyle" :
      _allParagraphs = __getAllParagraphs();
      _allTextStyleRanges = __getAllTextStyleRanges(_allParagraphs);
      _result = __addBookmarksTo(_allTextStyleRanges,"appliedCharacterStyle",_selectedValue,_parentBookmark);
      break;
    case "String" :
      _continue = __alertConditionalText();
      if(!_continue) { return [0,0]; }
      _bookmarkCondition = __makeCondition();
      __mark(_selectedValue,_bookmarkCondition);
      _hits = __find(NothingEnum.nothing,_bookmarkCondition);
      __delCondition();
      _result = __addBookmarksTo(_hits,null,null,_parentBookmark);
      break;
    default :
      _result = [0,0];
  }
  
  return _result;
} /* END function __makeBookmarks */





function __addBookmarksTo(_objs,_appliedStyle,_selectedStyle,_parentBookmark) {

  var _progressWin,
      _start = 0,
      _stop = _objs.length,
      _keyState,
      _bookmarkCounter = 0,
      _errorCounter = 0;
   
  _progressWin = __showProgressbar(_start,_stop);
  
  for(i = _objs.length - 1; i >= 0; i--) {    
       
    _progressWin.children[0].text = _objs[i].contents;
    _progressWin.children[1].value = _stop - i;   
    _keyState = ScriptUI.environment.keyboardState;
    
    if(_keyState.keyName == "Escape") {
        _progressWin.close();
        break;
    } 
    
    if(_appliedStyle == null || _objs[i][_appliedStyle] == _selectedStyle) {    
      if(__addBookmark(_objs[i],_parentBookmark)) {
        _bookmarkCounter += 1;
      } else {    
        _errorCounter += 1;
      } 
    }
  }

  return [_bookmarkCounter,_errorCounter];
} /* END function __addBookmarksTo */





function __addBookmark(_destTextObj,_parentBookmark) {
   
  var _doc = app.activeDocument,
      _destTextAnchor,
      _destIP,
      _destName,
      _allTextAnchors,
      _bookmark,
      _bookmarkName; 
  
  if(_destTextObj.contents.constructor.name == "String") {
    _destName = _bookmarkName = _destTextObj.contents.replace("\\s+"," ","g").replace("[\x00-\x1F\uFEFF\uFFFC\u00AD\u200C\u200B]","","g").replace("\\s+$","",""); /* \u00AD Bedingter Trennstrich; \u200C Vebindung unterdruecken; \u200B Bedingter Zeilenumbruch */
  } else {
    _destName = _bookmarkName = localize(_global.anchorLabel);
  }
  if(_destName == "") { 
    _destName = _bookmarkName = localize(_global.anchorLabel);
  }
  
  try {
    _destIP = _destTextObj.insertionPoints[0];
    _destTextAnchor = _doc.hyperlinkTextDestinations.add(_destIP);         
  } catch(e) { 
    return false; 
  }

  try { 
    _allTextAnchors = _doc.hyperlinkTextDestinations.everyItem().getElements();
    _destTextAnchor.name = __checkName(_destName," ",_allTextAnchors); 
  } catch(e) { }
  
  try {
    _bookmark = _doc.bookmarks.add(_destTextAnchor); 
    /* _bookmark.showBookmark(); */
    _bookmark.move(LocationOptions.AT_BEGINNING,_parentBookmark);
    _bookmark.name = _bookmarkName;   
  } catch(e) { 
    return false; 
  }
  
  return true;
} /* END function __addBookmark */





function __getAllParagraphs(_every) {
    
  var _doc = app.activeDocument,
      _paragraphs,
      _more,
      _moreParagraphs;
  
  _every = _every || _doc.stories.everyItem();
  
  if(!_every.isValid) { return []; }
  
  if(_every.paragraphs.length != 0) {
    _paragraphs = _every.paragraphs.everyItem().getElements();
  } else {
    _paragraphs = [];     
  }

  _more = _every.texts && _every.texts.everyItem && _every.texts.everyItem();
  
  if(!_more) { return _paragraphs; }
  
  if(_more.tables.length != 0) {
    _moreParagraphs = __getAllParagraphs(_more.tables.everyItem().cells.everyItem());
    _paragraphs = _paragraphs.concat(_moreParagraphs);
  }

  if(_more.footnotes.length != 0) {
    _moreParagraphs = __getAllParagraphs(_more.footnotes.everyItem());
    _paragraphs = _paragraphs.concat(_moreParagraphs);
  }

  _more = null;
  return _paragraphs;    
} /* END function __getAllParagraphs */





function __getAllTextStyleRanges(_paragraphs) {
  
  var _textStyleRanges = [],
      i;

  for(i = 0; i < _paragraphs.length; i++) {   
    _textStyleRanges = _textStyleRanges.concat(_paragraphs[i].textStyleRanges.everyItem().getElements());  
  }

  return _textStyleRanges;
} /* END function __getAllTextStyleRanges */





/* Ueberpruefen, ob Objektname schon existiert */
function __checkName(_name,_delimiter,_objArray) {
    
  var _equal = false,
      _existingName,
      _newName,
      _maxLength = 230, 
      _appendix = 1,
      _numberOfObjects = _objArray.length;
 
  _name = _name.substring(0,_maxLength);
  _newName = _name;
  
  do {
    for(var i=0;i<_numberOfObjects;i++) {
      _equal = false;
      _existingName = _objArray[i].name;
      if(_existingName === _newName) {
        _equal = true;
        _newName = _name.replace(_delimiter +"\\d+$","","") + _delimiter + _appendix;
        break;
      } 
    }  
    _appendix += 1;
  } while (_equal)

  return _newName;
} /* END function __checkName */





function __getAllBookmarks(_parent) {
 
  var _doc = app.activeDocument, 
      _bookmarks,
      _moreBookmarks,
      _parent,
      _allBookmarks = [],
      i,j;
  
  _parent  = _parent || _doc;
  _bookmarks = _parent.bookmarks.everyItem().getElements();
   
  for(i=0;i<_bookmarks.length;i++) {
    
    if(_bookmarks[i].bookmarks.length > 0) {
      _allBookmarks.push(_bookmarks[i]); 
      _bookmarks[i].insertLabel("fullName",__makeBookmarkFullName(_bookmarks[i]));
      _moreBookmarks = __getAllBookmarks(_bookmarks[i]);
      _allBookmarks = _allBookmarks.concat(_moreBookmarks);
    } else {
      _allBookmarks.push(_bookmarks[i]);
      _bookmarks[i].insertLabel("fullName",__makeBookmarkFullName(_bookmarks[i]));
    }
  }

  function __makeBookmarkFullName(_curBookmark) {
    
    var _maxLength = 50,
        _name = _bookmarks[i].name;
    
    if(_name.length > _maxLength) {
      _name = _name.substring(0,_maxLength) + "...";
    }
    
    if(_curBookmark.bookmarks.length > 0) {
      _name = "\u25BC " + _name;
    }
    
    for(j=1;j<=_curBookmark.indent;j++) {
      _name = "\u2003" + _name;
    }

    return _name;
  } /* END function __makeBookmarkFullName */
  
    return _allBookmarks;
} /* END function __getAllBookmarks */





function __mark(_what,_bookmarkCondition) {

  with (app) {   
    with (findChangeGrepOptions) {   
      //User-Einstellungen speichern
      var _userIncludeFootnotes = includeFootnotes,
          _userIncludeHiddenLayers = includeHiddenLayers,
          _userIncludeLockedLayersForFind = includeLockedLayersForFind,
          _userIncludeLockedStoriesForFind = includeLockedStoriesForFind,
          _userIncludeMasterPages = includeMasterPages;
      //Script-Einstellungen setzen
      includeFootnotes = true;
      includeHiddenLayers = true;
      includeLockedLayersForFind = false; 
      includeLockedStoriesForFind = false; 
      includeMasterPages = true;     
    }  
  
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findGrepPreferences) {
      findWhat = _what;
    }
  
    with (changeGrepPreferences) {
      changeTo = NothingEnum.nothing;      
      changeConditionsMode = ChangeConditionsModes.ADD_TO; 
      appliedConditions = [_bookmarkCondition];     
    }
        
    try {
      app.activeDocument.changeGrep();  
    } catch(e) { 
      alert("Fehler: \r" + e + "Zeile: " + e.line); 
    }    
    
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findChangeGrepOptions) {     
      //User-Einstellungen wieder herstellen
      includeFootnotes = _userIncludeFootnotes;
      includeHiddenLayers = _userIncludeHiddenLayers;
      includeLockedLayersForFind = _userIncludeLockedLayersForFind;
      includeLockedStoriesForFind = _userIncludeLockedStoriesForFind;
      includeMasterPages = _userIncludeMasterPages;    
    } 
  }

  return;
} /* END function __mark */





function __find(_what,_bookmarkCondition) {

  var _results;

  with (app) {   
    with (findChangeGrepOptions) {   
      //User-Einstellungen speichern
      var _userIncludeFootnotes = includeFootnotes,
          _userIncludeHiddenLayers = includeHiddenLayers,
          _userIncludeLockedLayersForFind = includeLockedLayersForFind,
          _userIncludeLockedStoriesForFind = includeLockedStoriesForFind,
          _userIncludeMasterPages = includeMasterPages;
      //Script-Einstellungen setzen
      includeFootnotes = true;
      includeHiddenLayers = true;
      includeLockedLayersForFind = false; 
      includeLockedStoriesForFind = false; 
      includeMasterPages = false;     
    }  
  
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findGrepPreferences) {
      findWhat = _what;
      appliedConditions = [_bookmarkCondition]; 
    }
        
    try {
      _results = app.activeDocument.findGrep();  
    } catch(e) { 
      alert("Fehler: \r" + e + "Zeile: " + e.line);
    }    
    
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findChangeGrepOptions) {     
      //User-Einstellungen wieder herstellen
      includeFootnotes = _userIncludeFootnotes;
      includeHiddenLayers = _userIncludeHiddenLayers;
      includeLockedLayersForFind = _userIncludeLockedLayersForFind;
      includeLockedStoriesForFind = _userIncludeLockedStoriesForFind;
      includeMasterPages = _userIncludeMasterPages;    
    } 
  }

  return _results;
} /* END function __find */




function __makeCondition() {
  
  var _doc = app.activeDocument,
      _bookmarkCondition;
  
  if (!_doc.conditions.itemByName(":::Bookmark:::").isValid) {
    _bookmarkCondition = _doc.conditions.add ({name: ":::Bookmark:::", 
                                               indicatorColor: [200,200,200], 
                                               indicatorMethod: ConditionIndicatorMethod.USE_HIGHLIGHT
                                              });
  } else {
    _bookmarkCondition = _doc.conditions.itemByName(":::Bookmark:::");
  }
  
  return _bookmarkCondition;
} /* END function __makeCondition */





function __delCondition() {
  
  var _doc = app.activeDocument;
  
  if (_doc.conditions.itemByName(":::Bookmark:::").isValid) {
    _doc.conditions.itemByName(":::Bookmark:::").remove();
  } 
  
  return;
} /* END function __delCondition */





/* Warnmeldung falls im Dokument bereits Bedingungen fuer bedingten Text vorhanden sind. */
function __alertConditionalText () {  

  if (app.activeDocument.conditions.length > 0) {
    return confirm (localize(_global.conditionAlert));
  }
  return true;
}




function __showProgressbar(_start,_stop) {
  
  var _progressWin = new Window ('palette');
  with(_progressWin) {
    spacing = 5;
    margins = [20,20,20,20];
    alignChildren = ["fill","center"];
    var _indicator = add("statictext",undefined,"");
    with(_indicator) {
      characters = 30; /* Breitenvorgabe des Fensters */
      justify = "center";
    }
    var _progressbar = add ('progressbar', undefined, _start, _stop);
    with(_progressbar) {
      minimumSize.width = "250";
    }
    var _cancelLabelGroup = add("group");
    with(_cancelLabelGroup) {
      orientation = "column";
      margins = [0,5,0,0];
      alignChildren = "center";
      var _cancelLabel = add("statictext",undefined,localize(_global.cancelWithESCLabel));
      with(_cancelLabel) {
        graphics.font = "dialog:12";
        graphics.foregroundColor = graphics.newPen(graphics.PenType.SOLID_COLOR,[0.4,0.4,0.38],1);
      }
    }
  } /* END _progressBarWin */

  _progressWin.show();
  
  return _progressWin;
} /* END function __showProgressbar */





/* Icons fuer UI */
function __defineIconsForUI() {
  
  return { 
    arrow: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x0B\b\x06\x00\x00\x00e5M\u00CD\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00A5IDATx\u00DAb<s\u00E6\f\x03\u0091\u0080\x11\u0088;\u00A0t9\x10\u00FF'F\x13\x0B\u0091\u00863\x03\u00F1l N\u0084\u00F2E\u00808\x15\u0088\u00FF\x12\u00D2\u00C8D\u0084\u00E1\u009C@\u00BC\x0E\u00C9p\x06({\x1DT\u008E\"\x0B\x04\u0080x;\x10\u00FBa\u0091\u00F3\u0083\u00CA\t\u0090k\u0081\x04\x10\u00EF\x07b{<j\u00EC\u00A1j$H\u00B5@\t\u0088\u008F\x02\u00B1\x01\x11Ah\x00U\u00ABD\u00AC\x05\u00FA\u00F84\x10p\u0090>!\x0B@^>\u0080\u00CF\u00CB\x04\u0082\u00F4\x00z\u00902\u0091\x1Ai\u00A4&\n\u0098\x05\t\u00C4&;\x12\u0092u\x02,\u00A3\u0095\x02q'4\u0087R\x0B\u00802\u00E6<P\u0086\x04\b0\x00\x18\u00B6\x1A\r\u0081\x03\u00BA\u00C5\x00\x00\x00\x00IEND\u00AEB`\u0082"
  } 
} /* END function __defineIconsForUI */





/* Deutsch-Englische Dialogtexte und Fehlermeldungen */
  function __defLocalizeStrings() {

    _global.addBookmarks = {
      en: "Add Bookmarks 1.1",
      es: "Agregar marcadores 1.1",
      de: "Add Bookmarks 1.1"
    }

    _global.pStyleButtonLabel = {
      en: "Paragraph Style",
      es: "Estilo de p\u00E1rrafo",
      de: "Absatzformat"
    }

    _global.cStyleButtonLabel = {
      en: "Character Style",
      es: "Estilo de car\u00E1cter",
      de: "Zeichenformat"
    }

    _global.placeholder = {
      en: "Please select one these options.",
      es: "Elija una opci\u00F3n.",
      de: "Bitte eine der Optionen auswählen."
    }

    _global.grepButtonLabel = {
      en: "GREP",
      es: "GREP",
      de: "GREP"
    }

    _global.startButtonLabel = {
      en: "Go",
      es: "Proceder",
      de: "Los"
    }

    _global.cancelButtonLabel = {
      en: "Close",
      es: "Cerrar",
      de: "Schlie\u00dfen"
    }

    _global.anchorLabel = {
      en: "Bookmark",
      es: "Marcador",
      de: "Lesezeichen"
    }

    _global.bookmarksAddedAlert = {
      en: "Bookmarks added",
      es: "Marcadores agregados",
      de: "Lesezeichen erstellt"
    }

    _global.refreshBookmarkListDoScriptLabel = {
      en: "Refresh bookmarks list",
      es: "Refrescar lista de marcadores",
      de: "Lesezeichen-Liste aktualisieren"
    }

    _global.errorsAlert = {
      en: "Search results skipped",
      es: "Resultados de b\u00FAsqueda omitidos",
      de: "Fundstellen \u00fcbersprungen"
    }

    _global.conditionAlert = {
      en: "Note! You already use »Conditional Text« in your document.\r\rIn certain cases these conditions can be overwritten by this script.\r\rContinue Anyway?",
      es: "Est\u00E1 usando 'Texto condicional' en el documento.\r\rEn ciertos casos, este guion puede sobrescribir estas condiciones.\r\r\u00BFContinuar igual?",
      de: "Hinweis!\rSie arbeiten in Ihrem Dokument mit »bedingtem Text«.\r\rIn bestimmten F\u00e4llen k\u00f6nnen die an den Suchbegriffen angewandten »Bedingungen« durch dieses Skipts \u00fcberschrieben werden.\r\rTrotzdem fortfahren?"
    }

    _global.parentBookmarkCheckboxLabel = {
      en: "Parent Bookmark",
      es: "Marcador padre",
      de: "\u00dcbergeordnetes Lesezeichen"
    }

    _global.cancelWithESCLabel = {
      en: "Cancel with ESC",
      es: "Cancelar con ESC",
      de: "Abbrechen mit ESC"
    }

  } /* END function __defLocalizeStrings */