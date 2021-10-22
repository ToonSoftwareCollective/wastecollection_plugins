//<provider>5</provider><version>1.0.0</version><parms>"fullICSUrl"</parms>
//provider katwijk.nl testdata: 2225PP 17

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

				i = aNode.indexOf("DTSTART");
				if (i > 0) {
					if (aNode.substring(i, i+18) == "DTSTART;VALUE=DATE") i = i + 11;
				}

				if ( i > 0 ) {
					while (i > 0) {
						j = aNode.indexOf("SUMMARY", i);

						wasteType = wasteTypeCode(aNode.substring(j+8, j+14));
						wasteDatesArray.push(aNode.substring(i+8, i+12) + "-" + aNode.substring(i+12, i+14) + "-" + aNode.substring(i+14, i+16) + "," + wasteType);

						i = aNode.indexOf("DTSTART", i + 10);
						if (i > 0) {
							if (aNode.substring(i, i+18) == "DTSTART;VALUE=DATE") i = i + 11;
						}
						console.log("look i="+ i);
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
			case "DUO": return 0;		//venlo.nl
			case "De res": return 0;	//area-afval.nl
			case "Het re": return 0;	//area-afval.nl
			case "Zet uw": return 0;	//area-afval.nl
			case "Het gf": return 3;	//area-afval.nl
			case "De con": return 1;	//area-afval.nl
			case "Groent": return 3;	//cyclusnv plus cureafvalbeheer gad.nl
			case "Groent": return 3;	//cyclusnv plus cureafvalbeheer gad.nl
			case "Groene": return 3;	//katwijk.nl
			case "GFT wo": return 3;	//cranendonck.nl
			case "Gft & ": return 3;	//hvcgroep.nl
			case "gft & ": return 3;	//hvcgroep.nl
			case "Gft-af": return 3;	//meppel.nl
			case "GFT - ": return 3;	//blink.nl
			case "Gft en": return 3;	//spaarnelanden.nl
			case "Papier": return 2;	//cureafvalbeheer plus cranendonck.nl gad.nl
			case "papier": return 2;	//hvc
			case "Oud pa": return 2;	//cyclusnv.nl
			case "Plasti": return 1;	//cyclusnv.nl plus cranendonck.nl gad.nl
			case "plasti": return 1;	//hvc
			case "PMD-za": return 1;	//cyclusnv.nl plus cranendonck.nl gad.nl
			case "PMD-af": return 1;	//cyclusnv.nl plus cranendonck.nl gad.nl
			case "PMD": return 1;		//rmn
			case "Restaf": return 0;	//cyclusnv plus cureafvalbeheer gad.nl
			case "restaf": return 0;	//hvc
			case "Grijze": return 0;	//katwijk.nl
			case "Rest w": return 0;	//cranendonck.nl
			case "Textie": return 5;	//gad.nl
			case "Chemok": return 7;	//veldhoven.nl
			case "Klein ": return 7;	//cyclus nv
			case "VET-go": return 7;	//meppel.nl
			case "GFT": return 3;
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

