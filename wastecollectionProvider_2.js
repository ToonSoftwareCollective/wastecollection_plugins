//<provider>2</provider><version>1.0.0</version><parms>"zipcode,housenr"</parms>
//provider deafvalapp, testdata:5831NG 2


	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	
		var indexGFT = 0;
		var indexPAPIER = 0;
		var indexREST = 0;
		var indexPLASTIC = 0;	

		var i = 0;
		var j = 0;
		wasteDatesString = "";
		var wasteType = "";
		var fileDate = "";
		var lastGFTfileDate = "";
		var lastPAPIERfileDate = "";
		var lastPLASTICfileDate = "";
		var lastRESTfileDate = "";
		var deafvalappDates = [];

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					var aNode = xmlhttp.responseText;

					// read start index of all wastetypes

					indexGFT = aNode.indexOf("GFT");
					indexPAPIER = aNode.indexOf("PAPIER");
					indexPLASTIC = aNode.indexOf("PLASTIC");
					if (indexPLASTIC < 0) indexPLASTIC = aNode.indexOf("PMD");
					if (indexPLASTIC < 0) indexPLASTIC = aNode.indexOf("PBP");
					indexREST = aNode.indexOf("REST");
					if (indexREST < 0) indexREST = aNode.indexOf("ZAK_BLAUW");


					// find first dates in the future of each type - GFT for 2 years
 
					if (indexGFT > -1) {
						i = aNode.indexOf(';', indexGFT);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_3")
							i = aNode.indexOf(';', i+1);
						}
					}
					indexGFT = aNode.indexOf("GFT", indexGFT + 10); //process second year block if available
					if (indexGFT > -1) {
						i = aNode.indexOf(';', indexGFT);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_3")
							i = aNode.indexOf(';', i+1);
						}
					}
					
					// find first dates in the future of each type - PAPIER

					if (indexPAPIER > -1) {
						i = aNode.indexOf(';', indexPAPIER);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_2")
							i = aNode.indexOf(';', i+1);
						}
					}
					indexPAPIER = aNode.indexOf("PAPIER", indexPAPIER + 10);
					if (indexPAPIER > -1) {
						i = aNode.indexOf(';', indexPAPIER);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_2")
							i = aNode.indexOf(';', i+1);
						}
					}
					
					// find first dates in the future of each type - PLASTIC

					if (indexPLASTIC > -1) {
						i = aNode.indexOf(';', indexPLASTIC);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_1")
							i = aNode.indexOf(';', i+1);
						}
					}
					var indexPLASTIC2 = aNode.indexOf("PLASTIC", indexPLASTIC  + 10);
					if (indexPLASTIC2 < 0) indexPLASTIC2 = aNode.indexOf("PMD", indexPLASTIC  + 10);
					if (indexPLASTIC2 < 0) indexPLASTIC2 = aNode.indexOf("PBP", indexPLASTIC  + 10);
					if (indexPLASTIC2 > -1) {
						i = aNode.indexOf(';', indexPLASTIC2);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_1")
							i = aNode.indexOf(';', i+1);
						}
					}
					
					// find first dates in the future of each type - REST

					if (indexREST > -1) {
						i = aNode.indexOf(';', indexREST);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_0")
							i = aNode.indexOf(';', i+1);
						}
					}
					var indexREST2 = aNode.indexOf("REST", indexREST + 10);
					if (indexREST2 < 0) indexREST2 = aNode.indexOf("ZAK_BLAUW", indexREST + 10);
					if (indexREST2 > -1) {
						i = aNode.indexOf(';', indexREST2);
						while (aNode.substring(i+7, i+9) == "20") {
							fileDate = aNode.substring(i+7, i + 11) + "-" + aNode.substring(i+4, i+6) + "-" + aNode.substring(i+1, i+3);
							deafvalappDates.push(fileDate + "_0")
							i = aNode.indexOf(';', i+1);
						}
					}
					

					// sort dates

					var tmp = sortArray2(deafvalappDates, extraDates);

					for (i = 0; i < tmp.length; i++) {
						wasteDatesString = wasteDatesString + tmp[i] + "\n";
					}
					writeWasteDates(wasteDatesString, enableCreateICS);
				}
			}
		}
		xmlhttp.open("GET", "http://dataservice.deafvalapp.nl/dataservice/DataServiceServlet?service=OPHAALSCHEMA&land=NL&postcode=" + wasteZipcode + "&huisnr=" + wasteHouseNr + "&huisnrtoev=", true);
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

