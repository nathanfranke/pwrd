function clearEntries() {
	$(".entries").empty();
}

function copyCallback(forElement) {
	return event => {
		let input = forElement.find("input");
		
		input.select();
		document.execCommand("copy");
		input.blur();
		snackbar("Copied!");
	}
}

function randomCallback(forElement) {
	return event => {
		openGenerator(forElement.find("input"));
	}
}

function addButton(forElement, n, type, src, callback) {
	let button = $(document.createElement("img"));
	button.addClass("input-button");
	
	button.attr("src", src);
	button.attr("buttonType", type);
	button.click(callback);
	
	forElement.append(button);
}

function addEntry(name, key, value) {
	let entry = $(document.createElement("div")).addClass("entry entry-item");
	
	let nameField = $(document.createElement("div"))
			.addClass("input entry-field entry-item-name")
			.append($(document.createElement("input"))
					.attr("placeholder", "Name")
					.val(name)
			);
	
	entry.append(nameField);
	
	let keyField = $(document.createElement("div"))
			.addClass("input entry-field entry-item-key")
			.append($(document.createElement("input"))
					.attr("placeholder", "Key")
					.val(key)
			);
	
	entry.append(keyField);
	
	addButton(keyField, 0, "copy", "res/copy.png", copyCallback(keyField));
	
	let valueField = $(document.createElement("div"))
			.addClass("input entry-field entry-item-value")
			.append($(document.createElement("input"))
					.attr("placeholder", "Password")
					.val(value)
			);
	
	entry.append(valueField);
	
	addButton(valueField, 0, "copy", "res/copy.png", copyCallback(valueField));
	addButton(valueField, 1, "random", "res/random.png", randomCallback(valueField));
	
	entry.find(".entry-item-key input,.entry-item-value input")
			.attr("type", "password")
			.focus(e => {
				e.target.type = "text";
			})
			.focusout(e => {
				e.target.type = "password";
			});
	
	entry.find("input")
			.attr("autocomplete", "off")
			.attr("size", "1")
			.on("input", event => {
				queueSave();
			});
	
	entry.find(".entry-item-key > input,.entry-item-value > input").on("_ready input", event => {
		let e = $(event.target);
		let parent = e.parent();
		let css;
		if(e.val()) {
			css = {"flex-grow": 1.0};
			parent.find(".input-button[buttonType=\"copy\"]").css("display", "initial");
		} else {
			css = {"flex-grow": 0.0};
			parent.find(".input-button[buttonType=\"copy\"]").css("display", "none");
		}
		if(event.type == "_ready") {
			parent.css(css);
		} else {
			parent.animate(css, 300);
		}
	}).trigger("_ready");
	
	addButton(entry, 0, "remove", "res/remove.png", event => {
		entry.remove();
		queueSave();
	});
	
	let entries = $(".entries");
	entries.append(entry);
	
	return entry;
}

function addSeparator(title) {
	let separator = $(document.createElement("div")).addClass("entry entry-separator");
	
	let nameField = $(document.createElement("div"))
			.addClass("input entry-field entry-separator-title")
			.append($(document.createElement("input"))
					.attr("placeholder", "Separator")
					.val(title)
			);
	
	separator.append(nameField);
	
	separator.find("input")
			.attr("autocomplete", "off")
			.attr("size", "1")
			.on("input", event => {
				queueSave();
			});
	
	addButton(separator, 0, "remove", "res/remove.png", event => {
		separator.remove();
		queueSave();
	});
	
	let entries = $(".entries");
	entries.append(separator);
	
	return separator;
}

function loadDatabase(entries) {
	clearEntries();
	if(entries) {
		for(let entry of entries) {
			if(entry.type == "item") {
				addEntry(entry.name, entry.key, entry.value);
			}
			if(entry.type == "separator") {
				addSeparator(entry.title);
			}
		}
	}
	$(".search input").focus();
}

function updateSearch() {
	let filter = $(".search input").val().toLowerCase();
	
	let showSeparator = false;
	$(".entries").find(".entry").each((i, itemElem) => {
		let item = $(itemElem);
		
		function match(s) {
			return s.toLowerCase().includes(filter);
		}
		
		let show = false;
		
		if(item.hasClass("entry-separator")) {
			showSeparator = match(item.find(".entry-separator-title input").val());
			show = true;
		}
		if(item.hasClass("entry-item")) {
			show |= match(item.find(".entry-item-name input").val());
		}
		
		show |= showSeparator;
		
		if(show) {
			item.show();
		} else {
			item.hide();
		}
	});
}

$(document).ready(() => {
	loadDatabase();
	
	$(".add-item-button").click(() => {
		addEntry("", "", "").find(".entry-item-name input").focus();
		queueSave();
	});
	
	$(".add-separator-button").click(() => {
		addSeparator("").find(".entry-separator-title input").focus();
		queueSave();
	});
	
	$(".search input").val("").on("input", updateSearch);
	
	new Sortable($(".entries")[0], {
		animation: 150,
		onSort: queueSave
	});
});
