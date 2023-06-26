//<provider>33</provider><version>1.1.0</version><parms>"Zipcode","HouseNr"</parms>
//provider homeassistant API (thanks to heyajohnny) testdata: https://trashapi.azurewebsites.net/trash?ZipCode=2992DL&HouseNumber=80&ShowWholeYear=true

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		var i = 0;
		var j = 0;
		var wasteDatesString = "";
		var wasteType = "";
		var wasteDatesArray = [];
		var inputArray = {};
		console.log("wastewaste:" + wasteZipcode + "-" + wasteHouseNr);

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					console.log(xmlhttp.responseText);
					inputArray = JSON.parse(xmlhttp.responseText);

					for (i=0;i < inputArray.length; i++) {

						console.log(inputArray[i]["date"].substring(0, 10) + "-" + inputArray[i]["name"])
						wasteType = wasteTypeCode(inputArray[i]["name"]);
						console.log(wasteType)
						wasteDatesArray.push(inputArray[i]["date"].substring(0, 10) + "," + wasteType);
					}

					var tmp = sortArray2(wasteDatesArray, extraDates);
					for (i = 0; i < tmp.length; i++) {
						wasteDatesString = wasteDatesString + tmp[i] + "\n";
					}
					writeWasteDates(wasteDatesString, enableCreateICS);
				}
			}
		} 
		xmlhttp.open("GET", "https://trashapi.azurewebsites.net/trash?ZipCode=" + wasteZipcode + "&HouseNumber=" + wasteHouseNr + "&ShowWholeYear=true", true);
		xmlhttp.send();
	}

	function wasteTypeCode(shortName) {
		switch (shortName) {
			case "Restafval": return 0;
			case "Gft": return 3;
			case "Papier": return 2;
			case "Pbd": return 1;
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
