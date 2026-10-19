//<provider>56</provider><version>1.0.0</version><parms>"ICSId"</parms>
//provider saver.nl testdata:https://saver.nl/ical/0748200000040608

function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

	var i = 0;
	var j = 0;
	var wasteDatesString = "";
	var wasteType = "";
	var wasteDatesArray = [];

	var addrReq = new XMLHttpRequest();
	var addrUrl = "https://saver.nl/adressen/" + wasteZipcode + ":" + wasteHouseNr;

	addrReq.onreadystatechange = function () {
		if (addrReq.readyState == 4) {
			if (addrReq.status == 200) {

				var addrData;
				try {
					addrData = JSON.parse(addrReq.responseText);
				} catch (e) {
					updateWasteIcon("error");
					return;
				}

				if (!addrData || !addrData[0] || !addrData[0].bagid) {
					updateWasteIcon("error");
					return;
				}

				// STEP 2: Use BAG-id for ICAL
				readCalendarByBagId(addrData[0].bagid);
			} else {
				updateWasteIcon("error");
			}
		}
	};

	addrReq.open("GET", addrUrl, true);
	addrReq.send();


	function readCalendarByBagId(bagId) {

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {

				if (xmlhttp.status == 200) {

					var aNode = xmlhttp.responseText;

					i = aNode.indexOf("DTSTART");
					if (i > 0) {
						if (aNode.substring(i, i + 18) == "DTSTART;VALUE=DATE") i = i + 11;
					}

					if (i > 0) {
						while (i > 0) {

							j = aNode.indexOf("SUMMARY", i);

							wasteType = wasteTypeCode(aNode.substring(j + 8, j + 22));

							wasteDatesArray.push(
								aNode.substring(i + 8, i + 12) + "-" +
								aNode.substring(i + 12, i + 14) + "-" +
								aNode.substring(i + 14, i + 16) + "," +
								wasteType
							);

							i = aNode.indexOf("DTSTART", i + 10);
							if (i > 0) {
								if (aNode.substring(i, i + 18) == "DTSTART;VALUE=DATE") i = i + 11;
							}
						}
					}
				}

				var tmp = sortArray2(wasteDatesArray, extraDates);
				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}

				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		};

		xmlhttp.open("GET", "https://saver.nl/ical/" + bagId, true);
		xmlhttp.send();
	}
}

function wasteTypeCode(summary) {
	if (summary.indexOf("Groente") >= 0) return 3;
	if (summary.indexOf("Papier") >= 0) return 2;
	if (summary.indexOf("PBD") >= 0) return 1;
	if (summary.indexOf("Restafval") >= 0) return 0;
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
	doc2.onreadystatechange = function () {
		if (doc2.readyState === 4) {
			if (doc2.status === 0) {
				updateWasteIcon("no");
			}
		}
	};
	doc2.send(wasteDatesString);


	if (enableCreateICS) {

		var outputICS = "";
		var tmpICS = wasteDatesString.split("\n");

		for (var i = 0; i < tmpICS.length; i++) {
			if (tmpICS[i].length > 10) {
				outputICS = outputICS + "BEGIN:VEVENT\r\n";
				outputICS = outputICS + "DTSTART;VALUE=DATE:" +
					tmpICS[i].substring(0, 4) +
					tmpICS[i].substring(5, 7) +
					tmpICS[i].substring(8, 10) + "\r\n";
				outputICS = outputICS + "SUMMARY:" +
					wasteTypeFriendlyName(tmpICS[i].substring(11, 12)) + "\r\n";
				outputICS = outputICS + "BEGIN:VEVENT\r\n";
			}
		}

		var doc3 = new XMLHttpRequest();
		doc3.open("PUT", "file:///var/volatile/tmp/wasteDates.ics");
		doc3.send(outputICS);
	}
}
