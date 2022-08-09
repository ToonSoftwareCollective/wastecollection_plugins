//<provider>21</provider><version>1.0.1</version><parms>"manualcopyhtml"</parms>
//provider omrin.nl testdata: omrin.htm  9989BZ 39

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		var i = 0;
		var j = 0;
		var k = 0;
		var l = 0;
		var m = 0;
		var n = 0;
		wasteDatesString = "";
		var wasteType = "";
		var omrinAfvalbeheerDates = [];
		var omrinYear = "";
		var monthStr = "";
		var dayNr = "";

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var aNode = xmlhttp.responseText;

				i = aNode.indexOf("omrinDataGroups");
	 			aNode = aNode.slice(i);	
				i = aNode.indexOf("{");
	 			aNode = aNode.slice(i);
			
				// read year

				omrinYear = aNode.substring(2,6);

				//read sortibak entries

				i = aNode.indexOf("Sortibak");
				if (i > 0) {
					m = aNode.indexOf("dates", i);
	
					for (k = 1; k < 13; k++) {
	
						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {	
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",0");    //restafval
							}
						}
					}
				}

				//read restafval entries

				i = aNode.indexOf("Restafval");
				if (i > 0) {
					m = aNode.indexOf("dates", i);
	
					for (k = 1; k < 13; k++) {

						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",0");    //restafval
							}
						}
					}
				}

				//read biobak entries

				i = aNode.indexOf('"Biobak"');
				if (i > 0) {
					m = aNode.indexOf("dates", i);
	
					for (k = 1; k < 13; k++) {

						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",3");    //gft
							}
						}
					}
				}
	
				//read biobak zomerentries

				i = aNode.indexOf('"Biobak zomer"');
				if (i > 0) {
					m = aNode.indexOf("dates", i);
	
					for (k = 1; k < 13; k++) {

						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",3");    //gft
							}
						}
					}
				}
	
				//read biobak entries

				i = aNode.indexOf("GFT Afval");
				if (i > 0) {
					m = aNode.indexOf("dates", i);

					for (k = 1; k < 13; k++) {

						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
	
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",3");    //gft
							}
						}
					}
				}
	
				//read snoeiafval entries

				i = aNode.indexOf("Snoeiafval");
				if (i > 0) {
					m = aNode.indexOf("dates", i);

					for (k = 1; k < 13; k++) {

						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
	
						if ( m !== n+1) {
						for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",4");    //gft
							}
						}
					}
				}

				//read oudpapier entries (contribution by Arcidodo , thanks)

				i = aNode.indexOf("Oud papier en karton");
				if (i > 0) {
					m = aNode.indexOf("dates", i);

					for (k = 1; k < 13; k++) {
						monthStr = ("00" + k).slice(-2);
						i = aNode.indexOf('"' + k + '"', m);
						n = aNode.indexOf("[", i);
						m = aNode.indexOf("]", i);
						var monthDates = aNode.substring(n + 1, m).split(',');  //get array for the month
						if ( m !== n+1) {
							for (l = 0; l < monthDates.length; l++) {
								dayNr = ("00" + monthDates[l].replace(/['"]+/g, '')).slice(-2)
								omrinAfvalbeheerDates.push(omrinYear + "-" + monthStr + "-" + dayNr + ",2");    //oudpapier
							}
						}
					}
				}

				var tmp = sortArray2(omrinAfvalbeheerDates, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.open("GET", "file:///root/waste/omrin.htm", true);
		xmlhttp.send();
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
