// =============================================================================
// OCTOPUS Starter
// =============================================================================
// Version: 1.0.0
// =============================================================================
__init();

var base_path;
var nu = [], old = [], updated = [], failed = [], show_imgs = false;
install();

function remove_old_version() {
  var panel_folder = new Folder(PATH_SCRIPT_PARENT + "/Scripts Panel/Octopus");
  var startup_folder = new Folder(PATH_SCRIPT_PARENT + "/Startup Scripts/Octopus");
  if (panel_folder.exists) {
    var files = [
      //     "CleanContentTypes.jsx",
      //     "Color-Script.jsx",
      //     "Dashboard.jsx",
      //     "Display-Config.jsx",
      "Display-Config2.jsx",
      //     "Display.jsx",
      "Display2.jsx",
      //     "Exporter.jsx",
      //     "Fontinstaller.jsx",
      "InDesign-Help.jsx",
      //     "OctoLock.jsx",
      "Octopus-include.jsxinc",
      //     "OpenType-Features.jsx",
      "Placeholder-Text.jsx",
      //     "Setup-Baselinegrid.jsx",
      //     "Show-Overflow.jsx",
      //     "UA/Add-Bookmarks.jsx",
      //     "UA/Add-Hyperlinks.jsx",
      //     "UA/Check-Alt-Text.jsx",
      //     "UA/Check-Articles.jsx",
      //     "UA/Check-Endofline.jsx",
      //     "UA/Check-Language.jsx",
      //     "UA/Check-List.jsx",
      //     "UA/Check-Tags.jsx",
      //     "Watermark.jsx"
    ];
    for (var i = 0; i < files.length; i++) {
      var f = File(panel_folder.fullName + "/" + files[i]);
      if (f.exists) {
        f.remove();
      }
    }
    if (startup_folder.exists) {
      var f = new File(startup_folder.fullName + "/Octopus-Installer.jsx");
      if (f.exists) {
        f.remove();
      }
      var f = new File(startup_folder.fullName + "/Octopus-include.jsxinc");
      if (f.exists) {
        f.remove();
      }
    }
    return true;
  }
}
function install() {
  try {
    var json;
    var _set = select_source( /* offer_offline_option */ false, /* offer_fileserver_option */ false, /* show_asset_list */false );
    if (!_set) return;

    remove_old_version();

    __writeJson(PATH_DATA_FOLDER + "/Sets/" + _set.set_name + ".json", _set);
    var configs = [];
    for (var m = 0; m < _set.configs.length; m++) {
      // Set-Info in die einzelnen Configs schreiben
      _set.configs[m].set_name = _set.set_name;
      _set.configs[m].base_url = _set.base_url;
      _set.configs[m].project_name = _set.project_name;
      configs.push(_set.configs[m]);
    }
    for (var n = 0; n < configs.length; n++) {
      configs[n].ix = n;
      if (!configs[n].hasOwnProperty("order")) configs[n].order = Infinity;
    }
    configs.sort(function (a, b) {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return a.ix - b.ix;
    })

    update_resources( configs );

    show_log( 
      [
        { a: nu, key: "nu-script" },
        { a: old, key: "old-script" },
        { a: updated, key: "updated-script" },
        { a: failed, key: "failed-script" },
      ],
      _set
    )
  } catch ( e ) {
    alert("Sorry\nAn error occurred:\n" + e.message + " on " + e.line);
  }

  return;

  function select_source( offer_offline_option, offer_fileserver_option, show_asset_list ) {
    var jsons = [ null, null, null];

    var w = new Window ( "dialog" );
    w.add("image", undefined, unescape("%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%01%C4%00%00%00I%08%06%00%00%00%A3%06V%AD%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD%7E%FC%00%00%20%00IDATx%9C%ED%9Dy%7C%14E%FA%FF%3F%5D%D5%DD%93%CCL%EE%84%84%00IH%C2%21JD%01%81%18%0D%A7%A2%E2r%EC%0A%BF%88%BA%08%AC%28%B8%8A%20%8A%17%04%8D%9C%82%A0%E2%0A%A2%8B%AB%C8F%F6%8B%F0%F5X%91%1B%03%E1%8ABP%E4%C8E%90%90@2IH%26%C9%F4L%CF%7C%FFH%26%CE%F4%F4d%26%17%E0%8Fz%BF%5E%FD%82%EE%7E%EA%A9%A7%AAk%FAIW%3DU%C5%D9l60%18%0C%06%83q%A3C%AE%B5%01%0C%06%83%C1%60%5C%0F0%87%C8%600%18%0C%06%98Cd0%18%0C%06%03%00s%88%0C%06%83%C1%60%00%60%0E%91%C1%600%18%0C%00%CC%212%18%0C%06%83%01%809D%06%83%C1%600%000%87%C8%600%18%0C%06%00%80%BFZ%19%A5dm%8A6%D4%1A_%BBRW%D7%B7%B4%C6%18C9%8E%17%29%AF%07%80%12c%15DJk%7Dx%C1%D4%D1%CF%FF%B8%9F%C6%27%D3_%E3%F3%C1%C6%BE%0F%9D%BBZ%F61%18%0C%06%E3%C6%86k%EF%95j%C6%1FIO%CA5%94%AE%AF%A8%AB%89%1B%1E%D7%13%09%11%91%88%0D%0EU%95%CD..%C2%89%E2%0B%F5%FF%96%14%A1s@%60m%F7%90%0E%DBB%B4%BA%E5_%F4%9F%90%D1%AE%862%18%0C%06%E3%86%A6%5D%1D%E2%E8%83%1Bff%16%E6/%9F%9D4%8C%24DD6%3B%FD%96%93%D9%D8p%FC%08%00%A0kPHq%A4%7F%C07%DB%92%26Mmk%3B%19%0C%06%83%C1h7%87%98%92%B5%29zg%EE%E9%BC%F9C%EF%23%EE%BE%08%BD%21%CFP%8A%15%FBwa%D6%9DC%B1%3D%E74%7E%BAx%5E%BA%25%3Cr%C57%89%8F%BE%D4%86%E62%18%0C%06%E3%06%A7%DD%1Cb%EFoW%5DL%8C%8A%8D%18%D3+%A1%D5%BA%B6%E7%9CB%9E%A1%0C%D3%EE%B8%13F%C9%845%87%F7%A3%A0%C2Pq%5B%C7%CE%0F%B2%AET%06%83%C1%60%B4%05%ED%12e%3A%FEHz%D2%CF%25%17%232%0B%F3%B1%E5d6%8C%92%A9U%FAF%C4%F7l%D4%A1%135%98%954%14S%FB%25%06f%15%15%FEp%F7%EE%0F%F7%B4%81%C9%0C%06%83%C1%B8%C1i%17%87XVc%9C%3D%F1%D6%7EX2r%B4%DB%00%9A%E6%12%AE%F7s%3AO%88%88%C4%7B%0F%8EGT@Pr%97%CD%8BkR%B26E%B7IF%0C%06%83%C1%B8%21i%17%87Xc%96bzGt%02P%EF%B8r%0De%C8%2C%CCo%95Ne%D7%EB%8A%8C%5Dx%7D%D7w%E8%A0%F7%C3%D3%03%93%7D%0F%9E/%C8%1Dwh%E3%84Ve%C2%600%18%8C%1B%96vq%88%A55%C6%18%C7%A8%D2%84%88Hd%16%E6c%7B%CE%A9%16%EB%D4%89%1A%00%C0%9A%C3%FB%B1%3D%E7%14zGDB/%8A0J%122%0B%F3%B1l%E4hz%EAr%F1z%F6%A5%C8%600%18%8C%96p%D5V%AA%99%954%14%81%3EZl8v%A4%C5%3A%F2%0C%A50J%26l%FD5%1B%23%E2%7Bbb%9F%FE%28%A9%AE%82%5E%14%A1%135%981%F0n%9F3%A5%97v%B6%A1%D9%0C%06%83%C1%B8Ah%17%87%18%1D%18lT%BB%DE%BFs%14b%83C%5B%FC%A5%18%1B%1C%8AYIC%F1%DA%90%FB%00%D4%8F+%3E%D2%A7%1F%00%C0%28%99%10%1B%1C%8A%60_m%1C%FBJd0%18%0CFsi%17%87%98_%5E%DA%C9%DD%BDAQ%5Dq%A2%B8%08%5BNf%B7X%BFc%80M%B5%24%21%F3%7C%3E%96g%ECn%D4o%A85%BE%D6b%E5%0C%06%83%C1%B8%21i%17%87H8R%D1%D4%FDYIC%A1%13E%3C%FD%D5%17%C8%2C%CCGvq%11J%AA%ABZ%94W%B8%DE%0FK%EE%1D%8Diw%DC%09%A0%7E%BC%B2%D4h%1C%DC%22e%0C%06%83%C1%B8a%B9f%BB%5D%C45L%C7%C8..j%95%9E%3CC%29J%AA%AB%1A%BF%1Au%A2%06%F6E%C3%19%0C%06%83%C1%F0%96v%DB%ED%C2%28%99%1A%23C%95l%CF9%85%13%C5E%98u%E7%D06%99%A7%98k%28%C5%F6%9C%D3%18%14%D5%15%E1z%3Ft%D0%EB%EBZ%AD%94%C1%600%187%14%ED%E2%10%3B%FA%F9%1F%CF5%94%25%BB%5B%D0%7BD%7CO%8C%88%EF%D9%26y%C5%06%876%3A%D5%3CC%29Vd%ECB%95d%EA%DC%26%CA%19%0C%06%83q%C3%D0.%5D%A6A%BE%DA-%27%8A/%B4%87%EA%26%B1G%A1%16%94%97%D1%AB%9E9%83%C1%600%FE%D0%B4%8BC%D4%0A%E2%97%99%E7%5B%B72MK%29%A9%AEB%7CHX%93A%3D%0C%06%83%C1%60%28i%17%87%B8%B1%EFC%E7%B4%82X%DC%DA%80%19%00%AD%5E%F2%8D%C1%600%18%0Coh%B7%A0%9A%D8%E0%D0%25%3BrN%BD%ED%ED%C6%C0%D9%C5E%D8%91s%0Ay%E5%A5%D0%09%1A%0C%8A%EA%DA%18%24%93Y%98%8FAQ%5D%1Be%B7%E7%9CBBD%27%97%05%BF%EDt%F4%F3%3F%DE%26%85hG%B8%05%B3%FA%00%08%040Xq%EB%18%80%02%DB%FC%15%C7%AE%BAQ%8C%AB%0A%B7%60%D6%60%001%0D%87%23%C7%00T%008f%9B%BF%82%F5v0%18W%89v%DB%0F%11%00%BA%FD%EF%F2%F2%99%89%83%03%EDA/F%C9%84%5CC%19%9Ar%92%9F%1C%3E%88wo%7F%10%DB%8B%CF%E2%C3%B3GPf%AA%C1%F0%F8%1ENA8%5BNfcG%EE%29t%D6%05%A2%7Bp%18N%19.%C1%02%1B%06E%C5%C0%28I%28%AE%BE%F2%DC%D6%81%13W%B6%5B%C1Z%08y%7Dv%0C%805%00%92%01%A8%87%E0%FE%8E%11%C0%7F%00%A4Z%E7-/hG%9B%06%3B%9E%5B%E7-%DF%D3%5Ey1%00%F2%FA%EC%3E%00V%03H%F42I%ADu%DEr%AD%8A%9E%C1%8E%E7%7F%84%E7%D6%D0%FEc%1C.%15%B4g%DBf0%9AK%BB%CEC%EC%1D%1E%F9%E4%8A%FD%BB%1A%CF%D7%1C%DE%8F%B8%E0%90%C6Uj%94%FB%24%1A%25%13n%F2%0B%83%00%0E%87/%16b%F7%B0%A9%B8%25%24%C2%25%22uL%AF%04%8C%8B%BA%05%ABn%7F%00%1F%DE%3E%06_%DD%FD%28%3A%EA%FD1%22%BE%27%CE%96%5D%92%AEGg%C8%BF%F1%FClJH%0E%25%E4%1EJ%88%86%12%02%0F%87%8E%12%F2WJH%B6%906gR%7B%D8%24%A4%CDI%A5%84%ECv%3A%5E%9F%BD%A6%3D%F2b%00B%DA%9C%19%94%90%9F%28%21%89%5E%3C%7F%FB%E1+%A4%CD%E9%A3%D0%E3%F2%DC%F87%9E%DF%7E%AD%CA%E5-%94%90%7C%85%DDl%3C%84q%5D%D1%AE%0Eq%F3%80%94%F4N%FE%81%7B%95%CB%B4%19%25%13%B6%E7%9CB%B5%249%5D%D7%89%1A%C8%B0%A2B%AAC%85T%3F%95%F0%96%E0%08%17%BD%D9%C5E%18%D21%163%0F%7D%8D%82%EAr%04%8A%BE%90%243%8C%92%09%95uu%E7%DB%AFD-CH%9B%13%C3S%BA%8C%12B%9B%F1%22%B4%1F%7E%94%90U%3E%0B_%8Cik%BB%D4%F2%E38%AE%AD%B3a%00%F0Y%F8b%0C%25de%0B%9E%3F%28%21%81%8E%BA%D4d%C8%1F%E0%B9%A9%D9%CD%60%5CO%B4%7B%8B%DC7%E4o%83%BF%3D%F3K%ED%86cG%D0%3B%22%12%07%0A%F3%D1A%EF%87%CC%C2%02%D51%C0%AD%E7N%E2%82T%85%D4%DB%86c%BF%A1%10%27%AB.%B9%C8%C4%05%87%E0%8Bs%270%29%BE/b%F4A%C8%A9.%83%28%0A%D8%9Es%1A%11%7E%FE%9B%DA%BBL%CD%85p%DC%3AJ8%8E%12%0E%CA%83%E3%00%0E%BF%1Fj2%94p%FE%94p%93%DA%DA.u%7B%AE%FF%17%EB%1F%11%8E%C3%DF%29%E1xe%7D%13%C29%3D%7F%FBA%B8%DF%9FO%DD%CBK%F68%EAR%7Bn%84%5C%FF%CFM%CDn%06%E3z%A2%DD%82j%1CI%8A%8E%BB%E9%BB%B3%BF%E6%3Cv%DB%1D%FC%A5%EA*%F4%8E%E8%04%BD%28%AA%CA%BE6t%24%96%1D%CB@Yu5%FAGEcb%9F%FE.2%3AQ%83%9B%BAt%C2%8E%F3y%F8%F1%A7%8B%B8b%93%F0p%9F%BEX%BCoG%CD%D1%7B%A6%BF%D4%DE%E5i.%02%25w*%FF%1A%B6%D9l%17e%AB%F5%BE%DA%97%964%06%00q%0Bf%05QB%5E%F4%11%84%17U%5E%16%83%9B%CA%23%60%E9%CB1p%0D%CE%B0s%AC%F2%85%85.%C1%19%BC%CA_%E8%16Nn*%1B%B5%7C%ED%C1ANT%BE%B0p%8F%17i%07%BB%93w%BC%D7%80j%19%DA%1B%15%3B%EC4%CB%1E%02%24%28%EB%5B%B6Z%0BjL%D20%DB%FC%15yJyn%C1%ACX%00%B1%22OoS%DES%7BnhF%2C@%13e%F2%EA%B9y%A9%BB%A0%F2%85%85%05%8E%F7T%EDn%9E%EE@%00%7D%94%D7%DB%D3f%C6%8DE%BB%06%D582%EE%D0%C6%09%19%E7r%3F%F7%D3h%C8%AC%3B%87b%CD%E1%FDX2rt%9B%E97J%26%2C%CF%D8u%2Cs%F8%93./%90k%8D%FF%D2%97m%3Cuy%19%8C5%CCN%DB%A2%26%EF%B3%F0%85%FDZ%8D%A8%0C%BA%D8k%98%9D6X%29%1B%B0%EC%E59%84%E3%5E%E58%CE%DF%83%19%9F%18f%A7M%02%80%C0%B7%5E%F9%27l%B8%9B%E3%10%EA%29%9Dl%B5%5E%AC%9C%B3%D0%29%0A*x%F9%AB16%9Bm9%C7q%F7%03%F0q%97%D6j%B5%E5%C96%EB%ABU/%2C%DA%A8%BC%E7%B7%F4%A5%AF%04JG5%CA%DAlg%08%C7%0D%90%AD%D6%8F%29%21c%D5%F4%D9l%B6%1F9%8E%FB%B3avZ%81%93%AE%25/%D9%04%DEe-%86%DB%0C%B3%D3%9C%22u%B9%05%B3%5E%0C%D2k%17+%E4%B6%1Af%A7%8DQ%29%DF%87%1C%C7%0DwW6%00%B0%01%26%93d%BE%A7%E6%A5%25%FB%9A%92k%B0q%BB%C0S%A5%3E%B7m@%8D%E6%3C7%AB%CDVV%F1%FC%9B%8D%EB%22%EA%97%CC%1D%25%F2%FC%264%F1%BC%EC%D8l%B6%1D%1C%C7%BDi%98%9D%B6G%C5%86%D3%84%E3%BA%DB%CF-%B2u%E7%95%17%16%0E%0F%7C%EB%95U%1C%C7%3D%C9%01%22%00%98-%F2%8E%AA%17%17%8D%D0/%99%3B%8A%27t%95%0D%10%28%E1%BAxQL%97%3A%09%7C%EB%95%19%00%5E%21%1C%D7%B1%09%9B7s%1C7%5B%D96%D4l6%CB%F2%D7%02%A5%8FZm%B6%B7%09%F7%7B%CF%8B%DDf/ld%FC%7F%CAU%EB%C4%DF%3C%20%25%3D%29%3A%EEaI%96kW%EC%DF%85%12c%95%CB%16PF%C9%D4%E2%5D/r%0De%10%28%ADl%0B%5B%DB%1AB8%B5%F1%13%B7_%17%1C%C7%FD%EC%CDxK%D0%5B%AF%1C%15y%7E%29O%A9%BF%A7q%28%C2%91%C6%C8%24%81%D2I%02Oc%BDI%C7%29%5EBao%CF%EBC%099%C9S%3A%8E%12%E2%D3TZ%81%A7%B1%3E%82%F0y%C0%B2W%BEr%A9%13%8ES%A6%8D%04%B0G%E4%F9%B1%EE%F4%F1%94%DEN8%EEh%D8%DB%F3%9C%C7%D4%A8%E7q%B7FY%0Fr%0E%E5%1B%EE%A9nxB4%84%10%D7.%0C%15%DC%B4%01o%92%3A%D6%D9%DD%DE%3E7%81%D2%10%C7%B4%02%A5%E3%3D%3D/%87z%1EN%09%D9%1D%F6%F6%BCI*6%F0%CE%B2%A4%7B%C8%8A%D7%F6%0B%94%3E%C3%13%22%3A%3E%7B%00%90%AD%B6%07%05%9E%C6%8A%3C%ED%E2%E5x%A9%D3%17%60%D0%5B%AF%1E%10%28%7DO%A0%B4%A3%07%9B%C7%11B%7E%0D%7B%7B%9E%CB%17%A4%D2fJH%0C%C7q%7B%05J%279%FDFX%17%EE%0D%CFU%1D%D5%DE%3C%20%25%FD%FC%B8%B9%DA%F8%90%B0%8F%3A%FB%07%E6%EE%CA%3BS%F1%CC%D7%FF%A9xb%CB%C6%DAI%FF%F3%19%3E%3Bv%D4%25%F2%D4%13y%86R%00%F5%DB%3E%19%25%E9%BA%5C%C3%94p%EA%3Fb%F7%F2%9E_%9E%FEK_%9E%AD%11%84%BE%5E%BEd@%08%E7kO%EBm%1AZ%EFH%95e%F9%8E%12%E2%DB%1C%1D%BE%A20%CA%7F%E9%CB%B3%9B%AA%13%81R%BD%C8%F3%B7z%F1%B2%0E%E18nzK%EB%D7%93%1C%E1%B8e%CD%29%9F%B7%C1%2Cj6%12%8E%5B%12%B1*5%C6+%05nlo%EAp%CA%BF%99i%1B%8E%D5%11%ABR%9B%0C%E8%E1%09%0D%13%28u%89%9A%E58%AE%BC%A1%3E%5Blw%D0%5B%AF.%D5%08%FC%20o%D3%F1%84%F8%10%8E%DB%E5%C9f%0D%CF%F7%14%28M%F0%D4%D6%197%1EWe%0CQ%C9%B6%A4IS%1D%CF%07%ED%F8%E0%A7G%FA%F4%EF%E3%CD%CE%17%CA%5D42%0B%F3%1B%17%F7%0E%F0%F1%E9%92%92%B5%29zc%DF%87%CEy%D2%F3%C0%81O%17U%99%EA%06%01%80@hy%07%BD%DFLo%D2%B5%04%DA%F0u%E0-%1C%E7Y%5E%E4%E9%D3%EEd%24%8B%C5%21%EF%86%17%94%CD%D6%18%9D%C4q%DC9%C2q%D1%DE%D8B%89%B5q%E7%90N%EF%BE%3E%98%A7%24%BC%A9%3CyJU%9D%04O%E94%00%CB%ED%E7%A4%892%CAV+d%AB%15%22%EF%A6yZ%AD%7F%05%B0%F0w%1B%BD%AF_Or%94%D2%24%A5%F5%16Y%96%CC%B2%7C%84%03W%0B%00%1C%C7E%11%C2%85%F1%84%04%D8l%B6jo%F2%E58%CE%A0%92ww%00%F9%1D%DFY%F0%9B%CDf%5BL%09%D9p%E1%EF%F3%DC%F6%1CPB%EA%BC-%A7E%96%9DB%B8%ADV%5B.%15%08d%AB%15V%9B%AD%5C%21%EE/P%AA%B6%FE%AF%16%C0%18%00%EB%1Dlp%AACJ%D4%BB%60%CD%16%B9%BCA%FEbs%DA%3E%EA%17%25%00%00%F0%94%3E%A4%96%D6%2C%D7%EB%E6%00%1DO%A92%18%21%C8%93%CDp%F3%DE%FB%23D%EA2%DA%97k%E2%10%1D%19%7F%24%3DI/j%9C%9C%E1%9A%C3%FB%1B7%FC%05%EA%A7Y%D8%27%F3o9%99%AD%1Ah%03%00%7D%3Av%16%7F%B9t%F15%00SU%05P%3F%96YXY%FE%F1%FD%DD%7Bi%ED%AB%DFd%17%17%E1%D3%9F%0E%8F%1Awh%E3%23%9B%07%A4%A4%B7E%B9%1C%B1%7F%1Dx%0B%07%CF/xJhg%A5%8Cd%913E%9E%DE%7F%F9%B9%D7%9D%5E%AA%DC%82Y%C3%BB%84%06%1F%B5%9F_%7Cf%7E%0C%00D%ADNK%050%DFQ%B6%BC%BAfm%D5%8B%0B%A7%A9%E7I%06+%AF%99-%B2l%A86%FE%C5%F4%CA%D2%C6q%9F%C8w%5E%DF%C6Sr%8F%A3%9C@iW%C7s%A2%E2%C4l6%9B%5C%23Ic%CAf%BD%F1u%83%DDAa%FE%7E%3F%FA%88B%8C%B3%9Cs%BBmN%FDz%92%E3%09qy%C1%17%19*%22l%F3W%28%9DH%B3%B0Z%AD%AB%29%21%E3Um%02%3A%03x%0F%C0%7B%91%EF%2C8%CEq%DC%87%94%90%0D%853%5Euz%8E%C5%CF%A6%DE%0C%A8%3F%B7ZI%DAq%F9%B9%D7%DD%8E%7FU%18k%DE%A90%D6%BC%E3%AE%1C%BA%C5sW%05%E8%B4%CF%A8%04%BE%C48%9E%B8%ABk%C9%22%97%1B%EB%EA%16U%BD%B8h%99%E3%F5+/%2CL%05%90%DA%60%B7K%C0B%E1%8CW%DDz%21%91%A7Q%CA%BCd%AB%F5%E9K3%17%AC%B6%9F%87%ACx%ED+%9DF3%CAQ%C6%22%5BS%E0%E0%10%DD%D9l2%5B.%D7%98L%CB%9463n%5C%AEy%1F%C1%E9%D2%92/%1D%1D%5C%9E%A1%14%3F%5D%3C%EF%F4%D7%AD%E3%CE%19%CA%B9%8B%8E%EB%A5%8E%88%EF%89%F3%15%E5%13S%B26%A9%7E%FD%DC%9B%B1%7E%5D%95%A9%EE%DFo%0C%7F@%EB%B8%14%5CBD%24R%87%DD%C7_%AC%BA%B2%AA%95%C5Q%A5%B9%E3G%1C%E7E%D7%1Eq%19%17%81%AF%28%3C%AC%7C%89%02%80m%FE%8A%1Dj%D7%D5%F2h%EA%8Fd5y%B3%2C%EFqt%86%00%A0%11%F8i.%DDQ%84Sub%8E%87d%91W%D8%9Da%83%DD%E5%16Y%FE%ABk%BE%CEF6%A7%7E%3D%C9%A9%DD%EF%12%1A%FC%94%FBZ%F1%8E%8A9o%EE%93%2C%96%A3%9E%BA%FD4%82p%AB%C8%F3%EFQB%CA%BB%BC%F7%C6%E7%DE%96%C1Sw%9Fm%FE%8A%F2%A6%9C%BAq%EE%E2gkM%D2%1E%CF%F5%E3Z%D7%B2%D5Z%5E%FC%EC%FC%60O%8E%A59%BF%01%00%10y%9E%28%E5/%FC%7D%DEjG%19C%95%F11%95%F6%11%EF%C9f%B3%2C_.%99%99%DA%819C%86%23%D7%D4%21%0E%DB%FB%F1%97%03%BBt%0Du%9C%8F%F8%DD%D9_M%F1%C1a%DF%3A%06%D78v%91%EAE%B1q%DC%10%00J%8CUNN%F1%AF%B7%0F%F4%F9%B9%A4%E8%A02%AF%7B3%D6%AF%B3ZmSf%25%0Dm%BC%E6%A8G%27j%90%10%11%19%3E%FEHzR%1B%14%CD%09J%08x%EAz%B8%83p%9CGy5%9D%F9O%BD%5C%D0%1C%BB%D4%F2h%AA%DBHM%DE%22%CB%B9J%B9%FC%A7%5E.P%CA%A9%BDX%952%FEZ%9Fo%95%BA%0C%CF%A7%EDs%D1%E5E%5D%B8%AB_Or%84p%E5%CA%FB%1A%81%7F3%FA%FD%B4_%22%DFY0%BB%DB%DA%C5%AA%C1%3A%DEP%FClj%FFZIJ%B5%C8r%91%9A%1D%CA%C3G%14R%A2%DFO%DB%ECM%19%9A%3B%A7%AF%DB%DA%C5%83%1D%8E@%00%B0%D9lg%3C%B6%3B%95%FB%B2%D5%3A%D7%9B%3C%9B%F3%1B%F0V%DE6%7F%85%CB%F3ri%1F*zjM%D2%14olf%DCX%B4Y%97iJ%D6%A6%E8%0BW*%3E%E9%19%16%1E%01%00e5%C6%EF%FF%E7%8E%94g%DC%C9%8F%3F%92%9ET-%99%1E%18%D3+%A1%F1Zvq%11*%EBj%0F%06%F9j%F7%96TW%8D%B1%3BJ%C7@%9B%DE%11%9D%B0%3D%E74%A6%DDQ%DF%C5%1A%1B%14%8AO%7E%3CX%F7%FA%F0%07%7C%1A%9C%1AF%C4%F7%8C%E8%BBmuN%F7%D0%0E%C3%00%A0%A0%BCl%CB%A0%A8%AE%7D%ECK%C0e%17%17%E1%ABS%27%0C%3AQ%FCR%B2%C8CFv%EF%15%9B%10%11%89AQ%5D%F1qVf%1A%3C%CC%F9k.M%8D%97%A9%E1%CD%18bsu%AA%A1%96%BE%A9%89%F9%CD%91w%F9%A2%E5%D4%BF%EA%BCA%29gUL%15jN%5DxQ%AF%BB%29%21%E3%94%D7%7DE%B1%97%AF%88%B7%00%BC%15%B7fQE%ADI%FA%BC%E8%99%F93%BC%CA%D4%81%E2gS%17%00X%10%F6%F6%BC%18JH%AA%8F%20%24+%BB%84%15%F9%BALAQ+%837%11%92%DD%D6.%7E%99%E3%B8Y%84%E3B%94%3Az%AE%5B%8A%88%A0%00%8F%3A%D4%BE%EC%8A%9FM%5D%EB1%21%3C%D7%BD7%F2%3D%D7-u%E9v%F5%D4%3E%D4l%AE%98%F3%A6K%E43%83%D1%26_%88%E3%0Em%9CP%5E%5BstB%EF%DB%93%13%A3b%7B%24F%C5%F6%18%1A%DB%FD%EF%233%3E%F9%CE%5D%9A%D3%A5%25_%CE%B9k%98%E0x-%3D%3B%ABr%DF%90%BF%0D%06%9C%BF%DE%80%DF%BBF%F5%A2%88%1D%B9%A7%1A%AF%0F%8A%8AA%80%8F%EF%A9e%3F%EC4%DB%AF%8D%88%EF%89%C9%7D%07%C6%15%94%1B%0AJ%AA%AF%9Cy%A4O%FFFg%B8%E1%D8%11%7C%7F%F6%D7-%19C%9F%08%D9%964i%EA%EE%C1S%E2%B2.%14V%02p%BB%7BFkq%D7%3D%E6%0Eo%A2L%9B%DB%FD%E4%AD%5DM%7D%216G%DE%93%7D%AD%8A%0C%E5%3C%D7EK%BBLE%9E%9FM8%AE%B6%A9nM%1FA%08%0C%D2%EB%A6G%ADN%3B%E1%B6%B2%3Cp%F9%B9%D7%0B%8A%9FM%9DT0%FD%95%AE%94%90%A0%1A%93%B4%CC%22%5B/%AA%E5w%F3%C7o9M%25hI%97i%8F%0F%97%7C%25%F2%FC%9B%02%A5%21M%95%CDc%BBSyn%DE%D2%DC6%DB%5C%3B%DD%B6%8FV%D8%CC%B8%B1hu%CBH%C9%DA%14%7D%A6%F4%D2gS%FB%0D%0Am%08N9%F4qV%E6%DE%CC%C2%7C%04%F9j%07%AB%8D%E7%DD%BD%FB%C3%3D%0F%DF%DA%3F%D4%B1+t%CD%E1%FD%88%09%0A%99%06%00%5B%07N%5C%A9%9C%7EQR%7D%05%00%10%1B%1C%0A%A3%24a%7BN%BDSL%8C%EA%8A%A2%AA%CA%5E%9D%FC%03%1F%7D%FF%D0%0F%8D%89b%83C1o%E8H%CC%B9k%B8h%0F%D8Y%91%B1%0B%97k%AA%3F%DA%99%3C%D9%E9%AF%EE%F3%95%E5%F9%F6%FC%82%7C%B51%AD%AD%13%25%DE88G8/%E4%D5t6%17%B5%3C%3C%7D%21z+%EF%C9q6%A7N%5Ct%29%C7%10%5B%A1K%29%F7%CB%E4%E7%0BxJ%23-Vk%9A%CDfSuP%F6%23P%A7%BD%25t%C5%BC%07%DDV%98%97%FC2%F9%F9%8A%C2%19%AF%BE%903mn%A4%D5f%BB%A4%92W%AB%D62MX%BF%A2%8FF%10F%B5%D4%C18%A26%5E%EB-W%CB%21%BA%B4%8FV%D8%CC%B8%B1hu%97%E9%A5%EA%AA%95O%0DH%E2%AB%25%09%D9%C5%17%8E%09%94%D6%99ek%CF_/%97%E4N%EE%3B0n%F3/%C7W%02ht@%A3%0Fn%98%19%15%10%94%EC%B8%05Tvq%11%0C%B5%C6%BD%FB%86%FC%AD1%C2S9A%3F%CFP%D6%F8%FFaq%3D.%EC+%C8%0D%1A%11%DFS%AB%135%18%D9%AD%97%F8%EB%E5%E2%A7%82%7C%B5s%E7%FCw%CB%B2%E7%EF%1A%C6%3B%7E%ED58jK%5CH%E8%9C%AD%03%27%AE%BC%7B%F7%87%7B4%94O%26%84%3B%AE%134%8B%04J+%3DmK%D5%1AH3%7F%84%5Eu%99%B6%C1%0F%5B-%BD%CEG%E3%B6%12%D4%E4%BD%EE2U9%F7%D6%7E%A5%9C%9Anot%89%3C%EF%EB%8D%5C%F6%A4Y%15%00%5E%03%F0%DAm%FFZ%19h%96%E5%89%16Y%9E%E8+%8A%83%94%B2%1C%C7%8D%02%D0f%DDo%84%E3%AA%29%21%1D%9A%92Q+%83%B2%7E%1D1%99-%B3%B4%1A%E7%D9%095%26%29%EBJm%ED_.%3E3%BF%00%A8_*%AESH%D0ga%FE%7E.eT%E6%DD%D2v%D7%DCtj%F2%3F%3D6%B3%D9s%23%98%13dxK%AB%5BI%8D%D9%3C%2868%14y%86RH%B2%EC%D7%AFST2%25%9CA%27%8A%BF%85%EB%FD%60%B6%CAAv%D9%94%ACM%D1U%A6%BA%25%8EQ%A5F%C9%E4%D4UjG%92e%A7%F9%5Du%16sc%1F*%07t%0A%D1j7f%16%D6%EF%1E3%A6W%02%CC%B25%B9%DAdJ%EE%1D%11%19%BF%E6p%C6%B1%0F%0Eg%9C%FB%E0p%C6%B9%B9%DB%B6%96%7E%7F%F6%D7-%BD%23%22%E3%B7%0E%9C%B8%F2%81%03%9F.%EA%D7%29*9%5C%EF%07%AB%D5v+%00%A7%09%E3%17%AB*%DB%FC%97C%08W%BF%9A%8A%F3%11%E3N%9E%12.IE%DE%A3%CE%7E%1B%DEq%ABS5%1F%95%3C%04%9E%BA%B7KE%DEO%EBs%B3R%AE%DF%86wb%94r%AA%7F%B5+d%EA%CC%E6%C9J%5D%5D%3FX8%CAU%97%E7%BA%A0%D4u%A5%9A%20%BD%F6%21O%F5%AA%E4%A7%C7fV%FC%FC%F8%EC%D5%A7%A6%BE%90H%29Y%A5L%DB%D6S%D7%08q%B5O-HD%E5%B9E%B9%D3%C9%F3%A4%AF%CAs%7B%DE%EE%0C%01%C06%7FE%9E%D5f%CB%F1%DC%EE%9AW%7F%9E%ECn%AA%CD%BA%91ovPSklf%DCX%B4%BAeXm%D6%60%A0%7E%CCO%27%8A%BF%E9E%0D%08%C7%5D%AA6%99%FAd%17%17A%20%B4%1C%A8w%86%E7+%CB%7F%9C%3E%E0.%A7%3FU%97%FD%B0%D3%1C%1F%126J%A97%D0%D7%B7%CC%F1%FC%B2%B1%BAqY%B6p%BD%1Ft%82f%FB%7F%7E%FE%A9%CE%DE%D59o%E8H%C4%87%84%8D9%7D%B9%E4%B8V%10%0B4%94%7Fd%EB%C0%891%C7%EF%7B%26lg%F2%E4%B1%F6I%F7%95u%B5O%24DtB%AE%A1%F4%98%C8%F3%8BO%94%14u%03%EC+%DD%98%E0%C3%0B.%0B-%B7%16%0E0%BA%ECN%C0%E1%1F%BD%D7/%9F3%60%E3%BB%8D%3F%F0%90%15%AF%F5%89%7E%FF%CD/%3A%87%06%F5%F2%B43%80%DA%7D%D9*o%1B%B0%F1%DD%18%A7%BC%17%CC%0A%8A%7Cw%C14%E5uw%3A%02u%BE7%87%AFJU%ED%06T%93%0F%D0%FA%0C%0A%5D1o%A2%5Df%C0%C6w%03e%ABu%83%8A%AC%C5QW%7D7%A7%F3%A1%F3%11%1F%EE%B9ni%8A%5D%A6%F3%7Bo%C4%E8%7D4%1F%B7%A4.%00%DBr%7B%99%B9%05%B3%82%22V%A5%AE%F1%A6%5E%9B%C6%A6q%7D%8E%DE%A5%8Fz%3F-%25%FA%FD%B4%D9qk%16%3D%E1N%A6%FB%87K%96j5B%AC%17%E5%3D%A6%BC%EF%E7%AB%E9%16%F5%7EZ%8A%9A%5E%81R%1F%A5%BC%C9lv%9A%CC%DB%F9%BD7bB%FD%F5%13ZV%D7%DEa2%9BU%DA%AC%F5%5Dw%F2%B2U%B6*%E5-%B2%9C%EE%F8%9BQ%E2%D8%7E%DA%C2f%C6%8DE%AB%BBL%23%FC%FC%8B%00D%03@%84%DE%FF%D5%CC%C2%FC%1F%9E%19%94%9C%7C%A00%1F%DF%9E9Y%D3-%24l%26%00%9C%AF%2C%FFoJB%DF%60%C7q%C3%F7%0F%FD%60%EA%E4%1F%F8%D7/%FAO%C8%18%B6%F7%E3/yJ%CA%94%AB%D8%00%F5%DD%A7%81%3E%BE%27%B2%8B%8B%E2%12%22%22%D1%3B%A2%13v%E5%9D%1E%D13%2CbR%EA%CE%FF%7E%96%3A%EC%3E%5E%27j0%A6W%02%C6%F4J%08%C83%94%8E%D9r2%7BL%D2%AE%B5%BFF%FA%05%3C%F1E%FF%09%19v%5D%A1Z%7Dpv%F1%05%04ku%DF%7D%93%F8%E8K%29Y%9B%3E8%5Bv%F9%24%00%1C%28%CCG%A8V%FF%8F%D6%D6%89%92Z%C9%BC7%D8Ow%BF%E2%B2%8F%9F/%5D%0A%60ibz%FD%D4%AA%1E%9D%5C%F7%7Et@%B9%08t%01%25%CE_%99%BE%A2%D8%1D@%7Eb%FAj%18M%12t%1A%11%83z%C6%01%00%ACV%DB%21%00%03%1D%E5%29%21%7B%A0%98%E0M%09%E1%E2%22%C2%FE%D7nSUm%9D%E5%C4%A4%D9%82%3By_Q%24%DD%3B%85%7F%96%98%BE%FA%B3%06%19%F8%8A%AE%7Fg%C9%B2%D5i3X%B5%C8PJ%08%0D%F6%E3%3FOL_%FD9%00D%85%05%ABV%04O%88%93s%95%AD%D6*J%88SD%14%25%24%D6%5E%17%F6%3A%F0%86%BE%9F%AD%CC%05%B8XK%C3j%28%0E%FAx%1FQp%89%BA%F2v%BB%2C%AD%28N%0E%F6%D3%0D%07%80%C4%F4%D5%AA%9B0%87%FA%EBU%D3%1E%980c%8F%C2%96%02%A5%0C%25%84%EB%1C%12%D4Xw5%26I%3E%F6%D8s%3C%00%C8Vk%7EC%7D%FCn%8FF%5C%7C%D3G%CB%C6%DBl%B6%0A%8E%E3%02%23%02%FDo%17%05%DE%E3%1F%C8%CD%5Du%C9%11%9B%CDv%99%12%12%E6x%CDW%24%A3%12%D3W%3B%86%85%3E%7E%60%C2%8C%F5%00%60%91%AD%C5%BE%22q%EA%C2%D7j%C4%7B%00%94%DF%FE%E9%CA*%D9jml%07%3A%1FM%10%00%04%FB%E9%00%C0i1%F9%D6%D8%CC%B8%B1hu+%B9T%5D%ED%03%D4O%87%00%80%20_%ED%5D%FF8%94%B1%E5%F8%C5%0B%5B%BA%85%84%F5%DA%D8%F7%A1sI%BB%D6%9ELI%E8%7B%93%E3j4+2vA%92-%9Fm%1E%90%92%9E%B4k%ED%C9%3B%A3c%C7%FC%A9g%EF%29%C3%F6%7E%EC2%87P%92%E5%EA%00%1F%DF%7F%3B%AE%5BZj4%0E%DE%3C%20%25%BD%7Bh%87G%16%EF%DBQc%0F%B2%01%EA%03jf%25%0D%C5%D4%7E%897%9D%AB0%EC%1Awh%E3%04%A0%7E%FC%D2%3E%21%9F%27%A4%04%00%0C%B5%C6%D7%EE%8E%89%D3%02%C0%BE%82%DC%9A%F6X%A9%86%03f%C8%B2%D5%CA%13%82%16%1E%E7yB%D6%3B%EA4I%96%F7%9AJ%13%E0%EB%E3t%CEq%F0U%DAu%60%C2%8C%3D%94%E3j%9B%D2C%B8%DF%27%D4%1F%980c%0F%E1%B8%92%96%94%A1%C2X%B3%C01oJ%B8%96%D6%05%04%9E%7E%E2%A8%CB%22%5B%BF%F36-%00%D5kvt%1AM%ACN%23%22@%EB%1B%E4x%E8%7D4%7Ej%FA%7C%04%7E%837m%A0%A5%E5%B5X%E4%EFU%9E%DB1%0E%28k*%9D%BF%AFO%E3Rl%3A%8D%F8%A5%F2%BE%86%E7I%98%BF%BE_%87%00%BF%E1a%FE%FA%7EZ%8DH%9A%AA%B3%DF%CB%D1%F4%FD%A6%90%CC%96o%BD%28s%8C%5D%DEl%B1%ACu%27%A7%F7%D1%F89%3E%9F%A6%ECi%8D%CD%8C%1B%8BV%B7%0C%AD%20d%96TW%21%5C%EF%87%A2%AA%CA%B5_%F4%9F%90%B13y%F2X%7B%24g%D2%AE%B5%27%87%C6vwr%86%1B%8E%1D%01%21%DCG%DB%92%26M%1D%7Dp%C3%CC%3B%3AG%DF%14%AE%F7C%B8%DE%0F%9D%FC%03%5D%B6%88%09%F4%F5-%DB%3C%20%25%FDl%D9%A5%C6ej%EC%BB0l%1E%90%92%7E%F4%9E%E9%BA%D3%A5%97%16%CF%DF%F9%CD%F9e%3F%EC%90%ECc%8B%E1z%3F%A4%0E%BB_%B8p%A5%E2%D3%F1G%D2%934%94%3FZR%7D%05%89Q%5D%91o%28%7B%BB%F7%B7%AB.%8A%94%7FdD%7COl%CF9%85%10%AD%D6e%9B%A2%B6%A0%60%FA+%05eU%D5%8F%98%CC%96%26%C3%F9%D5%0E%8E%E3.RB%FE%B4%EF%A1%A7%9CV%9A%C9%7D%F2%A5%E5%D5u%A6%9D%DE%EA%11%28%ADU%B3%8D%A7tz%93%11%7B%8A/%20%81%D2%91%9C%87i%09%CA%A3%A4%E2%CA%27%253%1789%0E%B5i%17%DE%94%C7j%B5%FD%E6%23%08%EF%3B%EA%CA+%BE%3C%CD%9B%BA%B5%D9%F0c%ADIr%B9%EE%08%C7qu%DE%96%AB%D2X%FBu%FES%AF%EC%F3%A6%0D%B8%9Bf%E2%A9%AC%3A%1F%CD%045%7D%22%CFO%F5%94%DE%CE%C1%94%BF%AF%B6%C8%D63%9E%E4%25%8B%BC%B1%29%3D@%EB%A60%9Cyb%EE%24%B3%2C%97yk%F7%A9%A9/.%A8%95%CC%99%CD%AD7%25l%DA%05%C3%5BZ%DD2B%B4%BA%E5%1B%8E%1DA%B8%DE%0Fwt%8E%BEi%D8%DE%8F%BF%1C%7F%24%3Di%F4%C1%0D3O_.9%9E%92%D0%F7%26%C7e%D2%ECS%1F%EC%5D%A3e5%C6%27%E2%82C%F1%C1%E1%8C%E2uG3K%7D%05%C1%25%CA1%CFP%AA%01%80%CA%BA%BA%F3%F6k%3DC%3Bh%1DW%95%F9%26%F1%D1%97%0E%8F%98%1E%B5+y%8A%E6x%F1%85%E7V%1D%D8Sj%8FT%9Ds%D70%C1%EE%ACO%5E*.%D5%89%1A%2C%199%1AKG%8E%89%98%3E%E0.M%9E%A1%14%3BsO%97%AAu%D7%B6%159%D3%5E%DAx%E8%E1%BFk/_%A9z%BFN27%19%CEO%09%81E%B6%9E%A4%84%3C.P%DAk%F7%9F%A7%1DS%D3%F9%E3%A33%87W%18k%1E%AE1Ig%3D8%82r%91%E7%FF%AD%A6c%F7%9F%A7%AD%A7%84%0C%91%AD%B6%DF%D4%D2%FA%08%C2E%85%FC1%81%D2H%9B%0DKl6%947%F1R%B2%18%EBLY%D5u%A6%E4%D3%7F%7Bq%922_%B5P%F8%60%BD.%CDXg%FA%14%80%D9%CD%0B%FB%7B%1FQ%E8%BD%FB%CF%D3%9C%FE8%B0%CD_Q%5Ez%A5%BA%97%B1%CE%94%05@V%A6%E38%AE%0E%C0%07%1A%81%1FF%08%B9%DC%D4%CB%D1j%B5%ED%F0%E2%D9%5C%AA%AE3%3Dy%7C%D2%2C%AF%A7%5CP%C2%FD%E4%AE%5C*%E5%CC%B3%C8%D6%A73%26L%EF%A2%2C%AB%C3s%D8B%09%19b%96eUGg%96e%A71x%ADF%1CP+%99%BFT%B3%81%E3%B8%3A%9B%0DK%0E%A6%3C%FD%B0d%B1T5U%3Fj%BBf4%07%9DF%13_a%AC%F9%BA%89%BApj%EBG%26%3E%93X%27%99%FFT+%99Oz%AA7%8E%E3LfY%3E%A3%CC%B3%B563n%1C%DAd%83%E0%BE%DBV%E7L%EE%3B0%CE%1Em%9A%DB%D0%B5i%9F%0C%0F%D4G%93.%FBa%A79T%A7_%FEM%E2%A3%8D%BB%DA%3F%B0%FF_W%82%7C%B5%7E5f%F3%FF%AB1K%8F%0F%89%ED%7E%EF%81%C2%BC%E7%8A%AB%AE%2CM%1Dv%BF%00%00%8B%F6%7E%BFw%DF%90%BF%0D%BE7c%FD%BA%01%9Dc%A6%0C%8A%EA%8A%3CC%29%FE%F7%D4%89%8F%DC91%EE%9Fs%03%7B%84v8%9F6b%94%5E%27j%B0%E6%F0%7E%88%94%DEe4K%0F%18jj%E6%DA%17%0F%CF%2C%CC%C7%DE%FC%B3%D5%B7Ev%B9%A5%BDv%BBp%C7%BD%5B%3F%8A%81%EB.%F7%05%DBFO%29h%A1%3E%E5%EE%F5%15%DBFOQu%A6n%D2+w%24%F7%98%5E%25%0D%E0E%19n%FB%D7%CA%ED%1D%02%FC%94%1B%E6%0E%D96z%CA%9E%06%BDNe%B1_%F7%06E%DAf%D5%81%83%0E%D5%DD%D9%9BcGsu%A3%EDlmR%8F%A2%7E%5C%9E%95%C3%FD%16%B7EoPi%AF%C7%B6%8D%9E%E2v%B7%8F%8641p%FD%CD%B4%A8%DE%18%0C%25m%E2%10S%B26E%9F%28.%CA%B1%07%B7%28%C9..%C2%3F%B32%AB%7Bu%E88%D5q%8Cn%FC%91%F4%24%91%D2%1F%CAkk%AAxJ%E7%95%D7%D6%8Cy%A0%C7-%C9%07%0A%F3%9E%F3%135oO%EC%D3%1F%D9%C5E%D8%95w%FA%A3mI%93%A6%A6dm%8A%AE%96L%A7%A7%0F%B8K%03%00%AF%EF%FA%AE%24s%F84%B7%91%28%E3%8F%A4%27QBv%3Cv%DB%1D%9A%3CC%296%FFr%7C%CB%CE%E4%C9cG%1F%DC0%F3%B7%CA%8A%A7%25%99%FE%815%00%00%04%B7IDAT%D9%A2%8B%F4%0F%F8%A6%3D%BF%0C%19%EA%F4%FDl%D5%F6%F0@%7F%17%87%F8%ED%A8%C7%F7%5C%0B%7B%18%0C%06%A3M%D62%DD%D8%F7%A1s%E3%8F%A4%0FY%B8%E7%FB%AFG%F5%BC%25%60PTW%18%25%13%B2%8B%8B%B0%ED%EC%AFf%BD%A8%F9%E6%D4%83%B3%5C%D6d4%C9%96%7E%22%A5%E0%295%FCXt%7Ea%B0%AF%D6XR%7D%05%16%AB5%DC%EEX%F3%0C%A5%D0%09%9A%ED%F6%7C%92v%AD%CD3J%A6%9Bt%A2%06q%C1%21%E1%E3%8F%A4%279F%91%02%F5%7B%1Dv%F2%0F%18%7B%BE%B2%BCV%A0%F4%60IuUrlp%28j%CC%E6A@%FDJ8%00V%B6E%D9%19-%A3-%D6be0%18%8C%B6%A4%CD%DEH_%F4%9F%90%D1%23%2C%FC%D6%AC%A2%F3%8B%17%ED%FD%7E%EF%3B%99%7B%F7f%15%9D_%7Ch%C4S%A2r%A94%25%26%8BE%D7%3D%A4%C3%B6%81%5D%BA%86%9E%BCT%5Cj%B1%CAa%F6%20%9C%EC%E2%228%7EU%86huk%0F8L%C8/%AA%AAtZX8%25kSt%ADY%9AukD%A7%1Eq%C1%A1%7D8p%D9%F6%20%1B%91R%5D%5B%95%97%D1%3A%28%F1%1C%D1%C8%600%18W%936%DD%20%B8a%0C%EE%25%8F%82%0DP%8E%5C%04%80P%AD.%F4%B3%DB%FF%D2%E84%FBn%5B%9Dc_F%CD%87%E7%9D%26%CAo%1D8q%E5%A0%1Dk%E6%26Fu%0D%D7%89%1A%C4%04%06%DF4%EE%D0%C6%09v%A7Yc%96%C6%DE%DB%AD%97%F8%D1%D1%CC%CA%20_%ED%EEH%FF%80K%F6%E9%1A%E5%B55%EA%13%BD%18W%1D%F6%85%C8%600%AE7%AE%E9%1B%C9%EE%C4b%83Cqo%C6%FAu%F6%EB%11z%BF%0E@%7Dw%29%E1%B8le%BA%8E%7E%FE%CFn9Y%7FyL%AF%04%E4%1A.%BF%E7x%DF%28%99%D0%B3Cx%E9%CE%E4%C9c%3B%FB%07%E6%D8%BF6%23%FD%03J%95%BA%18%D7%86%E6.x%CE%600%18%ED%CD5%7F%03%9D-%BBlN%88%88%C4%B9rC%E3%E4%F9%BB%BBv%F3%03%80-%27%B3%D1A%EF7S%99f%F3%80%94%F4%5CC%E9%B1%FA%E5%E24%18%16%D7%23%D4%EEP%B7%0E%9C%B82%E3%5C%AE%14%1F%1C%1672%E3%93%CB%FF%3Ds%F2%D3%11%F1%3DPR%5D%85%CA%BA%DA%DF%AEn%E9%18%EE%A0%94%FCTk6%E79%1E%94%92%26%23%0C%19%0C%06%A3%3Di%D3.%D3%96Pc%96%CA%AA%25%29b%7C%EF%DB%F5%B7%FE%F7%9D%CB%21Z%9D%7FBD%24J%AA%AB%60%A8%AD%C9%DD%7E%F7%E3%AAS%21b%82B%C6%FC%F3%C7C%27%DF%18%FE%80vD%7CO%EC+%C8M%010%15%00%04J%3F-%A9%AE%9A%F2l%E2%E0P%A0%FE%8Bq%DD%D1%03%86%CC%E1O%DEv%15%8B%C6h%82%BD%7Fy%F2%05%00/%5Ck%3B%18%0C%06%C3N%9BL%BBh%0D%A3%0Fn%98%C9%81%7B%DB%3E/%D0N%EA%CEo%CD%B1%C1%A1%DD%94s%03S%B26E%D7%98%A5%B1ZA%FC%B2%C6%2C%8D%8D%D0%FB%BF%3D%A6W%022%0B%F3%91Ut%7E%B1%7D%8E%E3%BD%19%EB%D7%85hu%835T%08%3Eu%B9D%8A%09%0A%1Ep%B5%E7%192%18%0C%06%E3%8F%C35w%88@%BD%F3%8A%09%0C%992%A6W%02%B2%8B%8B%B0%23%E7%14D%9E_%EC8%81%1F%00%C6%1D%DA8%A1%AC%C6%B8%EE%FE%1E7%EB%3F8%9C%21%DF%D6%B1%F3%C4%8BUWV%CD%1B%3A2%DC%28%99%F0N%E6%DE%BD%CAm%A4%18%0C%06%83%C1%F0%86k%3E%86%08%00%DB%92%26M-%AE%BE%F2%DC%A2%BD%DF%EF%FD%E6%F4%CF%7B%B5%A2%F8%9C%D2%19%02%C0%89%92%A2%0F%1E%EF%3BP%FF%FE%A1%7DR%AF%0E%11%CB4%3C%7F%B0%93%7F%C0A%00%D0%89%1AT%D6%D5%BA%EC%CD%C7%600%18%0C%867%5C%F31D%3B%DEL%96%0F%D5%EAMF%C9%84%F8%E0%B0%19%DF%24%3E%BA%AEa%CE%E1P%A0%3E%22U+%88%2Ch%86%C1%600%18-%E2%BA%F8B%F4%96%0Ez%7D%5Dlp%28%CAkk%DE%BA%7B%F7%87%7BN%5E%BAx%F4%FE%1E7%FB%01%F5%13%F8%3B%E8%FD%3E%F1%A4%83%C1%600%18%0C5%AE%9B/Do%A8%B3%98wd%17%17My%F3%9E%07%03J%AA%AB%92%C3%F5%F5%FB%B5%E6%19J%F1%CB%A5%8B%BFf%0C%7D%82-%C7%C6%600%18%8C%16q%5D%04%D54%87%7B3%D6%AF3J%D2%D8%98%C0%E0%E0jI%C2oW*j%B4%82p%84%05%D30%18%0C%06%A35%FC%E1%1C%22%83%C1%600%18%ED%C1%1Fj%0C%91%C1%600%18%8C%F6%829D%06%83%C1%600%C0%1C%22%83%C1%600%18%00%98Cd0%18%0C%06%03%00s%88%0C%06%83%C1%60%00%60%0E%91%C1%600%18%0C%00%C0%FF%01%D53%20%D0%85%EFTF%00%00%00%00IEND%AEB%60%82") );

    // --- Links Tabs, Rechts Liste
    w.row = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
    if ( ! offer_fileserver_option && ! offer_offline_option ) {
      // --- Nur Online -> default
      w.row.add("statictext", [undefined, undefined, 350, 200], __('only-online-explainer'), {multiline: true});
      // Wenn ich panels habe, hab ich ein edittext feld...
      w.online_src = w.add("statictext", undefined, "https://daten.project-octopus.net/Octopus4" );
      w.online_src.visible = false;
    } else {
      w.panels = w.row.add("tabbedpanel {alignChildren: ['fill', 'fill']}");
  
      // --- Online Tab
      w.online_panel = w.panels.add("tab {text: 'Online', alignChildren: ['fill', 'fill']}");
  
      // --- Fileserver Tab
      if ( offer_fileserver_option ) {
        w.fileserver_panel = w.panels.add("tab {text: 'Fileserver', alignChildren: ['fill', 'fill']}");
      }
  
      // --- Offline Tab
      if ( offer_offline_option ) {
        w.offline_panel = w.panels.add("tab {text: 'Offline', alignChildren: ['fill', 'fill']}");
      }
    // 
    if ( offer_offline_option ) {
      // w.offline_row = w.offline_panel.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}");
      w.offline_description = w.offline_panel.add("statictext", [undefined, undefined, 350, 200], __('offline-explainer'), {multiline: true});
      w.offline_panel.add("statictext", undefined, " ");
      w.offline_btn = w.offline_panel.add("button", undefined, __('where-is'));
      w.offline_btn.id = "offline"
      w.offline_btn.onClick = select_folder;
      w.offline_src = w.offline_panel.add("edittext", [undefined, undefined, 450, 20] );
    }

    if ( offer_fileserver_option ) {
      w.fileserver_row = w.fileserver_panel.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}");
      w.fileserver_src = w.fileserver_row.add("edittext", [undefined, undefined, 350, 20] );
      w.fileserver_btn = w.fileserver_row.add("button", undefined, __('where-is'));
      w.fileserver_btn.id = "fileserver"
      w.fileserver_btn.onClick = select_folder;
      w.fileserver_panel.add("statictext", undefined, " ");
      w.fileserver_description = w.fileserver_panel.add("statictext", [undefined, undefined, 350, 200], __('fileserver-explainer'), {multiline: true});
    }

    w.online_row = w.online_panel.add("group {orientation: 'column', alignChildren: ['fill', 'fill']}");
    w.online_description = w.online_row.add("statictext", [undefined, undefined, 350, 200], __('online-explainer'), {multiline: true});
    w.online_src = w.online_row.add("statictext", [undefined, undefined, 350, 20], "https://daten.project-octopus.net/Octopus4" );
    w.online_src.visible = false;

    // w.dbg = w.add("statictext", [undefined, undefined, 400, 20], "tab");
    w.panels.onChange = function() {
      // w.dbg.text = this.selection.text;
      fix_btn_and_set_basepath( this.selection.text );
      if ( this.selection.text == "Offline") {
        display_config( jsons[0] );
      } else if ( this.selection.text == "Fileserver") {
        display_config( jsons[1] );
      } else {
        display_config( jsons[2] );
      }
    }
  }

    // -- Liste Inhalt
    if (show_asset_list) {
      w.listpanel = w.row.add("panel {text: '" + __('content') + "', alignChildren: ['fill', 'fill']}");
      w.list = w.listpanel.add("listbox");
      w.list.minimumSize.width = 350;
      w.list.minimumSize.height = 300;
      w.list.maximumSize.height = 700;
    }


    w.btns = w.add("group {orientation: 'row', alignChildren: ['center', 'fill']}");
    w.cancelElement = w.btns.add("button", undefined, __('cancel'));
    w.defaultElement = w.btns.add("button", undefined, __('install-online'));

    
    make_request();
    display_config( jsons[2] );

    var do_what = w.show();
    if ( do_what == 2 ) {
      return false;
    }
    if ( offer_offline_option || offer_fileserver_option ) {
      if ( w.panels.selection.text == "Online" ) {
        return jsons[2]
      } else if ( w.panels.selection.text == "Fileserver" ) {
        return jsons[1]
      } else {
        return jsons[0]
      }
    } else {
      return jsons[2];
    }

    function fix_btn_and_set_basepath( lbl ) {
      $.writeln( "tablabel: " + lbl );
      if ( lbl == "Offline" ) {
        w.defaultElement.text = __('install-offline')
        base_path = w.offline_src.text;
      } else if ( offer_fileserver_option && lbl == "Fileserver" ) {
        w.defaultElement.text = __('install-server')
        base_path = w.fileserver_src.text;
      } else {
        w.defaultElement.text = __('install-online')
        base_path = w.online_src.text;
      }
    }
    function select_folder() {
      var active_tab = this.window.panels.selection.text;
      var f = Folder.selectDialog( __('where-is') );
      if ( ! f ) return;

      var cfg = __readJson( f.fullName + "/index.json" );
      if ( ! cfg ) {
        alert( __('no-index'))
        return;
      }
      base_path = f.fullName;
      display_config( cfg )

      if ( active_tab == "Offline" ) {
        w.offline_src.text = f.fullName;
        cfg.base_url = "";
        jsons[0] = cfg;
      } else {
        if ( offer_fileserver_option ) {
          w.fileserver_src.text = f.fullName;
          cfg.base_url = f.fullName;
          jsons[1] = cfg;
        }
      }
      fix_btn_and_set_basepath( active_tab );
    }
    function make_request( default_url ) {
      if ( ! default_url ) default_url = w.online_src.text;
      if ( ! check_url( default_url ) ) return;
      try {
        var raw = __call_request( default_url, "index.json" );
        jsons[2] = JSON.parse(raw);
      } catch(e) {
        alert( __('failed-download') + "\n" + e.message + " on " + e.line );
      }
    }
    function check_url( url ) {
      if ( ! url || url.search(/^http/i) == -1 ) {
        alert( __('no-url') );
        return false;
      }
      return true;
    }
    function display_config( cfg ) {
      if (! show_asset_list) return;
      if ( typeof cfg == "string" ) cfg = JSON.parse( cfg );
      w.list.removeAll();
      if ( ! cfg ) return;
      for ( var n = 0; n < cfg.configs.length; n++ ) {
        w.list.add("item", cfg.configs[n].filename);
      }
    }
  }   // get source


  function update_resources(configs) {
    try {

      var pbw = new Window("palette");
      pbw.pb = pbw.add("progressbar", [undefined, undefined, 400, 20]);
      pbw.pb.maxvalue = configs.length; 
      pbw.show();
      for (var _nc = 0; _nc < configs.length; _nc++) {
        pbw.pb.value = _nc;
        var c = configs[_nc];

        try {
          var tgt_path = get_tgt_path(c);
          __ensureFolder(tgt_path);
        } catch (e) {
          $.writeln( e.message + " on " + e.line );
          continue;
        }
        var tgt_file = new File(tgt_path), done;
        var is_new = !tgt_file.exists;
        if (is_new || !eq_filesize(c.check, tgt_path)) {
          
          // --------------------------------------------------------------------
          // ------------------------------------------------------- URL
          if (c.base_url.search(/^http/i) != -1) {
            var src_path = (c.base_url + "/" + c.subpath).replace(/\/$/, "");
            install_from_url( c, src_path, tgt_path );
            
          } else {
            // --------------------------------------------------------------------
            // ----------------------------------------------------- File
            var src_path = (base_path + "/" + c.subpath).replace(/\/$/, "");
            install_from_fileserver( c, src_path, tgt_path );
          }
        } else {
          old.push( c.filename );
        }
      }
    } catch (e) {
  
    } finally {
      pbw.close();
    }

    function install_from_url( c, src_path, tgt_path ) {
      try {
    
        var tgt_file = __call_request(
          src_path,
          c.filename,
          "file",
          tgt_path,
          true
        )
        if ( ! tgt_file.exists ) throw new Error( "Download gescheitert" );
    
        if (is_new) {
          nu.push(c.filename);
        } else {
          updated.push(c.filename);
        }
      } catch (e) {
        $.writeln( e.message + " on " + e.line );
        failed.push(c.filename);
      }
      $.sleep(100);

    }
    function install_from_fileserver( c, src_path, tgt_path ) {
      try {
        var src = new File(src_path + "/" + c.filename);
        if (src.exists) {
          var done = src.copy(tgt_path);
          if (!done) {
        
            failed.push(c.filename);
          } else {
        
            if (c.id != "index") {  // Ich will nicht sehen, ob das JSON wackelt
              if (is_new) {
                nu.push(c.filename);
              } else {
                updated.push(c.filename);
              }
            }
          }
        } else {
          $.writeln( e.message + " on " + e.line );
          failed.push(c.filename);
        }
      } catch (e) {
        $.writeln( e.message + " on " + e.line );
        failed.push(c.filename);
      }
    }
  }   // update_resources

  function show_log( what, set ) {
    try {
      var w = new Window("dialog {orientation: 'column', alignChildren: ['left', 'top']}");
      var r = w.add("group {orientation: 'row', alignChildren: ['fill', 'fill']}");
      var lb, g;
      for ( var n = 0; n < what.length; n++ ) {
        g = r.add("group {orientation: 'column', alignChildren: ['left', 'top']}");
        var i = what[n];
        if ( i.a.length ) {
          g.add("statictext", undefined, __(i.key));
          lb = g.add("listbox", undefined, i.a);
          lb.preferredSize = [300, Math.min(180, (i.a.length * 20) + 20)];
        }
      }
      w.add("statictext", undefined, __("do_restart"));
      w.defaultElement = w.add("button", undefined, "OK");
      w.show();
    } catch(e) {
      $.writeln( e.message + " on " + e.line)
    }
  }

  // -------------------------------------------------------------------------------------------
  //  Get Installation-Path
  // -------------------------------------------------------------------------------------------
  function get_tgt_path(cfg) {
    var p;
    if (cfg.subpath.search(/^Scripts Panel/i) != -1 || cfg.subpath.search(/^Startup Scripts/i) != -1) {
      p = PATH_SCRIPT_PARENT + "/" + cfg.subpath;
    } else {
      if (!cfg.subpath) {
        p = PATH_DATA_FOLDER;
      } else {
        p = PATH_DATA_FOLDER + "/" + cfg.subpath;
      }
    }
    p += "/" + cfg.filename;
    return p;
  }
  function eq_filesize(check, tgt_path) {
    var tgt_file = new File(tgt_path);
    var tgt_size = tgt_file.length;
    // $.writeln("Vergleiche: " + check + " mit " + tgt_size + " fuer " + tgt_path);
    // Ich weiss nicht, ob "exakt identische Laenge" zu restriktiv ist
    return Math.abs(tgt_size - check) < 4;
  }

}






  function __(key) {
    switch(key) {
      case "abc": 
        return localize({
          "de": "abc",
          "en": "def"
        });
      case "where-is": 
        return localize({
          "de": "Wo liegt das entpackte Paket?",
          "en": "Where is the unzipped package?"
        });
      case "cancel": 
        return localize({
          "de": "Abbrechen",
          "en": "Cancel"
        });
      case "local": 
        return localize({
          "de": "lokale Installation",
          "en": "Local Installation"
        })
      case "remote": 
        return localize({
          "de": "Online Installation",
          "en": "Online Installation"
        })
      case "offline": 
        return localize({
          "de": "Offline Installation",
          "en": "Offline Installation"
        })
      case "server": 
        return localize({
          "de": "Fileserver Installation",
          "en": "Fileserver Installation"
        })
      case "online": 
        return localize({
          "de": "Online Quelle benutzens",
          "en": "Use Online Source"
        })
      case "local_desc": 
        return localize({
          "de": decodeURI("Sie%20k%C3%B6nnen%20ein%20lokal%20geladenes%20Paket%20installieren"),
          "en": "You can install from a downloaded, local package"
        })
      case "online_desc": 
        return localize({
          "de": decodeURI("Sie%20k%C3%B6nnen%20von%20der%20Online-Quelle%20installieren"),
          "en": "You can install from our Online-Repository"
        })
      case "no-url": 
        return localize({
          "de": "Error\nGeben Sie bitte eine URL ein, bevor Sie die Config laden",
          "en": "Error\nPlease enter a URL before attempting to load the config"
        })
      case "failed-download": 
        return localize({
          "de": "Unter dieser Adresse konnte keine Config geladen werden",
          "en": "No config could be loaded with this address"
        })
      case "no-index": 
        return localize({
          "de": decodeURI("Dieser%20Ordner%20enth%C3%A4lt%20keine%20index.json"),
          "en": "No index.json in this folder"
        })
      case "content": 
        return localize({
          "de": decodeURI("Inhalt%20des%20ausgew%C3%A4hlten%20Pakets"),
          "en": "Content of the selected package"
        })
      case "install-online": 
        return localize({
          "de": "Online-Paket installieren",
          "en": "Install online-package"
        })
      case "install-offline": 
        return localize({
          "de": "Offline-Paket installieren",
          "en": "Install offline-package"
        })
      case "install-server": 
        return localize({
          "de": "Server-Paket installieren",
          "en": "Install server-package"
        })
      case "already-there": 
        return localize({
          "de": decodeURI("Anscheinend%20existiert%20bereits%20die%20alte%20Version%20von%20Octopus%0A%0AWollen%20Sie%20abbrechen%2C%20um%20diese%20zu%20entfernen%3F%0A%0A%22Ja%22%20%E2%89%88%20Die%20Octopus-Ordner%20werden%20im%20Finder%2FExplorer%20ge%C3%B6ffnet.%0A%22Nein%22%20%E2%89%88%20Die%20Installation%20wird%20durchgef%C3%BChrt%20mit%20ungetestetem%20Ergebnis.%20Es%20ist%20nicht%20klar%2C%20wie%20sich%20zwei%20verschiedene%20Octopus-Versionen%20nebeneinander%20verhalten."),
          "en": "Apparently an old version of Octopus already exists\n\nDo you want to cancel to remove it?\n\n\"Yes\" ≈ The Octopus-Folders are opened in Finder/Explorer.\n\"No\" ≈ This installation proceeds with untested consequences. We do not know how two Octopus-versions running in parallel behave."
        })
      case "nu-script": 
        return localize({
          "de": "Folgende Dateien wurden installiert",
          "en": "The following files have been installed"
        })
      case "old-script": 
        return localize({
          "de": "Folgende Dateien waren bereits installiert",
          "en": "The following files were already installed"
        })
      case "updated-script": 
        return localize({
          "de": "Folgende Dateien wurden aktualisiert",
          "en": "The following files have been updated."
        })
      case "failed-script": 
        return localize({
          "de": "Folgende Dateien konnten nicht installiert werden",
          "en": "The following files could not be installed"
        })
      case "only-online-explainer": 
        return localize({
          "de": decodeURI("Bei%20der%20Installation%20werden%20die%20Skripte%20und%20Daten%20vom%20Project-Octopus-Server%20geladen%20und%20bei%20jedem%20Start%20von%20InDesign%20aktualisiert.%5CnEinige%20anonymisierte%20Daten%20wie%20Nutzungsdaten%20und%20aufgetretene%20Fehlermeldungen%2C%20werden%20dabei%20an%20den%20Project-Octopus-Server%20gesendet%2C%20um%20die%20Entwicklung%20von%20Project%20Octopus%20zu%20unterst%C3%BCtzen.%20Es%20werden%20keine%20personenbezogenen%20Daten%20gesammelt%20oder%20gespeichert."),
          "en": "During installation, the scripts and data are loaded from the Project Octopus server and updated each time InDesign is started.\nSome anonymized data such as usage data and error messages are sent to the Project Octopus server to support the development of Project Octopus. No personal data is collected or stored."
        })
      case "online-explainer": 
        return localize({
          "de": "Bei der Online-Installation werden die Daten vom Project-Octopus-Server geladen und bei jedem Start von InDesign aktualisiert.\nDies ist die bevorzugte Installationsart.",
          "en": "During online installation, the data is loaded from the Project Octopus server and updated each time InDesign is started. \nThis is the preferred installation method."
        })
      case "online-explainer-1": 
        return localize({
          "de": "Bei der Online-Installation werden die Daten vom Project-Octopus-Server geladen und das Startup-Script so konfiguriert, dass bei jedem Neustart nach Aktualisierungen gesucht wird.\n\nIm Normalfall ist dies die bevorzugte Installationsart",
          "en": "With online installation, the data is downloaded from the Project Octopus server and the startup script is configured to check for updates on every restart. \n\nThis is in most cases the preferred installation method."
        })
      case "fileserver-explainer": 
        return localize({
          "de": decodeURI("Wenn%20Sie%20das%20Paket%20an%20definierter%20Stelle%20in%20Ihrem%20Dateisystem%20(%E2%89%88%20Fileserver)%20ablegen%2C%20kann%20der%20Octopus-Installer%20sich%20von%20dort%20Updates%20ziehen.%0A%0AW%C3%A4hlen%20Sie%20diese%20Option%2C%20wenn%20Sie%20mehrere%20InDesign-Installationen%20haben%20und%20den%20Update-Zyklus%20selbst%20kontrollieren%20wollen."),
          "en": "If you place the package in a defined location on your file system (≈ file server), the Octopus installer can retrieve updates from there. \n\nSelect this option if you have multiple InDesign installations and want to control the update cycle yourself."
        })
      case "offline-explainer": 
        return localize({
          "de": decodeURI("Die%20Offline-Installation%20wendest%20du%20nur%20an%2C%20wenn%20die%20Online-Installation%20Probleme%20bereitet.%0ASie%20setzt%20voraus%2C%20dass%20Du%20das%20Octopus-Paket%20von%20Github%20heruntergeladen%20hast.%0ADas%20heruntergeladene%20Octopus-Paket%20legst%20du%20irgendwo%20ab%20(vielleicht%20der%20Ordner%20%E2%80%9EDokumente%E2%80%9C%3F)%20und%20l%C3%A4sst%20sie%20dort%20unangetastet%20liegen!%0ANat%C3%BCrlich%20funktioniert%20das%20automatische%20Updaten%20der%20Octopus-Scripte%20nach%20der%20Offline-Installation%20nicht.%20Du%20musst%20das%20Octopus-Paket%2C%20um%20neue%20Scripte%20zu%20bekommen%20erneut%20herunterladen%20und%20dieses%20Starter-Script%20erneut%20ausf%C3%BChren.%0AUm%20%C3%BCber%20Updates%20informiert%20zu%20werden%20abonniere%20den%20Newsletter%20auf%20project-octopus.net"),
          "en": "You should only use the offline installation if the online installation causes problems. \nIt requires that you have downloaded the Octopus package from GitHub. \nPlace the downloaded Octopus package somewhere (perhaps the “Documents” folder?) and leave it there untouched! Of course, automatic updates of the Octopus scripts will not work after an offline installation. You will need to download the Octopus package again to get new scripts and run this starter script again. \nTo be informed about updates, subscribe to the newsletter at project-octopus.net"
        })
      case "offline-explainer-1": 
        return localize({
          "de": decodeURI("Die%20Offline-Installation%20setzt%20voraus%2C%20dass%20Sie%20sich%20das%20Octopus-Paket%20von%20project-octopus.net%20oder%20von%20Github%20runtergeladen%20haben.%0A%0ADie%20Dateien%20werden%20dann%20einmal%20an%20den%20richtigen%20Ort%20kopiert%20und%20in%20Ruhe%20gelassen.%0A%0AFuer%20Updates%20muessten%20Sie%20den%20Prozess%20wiederholen%3A%20Paket%20runterladen%20und%20dieses%20Script%20starten."),
          "en": "Offline installation requires that you have downloaded the Octopus package from project-octopus.net or GitHub. \n\nThe files are then copied to the correct location and left alone. \n\nFor updates, you would need to repeat the process: download the package and run this script."
        })
      case "do_restart": 
        return localize({
          "de": "InDesign muss neu gestartet werden, damit die Installation wirksam wird.\n",
          "en": "InDesign must be restarted for the installation to take effect.\n"
        });
      default:
        return key;
    }
  }







