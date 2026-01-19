main();

function main() {

  var on_path = "/Users/singel/Dropbox/PARA/01-Projekte/Satzkiste/Octopus/ScripteV4/Octopus/icons/On.png";
  var off_path = "/Users/singel/Dropbox/PARA/01-Projekte/Satzkiste/Octopus/ScripteV4/Octopus/icons/Off.png";
  var w = new Window("dialog {text: 'Collect Document Fonts', alignChildren: ['fill', 'fill']}");
  var t1 = create_toggle( w, "t1", "On", "Off" );
  var t2 = create_toggle( w, "t2", "Schriften werden gesammelt", "Schriften werden nicht gesammelt" );
  w.add("edittext", undefined, "ok")
  w.show();
  $.writeln("t1 state: " + t1.state + "\n" + "t2 state: " + t2.state);

  function create_toggle( w, toggle_id, on_string, off_string ) {
    var on_img = unescape("%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%008%00%00%00%20%08%06%00%00%00G%03%BB%E8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD%7E%FC%00%00%025IDATX%85%ED%99%21s%E2@%14%C7%7F%89%A9%E9%D0%0Af%105%0C_%20qu%D7%284%E0%3BS%E4%89L%23%FA%018_%11%06QYf%EA%01%1D%15%CE%D5%25_%80%C1Tt%06%D1vj%AAr%22%9B%9Br%24iH%C2%E68%EE%E7%C2%7B%BC%BC%7Fv_%F6%EDF%09%82%80%2C%28%A3%B6%0Et%00%03%B8%C8%F4%A7%DD%F0%03%98%05%A6%E3eqV%BE%12%A8%8C%DAW%80%05h%85S+%17%1F%B0%03%D3%19%A79%25%0ATF%ED%260%A6%DA%D1%CA%C2%1C%B8%0ALg%19gT%E3%7ETF%ED%0E%E0%F1%F7%8B%830GO%E4%BC%C1%86@1%25%A7%C0%C9n%F3*%95%13%60*r_cm%8A%8A%A70%95%97%D7N%E8%06%A63%8B.%7E%0B%145%E7Q%E1%C85k%0D%2C%BD%87q%A6%A1%D5%5Bk6%7F%B5%C0%7D%F2%B1%BD%09%CB%B7%E7%B40%AF%80%1E%D5%E4g%81.%15%D6%9C%FD%ED%3B%D7Z7%93%EF%D0%9Fb%FD%BCKs%99%07%A6c%80%10%28%E6%EE%7D%D1%24%F3pzt%8C%DB%BB%DD%18%B1%AF%F0W%0B%8C%C9%0D/%1F%EFI.%FD%C0t%C6%D1K%C6*%92d%5E%F2%8A%03%D0%EA-%DC%DE-%A7G%C7I.%16%80*%3A%94J%16%F1%C1%F9e.q%11Z%BD%C5%E0%FC2%D1%AC%8C%DA%BAJ%D8%7EI%A7Ykd%AE%B94%AE%B5.%CDZ%23%C9%DCQ%09%7BK%E9XzOF%2CC%A5%A27%A7qV%5EU%A4%C4%BA%88m%D5dP%A4%F6%B6%89U%99@Y%FC%17%B8%EFT%26%D0_-%A4%C4R%097%8C%D2q%9F%7C%19%B1%E6*%E0%96v%A7-%B0%BD%89%8CX%AE%0A%CC%92%AC%BBd%F9%F6%CC%D0/%BE%F5%1C%FA%D3%B4%ED%D3L%15%A7S%E5%CD%97-%18%3C%3E%14%AAE%7F%B5%60%F0%F8%90h%0EL%C7%8B%5E2v%EE%BB%14%E0%E5%E3%1Dcr%93Kd%86%ED%92%0D%87%B2%E1%85%038%B2%80%7F%F3%D0im%A1%17%86%BE%F4%94%CA%A3%FFY%1C%C4t2%E2%28%BCK8%D4%FB%C2+%E1%C8%8D%FF4%C4%B6j%E2%29%E8T%D4%E5l%C9%9C%B0%E6b%D7%F3%C3%FD%F8%B2%E1%B8%A7%9F%CF%7E%01%96s%00%8Ei%AD+%08%00%00%00%00IEND%AEB%60%82")
    var off_img = unescape("%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%008%00%00%00%20%08%06%00%00%00G%03%BB%E8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD%7E%FC%00%00%02%5BIDATX%85%ED%99%AF%B2%DA@%14%87%BF%9B%16%13%01%22%A6%22%A2.%B2y%83%CBL%5E%00%0C%1AT%2C3y%80N%1F%80%19%EC%AA%A21%D0%19lf%E0%0D@%20%E2*2%83%8A%B8%26%96%8Al%3A%FC%D9%00%21%0B%5Cn%FB%B9p%96%B3%E7%97%93%DD%EC9y%D9n%B7%5C%82%EF%FB.%D0%02%9A%C0%EBE%7F%BA%0D%3F%80%A9%10by%C9%E0%97s%02%7D%DF%EF%02%7D%E0%5B%E5%D0%F4%B2%02%86B%88%D1%A9A%85%02%7D%DF%FF%0A%8Cxl%B6.a%01t%85%10%BFUFC%F5%A3%EF%FB-%60%C9%FB%17%07Y%8CK%19%F3%11G%02%E5%239%01%1A%B7%8DK+%0D%60%22c%DFc%EF%11%95war%BF%B8nB%5B%081%CD/%FE%0A%94kn%C9%89%CCY%96%85%E7y8%8E%83m%DB%7B%B68%8E%89%A2%880%0CI%92%E4%26%91_%C8%1B%E0%E6k%F2%F3%8Ea%C4%09q%9DN%07%CF%F3%0A%BD%DA%B6%8Dm%DBx%9EG%18%86%8C%C7c%3D%E1%96%A7A%A6%A5%092%83%F2%D9%FD%A9%1Am%9A%26A%10%1Ce%EC%1Cq%1C3%18%0CH%D3%B4R%B4%15%E8%09%21F%F9%26%D3W%8D%B8V%1Cd%19%0D%82%00%D34%AB%04Y%85%3E%C0%A7%CDf%E3%02%DFU%23%DA%ED6%AE%EB%5E%3DC%BD%5E%A7V%AB%B1%5E%AF%AF%F6Q%81/%B3%D9%EC%97Av%FC%3A%22%DFP%AA%E2y%1E%96eU%F6s%25-%03%B9%18%0F%D1%21%EE%16%BEJ%D24%288%AD8%8E%A3m%16%9D%BEJ%F2%AA%3C%AA%01Wm%2C%F7%F0U%96B%81%1F%85%FF%02%9F%9DB%81q%1Ck%9BD%A7%AF%B2%18d%05%E3%11Q%14i%9BD%A7%AF%92%2C%0C%60%AE%B2%84a%A8m%16%9D%BEJ27%80%A9%CA%92%24%89%96%C0%1E%5C%3EM%0D%D9%9DZ%A9%AC%B3%D9%AC%D2%FA%89%E3%F8%91e%D3J%08%B1%CC7%99%A1jD%9A%A6%0C%06%83%ABD%E6%E5%D2%03%19%C2%7EE%3F%E7D%93%E9%5C%C1%BB%CB%83%0B%5E%80%85%10%A2%09%FB%15%7D%97%13-%8B%F1xL%18%86%CF%D2%B2%E8%E6%17%1F%BE%E9%B4%F7%A2%97%86%DE%DDC%D2GoW%1C%28N2%B2%15%DE%26K%F5%B3%F0F%96%B9%D1%A1AyT%93w%C1%A5%E0%94%F3%CEX%90%B5%09%95%EF%F3%7F%F7%E3%CB%21%CF%FA%F9%EC%0F%0A%9C%FA%5D%F3%93%D5%1E%00%00%00%00IEND%AEB%60%82")

    var ud = new Folder( Folder.userData + "/cuppascript" );
    if ( !ud.exists ) ud.create();

    var on_png = new File( ud.fullName + "/on.png" );
    var off_png = new File( ud.fullName + "/off.png" );

    on_png.encoding = "BINARY";
    on_png.open("w");
    on_png.write( unescape( on_img ) );
    on_png.close();

    off_png.encoding = "BINARY";
    off_png.open("w");
    off_png.write( unescape( off_img ) );
    off_png.close();

    var stw = Math.max( on_string.length, off_string.length ) * 7 + 10;
    w[ toggle_id] = w.add("group {orientation: 'row', alignChildren: ['left', 'fill']}");
    w[ toggle_id ].toggle_btn = w[ toggle_id ].add("iconbutton", [undefined, undefined, 60, 36], on_img);
    w[ toggle_id ].toggle_text = w[ toggle_id ].add("statictext", [undefined, undefined, stw, 20], on_string);
    w[ toggle_id ].toggle_btn.state = "on";
    w[ toggle_id ].toggle_btn.toggle_id = toggle_id;
    w[ toggle_id ].toggle_btn.onClick = function() {
      var toggle_id = this.toggle_id
      if ( this.state == "on" ) {
        this.window[toggle_id].toggle_text.text = off_string;
        this.state = "off";
        this.image = File(off_path);
      } else {
        this.window[toggle_id].toggle_text.text = on_string;
        this.state = "on";
        this.image = File(on_path);
      }
    }
    return w[toggle_id].toggle_btn
  }
}