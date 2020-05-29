var generatorTimeouts = [];

var generatorLength;
var generatorFeatures = [];
var generatorExclude = [];

var generatorField;

var generatorResult;

function clearGeneratorTimeouts() {
	generatorTimeouts.forEach(t => clearTimeout(t));
	generatorTimeouts = [];
	
	$(".generator-result").val(generatorResult);
	if(generatorField) {
		generatorField.val(generatorResult);
		queueSave();
	}
}

let generatorFiller = "!@#$%^&*0123456789";

function updateGenerator(initial) {
	
	clearGeneratorTimeouts();
	
	let content = {};
	
	let add = (list, eachWeight) => {
		$.each(list, (i, e) => {
			content[e] = (content[e] || 0) + eachWeight;
		});
	}
	
	if(generatorFeatures.includes("lowercase")) {
		add("abcdefghijklmnopqrstuvwxyz".split(""), 1);
	}
	if(generatorFeatures.includes("uppercase")) {
		add("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), 1);
	}
	if(generatorFeatures.includes("numbers")) {
		add("0123456789".split(""), 1);
	}
	if(generatorFeatures.includes("symbols")) {
		add("!@#$%^&*".split(""), 1);
	}
	if(generatorFeatures.includes("words")) {
		let w = 200.0 / words.length;
		if(generatorFeatures.includes("words-type-title")) {
			add(words.reduce((arr, word) => {
				let pieces = word.split(" ");
				for(let i = 0; i < pieces.length; i++) {
					pieces[i] = pieces[i][0].toUpperCase() + pieces[i].slice(1);
				}
				arr.push(pieces.join(" "));
				return arr;
			}, []), w);
		}
		if(generatorFeatures.includes("words-type-lowercase")) {
			add(words, w);
		}
		if(generatorFeatures.includes("words-type-uppercase")) {
			add(words.reduce((arr, word) => {
				arr.push(word.toUpperCase());
				return arr;
			}, []), w);
		}
	}
	
	$.each(Object.keys(content), (index, e) => {
		for(let i = 0; i < e.length; i++) {
			if(generatorExclude.includes(e.charAt(i))) {
				delete content[e];
				return;
			}
		}
	});
	
	let sum = $.map(content, (value, key) => { return value; }).reduce((a,b) => a + b, 0);
	
	let data = new Uint32Array(generatorLength + 20);
	
	const quota = 65536 / 32;
	for(let i = 0; i < Math.ceil(data.length / quota); i++) {
		let destIndex = i * quota;
		let len = Math.min(data.length - destIndex, quota);
		let iterData = new Uint32Array(len);
		window.crypto.getRandomValues(iterData);
		
		data.set(iterData, destIndex);
	}
	
	function set(val, result) {
		generatorResult = result;
		
		$(".generator-result input").val(val);
		if(generatorField) {
			generatorField.val(val);
			generatorField.trigger("input");
		}
	}
	
	let result = "";
	
	if(data.length > 0 && Object.keys(content)) {
		for(let i = 0; i < data.length; i++) {
			let d = data[i] % sum;
			let total = 0;
			for(let s in content) {
				total += content[s];
				if(d < total) {
					if(result.length + s.length <= generatorLength) {
						result += s;
					}
					break;
				}
			}
			if(result.length == generatorLength) {
				break;
			}
		}
		let end = initial ? 0 : Math.min(data.length, 50);
		let time = (initial ? 0 : 500) / end;
		for(let i = 0; i < end; i++) {
			generatorTimeouts.push(setTimeout(() => {
				let rest = "";
				for(let j = i; j < Math.min(i + 50, result.length); j++) {
					rest += generatorFiller.charAt(Math.floor(Math.random() * generatorFiller.length));
				}
				set(result.substring(0, i) + rest + result.substring(i + rest.length, result.length), result);
			}, time * i));
		}
		generatorTimeouts.push(setTimeout(() => {
			set(result, result);
		}, time * end));
	} else {
		set(result, result);
	}
}

function openGenerator(forField) {
	generatorField = forField;
	if(generatorField) {
		generatorField.attr("type", "text");
	}
	$(".generator-modal").attr("show", true);
	updateGenerator();
}

function closeGenerator() {
	clearGeneratorTimeouts();
	
	if(generatorField) {
		generatorField.attr("type", "password");
	}
	generatorField = null;
	$(".generator-modal").attr("show", false);
}

$(document).ready(() => {
	
	$(".generator-button").click(() => {
		openGenerator();
	});
	
	const generatorLengths = [
		6, 7, 8, 9, 10, 11, 12, 16, 20, 24, 32, 48, 64, 96, 128, 192, 256, 1024
	];
	
	$(".input-generator-length input[type=range]")
			.attr("min", 0)
			.attr("max", generatorLengths.length - 1)
			.val(generatorLengths.indexOf(8))
			.on("_ready input", event => {
				let e = $(event.target);
				
				e.attr("unused", false);
				generatorLength = generatorLengths[Math.floor(e.val())];
				$(".generator-length-value").val(generatorLength);
				
				if(event.type != "_ready") updateGenerator();
			}).trigger("_ready");
	
	$(".generator-length-value")
			.on("input", event => {
				let e = $(event.target);
				
				let length = parseInt(e.val());
				generatorLength = Math.min(Math.max(length || 0, 0), 100000);
				if(length) {
					e.val(generatorLength);
				}
				
				$(".input-generator-length input[type=range]").attr("unused", true);
				
				if(event.type != "_ready") updateGenerator();
			});
	
	$(".input-generator-feature .input-generator-feature-box")
			.on("_ready change", event => {
				let e = $(event.target);
				
				let checked = e.prop("checked");
				
				let remove = f => {
					if(generatorFeatures.includes(f)) {
						generatorFeatures.splice(generatorFeatures.indexOf(f), 1);
					}
				};
				
				if(e.attr("feature")) {
					let feature = e.attr("feature");
					
					if(checked) {
						if(e.is("input[type=\"radio\"]")) {
							$("input[type=\"radio\"]").each((i, elem) => {
								let e2 = $(elem);
								if(e.attr("name") == e2.attr("name")) {
									remove(e2.attr("feature"));
								}
							});
						}
						
						generatorFeatures.push(feature);
					} else {
						remove(feature);
					}
				}

				if(e.attr("showelement")) {
					let element = $(e.attr("showelement"));
					if(checked) {
						element.show();
					} else {
						element.hide();
					}
					element.find("input").each((i, elem) => {
						let e2 = $(elem);
						if(event.type != "_ready") {
							e2.prop("checked", false);
						}
						e2.trigger("change");
					});
				}
				
				if(event.type != "_ready") updateGenerator();
			}).trigger("_ready");
	
	$(".input-generator-exclude")
			.on("_ready input", event => {
				let e = $(event.target);
				
				generatorExclude = e.val().split("");
				
				if(event.type != "_ready") updateGenerator();
			}).trigger("_ready");
	
	$(".generator-done-button")
			.click(event => {
				closeGenerator();
			});
	
	$(".generator-result input")
			.click(event => {
				//clearGeneratorTimeouts();
			});
	
	addButton($(".generator-result"), 0, "random", "res/random.png", () => updateGenerator());
	addButton($(".generator-result"), 1, "copy", "res/copy.png", copyCallback($(".generator-result")));
	
});

