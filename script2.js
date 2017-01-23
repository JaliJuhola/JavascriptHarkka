$(document).ready(function ()
{
    $("#tulevat").on("click", function () {
        var url = $("#osoite").val();
        haeUusiTieto(url);

    });
    $("#tyhjenna_tapahtumat").on("click", function () {
        tyhjennaTaulu();
    });
    $("#paikanna").on("click", function () {
        sijaintini();
    });
    $("#suosikit").on("click", function () {
        var i = 0;
        var url = "http://visittampere.fi:80/api/cardlist?ids=";
        for (var key in localStorage) {
			if(parseInt(key) > 0) {
                if (localStorage.getItem(key) === "1") {
                    if (i === 0) {
                        i = 1;
                        url += key;
                    } else {
                        url += "%2c" + key;
                    }

                }
		    }
        }
        if (i > 0) {
            haeUusiTieto(url);
        } else {
            alert("suosikkilistasi on tyhja!");
        }
    });
    $("#kartta").hide();
    $("#tyhjenna").hide();
    $("#virhe_label").hide();
    document.getElementById("maara").defaultValue = 4;
});

function asetaVirhe(teksti) {
    $("#virhe_label").show();
    document.getElementById("virhe_label").innerHTML = teksti;
}	