<?php

namespace wsd\afb;

use DOMDocument;
use DOMElement;

defined('ABSPATH') || exit;

/**
 * Get DOM Document.
 *
 * @param string $html
 * @return DOMDocument
 */
function get_dom($html) {
	$dom = new DOMDocument();
	$libxml_previous_state = libxml_use_internal_errors(true);
	$dom->loadHTML('<html><body>' . mb_convert_encoding(trim($html), 'HTML-ENTITIES', 'UTF-8') . '</body></html>');
	libxml_clear_errors();
	libxml_use_internal_errors($libxml_previous_state);
	return $dom;
}

/**
 * Parse `<body>` content out of a rendered HTML document.
 *
 * @param string $html
 * @return string
 */
function get_body($html) {
	return trim(
		preg_replace(
			'/^<!DOCTYPE.+?>/', '',
			str_replace(
				['<html>', '</html>', '<body>', '</body>'],
				'',
				$html
			)
		)
	);
}

/**
 * @param mixed $node
 * @return boolean
 */
function is_dom_element($node) {
	return $node instanceof DOMElement;
}
