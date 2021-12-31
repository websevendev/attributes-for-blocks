<?php
/**
 * Plugin Name: Attributes for Blocks
 * Plugin URI: https://wordpress.org/plugins/attributes-for-blocks
 * Description: Allows to add HTML attributes to Gutenberg blocks.
 * Version: 1.0.2
 * Author: websevendev
 * Author URI: https://chap.website/author/websevendev
 */

namespace wsd\afb;

defined('ABSPATH') || exit;

function_exists('get_plugin_data') || require_once ABSPATH . 'wp-admin/includes/plugin.php';
$plugin = get_plugin_data(__FILE__, false, false);
define('WSD_AFB_VER', $plugin['Version']);
define('WSD_AFB_FILE', __FILE__);
define('WSD_AFB_DIR', dirname(__FILE__));

require_once WSD_AFB_DIR . '/includes/html-helpers.php';
require_once WSD_AFB_DIR . '/includes/assets.php';
require_once WSD_AFB_DIR . '/includes/attributes.php';
require_once WSD_AFB_DIR . '/includes/blocks.php';

add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\editor_assets', 5);
add_filter('register_block_type_args', __NAMESPACE__ . '\\block_args', 10, 2);
