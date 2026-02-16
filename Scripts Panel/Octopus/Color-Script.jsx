//@targetengine "colorScript"

//DESCRIPTION: Helps you to tackle color management  

/*
  + Color Script 1.0.9
  + Autor: Roland Dreger 
  + Indesign Version: CS 6
  
  + Datum: 14. Juni 2015 
	+ Letzte Ändererung: 3. November 2023
  
  + Freies Script fuer private und kommerzielle Nutzung (Creativ Commons Lizenz: Roland Dreger, CC BY 3.0 AT). 
  + Verwendung auf eigene Gefahr.
  
  + Free Script for private and commercial use (Creativ Commons Licence: Roland Dreger, CC BY 3.0 AT). 
  + Use at your own risk.
	
	Hinweise:
	Überprüfen: __getProfile -> "No Meta Data" Zeile: 1893
  
*/
#include "./Octopus-include.jsxinc"
var script_name = "Color-Script.jsx";
__log_run( script_name );

var _global = {};

if (app.documents.length > 0) {  
  if (app.scriptPreferences.version >= 6) {
    app.doScript(__main, ScriptLanguage.JAVASCRIPT , [], UndoModes.ENTIRE_SCRIPT, "Color Script");  
  } else { 
    main(); 
  }  
} else { 
  var _noDocOpened = { 
		en:"No document opened!\rTo run the script at least one document must be open.", 
    de:"Kein Dokument geöffnet!\rZur Ausführung des Skripts muss mindestens ein offenes Dokument vorhanden sein." 
	};
  alert(localize (_noDocOpened), "Error", true); 
  _noDocOpened = null;
}




function __main() {
  
  __showUI(); 
  
} // END function __main





