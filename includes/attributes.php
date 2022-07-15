<?php

namespace wsd\afb;

use Exception;

defined('ABSPATH') || exit;

/**
 * Handle merging custom attribute with existing attribute.
 *
 * @param string $attribute Attribute name.
 * @param string $current Current attribute value.
 * @param string $add Value to merge with.
 * @return string
 */
function merge_attributes($attribute, $current, $add) {

	/** Clean attribute. */
	switch($attribute) {
		case 'style':
			/** Ensure style applied via JS matches input style.  */
			$add = str_replace(': ', ':', $add);
			$add = str_replace('; ', ';', $add);
			$add = rtrim($add, ';');
			$current = rtrim($current, ';');
		break;
	}

	$current = trim(
		/** Remove the existing attribute value when it already exists (added via JS while the block also has PHP `render_callback`). */
		str_replace($add, '', $current)
	);
	$add = trim($add);

	/** Nothing to merge. */
	if(empty($current)) {
		return $add;
	}

	/** Determine the separator based on attribute type. */
	$separator = ' ';
	switch($attribute) {
		case 'style':
			if(substr($current, -1) !== ';' && substr($add, 0, 1) !== ';') {
				$separator = ';';
			}
		break;
	}
	$separator = apply_filters('afb_attribute_separator', $separator);

	return implode($separator, [$current, $add]);
}

/**
 * @param array $args AFB settings.
 * @param DOMElement $node HTML element that the attributes will be added to.
 * @return array Attribute name and value key value pairs.
 */
function get_attributes($args, $node) {
	$attributes = [];

	foreach($args as $key => $value) {
		if(strpos($key, '@') === 0) {
			$attributes[substr($key, 1)] = $value;
		} else {
			$attributes[$key] = merge_attributes(
				$key,
				$node->hasAttribute($key) ? $node->getAttribute($key) : '',
				$value
			);
		}
	}

	return $attributes;
}

/**
 * Add attributes to root element.
 *
 * @param array $args AFB settings.
 * @param string $html Block HTML.
 * @return string Block HTML with additional attributes.
 */
function add_attributes($args, $html) {
	$dom = get_dom($html);
	$body = $dom->getElementsByTagName('body')->item(0);

	// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	foreach($body->childNodes as $root) {
		if(method_exists($root, 'setAttribute')) {
			foreach(get_attributes($args, $root) as $key => $value) {
				try {
					$root->setAttribute(
						apply_filters('afb_sanitize_attribute_key', $key),
						apply_filters('afb_sanitize_attribute_value', $value)
					);
				} catch(Exception $e) {
					/** Possibly `Invalid Character Error` when key/value contains unsupported characters. */
					do_action('afb_set_attribute_exception', $e, $key, $value, $dom);
				}
			}
		}
	}

	return get_body($dom->saveHTML());
}