/**
 * Liest eine Datei und gibt den Inhalt als String zurueck.
 * Gibt null zurueck wenn die Datei nicht existiert.
 */
function __readFile(filePath) {
  var f = new File(filePath);
  if (!f.exists) return null;
  try {
    f.encoding = "UTF-8";
    f.open("r");
    var content = f.read();
    return content;
  } catch(e) {

    $.writeln("__readFile Fehler: " + e.message);
    return null;
  } finally {
    try { f.close(); } catch(e) {}
  }
  return content;
}

/**
 * Schreibt einen String in eine Datei (ueberschreibt).
 * Erstellt Elternordner falls noetig.
 */
function __writeFile(filePath, content, mode) {
  if ( ! mode ) mode = "w";
  try {
    var f = new File(filePath);
    __ensureFolder( f.parent.fullName );
    f.encoding = "UTF-8";
    f.open( mode );
    f.write(content);
    f.close();
  } catch(e) {
    $.writeln("__writeFile Fehler: " + e.message + " (" + filePath + ")");
    throw e;
  }
}

/**
 * Liest eine JSON-Datei und gibt das geparste Objekt zurueck.
 * Gibt null zurueck wenn die Datei nicht existiert oder nicht parsbar ist.
 */
function __readJson(filePath) {
  var content = __readFile(filePath);
  if (content === null || content === "") return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    $.writeln( e.message + " on " + e.line );
    return null;
  }
}