// User Interface generieren
function __showUI () {
  
  __defLocalizeStrings();
  var _icons = __defineIconsForUI(),
      _ui;
  
  _ui = new Window("palette",localize(_global.uiHead));
  with (_ui) { 
    margins = [10,0,10,10];
    spacing = 0;
    try { var _headerImage = add("image",undefined,_icons.headerImage); } catch(e){};
    var _proofGroup = add("group");
    with(_proofGroup) {
      alignChildren = "center";
      orientation = "column";
      margins = [0,10,0,10];
      spacing = 0;
      var _proofProfile = add("statictext",undefined,""); 
      with(_proofProfile) {
        characters = 40;
        justify = "center";
				helpTip = localize(_global.colorProofProfileHelpTip);
      } // END statictext _proofProfile 
      var _proofLabel = add("statictext",undefined,"Proof:"); 
      with(_proofLabel) {
        characters = 10;
        justify = "center";
      } // END statictext _proofLabel   
    } // END group _proofGroup

    var _tabPanel = add("tabbedpanel");
    with(_tabPanel) {
      alignChildren = ["fill", "fill"];
      alignment = ["fill","fill"]; 
			maximumSize.width = 400;  
      var _adjustTab = add("tab", undefined,localize(_global.adjust));
      with(_adjustTab) {
        alignChildren = "fill";
        spacing = 18;
        margins = [15,10,5,5];
        var _docNameAdjustTab = add("statictext",undefined,"");
        with(_docNameAdjustTab) {
          characters = 40;
          justify = "center";
        } // END statictext _docNameAdjustTab
        var _workingSpacesPanel = add("panel",undefined,localize(_global.workingSpaces)); 
        with(_workingSpacesPanel) {
          alignChildren = ["fill", "fill"];
          margins.top = 26;
          margins.bottom = 20;
          spacing = 0;
          helpTip = localize(_global.workingSpacesHT);
          var _workingSpacesRGBGroup = add("group");
          with(_workingSpacesRGBGroup) {
            alignChildren = ["right","center"];
            var _workingSpacesRGBLabel = add("statictext",undefined,"RGB:");
            var _workingSpacesRGBDropdown = add("dropdownlist",undefined,app.activeDocument.rgbProfileList);
            with(_workingSpacesRGBDropdown) {
              preferredSize.width = 270;
              selection = 0; 
            } // END dropdownlist _workingSpacesRGBDropdown
          } // END group _workingSpacesRGBGroup
          var _workingSpacesCMYKGroup = add("group");
          with(_workingSpacesCMYKGroup) {
            alignChildren = ["right","center"];
            var _workingSpacesCMYKLabel = add("statictext",undefined,"CMYK:");
            var _workingSpacesCMYKDropdown = add("dropdownlist",undefined,app.activeDocument.cmykProfileList);
            with(_workingSpacesCMYKDropdown) {
              preferredSize.width = 270;
              selection = 0;
            } // END dropdownlist _workingSpacesCMYKDropdown
          } // END group _workingSpacesCMYKGroup  
        } // END panel _workingSpacesPanel
      
        var _colorManagementPoliciesPanel = add("panel",undefined,localize(_global.colorManagementPolicies)); 
        with(_colorManagementPoliciesPanel) {
          alignChildren = ["fill", "fill"];
          margins.top = 26;
          margins.bottom = 20;
          spacing = 0;
          helpTip = localize(_global.colorManagementPoliciesHT);
          var _colorManagementPoliciesRGBGroup = add("group");
          with(_colorManagementPoliciesRGBGroup) {
            alignChildren = ["right","center"];
            var _colorManagementPoliciesRGBLabel = add("statictext",undefined,"RGB:"); 
            var _colorManagementPoliciesRGBDropdownList = [localize(_global.colorManagementPoliciesRGBDropdownOff),localize(_global.colorManagementPoliciesRGBDropdownPreserveProfiles),localize(_global.colorManagementPoliciesRGBDropdownConvert)];
            var _colorManagementPoliciesRGBDropdown = add("dropdownlist", undefined, _colorManagementPoliciesRGBDropdownList);
            with(_colorManagementPoliciesRGBDropdown) {
              preferredSize.width = 270;
              selection = 0; 
              //items[2].enabled = true;
              try {items[0].image = _icons.warning;} catch (e) {}
              try {items[2].image = _icons.warning;} catch (e) {}
            } // END dropdownlist _colorManagementPoliciesRGBDropdown
          } // END group _colorManagementPoliciesRGBGroup
          var _colorManagementPoliciesCMYKGroup = add("group");
          with(_colorManagementPoliciesCMYKGroup) {
            alignChildren = ["right","center"];
            var _colorManagementPoliciesCMYKLabel = add("statictext",undefined,"CMYK:");
            var _colorManagementPoliciesCMYKDropdownList = [localize(_global.colorManagementPoliciesCMYKDropdownOff),localize(_global.colorManagementPoliciesCMYKDropdownPreserveNumbers),localize(_global.colorManagementPoliciesCMYKDropdownPreserveProfiles),localize(_global.colorManagementPoliciesCMYKDropdownConvert)];
            var _colorManagementPoliciesCMYKDropdown = add("dropdownlist", undefined, _colorManagementPoliciesCMYKDropdownList);
            with(_colorManagementPoliciesCMYKDropdown) {
              preferredSize.width = 270;
              selection = 0;
              //items[3].enabled = false;
              try {items[0].image = _icons.warning;} catch (e) {}
              try {items[3].image = _icons.warning;} catch (e) {}
            } // END dropdownlist _colorManagementPoliciesCMYKDropdown
          } // END group _colorManagementPoliciesCMYKGroup
        } // END panel _colorManagementPoliciesPanel
      
        var _conversionOptionsPanel = add("panel",undefined,localize(_global.conversionOptions)); 
        with(_conversionOptionsPanel) {
          alignChildren = "left";
          spacing = 5;
          margins = [18,24,18,20];
          helpTip = localize(_global.conversionOptionsHT);
          var _engineGroup = add("group");
          with(_engineGroup) {
            spacing = 2;
            var _engineLabel = add("statictext",undefined,localize(_global.engine));
            with(_engineLabel) {
            } // END statictext _engineLabel
            var _engine = add("statictext",undefined,"");
            with(_engine) {
              characters = 30;
            } // END statictext _engine
          } // END group _engineGroup  
          var _intentGroup = add("group");
          with(_intentGroup) {
            spacing = 2;
            var _intentLabel = add("statictext",undefined,localize(_global.intent));
            with(_intentLabel) {
            } // END statictext _intentLabel
            var _intent = add("statictext",undefined,"");
            with(_intent) {
              characters = 26;
            } // END statictext _intent
          } // END group _intentGroup
          var _blackCompGroup = add("group");
          with(_blackCompGroup) {
            spacing = 2;
            var _useBlackPointCompensationLabel = add("statictext",undefined,localize(_global.useBlackPointCompensation));
            with(_useBlackPointCompensationLabel) {
            } // END statictext _useBlackPointCompensationLabel
            var _useBlackPointCompensation = add("statictext",undefined,"");
            with(_useBlackPointCompensation) {
              characters = 4;
            } // END statictext _useBlackPointCompensation
          } // END group _blackCompGroup
        } // END panel _conversionOptionsPanel

        var _transBlendSpaceGroup = add("group");
        with(_transBlendSpaceGroup) {
          alignChildren = ["center","fill"];;
          margins = [0,10,0,10];
          var _transBlendSpaceLable = add("statictext",undefined,localize(_global.transBlendSpaceLable));
          with(_transBlendSpaceLable) {
          } //END statictext _transBlendSpaceLable
          var _transBlendSpace = add("statictext",undefined,"");
          with(_transBlendSpace) {
            characters = 5;
          } //END statictext _transBlendSpaceLable
        } // END group _transBlendSpaceGroup
      } // END tab _adjustTab
    
      var _updateTab = add("tab",undefined,localize(_global.update));
      with(_updateTab) {
        alignChildren = "fill";
        spacing = 18;
        margins = [15,10,5,5];
        var _docNameUpdateTab = add("statictext",undefined,"");
        with(_docNameUpdateTab) {
          characters = 40;
          justify = "center";
        } // END statictext _docNameUpdateTab
        var _placeGraphicsAgainPanel = add("panel",undefined,localize(_global.adaptPolicies));
        with(_placeGraphicsAgainPanel) {
          alignChildren = "left";
          margins = [18,30,0,20];
          spacing = 10;
          var _placeGraphicsAgainActionGroup = add("group");    
          with(_placeGraphicsAgainActionGroup) {
            orientation = "column";
            alignChildren = "left";
            alignment = ["fill","fill"];
            var _placeGraphicsAgainActionTitle = add("statictext",undefined,localize(_global.placeGraphicsAgainActionTitle));
            with(_placeGraphicsAgainActionTitle) {
            } // END statictext _placeGraphicsAgainActionTitle
            var _placeGraphicsAgainActionText = add("statictext",undefined,localize(_global.adaptPoliciesActionDescription),{ multiline: true});
            with(_placeGraphicsAgainActionText) {
              characters = 34;
            } // END statictext _placeGraphicsAgainActionText
          } // END group _placeGraphicsAgainActionGroup
          var _placeGraphicsAgainDescriptionGroup = add("group");
          with(_placeGraphicsAgainDescriptionGroup) {
            orientation = "column";
            alignChildren = "left";
            alignment = ["fill","fill"];
            margins = [0,10,0,0];
            var _placeGraphicsAgainDescriptionTitle = add("statictext",undefined,localize(_global.placeGraphicsAgainDescriptionTitle ));
            with(_placeGraphicsAgainDescriptionTitle) {
            } // END statictext _placeGraphicsAgainDescriptionTitle
            var _placeGraphicsAgainDescriptionTextPara1 = add("statictext",undefined,localize(_global.placeGraphicsAgainDescriptionTextPara1),{ multiline: true});
            with(_placeGraphicsAgainDescriptionTextPara1) {
              characters = 35;
            } // END statictext _placeGraphicsAgainDescriptionTextPara1
            var _placeGraphicsAgainDescriptionTextPara2 = add("statictext",undefined,localize(_global.placeGraphicsAgainDescriptionTextPara2),{ multiline: true});
            with(_placeGraphicsAgainDescriptionTextPara2) {
              characters = 35;
              visible = false;
            } // END statictext _placeGraphicsAgainDescriptionTextPara2
          } // END group _placeGraphicsAgainDescriptionGroup
          var _placeGraphicsAgainButtonGroup = add("group");
          with(_placeGraphicsAgainButtonGroup) {
            margins = [0,20,0,10];
            spacing = 6;
            var _placeGraphicsAgainButton = add("button",undefined,localize(_global.adaptPolicies));
            with(_placeGraphicsAgainButton) {
              preferredSize.width = 240;
              preferredSize.height = 38;
              helpTip = localize(_global.adaptPoliciesHT);
            } // END button _placeGraphicsAgainButton 
            try { 
              var _checkmark = add("image",undefined,_icons.checkmark); 
              with(_checkmark) {
                visible = false;
              } // END image _checkmark  
            } catch(e){};
            try { 
              var _info = add("iconbutton",undefined,_icons.info,{style: "toolbutton"}); 
              with(_info) {
                visible = true;
                size = [21,21];
                helpTip = localize(_global.moreInfo);
              } // END image _info  
            } catch(e){};
          } // END group _placeGraphicsAgainButtonGroup
          var _placeImagesAgainCheckbox = add("checkbox",undefined,localize(_global.placeGraphicsAgain));
          with(_placeImagesAgainCheckbox) {
            value = false;
            characters = 25;
          } // END checkbox _placeImagesAgainCheckbox
          var _formatCheckboxGroup = add("group");
          with(_formatCheckboxGroup) {
            var _formatCheckImages = add("checkbox", undefined, localize(_global.images));
            with(_formatCheckImages) {
              value = false;
              visible = false;
            } // END checkbox _formatCheckImages
            var _formatCheckPDF = add("checkbox", undefined, "PDF/AI");
            with(_formatCheckPDF) {
              value = false;
              visible = false;
            } // END checkbox _formatCheckPDF
            var _formatCheckINDD = add("checkbox", undefined, "INDD");
            with(_formatCheckINDD) {
              value = false;
              visible = false;
            } // END checkbox _formatCheckINDD
            var _formatCheckEPS = add("checkbox", undefined, "EPS");
            with(_formatCheckEPS) {
              value = false;
              visible = false;
            } // END checkbox _formatCheckEPS  
          } // END group _formatCheckboxGroup
        } // END panel _placeGraphicsAgainPanel
      } // END tab _updateTab
      
      var _checkTab = add("tab",undefined,localize(_global.check));
      with(_checkTab) {
        alignChildren = "fill";
        spacing = 18;
        margins = [15,10,5,5];
        var _docNameCheckTab = add("statictext",undefined,"");
        with(_docNameCheckTab) {
          characters = 40;
          justify = "center";
        } // END statictext _docNameCheckTab
        var _checkTabOverviewPanel = add("panel",undefined,localize(_global.checkTabOverviewPanelHead));
        with(_checkTabOverviewPanel) {
          orientation = "row";
          alignChildren = ["fill","fill"];
          margins.top = 32;
          margins.bottom = 24;
          var _checkTabOverviewPanelAllLinkGroup = add("group");
          with(_checkTabOverviewPanelAllLinkGroup) {
            spacing = 3;
            alignChildren = ["center","fill"];
            orientation = "column";
            var _checkTabOverviewPanelAllLinkNumber = add("statictext",undefined,"0");
            with(_checkTabOverviewPanelAllLinkNumber) {
              justify = "center";
              characters = 5;
            } // END statictext _checkTabOverviewPanelAllLinkNumber
            var _checkTabOverviewPanelAllLinkLabel = add("statictext",undefined,localize(_global.links));
            with(_checkTabOverviewPanelAllLinkLabel) {
              justify = "center";
            } // END statictext _checkTabOverviewPanelAllLinkLabel
          } // END _checkTabOverviewPanelAllLinkGroup
          var _checkTabOverviewPanelAllImagesGroup = add("group");
          with(_checkTabOverviewPanelAllImagesGroup) {
            alignChildren = ["center","fill"];
            orientation = "column";
            spacing = 3;
            var _checkTabOverviewPanelAllImagesNumber = add("statictext",undefined,"0");
            with(_checkTabOverviewPanelAllImagesNumber) {
              justify = "center";
              characters = 5;
            } // END statictext _checkTabOverviewPanelAllImagesNumber
            var _checkTabOverviewPanelAllImagesLabel = add("statictext",undefined,localize(_global.images));
            with(_checkTabOverviewPanelAllImagesLabel) {
              justify = "center";
            } // END statictext _checkTabOverviewPanelAllImagesLabel
          } // END _checkTabOverviewPanelAllImagesGroup
          var _checkTabOverviewPanelAllGraphicsGroup = add("group");
          with(_checkTabOverviewPanelAllGraphicsGroup) {
            alignChildren = ["center","fill"];
            orientation = "column";
            spacing = 3;
            var _checkTabOverviewPanelAllGraphicsNumber = add("statictext",undefined,"0");
            with(_checkTabOverviewPanelAllGraphicsNumber) {
              justify = "center";
              characters = 5;
            } // END statictext _checkTabOverviewPanelAllGraphicsNumber
            var _checkTabOverviewPanelAllGraphicsLabel = add("statictext",undefined,localize(_global.graphics));
            with(_checkTabOverviewPanelAllGraphicsLabel) {
              justify = "center";
            } // END statictext _checkTabOverviewPanelAllGraphicsLabel
          } // END _checkTabOverviewPanelAllGraphicsGroup
        } // END panel _checkTabOverviewPanel

        var _checkTabSingleViewTabPanel = add ("tabbedpanel");
        with(_checkTabSingleViewTabPanel) {
          alignChildren = ["fill", "fill"];
          alignment = ["fill","fill"];     
          var _singleViewTabPanelRGBTab = add("tab", undefined,localize(_global.singleViewRGBTabLabel));
          with(_singleViewTabPanelRGBTab) {
            alignChildren = "right";
            margins = [5,20,20,5];
            spacing = 0;
            var _singleViewTabPanelRGBTabAllRGBGroup = add("group");
            with(_singleViewTabPanelRGBTabAllRGBGroup) {
              margins.bottom = 20;
              spacing = 3;
              var _singleViewTabPanelRGBTabAllRGBLabel = add("statictext",undefined,localize(_global.singleViewTabPanelRGBTabAllRGBLabel));
              with(_singleViewTabPanelRGBTabAllRGBLabel) {
              } // END statictext _singleViewTabPanelRGBTabAllRGBLabel
              var _singleViewTabPanelRGBTabAllRGBNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelRGBTabAllRGBNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelRGBTabAllRGBNumber
              var _singleViewTabPanelRGBTabAllRGBButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelRGBTabAllRGBButton) { 
                preferredSize.height = 30;
              } // END button _singleViewTabPanelRGBTabAllRGBButton
            } // END group _singleViewTabPanelRGBTabAllRGBGroup
            var _singleViewTabPanelDocRGBProfileGroup = add("group");
            with(_singleViewTabPanelDocRGBProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelDocRGBProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelDocRGBProfileLabel));
              with(_singleViewTabPanelDocRGBProfileLabel) {
              } // END statictext _singleViewTabPanelDocRGBProfileLabel
              var _singleViewTabPanelDocRGBProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelDocRGBProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelDocRGBProfileNumber
              var _singleViewTabPanelDocRGBProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelDocRGBProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelDocRGBProfileButton
            } // END group _singleViewTabPanelDocRGBProfileGroup         
            var _singleViewTabPanelDiffRGBProfileGroup = add("group");
            with(_singleViewTabPanelDiffRGBProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelDiffRGBProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelDiffRGBProfileLabel));
              with(_singleViewTabPanelDiffRGBProfileLabel) {   
              } // END statictext _singleViewTabPanelDiffRGBProfileLabel
              var _singleViewTabPanelDiffRGBProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelDiffRGBProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelDiffRGBProfileNumber
              var _singleViewTabPanelDiffRGBProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelDiffRGBProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelDiffRGBProfileButton
            } // END group _singleViewTabPanelDiffRGBProfileGroup
            var _singleViewTabPanelNoneRGBProfileGroup = add("group");
            with(_singleViewTabPanelNoneRGBProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelNoneRGBProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelNoneRGBProfileLabel));
              with(_singleViewTabPanelNoneRGBProfileLabel) {
              } // END statictext _singleViewTabPanelNoneRGBProfileLabel
              var _singleViewTabPanelNoneRGBProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelNoneRGBProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelNoneRGBProfileNumber
              var _singleViewTabPanelNoneRGBProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelNoneRGBProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelNoneRGBProfileButton
            } // END group _singleViewTabPanelNoneRGBProfileGroup
            var _singleViewTabPanelAssignedRGBProfileGroup = add("group");
            with(_singleViewTabPanelAssignedRGBProfileGroup) {
              spacing = 5;
              margins.top = 20;
              var _singleViewTabPanelAssignedRGBProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelAssignedRGBProfileLabel));
              with(_singleViewTabPanelAssignedRGBProfileLabel) {
              } // END statictext _singleViewTabPanelFaultyLabel
              var _singleViewTabPanelAssignedRGBProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelAssignedRGBProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelAssignedRGBProfileNumber
              var _singleViewTabPanelAssignedRGBProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelAssignedRGBProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelAssignedRGBProfileButton
            } // END group _singleViewTabPanelAssignedRGBProfileGroup
          } // END tab _singleViewTabPanelRGBTab
        
          var _singleViewTabPanelCMYKTab = add("tab", undefined,localize(_global.singleViewCMYKTabLabel));
          with(_singleViewTabPanelCMYKTab) {
            alignChildren = "right";
            margins = [5,20,20,5];
            spacing = 0;
            var _singleViewTabPanelCMYKTabAllCMYKGroup = add("group");
            with(_singleViewTabPanelCMYKTabAllCMYKGroup) {
              margins.bottom = 20;
              spacing = 3;
              var _singleViewTabPanelCMYKTabAllCMYKLabel = add("statictext",undefined,localize(_global.singleViewTabPanelCMYKTabAllCMYKLabel));
              with(_singleViewTabPanelCMYKTabAllCMYKLabel) {
              } // END statictext _singleViewTabPanelCMYKTabAllCMYKLabel
              var _singleViewTabPanelCMYKTabAllCMYKNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelCMYKTabAllCMYKNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelCMYKTabAllCMYKNumber
              var _singleViewTabPanelCMYKTabAllCMYKButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelCMYKTabAllCMYKButton) { 
                preferredSize.height = 30;
              } // END button _singleViewTabPanelCMYKTabAllCMYKButton
            } // END group _singleViewTabPanelCMYKTabAllCMYKGroup
            var _singleViewTabPanelDocCMYKProfileGroup = add("group");
            with(_singleViewTabPanelDocCMYKProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelDocCMYKProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelDocCMYKProfileLabel));
              with(_singleViewTabPanelDocCMYKProfileLabel) {
              } // END statictext _singleViewTabPanelDocCMYKProfileLabel
              var _singleViewTabPanelDocCMYKProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelDocCMYKProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelDocCMYKProfileNumber
              var _singleViewTabPanelDocCMYKProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelDocCMYKProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelDocCMYKProfileButton
            } // END group _singleViewTabPanelDocCMYKProfileGroup         
            var _singleViewTabPanelDiffCMYKProfileGroup = add("group");
            with(_singleViewTabPanelDiffCMYKProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelDiffCMYKProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelDiffCMYKProfileLabel));
              with(_singleViewTabPanelDiffCMYKProfileLabel) {   
              } // END statictext _singleViewTabPanelDiffCMYKProfileLabel
              var _singleViewTabPanelDiffCMYKProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelDiffCMYKProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelDiffCMYKProfileNumber
              var _singleViewTabPanelDiffCMYKProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelDiffCMYKProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelDiffCMYKProfileButton
            } // END group _singleViewTabPanelDiffCMYKProfileGroup
            var _singleViewTabPanelNoneCMYKProfileGroup = add("group");
            with(_singleViewTabPanelNoneCMYKProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelNoneCMYKProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelNoneCMYKProfileLabel));
              with(_singleViewTabPanelNoneCMYKProfileLabel) {
              } // END statictext _singleViewTabPanelNoneCMYKProfileLabel
              var _singleViewTabPanelNoneCMYKProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelNoneCMYKProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelNoneCMYKProfileNumber
              var _singleViewTabPanelNoneCMYKProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelNoneCMYKProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelNoneCMYKProfileButton
            } // END group _singleViewTabPanelNoneCMYKProfileGroup          
            var _singleViewTabPanelAssignedCMYKProfileGroup = add("group");
            with(_singleViewTabPanelAssignedCMYKProfileGroup) {
              spacing = 5;
              margins.top = 20;
              var _singleViewTabPanelAssignedCMYKProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelAssignedCMYKProfileLabel));
              with(_singleViewTabPanelAssignedCMYKProfileLabel) {
              } // END statictext _singleViewTabPanelFaultyLabel
              var _singleViewTabPanelAssignedCMYKProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelAssignedCMYKProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelAssignedCMYKProfileNumber
              var _singleViewTabPanelAssignedCMYKProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelAssignedCMYKProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelAssignedCMYKProfileButton
            } // END group _singleViewTabPanelAssignedCMYKProfileGroup
          } // END tab _singleViewTabPanelCMYKTab
        
          var _singleViewTabPanelGreyTab = add("tab", undefined,localize(_global.singleViewGreyTabLabel));
          with(_singleViewTabPanelGreyTab) {
            alignChildren = "right";
            margins = [5,20,20,5];
            spacing = 0;
            var _singleViewTabPanelGreyTabAllGreyGroup = add("group");
            with(_singleViewTabPanelGreyTabAllGreyGroup) {
              margins.bottom = 20;
              spacing = 3;
              var _singleViewTabPanelGreyTabAllGreyLabel = add("statictext",undefined,localize(_global.singleViewTabPanelGreyTabAllGreyLabel));
              with(_singleViewTabPanelGreyTabAllGreyLabel) {
              } // END statictext _singleViewTabPanelGreyTabAllGreyLabel
              var _singleViewTabPanelGreyTabAllGreyNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelGreyTabAllGreyNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelGreyTabAllGreyNumber
              var _singleViewTabPanelGreyTabAllGreyButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelGreyTabAllGreyButton) { 
                preferredSize.height = 30;
              } // END button _singleViewTabPanelGreyTabAllGreyButton
            } // END group _singleViewTabPanelGreyTabAllGreyGroup
            var _singleViewTabPanelDiffGreyProfileGroup = add("group");
            with(_singleViewTabPanelDiffGreyProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelDiffGreyProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelDiffGreyProfileLabel));
              with(_singleViewTabPanelDiffGreyProfileLabel) {   
              } // END statictext _singleViewTabPanelDiffGreyProfileLabel
              var _singleViewTabPanelDiffGreyProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelDiffGreyProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelDiffGreyProfileNumber
              var _singleViewTabPanelDiffGreyProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelDiffGreyProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelDiffGreyProfileButton
            } // END group _singleViewTabPanelDiffGreyProfileGroup
            var _singleViewTabPanelNoneGreyProfileGroup = add("group");
            with(_singleViewTabPanelNoneGreyProfileGroup) {
              spacing = 5;
              var _singleViewTabPanelNoneGreyProfileLabel = add("statictext",undefined,localize(_global.singleViewTabPanelNoneGreyProfileLabel));
              with(_singleViewTabPanelNoneGreyProfileLabel) {
              } // END statictext _singleViewTabPanelNoneGreyProfileLabel
              var _singleViewTabPanelNoneGreyProfileNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelNoneGreyProfileNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelNoneGreyProfileNumber
              var _singleViewTabPanelNoneGreyProfileButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelNoneGreyProfileButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelNoneGreyProfileButton
            } // END group _singleViewTabPanelNoneGreyProfileGroup 
          } // END tab _singleViewTabPanelGreyTab
          
          var _singleViewTabPanelGraphicsTab = add("tab",undefined,localize(_global.singleViewGraphicsTabLabel));
          with(_singleViewTabPanelGraphicsTab) {
            alignChildren = "right";
            margins = [5,20,20,5];
            spacing = 0;
            var _singleViewTabPanelGraphicsTabAllGraphicsGroup = add("group");
            with(_singleViewTabPanelGraphicsTabAllGraphicsGroup) {
              margins.bottom = 20;
              spacing = 3;
              var _singleViewTabPanelGraphicsTabAllGraphicsLabel = add("statictext",undefined,localize(_global.singleViewTabPanelGraphicsTabAllGraphicsLabel));
              with(_singleViewTabPanelGraphicsTabAllGraphicsLabel) {
              } // END statictext _singleViewTabPanelGraphicsTabAllGraphicsLabel
              var _singleViewTabPanelGraphicsTabAllGraphicsNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelGraphicsTabAllGraphicsNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelGraphicsTabAllGraphicsNumber
              var _singleViewTabPanelGraphicsTabAllGraphicsButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelGraphicsTabAllGraphicsButton) { 
                preferredSize.height = 30;
              } // END button _singleViewTabPanelGraphicsTabAllGraphicsButton
            } // END group _singleViewTabPanelGraphicsTabAllGraphicsGroup
            var _singleViewTabPanelPDFAIGroup = add("group");
            with(_singleViewTabPanelPDFAIGroup) {
              spacing = 5;
              var _singleViewTabPanelPDFAILabel = add("statictext",undefined,localize(_global.singleViewTabPanelPDFAILabel));
              with(_singleViewTabPanelPDFAILabel) {
              } // END statictext _singleViewTabPanelPDFAILabel
              var _singleViewTabPanelPDFAINumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelPDFAINumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelPDFAINumber
              var _singleViewTabPanelPDFAIButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelPDFAIButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelPDFAIButton
            } // END group _singleViewTabPanelPDFAIGroup         
            var _singleViewTabPanelINDDGroup = add("group");
            with(_singleViewTabPanelINDDGroup) {
              spacing = 5;
              var _singleViewTabPanelINDDLabel = add("statictext",undefined,localize(_global.singleViewTabPanelINDDLabel));
              with(_singleViewTabPanelINDDLabel) {   
              } // END statictext _singleViewTabPanelINDDLabel
              var _singleViewTabPanelINDDNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelINDDNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelINDDNumber
              var _singleViewTabPanelINDDButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelINDDButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelINDDButton
            } // END group _singleViewTabPanelINDDGroup
            var _singleViewTabPanelEPSGroup = add("group");
            with(_singleViewTabPanelEPSGroup) {
              spacing = 5;
              var _singleViewTabPanelEPSLabel = add("statictext",undefined,localize(_global.singleViewTabPanelEPSLabel));
              with(_singleViewTabPanelEPSLabel) {
              } // END statictext _singleViewTabPanelEPSLabel
              var _singleViewTabPanelEPSNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelEPSNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelEPSNumber
              var _singleViewTabPanelEPSButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelEPSButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelEPSButton
            } // END group _singleViewTabPanelEPSGroup 
            var _singleViewTabPanelFaultyGroup = add("group");
            with(_singleViewTabPanelFaultyGroup) {
              spacing = 5;
              margins.top = 20;
              var _singleViewTabPanelFaultyLabel = add("statictext",undefined,localize(_global.singleViewTabPanelFaultyLabel));
              with(_singleViewTabPanelFaultyLabel) {
              } // END statictext _singleViewTabPanelFaultyLabel
              var _singleViewTabPanelFaultyNumber = add("statictext",undefined,"0");
              with(_singleViewTabPanelFaultyNumber) {
                characters = 3;
              } // END statictext _singleViewTabPanelFaultyNumber
              var _singleViewTabPanelFaultyButton = add("button",undefined,localize(_global.show));
              with(_singleViewTabPanelFaultyButton) {
                preferredSize.height = 24;
              } // END button _singleViewTabPanelFaultyButton
            } // END group _singleViewTabPanelFaultyGroup
          } // END tab _singleViewTabPanelGraphicsTab
        } // END tabbedpanel _checkTabSingleViewTabPanel
      } // END tab _checkTab
      
      // Korrektur-Tab
      var _correctTab = add("tab",undefined,localize(_global.correct));
      with(_correctTab) {
        alignChildren = "fill";
        spacing = 18;
        margins = [15,10,5,5];
        var _docNameCorrectTab = add("statictext",undefined,"");
        with(_docNameCorrectTab) {
          characters = 40;
          justify = "center";
        } // END statictext _docNameCorrectTab
        var _imageColorSettingsPanel = add("panel", undefined,localize(_global.imageColorSettingsPanelHead));
        with(_imageColorSettingsPanel) {
          alignChildren = ["fill", "fill"];
          margins.top = 26;
          margins.bottom = 20;
          margins.left = 18;
          spacing = 10;
          helpTip = localize(_global.imageColorSettingsHT);
          var _imageColorSettingsProfilGroup = add("group");
          with(_imageColorSettingsProfilGroup) {
            alignChildren = ["left","fill"];
            orientation = "column";
            spacing = 4;
            var _imageColorSettingsProfilLabel = add("statictext",undefined,localize(_global.imageColorSettingsProfilLabel));
            with(_imageColorSettingsProfilLabel) {
            } // END statictext _imageColorSettingsProfilLabel 
            var _imageColorSettingsProfil = add("statictext",undefined,"");
            with(_imageColorSettingsProfil) {
              characters = 36;
            } // END statictext _imageColorSettingsProfil  
            var _imageColorSettingsProfilAdd = add("statictext",undefined,"");
            with(_imageColorSettingsProfilAdd) {
              characters = 48;
            } // END statictext _imageColorSettingsProfilAdd
          } // END group _imageColorSettingsProfilGroup
          var _imageColorSettingsRenderGroup = add("group");
          with(_imageColorSettingsRenderGroup) {
            alignChildren = ["left","fill"];
            orientation = "column";
            spacing = 4;
            var _imageColorSettingsRenderLabel = add("statictext",undefined,localize(_global.imageColorSettingsRenderLabel));
            with(_imageColorSettingsRenderLabel) {
            } // END statictext _imageColorSettingsRenderLabel
            var _imageColorSettingsRender = add("statictext",undefined,"");
            with(_imageColorSettingsRender) {
              characters = 36;
            } // END statictext _imageColorSettingsRender
          } // END group _imageColorSettingsRenderGroup  
          var _imageColorSettingsButtonGroup = add("group");
          with(_imageColorSettingsButtonGroup) {
           margins.top = 10;
           var _imageColorSettingsChangeButton = add("button",undefined,localize(_global.changeColorSettingsOfSelectedImgae));
           with(_imageColorSettingsChangeButton) {
             preferredSize.height = 26;         
           } // END button _imageColorSettingsChangeButton 
          } // END group _imageColorSettingsButtonGroup
        } // END panel _imageColorSettingsPanel
        var _vectorPoliciesChangePanel = add("panel", undefined,localize(_global.vectorPoliciesChangePanelHead)); 
        with(_vectorPoliciesChangePanel) {
          alignChildren = ["fill", "fill"];
          margins.top = 26;
          margins.bottom = 20;
          margins.right = 0;
          margins.left = 18;
          spacing = 7;
          visible = false;
          helpTip = localize(_global.vectorPoliciesChangePanelHT);    
          var _rgbVectorPoliciesGroup = add("group");
          with(_rgbVectorPoliciesGroup) {
            alignChildren = ["left","fill"];
            orientation = "row";
            spacing = 4;     
            var _rgbVectorPolicyLabel = add("statictext",undefined,localize(_global.rgbVectorPolicyLabel));
            with(_rgbVectorPolicyLabel) {
            } // END statictext _rgbVectorPolicyLabel
            var _rgbVectorPolicy = add("statictext",undefined,"");
            with(_rgbVectorPolicy) {
              characters = "26"
            } // END statictext _rgbVectorPolicy
          } // END group _rgbVectorPoliciesGroup             
          var _cmykVectorPoliciesGroup = add("group");
          with(_cmykVectorPoliciesGroup) {
            alignChildren = ["left","fill"];
            orientation = "row";
            spacing = 4;  
            var _cmykVectorPolicyLabel = add("statictext",undefined,localize(_global.cmykVectorPolicyLabel));
            with(_cmykVectorPolicyLabel) {
            } // END statictext _cmykVectorPolicyLabel
            var _cmykVectorPolicy = add("statictext",undefined,"");
            with(_cmykVectorPolicy) {
              characters = "26"
            } // END statictext _cmykVectorPolicy  
          } // END group _cmykVectorPoliciesGroup         
          var _grayVectorPoliciesGroup = add("group");
          with(_grayVectorPoliciesGroup) {
            alignChildren = ["left","fill"];
            orientation = "row";
            spacing = 4;  
            var _grayVectorPolicyLabel = add("statictext",undefined,localize(_global.grayVectorPolicyLabel));
            with(_grayVectorPolicyLabel) {
            } // END statictext _grayVectorPolicyLabel
            var _grayVectorPolicy = add("statictext",undefined,"");
            with(_grayVectorPolicy) {
              characters = "26"
            } // END statictext _grayVectorPolicy  
          } // END group _grayVectorPoliciesGroup          
          var _vectorPoliciesChangeButtonGroup = add("group");
          with(_vectorPoliciesChangeButtonGroup) {
           margins.top = 10;
           var _vectorPoliciesChangeButton = add("button",undefined,localize(_global.vectorPoliciesChangeButton));
           with(_vectorPoliciesChangeButton) {
             preferredSize.height = 26;         
           } // END button _vectorPoliciesChangeButton 
          } // END group _vectorPoliciesChangeButtonGroup  
        } // END panel _vectorPoliciesChangePanel
        var _moreOptionsCheckbox = add("checkbox",undefined,localize(_global.moreOptions));
        with(_moreOptionsCheckbox) {  
        } // END checkbox _moreOptionsCheckbox 
      } // END tab _correctTab
    } // END tabbedpanel _tabPanel

    var _bottomButtonGroup = add("group");
    with (_bottomButtonGroup) {
      margins = [10,15,10,0];
      alignment = ["fill","fill"];   
      // Icon _refreshUIButton
			var _refreshUIButton = add("button",undefined, localize(_global.refreshUIButtonLabel));
			with(_refreshUIButton) {
				alignment = ["left","bottom"];
				helpTip = localize(_global.refresh);
			}
      var _closeButtonGroup = add("group");
      with(_closeButtonGroup){
        alignment = ["right","bottom"];
        margins = [0,0,0,0];
        var _closeUIButton = add("button", undefined, localize(_global.cancelButtonLabel));
      } // END group _closeButtonGroup
    } // END group _bottomButtonGroup  
  } // END window _ui
  

  // Globale Variablen fur Beschriftung der Tabs zuweisen
  _global.uiLabels = {};
  _global.docNameAdjustTab = _docNameAdjustTab;
  _global.docNameUpdateTab = _docNameUpdateTab;
  _global.docNameCheckTab = _docNameCheckTab;
  _global.docNameCorrectTab = _docNameCorrectTab;
  
  _global.uiLabels.proofLabel = _proofLabel;
  _global.uiLabels.proofProfile = _proofProfile; 
  _global.uiLabels.transBlendSpace = _transBlendSpace; 
  _global.uiLabels.workingSpacesRGBDropdown = _workingSpacesRGBDropdown;
  _global.uiLabels.workingSpacesCMYKDropdown = _workingSpacesCMYKDropdown; 
  _global.uiLabels.colorManagementPoliciesRGBDropdown = _colorManagementPoliciesRGBDropdown;
  _global.uiLabels.colorManagementPoliciesCMYKDropdown = _colorManagementPoliciesCMYKDropdown;
  _global.uiLabels.engine = _engine;
  _global.uiLabels.intent = _intent;
  _global.uiLabels.useBlackPointCompensation = _useBlackPointCompensation;
  _global.uiLabels.refreshUIButton = _refreshUIButton;
  _global.uiLabels.checkTabOverviewPanelAllLinkNumber = _checkTabOverviewPanelAllLinkNumber;
  _global.uiLabels.checkTabOverviewPanelAllImagesNumber = _checkTabOverviewPanelAllImagesNumber; 
  _global.uiLabels.checkTabOverviewPanelAllGraphicsNumber = _checkTabOverviewPanelAllGraphicsNumber;
  
  _global.uiLabels.singleViewTabPanelRGBTabAllRGBNumber = _singleViewTabPanelRGBTabAllRGBNumber; 
  _global.uiLabels.singleViewTabPanelDocRGBProfileNumber = _singleViewTabPanelDocRGBProfileNumber; 
  _global.uiLabels.singleViewTabPanelDiffRGBProfileNumber = _singleViewTabPanelDiffRGBProfileNumber; 
  _global.uiLabels.singleViewTabPanelNoneRGBProfileNumber = _singleViewTabPanelNoneRGBProfileNumber;
  _global.uiLabels.singleViewTabPanelAssignedRGBProfileNumber = _singleViewTabPanelAssignedRGBProfileNumber; 
  _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton = _singleViewTabPanelAssignedRGBProfileButton;
  _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKNumber = _singleViewTabPanelCMYKTabAllCMYKNumber; 
  _global.uiLabels.singleViewTabPanelDocCMYKProfileNumber = _singleViewTabPanelDocCMYKProfileNumber; 
  _global.uiLabels.singleViewTabPanelDiffCMYKProfileNumber = _singleViewTabPanelDiffCMYKProfileNumber; 
  _global.uiLabels.singleViewTabPanelNoneCMYKProfileNumber = _singleViewTabPanelNoneCMYKProfileNumber;
  _global.uiLabels.singleViewTabPanelAssignedCMYKProfileNumber = _singleViewTabPanelAssignedCMYKProfileNumber; 
  _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton = _singleViewTabPanelAssignedCMYKProfileButton; 
  _global.uiLabels.singleViewTabPanelGreyTabAllGreyNumber = _singleViewTabPanelGreyTabAllGreyNumber; 
  _global.uiLabels.singleViewTabPanelDiffGreyProfileNumber = _singleViewTabPanelDiffGreyProfileNumber; 
  _global.uiLabels.singleViewTabPanelNoneGreyProfileNumber = _singleViewTabPanelNoneGreyProfileNumber;  
  _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsNumber = _singleViewTabPanelGraphicsTabAllGraphicsNumber; 
  _global.uiLabels.singleViewTabPanelPDFAINumber = _singleViewTabPanelPDFAINumber; 
  _global.uiLabels.singleViewTabPanelINDDNumber = _singleViewTabPanelINDDNumber; 
  _global.uiLabels.singleViewTabPanelEPSNumber = _singleViewTabPanelEPSNumber;
  _global.uiLabels.singleViewTabPanelFaultyNumber = _singleViewTabPanelFaultyNumber; 
  _global.uiLabels.singleViewTabPanelRGBTabAllRGBButton = _singleViewTabPanelRGBTabAllRGBButton; 
  _global.uiLabels.singleViewTabPanelDocRGBProfileButton = _singleViewTabPanelDocRGBProfileButton; 
  _global.uiLabels.singleViewTabPanelDiffRGBProfileButton = _singleViewTabPanelDiffRGBProfileButton; 
  _global.uiLabels.singleViewTabPanelNoneRGBProfileButton = _singleViewTabPanelNoneRGBProfileButton; 
  _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKButton = _singleViewTabPanelCMYKTabAllCMYKButton; 
  _global.uiLabels.singleViewTabPanelDocCMYKProfileButton = _singleViewTabPanelDocCMYKProfileButton;
  _global.uiLabels.singleViewTabPanelDiffCMYKProfileButton = _singleViewTabPanelDiffCMYKProfileButton; 
  _global.uiLabels.singleViewTabPanelNoneCMYKProfileButton = _singleViewTabPanelNoneCMYKProfileButton; 
  _global.uiLabels.singleViewTabPanelGreyTabAllGreyButton = _singleViewTabPanelGreyTabAllGreyButton; 
  _global.uiLabels.singleViewTabPanelDiffGreyProfileButton = _singleViewTabPanelDiffGreyProfileButton; 
  _global.uiLabels.singleViewTabPanelNoneGreyProfileButton = _singleViewTabPanelNoneGreyProfileButton;
  _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsButton = _singleViewTabPanelGraphicsTabAllGraphicsButton; 
  _global.uiLabels.singleViewTabPanelPDFAIButton = _singleViewTabPanelPDFAIButton; 
  _global.uiLabels.singleViewTabPanelINDDButton = _singleViewTabPanelINDDButton; 
  _global.uiLabels.singleViewTabPanelEPSButton = _singleViewTabPanelEPSButton;  
  _global.uiLabels.singleViewTabPanelFaultyButton = _singleViewTabPanelFaultyButton;
  
  _global.uiLabels.imageColorSettingsProfil = _imageColorSettingsProfil; 
  _global.uiLabels.imageColorSettingsProfilAdd = _imageColorSettingsProfilAdd;
  _global.uiLabels.imageColorSettingsRender = _imageColorSettingsRender;
  
  _global.uiLabels.rgbVectorPolicy = _rgbVectorPolicy;
  _global.uiLabels.cmykVectorPolicy = _cmykVectorPolicy;
  _global.uiLabels.grayVectorPolicy = _grayVectorPolicy;

  _global.checkmark = _checkmark;
  _global.checkmarkPlaceImagesAgainVisible = false;
  _global.checkmarkChangePoliciesVisible = false;
  _global.placeImagesAgainCheckbox = _placeImagesAgainCheckbox;
  
  _global.info = _info;
  
  _global.formatCheckImages = _formatCheckImages; 
  _global.formatCheckPDF = _formatCheckPDF; 
  _global.formatCheckINDD = _formatCheckINDD; 
  _global.formatCheckEPS = _formatCheckEPS;
  
  _global.moreOptionsCheckbox = _moreOptionsCheckbox;
  
  __setLabels();
  _tabPanel.selection = _adjustTab; // 1) _adjustTab  2) _updateTab  3) _checkTab  4) _correctTab
  

  // Callbacks
  
  _workingSpacesRGBDropdown.onChange = function() {
    
    if(app.documents.length == 0 || _global == null || _global.onClickRefreshUI /* Nicht bei Aktualisierung der Anzeige! */) { return; } 
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    try {
      app.activeDocument.rgbProfile = _global.uiLabels.workingSpacesRGBDropdown.selection.text;
    } catch (e) { app.activeDocument.rgbProfile = ""; }
    _global.checkmark.visible = false;
    _global.checkmarkPlaceImagesAgainVisible = false;
    _global.checkmarkChangePoliciesVisible = false;
  }
  
  
  _workingSpacesCMYKDropdown.onChange = function() {
    
    if(app.documents.length == 0 || _global == null || _global.onClickRefreshUI /* Nicht bei Aktualisierung der Anzeige! */) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    try {
      app.activeDocument.cmykProfile = _global.uiLabels.workingSpacesCMYKDropdown.selection.text;
    } catch (e) { app.activeDocument.cmykProfile = ""; }
    _global.checkmark.visible = false;
    _global.checkmarkPlaceImagesAgainVisible = false;
    _global.checkmarkChangePoliciesVisible = false;
  }
  
  
  _colorManagementPoliciesRGBDropdown.onChange = function() { 
    
    if(app.documents.length == 0 || _global == null || _global.onClickRefreshUI /* Nicht bei Aktualisierung der Anzeige! */) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    
    switch (_global.uiLabels.colorManagementPoliciesRGBDropdown.selection.index) {
      case 0 :
        app.activeDocument.rgbPolicy = ColorSettingsPolicy.COLOR_POLICY_OFF;
        _global.uiLabels.workingSpacesRGBDropdown.selection = null;
        app.activeDocument.rgbProfile = "";
        break;
      case 1 :
        app.activeDocument.rgbPolicy = ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES;
        break;
      case 2 :
        app.activeDocument.rgbPolicy = ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE;
        break;
      default :    
    }
    _global.checkmark.visible = false;
    _global.checkmarkPlaceImagesAgainVisible = false;
    _global.checkmarkChangePoliciesVisible = false;
  }
    
    
  _colorManagementPoliciesCMYKDropdown.onChange = function() { 
    
    if(app.documents.length == 0 || _global == null || _global.onClickRefreshUI /* Nicht bei Aktualisierung der Anzeige! */) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    
    switch (_global.uiLabels.colorManagementPoliciesCMYKDropdown.selection.index) {
      case 0 :
        app.activeDocument.cmykPolicy = ColorSettingsPolicy.COLOR_POLICY_OFF;
        _global.uiLabels.workingSpacesCMYKDropdown.selection = null;
        app.activeDocument.cmykProfile = "";
        break;
      case 1 :
        app.activeDocument.cmykPolicy = ColorSettingsPolicy.COMBINATION_OF_PRESERVE_AND_SAFE_CMYK;
        break;
      case 2 :
        app.activeDocument.cmykPolicy = ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES;
        break;
      case 3 :
        app.activeDocument.cmykPolicy = ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE;
        break;
      default :   
    }
    _global.checkmark.visible = false;
    _global.checkmarkPlaceImagesAgainVisible = false;
    _global.checkmarkChangePoliciesVisible = false;
  }

  
  _placeGraphicsAgainButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    
    if(_global.placeImagesAgainCheckbox.value == true) {
    
      if(app.scriptPreferences.version >= 6) {
        app.doScript(__placeAllLinksAgain,ScriptLanguage.JAVASCRIPT,[],UndoModes.ENTIRE_SCRIPT,localize(_global.placeAllUndo));
      } else { 
        __placeAllLinksAgain();
      } 
    } else {
      
      if(app.scriptPreferences.version >= 6) {
        app.doScript(__adjustPolicies,ScriptLanguage.JAVASCRIPT,[],UndoModes.ENTIRE_SCRIPT,localize(_global.adaptPolicies));
      } else { 
        __adjustPolicies();
      } 
    } 
    _global.onClickRefreshUI = true;
    __setLabels();
    _global.onClickRefreshUI = false;
  }
  
  
  _placeImagesAgainCheckbox.onClick = function() {
    
    if(_placeImagesAgainCheckbox.value == false) {
      
      _placeGraphicsAgainButton.helpTip = localize(_global.adaptPoliciesHT);
      
      _placeGraphicsAgainPanel.text = localize(_global.adaptPolicies);
      _placeGraphicsAgainActionText.text = localize(_global.adaptPoliciesActionDescription);
      _placeGraphicsAgainButton.text = localize(_global.adaptPolicies);
      
      _formatCheckImages.value = false;
      _formatCheckPDF.value = false;
      _formatCheckINDD.value = false;
      _formatCheckEPS.value = false;
      
      _placeGraphicsAgainDescriptionTextPara2.visible = false;
      _formatCheckImages.visible = false; 
      _formatCheckPDF.visible = false; 
      _formatCheckINDD.visible = false; 
      _formatCheckEPS.visible = false; 
      
      if(_global.checkmarkChangePoliciesVisible == true) {
        _global.checkmark.visible = true; 
      } else {
        _global.checkmark.visible = false;
      }  
      _global.info.visible = true;
    } else {
      
      _placeGraphicsAgainButton.helpTip = localize(_global.placeGraphicsAgainActionText);
      
      _formatCheckImages.value = false;
      _placeGraphicsAgainPanel.text = localize(_global.placeGraphicsAgain);
      _placeGraphicsAgainActionText.text = localize(_global.placeGraphicsAgainActionText);
      _placeGraphicsAgainButton.text = localize(_global.placeGraphicsAgain);
      
      _formatCheckImages.value = true;
      
      _placeGraphicsAgainDescriptionTextPara2.visible = true;
      _formatCheckImages.visible = true; 
      _formatCheckPDF.visible = true; 
      _formatCheckINDD.visible = true; 
      _formatCheckEPS.visible = true; 
      
      if(_global.checkmarkPlaceImagesAgainVisible == true) {
        _global.checkmark.visible = true; 
      } else {
        _global.checkmark.visible = false;
      } 
      _global.info.visible = false;
    }
  }  
  
  
  _singleViewTabPanelRGBTabAllRGBButton.onClick = function() { 
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allRGBImagesCounter = __showObject(_global.allRGBImages,_global.allRGBImagesCounter);
    _global.uiLabels.singleViewTabPanelRGBTabAllRGBButton.text = _global.allRGBImagesCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelDocRGBProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allRGBImagesSameProfileCounter = __showObject(_global.allRGBImagesSameProfile,_global.allRGBImagesSameProfileCounter);
    _global.uiLabels.singleViewTabPanelDocRGBProfileButton.text = _global.allRGBImagesSameProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelDiffRGBProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allRGBImagesDifferentProfileCounter = __showObject(_global.allRGBImagesDifferentProfile,_global.allRGBImagesDifferentProfileCounter);
    _global.uiLabels.singleViewTabPanelDiffRGBProfileButton.text = _global.allRGBImagesDifferentProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelNoneRGBProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allRGBImagesNoneProfileCounter = __showObject(_global.allRGBImagesNoneProfile,_global.allRGBImagesNoneProfileCounter);
    _global.uiLabels.singleViewTabPanelNoneRGBProfileButton.text = _global.allRGBImagesNoneProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton.onClick = function() { 
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allRGBImagesAssignedProfileCounter = __showObject(_global.allRGBImagesAssignedProfile,_global.allRGBImagesAssignedProfileCounter);
    _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton.text = _global.allRGBImagesAssignedProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelCMYKTabAllCMYKButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allCMYKImagesCounter = __showObject(_global.allCMYKImages,_global.allCMYKImagesCounter);
    _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKButton.text = _global.allCMYKImagesCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelDocCMYKProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allCMYKImagesSameProfileCounter = __showObject(_global.allCMYKImagesSameProfile,_global.allCMYKImagesSameProfileCounter);
    _global.uiLabels.singleViewTabPanelDocCMYKProfileButton.text = _global.allCMYKImagesSameProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelDiffCMYKProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allCMYKImagesDifferentProfileCounter = __showObject(_global.allCMYKImagesDifferentProfile,_global.allCMYKImagesDifferentProfileCounter);
    _global.uiLabels.singleViewTabPanelDiffCMYKProfileButton.text = _global.allCMYKImagesDifferentProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelNoneCMYKProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allCMYKImagesNoneProfileCounter = __showObject(_global.allCMYKImagesNoneProfile,_global.allCMYKImagesNoneProfileCounter);
    _global.uiLabels.singleViewTabPanelNoneCMYKProfileButton.text = _global.allCMYKImagesNoneProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton.onClick = function() { 
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allCMYKImagesAssignedProfileCounter = __showObject(_global.allCMYKImagesAssignedProfile,_global.allCMYKImagesAssignedProfileCounter);
    _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton.text = _global.allCMYKImagesAssignedProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelGreyTabAllGreyButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allGreyImagesCounter = __showObject(_global.allGreyImages,_global.allGreyImagesCounter);
    _global.uiLabels.singleViewTabPanelGreyTabAllGreyButton.text = _global.allGreyImagesCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelDiffGreyProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allGreyImagesDifferentProfileCounter = __showObject(_global.allGreyImagesDifferentProfile,_global.allGreyImagesDifferentProfileCounter);
    _global.uiLabels.singleViewTabPanelDiffGreyProfileButton.text = _global.allGreyImagesDifferentProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelNoneGreyProfileButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allGreyImagesNoneProfileCounter = __showObject(_global.allGreyImagesNoneProfile,_global.allGreyImagesNoneProfileCounter);
    _global.uiLabels.singleViewTabPanelNoneGreyProfileButton.text = _global.allGreyImagesNoneProfileCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelGraphicsTabAllGraphicsButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allGraphicsCounter = __showObject(_global.allGraphics,_global.allGraphicsCounter);
    _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsButton.text = _global.allGraphicsCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelPDFAIButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allPDFCounter = __showObject(_global.allPDF,_global.allPDFCounter);
    _global.uiLabels.singleViewTabPanelPDFAIButton.text = _global.allPDFCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelINDDButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allImportedPagesCounter = __showObject(_global.allImportedPages,_global.allImportedPagesCounter);
    _global.uiLabels.singleViewTabPanelINDDButton.text = _global.allImportedPagesCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  } 

  _singleViewTabPanelEPSButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allEPSCounter = __showObject(_global.allEPS,_global.allEPSCounter);
    _global.uiLabels.singleViewTabPanelEPSButton.text = _global.allEPSCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _singleViewTabPanelFaultyButton.onClick = function() {
    if(app.documents.length == 0 || _global == null) { return; }
    if(_global.curDoc != app.activeDocument) { alert(localize(_global.pleaseRefreshDisplay)); return; }
    _global.allFaultyImagesCounter = __showObject(_global.allFaultyImages,_global.allFaultyImagesCounter);
    _global.uiLabels.singleViewTabPanelFaultyButton.text = _global.allFaultyImagesCounter;
    __setColorSettingOfSeletedImg();
    __setVectorPoliciesOfSelectedGraphic();
  }

  _imageColorSettingsChangeButton.onClick = function() {
    
    if(app.documents.length > 0 && app.selection.length == 1) {
    
      var _selection = app.selection[0];
      
      if((_selection instanceof Rectangle || _selection instanceof Oval || _selection instanceof Polygon) && 
          _selection.contentType == ContentType.GRAPHIC_TYPE && _selection.images.length == 1 &&
          _selection.movies.length == 0 && _selection.movies.length == 0 && _selection.sounds.length == 0 &&
          (_selection.graphics[0].space == "RGB" || _selection.graphics[0].space == "CMYK")) { 
        
        _changeColorSettingAndRefreshLabels();
      } else if (_selection instanceof Image && (_selection.space == "RGB" || _selection.space == "CMYK")) { 
        _changeColorSettingAndRefreshLabels();
      } else {
          alert(localize(_global.onlyForRGBAndCMYKImages));
      }
    }
  
    function _changeColorSettingAndRefreshLabels() {
      try { app.scriptMenuActions.itemByID(32259).invoke(); } catch(e) { alert("Something went wrong!" + "\r\r" + e);}
    }
  }


  _vectorPoliciesChangeButton.onClick = function() {

    if(app.documents.length == 0 || _global == null) { return; }  
    
    if(app.selection.length == 1) {
        
      var _selection = app.selection[0];
        
      if((_selection instanceof Rectangle || _selection instanceof Oval || _selection instanceof Polygon) && 
          _selection.contentType == ContentType.GRAPHIC_TYPE && (_selection.epss.length == 1 || _selection.pdfs.length == 1) &&
          _selection.movies.length == 0 && _selection.movies.length == 0 && _selection.sounds.length == 0 && _selection.images.length == 0) { 
           
        __changeVectorPoliciesOfSelectedGraphic(_selection);
      } else if (_selection instanceof PDF || _selection instanceof EPS) {
        __changeVectorPoliciesOfSelectedGraphic(_selection.parent);
      } else {
        alert(localize(_global.onlyForPDFandEPS));
      }
    } 
  }

  _info.onClick = function() {
    alert(localize(_global.adaptPoliciesInfo));
  }
  
  _moreOptionsCheckbox.onClick = function() {
    
    if(_global.moreOptionsCheckbox.value == true) {    
      _vectorPoliciesChangePanel.visible = true;
    } else {    
      _vectorPoliciesChangePanel.visible = false;
    }    
  }

  
  _refreshUIButton.onClick = function() {  
    
    if(app.documents.length == 0 || _global == null) { return; } 
    
    if(_global.curDoc != app.activeDocument) {
      _global.checkmark.visible = false;
      _global.checkmarkPlaceImagesAgainVisible = false;
      _global.checkmarkChangePoliciesVisible = false;
    }
  
    _global.onClickRefreshUI = true;
    __setLabels();
    _global.onClickRefreshUI = false;  
  }
  
  
  _closeUIButton.onClick = function() { 
    _ui.close(2); 
  }
  
  
  _ui.onClose = function() {
    if(app.documents.length > 0) {
      _removeEventListenerFromAllDocs();
    }
    _global = null;
  }
  
  // END Callbacks
  
  _ui.show();
  
  return;
} // END function __showUI


// Aktuellen Werte in User-Interface einsetzen
function __setLabels() {
  
  if(app.documents.length == 0 || _global == null) { return; }
  
  _global.curDoc = app.activeDocument;
  
  __setProofLabelAndProfile();
  __setDocName();  
  
  // 1. Tab
  __setWorkingSpacesRGBDropdown();
  __setWorkingSpacesCMYKDropdown(); 
  __setColorManagementPoliciesRGBDropdown();
  __setColorManagementPoliciesCMYKDropdown();
  __setConversionOptions();
  
  // 3. Tab
  __getLinksAndCheckProfiles();
  
  // 4. Tab
  __setColorSettingOfSeletedImg();
  __setVectorPoliciesOfSelectedGraphic();
  
  __setBlendingSpace();
  __addEventListenerAfterSelectionChanged();
}


// User Interface Beschriftung
function __setProofLabelAndProfile() { 
  try {
    if(app.activeWindow.proofingType == ProofingType.PROOF_OFF) {
      _global.uiLabels.proofLabel.text = "Proof: OFF";
      _global.uiLabels.proofProfile.text = app.activeWindow.proofingProfile;
    } else {
      _global.uiLabels.proofLabel.text = "Proof: ON";
      _global.uiLabels.proofProfile.text = app.activeWindow.proofingProfile;
    } 
  } catch (e) { alert(localize(_global.activeTextModus)); }
} // END function __setProofLabelAndProfile


// Documentname im Header der Tabs
function __setDocName() {
  _global.docNameAdjustTab.text = app.activeDocument.name;
  _global.docNameUpdateTab.text = app.activeDocument.name;
  _global.docNameCheckTab.text = app.activeDocument.name;
  _global.docNameCorrectTab.text = app.activeDocument.name;
} // END function _setDocName



// RGB-Arbeitsfarbraum des Dokuments anzeigen
function __setWorkingSpacesRGBDropdown() {
  
  if(_global.uiLabels.workingSpacesRGBDropdown.items[1].type == "separator") {
    for(var i=1;i>=0;i--) {
      _global.uiLabels.workingSpacesRGBDropdown.remove(_global.uiLabels.workingSpacesRGBDropdown.items[i]); 
    }
  }
  _global.uiLabels.workingSpacesRGBDropdown.add("item",app.activeDocument.rgbProfile,0);
  _global.uiLabels.workingSpacesRGBDropdown.add("separator", undefined, 1);
  _global.uiLabels.workingSpacesRGBDropdown.selection = 0;
} // END function __setWorkingSpacesRGBDropdown



// CMYK-Arbeitsfarbraum des Dokuments anzeigen
function __setWorkingSpacesCMYKDropdown() {
  
  if(_global.uiLabels.workingSpacesCMYKDropdown.items[1].type == "separator") {
    for(var i=1;i>=0;i--) {
      _global.uiLabels.workingSpacesCMYKDropdown.remove(_global.uiLabels.workingSpacesCMYKDropdown.items[i]);
    }
  }
  
  _global.uiLabels.workingSpacesCMYKDropdown.add("item",app.activeDocument.cmykProfile,0);
  _global.uiLabels.workingSpacesCMYKDropdown.add("separator", undefined, 1);
  _global.uiLabels.workingSpacesCMYKDropdown.selection = 0;
} // END function __setWorkingSpacesCMYKDropdown



// RGB-Farbmanagement-Richtlinien des Dokuments anzeigen
function __setColorManagementPoliciesRGBDropdown() {
  
  var _docRGBColorManagementPolicy = app.activeDocument.rgbPolicy;
  
  switch(_docRGBColorManagementPolicy) {
    case ColorSettingsPolicy.COLOR_POLICY_OFF :
      _global.uiLabels.colorManagementPoliciesRGBDropdown.selection = 0;
      break;
    case ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES :
      _global.uiLabels.colorManagementPoliciesRGBDropdown.selection = 1;
      break;
    case ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE :
      _global.uiLabels.colorManagementPoliciesRGBDropdown.selection = 2;
      break;
    default :
      _global.uiLabels.colorManagementPoliciesRGBDropdown.selection = null;
  }
} // END function __setColorManagementPoliciesRGBDropdown


// CMYK-Farbmanagement-Richtlinien des Dokuments anzeigen
function __setColorManagementPoliciesCMYKDropdown() {

  var _docCMYKColorManagementPolicy = app.activeDocument.cmykPolicy;
  
  switch(_docCMYKColorManagementPolicy) {
    case ColorSettingsPolicy.COLOR_POLICY_OFF :
      _global.uiLabels.colorManagementPoliciesCMYKDropdown.selection = 0;
      break;
    case ColorSettingsPolicy.COMBINATION_OF_PRESERVE_AND_SAFE_CMYK :
      _global.uiLabels.colorManagementPoliciesCMYKDropdown.selection = 1;
      break;  
    case ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES :
      _global.uiLabels.colorManagementPoliciesCMYKDropdown.selection = 2;
      break;
    case ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE :
      _global.uiLabels.colorManagementPoliciesCMYKDropdown.selection = 3;
      break;
    default :
      _global.uiLabels.colorManagementPoliciesRGBDropdown.selection = null;
  }
} // END function __setColorManagementPoliciesCMYKDropdown



// Konvertierungsoptionen des Dokuments anzeigen
function __setConversionOptions() {

	try {
		_global.uiLabels.engine.text = app.colorSettings.engine;		
	} catch(err) {
		/* Fehler »Diese Eigenschaft ist im aktuellen Status nicht zutreffend.« bei deaktiviertem Farbmanagment. */
		_global.uiLabels.engine.text = localize(_global.colorManagementDeactivated);
	}
  
	try {
		switch (app.colorSettings.intent) {
			case DefaultRenderingIntent.PERCEPTUAL :
				_global.uiLabels.intent.text = localize(_global.perceptual);
				break;
			case DefaultRenderingIntent.SATURATION :
				_global.uiLabels.intent.text = localize(_global.saturation);
				break;
			case DefaultRenderingIntent.RELATIVE_COLORIMETRIC :
				_global.uiLabels.intent.text = localize(_global.relativeColorimetric);
				break;
			case DefaultRenderingIntent.ABSOLUTE_COLORIMETRIC : 
				_global.uiLabels.intent.text = localize(_global.absoluteColorimetric);
				break;
			default : 
		}
	} catch(err) {
		/* Fehler »Diese Eigenschaft ist im aktuellen Status nicht zutreffend.« bei deaktiviertem Farbmanagment. */
	}
  
  try {
		if (app.colorSettings.useBPC) {
		    _global.uiLabels.useBlackPointCompensation.text = localize(_global.yes);
		  } else {
		    _global.uiLabels.useBlackPointCompensation.text = localize(_global.no);
		  } 
	} catch (err) {
		/* Fehler »Diese Eigenschaft ist im aktuellen Status nicht zutreffend.« bei deaktiviertem Farbmanagment. */
	}
	
} // END function __setConversionOptions



// Alle Bilder neu platzieren
function __placeAllLinksAgain() {

  if(app.documents.length == 0 || _global == null) { return; }
   
  // User-Einstellung: Bildabmessungen beim erneuten Verknüpfen erhalten
  var _userPreserveBounds = app.imagePreferences.preserveBounds;
  app.imagePreferences.preserveBounds = true;
  
  // User-Einstellungen pdfPlacePreferences
  var _userPDFPageNumber = app.pdfPlacePreferences.pageNumber;
  var _userPDFpdfCrop = app.pdfPlacePreferences.pdfCrop;
  var _userPDFTransparentBackground = app.pdfPlacePreferences.transparentBackground;
  
  // User-Einstellungen pdfPlacePreferences
  var _userImportedPageNumber = app.importedPageAttributes.pageNumber;
  var _userImportedPageCrop = app.importedPageAttributes.importedPageCrop;
  
  var _allLinks = app.activeDocument.links.everyItem().getElements();
  
  var _userEnableRedraw = app.scriptPreferences.enableRedraw;
  app.scriptPreferences.enableRedraw = false;
  
  var l,_count = 0;
  var _graphic,_graphicFrame,_placedGraphic;
	var _curLink;
  var _visibilityOfLayers;
  var _graphicUpdateLinkOption;
  var _faultyGraphics = [];
  
  for(l=0;l<_allLinks.length;l++) {
    
		_curLink = _allLinks[l];
		if(
			!_curLink || 
			!_curLink.isValid || 
			_curLink.needed == undefined ||
			_curLink.edited == undefined
    ) { continue; }
    
    _graphic = _curLink.parent;
    
    if(!(_graphic instanceof EPS) &&
       !(_graphic instanceof Image) &&
       !(_graphic instanceof ImportedPage) &&
       !(_graphic instanceof PDF)
      ) { continue; }
    
    try {
      
      _graphicFrame = _graphic.parent;
      //PDF AI
      if(_graphic instanceof PDF && _global.formatCheckPDF.value == true) {
        
        app.pdfPlacePreferences.pageNumber = _graphic.pdfAttributes.pageNumber;
        app.pdfPlacePreferences.pdfCrop = _graphic.pdfAttributes.pdfCrop;
        app.pdfPlacePreferences.transparentBackground = _graphic.pdfAttributes.transparentBackground;
        
        _visibilityOfLayers = __getVisibilityOfLayers(_graphic) || {};
        _graphicUpdateLinkOption = _graphic.graphicLayerOptions.updateLinkOption;
        
        _placedGraphic = _graphicFrame.place(_allLinks[l].filePath,false)[0];
        
        __setVisibilityOfLayers(_placedGraphic,_visibilityOfLayers,_graphicUpdateLinkOption);
        _visibilityOfLayers = null;
        
        _count += 1;
      
      // INDD
      } else if(_graphic instanceof ImportedPage && _global.formatCheckINDD.value == true) {
        
        app.importedPageAttributes.pageNumber = _graphic.pageNumber;
        app.importedPageAttributes.importedPageCrop = _graphic.importedPageCrop;
        
        _visibilityOfLayers = __getVisibilityOfLayers(_graphic) || {};
        _graphicUpdateLinkOption = _graphic.graphicLayerOptions.updateLinkOption;
        
        _placedGraphic = _graphicFrame.place(_allLinks[l].filePath,false)[0];
        
        __setVisibilityOfLayers(_placedGraphic,_visibilityOfLayers,_graphicUpdateLinkOption);
        _visibilityOfLayers = null;
        
        _count += 1; 
      
      // EPS
      } else if(_graphic instanceof EPS && _global.formatCheckEPS.value == true) {
        
        _graphicFrame.place(_allLinks[l].filePath,false);
        _count += 1;  
      
      // Bilder
      } else if(_graphic instanceof Image && _global.formatCheckImages.value == true) {
        
        _graphicUpdateLinkOption = _graphic.graphicLayerOptions.updateLinkOption;
        _visibilityOfLayers = __getVisibilityOfLayers(_graphic) || {};
        
        _placedGraphic = _graphicFrame.place(_allLinks[l].filePath,false)[0];
        
        __setVisibilityOfLayers(_placedGraphic,_visibilityOfLayers,_graphicUpdateLinkOption);
        _visibilityOfLayers = null;
        
        _count += 1;
      
      } // END if Dateiformat
    } catch(e) {
      try { _faultyGraphics.push(_allLinks[l].name + " ("+ e.message +")"); } 
      catch(e) { _faultyGraphics.push("Name: Unknown" + " ("+ e.message +")"); } 
    }
  } // END for _allLinks
  
  // Zuruecksetzen der Usereinstellungen
  app.imagePreferences.preserveBounds = _userPreserveBounds;
  
  app.pdfPlacePreferences.pageNumber = _userPDFPageNumber;
  app.pdfPlacePreferences.pdfCrop = _userPDFpdfCrop;
  app.pdfPlacePreferences.transparentBackground = _userPDFTransparentBackground;
  
  app.importedPageAttributes.pageNumber = _userImportedPageNumber;
  app.importedPageAttributes.importedPageCrop = _userImportedPageCrop;
  
  app.scriptPreferences.enableRedraw = _userEnableRedraw;
  
  if(_faultyGraphics.length > 0) { alert(localize(_global.couldNotPlace) + "\r\r" + _faultyGraphics.join ("\r\r")); }
  else { alert(_count + " " + localize(_global.allPlaced)); }
  
  _global.checkmark.visible = true; // Hacken als Bestaetigung fuer erfolgreichen Durchfuehrung
  _global.checkmarkPlaceImagesAgainVisible = true;
  _global.checkmarkChangePoliciesVisible = false;
  
  // Ebenensichtbarkeit auslesen
  function __getVisibilityOfLayers(_obj) {
    
    var _currentVisibilityOfLayer = {};
    
    if(!_obj.hasOwnProperty ("graphicLayerOptions") || _obj.graphicLayerOptions.graphicLayers.length == 0) { 
      return; 
    } 
    
    var _layers = _obj.graphicLayerOptions.graphicLayers; 
    _currentVisibility = __getAllLayer (_layers,_currentVisibilityOfLayer)
    
    function __getAllLayer (_layers,_currentVisibilityOfLayer) {
      
      for (var i=0; i<_layers.length; i++) { 
        _currentVisibilityOfLayer[_layers[i].id] = _layers[i].currentVisibility; // Zuordung der Sichtbarkeit zur Layer-ID
        var _moreLayers = _layers[i].graphicLayers;
        __getAllLayer (_moreLayers,_currentVisibilityOfLayer); 
      } 
      return;
    } // END function __getAllLayer  

    return _currentVisibilityOfLayer;
  } // END function _getVisibilityOfLayer

  // Ebenensichtbarkeit neu setzen
  function __setVisibilityOfLayers(_obj,_visibilityOfLayers,_graphicUpdateLinkOption) {  

    if(_visibilityOfLayers.__count__ == 0 || !_obj.hasOwnProperty ("graphicLayerOptions") || _obj.graphicLayerOptions.graphicLayers.length == 0) { 
      return; 
    } 
    
    var _objFrame = _obj.parent;
    
    for(prop in _visibilityOfLayers) {
      
      var _foundLayer = __searchLayerByID(_obj,prop);   
       _foundLayer.currentVisibility = _visibilityOfLayers[prop]; // Sichtbarkeit setzen
       _obj = _objFrame.allGraphics[0];
    }
    
    _objFrame.allGraphics[0].graphicLayerOptions.updateLinkOption = _graphicUpdateLinkOption;

    function __searchLayerByID(_obj,_id) {
      
      var j=0;
      var _layers = _obj.graphicLayerOptions.graphicLayers;
      var _foundLayer = {};
      
      __searchAllLayer (_layers);
      
      function __searchAllLayer (_layers) {     
        for (var i=0; i<_layers.length; i++) {
          if(_layers[i].id == _id) { 
            _foundLayer = _layers[i];  
          }
          j += 1;
          var _moreLayers = _layers[i].graphicLayers;
          __searchAllLayer (_moreLayers); 
        } 
        return;
      } // END function __searchAllLayer 
      return _foundLayer;
    } // END function __searchLayer
    
    return ; 
  } // END function __setVisibilityOfLayers  
} // END function __placeAllLinksAgain



// Farbmanagement-Richtlinine des Dokuments anpassen
function __adjustPolicies() {
  
  if(app.documents.length == 0 || _global == null) { return; }
  
  var l,_count = 0;
	var _curLink;
  var _graphic;
  var _policy,_rgbPolicy,_cmykPolicy;
  var _allLinks = app.activeDocument.links.everyItem().getElements();
  var _faultyGraphics = [];
  
  for(l=0;l<_allLinks.length;l++) {
  
    try {
			
			_curLink = _allLinks[l];
		if(
			!_curLink || 
			!_curLink.isValid || 
			_curLink.needed == undefined ||
			_curLink.edited == undefined
    ) { continue; }
			
      _graphic = _curLink.parent;
      
      if(!(_graphic instanceof EPS) &&
         !(_graphic instanceof Image) &&
         !(_graphic instanceof ImportedPage) &&
         !(_graphic instanceof PDF)
        ) { continue; }  
      
      // Bilder
      if(_graphic instanceof Image) {
               
        // RGB Bilder
        if(_graphic.space == "RGB") {   
          _policy = app.activeDocument.rgbPolicy;
          __setPolicyforImages(_graphic,_policy); 
        }
        // CMYK Bilder
        if(_graphic.space == "CMYK") { 
          _policy = app.activeDocument.cmykPolicy;
          __setPolicyforImages(_graphic,_policy);   
        }
      }
    
      // PDF, Ai, EPS
      if(_graphic instanceof PDF || _graphic instanceof EPS) {
        _rgbPolicy = app.activeDocument.rgbPolicy;
        _cmykPolicy = app.activeDocument.cmykPolicy;
        __setPolicyForGraphics(_graphic,_rgbPolicy,_cmykPolicy);  
      }
    } catch (e) {
			if(_allLinks[l] && _allLinks[l].isValid && _allLinks[l].needed && _allLinks[l].edited) {
				_faultyGraphics.push(_allLinks[l].parent); 
			}
			alert(e);
    }
  } // END for _allLinks
  
  _global.checkmark.visible = true; // Hacken als Bestaetigung fuer erfolgreichen Durchfuehrung
  _global.checkmarkChangePoliciesVisible = true;
  _global.checkmarkPlaceImagesAgainVisible = false;
  
  
  function __setPolicyforImages (_image,_policy) {
  
    switch (_policy) {     
      // AUS
      case ColorSettingsPolicy.COLOR_POLICY_OFF :
        _image.profile = "Use Document Default";
        _image.imageRenderingIntent = RenderingIntent.USE_COLOR_SETTINGS;
        break;       
      // Werte beibehalten (Profile in Verknuepfungen ignorieren) NUR CMYK
      case ColorSettingsPolicy.COMBINATION_OF_PRESERVE_AND_SAFE_CMYK :
        _image.profile = "Use Document Default";
        _image.imageRenderingIntent = RenderingIntent.USE_COLOR_SETTINGS;
        break;      
      // Eingebettete Profile beibehalten
      case ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES :
   
        switch(_image.profile) {
          case "None" :
          case "Embedded":
            break; 
          default :
            var _foundProfile = __getProfile(_image);
            if(_foundProfile == "None") {
              //_image.profile = "None"; // Einstellung identisch mit »Bilder neu platzieren«
						} else if(_foundProfile === "No Meta Data") {
							//Kein eingebettetes Profil verfügbar.
            } else {
              try { 
                _image.profile = "Embedded";
              } catch(e) {
                // Wenn die Zuweisung "Embedded" hier nicht moeglich ist, 
                // hat das Bild kein eingebettes Profil,
                // es wurde ihm aber ein Profil ueber »Farbeinstellungen fuer Bild ...« zugewiesenes  
                // zudem hat das Bild auch keine Metadaten eigebettet -> keine Aenderung durch das Script
              }
            }
        } // END switch profil-check
        
        _image.imageRenderingIntent = RenderingIntent.USE_COLOR_SETTINGS;
        break;
      
      // In Arbeitsfarbraum umwandeln (keine Aenderung, da InDesign platzierte Bilddateien nicht aendert)
      case ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE :
        break;  
      default :    
    } 
  } // END function __setPolicyforImages 

  function __setPolicyForGraphics(_graphic,_rgbPolicy,_cmykPolicy) {
    
    // RGB Richtlinie des Dokuments
    switch (_rgbPolicy) {
      // AUS
      case ColorSettingsPolicy.COLOR_POLICY_OFF :
        _graphic.rgbVectorPolicy = PlacedVectorProfilePolicy.IGNORE_ALL;
        break;
      // Eingebettete Profile beibehalten
      case ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES :
        _graphic.rgbVectorPolicy = PlacedVectorProfilePolicy.HONOR_ALL_PROFILES;
        break;
      // In Arbeitsfarbraum umwandeln (keine Aenderung, da InDesign platzierte Bilddateien nicht aendert)
      case ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE :
        break;
      default :    
    }
    
    // CMYK Richtlinie des Dokuments
    switch (_cmykPolicy) {
      // AUS
      case ColorSettingsPolicy.COLOR_POLICY_OFF :
        _graphic.cmykVectorPolicy = PlacedVectorProfilePolicy.IGNORE_ALL;
        break;
      // Werte beibehalten (Profile in Verknuepfungen ignorieren)
      case ColorSettingsPolicy.COMBINATION_OF_PRESERVE_AND_SAFE_CMYK :
        _graphic.cmykVectorPolicy = PlacedVectorProfilePolicy.IGNORE_ALL;
        break;
      // Eingebettete Profile beibehalten
      case ColorSettingsPolicy.PRESERVE_EMBEDDED_PROFILES :
        _graphic.cmykVectorPolicy = PlacedVectorProfilePolicy.HONOR_ALL_PROFILES;
        break;
      // In Arbeitsfarbraum umwandeln (keine Aenderung, da InDesign platzierte Bilddateien nicht aendert)
      case ColorSettingsPolicy.CONVERT_TO_WORKING_SPACE :
        break;
      default :
    }
    
    // Graustufen Richtlinie des Dokuments (InDesign veraendert die zugewiesenen Richtlinen nicht)
    //_graphic.grayVectorPolicy = PlacedVectorProfilePolicy.IGNORE_ALL;   
  } // END function __setPolicyForGraphics
} // END function __adjustPolicies



// Format, Farbraum und Profil aller Bilder und Grafikdateien auswerten
function __getLinksAndCheckProfiles() {
  
  var _allLinks = app.activeDocument.links.everyItem().getElements();
  
  var l,i,r,c,g;
	var _curLink;
  var _tempGraphic;
  var _imageProfile;
  var _allImages = [], _allRGBImages = [], _allCMYKImages = [], _allGreyImages = [];
  var _allRGBImagesSameProfile = [], _allRGBImagesDifferentProfile = [], _allRGBImagesNoneProfile = [], _allRGBImagesAssignedProfile = [];
  var _allCMYKImagesSameProfile = [], _allCMYKImagesDifferentProfile = [], _allCMYKImagesNoneProfile = [], _allCMYKImagesAssignedProfile = [];
  var _allGreyImagesDifferentProfile = [], _allGreyImagesNoneProfile = [];
  var _allGraphics = [], _allEPS = [], _allImportedPages = [], _allPDF = [];
  var _allFaultyImages = [];
  
  for(l=0;l<_allLinks.length;l++) {
    
		_curLink = _allLinks[l];
		if(
			!_curLink || 
			!_curLink.isValid || 
			_curLink.needed == undefined ||
			_curLink.edited == undefined
    ) { continue; }
    
		_tempGraphic = _curLink.parent;
    if(
			!(_tempGraphic instanceof EPS) &&
			!(_tempGraphic instanceof Image) &&
			!(_tempGraphic instanceof ImportedPage) &&
			!(_tempGraphic instanceof PDF)
    ) { continue; }
  
    // Auswertung der Vernuepfungen nach Typ
    if(_tempGraphic instanceof Image) {      
      _allImages.push(_tempGraphic);
    } else { 
      _allGraphics.push(_tempGraphic);  
      if(_tempGraphic instanceof EPS) { _allEPS.push(_tempGraphic); }
      if(_tempGraphic instanceof ImportedPage) { _allImportedPages.push(_tempGraphic); }
      if(_tempGraphic instanceof PDF) { _allPDF.push(_tempGraphic); }
    } 
  } // END for _allLinks 

  // Auswertung der Bilder nach Farbraum
  for(i=0;i<_allImages.length;i++) {
    
    switch (_allImages[i].space.toLowerCase()) {
      case "rgb" :
        _allRGBImages.push(_allImages[i]);
        break;
      case "cmyk" :
        _allCMYKImages.push(_allImages[i]);
        break;
      case "niveaux de gris" : /* sic! */
      case "grayscale" :
      case "gray" :
      case "grey" :
      case "graustufen" :
      case "schwarzweiß" :
      case "black and white" :
      case "blackandwhite" :
      case "monochrome" :
        _allGreyImages.push(_allImages[i]);
        break;
      default :
        _allFaultyImages.push(_allImages[i]);
    }  
  } // END for _allImages

  // Auswertung der RGB-Bilder
  for(r=0;r<_allRGBImages.length;r++) {
    
    _imageProfile = "";

    switch (_allRGBImages[r].profile) {
      case "Embedded" :
        try {
          _imageProfile = __getProfile(_allRGBImages[r]);
          if(app.activeDocument.rgbProfile == _imageProfile) {
            _allRGBImagesSameProfile.push(_allRGBImages[r]);
          } else {
            _allRGBImagesDifferentProfile.push(_allRGBImages[r]);  
          }
        } catch (e) { 
          _allFaultyImages.push(_allImages[r]);
        }
        break;
      case "None" :
        _allRGBImagesNoneProfile.push(_allRGBImages[r]);
        break;
      case "Use Document Default" :     
        try {
          _imageProfile = __getProfile(_allRGBImages[r]);
          if(_imageProfile == "None") {
            _allRGBImagesNoneProfile.push(_allRGBImages[r]);
          } else {
            _allRGBImagesAssignedProfile.push(_allRGBImages[r]);
          }   
        } catch(e) {
          _allFaultyImages.push(_allImages[r]);
        }
        break;
      default :
        _allRGBImagesAssignedProfile.push(_allRGBImages[r]);
    }
  } // END for _allRGBImages

  // Auswertung der CMYK-Bilder
  for(c=0;c<_allCMYKImages.length;c++) {
    
    _imageProfile = "";

    switch (_allCMYKImages[c].profile) {
      case "Embedded" :
        try {
          _imageProfile = __getProfile(_allCMYKImages[c]);
          if(app.activeDocument.cmykProfile == _imageProfile) {
            _allCMYKImagesSameProfile.push(_allCMYKImages[c]);
          } else {
            _allCMYKImagesDifferentProfile.push(_allCMYKImages[c]);  
          }
        } catch (e) {
          _allFaultyImages.push(_allImages[c]);
        }
        break;
      case "None" :
        _allCMYKImagesNoneProfile.push(_allCMYKImages[c]);
        break;
      case "Use Document Default" :
        
        try {
          _imageProfile = __getProfile(_allCMYKImages[c]);
          if(_imageProfile == "None") {
            _allCMYKImagesNoneProfile.push(_allCMYKImages[c]);
          } else {
            _allCMYKImagesAssignedProfile.push(_allCMYKImages[c]);
          }   
        } catch(e) {
          _allFaultyImages.push(_allImages[c]);
        }
        break;
      default :
        _allCMYKImagesAssignedProfile.push(_allCMYKImages[c]);
    }
  } // END for _allCMYKImages

  // Auswertung der Graustufen-Bilder
  for(g=0;g<_allGreyImages.length;g++) {
    
    _imageProfile = "";

    if(_allGreyImages[g].profile == "Embedded") { 
      _allGreyImagesDifferentProfile.push(_allGreyImages[g]);  
    } else {
      _allGreyImagesNoneProfile.push(_allGreyImages[g]);
    }   
  } // END for _allGreyImages
  
  
  // Anzahl der Bilder und Grafikdateien auslesen
  _global.uiLabels.checkTabOverviewPanelAllLinkNumber.text = _allLinks.length;
  _global.uiLabels.checkTabOverviewPanelAllImagesNumber.text = _allImages.length;
  _global.uiLabels.checkTabOverviewPanelAllGraphicsNumber.text = _allGraphics.length;
  
  _global.uiLabels.singleViewTabPanelRGBTabAllRGBNumber.text = _allRGBImages.length;
  _global.uiLabels.singleViewTabPanelDocRGBProfileNumber.text = _allRGBImagesSameProfile.length;
  _global.uiLabels.singleViewTabPanelDiffRGBProfileNumber.text = _allRGBImagesDifferentProfile.length;
  _global.uiLabels.singleViewTabPanelNoneRGBProfileNumber.text = _allRGBImagesNoneProfile.length;
  _global.uiLabels.singleViewTabPanelAssignedRGBProfileNumber.text = _allRGBImagesAssignedProfile.length;
  
  _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKNumber.text = _allCMYKImages.length;
  _global.uiLabels.singleViewTabPanelDocCMYKProfileNumber.text = _allCMYKImagesSameProfile.length;
  _global.uiLabels.singleViewTabPanelDiffCMYKProfileNumber.text = _allCMYKImagesDifferentProfile.length;
  _global.uiLabels.singleViewTabPanelNoneCMYKProfileNumber.text = _allCMYKImagesNoneProfile.length;
  _global.uiLabels.singleViewTabPanelAssignedCMYKProfileNumber.text = _allCMYKImagesAssignedProfile.length;
  
  _global.uiLabels.singleViewTabPanelGreyTabAllGreyNumber.text = _allGreyImages.length;
  _global.uiLabels.singleViewTabPanelDiffGreyProfileNumber.text = _allGreyImagesDifferentProfile.length;
  _global.uiLabels.singleViewTabPanelNoneGreyProfileNumber.text = _allGreyImagesNoneProfile.length;
  
  _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsNumber.text = _allGraphics.length;
  _global.uiLabels.singleViewTabPanelPDFAINumber.text = _allPDF.length;
  _global.uiLabels.singleViewTabPanelINDDNumber.text = _allImportedPages.length;
  _global.uiLabels.singleViewTabPanelEPSNumber.text = _allEPS.length;
  
  _global.uiLabels.singleViewTabPanelFaultyNumber.text = _allFaultyImages.length;
  
  
  // Arrays mit Bildern und Grafikdateien in globale Objekte speichern
  _global.allRGBImages = _allRGBImages;
  _global.allRGBImagesSameProfile = _allRGBImagesSameProfile;
  _global.allRGBImagesDifferentProfile = _allRGBImagesDifferentProfile;
  _global.allRGBImagesNoneProfile = _allRGBImagesNoneProfile;
  _global.allRGBImagesAssignedProfile = _allRGBImagesAssignedProfile;
  
  _global.allCMYKImages = _allCMYKImages;
  _global.allCMYKImagesSameProfile = _allCMYKImagesSameProfile;
  _global.allCMYKImagesDifferentProfile = _allCMYKImagesDifferentProfile;
  _global.allCMYKImagesNoneProfile = _allCMYKImagesNoneProfile;
  _global.allCMYKImagesAssignedProfile = _allCMYKImagesAssignedProfile;
  
  _global.allGreyImages = _allGreyImages;
  _global.allGreyImagesDifferentProfile = _allGreyImagesDifferentProfile;
  _global.allGreyImagesNoneProfile = _allGreyImagesNoneProfile;
  
  _global.allGraphics = _allGraphics;
  _global.allPDF = _allPDF;
  _global.allImportedPages = _allImportedPages;
  _global.allEPS = _allEPS;
  
  _global.allFaultyImages = _allFaultyImages;
  
  
  // Zaehler fuer Bilder und Grafikdateien (Show-Button)
  _global.allRGBImagesCounter = 0;
  _global.allRGBImagesSameProfileCounter = 0;
  _global.allRGBImagesDifferentProfileCounter = 0;
  _global.allRGBImagesNoneProfileCounter = 0;
  _global.allRGBImagesAssignedProfileCounter = 0;
  
  _global.allCMYKImagesCounter = 0;
  _global.allCMYKImagesSameProfileCounter = 0;
  _global.allCMYKImagesDifferentProfileCounter = 0;
  _global.allCMYKImagesNoneProfileCounter = 0;
  _global.allCMYKImagesAssignedProfileCounter = 0;
  
  _global.allGreyImagesCounter = 0;
  _global.allGreyImagesDifferentProfileCounter = 0;
  _global.allGreyImagesNoneProfileCounter = 0;
  
  _global.allGraphicsCounter = 0;
  _global.allPDFCounter = 0;
  _global.allImportedPagesCounter = 0;
  _global.allEPSCounter = 0;
  
  _global.allFaultyImagesCounter = 0;
  
  
  // Globale Varablen für Show-Button Anzeige zuweisen
  _global.uiLabels.singleViewTabPanelRGBTabAllRGBButton.text = localize(_global.show);
  _global.uiLabels.singleViewTabPanelDocRGBProfileButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelDiffRGBProfileButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelNoneRGBProfileButton.text = localize(_global.show);
  _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton.text = localize(_global.show);
  
  _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelDocCMYKProfileButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelDiffCMYKProfileButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelNoneCMYKProfileButton.text = localize(_global.show);
  _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton.text = localize(_global.show);
  
  _global.uiLabels.singleViewTabPanelGreyTabAllGreyButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelDiffGreyProfileButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelNoneGreyProfileButton.text = localize(_global.show);
  
  _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelPDFAIButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelINDDButton.text = localize(_global.show); 
  _global.uiLabels.singleViewTabPanelEPSButton.text = localize(_global.show);  
  
  _global.uiLabels.singleViewTabPanelFaultyButton.text = localize(_global.show);
  
  
  // Show-Buttons ausblenden wenn Anzahl der Dateien 0
  if(_allRGBImages.length == 0) { _global.uiLabels.singleViewTabPanelRGBTabAllRGBButton.visible = false; } else { _global.uiLabels.singleViewTabPanelRGBTabAllRGBButton.visible = true; }
  if(_allRGBImagesSameProfile.length == 0) { _global.uiLabels.singleViewTabPanelDocRGBProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelDocRGBProfileButton.visible = true; }
  if(_allRGBImagesDifferentProfile.length == 0) { _global.uiLabels.singleViewTabPanelDiffRGBProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelDiffRGBProfileButton.visible = true; }
  if(_allRGBImagesNoneProfile.length == 0) { _global.uiLabels.singleViewTabPanelNoneRGBProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelNoneRGBProfileButton.visible = true; }
  if(_allRGBImagesAssignedProfile.length == 0) { _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelAssignedRGBProfileButton.visible = true; }
  
  if(_allCMYKImages.length == 0) { _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKButton.visible = false; } else { _global.uiLabels.singleViewTabPanelCMYKTabAllCMYKButton.visible = true; }
  if(_allCMYKImagesSameProfile.length == 0) { _global.uiLabels.singleViewTabPanelDocCMYKProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelDocCMYKProfileButton.visible = true; }
  if(_allCMYKImagesDifferentProfile.length == 0) { _global.uiLabels.singleViewTabPanelDiffCMYKProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelDiffCMYKProfileButton.visible = true; }
  if(_allCMYKImagesNoneProfile.length == 0) { _global.uiLabels.singleViewTabPanelNoneCMYKProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelNoneCMYKProfileButton.visible = true; }
  if(_allCMYKImagesAssignedProfile.length == 0) { _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelAssignedCMYKProfileButton.visible = true; }

  if(_allGreyImages.length == 0) { _global.uiLabels.singleViewTabPanelGreyTabAllGreyButton.visible = false; } else { _global.uiLabels.singleViewTabPanelGreyTabAllGreyButton.visible = true; }
  if(_allGreyImagesDifferentProfile.length == 0) { _global.uiLabels.singleViewTabPanelDiffGreyProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelDiffGreyProfileButton.visible = true; }
  if(_allGreyImagesNoneProfile.length == 0) { _global.uiLabels.singleViewTabPanelNoneGreyProfileButton.visible = false; } else { _global.uiLabels.singleViewTabPanelNoneGreyProfileButton.visible = true;}
  
  if(_allGraphics.length == 0) { _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsButton.visible = false; } else { _global.uiLabels.singleViewTabPanelGraphicsTabAllGraphicsButton.visible = true; }
  if(_allPDF.length == 0) { _global.uiLabels.singleViewTabPanelPDFAIButton.visible = false; } else { _global.uiLabels.singleViewTabPanelPDFAIButton.visible = true; }
  if(_allImportedPages.length == 0) { _global.uiLabels.singleViewTabPanelINDDButton.visible = false; } else { _global.uiLabels.singleViewTabPanelINDDButton.visible = true; }
  if(_allEPS.length == 0) { _global.uiLabels.singleViewTabPanelEPSButton.visible = false; } else { _global.uiLabels.singleViewTabPanelEPSButton.visible = true; }
  
  if(_allFaultyImages.length == 0) { _global.uiLabels.singleViewTabPanelFaultyButton.visible = false; } else { _global.uiLabels.singleViewTabPanelFaultyButton.visible = true; }
  
} // END function __getLinksAndCheckProfiles



// Objekt im Dokument auswaehlen
function __showObject(_objectArray,_counter) {
  
  if(_objectArray.length == _counter) {
    _counter = 0;
  }
  try { 
    app.select(_objectArray[_counter].parent); 
  } 
  catch(e) { 
		var _objName;
    try { 
			_objName = _objectArray[_counter].itemLink.name; 
		} catch (err) { 
			_objName = "undefined"; 
		}
    alert(localize(_global.objectCanNotSel) + "\r\r" + localize(_global.objectName) + " " + _objName + "\r\r" + e); 
  }
  
  _counter += 1;

  return _counter;
} // END function _showObject



// Farbeinstellungen fuer das ausgewaehlte Bild anzeichen
function __setColorSettingOfSeletedImg() {
  
  if(app.documents.length == 0 || _global == null) { return; }
  
  __checkIfSelectionIsImageAndDo(__getProfileAndRenderIntent);
    
  
  function __getProfileAndRenderIntent(_imageFrame) {  
    
    var _outputProfile = "";
    var _spaceOfSelectedImage = _imageFrame.images[0].space;
    var _profileOfSelctedImage = _imageFrame.images[0].profile;
    var _embeddedProfileOfSelectedImage;
    
    try {
      if(_imageFrame.images[0].profile == "None") {
        _embeddedProfileOfSelectedImage = "None";
      } else {
        _embeddedProfileOfSelectedImage = __getProfile(_imageFrame.images[0]);
      } 
      
      if(_embeddedProfileOfSelectedImage == "No Meta Data") { _embeddedProfileOfSelectedImage = localize(_global.profileNotEvaluable); }
      if(_embeddedProfileOfSelectedImage == "None") { _embeddedProfileOfSelectedImage = localize(_global.noEmbeddedProfile); }
    } catch(e) {
      _embeddedProfileOfSelectedImage = localize(_global.profileNotEvaluable);
    }
   
    if(_spaceOfSelectedImage != "CMYK" && _spaceOfSelectedImage != "RGB") {
      return;
    }
    
    switch (_profileOfSelctedImage) {
    case "Use Document Default" :  
      _global.uiLabels.imageColorSettingsProfil.text = localize(_global.useDocumentDefault);
      _global.uiLabels.imageColorSettingsProfilAdd.text = "(" + localize(_global.passProfile) + ": " + _embeddedProfileOfSelectedImage + ")";
      break;
    case "None" :
      _global.uiLabels.imageColorSettingsProfil.text = localize(_global.useDocumentDefaultWithoutProfile);
      _global.uiLabels.imageColorSettingsProfilAdd.text = localize(_global.withoutProfile);
      break;
    case "Embedded" :
      try {
        var _tempProfile = __getProfile(_imageFrame.images[0]);
        if(_tempProfile == "None") { 
          _global.uiLabels.imageColorSettingsProfil.text = localize(_global.withoutProfile);
        } else if(_tempProfile == "No Meta Data") {
          _global.uiLabels.imageColorSettingsProfil.text = localize(_global.profileNotEvaluable);
        }  else {
          _global.uiLabels.imageColorSettingsProfil.text = _tempProfile;
        }    
      } catch (e) {      
        _global.uiLabels.imageColorSettingsProfil.text = localize(_global.profileNotEvaluable);
      }
      break;
    default :
      _global.uiLabels.imageColorSettingsProfil.text = _profileOfSelctedImage;
      _global.uiLabels.imageColorSettingsProfilAdd.text = "(" + localize(_global.passProfile) + ": " + _embeddedProfileOfSelectedImage + ")";
    } 
    
    var _renderingIntentOfSelectedImage = _imageFrame.images[0].imageRenderingIntent;
    
    switch (_renderingIntentOfSelectedImage) {
      case RenderingIntent.USE_COLOR_SETTINGS :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentUseColorSettings);
        break;
      case RenderingIntent.PERCEPTUAL :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentPerceptual);
        break;
      case RenderingIntent.SATURATION :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentSaturation);
        break;
      case RenderingIntent.RELATIVE_COLORIMETRIC :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentRelColorimetric);
        break;
      case RenderingIntent.ABSOLUTE_COLORIMETRIC :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentAbsColorimetric);
        break;
      default :
        _global.uiLabels.imageColorSettingsRender.text = localize(_global.renderingIntentNotEvaluable);
    }
  } // END function __getProfileAndRenderIntent
  return 
} // END function __setColorSettingOfSeletedImg



