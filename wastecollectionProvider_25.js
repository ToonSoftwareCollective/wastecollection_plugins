//<provider>25</provider><version>1.0.2</version><parms>"fullICSUrl"</parms>
//provider area-afval.nl testdata: 7908MH 40 https://wasteapi.ximmio.com/api/CallIcal?cn=Area Reiniging&x=adc418da-d19b-11e5-ab30-625662870761&ty=Hoogeveen&ua=1000012565&sd=2020-12-21&ed=2024-01-09&path=https://wasteapi.ximmio.com&ln=nl&nt=7

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		var i = 0;
		var j = 0;
		var k = 0;
		wasteDatesString = "";
		var wasteType = "";
		var wasteDatesArray = [];

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

						wasteType = wasteTypeCode(aNode.substring(j+8, j+11));
						wasteDatesArray.push(aNode.substring(i+8, i+12) + "-" + aNode.substring(i+12, i+14) + "-" + aNode.substring(i+14, i+16) + "," + wasteType);

						k = aNode.indexOf("END:VEVENT", j);
						if (k < 0) {
							i = -1;
						} else {
							i = aNode.indexOf("DTSTART", k);
						}

						if (i > 0) {
							if (aNode.substring(i, i+18) == "DTSTART;VALUE=DATE") i = i + 11;
						}
					}
				}
				var tmp = sortArray2(wasteDatesArray, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.open("GET", wasteFullICSUrl, true);
		xmlhttp.send();
	}

	function wasteTypeCode(shortName) {  
		switch (shortName) {
			case "GFT": return 3;
			case "Gft": return 3;
			case "gft": return 3;
			case "Res": return 0;
			case "Hui": return 0;
			case "Pla": return 1;
			case "Gla": return 2;
			case "PMD": return 1;
			case "Pmd": return 1;
			case "pdb": return 1;
			case "Ver": return 1;
			case "Pap": return 2;
			case "Ker": return "#";
			case "Tak": return 4;
			case "Tex": return 5;
			case "KCA": return 7;
			case "Gro": return 8;
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

