var myLatlng;
var map;
var geocoder;
var markers = new Array();
var listanObjekti;
var infoWindow;
var jarjestys;
var db = new Firebase('https://a951qhfuyyr.firebaseio-demo.com/');
var sijaintiMarker;

function initMap() {
    listanObjekti = 0;
    jarjestys = 0;
    myLatlng = new google.maps.LatLng(61.3649277, 24.65664620000007);
    var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("kartta"), {
        zoom: 9,
        center: myLatlng
    });
}

function codeAddress(teksti, address, monesko) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title: teksti + " " + address
            });
            markers[monesko] = marker;
            jarjestys++;
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function sijaintini() {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);

    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var marker = new google.maps.Marker({
                map: map,
                position: pos,
                title: "Sijaintisi"
            });
			sijaintiMarker = marker;
            map.setCenter(pos);
            map.setZoom(16);
        }, function () {
            paikannusVirhe();
        });
    } else {
        paikannusVirhe();
    }
}

function paikannusVirhe() {
    asetaVirhe("Sijaintiasi ei voida hakea!");
}

function haeMarker(mones) {
    var i = 0;
    var markkeri;
    var sijainti = markers[mones];
    map.setCenter(sijainti.getPosition());
    map.setZoom(16);
    for(i = 0; i < markers.length; i++) {
        if (i !== mones) {
            markers[i].setMap(null);

        } else {
            markers[i].setMap(map);
        }
    }
}

function tyhjenna() {
    markers = [];
}

function haeUusiTieto(osoite) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                map.setCenter(new google.maps.LatLng(61.499312, 23.771496));
                tuoTiedotTaulukkoon(req.responseText);
		        $("#kartta").show();
			    google.maps.event.trigger(map, "resize");
            } else {
                kirjoitaViesti("VIRHE");
            }
        }
    }
    req.open("GET", osoite, true);
    req.send();


}

function tuoTiedotTaulukkoon(responseText) {

    var noudettuTieto;
    var n = 0;
    noudettuTieto = JSON.parse(responseText);
    if (noudettuTieto.length === 0)
    {
        document.getElementById("kartta").hide();
        alert("Kyselyly palautti 0 tapahtumaa!");
    } else {
        var taulukko = document.getElementById("tapahtumat");
        $("#tapahtumat").show();
        $("#tyhjenna").show();
        $("#virhe_label").hide();
        $("#huomio").hide();
        $("#syote").hide();
        $("#suosikit").hide();
        google.maps.event.trigger(map, "resize");

        while (taulukko.hasChildNodes()) {

            taulukko.removeChild(taulukko.firstChild);
        }
        for(n = 0; n < noudettuTieto.length; n++) {
            if (noudettuTieto[n].contact_info.city != null)
            {
                codeAddress(noudettuTieto[n].title, noudettuTieto[n].contact_info.address + " " + noudettuTieto[n].contact_info.city, n);
            } else {
                codeAddress(noudettuTieto[n].title, noudettuTieto[n].contact_info.address + " Tampere", n);

            }
            kirjoitaViesti(noudettuTieto[n].item_id, noudettuTieto[n].title, noudettuTieto[n].description, noudettuTieto[n].start_datetime, noudettuTieto[n].contact_info.link, n);
        }
    }
}

