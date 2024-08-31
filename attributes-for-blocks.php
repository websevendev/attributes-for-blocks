<?php
/**
 * Plugin Name: Attributes for Blocks
 * Plugin URI: https://wordpress.org/plugins/attributes-for-blocks
 * Description: Allows to add HTML attributes to Gutenberg blocks.
 * Version: 1.0.8
 * Author: websevendev
 * Author URI: https://github.com/websevendev
 */

namespace wsd\afb;

use WP_HTML_Tag_Processor;

defined('ABSPATH') || exit;

function_exists('get_plugin_data') || require_once ABSPATH . 'wp-admin/includes/plugin.php';
$afb_plugin = get_plugin_data(__FILE__, false, false);
define('WSD_AFB_VER', $afb_plugin['Version']);
define('WSD_AFB_FILE', __FILE__);
define('WSD_AFB_DIR', dirname(__FILE__));

/**
 * Blocks known to not work properly with Attributes for Blocks.
 *
 * @return array
 */
function get_unsupported_blocks() {
	return apply_filters('afb_unsupported_blocks', [
		'core/freeform',
		'core/html',
		'core/shortcode',
		'core/legacy-widget',
	]);
}


/**
 * Enqueue editor assets.
 */
function editor_assets() {

	$asset = include WSD_AFB_DIR . '/build/index.asset.php';

	wp_enqueue_style(
		'attributes-for-blocks',
		plugins_url('build/style-index.css', WSD_AFB_FILE),
		[],
		$asset['version'],
		'all'
	);

	wp_enqueue_script(
		'attributes-for-blocks',
		plugins_url('build/index.js', WSD_AFB_FILE),
		$asset['dependencies'],
		$asset['version'],
		false
	);

	wp_localize_script(
		'attributes-for-blocks',
		'afbData',
		['unsupportedBlocks' => get_unsupported_blocks()]
	);

	if(function_exists('wp_set_script_translations')) {
		wp_set_script_translations('attributes-for-blocks', 'attributes-for-blocks');
	}
}
add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\editor_assets', 5);


/**
 * Should additional attributes from this plugin be applied to a block.
 *
 * @param mixed $attributes Block attributes.
 * @return boolean
 */
function has_attributes($attributes) {
	return is_array($attributes)
		&& isset($attributes['attributesForBlocks'])
		&& is_array($attributes['attributesForBlocks'])
		&& count($attributes['attributesForBlocks']) > 0;
}


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
			/** Fix `WP_HTML_Tag_Processor` stripping leading `-`, causing a mismatch. */
			$current = str_replace('-afb-placeholder', 'afb-placeholder', $current);
			$current = str_replace('afb-placeholder', '-afb-placeholder', $current);
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
	$separator = apply_filters('afb_attribute_separator', $separator, $attribute);

	return implode($separator, [$current, $add]);
}


/**
 * @param array $args AFB settings.
 * @param WP_HTML_Tag_Processor $tags
 * @return array Attribute name and value pairs.
 */
function get_attributes($args, $tags) {

	$attributes = [];

	foreach($args as $key => $value) {

		/** Override attribute. */
		if(strpos($key, '@') === 0) {
			$attributes[substr($key, 1)] = $value;
			continue;
		}

		/** Merge attribute. */
		$attributes[$key] = merge_attributes(
			$key,
			$tags->get_attribute($key) ?? '',
			$value
		);
	}

	return $attributes;
}


/**
 * Add attributes to block root element.
 *
 * @param array $args AFB settings.
 * @param string $html Block HTML.
 * @return string Block HTML with additional attributes.
 */
function add_attributes($args, $html) {

	$tags = new WP_HTML_Tag_Processor($html);
	if($tags->next_tag()) {

		/** Add attributes. */
		foreach(get_attributes($args, $tags) as $key => $value) {
			$tags->set_attribute($key, $value);
		}

		return $tags->get_updated_html();
	}

	return $html;
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
		$not_supported = get_unsupported_blocks();
	}

	if(in_array($name, $not_supported, true)) {
		return $args;
	}

	if(!isset($args['attributes']) || !is_array($args['attributes'])) {
		$args['attributes'] = [];
	}

	/** Register AFB attributes, this is necessary for `/wp-json/wp/v2/block-renderer` REST endpoint to not throw `rest_additional_properties_forbidden`. */
	$args['attributes']['attributesForBlocks'] = [
		'type' => 'object',
		'default' => [],
	];

	return $args;
}
add_filter('register_block_type_args', __NAMESPACE__ . '\\block_args', 10, 2);


/**
 * Add attributes to blocks' root HTML element when applicable.
 *
 * @param string $block_content Rendered block.
 * @param string $block Parsed array representation of block.
 * @return string
 */
function render_block($block_content, $block) {

	static $not_supported;
	if(!is_array($not_supported)) {
		$not_supported = get_unsupported_blocks();
	}

	if(in_array($block['blockName'], $not_supported, true)) {
		return $block_content;
	}

	if(!has_attributes($block['attrs'] ?? [])) {
		return $block_content;
	}

	return add_attributes($block['attrs']['attributesForBlocks'], $block_content);
}
add_filter('render_block', __NAMESPACE__ . '\\render_block', 10, 2);


/**
 * Strips `attributesForBlocks` block attribute when the current user doesn't have `unfiltered_html` capabilities.
 *
 * @param string $content Content to filter through KSES.
 */
function sanitize_attributes($content) {

	if(!function_exists('wp_get_current_user')) {
		require ABSPATH . WPINC . '/pluggable.php';
	}

	if(current_user_can('unfiltered_html')) {
		return $content;
	}

	if(!has_blocks($content)) {
		return $content;
	}

	if(strpos($content, 'attributesForBlocks') === false) {
		return $content;
	}

	$matches = null;
	if(preg_match_all('/\\\?"attributesForBlocks\\\?"\s*:\s*{[^}]*}/', $content, $matches)) {

		foreach($matches[0] as $atts) {

			$empty_atts = '"attributesForBlocks":{}';
			$was_slashed = wp_unslash($atts) !== $atts;
			if($was_slashed) {
				$empty_atts = wp_slash($empty_atts);
			}
			$content = str_replace($atts, $empty_atts, $content);
		}
	}

	return $content;
}
add_filter('pre_kses', __NAMESPACE__ . '\\sanitize_attributes');


/**
 * Add GitHub link on the plugins page.
 *
 * @param array $plugin_meta
 * @param string $plugin_file
 * @return array
 */
function github_link($plugin_meta, $plugin_file) {
	if($plugin_file === plugin_basename(WSD_AFB_FILE)) {
		$plugin_meta[] = '<a href="https://github.com/websevendev/attributes-for-blocks" target="_blank" rel="noopener noreferrer">GitHub</a>';
	}
	return $plugin_meta;
}
add_filter('plugin_row_meta', __NAMESPACE__ . '\\github_link', 10, 2);
