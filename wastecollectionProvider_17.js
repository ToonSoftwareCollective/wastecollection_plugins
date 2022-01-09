//<provider>17</provider><version>1.0.1</version><parms>"zipcode,housenr"</parms>
//provider rd4info testdata:6444GL 10

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

		var i = 0;
		var j = 0;
		var k = 0;
		var l = 0;
		var m = 0;
		var d = new Date();
		var tmpdate = "";
		var n = "yyyy-mm-dd";
		wasteDatesString = "";
		var wasteType = "";
		var cureAfvalbeheerDates = [];

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {

			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var aNode = xmlhttp.responseText;

				// read specific waste collection dates

				i = aNode.indexOf("<strong>Januari");
				j = aNode.indexOf("</div>", i);
				k = aNode.indexOf("<td>", i);
				while ( k < j ) {
					l = aNode.indexOf("</td>", k);
					m = aNode.indexOf(" ", k);
					tmpdate = aNode.substring(m+1, l);
					tmpdate = tmpdate.replace("januari", "january");
					tmpdate = tmpdate.replace("februari", "february");
					tmpdate = tmpdate.replace("maart", "march");
					tmpdate = tmpdate.replace("juni", "june");
					tmpdate = tmpdate.replace("mei", "may");
					tmpdate = tmpdate.replace("juli", "july");
					tmpdate = tmpdate.replace("augustus", "august");
					tmpdate = tmpdate.replace("oktober", "october");
					d = new Date(tmpdate);
					n = formatDate(d);
					k = aNode.indexOf("<td>", l);
					l = aNode.indexOf("</td>", k);
					wasteType = wasteTypeRd4info(aNode.substring(k+4, l));
					cureAfvalbeheerDates.push(n + "," + wasteType);
					k = aNode.indexOf("<td>", l);
					if (k < 0) k = j;
				}
				var tmp = sortArray2(cureAfvalbeheerDates, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		} 
		xmlhttp.open("GET", "https://www.rd4info.nl/NSI/Burger/Aspx/afvalkalender_public_text.aspx?pc=" + wasteZipcode + "&nr=" + wasteHouseNr + "&t=", true);
		xmlhttp.send();
	}

	function wasteTypeRd4info(shortName) {
		switch (shortName) {
			case "GFT": return 3;		//groente/fruit	
			case "Restafval": return 0;		//huisvuil
			case "PMD-afval": return 1;		//plastic metaal drankpakken
			case "Oud papier": return 2;		//papier en karton
			case "Snoeiafval op afspraak": return 4;		//tuin en snoeiafval
			case "Kerstbomen": return "#";		//kerstbomen
			case "BEST-tas": return "!";		//BEST-tas
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

