function clearAuthEntries() {
	$(".auth-entries").empty();
}

function addAuthEntry(key, value, loading) {
	let entry = $(document.createElement("div")).addClass("entry");
	
	if(loading) {
		entry.addClass("auth-loading");
	}
	
	let nameField = $(document.createElement("div"))
			.addClass("input entry-field entry-name")
			.append($(document.createElement("input"))
					.attr("placeholder", "Hint")
					.attr("readonly", loading)
					.attr("tabindex", loading ? -1 : 0)
					.val(key)
			);
	
	entry.append(nameField);
	
	let valueField = $(document.createElement("div"))
			.addClass("input entry-field entry-value")
			.append($(document.createElement("input"))
					.attr("placeholder", "Password")
					.val(value)
					.attr("type", "password")
					.focus(e => {
						e.target.type = "text";
					})
					.focusout(e => {
						e.target.type = "password";
					})
					.keypress(e => {
						if(e.keyCode == 13) {
							$(".auth-done-button").click();
						}
					})
			);
	
	entry.append(valueField);
	
	entry.find("input")
			.attr("size", "1");
	
	addButton(entry, 0, "remove", "res/remove.png", event => {
		entry.remove();
	});
	
	$(".auth-entries").append(entry);
	
	return entry;
}

function finishAuthLoad(dataEncrypted) {
	let data = decodeData(dataEncrypted);
	if(!data) {
		snackbar("Incorrect Login!", "#AA0000");
		return false;
	}
	snackbar("Loaded!", "#00AA00");
	loadDatabase(data);
	return true;
}

function openAuthLoad(dataEncrypted) {
	clearAuthEntries();
	
	new Sortable($(".auth-entries")[0], {
		disabled: true
	});
	
	let hints = decodeHints(dataEncrypted);
	if(hints.length == 0) {
		finishAuthLoad(dataEncrypted);
		closeAuth();
		return;
	}
	
	let first = true;
	for(let hint of hints) {
		let entry = addAuthEntry(hint, "", true);
		if(first) {
			entry.find(".entry-value input").focus();
			first = false;
		}
	}
	
	$(".auth-done-button").attr("value", "Done");
	
	$(".add-auth-item-button").hide();
	$(".auth-modal")
			.attr("show", true)
			.one("done cancelled", event => {
				if(event.type == "done") {
					readLogin();
					if(finishAuthLoad(dataEncrypted)) {
						closeAuth();
						$(event.target).off(event);
					}
				}
				if(event.type == "cancelled") {
					signOut();
				}
			});
}

function openAuthSave() {
	clearAuthEntries();
	
	new Sortable($(".auth-entries")[0], {
		animation: 150
	});
	
	for(let entry of databaseLogin) {
		addAuthEntry(entry.hint, entry.value, false);
	}
	
	$(".auth-done-button").attr("value", "Save");
	
	$(".add-auth-item-button").show();
	$(".auth-modal")
			.attr("show", true)
			.one("done cancelled", event => {
				if(event.type == "done") {
					readLogin();
					closeAuth();
					queueSave();
				}
			});
}

function readLogin() {
	databaseLogin = [];
	for(let entryElem of $(".auth-entries .entry")) {
		let entry = $(entryElem);
		databaseLogin.push({
			hint: entry.find(".entry-name input").val(),
			value: entry.find(".entry-value input").val()
		});
	}
}

function closeAuth() {
	$(".auth-modal").attr("show", false);
}

$(document).ready(() => {
	
	$(".auth-button").click(() => {
		openAuthSave();
	});
	
	$(".add-auth-item-button").click(() => {
		addAuthEntry("", "", false).find(".entry-name input").focus();
	});
	
	$(".auth-done-button").click(() => {
		$(".auth-modal").trigger("done");
	});
	
	$(".auth-cancel-button").click(() => {
		$(".auth-modal").trigger("cancelled");
		closeAuth();
	});
	
});
