import {
	Component,
	Fragment,
} from '@wordpress/element';

import {
	__,
} from '@wordpress/i18n';

import {
	InspectorAdvancedControls,
} from '@wordpress/block-editor';

import {
	BaseControl,
	TextControl,
	Button,
	Dashicon,
	__experimentalVStack as VStack,
	__experimentalView as View,
	Modal,
} from '@wordpress/components';

import {
	compose,
} from '@wordpress/compose';

import {
	withSelect,
} from '@wordpress/data';

import {
	store as editorStore,
} from '@wordpress/editor';

import {
	fullscreen as fullscreenIcon,
} from '@wordpress/icons'

import HelpModal from './HelpModal';
import StyleEditor from './StyleEditor';

import {
	renameProp,
} from './utils';

/**
 * Inspector controls for Attributes for Blocks.
 */
class InspectorControls extends Component {

	constructor() {
		super(...arguments);

		this.state = {
			adding: '',
			message: undefined,
			styleEditor: JSON.parse(localStorage.getItem('attributesForBlocks/styleEditor')) || false,
			isFullscreen: false,
		};

		this.addAttribute = this.addAttribute.bind(this);
		this.removeAttribute = this.removeAttribute.bind(this);
		this.toggleAttributeMode = this.toggleAttributeMode.bind(this);
		this.toggleStyleEditor = this.toggleStyleEditor.bind(this);
	}

	/**
	 * Handle component updates.
	 *
	 * @param {object} prevProps
	 * @param {object} prevState
	 */
	componentDidUpdate(prevProps, prevState) {

		if(prevState.adding && !this.state.adding) {
			/** Focus newly added attribute. */
			setTimeout(() => {
				if(prevState.adding === 'style' && this.state.styleEditor) {
					document.querySelector(`.wsd-afb-style input[type="text"]`)?.focus();
				} else {
					document.querySelector(`.wsd-afb-action-input#afb-${prevState.adding} input[type="text"]`)?.focus();
				}
			}, 150);
		}

		if(prevState.styleEditor !== this.state.styleEditor) {
			/** Sync style editor setting. */
			localStorage.setItem('attributesForBlocks/styleEditor', this.state.styleEditor);
		}
	}

	/**
	 * Handle adding an attribute.
	 *
	 * @param {*} event Form submit event.
	 */
	addAttribute(event) {

		event.preventDefault();

		let {adding} = this.state;

		if(!adding) {
			this.setState({message: __('No attribute name specified.', 'attributes-for-blocks')});
			return;
		}

		let {setAttributes} = this.props;
		let {attributesForBlocks} = this.props.attributes;

		if(!attributesForBlocks) {
			this.setState({message: __('Unable to add attributes to block.', 'attributes-for-blocks')});
			return;
		}

		let normalizedKey = adding.replace('@', '');
		if(normalizedKey in attributesForBlocks || '@' + normalizedKey in attributesForBlocks) {
			this.setState({message: __('Attribute already exists', 'attributes-for-blocks')});
			/** Focus already existing attribute. */
			document.querySelector(`.wsd-afb-action-input#afb-${normalizedKey} input[type="text"]`).focus();
			return;
		}

		let nextAttributes = Object.assign(
			{[adding]: undefined},
			attributesForBlocks,
			{[adding]: ''}
		);

		setAttributes({attributesForBlocks: nextAttributes});
		this.setState({
			adding: '',
			message: undefined,
		});
	}

	/**
	 * Handle removing an attribute.
	 *
	 * @param {string} attributeToRemove
	 */
	removeAttribute(attributeToRemove) {
		let {setAttributes} = this.props;
		let {attributesForBlocks} = this.props.attributes;
		let nextAttributes = Object.assign({}, attributesForBlocks);
		delete nextAttributes[attributeToRemove];
		setAttributes({attributesForBlocks: nextAttributes});
	}

	/**
	 * Handle updating attribute value.
	 *
	 * @param {string} attributeToUpdate
	 * @param {string} newValue
	 */
	updateAttribute(attributeToUpdate, newValue) {
		let {setAttributes} = this.props;
		let {attributesForBlocks} = this.props.attributes;
		let nextAttributes = Object.assign({}, attributesForBlocks, {[attributeToUpdate]: newValue});
		setAttributes({attributesForBlocks: nextAttributes});
	}

	/**
	 * Handle toggling attribute mode between merge and override mode.
	 * Override mode attribute name is prefixed with `@`.
	 *
	 * @param {string} attributeToToggle
	 */
	toggleAttributeMode(attributeToToggle) {
		let {setAttributes} = this.props;
		let {attributesForBlocks} = this.props.attributes;
		let newAttribute = attributeToToggle.substring(0, 1) === '@' ? attributeToToggle.substring(1) : '@' + attributeToToggle;
		let nextAttributes = renameProp(attributeToToggle, newAttribute, attributesForBlocks);
		setAttributes({attributesForBlocks: nextAttributes});
	}

