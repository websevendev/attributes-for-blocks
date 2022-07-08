<?php

namespace wsd\afb;

defined('ABSPATH') || exit;

/**
 * Should additional attributes from this plugin be applied.
 *
 * @param array $attributes Block attributes.
 * @return boolean
 */
function has_attributes($attributes) {
	return is_array($attributes)
		&& isset($attributes['attributesForBlocks'])
		&& is_array($attributes['attributesForBlocks'])
		&& count($attributes['attributesForBlocks']) > 0;
}

/**
 * When registering a block, add AFB argument and wrap `render_callback`.
 *
 * @param array $args
 * @param string $name
 * @return array
 */
function block_args($args, $name) {
	static $not_supported;
	if(!is_array($not_supported)) {
		$not_supported = include WSD_AFB_DIR . '/includes/unsupported-blocks.php';
	}
	if(in_array($name, $not_supported)) {
		return $args;
	}

	if(!isset($args['attributes'])) {
		$args['attributes'] = [];
	}

	/** Register AFB attribute. */
	$args['attributes']['attributesForBlocks'] = [
		'type' => 'object',
		'default' => [],
	];

	if(isset($args['render_callback']) && is_callable($args['render_callback'])) {
		/** Override `render_callback` to add additional attributes. */
		$cb = $args['render_callback'];
		$args['render_callback'] = function($attributes, $content, $block = null) use ($cb) {
			$rendered = call_user_func($cb, $attributes, $content, $block);
			if(!has_attributes($attributes)) {
				return $rendered;
			}
			return add_attributes($attributes['attributesForBlocks'], $rendered);
		};
	}

	return $args;
}
