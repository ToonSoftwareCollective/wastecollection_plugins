//<provider>11</provider><version>1.0.0</version><parms>"ICSId"</parms>
//provider DenHaag.nl 0518200000639572

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	
		var i = 0;
		var j = 0;
		wasteDatesString = "";
		var wasteType = "";
		var cureAfvalbeheerDates = [];

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var aNode = xmlhttp.responseText;

				// read specific waste collection dates

				i = aNode.indexOf("DTSTART");
				if (i > 0) {
					if (aNode.substring(i, i+18) == "DTSTART;VALUE=DATE") i = i + 11;
				}


				if ( i > 0 ) {
					while (i > 0) {
						j = aNode.indexOf("SUMMARY", i);
						wasteType = wasteTypeDenHaag(aNode.substring(j+8, j+11));
						cureAfvalbeheerDates.push(aNode.substring(i+8, i+12) + "-" + aNode.substring(i+12, i+14) + "-" + aNode.substring(i+14, i+16) + "," + wasteType);
						i = aNode.indexOf("DTSTART", i + 10);
						if (i > 0) {
							if (aNode.substring(i, i+18) == "DTSTART;VALUE=DATE") i = i + 11;
						}

					}
				}
				var tmp = sortArray2(cureAfvalbeheerDates, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.open("GET", "https://huisvuilkalender.denhaag.nl/ical/" + wasteICSId, true);
		xmlhttp.send();
	}

	function wasteTypeDenHaag(shortName) {
		switch (shortName) {
			case "GFT": return 3;
			case "Res": return 0;
			case "Pap": return 2;
			case "Ker": return 4;
			case "Gro": return 3;
			case "Pap": return 2;
			case "PMD": return 1;
			case "Tex": return 5;
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

