//<provider>9</provider><version>1.0.0</version><parms>"manualcopy"</parms>
//provider iok.be Arendonk Lusthoven

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	
		var i = 0;
		var j = 0;
		wasteDatesString = "";
		var wasteType = "";
		var wasteDatesArray = [];

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var aNode = xmlhttp.responseText;

				// read specific waste collection dates

				i = aNode.indexOf("BEGIN:VEVENT");
				console.log("i="+ i);

				if ( i > 0 ) {
					while (i > 0) {
						j = aNode.indexOf("SUMMARY", i);
						console.log("j="+ j);

						wasteType = wasteTypeIokBe(aNode.substring(j+8, j+10));
						console.log("wt="+ wasteType );


						i = aNode.indexOf("DTSTART",j);
						console.log("i2="+ i);
						if (wasteType !== 8) {   // ignore 8 and 6 (groot vuil and steen/puin)
							if (wasteType !== 6) {
								wasteDatesArray.push(aNode.substring(i+19, i+23) + "-" + aNode.substring(i+23, i+25) + "-" + aNode.substring(i+25, i+27) + "," + wasteType);
							}
						}

						i = aNode.indexOf("BEGIN:VEVENT", j);

					}
				}
				var tmp = sortArray2(wasteDatesArray, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.open("GET", "file:///root/waste/waste_calendar.ics", true);
		xmlhttp.send();
	}

	function wasteTypeIokBe(shortName) {
		switch (shortName) {
			case "GV": return 8;		//groot vuil
			case "KG": return 7;		//klein gevaarlijk (chemisch) afval
			case "SP": return 6;		//steen, puin
			case "TE": return 5;		//textiel
			case "GF": return 3;
			case "P/": return 2;
			case "PM": return 1;
			case "RA": return 0;
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

