var snackbarTimeout;
function snackbar(text, color) {
	color = color || "#00AA00";
	
	$(".snackbar")
			.html(text)
			.css("background-color", color)
			.attr("show", true);
	
	clearTimeout(snackbarTimeout);
	snackbarTimeout = setTimeout(() => {
		$(".snackbar")
				.attr("show", false);
	}, 2500);
}

$(document).ready(() => {
	$(".snackbar").click(event => {
		clearTimeout(snackbarTimeout);
		$(event.target).attr("show", false);
	});
});
