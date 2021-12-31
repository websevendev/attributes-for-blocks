import {
	__,
} from '@wordpress/i18n';

import {
	Button,
	Modal,
} from '@wordpress/components';

import {
	Fragment,
	useState,
} from '@wordpress/element';

import {
	help,
} from '@wordpress/icons';

import {
	RawHTML,
} from './utils';

/**
 * Modal that displays help info.
 */
let HelpModal;
export default HelpModal = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Fragment>
			<Button
				isSecondary
				className='wsd-afb-help-button'
				aria-label={__('Show Attributes for Blocks help', 'attributes-for-blocks')}
				onClick={() => setIsOpen(true)}
				icon={help}
			/>
			{isOpen && (
				<Modal
					title={__('Attributes for Blocks help', 'attributes-for-blocks')}
					onRequestClose={() => setIsOpen(false)}
				>
					<div className='wsd-afb-help'>
						<h3>{__('How do I add an attribute?', 'attributes-for-blocks')}</h3>
						<p>{__(`Type an attribute name into the "Add attribute" field and press "Add" to add an attribute for the block. A new input with the attribute's name should appear below, into which you can optionally insert the attribute value.`, 'attributes-for-blocks')}</p>
						<RawHTML as='p'>{`
							${__(`Example attributes: `, 'attributes-for-blocks')}
							<code>style</code>,
							<code>title</code>,
							<code>target</code>,
							<code>class</code>,
							<code>id</code>,
							<code>onClick</code>,
							<code>data-*</code>,
							<code>aria-*</code>.
						`}</RawHTML>
						<h3>{__('How does it work?', 'attributes-for-blocks')}</h3>
						<RawHTML as='p'>{`
							${__("For regular blocks, attributes are added to the block save content's root element, meaning they will be rendered only on the front end and not in the editor. For dynamic blocks the attributes are added via `render_callback` function and they may also be applied in the editor, depending if the block is rendered server or client side.", 'attributes-for-blocks')}
						`}</RawHTML>
						<h3>{__('Does it work for every block?', 'attributes-for-blocks')}</h3>
						<RawHTML as='p'>{`
							${__("It should work with normal blocks that render a valid WP Element that can utilize the `blocks.getSaveContent.extraProps` filter as well as dynamic blocks that utilize a `render_callback`. Third party blocks that do something unorthodox may not work.", 'attributes-for-blocks')}
						`}</RawHTML>
						<h3>{__(`Modes`, 'attributes-for-blocks')}</h3>
						<p>{__(`You can change between modes by clicking the button next to the input where the attribute value is specified.`, 'attributes-for-blocks')}</p>
						<h4>{__(`Merge mode (default)`, 'attributes-for-blocks')}</h4>
						<p>{__(`In merge mode, when a block has already defined the attribute you're trying to add, the values are merged.`, 'attributes-for-blocks')}</p>
						<h4>{__(`Override mode`, 'attributes-for-blocks')}</h4>
						<p>{__(`In override mode, when a block has already defined the attribute you're trying to add, the value is completely replaced with the provided value. You can switch between modes by clicking the intersecting arrows button next to the attribute input.`, 'attributes-for-blocks')}</p>
						<h3>{__('What happens when I disable this plugin?', 'attributes-for-blocks')}</h3>
						<p>{__(`Blocks with custom attributes may become invalid, depending on which attributes you've added. From there you can recover the block without the custom attributes by clicking "Attempt Block Recovery" or keep the block with custom attributes as HTML by choosing "Convert to HTML". If you don't want to risk blocks becoming invalid you need to remove all custom attributes before disabling the plugin.`, 'attributes-for-blocks')}</p>
						<h3>{__(`Common attributes`, 'attributes-for-blocks')}</h3>
						<h4>{__(`Style attribute`, 'attributes-for-blocks')}</h4>
						<RawHTML as='p'>{`
							${__(`Inline styles can be defined as text.`, 'attributes-for-blocks')}
							${__(`Example:`, 'attributes-for-blocks')} <code>color:red;font-weight:bold</code><br>
							${__(`Spaces are allowed, leading or trailing semicolons are not needed.`, 'attributes-for-blocks')}<br>
							${__(`Styles are not rendered in the block editor.`, 'attributes-for-blocks')}
						`}</RawHTML>
						<h5>{__(`Advanced editor`, 'attributes-for-blocks')}</h5>
						<RawHTML as='p'>{`
							${__(`Style attribute can be edited with an advanced editor by clicking "Toggle editor".`, 'attributes-for-blocks')}
						`}</RawHTML>
						<h4>{__(`ID attribute`, 'attributes-for-blocks')}</h4>
						<p>{__(`If the block supports it, you should use the built-in "HTML anchor" feature instead.`, 'attributes-for-blocks')}</p>
						<h4>{__(`Class attribute`, 'attributes-for-blocks')}</h4>
						<p>{__(`HTML class attribute can be defined with the regular "class" or React's "className" attribute (non-dynamic blocks). Results (merging/overriding) may vary depending on the block. If the block supports it, you should use the built-in "Additional CSS Class" feature instead.`, 'attributes-for-blocks')}</p>
					</div>
				</Modal>
			)}
		</Fragment>
	);
};
