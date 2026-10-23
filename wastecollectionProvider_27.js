//<provider>27</provider><version>2.0.0</version><parms>"zipcode,housenr"</parms>
//provider venlo.nl testdata: 5915PP 271
//2026-10-23: venlo.nl trash-calendar download no longer works, calendar moved to the Ximmio platform (wasteapi.ximmio.com)

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

       		var params = "companyCode=280affe9-1428-443b-895a-b90431b8ca31&postCode=" + wasteZipcode + "&houseNumber=" + wasteHouseNr + "&houseLetter=&houseNumberAddition=";
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "https://wasteapi.ximmio.com/api/FetchAdress", true);
        	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        	xmlhttp.setRequestHeader("Content-length", params.length);
        	xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var addressJson = JSON.parse(xmlhttp.responseText);
				if (!addressJson['dataList'] || addressJson['dataList'].length == 0) return;	// address unknown at Ximmio
				read2goMobileCalendar(addressJson['dataList'][0]['UniqueId'], addressJson['dataList'][0]['Community'] || "", extraDates, enableCreateICS);
			}
		}
		xmlhttp.send(params);
	}

	function read2goMobileCalendar(uniqueId, community, extraDates, enableCreateICS) {

		var now = new Date;
		var strMonNow = now.getMonth() + 1;
		if (strMonNow < 10) {
			strMonNow = "0" + strMonNow;
		}
		var strDayNow = now.getDate();
		if (strDayNow < 10) {
			strDayNow = "0" + strDayNow;
		}

		var later = new Date(now.getTime() + 31536000000); // 1 year later
		var strMonLater = later.getMonth() + 1;
		if (strMonLater < 10) {
			strMonLater = "0" + strMonLater;
		}
		var strDayLater = later.getDate();
		if (strDayLater < 10) {
			strDayLater = "0" + strDayLater;
		}

		var startDate = now.getFullYear() + "-" + strMonNow + "-" +  strDayNow;
		var endDate = later.getFullYear() + "-" + strMonLater + "-" +  strDayLater;
		var params = "companyCode=280affe9-1428-443b-895a-b90431b8ca31&uniqueAddressID=" + uniqueId + "&startDate=" + startDate + "&endDate=" + endDate + "&community=" + community;

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "https://wasteapi.ximmio.com/api/GetCalendar", true);
        	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        	xmlhttp.setRequestHeader("Content-length", params.length);
        	xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				var wasteDatesString = "";
				var wasteType = "";
				var mobileAfvalbeheerDates = [];
				var calendar2goMobile = JSON.parse(xmlhttp.responseText)
				for (var i= 0; i < calendar2goMobile['dataList'].length; i++) {
					for (var j= 0; j < calendar2goMobile['dataList'][i]['pickupDates'].length; j++) {
						if (calendar2goMobile['dataList'][i]['_pickupTypeText'] == "GREENGREY") {
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "," + wasteType2goMobile("GREEN"));
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "," + wasteType2goMobile("GREY"));
						} else {
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "," + wasteType2goMobile(calendar2goMobile['dataList'][i]['_pickupTypeText']));
						}
					}
				}
				var tmp = sortArray2(mobileAfvalbeheerDates, extraDates);

				for (i = 0; i < tmp.length; i++) {
					wasteDatesString = wasteDatesString + tmp[i] + "\n";
				}
				writeWasteDates(wasteDatesString, enableCreateICS);
			}
		}
		xmlhttp.send(params);
	}

	function wasteType2goMobile(shortName) {
		switch (shortName) {
			case "GREEN": return 3;		//groente/fruit
			case "PAPER": return 2;		//papier
			case "PACKAGES": return 1;	//pmd
			case "PACKAGESBAG": return 1;	//pmd zak venlo.nl
			case "PLASTIC": return 1;	//pmd
			case "VET": return 7;		//KGA meppel.nl
			case "GREY": return 0;		//restafval
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
