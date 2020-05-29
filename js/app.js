
const PWRD = new Auth("https://pwrd.xyz");

function setState(state) {
	$(".signin-button").hide();
	$(".signout-button").hide();
	$(".backup-button").hide();
	$(".auth-button").hide();
	$("#auth-loading").hide();
	$("#database").hide();
	$(".buttons-container").show();
	$("#blockstack-intro").hide();
	if(state == "authenticated") {
		$(".signout-button").show();
		$(".backup-button").show();
		$(".auth-button").show();
		$("#database").show();
		pwrdLoad();
	}
	if(state == "unauthenticated") {
		$(".signin-button").show();
		$("#blockstack-intro").show();
	}
	if(state == "loading") {
		$(".buttons-container").hide();
		$("#blockstack-intro").show();
		$("#auth-loading").show();
	}
}

function signIn() {
	setState("loading");
	PWRD.signIn();
}

function signOut() {
	PWRD.signOut();
	setState("unauthenticated");
}

setState("loading");
PWRD.auth(response => {
	if(response) {
		setState("authenticated");
	} else {
		setState("unauthenticated");
	}
});

let unsaved;
function queueSave() {
	if(unsaved) {
		clearTimeout(unsaved);
	}
	unsaved = setTimeout(async () => {
		await autoSave();
	}, 600);
}

async function autoSave(dialog) {
	await pwrdSave();
	if(dialog) {
		snackbar("Saved!", "#00AA00");
	}
	unsaved = false;
}

async function pwrdSave() {
	let data = encodeData();
	await PWRD.session.putFile("database", data);
	//snackbar("Saved!", "#00AA00");
}

async function pwrdLoad() {
	let data = await PWRD.session.getFile("database");
	openAuthLoad(data);
}

$(window).bind('beforeunload', event => {
	if(unsaved) {
		autoSave(true);
		return true;
	}
});