function kirjoitaViesti(tapahtumaId, title, desc, pvm, osoite, listassa) {
    var paiva = new Date(pvm);
    var lista = document.getElementById("tapahtumat");
    var li = document.createElement("li");
	li.classList.add("objektit");
    var sija = listassa;
    var tykkaa = document.createElement("button");
    var kommentoi = document.createElement("button");
	var kommentointi = document.createElement("div");
	var viestit = document.createElement("div");
	viestit.id = tapahtumaId;
	viestit.classList.add("viestit");
	var kentta = document.createElement("input");
	kentta.setAttribute("type", "text");
	kentta.classList.add("viesti_kentta");
	kentta.placeholder = "Voit kommentoida tapahtumaa kirjoittamalla...";
	var t = document.createTextNode("Kommentoi");   
	var lahetaViesti = document.createElement("button");
	        lahetaViesti.onclick = function() { 
			var oikeaKentta = document.getElementById(tapahtumaId);
			var teksti = kentta.value;
			kentta.value = "";
            listaViesti(tapahtumaId, oikeaKentta, teksti);
			 db.push({name: tapahtumaId, text: teksti});
        };
	lahetaViesti.classList.add("laheta_viesti");
	lahetaViesti.appendChild(t);
    var i = 0;
    var e = 0;
    kommentoi.innerHTML = kommentoi.innerHTML + "<span class=\"glyphicon glyphicon-comment\"></span>";
    kommentoi.classList.add("toiminnot");
	kommentoi.classList.add("kommentoi");
	kommentointi.classList.add("kommentointi");
    tykkaa.classList.add("tykkaa");
	tykkaa.onclick = function() {
	    if (!$(this).hasClass("btn-success")) {
            localStorage.setItem(tapahtumaId, 1);
            $(this).addClass("btn-success");
        } else {
            $(this).removeClass("btn-success");
            localStorage.setItem(tapahtumaId, 0);
        }
	}
    tykkaa.classList.add("toiminnot");
    tykkaa.innerHTML = "<span class=\"glyphicon glyphicon-thumbs-up\"></span>";
    for(var key in localStorage) {
        var avain = parseInt(key);
        if (avain === tapahtumaId) {
            i = 1;
            if (localStorage.getItem(key) === "1")
            {
                tykkaa.classList.add("btn-success");
            }
        }
    }
    if (i === 0)
    {
        localStorage.setItem(tapahtumaId, 0);
    }
    li.classList.add("list-group-item");
    if (pvm !== null) {
        li.innerHTML = " <b class='tapahtuma'>" + desc + ": " + paiva.getDate() + "." + (paiva.getMonth() + 1) + "." + paiva.getFullYear() + " at " + paiva.getHours() + ":" + paiva.getMinutes()
                + "0<br/> </b>" + "<div class='desc'>" + desc + "</div>" + li.innerHTML;
    } else {
        li.innerHTML = "<b class='tapahtuma'>" + title + ": Aikaa ei annettu</b><br/>" + "<div class='desc'>" + desc + "</div>" + li.innerHTML;

    }
    if (osoite != null) {
        li.innerHTML = li.innerHTML + "<button class='toiminnot'><a target=\"_blank\" href=\"" + osoite + "\"><i class=\"glyphicon glyphicon-link\"></i></a></button>"
    }
    li.innerHTML = li.innerHTML + "<button class=\"toiminnot\" onclick=\"haeMarker( " + sija + ");\"  type=\"button\" ><span class=\"glyphicon glyphicon-pushpin\"></span></button>";
    li.appendChild(tykkaa);
    li.appendChild(kommentoi);
	li.appendChild(kommentointi);
	kommentointi.appendChild(viestit);
	kommentointi.appendChild(kentta);
	kommentointi.appendChild(lahetaViesti);
    lista.appendChild(li);
    listanObjekti++;
	db.on("child_added", function(snapshot) {
	  var me = snapshot.val();
	 if(parseInt(me.name) === parseInt(tapahtumaId)) {
		 listaViesti(parseInt(me.name), document.getElementById(parseInt(me.name)), me.text);
	 }
});

	$(".kommentointi").hide();
}

function tyhjennaTaulu() {
    var i = 0;
    $("#tapahtumat").hide();
    $("#kartta").hide();
    $("#tyhjenna").hide();
    $("#huomio").show();
    $("#syote").show();
    $("#virhe_label").hide();
    $("#suosikit").show();
    var taulukko = document.getElementById("tapahtumat");

    while (taulukko.hasChildNodes()) {
		
        taulukko.removeChild(taulukko.firstChild);
    }
    for(i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
	sijaintiMarker.setMap(null);
    tyhjenna();
}
var edellinen = " ";
function listaViesti(id, kenttamihin, teksti) {
	if(edellinen.localeCompare(teksti) != 0) {
	var viesti = document.createElement("div");
	viesti.classList.add("yksittainen_viesti");
	var m = document.createTextNode(teksti + "");
	viesti.appendChild(m);
    kenttamihin.insertBefore(viesti, kenttamihin.firstChild);
    edellinen = teksti;
	}
	
}
$(document).ready(function ()
{
    $("#tulevat1").on("click", function () {
        var ilmainen = 0;
        var tyyppi = $("input[type='radio'][name='optradio']:checked").val();
        var kieli = $("input[type='radio'][name='tapahtuman_kieli']:checked").val();
        if ($('#ilmainen').is(':checked')) {
            ilmainen = 1;
        }
        var aika = new Date().getTime();
        var maara = $("#maara").val();
        var urli = "http://visittampere.fi:80/api/search?type=event&";
        if (tyyppi !== "all" && tyyppi !== null) {
            urli += "&text=" + tyyppi;
        }
        urli += "&start_datetime=" + aika;
        if (ilmainen == 1) {
            urli += "&free=true";
        } else {
            urli += "&free=false";
        }
        if (kieli !== "all") {
            urli += "&lang=" + kieli;
        }
        urli += "&limit=" + maara;
        haeUusiTieto(urli);


    });
     $('body').on('click', '.kommentoi', function () {
		    if(!$(this).parent("li").children(".kommentointi").is(":visible")) {
				$(this).parent("li").children(".kommentointi").show();
			} else {
				$(this).parent("li").children(".kommentointi").hide();
			}
        });
    if (window.localStorage) {


    } else {
        alert("Localstoragea ei voida käyttää");
    }
});
