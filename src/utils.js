import {
	applyFilters,
} from '@wordpress/hooks';

import {
	createElement,
} from '@wordpress/element';

/**
 * Rename object key while maintaining its' position in the object.
 */
export const renameProp = (oldProp, newProp, props) => {
	let map = {[oldProp]: newProp};
	return Object.keys(props).reduce((acc, val) => {
		if(!!map[val]) {
			acc[map[val]] = props[oldProp];
		} else {
			acc[val] = props[val];
		}
		return acc;
	}, {});
};

/**
 * Handle merging custom attribute with existing attribute.
 *
 * @param {string} attribute Attribute name.
 * @param {*} current Current attribute value.
 * @param {*} add Attribute value to merge into current value.
 */
export const mergeAttributes = function(attribute, current, add) {
	if(!current) {
		return add;
	}

	/** Join attributes with space in between. */
	let separator = ' ';

	/**
	 * Handle merging style attribute.
	 */
	if(attribute === 'style') {
		switch(typeof current) {
			/** Merge and return style object with content from custom style string. */
			case 'object':
				let newStyles = {};
				add.trim().split(';').forEach(style => {
					if(style && style.includes(':')) {
						let styles = style.split(':');
						newStyles[styles[0].trim()] = styles[1].trim();
					}
				});
				return {...current, ...newStyles};

			/** Join string style with ; if needed. */
			case 'string':
				if(current.trim().substring(current.length - 1, current.length) !== ';' && add.trim().substring(0, 1) !== ';') {
					separator = ';';
				}
		}
	}

	/** Allow to use custom separator. */
	separator = applyFilters('afb.attribute.separator', separator, attribute, current, add);

	return [current, add].join(separator);
};

/**
 * Component used as equivalent of Fragment with unescaped HTML, in cases where
 * it is desirable to render dangerous HTML without needing a wrapper element.
 *
 * @param {string} props.children HTML to render.
 * @param {string} props.as HTML element to render.
 *
 * @return {Element} Dangerously-rendering element.
 */
export const RawHTML = ({children, as = 'div', ...props}) => {
	return createElement(as, {
		dangerouslySetInnerHTML: {__html: children},
		...props,
	});
}
