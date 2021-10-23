//<provider>36</provider><version>1.0.0</version><parms>"zipcode,housenr"</parms>
//provider hellendoorn.nl testdata: 7447EG 42

	function readCalendar(wasteZipcode, wasteHouseNr, extraDates, enableCreateICS, wasteICSId, wasteStreet, wasteStreetName, wasteCity, wasteFullICSUrl) {

       		var params = "companyCode=24434f5b-7244-412b-9306-3a2bd1e22bc1&postCode=" + wasteZipcode + "&houseNumber=" + wasteHouseNr + "&houseLetter=&houseNumberAddition=";
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "https://wasteapi.2go-mobile.com/api/FetchAdress", true);
        	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        	xmlhttp.setRequestHeader("Content-length", params.length);
        	xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				addressJson = JSON.parse(xmlhttp.responseText);
				read2goMobileCalendar(addressJson['dataList'][0]['UniqueId']);
			}
		}
		xmlhttp.send(params);
	}

	function read2goMobileCalendar(uniqueId) {

		var now = new Date;
		var strMonNow = now.getMonth() + 1;
		if (strMonNow < 10) {
			strMonNow = "0" + strMonNow;
		}
		var strDayNow = now.getDate();
		if (strDayNow < 10) {
			strDayNow = "0" + strDayNow;
		}

		var later = new Date(now.getTime() + 7772000000); // 3 months later
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
		var params = "companyCode=24434f5b-7244-412b-9306-3a2bd1e22bc1&uniqueAddressId=" + uniqueId + "&startDate=" + startDate + "&endDate=" + endDate;

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "https://wasteapi.2go-mobile.com/api/GetCalendar", true);
        	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        	xmlhttp.setRequestHeader("Content-length", params.length);
        	xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				wasteDatesString = "";
				var wasteType = "";
				var mobileAfvalbeheerDates = [];
				var calendar2goMobile = JSON.parse(xmlhttp.responseText)
				for (var i= 0; i < calendar2goMobile['dataList'].length; i++) {
					for (var j= 0; j < calendar2goMobile['dataList'][i]['pickupDates'].length; j++) {
						if (calendar2goMobile['dataList'][i]['_pickupTypeText'] == "GREENGREY") {
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "-" + wasteType2goMobile("GREEN"));
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "-" + wasteType2goMobile("GREY"));
						} else {
							mobileAfvalbeheerDates.push(calendar2goMobile['dataList'][i]['pickupDates'][j].substring(0,10) + "-" + wasteType2goMobile(calendar2goMobile['dataList'][i]['_pickupTypeText']));
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

