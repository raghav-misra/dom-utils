/**
 * Literally a wrapper around ParentNode.prototype.querySelector
 * @param { string } query
 * @param { ParentNode = document } parent
 * @param { boolean = false } many
 * @returns { Node | Node[] }
 */
export function search(query, parent = document, many = false) {
	if (many) return parent.querySelectorAll(query);
	else return parent.querySelector(query);
}

/**
 * A more powerful alternative to HTMLElement.prototype.setAttribute.
 * @param { HTMLElement } element
 * @param { string } name
 * @param { any } value
 * @returns { void }
 */
export function setProperty(element, name, value) {
	const VALID_PROPS = ["innerText", "classList", "style"];
	const trimmedName = name.trim();
	const caselessName = trimmedName.toLowerCase();

	// Whether to set property vs attribute:
	if (caselessName === "style" && typeof value === "object")
		element.style = cssObject(value);
	if (VALID_PROPS.indexOf(trimmedName) !== -1)
		element[trimmedName] = value;
	// Account for events:
	else if (caselessName.startsWith("on") && typeof value === "function")
		element.addEventListener(caselessName.replace("on", ""), value);
	// Fallback to setting attribute:
	else
		element.setAttribute(trimmedName, value);
}

/**
 * Inspired by ReactDOM's render function, but renders DOM node(s) to the DOM.
 * Designed for use with the createElement function.
 * @param { string | Node | (string | Node)[] } child
 * @param { HTMLElement | DocumentFragment } parent
 * @returns { void }
 */
export function render(child, parent) {
	// Loop thru array of children:
	if (Array.isArray(child)) child.forEach((c) => render(c, parent));

	// If it's a string:
	else if (typeof child === "string") parent.appendChild(document.createTextNode(child));

	// Else assume it is a Node:
	else parent.appendChild(child);
}

/**
 * Inspired by React's createElement, except it returns DOM nodes.
 * You can pass a function for tagName.
 * Plays quite nicely with JSX. Configure it with Babel, Typescript, etc...
 * @param { string | Function } tagName
 * @param { Object } props
 * @param { (string | Node)[] } children
 * @returns { void }
 */
export function createElement(tagName, props, ...children) {
	// Call tagName if it's a function:
	if (typeof tagName === "function") return tagName(props, ...children);

	// Else assume it's a string:
	else {
		const element = document.createElement(tagName);

		// Recursively set properties:
		const addProp = k => props.hasOwnProperty(k) && setProperty(element, k, props[k]);
		Object.keys(props).forEach(k => addProp(k));

		// Append children:
		render(children, element);
	}
}

/**
 * This works with createElement, 
 * so that you can create a DocumentFragment
 * Configure your JSX to convert <>...</> to this.
 * @param { never } props
 * @param { (string | Node)[] } children
 */
function Fragment(props, ...children) {
	// Add children & return fragment:
	const fragment = document.createDocumentFragment();
	render(children, fragment);
	return fragment;
}

/**
 * Generate a minified CSS string given an object with style rules.
 * Useful with createElement and JSX.
 * @param { Object } styleObject
 * @returns { string }
 */
export function cssObject(styleObject) {
	// Inline function: converts camelCase ("backgroundColor") 
	// to kebab-case ("background-color"):
	const kebabify = camel => camel
		.trim().split("")
		.map(l => l === l.toUpperCase() ? `-${l.toLowerCase()}` : l)
		.join("");

	// Loop over and kebabify object:
	return Object.keys(styleObject)
		.map(k => styleObject.hasOwnProperty(k) ? `${kebabify(k)}:${styleObject[k]};` : "")
		.join("");
}