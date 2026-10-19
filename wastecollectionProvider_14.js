//<provider>14</provider><version>2.0.0</version><parms>"zipcode,housenr"</parms>
//rova.nl
//2026-10-19: rova.nl replaced their html calendar page with a JSON API, see issue #3. Now using https://www.rova.nl/api/waste-calendar/upcoming

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		wasteDatesString = "";
		var rovaDates = [];
		var searchHouseNr = "";
		var searchHouseAddition = "";

		// split housenr and housenr addition (e.g. "12-a" -> houseNumber=12, addition=a)

		if (wasteHouseNr.indexOf("-") > 0) {
			var myHouseArray = wasteHouseNr.split("-");
			searchHouseNr = myHouseArray[0];
			searchHouseAddition = myHouseArray[1];
		} else {
			searchHouseNr = wasteHouseNr;
		}

		var searchZipcode = wasteZipcode.replace(/\s+/g, "").toUpperCase();

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					var rovaCalendar = JSON.parse(xmlhttp.responseText);

					for (var i = 0; i < rovaCalendar.length; i++) {
						if (rovaCalendar[i]['date'] && rovaCalendar[i]['wasteType']) {
							var wasteDateYMD = rovaCalendar[i]['date'].substring(0,10);
							var wasteType = wasteTypeRova(rovaCalendar[i]['wasteType']['code']);
							rovaDates.push(wasteDateYMD + "," + wasteType);
						}
					}

					var tmp = sortArray2(rovaDates, extraDates);
					for (i = 0; i < tmp.length; i++) {
						wasteDatesString = wasteDatesString + tmp[i] + "\n";
					}
					writeWasteDates(wasteDatesString, enableCreateICS);
				}
			}
		}
		var rovaUrl = "https://www.rova.nl/api/waste-calendar/upcoming?postalcode=" + searchZipcode + "&houseNumber=" + searchHouseNr + "&addition=" + searchHouseAddition + "&take=100";
		xmlhttp.open("GET", rovaUrl, true);
		console.log("Wastecollection: " + rovaUrl);
		xmlhttp.send();
	}

	function wasteTypeRova(shortCode) {
			switch (shortCode.toUpperCase()) {
				case "RST": return 0;			//restafval
				case "PMD": return 1;			//pmd
				case "PAP": return 2;			//papier
				case "LOSPAP": return 2;		//papier
				case "GFT": return 3;			//gft
				case "TAK": return 4;			//tak/snoeiafval
				case "SNOEI": return 4;		//snoeiafval
				case "TEX": return 5;			//textiel
				case "GLAS": return 2;			//glas
				case "KCA": return 7;			//kca
				case "GROF": return 8;			//grofvuil
				case "GROFVUIL": return 8;		//grofvuil
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
		doc2.onreadystatechange=function() {
			if (doc2.readyState === 4){
				if (doc2.status === 0) {
					updateWasteIcon("no");
				}
			}
		}
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
