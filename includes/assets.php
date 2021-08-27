<?php

namespace wsd\afb;

defined('ABSPATH') || exit;

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
		$asset['version']
	);

	wp_localize_script(
		'attributes-for-blocks',
		'afbData',
		[
			'unsupportedBlocks' => include WSD_AFB_DIR . '/includes/unsupported-blocks.php',
		]
	);

	if(function_exists('wp_set_script_translations')) {
		wp_set_script_translations(
			'attributes-for-blocks',
			'attributes-for-blocks'
		);
	}
}