	/**
	 * Switch style editor mode.
	 */
	toggleStyleEditor(e) {
		this.setState({styleEditor: !this.state.styleEditor});
		if(e) {
			e.preventDefault();
			return false;
		}
	}

	/**
	 * Render Attributes for Blocks inspector controls.
	 */
	render() {

		const {
			adding,
			isFullscreen,
		} = this.state;

		const {
			attributesForBlocks,
		} = this.props.attributes;

		const controls = (
			<BaseControl className='wsd-afb'>
				<VStack spacing={2}>
					<form
						className='wsd-afb-action-input'
						onSubmit={this.addAttribute}
					>
						{!isFullscreen && (
							<Button
								className='wsd-afb__button-full-screen'
								aria-label={__('Full screen', 'attributes-for-blocks')}
								icon={fullscreenIcon}
								onClick={() => this.setState({isFullscreen: !isFullscreen})}
							/>
						)}
						<TextControl
							label={__('Additional attributes', 'attributes-for-blocks')}
							placeholder={__('Attribute name...', 'attributes-for-blocks')}
							value={adding}
							onChange={value => this.setState({
								adding: value,
								message: undefined,
							})}
							disabled={!this.props.canUserUseUnfilteredHTML}
						/>
						<Button
							className='wsd-afb__button-add is-last'
							variant='primary'
							type='submit'
							aria-label={__('Add attribute', 'attributes-for-blocks')}
							disabled={!this.props.canUserUseUnfilteredHTML}
						>
							{__('Add', 'attributes-for-blocks')}
						</Button>
						<HelpModal />
					</form>
					<p className='wsd-afb-message'>{this.state.message || '\u00A0'}</p>
					{attributesForBlocks && Object.keys(attributesForBlocks).map(attribute => {
						const normalizedName = attribute.replace('@', '');
						const isOverride = attribute.substring(0, 1) === '@';
						const editor = normalizedName.toLowerCase() === 'style' && this.state.styleEditor ? 'style' : 'default';
						return (
							<Fragment key={attribute}>
								<div id={`afb-${normalizedName}`} className='wsd-afb-action-input'>
									{normalizedName.toLowerCase() === 'style' && this.props.canUserUseUnfilteredHTML && (
										<div className='wsd-afb-action-link'>
											<a href='#' role='button' onClick={this.toggleStyleEditor}>
												{__('Toggle editor', 'attributes-for-blocks')}
											</a>
										</div>
									)}
									<TextControl
										label={(
											<Fragment>
												<strong>{normalizedName}</strong>
												{isOverride && ' ' + __('(override)', 'attributes-for-blocks')}
											</Fragment>
										)}
										disabled={editor === 'style' || !this.props.canUserUseUnfilteredHTML}
										value={attributesForBlocks[attribute]}
										onChange={value => this.updateAttribute(attribute, value)}
									/>
									<Button
										className='button icon-button'
										aria-label={__('Toggle between merge and override mode', 'attributes-for-blocks')}
										aria-current={isOverride ? __('Override', 'attributes-for-blocks') : __('Merge', 'attributes-for-blocks')}
										onClick={() => this.toggleAttributeMode(attribute)}
										disabled={!this.props.canUserUseUnfilteredHTML}
									>
										<Dashicon icon='randomize' />
									</Button>
									<Button
										className='button icon-button is-last'
										aria-label={__('Remove attribute', 'attributes-for-blocks') + ': ' + normalizedName}
										onClick={() => this.removeAttribute(attribute)}
										disabled={!this.props.canUserUseUnfilteredHTML}
									>
										<Dashicon icon='no-alt' />
									</Button>
								</div>
								{editor === 'style' && this.props.canUserUseUnfilteredHTML && (
									<StyleEditor
										value={attributesForBlocks[attribute]}
										onChange={value => this.updateAttribute(attribute, value)}
										toggleStyleEditor={this.toggleStyleEditor}
									/>
								)}
							</Fragment>
						);
					})}
				</VStack>
			</BaseControl>
		)

		return (
			<InspectorAdvancedControls>
				{isFullscreen && (
					<Modal
						title={__('Additional attributes', 'attributes-for-blocks')}
						onRequestClose={() => this.setState({isFullscreen: false})}
						className='wsd-afb__full-screen'
						size='large'
					>
						<View className='wsd-afb__full-screen__content'>
							{controls}
						</View>
					</Modal>
				)}
				{!isFullscreen && controls}
			</InspectorAdvancedControls>
		);
	}
}

export default compose( [
	withSelect(select => {

		const {
			canUserUseUnfilteredHTML,
		} = select(editorStore);

		return {
			canUserUseUnfilteredHTML: canUserUseUnfilteredHTML(),
		};
	}),
])(InspectorControls);
