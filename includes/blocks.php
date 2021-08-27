<?php

namespace wsd\afb;

defined('ABSPATH') || exit;

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

	/**
	 * Register AFB attribute.
	 */
	$args['attributes']['attributesForBlocks'] = [
		'type' => 'object',
		'default' => [],
	];

	/**
	 * Override `render_callback` to add animation attributes.
	 */
	if(isset($args['render_callback']) && is_callable($args['render_callback'])) {
		$cb = $args['render_callback'];
		$args['render_callback'] = function($attributes, $content, $block = null) use ($cb, $name) {
			$rendered = call_user_func($cb, $attributes, $content, $block);
			if(
				!isset($attributes['attributesForBlocks'])
				|| !is_array($attributes['attributesForBlocks'])
				|| count($attributes['attributesForBlocks']) < 1
			) {
				return $rendered;
			}
			return add_attributes(
				$attributes['attributesForBlocks'],
				$rendered
			);
		};
	}

	return $args;
}