// Farbprofil fuer Bilder auswerten
function __getProfile(_img) {
  
  var _profile = {};

  if(loadXMPLibrary()){
      var _imgFile = File(_img.itemLink.filePath);
      if (!_imgFile.exists) {
        unloadXMPLibrary();
        return _profile.value = "No Meta Data";
      } 
      xmpFile = new XMPFile(_imgFile.fsName, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
      var _xmpData = xmpFile.getXMP();
      xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
      unloadXMPLibrary();     
  }

  if(_xmpData){
      var _profile = _xmpData.getProperty(XMPConst.NS_PHOTOSHOP,"photoshop:ICCProfile");
      var _colorMode = _xmpData.getProperty(XMPConst.NS_PHOTOSHOP,"photoshop:ColorMode");
      var _colorSpace = _xmpData.getProperty(XMPConst.NS_EXIF,"exif:ColorSpace");
  }

  // load AdobeXMPScript (function by Marijan Tompa) 
  function loadXMPLibrary(){
      if ( !ExternalObject.AdobeXMPScript ){
          try{ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');}
          catch (e){alert('Unable to load the AdobeXMPScript library!'); return false;}
      }
    return true;
  }

  // unload AdobeXMPScript (function by Marijan Tompa)
  function unloadXMPLibrary(){
      if( ExternalObject.AdobeXMPScript ){
          try{ExternalObject.AdobeXMPScript.unload(); ExternalObject.AdobeXMPScript = undefined;}
          catch (e){alert('Unable to unload the AdobeXMPScript library!');}
      }
  }

  // Kein Metadateneintrag
  // Eingebettets Profil wird gesucht
  if(_profile == null && _img.imageTypeName == "JPEG") {
    _profile = {};
    _profile.value = __getEmbeddedICCProfile(_img);
    if(_profile.value == null) { 
			_profile = null; 
		}
  }

  // Kein Metadateneintrag und kein eingebettes Profil
  // EXIF-Tag ColorSpace wird ausgewertet
  if(_profile == null && (_img.imageTypeName == "JPEG" || _img.imageTypeName == "TIFF")) {
    _profile = {};
    if(_colorSpace == 1) {
      _profile.value = "sRGB IEC61966-2.1";
    } else {
      _profile = null;
    }  
  }

  // Kein Metadateneintrag, kein eingebettes Profil und kein Exif-Eintrag
  // Datei wird nach Texteintrag durchsucht
  if(_profile == null) {
    _profile = {};
    _profile.value = __searchProfileInFile(_img);
    if(_profile.value == null) { 
			_profile = null; 
		}
  }
  
  if(_profile == null) {
    _profile = {};
    _profile.value = "None"; 
    if(_colorMode == null) {
      _profile.value = "No Meta Data"; 
    } 
  }

  return _profile.value;
} // END function __getProfile


// Eingebettetes ICC-Farbprofil suchen 
function __getEmbeddedICCProfile(_img) {
  
    if (_img == null || _img.itemLink == null) { return null; }
    
    var _file = File(_img.itemLink.filePath);
    
    var _stopReadAt = 131072,
        _maxLengthOfMarker = 65533,
        _posProfile = 0,
        _iccOverhead = 16, /*Anfang Header*/
        _chunkOverhead = 0,
        _descOffset = 0,
        _startProfileNameOffset = 12,
        _length = 0,
        _contentOfChunk = "",
        _counter = 0,
        _resultOfMatch = [],
        _profileName = "";
    
    var _iccProfileMarker00FF = new RegExp("\\u00FF"),
        _iccProfileMarker00E2 = new RegExp("\\u00E2"),
        _nonASCII = new RegExp("[^\x20-\x7E]","g"),
        _prefix = new RegExp("^\\(new String\\(\""),
        _suffix = new RegExp("\"\\)\\)$");
    
    if (_file.exists) {
      _file.open("r");
      _file.encoding = "binary";
      
      try {
        _profileName = __findMarkerAndDesc();
      } catch(e) { 
        alert(e);
      }
      _file.close();  
    }
  return _profileName || null;
  
  
  function __findMarkerAndDesc(){
    
    // ICC-Profil-Marker finden
    do {
      _resultOfMatch = _contentOfChunk.match(_iccProfileMarker00FF);
      if(_resultOfMatch!= null) { 
        _contentOfChunk = _file.readch();
        _resultOfMatch = _contentOfChunk.match(_iccProfileMarker00E2);
        if(_resultOfMatch != null) {
          _posProfile = _file.tell();
          //$.writeln("Position of Marker: " + _posProfile);
          var _numOfMarker = _file.read(16).charCodeAt(15);
          //$.writeln("Number of Marker: " + _numOfMarker);
          break;
        }
      } else {
        _contentOfChunk = _file.readch();
      }
      _counter++;
    } while(_file.eof == false && _counter <= _stopReadAt)

    // Tag »desc« finden 
    if(_file.eof || _posProfile == 0) { return _profileName = ""; }
    _contentOfChunk = "";
    _counter = 0;
    
    do {
      if (_contentOfChunk=="d") {
        _contentOfChunk = _file.readch();
        if(_contentOfChunk=="e") {
          _contentOfChunk = _file.readch();
          if(_contentOfChunk=="s") {
            _contentOfChunk = _file.readch();
            if(_contentOfChunk=="c") {
              
              //$.writeln("Found desc Position: " + _file.tell());
              
              // Offset desc auslesen
              _descOffset = _file.read(4);
              _descOffset = (_descOffset.charCodeAt(3))+(_descOffset.charCodeAt(2)<<8)+(_descOffset.charCodeAt(1)<<16)+(_descOffset.charCodeAt(0)<<24);  
              //$.writeln("desc Offset: " + _descOffset); 
              
              // Laenge desc auslesen
              _length = _file.read(4);
              _length = (_length.charCodeAt(3))+(_length.charCodeAt(2)<<8)+(_length.charCodeAt(1)<<16)+(_length.charCodeAt(0)<<24);  
              //$.writeln("desc Length: " + _length);
              
              // Korrekturfaktor fuer _descOffset
              _chunkOverhead = __adjustOffset(_descOffset);
              
              _file.seek(_posProfile + _iccOverhead + _descOffset + _chunkOverhead/* + _startProfileNameOffset*/,0); 
              
              var _nameLength = _file.read(12).charCodeAt(11);
              //$.writeln(_nameLength);
              
              if(_nameLength == 1) {
                _nameLength = _file.read(12).charCodeAt(11);
                _file.read(4);
              } 
              
              // Profil eciRGB v2 ICCv4: geaenderter Aufbau 
              for(var i=0;i<_nameLength;i++) {
                _profileName += _file.readch();
              } 
            
              _profileName = _profileName.replace(_nonASCII,"","g"); 
              _profileName = _profileName.toSource(); 
              _profileName = _profileName.replace(_prefix,"").replace(_suffix,""); 
              
              //$.writeln("\r" + _profileName + "\r");
              break;
            }  
          } 
        } 
      } else {
      _contentOfChunk = _file.readch();
      }
      _counter++;
    } while (_file.eof == false && _counter <= _maxLengthOfMarker)
    
    return _profileName;
  } // END function _findMarker 

  // Bei grossen Profilen erfolgt eine Unterteilung der Daten in Chunks zu je 64 KByte  
  // Je Chunk, das dem desc-Tag vorangeht, ergibt sich ein Overhead von 18 Byte
  function __adjustOffset(_descOffset) {  
    var _numberOfChunks = Math.floor(_descOffset/65536);
    return _numberOfChunks*18;
  } // END function __adjustOffset
} // END function __getEmbeddedICCProfile


// Texteintrag in Bilddatei suchen
function __searchProfileInFile(_img) {
  
    var _file = File(_img.itemLink.filePath);
    
    var _stopReadAtLine = 500;
    var _regExp;
    var _regExpRGB = new RegExp("(e\\x00c\\x00i\\x00R\\x00G\\x00B\\x00 \\x00v\\x002\\x00 \\x00I\\x00C\\x00C\\x00v\\x004)|(eciRGB v2 ICCv4)|(eciRGB v2)|(sRGB IEC61966-2.1)|(Adobe RGB \\(1998\\))|(ColorMatch RGB)|(ProPhoto RGB)|(Wide Gamut RGB)|(CIE RGB)|(Apple RGB)|(e\\x00-\\x00s\\x00R\\x00G\\x00B)|(s\\x00Y\\x00C\\x00C\\x00 \\x008\\x00-\\x00b\\x00i\\x00t)|(GBR)");
    var _regExpCMYK = new RegExp("(Euroscale Coated v2)|(Euroscale Uncoated v2)|(ISOnewspaper26v4)|(ISO Coated v2 \\(ECI\\))|(ISO Coated v2 300% \\(ECI\\))|(PSO LWC Improved \\(ECI\\))|(PSO LWC Standard \\(ECI\\))|(PSO Uncoated ISO12647 \\(ECI\\))|(ISO Uncoated Yellowish)|(SC Paper \\(ECI\\))|(PSO MFC Paper \\(ECI\\))|(PSO SNP Paper \\(ECI\\))|(PSO Coated NPscreen ISO12647 \\(ECI\\))|(PSO Coated 300% NPscreen ISO12647 \\(ECI\\))|(PSO Uncoated NPscreen ISO12647 \\(ECI\\))|(Coated FOGRA27 \\(ISO 12647-2:2004\\))|(Web Coated FOGRA28 \\(ISO 12647-2:2004\\))|(Uncoated FOGRA29 \\(ISO 12647-2:2004\\))|(Coated FOGRA39 \\(ISO 12647-2:2004\\))");

    (_img.space == "CMYK")? _regExp = _regExpCMYK : _regExp = _regExpRGB;
    
    var _replace1 = /^\(new String\(\"/;
    var _replace2 = /\"\)\)$/;
    var _replace3 = /\\x00/g; 
    var _lineOfFile;
    var _lineCounter = 0;
    var _results = [];
    var _profilName;
    
    if (_file.exists) {
      _file.open("r");   
      try {
        do {
          _lineOfFile = _file.readln();
          _results = _lineOfFile.match(_regExp);
          if(_results != null) {
            _profilName = _results[0].toSource().replace(_replace1,"").replace(_replace2,"").replace(_replace3,"");
            break;
          }  
          _lineCounter += 1;
        } while(_file.eof == false && _lineCounter <= _stopReadAtLine)
      } catch(e) { 
        alert(e);
      }
      _file.close(); 
    }
  return _profilName || null;
} // END function __searchProfileInFile



// Anzeigen des Transparenzfarbraumes
function __setBlendingSpace() {
  _global.uiLabels.transBlendSpace.text = app.activeDocument.transparencyPreferences.blendingSpace;
} // END function __setBlendingSpace



// Farbmanagement-Richtlinien fuer PDF, AI und EPS anzeigen
function __setVectorPoliciesOfSelectedGraphic() {
  
  if(app.documents.length == 0 || _global == null) { return; }
  
  __checkIfSelectionIsPDForAIAndDo(__getVectorPoliciesAndImageSpaces);
  
  
  function __getVectorPoliciesAndImageSpaces (_graphicFrame) {
    
    _global.uiLabels.rgbVectorPolicy.text = __translateVectorPolicy(_graphicFrame.graphics[0].rgbVectorPolicy);
    _global.uiLabels.cmykVectorPolicy.text = __translateVectorPolicy(_graphicFrame.graphics[0].cmykVectorPolicy);
    _global.uiLabels.grayVectorPolicy.text = __translateVectorPolicy(_graphicFrame.graphics[0].grayVectorPolicy);    
    
    function __translateVectorPolicy(_vectorPolicy) {
    
      switch (_vectorPolicy) {
        case PlacedVectorProfilePolicy.IGNORE_ALL :
          return localize(_global.ignoreAll);
          break;
        case PlacedVectorProfilePolicy.IGNORE_OUTPUT_INTENT :
          return localize(_global.ignoreOutputIntent);
          break;
        case PlacedVectorProfilePolicy.HONOR_ALL_PROFILES :
          return localize(_global.honorAllProfiles);
          break;
        default :
          return localize(_global.notEvaluable);
      } 
    } // END function __translateVectorPolicy
  } // END function __getVectorPoliciesAndImageSpaces
} // END function __setVectorPoliciesOfSelectedGraphic



// Ausgewaehltes Objekt ein Bild?
function __checkIfSelectionIsImageAndDo(__function) {
  
  _global.uiLabels.imageColorSettingsProfil.text = ""; 
  _global.uiLabels.imageColorSettingsProfilAdd.text = "";
  _global.uiLabels.imageColorSettingsRender.text = "";
  
  try {
    
    if(app.selection.length == 1) {
      
      var _selection = app.selection[0];
      
      if((_selection instanceof Rectangle || _selection instanceof Oval || _selection instanceof Polygon) && 
          _selection.contentType == ContentType.GRAPHIC_TYPE && _selection.images.length == 1 &&
          _selection.movies.length == 0 && _selection.movies.length == 0 && _selection.sounds.length == 0) { 
         
        __function(_selection);
      } else if (_selection instanceof Image) {
        __function(_selection.parent);
      } 
    } 
  } catch(e) { alert("Something went wrong!" + "\r\r" + e); }
} // END function __checkIfSelectionIsImageAndDo
 


// Farbmanagement-Richtlinie fuer ausgewaehlte Grafikdatei aendern
function __changeVectorPoliciesOfSelectedGraphic(_frame) {
  
  var _listItems = [localize(_global.changeVectorPolicyHonorAllProfiles),localize(_global.changeVectorPolicyIgnoreAll),localize(_global.changeVectorPolicyIgnoreOutputIntent)];
  
  var _changeVectorPoliciesDialog = new Window ("dialog",localize(_global.changeVectorPoliciesHeader));
  with(_changeVectorPoliciesDialog) {
    alignChildren = ["right","top"];
    orientation = "row";
    margins = [35,25,25,35];
    var _changeVectorPolicyDropdownGroup = add("group");
    with(_changeVectorPolicyDropdownGroup) {
      alignChildren = ["right","top"];
      orientation = "column";
      spacing = 9;
      var _changeRGBVectorPolicyGroup = add("group");
      with(_changeRGBVectorPolicyGroup) {
        var _changeRGBVectorPolicyLabel = add("statictext",undefined,localize(_global.changeRGBVectorPolicyLabel));
        with(_changeRGBVectorPolicyLabel) {  
        } // END statictext _changeRGBVectorPolicyLabel
        var _changeRGBVectorPolicyDropdown = add("dropdownlist",undefined,_listItems)
        with(_changeRGBVectorPolicyDropdown) {
        } // END dropdownlist _changeRGBVectorPolicyDropdown
      } // END group
      var _changeCMYKVectorPolicyGroup = add("group");
      with(_changeCMYKVectorPolicyGroup) {
        var _changeCMYKVectorPolicyLabel = add("statictext",undefined,localize(_global.changeCMYKVectorPolicyLabel));
        with(_changeCMYKVectorPolicyLabel) {  
        } // END statictext _changeCMYKVectorPolicyLabel
        var _changeCMYKVectorPolicyDropdown = add("dropdownlist",undefined,_listItems)
        with(_changeCMYKVectorPolicyDropdown) {
        } // END dropdownlist _changeCMYKVectorPolicyDropdown
      } // END group _changeCMYKVectorPolicyGroup
      var _changeGrayVectorPolicyGroup = add("group");
      with(_changeGrayVectorPolicyGroup) {
        var _changeGrayVectorPolicyLabel = add("statictext",undefined,localize(_global.changeGrayVectorPolicyLabel));
        with(_changeGrayVectorPolicyLabel) {  
        } // END statictext _changeGrayVectorPolicyLabel
        var _changeGrayVectorPolicyDropdown = add("dropdownlist",undefined,_listItems)
        with(_changeGrayVectorPolicyDropdown) {
        } // END dropdownlist _changeGrayVectorPolicyDropdown
      } // END group _changeGrayVectorPolicyGroup
    } // END group _changeVectorPolicyDropdownGroup
    var _changeVectorPoliciesButtonsGroup = add("group");
    with(_changeVectorPoliciesButtonsGroup) {
      alignChildren = ["right","top"];
      orientation = "column";
      spacing = 10;
      var _changeVectorPolicyOkButton = add("button",undefined,"Ok");
      with(_changeVectorPolicyOkButton) { 
      } // END button _changeVectorPolicyOkButton
      var _changeVectorPolicyCancelButton = add("button",undefined,"Cancel");
      with(_changeVectorPolicyCancelButton) {  
      } // END button _changeVectorPolicyOkButton
    } // END group _changeVectorPoliciesButtonsGroup  
  } // ENF window _changeVectorPoliciesDialog
  
  // Auswahl der aktuellen Richtlinien
  __selectDropdownlistItem();
  

  // Callbacks +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  _changeVectorPolicyOkButton.onClick = function() {  
    _changeVectorPoliciesDialog.close(2);     
  }
  // END Callbacks +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
  
  _changeVectorPoliciesDialog.show();
  
  __changeVectorPolicy(_frame);  
  __setVectorPoliciesOfSelectedGraphic(_frame);
  
  function __selectDropdownlistItem() {
    
    if(app.documents.length == 0 || _global == null) { return; }
  
    __checkIfSelectionIsPDForAIAndDo(__setVectorPolicies); 

    function __setVectorPolicies(_selection) {    
      
      __select(_selection.graphics[0].rgbVectorPolicy,_changeRGBVectorPolicyDropdown);
      __select(_selection.graphics[0].cmykVectorPolicy,_changeCMYKVectorPolicyDropdown);
      __select(_selection.graphics[0].grayVectorPolicy,_changeGrayVectorPolicyDropdown);     
    
      function __select(_vectorPolicy,_dropdownlist) {

        switch (_vectorPolicy) {
          case PlacedVectorProfilePolicy.HONOR_ALL_PROFILES :
              _dropdownlist.selection = 0;
            break;
          case PlacedVectorProfilePolicy.IGNORE_ALL :
              _dropdownlist.selection = 1;
            break;
          case PlacedVectorProfilePolicy.IGNORE_OUTPUT_INTENT :
              _dropdownlist.selection = 2;
            break;
          default :
            _dropdownlist.selection = null;
        }
      } // END function __getSpace
    } // END function __setVectorPolicies
  } // END function __selectDropdownlistItem 

  
  function __changeVectorPolicy(_frame) {

     _frame.graphics[0].rgbVectorPolicy = __change(_changeRGBVectorPolicyDropdown);
     _frame.graphics[0].cmykVectorPolicy = __change(_changeCMYKVectorPolicyDropdown);
     _frame.graphics[0].grayVectorPolicy = __change(_changeGrayVectorPolicyDropdown); 
      
    function __change(_dropDownList) {
       
      if(_dropDownList.selection != null) {
        switch (_dropDownList.selection.index) {
          case 0 :
              return PlacedVectorProfilePolicy.HONOR_ALL_PROFILES;
            break;
          case 1 :
              return PlacedVectorProfilePolicy.IGNORE_ALL;
            break;
          case 2 :
              return PlacedVectorProfilePolicy.IGNORE_OUTPUT_INTENT;
            break;
          default :    
        } 
      }
    } // END function __change  
  } // END function __changeVectorPolicy 
} // END function __changeVectorPoliciesOfSelectedGraphic



// Ausgewaehltes Objekt eine Grafikdatei?
function __checkIfSelectionIsPDForAIAndDo(__function) {
  
  _global.uiLabels.rgbVectorPolicy.text = "";
  _global.uiLabels.cmykVectorPolicy.text = "";
  _global.uiLabels.grayVectorPolicy.text = "";
  
  try {
      
      if(app.selection.length == 1) {
        
        var _selection = app.selection[0];
        
        if((_selection instanceof Rectangle || _selection instanceof Oval || _selection instanceof Polygon) && 
            _selection.contentType == ContentType.GRAPHIC_TYPE && (_selection.epss.length == 1 || _selection.pdfs.length == 1) &&
            _selection.movies.length == 0 && _selection.movies.length == 0 && _selection.sounds.length == 0 && _selection.images.length == 0) { 
           
          __function(_selection);
        } else if (_selection instanceof PDF || _selection instanceof EPS) {
          __function(_selection.parent);
        } 
      } 
    } catch(e) { 
			alert("Something went wrong!" + "\r\r" + e); 
		}
  
} // END function __checkIfSelectionIsPDForAIAndDo 
 
 
 
function __addEventListenerAfterSelectionChanged() {

  var _numberOfEventListeners = app.activeDocument.eventListeners.length;   
  
  for(var e=_numberOfEventListeners-1;e>=0;e--) { 
    if(app.activeDocument.eventListeners[e].eventType == "afterSelectionChanged" && app.activeDocument.eventListeners[e].handler.name == "__updateAfterSelectionChanged") {
      app.activeDocument.eventListeners[e].remove();
    }
  }
  app.activeDocument.addEventListener("afterSelectionChanged", __updateAfterSelectionChanged); 
} // END function __addEventListenerAfterSelectionChanged
 
 
function _removeEventListenerFromAllDocs() { 
  
  for(var d=app.documents.length-1;d>=0;d--) { 
    var _numberOfEventListeners = app.documents[d].eventListeners.length;
    for(var e=_numberOfEventListeners-1;e>=0;e--) { 
      if(app.documents[d].eventListeners[e].eventType == "afterSelectionChanged" && app.documents[d].eventListeners[e].handler.name == "__updateAfterSelectionChanged") {
        app.documents[d].eventListeners[e].remove();
      }
    }    
  }
} // END function _removeEventListenerFromAllDocs
 
 
 
// Funktion fuer Event Listener afterSelectionChanged 
function __updateAfterSelectionChanged() { 
  if(app.documents.length > 0 && app.selection.length != 0 && _global != null) {
    __setVectorPoliciesOfSelectedGraphic(); 
    __setColorSettingOfSeletedImg(); 
  }
} // END function __updateAfterSelectionChanged 
 
 

// Icons fuer User Interface
function __defineIconsForUI() {
  return { 
    headerImage: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x01]\x00\x00\x00\x02\b\x06\x00\x00\x00\u00FB'\x0F!\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02<IDATx\u00DA\u00B4T\u008Br\u00E3 \fd\u00B1\x13\u00A7\u00D7\u00FF\u00FF\u00D4^^\u00B6u+$l\u00998\u0099\u00A43\u00E7\u00CEfW\x12\b\x01\u00A2\u0090\u0094\x0E\u00C9p$\x06\u00E2\u00E4\u00F8\n\u00F8\u00E3P\u00FD\u00ED\u00FA;\u00C4\u00C8\u00F0\u00B1r\u00F2<\u0083\u00E7\u00AC\u00A8\u00EB\u00F4\u008E.\u0081\u0090\u0094\u008B~\x04R\u00FC\u00D4\u0093\x03\x1F\\\u00F7\u0081\u00E3\n\u0095\u00E3\u00CA\u0087\u00C6n\u00AB\x1B\u0082>\u00BE\u00D0\x07\u0096v\u0094m\u00DE\u00B8V\u00DF\u00A0kt\u00DC\u0087c\u00E2v\u0099\u0091lZy,\frZ\u00EC1\u00F0}a\u00D3\u00F7\u0099\u00F6L\u00CDD\u00F79;#\u00DD\u008A\u008F\u00F1\u00C9\u00F5\u008C\u00D5\u00AF\u00E3\u0098\u00FC\u00C6\u00F8X\u00E3\u0085\u00F32\u00CE\u0090=\u00FFjO%\x07}\u00A2:\u00935n<I\u00E5.\u00CD\u00CA\u00DC\u00A4\u00FAf\u0098\u00BD=\x00j\u00F8\u00B5#\u009BF\u00EF\u00BAw\u00D0\u0097\u00DD\u009F\u00FB\u00E0w[c\u00F9\u00E0\u00B6\u00EB\x1C\u00E35\x07\u00FD\x1D/\n\u00CA\u0083\u008F;:zc\u008DI\u00DBH\u00F5\x12s\u00E0\n\u00EEg.\x17\u00B3\u00C2\x0E\u00DF\u00F8\u00C6\x03\u00BE\u00CE\u00CE\f^\u00C9\u0097\u00D1\u00B4\u00F2\u00E5\u00BE\u00DA\u00B71\u0095\x0B\x199o\u00E4M3\u0087\u008Cjs\u00BE\u00B2\u00E6\u009Cf\x1B\u00A3\u0098\u00C4\u00FC\u00C5\u00A71\x1F[\u00B4\u0098\x7F\u00F49S\u00F0)f1[k/v2\x1F\u0091\u00A9\x15\u00ED\u00A3l[\u00DB\u00DA\x1F\u00D4(\\q,\u009C\u00FDI\u00A8\u009D\u0083\u00AF\u00C6\u00CD?\x10'\u00E2\u00AB\u00A0+\u00FA\x14\u00B4\u00C5A\u00EE\n[.\u00F3\u00D7u{\u00C7\u00F2T\fs\u00808O\u0081#6\u00B7G\u00DC\u0088+S^9\u00F3B}&\u0094\u00FF:\u00CEA\u00FF\u00B8\u00FD\x13b\u00E70\u00E7\u00EA\u00AC9\u00EF9\u00FD\u00FACc\u008B\u00E3\u0083O~9\x16;6>\u00C8\u0089\x06\u00E9\u00C5|\u00ECl\u00B5\x0E\u0092=7\u009E\u00D7 ;\x1AqK\u00FA\x07\x0F\u00C1\u0097\u00967\x0E\x05\u00FE+\u00A1V\u00F1\u00DFP+\u00C4\u00B3.\u008E\u0085\u00D6\x19\u00F0\u00B5eS\x1BD\u009AZ\u00BCZD{o\u00AB\u00D1\u008F\u00F5\u008Cb\r\u00D8k+\u00D9\x1E<\u00F6\u00FAN\u00CA\u009E\u00B6c\u00EB~\u009B~\x14\u00D99\u00B3\x10\u00C7\u00C3A<\u00B944\u00BD.\u00FB\u00FD\u00D9\u00F6\f\u00E4\u008D7T\u00DDX\u00D6z(\x05\u00ED\u00B5\u00C7\u00F5%\u00C4\u00F0Xc\u00BB\x7FA\u00B3f\u00F3\x1E\u00F0\u00BA\u00E2\u00B5\u00EB\u00B0\x7F\u0085\u00DE\u00CF\u00B1\x0Fd\u00E1\u00B49K<\u00ED\u00A2\u00E6\u00A1\u0084\u00A6\\3\u00E1\u00B3\x7FU\u00FF\u00EB\x7F\u00D4\u009B\u00DF?\x01\x06\x00\u00FCVW\u00D0(\x04\u0096\u00FF\x00\x00\x00\x00IEND\u00AEB`\u0082", 
    warning: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\r\x00\x00\x00\f\b\x06\x00\x00\x00\u00B9\u00B77\u00D9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00wIDATx\u00DAb|\u00B3_\u009A\x01\x0B(\x06\u00E2\u00FF@\u00DC\u0087M\u0092\x05\u008B\u0098=\x10\u00F7@\u00D9\u00E7\u0080\u00F8\x00\u00BA\x02&,\u009A\x1A\u0090\u00D8\u00F5\u00D8lb\u00C2b\u008B\x03\x12\u00DF\x01\u008D\u008FU\x13\u00DC\x16\x11\u00C7\u00A78mc\u00C2c\x0BN\u00DB\u0098p\u00F8\x05\x1D\u00D4c\u00D3\u0084\u00CB\x16\u00AC\u00B61\u00E1\u00B2\x05K\u00FC\u00D5#k\u00C2j\x0BR@`\u00D8\u00C6\u0084\u00CB/8RJ=L\x13\x0B\x03\u00F1\u0080\x15D\x00\x04\x18\x00\u00FA\u00CB\x1599\x03W\u00CF\x00\x00\x00\x00IEND\u00AEB`\u0082",
    checkmark: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00 \b\x06\x00\x00\x00szz\u00F4\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01yIDATx\u00DA\u00E4W\u00CBm\u00C30\fU\n_\x03x\x04\u008F\u0090\x11<B6\u0088\u0082.\u00E0l\u0090\r\u009AL\u0090f\u0082\u00A4\u00E7\x1E\u00D2NPg\x03\u008F`M\u00E0R\x00\r\b\u00AAi\u00EAc\u00CB\u0087\x12x\x07\x0B\u0086\x1FM>>I\u00AB\u00AE\u00EB\u00C4\u0092\u00F1\"\x16\u008E\u00EC\u00F5s\u00BD\x04o\x01\u00B8\x00\x0EKT`\x0B\u00F8\x01\u0094\u0080S\u00EA\x04*\u00C0\r\u0090\x03\u0094~\u00CE\x12\x11k\u00C27\u0080\u00B4*Qg\u0089\u00C8\x1F\u0080\u008D\u00B1\u00B6\x07|\u00A5\u0098\u0082\r\u00F6\u00DB$?\x03\u00DES\u008Ca\u0089\x7F^\x18kW\u00D4\u00C1\u00EC> \u0091<7\u00D6\u009E6\u00F9\\\tH\u009Cq3\x14\u008A\u00AE\u00FDcD\x13\u0093\u00EB\u00DE\u00EE\u0088\u00D9o\u00E6\u00B6b\u008A\u00FC\u00D0+~\u00CE\x04(r-\u00BA\u0093\u00EBf4\u00D4;\u0097\x19\u00BF\x10\u00E4\u0083\u00A2\u00A34`\u0093\u00EF\x03\r\u0086\x15\u00DDP\x05lr\u0089\u00E6\u0091\x07\u0092\u00F7\u00DFh\\\u00CF\x03%\u00E1`\x0F\"\t\u008E\\;\u00DD\u00DD\u00E7@\"Q,.6\u00CA\u0091\u00EB\u00BE\x1FCNDT\x12\u0085A\u00C8\u0091+\u00FCN\u00EB\u0093@f\u00F5M\f(\u00BA'nF\u00C8\x05\u00FEy\x1D{&\u00A4*\u00913\u00E4\x1F\u00DC\u00BC\u00FB\x18\x11\u0095\u0084`J?\u00E9\u00A9\u00D8'\t\u00EF\u00BE\u00BBZq\u0085\u00AA\x16L\u00E9\u00EF\"\"\u00C6\x12h\u00D1#\u009E#\u00A5\u00AFDdp\u009B\u00D1X\x12GW\u00B7\u008B\u00BD\x19\u00B5\u00E8\u00EB\u00CAX\u00FB\x0EU}\u00E8v\u00DC`%\u0094\u00E5\x19\u00F1W3\u008Fwk\u00ACD9E\u00E9\u00FBX\u00FD\u00FB\u00DB\u00F1\u00AF\x00\x03\x00\u00DD\u0091Xt+\u00E0m\x05\x00\x00\x00\x00IEND\u00AEB`\u0082",
    refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00 \b\x06\x00\x00\x00szz\u00F4\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u00C9IDATx\u00DA\u00ECW\u00EDM\u00C30\x10M\u00A2\f\u00E0\r\x1A&H7\u0080\x01\u00A8\x1A&H\u00D8\x00&\u00A0\u009D\x006 \u009D\u0080v\u0082v\u0083\u00D2\t\u00D2N\u00803A\u00F1I/\u00E8d]\x12\u009B\u0084\u00F2\u00A7'=)\u0092?\u00DE\u00BB\x0F\u00DB\u0097p6\u00BB\x0F\x1CM\x19\u00DC\x1A\u00DC\x19L\r\x12\u0080\u00EC\u00D3@\x1B\x1C\r\u00D6\x06\x1B\u00C7=\u00CB\u00D8a\x12\u0091\u00BC\x18d\x10!\u00D9\u0094}\x17\x10CB\u009E\u00F1-\u0092\x1B\u00E4Q\u008F\u00C7D\\aS\x15\u00B8\u009B\u00C2\u009A\n{\u0088\u00E4\u00F4\x11ux\u00BD5X\x04\u00C3La\u008F=s\u00E0\u0087\u009C,n\t\u00E7\u00B6\u00C5\u00E3\x13B\u00BB\x034[\u0093\u00A0>(U\x13a\u00CF\nk2>\x10ZE\u0098Xj9\u00F1\x02\u00EA]\u00AC\u00C0\u00FCI\u00DFD;\x05k\u0081|\x05\x0FJ\u008F\u00D0\u0097X\u00B3\u00F1\x11@\u008AS\u0081\u00BC\u00E8\u00A8\u00E4.\u00D3\b\u00F7\u00C9E@\"TkC>\u00C4\u00CA\u00BE4D\u00CC{;\u00E7O#\u0090\u00E7\u00AE)\u00A0\x1B\u00AC\u00B6\u00D2\u00A1\u00FF\u009A\u00DC\u008E\x00\x15\u00DF\x03B_^\u0082\u00BC\u00ED\x14\f\u00CD;\u00AD\x0F]\x11\x05\u00FFlW\x01W\x01W\x01$\u00E0\u00EC\u00811\u00DE\u0086\u00F9o#\u00F08\u00F0\u0086,pC\u00D2e\u00F7\u00D5\u00BC?\u00D1\u0085\u00C8\u0095\u00F5\u00DA\u00AA\u00A6\u00A3\u008E.@N\u00F6\u00C6Zx\u00FE\u00E0\u00F5\n\u00D8\u008D@.=NK\u00BC\u00C0\u00BD\x02\u00A8\u00C9\u00FC\u00F0l\u00C9y\u0098\u00DF\x05\u00F2\x03\u00EF?\\R\u0090\u00A1Q\u00CD=\x0Bn/\u009C\u009A\x1ANu\u009E\u0082\u00A5\u00D5\u009C4-[\u0089\u00D6\u00FA\x15Gij\u008D\u00CF1V\u00C1\u00F3\u00A4\u0085\\\u00DBm\u00F9Y(8\u0085\u00FC\u00A7#\u00DD7\x07\u0089\u00DC\u008E\x00\u00AFv\r\x0F\u00A5h\u00F8\u00DA\u00B2\u008D\u009C\x0Bh;j\x0B\u0084r\u00E5)\u00A4\u00C6\u009A\u009B\u00BE\u00FE2v8\u00E7\u009A\x15S\x06$HS\u00CA\u00BA\u00E8#~\u00D3\u00ED\u00DF\u00B6N\u00FB\x16`\x00\x06\x12zot\u00CA\u00F25\x00\x00\x00\x00IEND\u00AEB`\u0082",
    info: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x13\x00\x00\x00\x13\b\x06\x00\x00\x00rP6\u00CC\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01:IDATx\u00DAb\u00F4\u00F7\u00F3d\u00C0\x02\u00E4\u00818\x02\u0088\u00BD\u0080X\x05\u0088E\u0080\u00F8\r\x10\u00DF\x05\u00E2\u00AD@\u00BC\x02\u0088\x1F\u00A2kbA\u00E3s\x02q+\x10\u00E7\x001+\u009A\u009C\x14\x14\u00DB\x02q3\x10O\x05\u00E2j \u00FE\x06S\u00C0\u0084\u00A4X\x14\u0088\u008F\x02q!\x16\u0083\u00D0\x01H\u00BE\x00\u0088\u008F@\u00F5\u00A1\x18\u00C6\x06\u00C4\u009B\u0081\u00D8\u0090\u00814`\b\u00D5\u00C7\u008ElX'\x10\u009B\u00E3\u00D21i\u00F2\f0\u00C6\x01@\u00FA:`\u0086\u00C9A\u00C3\u0088\x12\x00\u00D2\u00AF\x00\u008A\u0080$,\x11\u0081\x02\u00F2r3\b\x19\x06\u00D2\u009F\br\u0099\x0B\x03u\u0080+\u00C8D%|aE\u0082\x0B\u00D5A.\x13\u00C6\u00E7=\"\u00BC\b\x03B \u00C3\u00DER\u00C9\u009B\u00EF@\u0086\u00DD\u00A3\u0092a7A\u0086\u00ED\u00A5\u0092a\u00BB\x19\u0081\x19]\x0E\u009A\u0081Y\bE\x00\u009E\u0088\u00F8\x03\u00C4\u00AA\u008C\u00D0R\u00A3\x1F\u009A\u00D7\u00C8\x05\x13A\u00FAa\u00D9\u00A9\x1C\u0088O\u0092i\u00D0I\u00A8~x\u00DE\u00FC\x05\u00C4\u00BE@|\u009ED\u0083\u00CEC\u00F5\u00FDD/\u0082^\x03\u00B1\r(\u00A8\u00A0a\u0080\x0F\u00FC\u0081\u00AA\u00B3\u0081\u00EA\x03\x03f\ruUdE\u00BF\u0081x\x07\x10/\x06\u00E2\u0097@\u00CC\x01-\u00BB@\u00F4+ \u00BE\b\u00C4\u00D3\u00818\x1DZ\u00DA\u00FEF\u00D6\f\x10`\x00-I?F\u00CA\u00CD}(\x00\x00\x00\x00IEND\u00AEB`\u0082"
  } 
} // END function __defineIcons



// Deutsch-Englische Dialogtexte und Fehlermeldungen
function __defLocalizeStrings() {
  
  _global.uiHead = { 
		en:"Color Script 1.0.8", 
    de:"Color Script 1.0.8" 
	};
                   
  _global.adjust = { 
		en:"Set", 
    de:"Einstellen" 
	};                 
                   
  _global.update = { 
		en:"Adapt", 
    de:"Angleichen" 
	};
  
  _global.check = { 
		en:"Check", 
    de:"Prüfen" 
	};
  
  _global.correct = { 
		en:"Correct", 
    de:"Korrigieren" 
	};
  
  _global.workingSpaces = { 
		en:" Working Spaces ", 
    de:" Arbeitsfarbräume " 
	};
                          
  _global.workingSpacesHT = { 
		en:"Working Spaces for the Active Dokument", 
    de:"Arbeitsfarbräume für das aktive Dokument" 
	};
  
  _global.colorManagementPolicies = { 
		en:" Color Management Policies ", 
    de:" Farbmanagement-Richtlinien " 
	};
                                    
  _global.colorManagementPoliciesHT = { 
		en:"Color Management Policies for the Active Dokument", 
    de:"Farbmanagement-Richtlinien für das aktive Dokument" 
	};
  
  _global.colorManagementPoliciesRGBDropdownOff = { 
		en:"Off", 
    de:"Aus" 
	};
  
  _global.colorManagementPoliciesRGBDropdownPreserveProfiles = { 
		en:"Preserve Embedded Profiles", 
    de:"Eingebettete Profile beibehalten" 
	};
                                               
  _global.colorManagementPoliciesRGBDropdownConvert = { 
		en:"Convert to Working Space", 
    de:"In Arbeitsfarbraum umwandeln" 
	};
                                                                                            
  _global.colorManagementPoliciesCMYKDropdownOff = { 
		en:"Off", 
    de:"Aus" 
	};
  
  _global.colorManagementPoliciesCMYKDropdownPreserveNumbers = { 
		en:"Preserve Numbers (Ignore Linked Profiles)", 
    de:"Werte beibehalten (Profile in Verknüpfungen ignorieren)" 
	};
                                                              
  _global.colorManagementPoliciesCMYKDropdownPreserveProfiles = { 
		en:"Preserve Embedded Profiles", 
    de:"Eingebettete Profile beibehalten" 
	};
                                               
  _global.colorManagementPoliciesCMYKDropdownConvert = { 
		en:"Convert to Working Space", 
    de:"In Arbeitsfarbraum umwandeln" 
	};
  
  _global.conversionOptions = { 
		en:" Conversion Options ", 
    de:" Konvertierungsoptionen " 
	};
  
  _global.conversionOptionsHT = { 
		en:"Current Conversion Options of InDesign", 
    de:"Aktuelle Konvertierungsoptionen von InDesign" 
	};
   
  _global.engine = { 
		en:"Engine:", 
    de:"Engine:" 
	};
   
  _global.intent = { 
		en:"Intent:", 
    de:"Priorität:" 
	};
  
  _global.useBlackPointCompensation = { 
		en:"Use Black Point Compensation:", 
    de:"Tiefenkompensierung verwenden:" 
	};

  _global.perceptual = { 
		en:"Perceptual", 
    de:"Perzeptiv" 
	};
  
  _global.saturation = { 
		en:"Saturation", 
    de:"Sättigung" 
	};
  
  _global.relativeColorimetric = { 
		en:"Relative Colorimetric", 
    de:"Relativ farbmetrisch" 
	};
  
  _global.absoluteColorimetric = { 
		en:"Absolute Colorimetric", 
    de:"Absolut farbmetrisch" 
	};

  _global.yes = { 
		en:"Yes", 
    de:"Ja" 
	};

  _global.no = { 
		en:"No", 
    de:"Nein" 
	};

  _global.placeGraphicsAgain = { 
		en:" Place Images Again ", 
    de:" Bilder neu platzieren " 
	};                             
                               
  _global.adaptPolicies = { 
		en:" Adapt Policies ", 
    de:" Richtlinien angleichen " 
	}; 
                          
  _global.adaptPoliciesHT = { 
		en:"Adjust color management policies for already placed images to the modified policies of the document.", 
    de:"Farbmanagement-Richtlinien für bereits platzierte Bilder an die geänderten Richtlinien des Dokuments angleichen." 
	};

  _global.moreInfo = { 
		en:"More Infos",
    de:"Mehr Informationen"
	};
  
  _global.adaptPoliciesInfo = { 
		en:"Adjust color management policies for already placed images to the modified policies of the document.\r\rCorresponds to following options when opening the document:\r\r1: »Placed content: Enable all profiles« for the policy »Preserve Embedded Profiles«\r\ror\r\r2: »Disable all profiles« for the policy »Preserve Numbers (Ignore Linked Profiles).«", 
    de:"Farbmanagement-Richtlinien für bereits platzierte Bilder an die geänderten Richtlinien des Dokuments angleichen.\r\rEntspricht folgenden Optionen beim Öffnen eines Dokuments:\r\r1: »Platzierter Inhalt: Alle Profile aktivieren« für die Richtlinie »Eingebettete Profile beibehalten«\r\roder\r\r2: »Alle Profile deaktivieren« für die Richtlinie »Werte beibehalten (Profile in Verknüpfungen ignorieren)«.\r\r" 
	};

  _global.placeGraphicsAgainActionTitle = { 
		en:"Operation", 
    de:"Aktion" 
	};

  _global.placeGraphicsAgainActionText = { 
		en:"Place all linked images and graphic files in the active document again.", 
    de:"Alle verknüpften Bild- und Grafikdateien im aktiven Dokument neu platzieren." 
	};
  
  _global.adaptPoliciesActionDescription = { 
		en:"Adapt the color management policies for all images and graphic files in the document.", 
    de:"Die Farbmanagement-Richtlinien für alle Bild- und Grafikdateien im Dokument angleichen." 
	};
  
  _global.placeGraphicsAgainDescriptionTitle = { 
		en:"Description", 
    de:"Beschreibung" 
	}; 
  
  _global.placeGraphicsAgainDescriptionTextPara1 = { 
		en:"If the Color Management Policies were changed in a document, this only affects to newly placed files. For already placed pictures the previously established policy still takes effect.", 
    de:"Werden die Farbmanagement-Richtlinien eines Dokuments verändert, betrifft dies nur neu platzierte Dateien. Für alle bereits platzierten Bilder gilt weiterhin die zuvor festgelegte Richtlinie." 
	};
 
  _global.placeGraphicsAgainDescriptionTextPara2 = { 
		en:"Beware of any existing EPS files with OPI links! (See help.adobe.com)", 
    de:"Vorsicht bei eventuell vorhandenen EPS-Dateien mit OPI-Verknüpfungen! (Siehe help.adobe.com)" 
	};

  _global.placeAllUndo = { 
		en:"Place Images Again", 
    de:"Bilder neu platzieren" 
	};
  
  _global.couldNotPlace = { 
		en:"Following objects could not be placed again:", 
    de:"Folgende Objekte konnten nicht neu platziert werden:" 
	};
                          
  _global.allPlaced = { 
		en:"images and graphics have been placed again.", 
    de:"Dateien wurden neu platziert." 
	};
                      
  _global.allPoliciesAdjusted = { 
		en:"The policies have been adjusted.", 
    de:"Die Richtlinien wurden angeglichen." 
	};

  _global.checkTabOverviewPanelHead = { 
		en:" Overview ", 
    de:" Übersicht " 
	};
  
  _global.checkTabRGBImagesPanelHead = { 
		en:"RGB Images", 
    de:"RGB-Bilder" 
	};

  _global.checkTabCMYKImagesPanelHead = { 
		en:"CMYK Images", 
    de:"CMYK-Bilder" 
	};

  _global.checkTabGraphicsPanelHead = { 
		en:"Graphics (pdf, indd, ai)", 
    de:"Grafikdateien (pdf, indd, ai, eps)" 
	};
  
  _global.links = { 
		en:"Links", 
    de:"Verknüpfungen" 
	};
  
  _global.images = { 
		en:"Images", 
    de:"Bilddateien" 
	};
  
  _global.graphics = { 
		en:"Graphics", 
    de:"Grafikdateien" 
	};
  
  _global.singleViewRGBTabLabel = { 
		en:"RGB", 
    de:"RGB" 
	};
  
  _global.singleViewCMYKTabLabel = { 
		en:"CMYK", 
    de:"CMYK" 
	};
  
  _global.singleViewGreyTabLabel = { 
		en:"Gray", 
    de:"Graustufen" 
	};
  
  _global.singleViewGraphicsTabLabel = { 
		en:"Graphics", 
    de:"Grafikdateien" 
	};
  
  _global.singleViewTabPanelRGBTabAllRGBLabel = { 
		en:"Images in RGB colors:", 
    de:"Bilder in RGB-Farben:" 
	};
  
  _global.singleViewTabPanelDocRGBProfileLabel = { 
		en:"Identical Profile:", 
    de:"Identisches Profil:" 
	};  
    
  _global.singleViewTabPanelDiffRGBProfileLabel = { 
		en:"Different Profile:", 
    de:"Abweichendes Profil:" 
	};
    
  _global.singleViewTabPanelNoneRGBProfileLabel = { 
		en:"Missing Profile:", 
    de:"Fehlendes Profil:" 
	};
                                                  
  _global.singleViewTabPanelAssignedRGBProfileLabel = { 
		en:"Assigned Profile:", 
    de:"Zugewiesenes Profil:" 
	};                                                
    
  _global.singleViewTabPanelCMYKTabAllCMYKLabel = { 
		en:"Images in CMYK colors:", 
    de:"Bilder in CMYK-Farben:" 
	};
  
  _global.singleViewTabPanelDocCMYKProfileLabel = { 
		en:"Identical Profile:", 
    de:"Identisches Profil:" 
	};
     
  _global.singleViewTabPanelDiffCMYKProfileLabel = { 
		en:"Different Profile:", 
    de:"Abweichendes Profil:" 
	};
    
  _global.singleViewTabPanelNoneCMYKProfileLabel = { 
		en:"Missing Profile:", 
    de:"Fehlendes Profil:" 
	};
                                                   
  _global.singleViewTabPanelAssignedCMYKProfileLabel = { 
		en:"Assigned Profile:", 
    de:"Zugewiesenes Profil:" 
	};                                                 
  
  _global.singleViewTabPanelGreyTabAllGreyLabel = { 
		en:"Images in Grayscales:", 
    de:"Bilder in Graustufen:" 
	};
     
  _global.singleViewTabPanelDiffGreyProfileLabel = { 
		en:"Embedded Profile:", 
    de:"Eingebettetes Profil:" 
	};
    
  _global.singleViewTabPanelNoneGreyProfileLabel = { 
		en:"Missing Profile:", 
    de:"Fehlendes Profil:" 
	};

  _global.singleViewTabPanelGraphicsTabAllGraphicsLabel = { 
		en:"Graphics Files:", 
    de:"Grafikdateien:" 
	};
  
  _global.singleViewTabPanelPDFAILabel = { 
		en:"PDF, Illustrator Files:", 
    de:"PDF, Illustrator-Dateien:" 
	};
     
  _global.singleViewTabPanelINDDLabel = { 
		en:"InDesign Files:", 
    de:"InDesign-Dateien:" 
	};
    
  _global.singleViewTabPanelEPSLabel = { 
		en:"EPS:", 
    de:"EPS:" 
	};

  _global.singleViewTabPanelFaultyLabel = { 
		en:"Not classifiable:", 
    de:"Nicht zuordenbar:" 
	};

  _global.imageColorSettingsPanelHead = { 
		en:" Image Colour Settings ", 
    de:" Farbeinstellungen für Bild " 
	};

  _global.imageColorSettingsHT = { 
		en:"Change Image colour settings for selected image.", 
    de:"Farbeinstellungen für das ausgewählte Bild ändern." 
	};

  _global.imageColorSettingsProfilLabel = { 
		en:"Profile:", 
    de:"Profil:" 
	}; 

  _global.imageColorSettingsRenderLabel = { 
		en:"Rendering Intent:", 
    de:"Renderpriorität:" 
	};

  _global.profileNotEvaluable = { 
		en:"Profile not evaluable", 
    de:"Profil nicht auswertbar" 
	};

  _global.useDocumentDefault = { 
		en:"Use Document Default", 
    de:"Dokumentstandard verwenden" 
	};

  _global.useDocumentDefaultWithoutProfile = { 
		en:"Use Document Default", 
    de:"Dokumentstandard verwenden" 
	};
                                             
  _global.withoutProfile = { 
		en:"(Without embedded Profile)", 
    de:"(Ohne eingebettes Profil)" 
	}; 
                           
  _global.noEmbeddedProfile = { 
		en:"No embedded Profile", 
    de:"Kein eingebettes Profil" 
	}; 
                                             
  _global.passProfile = { 
		en:"Pass profile", 
    de:"Profil übergehen" 
	};                                          

  _global.renderingIntentUseColorSettings = { 
		en:"Use Document Rendering Intent", 
    de:"Dokumentbildpriorität verwenden" 
	};
                                 
  _global.renderingIntentPerceptual = { 
		en:"Perceptual", 
    de:"Perzeptiv (Bilder)" 
	};
                                 
  _global.renderingIntentSaturation = { 
		en:"Saturation", 
    de:"Sättigung (Grafiken)" 
	};
                                 
  _global.renderingIntentRelColorimetric = { 
		en:"Relative Colorimetric", 
    de:"Relativ farbmetrisch" 
	};
                                 
  _global.renderingIntentAbsColorimetric = { 
		en:"Absolute Colorimetric", 
    de:"Absolut farbmetrisch" 
	};
                                 
  _global.renderingIntentNotEvaluable = { 
		en:"Not Evaluable", 
    de:"Nicht eruierbar" 
	};

  _global.changeColorSettingsOfSelectedImgae = { 
		en:"Change Color Settings", 
    de:"Farbeinstellungen ändern" 
	};

  _global.onlyForRGBAndCMYKImages = { 
		en:"This Action is available only for RGB or CMYK images.", 
    de:"Diese Aktion steht nur für RGB- oder CMYK-Bilder zur Verfügung." 
	};

  _global.vectorPoliciesChangePanelHead = { 
		en:" Vektor file Policies (PDF, AI, EPS) ", 
    de:" Richtlinien für Vektordatei  (PDF, AI, EPS) " 
	};
  
  _global.vectorPoliciesChangePanelHT = { 
		en:"Change color management policies for placed PDF, Illustrator or EPS files.", 
    de:"Farbmanagement-Richtlinien für plazierte PDF-, Illustrator oder EPS-Dateien ändern." 
	};

  _global.rgbVectorPolicyLabel = { 
		en:"RGB:", 
    de:"RGB:" 
	};

  _global.cmykVectorPolicyLabel = { 
		en:"CMYK:", 
    de:"CMYK:" 
	};
  
  _global.grayVectorPolicyLabel = { 
		en:"Gray:", 
    de:"Grau:" 
	};

  _global.containedImagesLabel = { 
		en:"", 
    de:"" 
	};
                                 
  _global.grayscaleImages =  { 
		en:"Grayscale images", 
    de:"Graustufenbilder" 
	};                              
  
  _global.vectorPoliciesChangeButton = { 
		en:"Change Policies", 
    de:"Richtlinien ändern" 
	};

  _global.honorAllProfiles = { 
		en:"Honor profiles and OI", 
    de:"Profile und OI berücksichtigen" 
	};
                                            
  _global.ignoreAll  = { 
		en:"Ignore profiles and OI", 
    de:"Profile und OI ignorieren" 
	};
                                            
  _global.ignoreOutputIntent = { 
		en:"Ignore Output Intent", 
    de:"Output Intent ignorieren" 
	};

  _global.notEvaluable = { 
		en:"(Not evaluable)", 
    de:"(Nicht auswertbar)" 
	};
  
  _global.changeVectorPoliciesHeader = { 
		en:"Change Policies of graphic file", 
    de:"Richtlinien für Grafikdatei ändern" 
	};
  
  _global.changeRGBVectorPolicyLabel = { 
		en:"RGB:", 
    de:"RGB:" 
	};
  
  _global.changeCMYKVectorPolicyLabel = { 
		en:"CMYK:", 
    de:"CMYK:" 
	};
  
  _global.changeGrayVectorPolicyLabel = { 
		en:"Grayscale:", 
    de:"Graustufen:" 
	};
  
  _global.changeVectorPolicyHonorAllProfiles = { 
		en:"Honor profiles and Output Intent", 
    de:"Profile und Output Intent berücksichtigen" 
	};
                                            
  _global.changeVectorPolicyIgnoreAll  = { 
		en:"Ignore profiles and Output Intent", 
    de:"Profile und Output Intent ignorieren" 
	};
                                            
  _global.changeVectorPolicyIgnoreOutputIntent = { 
		en:"Ignore Output Intent", 
    de:"Output Intent ignorieren" 
	};
  
  _global.onlyForPDFandEPS = { 
		en:"This Action is available only for PDF, EPS or Illustrator files.", 
    de:"Diese Aktion steht nur für PDF-, EPS- oder Illustrator-Dateien zur Verfügung." 
	};
  
  _global.show = { 
		en:"Show", 
    de:"Zeigen" 
	};
                 
  _global.moreOptions = { 
		en:"More Options", 
    de:"Mehr Optionen" 
	};
  
  _global.transBlendSpaceLable = { 
		en:"Transparency Blend Space:", 
    de:"Transparenzfarbraum:" 
	};
                   
  _global.refresh = { 
		en:"Refresh display", 
    de:"Anzeige aktualisieren" 
	};                 
  
	_global.refreshUIButtonLabel = { 
		en:"Refresh", 
    de:"Aktualisieren" 
	};
  _global.cancelButtonLabel = { 
		en:"Close", 
    de:"Schließen" 
	};       
  
  _global.activeTextModus = { 
		en:"Story editor is active!", 
    de:"Der Textmodus ist aktiviert!" 
	};
                            
  _global.objectCanNotSel = { 
		en:"Object can not be selected!", 
    de:"Objekt kann nicht ausgewählt werden!" 
	};  
                            
  _global.objectName = { 
		en:"Object:", 
    de:"Objektname:" 
	};
  
  _global.pleaseRefreshDisplay = { 
		en:"Please refresh display!", 
    de:"Bitte Anzeige aktualisieren!"
	};

	_global.colorManagementDeactivated = { 
		en:"Color management deactivated!", 
    de:"Farbmanagement deaktiviert!" 
	};

	_global.colorProofProfileHelpTip = { 
		en:"Color profile for the device to be simulated in the color proof settings.", 
    de:"Farbprofil für das zu simulierende Gerät in den Farbproof-Einstellungen." 
	};
         
} // END function __defLocalizeStrings