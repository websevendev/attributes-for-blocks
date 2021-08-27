<?php

namespace wsd\afb;

defined('ABSPATH') || exit;

return apply_filters('afb_unsupported_blocks', [
	'core/freeform',
	'core/html',
	'core/shortcode',
	'core/legacy-widget',
]);
