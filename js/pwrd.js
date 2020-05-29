var databaseLogin = [];

function stringifyLogin() {
	let s = "";
	for(let login of databaseLogin) {
		s += ";" + btoa(login.value);
	}
	return "Auth;" + s.slice(1);
}

function getEntries() {
	let entries = [];
	$(".entries").find(".entry").each((i, itemElem) => {
		let entry = $(itemElem);
		if(entry.hasClass("entry-item")) {
			entries.push({
				type: "item",
				name: entry.find(".entry-item-name input").val(),
				key: entry.find(".entry-item-key input").val(),
				value: entry.find(".entry-item-value input").val()
			});
		}
		if(entry.hasClass("entry-separator")) {
			entries.push({
				type: "separator",
				title: entry.find(".entry-separator-title input").val()
			});
		}
	});
	
	return entries;
}

function encodeData() {
	let entries = getEntries();
	
	let private = CryptoJS.AES.encrypt(btoa(JSON.stringify(entries)), stringifyLogin()).toString();
	
	let hints = [];
	for(let login of databaseLogin) {
		hints.push(login.hint);
	}
	
	let s = JSON.stringify({
		hints: hints,
		private: private
	});
	
	return btoa(s);
}

function decodeHints(encoded) {
	let data = JSON.parse(atob(encoded));
	
	return data.hints;
}

function decodeData(encoded) {
	let data = JSON.parse(atob(encoded));
	
	try {
		let decrypted = CryptoJS.AES.decrypt(data.private, stringifyLogin()).toString(CryptoJS.enc.Utf8);
		let entries = JSON.parse(atob(decrypted));
		
		return entries;
	} catch(error) {
		return false;
	}
}

function download(filename, text) {
	var element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
	element.setAttribute("download", filename);
	
	//element.style.display = "none";
	//document.body.appendChild(element);
	
	element.click();
	
	//document.body.removeChild(element);
}

function backup() {
	let timestamp = new Date().toISOString().replace(/T/, "_").replace(/:/g, "-").replace(/\..+/, "");
	
	let s = `PWRD Backup\nCreated ${timestamp}\n\n`;
	
	let entries = getEntries();
	
	for(let entry of entries) {
		if(entry.type == "item") {
			s += `${encodeURIComponent(entry.name)} - ${encodeURIComponent(entry.key)}:${encodeURIComponent(entry.value)}\n`;
		}
	}
	
	download("PWRD " + timestamp, s);
}
