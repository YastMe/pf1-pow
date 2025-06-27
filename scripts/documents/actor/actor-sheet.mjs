export function createTemplate(templateName, data) {
	const div = document.createElement("div");
	div.innerHTML = Handlebars.partials[templateName](
		data,
		{
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		}
	);
	const child = div.firstChild;
	if (child instanceof Element) {
		return child;
	}
	else if (child == null) {
		return document.createElement("div");
	}
	console.error("This should not happen", templateName, div.innerHTML);
	throw new Error("This should not happen");
}