=== Attributes for Blocks ===
Contributors: websevendev, jimedwards
Tags: gutenberg, blocks, attributes, id, style, data, aria, onclick
Requires at least: 5.6
Tested up to: 5.8
Requires PHP: 5.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Allows to add HTML attributes to Gutenberg blocks.

== Description ==

This plugin adds additional advanced inspector controls to Gutenberg blocks that allow to add any custom HTML attributes to the block's front-end output. This allows you to add inline styles to fine-tune the block's appearance, set aria attributes to improve your site's accessibility, add data attributes to integrate with any JavaScript modules or even JavaScript DOM event attributes such as `onclick`, `onchange` or `onload`.

== Frequently Asked Questions ==

= How do I add an attribute? =
In your selected block's inspector controls (Block settings) scroll all the way to the bottom and click on "Advanced". It should contain a section called "Additional attributes".
Type an attribute name into the "Add attribute" field and press "Add" to add an attribute for the block. A new input with the attribute's name should appear below, into which you can optionally insert the attribute value.
Example attributes: `style`, `title`, `target`, `class`, `id`, `onClick`, `data-*`, `aria-*`.

= How does it work? =
For regular blocks, attributes are added to the block save content's root element, meaning they will be rendered only on the front end and not in the editor. For dynamic blocks the attributes are added via `render_callback` function and they may also be applied in the editor, depending if the block is rendered server or client side.

= Does it work for every block? =
It should work with normal blocks that render a valid WP Element that can utilize the `blocks.getSaveContent.extraProps` filter as well as dynamic blocks that utilize a `render_callback`. Third party blocks that do something unorthodox may not work.
[Known unsupported blocks](https://plugins.trac.wordpress.org/browser/attributes-for-blocks/trunk/includes/unsupported-blocks.php)

= Disable block support =
The `afb_unsupported_blocks` filter can be used in your child theme's `functions.php` file to disable block support for adding additional attributes.

    add_filter('afb_unsupported_blocks', function($blocks) {
    	$blocks[] = 'core/button';
    	return $blocks;
    });

= What happens when I disable this plugin? =
Blocks with custom attributes may become invalid, depending on which attributes you've added. From there you can recover the block without the custom attributes by clicking "Attempt Block Recovery" or keep the block with custom attributes as HTML by choosing "Convert to HTML". If you don't want to risk blocks becoming invalid you need to remove all custom attributes before disabling the plugin.

== Screenshots ==

1. Adding style attribute to paragraph block

== Installation ==

= Install via admin dashboard =
1. Go to your **WordPress admin dashboard -> Plugins**.
2. Click "Add New".
3. Click "Upload Plugin".
4. Select the `attributes-for-blocks.zip` file.
5. Click "Install Now".
6. Activate the plugin from **WordPress admin dashboard -> Plugins**.

= Manual install via FTP upload =
1. Upload the folder "attributes-for-blocks" from `attributes-for-blocks.zip` file to your WordPress installations `../wp-content/plugins` folder.
2. Activate the plugin from **WordPress admin dashboard -> Plugins**.

== Changelog ==

= 1.0.1 =
* Fix special character encoding for dynamic blocks.

= 1.0.0 =
* Initial release.
