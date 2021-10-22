//<provider>1</provider><version>1.0.1</version><parms>"zipcode,housenr"</parms>
//mijnafvalwijzer,nl (also used for provider 13, 22 and 31)

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	
		var i = 0;
		var j = 0;
		var k = 0;
		var l = 0;
		var endList = 0;

		wasteDatesString = "";
		var wasteType = "";
		var wasteCodeHTML = "";
		var resultDates = [];
		var mijnAfvalwijzerDates = [];
		var wasteDateYMD = "";
		var wasteYear = "";

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					var aNode = xmlhttp.responseText;

					// read specific waste collection dates

					i = aNode.indexOf("jaar-");
					j = aNode.indexOf('"', i);
					wasteYear = aNode.substring(i + 5,j);

					i = aNode.indexOf("#waste-", i);
					aNode = aNode.slice(i);
					i = 0;

					endList = aNode.indexOf("section");  //stop here

					if ( i < endList) {
						while (i < endList) {
							j = aNode.indexOf('"', i);
							wasteCodeHTML = aNode.substring(i + 7,j);
							j = aNode.indexOf('"' + wasteCodeHTML, i);

							k = aNode.indexOf('span-line-break', j);
							l = aNode.indexOf('<', k);

							resultDates =  aNode.substring(k + 1, l).split(" ");
	
							if (resultDates.length == 4) {
								wasteDateYMD = resultDates[3] + "-" + decodeMonth(resultDates[2]) + "-" + resultDates[1];
							} else {
								wasteDateYMD = wasteYear + "-" + decodeMonth(resultDates[2]) + "-" + resultDates[1];
							}

							if ((wasteCodeHTML == "rest- & gft-afval") || (wasteCodeHTML == "rest-gft") || (wasteCodeHTML == "restafval & gft") || (wasteCodeHTML == "restgft")) {   //split rest & gft in two dates
								wasteType = wasteTypeMijnafvalwijzer("restafval");
								i = aNode.indexOf("date");
								mijnAfvalwijzerDates .push(wasteDateYMD + "," + wasteType);
								wasteType = wasteTypeMijnafvalwijzer("gft");
								mijnAfvalwijzerDates .push(wasteDateYMD + "," + wasteType);
							} else {
								if ((wasteCodeHTML == "papier\\/pmd") || (wasteCodeHTML == "dhm")) {   //split papier and pmd in two dates
									wasteType = wasteTypeMijnafvalwijzer("papier");
									i = aNode.indexOf("date");
									mijnAfvalwijzerDates .push(wasteDateYMD + "," + wasteType);
									wasteType = wasteTypeMijnafvalwijzer("pmd");
									mijnAfvalwijzerDates .push(wasteDateYMD + "," + wasteType);		
								} else {
									wasteType = wasteTypeMijnafvalwijzer(wasteCodeHTML);
									i = aNode.indexOf("date");
									mijnAfvalwijzerDates .push(wasteDateYMD + "," + wasteType);
								}
							}

							i = aNode.indexOf("#waste-", l);
						}
					}

					var tmp = sortArray2(mijnAfvalwijzerDates , extraDates);
					for (i = 0; i < tmp.length; i++) {
						wasteDatesString = wasteDatesString + tmp[i] + "\n";
					}
					writeWasteDates(wasteDatesString, enableCreateICS);
				}
			}
		}
		xmlhttp.open("GET", "https://www.mijnafvalwijzer.nl/nl/" + wasteZipcode + "/" + wasteHouseNr, true);
		xmlhttp.send();
	}

	function decodeMonth(month) {

		switch (month) {
			case "januari": return "01";
			case "februari": return "02";
			case "maart": return "03";
			case "april": return "04";
			case "mei": return "05";
			case "juni": return "06";
			case "juli": return "07";
			case "augustus": return "08";
			case "september": return "09";
			case "oktober": return "10";
			case "november": return "11";
			case "december": return "12";
			default: break;
		}
		return "??";
	}

	function wasteTypeMijnafvalwijzer(shortName) {
			switch (shortName) {
				case "grofvuil": return 8;
				case "grofvuil\\/oud ijzer": return 8;
				case "tuinafval": return 4;
				case "papier": return 2;
				case "gft": return 3;
				case "gft-afval": return 3;
				case "gft+e(tensresten)": return 3;
				case "opk": return 2;
				case "pmd": return 1;
				case "gft ": return 3;
				case "groente, fruit en tuinafval": return 3;
				case "pbd": return 2;
				case "restafval": return 0;
				case "takken": return 4;
				case "kerstbomen": return 4;
				case "papier & karton": return 2;
				case "papier en karton": return 2;
				case "textiel": return 5;
				case "plastic verpakking & drankkartons": return 1;
				case "plastic, metalen en drankkartons": return 1;
				case "plastic": return 1;
				case "grofvuil (op afroep)": return 8;
				case "snoeihout (op afroep)": return 4;
				case "reinigen containers": return "z";
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

