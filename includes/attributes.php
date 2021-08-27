<?php

namespace wsd\afb;

defined('ABSPATH') || exit;

/**
 * @param string $attribute Attribute name.
 * @param string $current Current attribute value.
 * @param string $add Value to merge with.
 * @return string
 */
function merge_attributes($attribute, $current, $add) {
	$current = trim($current);
	$add = trim($add);
	if(empty($current)) {
		return $add;
	}

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
	/**
	 * Add attributes.
	 */
	foreach($body->childNodes as $root) {
		if(method_exists($root, 'setAttribute')) {
			foreach(get_attributes($args, $root) as $key => $value) {
				$root->setAttribute(esc_attr($key), esc_attr($value));
			}
		}
	}
	return get_body($dom->saveHTML());
}