/**
 * Schreibt ein Objekt als JSON in eine Datei.
 */
function __writeJson(filePath, obj) {
  __writeFile(filePath, JSON.stringify(obj, null, 2));
}

/**
 * Erstellt einen Ordner rekursiv (auch verschachtelte Pfade).
 */
function __ensureFolder(folderPath) {
  // Wenn ein Punkt im Namen, gehe ich von einer Datei aus.
  if ( folderPath.split("/").pop().search(/\./) != -1 ){
    folderPath = File( folderPath ).parent.fullName
  }
  var f = new Folder(folderPath);
  if (f.exists) return f;

  try {
    var parent = f.parent;
    if (!parent.exists) {
      __ensureFolder(parent.fullName);
    }
    if (!f.create()) {
      throw new Error("'" + folderPath + "' was not created");
    }
    if (!f.exists) {
      throw new Error("'" + folderPath + "' was not created");
    }
    return f;
  } catch(e) {
    // __log("error", "Ordner konnte nicht erstellt werden (" + folderPath + "): " + e.message, "includes");
    throw e; // Exception weiterwerfen - Installation MUSS abbrechen
  }
}

function __call_request( url, command, type, tgt_path, replace ) {
  if (typeof JSON !== "object") {
    __init();
  }
  if ( ! type ) type = "data";

  var request = {
    url: url,
    command: command, // defaults to ""
    port: "", // defaults to ""
    method: "GET",
  }

  if (type == "data") {
    var response = restix.fetch(request);
    if (response.error) {
      throw new Error("HTTP Request fehlgeschlagen: " + url + "/" + command + " - " + response.errorMsg);
    }
    if (response.httpStatus >= 400) {
      throw new Error("HTTP Status " + response.httpStatus + ": " + url + "/" + command);
    }

    if ( tgt_path && (replace || !File(tgt_path).exists) ) {
      var f = new File( tgt_path );
      f.encoding = "UTF-8";
      f.open("w");
      f.write( response.body );
      f.close();
    }
    return response.body;

  } else {
    if ( ! tgt_path ) tgt_path = Folder.desktop.fullName + "/_tempdatei.txt";

    if (replace || !File(tgt_path).exists) {
      var temp = new File(tgt_path);
      var response = restix.fetchFile(request, temp);
      if ( response.httpStatus == 404 ) {
        throw new Error( "File '" + url + "' not found");
      }
      if (response.error) {
        throw new Error(response.error + "\n" + response.errorMsg);
      }
      return temp;
    }
  }
}
function __init() {
  PATH_SCRIPT_PARENT = app.scriptPreferences.scriptsFolder.parent.fullName;
  PATH_DATA_FOLDER = Folder.userData.fullName + "/Octopus4";
  PATH_LOG_FILE = PATH_DATA_FOLDER + "/Logs/log.json";
  __ensureFolder(PATH_LOG_FILE);

  // ------------------------------------------------------------------------------------------------
  // JSON
  // ------------------------------------------------------------------------------------------------
  if (typeof JSON !== "object") {
    JSON = {};
  }
  
  (function () {
    "use strict";
    
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    
    function f(n) {
      return (n < 10)
          ? "0" + n
          : n;
    }
    
    function this_value() {
      return this.valueOf();
    }
    
    if (typeof Date.prototype.toJSON !== "function") {
      
      Date.prototype.toJSON = function () {
        
        return isFinite(this.valueOf())
            ? (
                this.getUTCFullYear()
                + "-"
                + f(this.getUTCMonth() + 1)
                + "-"
                + f(this.getUTCDate())
                + "T"
                + f(this.getUTCHours())
                + ":"
                + f(this.getUTCMinutes())
                + ":"
                + f(this.getUTCSeconds())
                + "Z"
            )
            : null;
      };
      
      Boolean.prototype.toJSON = this_value;
      Number.prototype.toJSON = this_value;
      String.prototype.toJSON = this_value;
    }
    
    var gap;
    var indent;
    var meta;
    var rep;
    
    
    function quote(string) {
      rx_escapable.lastIndex = 0;
      return rx_escapable.test(string)
          ? "\"" + string.replace(rx_escapable, function (a) {
        var c = meta[a];
        return typeof c === "string"
            ? c
            : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + "\""
          : "\"" + string + "\"";
    }
    
    
    function str(key, holder) {
      var i;          // The loop counter.
      var k;          // The member key.
      var v;          // The member value.
      var length;
      var mind = gap;
      var partial;
      var value = holder[key];
      
      if (
          value
          && typeof value === "object"
          && typeof value.toJSON === "function"
      ) {
        value = value.toJSON(key);
      }
      
      if (typeof rep === "function") {
        value = rep.call(holder, key, value);
      }
      
      switch (typeof value) {
        case "string":
          return quote(value);
        
        case "number":
          
          return (isFinite(value))
              ? String(value)
              : "null";
        
        case "boolean":
        case "null":
          
          return String(value);
          
        case "object":
          
          if (!value) {
            return "null";
          }
          
          gap += indent;
          partial = [];
          
          if (Object.prototype.toString.apply(value) === "[object Array]") {
            
            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || "null";
            }
            
            v = partial.length === 0
                ? "[]"
                : gap
                    ? (
                        "[\n"
                        + gap
                        + partial.join(",\n" + gap)
                        + "\n"
                        + mind
                        + "]"
                    )
                    : "[" + partial.join(",") + "]";
            gap = mind;
            return v;
          }
          
          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              if (typeof rep[i] === "string") {
                k = rep[i];
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (
                      (gap)
                          ? ": "
                          : ":"
                  ) + v);
                }
              }
            }
          } else {
            
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (
                      (gap)
                          ? ": "
                          : ":"
                  ) + v);
                }
              }
            }
          }
          
          v = partial.length === 0
              ? "{}"
              : gap
                  ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                  : "{" + partial.join(",") + "}";
          gap = mind;
          return v;
      }
    }
    
    if (typeof JSON.stringify !== "function") {
      meta = {    // table of character substitutions
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\"": "\\\"",
        "\\": "\\\\"
      };
      JSON.stringify = function (value, replacer, space) {
        
        var i;
        gap = "";
        indent = "";
                
        if (typeof space === "number") {
          for (i = 0; i < space; i += 1) {
            indent += " ";
          }
          
        } else if (typeof space === "string") {
          indent = space;
        }
        
        rep = replacer;
        if (replacer && typeof replacer !== "function" && (
            typeof replacer !== "object"
            || typeof replacer.length !== "number"
        )) {
          throw new Error("JSON.stringify");
        }
        
        return str("", {"": value});
      };
    }
    
    
    if (typeof JSON.parse !== "function") {
      JSON.parse = function (text, reviver) {
        
        var j;
        
        function walk(holder, key) {
          
          var k;
          var v;
          var value = holder[key];
          if (value && typeof value === "object") {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }
        
        text = String(text);
        rx_dangerous.lastIndex = 0;
        if (rx_dangerous.test(text)) {
          text = text.replace(rx_dangerous, function (a) {
            return (
                "\\u"
                + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
            );
          });
        }
        
        if (
            rx_one.test(
                text
                    .replace(rx_two, "@")
                    .replace(rx_three, "]")
                    .replace(rx_four, "")
            )
        ) {
          
          j = eval("(" + text + ")");
          
          return (typeof reviver === "function")
              ? walk({"": j}, "")
              : j;
        }
        
        throw new SyntaxError("JSON.parse");
      };
    }
  }());

  // ------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------
  // HTTP
  // ------------------------------------------------------------------------------------------------

  /****************
  # Connect InDesign to the web
  * HTTPS supported 
  * Works form CS4 to CC 2022 (ExtendScript based library)
  * Based on VBScript/ServerXMLHTTP (Win) AppleScript/curl (Mac) relies on app.doScript()

  ## Getting started
  See examples/connect.jsx

  * @Version: 1.37
  * @Date: 2023-10-28
  * @Author: Gregor Fellenz, http://www.publishingx.de
  * Acknowledgments: 
  ** Library design pattern from Marc Autret https://forums.adobe.com/thread/1111415
  */

  $.global.hasOwnProperty('restix') || (function (HOST, SELF) {
    HOST[SELF] = SELF;

    /****************
    * PRIVATE
    */
    var INNER = {};
    INNER.version = "2025-11-04-1.4";


    /** Returns if the operating system is windows 
    * @return {String} true | false
    */
    INNER.isWindows = function () {
      return ($.os.indexOf("Windows") > -1);
    }

    /** Check the request information object and construct a full URL
    * @param {request} Request information object
    * @returns{request} Request information object or throws an error
    */
    INNER.checkRequest = function (request) {
      if (request.url == undefined || request.url == "") throw Error("No property [url] found/set");
      if (request.url.toString().slice(-1) == "/") request.url = request.url.toString().slice(0, -1);

      if (request.command == undefined) request.command = "";
      if (request.command.toString()[0] == "/") request.command = request.command.toString().substr(1);

      if (request.port == undefined) request.port = "";
      if (isNaN(request.port)) throw Error("[port] is Not a Number");

      // Add port
      if (request.port != "") {
        request.fullURL = request.url + ":" + request.port + "/";
      }
      else {
        request.fullURL = request.url + "/";
      }

      // Add command 
      if (request.command != "") {
        request.fullURL = request.fullURL + request.command;
      }

      // not encoded, we need to encode;
      if (decodeURI(request.fullURL) == request.fullURL) {
        request.fullURL = encodeURI(request.fullURL);
      }

      if (request.method == undefined || request.method == "") request.method = "GET";
      if (!(request.method == "GET" || request.method == "POST" || request.method == "PUT" || request.method == "PATCH" || request.method == "DELETE" || request.method == "HEAD")) throw Error("Method " + request.method + " is not supported");  // Missing HEAD 

      if (request.method == "POST" && (request.binaryFilePath == undefined || request.binaryFilePath == "")) request.binaryFilePath = false;

      if (request.headers == undefined) request.headers = [];
      if (!(request.headers instanceof Array)) throw Error("Provide [headers] as Array of {name:'',value''} objects");
      if (request.body == undefined || request.body == "") request.body = false;

      if (request.body && request.binaryFilePath) throw Error("You must not provide [body] and [binaryFilePath]");

      if (request.unsafe == undefined) request.unsafe = false;

      if (request.proxy == undefined) request.proxy = false;

      return request;
    }

    /** The main connection function. Need to be slashed
    * @return {response} Response result object 
    */
    INNER.processRequest = function (request, outFile) {
      var response = {
        error: false,
        errorMsg: "",
        body: "",
        httpStatus: 900
      };

      var scriptCommands = [];
      var result = "";

      if (INNER.isWindows()) {
        // Since Win10 Update Feb 2019 msxml3 does not work anymore...
        scriptCommands.push('Dim xHttp : Set xHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")');
        // Konstanten fuer ADODB.Stream
        scriptCommands.push('Const adTypeBinary = 1');
        scriptCommands.push('Const adSaveCreateOverWrite = 2');
        scriptCommands.push('Const adModeReadWrite = 3');

        scriptCommands.push('Dim res');
        scriptCommands.push('On Error Resume Next');
        scriptCommands.push('xHttp.Open "' + request.method + '", "' + request.fullURL + '", False');

        if (request.proxy != false) {
          // xHttp.SetProxy 1
          scriptCommands.push('xHttp.setProxy 2, "' + request.proxy + '"');
        }

        for (var i = 0; i < request.headers.length; i++) {
          scriptCommands.push('xHttp.setRequestHeader "' + request.headers[i].name + '","' + request.headers[i].value.replace(/"/g, '""') + '"');
        }
        if (request.unsafe) {
          //~ ' 2 stands for SXH_OPTION_IGNORE_SERVER_SSL_CERT_ERROR_FLAGS
          //~ ' 13056 means ignore all server side cert error
          scriptCommands.push('xHttp.setOption 2, 13056');
        }

        if (request.body) {
          scriptCommands.push('xHttp.Send "' + request.body.replace(/"/g, '""').replace(/\n|\r/g, '') + '"');
        }
        else if ((request.method == "POST" || request.method == "PUT") && request.binaryFilePath) {
          // http://www.vbforums.com/showthread.php?418570-RESOLVED-HTTP-POST-a-zip-file
          scriptCommands.push('    Dim sFile');
          scriptCommands.push('    sFile = "' + request.binaryFilePath + '"');


          scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
          scriptCommands.push('    objStream.Type = adTypeBinary');
          scriptCommands.push('    objStream.Mode = adModeReadWrite');
          scriptCommands.push('    objStream.Open');
          scriptCommands.push('    objStream.LoadFromFile(sFile)');

          scriptCommands.push('    xHttp.SetRequestHeader "Content-Length", objStream.Size');
          scriptCommands.push('    xHttp.Send objStream.Read(objStream.Size)');
          scriptCommands.push('    Set objStream= Nothing');
        }
        else {
          scriptCommands.push('xHttp.Send');
        }

        scriptCommands.push('If err.Number = 0 Then');

        if (outFile) {
          scriptCommands.push('    Set objStream = CreateObject("ADODB.Stream")');
          scriptCommands.push('    objStream.Type = adTypeBinary');
          scriptCommands.push('    objStream.Mode = adModeReadWrite');
          scriptCommands.push('    objStream.Open');
          scriptCommands.push('    objStream.Write xHttp.responseBody');
          scriptCommands.push('    objStream.SaveToFile "' + outFile.fsName + '" , adSaveCreateOverWrite');
          scriptCommands.push('    objStream.Close');
          scriptCommands.push('    Set objStream= Nothing');
          scriptCommands.push('	res = "outFile" &  vbCr & "-----http-----" & xHttp.getAllResponseHeaders &  vbCr & "-----http-----" &  xHttp.status');
        }
        else {
          scriptCommands.push('	res = xHttp.responseText  &  vbCr & "-----http-----" & xHttp.getAllResponseHeaders &  vbCr & "-----http-----" &  xHttp.status');
        }

        scriptCommands.push('Else');
        scriptCommands.push('	res =  "xHttpError "  & Err.Description &  " " & Err.Number');
        scriptCommands.push('End If');

        scriptCommands.push('Set xHttp = Nothing');
        scriptCommands.push('returnValue = res');

        scriptCommands = scriptCommands.join("\r\n");

        try {
          result = app.doScript(scriptCommands, ScriptLanguage.VISUAL_BASIC);
        }
        catch (e) {
          result = "doScriptError: " + e.message + " #" + e.number;
          if (e.number == 104705) {
            result += " Please start InDesign once with administrator rights. Close it and start it again as a normal user.";
          }
        }

      }
      else { // Mac
        // -L follow redirects 
        var curlString = 'curl --silent --max-time 30 --show-error -g -L ';
        for (var i = 0; i < request.headers.length; i++) {
          curlString += (' -H \'' + request.headers[i].name + ': ' + request.headers[i].value + '\'');
        }
        if (request.unsafe) {
          // Es gab einen Fall wo am Mac mit -k es nicht funktioniert hat curl: (35) Server aborted the SSL handshake
          curlString += ' -k ';
        }

        if (request.proxy != false) {
          curlString += ' --proxy ' + request.proxy
        }

        if (request.method == "HEAD") {
          curlString += ' -I --head ';
        }
        else if (outFile) {
          curlString += ' -X ' + request.method;
        }
        else {
          curlString += ' -X ' + request.method + ' -i ';
        }
        if (request.body) {
          curlString += ' -d \'' + request.body.replace(/'/g, "\\\\\"").replace(/"/g, "\\\"").replace(/\n|\r/g, '') + '\'';
        }
        else if ((request.method == "POST" || request.method == "PUT") && request.binaryFilePath) {
          curlString += ' --data-binary \'@' + request.binaryFilePath + '\'';
        }

        if (outFile) {
          curlString += ' -w \'outFile\n-----http-----%{http_code}\'';
          curlString += ' -o \'' + outFile.fsName + '\''
        }
        else {
          curlString += ' -w \'\n-----http-----%{http_code}\'';
        }
        curlString += ' \'' + request.fullURL + '\'';
        // $.writeln( "\n\n=========curl==============\n" + curlString + "\n=========/curl==============\n\n");
        try {
          result = app.doScript('do shell script "' + curlString + '"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
        }
        catch (e) {
          result = "doScriptError: " + e.message + " #" + e.number;
        }
      }

      // Fill response 
      if (typeof result == 'undefined') {
        throw Error("No result value. Probably System Script could not run?");
      }
      if (result.match(/^xHttpError|^curl: \(\d+\)|^doScriptError:/)) {
        response.error = true;
        response.errorMsg = result;
      }
      else {
        if (INNER.isWindows()) {
          var resArray = result.split("\r-----http-----");
          if (resArray.length == 3) {
            response.body = resArray[0];
            response.head = resArray[1];
            response.httpStatus = resArray[2] * 1;
          }
          else {
            throw Error("Wrong result value: [" + result + "]");
          }
        }
        else {
          // $.writeln( "-+-+-+-+-+-+-+-+\n\n" + result );
          var resArray = result.split("\r-----http-----");
          if (resArray.length == 2) {
            if (request.method == "HEAD") {
              response.head = resArray[0];
              response.body = "";
            }
            else {
              var headBodySplit = resArray[0].split(/\r\n?\r\n?/);
              if (headBodySplit.length > 2) {
                // multiple header sections (redirects)
                response.head = headBodySplit[headBodySplit.length - 2];
                response.body = headBodySplit.slice(-1)[0];
              }
              else if (headBodySplit.length == 2) {
                response.head = headBodySplit[0];
                response.body = headBodySplit[1];
              }
              else {
                response.body = resArray[0];
                response.head = "";
              }
            }
            response.httpStatus = resArray[1] * 1;
          }
          else {
            throw Error("Wrong result value: [" + result + "]");
          }
        }


        var headSplit = response.head.split(/\n|\r/);
        response.head = {}
        for (var h = 0; h < headSplit.length; h++) {
          var headProperty = headSplit[h];
          if (headProperty.replace(/\s/g, '') == "") continue;
          var colonIndex = headProperty.indexOf(":");
          response.head[headProperty.substring(0, colonIndex).toLowerCase()] = headProperty.substring(colonIndex + 1).replace(/^ +/, "");
        }
      }

      return response;
    }


    /****************
    * API 
    */
    /** Process an HTTP Request 
    * @param {request} Request object with connection Information
    * @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
    */
    SELF.fetch = function (request) {
      request = INNER.checkRequest(request);
      return INNER.processRequest(request, false);
    }

    /** Process an HTTP Request and writes the result to a give File
    * @param {request} Request Object with connection Information
    * @param {outFile} File to write to
    * @return {response} Response object {error:error, errorMsg:errorMsg, body:body, httpStatus:httpStatus}
    */
    SELF.fetchFile = function (request, outFile) {
      if (outFile == undefined) throw Error("No file provided");
      if (outFile instanceof String) outFile = File(outFile);

      request = INNER.checkRequest(request);
      var response = INNER.processRequest(request, outFile);
      if (outFile.length == 0) {
        outFile.remove();
      }
      if (!outFile.exists) {
        response.error = true;
        response.errorMsg = "File was not created\n" + response.errorMsg;
      }
      return response;
    }

  })($.global, { toString: function () { return 'restix'; } });
}
