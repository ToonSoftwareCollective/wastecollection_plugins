//<provider>10</provider><version>1.0.0</version><parms>"city,streetName"</parms>
//provider limburg.net testdata: Arendonk Lusthoven

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	
		wasteDatesString = "";
		var wasteType = "";
		var limburgAfvalbeheerDates = [];

    		var d = new Date();
        	var currentMonth = '' + (d.getMonth() + 1);
        	var currentYear = d.getFullYear();

		if (d.getMonth() == 11) {
    			var nextMonthM = "01";
			var nextMonthY = d.getFullYear() + 1;
		} else {
    			var nextMonthM = d.getMonth() + 2;
			var nextMonthY = d.getFullYear();
		}	

			// retrieve city id

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				
				if (xmlhttp.responseText !== "[]") {

						// retrieve street id
	
					var i = xmlhttp.responseText.indexOf("}");
					var cityNumbers = JSON.parse(xmlhttp.responseText.substring(1,i+1));
					if (wasteCity !== cityNumbers["naam"]) {
						wasteCity = cityNumbers["naam"];
					}

					var xmlhttp2 = new XMLHttpRequest();
					xmlhttp2.onreadystatechange = function() {
						if (xmlhttp2.readyState == XMLHttpRequest.DONE) {
							var i = xmlhttp2.responseText.indexOf("}");
							var streetNumbers = JSON.parse(xmlhttp2.responseText.substring(1,i+1));
							if (streetNumbers["nummer"]) {
								if (wasteStreetName !== streetNumbers["naam"]) {
									wasteStreetName = streetNumbers["naam"];
								}

									// retrieve collection dates current month

								var xmlhttp3 = new XMLHttpRequest();
								xmlhttp3.onreadystatechange = function() {
									if (xmlhttp3.readyState == XMLHttpRequest.DONE) {
										var collectionDates = JSON.parse(xmlhttp3.responseText);
										if (collectionDates["ophalingen"]["lijstVanOphaalDagen"].length > 0) {
											for (var i = 0; i < collectionDates["ophalingen"]["lijstVanOphaalDagen"].length; i++) {
												wasteType = wasteTypeLimburg(collectionDates["activiteitenLegende"][collectionDates["ophalingen"]["lijstVanOphaalDagen"][i]["activiteitCode"]]["omschrijving"].substring(0,3));
												limburgAfvalbeheerDates.push(collectionDates["ophalingen"]["lijstVanOphaalDagen"][i]["datum"].substring(0,10) + "," + wasteType);
											}
										}

											// retrieve collection dates next month

										var xmlhttp4 = new XMLHttpRequest();
										xmlhttp4.onreadystatechange = function() {
											if (xmlhttp4.readyState == XMLHttpRequest.DONE) {
												var collectionDates = JSON.parse(xmlhttp4.responseText);
												if (collectionDates["ophalingen"]["lijstVanOphaalDagen"].length > 0) {
													for (var i = 0; i < collectionDates["ophalingen"]["lijstVanOphaalDagen"].length; i++) {
														wasteType = wasteTypeLimburg(collectionDates["activiteitenLegende"][collectionDates["ophalingen"]["lijstVanOphaalDagen"][i]["activiteitCode"]]["omschrijving"].substring(0,3));
														limburgAfvalbeheerDates.push(collectionDates["ophalingen"]["lijstVanOphaalDagen"][i]["datum"].substring(0,10) + "," + wasteType);
													}
												}
												var tmp = sortArray2(limburgAfvalbeheerDates, extraDates);
												for (i = 0; i < tmp.length; i++) {
													wasteDatesString = wasteDatesString + tmp[i] + "\n";
												}
												writeWasteDates(wasteDatesString, enableCreateICS);
											}
										}
										xmlhttp4.open("GET", "https://limburg.net/api-proxy/public/kalender/" + cityNumbers["nisCode"] + "/" + nextMonthY + "-" + nextMonthM + "?straatNummer=" + streetNumbers["nummer"] + "&huisNummer=" + wasteHouseNr, true);
										xmlhttp4.send();
									}
								}
								xmlhttp3.open("GET", "https://limburg.net/api-proxy/public/kalender/" + cityNumbers["nisCode"] + "/" + currentYear + "-" + currentMonth + "?straatNummer=" + streetNumbers["nummer"] + "&huisNummer=" + wasteHouseNr, true);
								xmlhttp3.send();
							}
						}
					}
					xmlhttp2.open("GET", "https://limburg.net/api-proxy/public/afval-kalender/gemeente/" + cityNumbers["nisCode"] + "/straten/search?query=" + wasteStreetName, true);
					xmlhttp2.send();
				}
			}
		}
		xmlhttp.open("GET", "https://limburg.net/api-proxy/public/afval-kalender/gemeenten/search?query=" + wasteCity, true);
		xmlhttp.send();
	}

	function wasteTypeLimburg(shortName) {
		switch (shortName) {
			case "Gft": return 3;		//gft
			case "Hui": return 0;		//huisvuil
			case "Pap": return 2;		//papier en karton
			case "Pmd": return 1;		//plastic metaal drankpakken
			case "tui": return 4;		//tuinafval
			default: break;
		}
		return "?";
	}

	function sortArray2(inputarray, extraDates) {
	
			var newArray = inputarray.concat(extraDates);
			newArray.sort();

			return newArray;
	}

	function writeWasteDates(wasteDatesString, enableCreateICS) {
   		var doc2 = new XMLHttpRequest();
   		doc2.open("PUT", "file:///var/volatile/tmp/wasteDates.txt");
   		doc2.send(wasteDatesString);

		// create ICS file for use in the calendar app when requested

		if (enableCreateICS) {
			var outputICS = "";
			var tmpICS = wasteDatesString.split("\n");

			for (var i = 0; i < tmpICS.length; i++) {
				if (tmpICS[i].length > 10) { 
					outputICS = outputICS + "BEGIN:VEVENT\r\n";
					outputICS = outputICS + "DTSTART;VALUE=DATE:" + tmpICS[i].substring(0,4) + tmpICS[i].substring(5,7) + tmpICS[i].substring(8,10) + "\r\n";
					outputICS = outputICS + "SUMMARY:" + wasteTypeFriendlyName(tmpICS[i].substring(11,12)) + "\r\n";
					outputICS = outputICS + "BEGIN:VEVENT\r\n";
				}
			}
   			var doc3 = new XMLHttpRequest();
   			doc3.open("PUT", "file:///var/volatile/tmp/wasteDates.ics");
   			doc3.send(outputICS);

		}
	}

