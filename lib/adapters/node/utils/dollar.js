define(["module","cheerio"],function(module,cheerio) {

	var config = module.config();

	console.log("config!",config);

	if (config.html) {
		return cheerio.load(config.html);
	}

	return cheerio.load("");
});