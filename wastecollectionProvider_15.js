//<provider>15</provider><version>1.0.0</version><parms>"zipcode,housenr"</parms>
//provider afvalalert.nl testdata:9351XB 2

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		var i = 0;
		var j = 0;
		wasteDatesString = "";
		var wasteType = "";
		var alertDates = [];

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {

			if (xmlhttp.readyState == XMLHttpRequest.DONE) {

				var aNode = xmlhttp.responseText;

				// read specific waste collection dates

				i = aNode.indexOf('"date"');

				if ( i > 0 ) {
					while (i > 0) {
						j = aNode.indexOf('"type"', i);
						wasteType = wasteTypeAfvalalert(aNode.substring(j+8, j+11));
						alertDates.push(aNode.substring(i+8, i+18) + "," + wasteType);
						i = aNode.indexOf('"date"', j);
					}
				}
				var tmp = sortArray2(alertDates, extraDates);
				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.open("GET", "https://www.afvalalert.nl/kalender/" + wasteZipcode + "/" + wasteHouseNr, true);
		xmlhttp.send();
	}

	function wasteTypeAfvalalert(shortName) {
		switch (shortName) {
			case "gft": return 3;		//groente/fruit	
			case "res": return 0;		//huisvuil
			case "mil": return 1;		//milieu boer
			case "pap": return 2;		//papier
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

