//<provider>17</provider><version>1.0.2</version><parms>"zipcode,housenr"</parms>
//provider rd4info testdata:6444GL 10
//provider rd4info via officiële JSON API

function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {
	var wasteDatesString = "";
	var cureAfvalbeheerDates = [];
	var xmlhttp = new XMLHttpRequest();
	var year = new Date().getFullYear();

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === XMLHttpRequest.DONE) {
			if (xmlhttp.status === 200) {
				var json = JSON.parse(xmlhttp.responseText);
				if (json.success && json.data && json.data.items && json.data.items.length > 0) {
					var afvalItems = json.data.items[0]; // data.items is een array met 1 object waarin dates zitten

					for (var i = 0; i < afvalItems.length; i++) {
						var date = afvalItems[i].date; // formaat: yyyy-mm-dd
						var type = afvalItems[i].type; // bv: residual_waste
						var wasteType = wasteTypeRd4api(type);

						if (wasteType !== "?") {
							cureAfvalbeheerDates.push(date + "," + wasteType);
						}
					}

					var tmp = sortArray2(cureAfvalbeheerDates, extraDates);

					for (var i = 0; i < tmp.length; i++) {
						wasteDatesString = wasteDatesString + tmp[i] + "\n";
					}
					writeWasteDates(wasteDatesString, enableCreateICS);
				}
			} else {
				updateWasteIcon("error");
			}
		}
	}

	var url = "https://data.rd4.nl/api/v1/waste-calendar?postal_code=" + encodeURIComponent(wasteZipcode) + "&house_number=" + wasteHouseNr + "&house_number_extension=&year=" + year;
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function wasteTypeRd4api(apiType) {
	switch (apiType) {
		case "gft": return 3;               // Groente/fruit/tuinafval
		case "residual_waste": return 0;   // Restafval
		case "pmd": return 1;              // Plastic/Metaal/Drankkartons
		case "paper": return 2;            // Papier
		case "pruning_waste": return 4;    // Snoeiafval
		case "christmas_trees": return "#";// Kerstbomen
		case "best_bag": return "!";       // BEST-tas
		default: return "?";               // Onbekend type
	}
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
				outputICS += "BEGIN:VEVENT\r\n";
				outputICS += "DTSTART;VALUE=DATE:" + tmpICS[i].substring(0, 4) + tmpICS[i].substring(5, 7) + tmpICS[i].substring(8, 10) + "\r\n";
				outputICS += "SUMMARY:" + wasteTypeFriendlyName(tmpICS[i].substring(11, 12)) + "\r\n";
				outputICS += "END:VEVENT\r\n";
			}
		}

		var doc3 = new XMLHttpRequest();
		doc3.open("PUT", "file:///var/volatile/tmp/wasteDates.ics");
		doc3.send(outputICS);
	}
}

function wasteTypeFriendlyName(typeChar) {
	switch (typeChar) {
		case "0": return "Restafval";
		case "1": return "PMD-afval";
		case "2": return "Papier";
		case "3": return "GFT";
		case "4": return "Snoeiafval";
		case "#": return "Kerstboom";
		case "!": return "BEST-tas";
		default: return "Onbekend";
	}
}
