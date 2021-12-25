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
} from '@wordpress/components';

import HelpModal from './HelpModal';

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
		};

		this.addAttribute = this.addAttribute.bind(this);
		this.removeAttribute = this.removeAttribute.bind(this);
		this.toggleAttributeMode = this.toggleAttributeMode.bind(this);
	}

	/**
	 * Handle component updates.
	 *
	 * @param {object} prevProps
	 * @param {object} prevState
	 */
	componentDidUpdate(prevProps, prevState) {
		if(prevState.adding && !this.state.adding) {
			/**
			 * Focus newly added attribute.
			 */
			setTimeout(() => {
				document.querySelector(`.wsd-afb-action-input#afb-${prevState.adding} input[type="text"]`)?.focus();
			}, 50);
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
			/**
			 * Focus already existing attribute.
			 */
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
	 * Render Attributes for Blocks inspector controls.
	 */
	render() {
		let {adding} = this.state;
		let {attributesForBlocks} = this.props.attributes;

		return (
			<InspectorAdvancedControls>
				<BaseControl className='wsd-afb'>
					<form
						className='wsd-afb-action-input'
						onSubmit={this.addAttribute}
					>
						<TextControl
							label={__('Additional attributes', 'attributes-for-blocks')}
							placeholder={__('Add attribute', 'attributes-for-blocks')}
							value={adding}
							onChange={value => this.setState({
								adding: value,
								message: undefined,
							})}
						/>
						<Button
							className='button button-primary is-last'
							type='submit'
							aria-label={__('Add attribute', 'attributes-for-blocks')}
						>
							{__('Add', 'attributes-for-blocks')}
						</Button>
						<HelpModal />
					</form>
					<p className='wsd-afb-message'>{this.state.message || '\u00A0'}</p>
					{attributesForBlocks && Object.keys(attributesForBlocks).map(attribute => {
						let normalizedName = attribute.replace('@', '');
						let isOverride = attribute.substring(0, 1) === '@';
						let label = (
							<Fragment>
								<strong>{normalizedName}</strong>
								{isOverride && ' ' + __('(override)', 'attributes-for-blocks')}
							</Fragment>
						);
						return (
							<div
								key={attribute}
								id={'afb-' + normalizedName}
								className='wsd-afb-action-input'
							>
								<TextControl
									label={label}
									value={attributesForBlocks[attribute]}
									onChange={value => this.updateAttribute(attribute, value)}
								/>
								<Button
									className='button icon-button'
									aria-label={__('Toggle between merge and override mode', 'attributes-for-blocks')}
									aria-current={isOverride ? __('Override', 'attributes-for-blocks') : __('Merge', 'attributes-for-blocks')}
									onClick={() => this.toggleAttributeMode(attribute)}
								>
									<Dashicon icon='randomize' />
								</Button>
								<Button
									className='button icon-button is-last'
									aria-label={__('Remove attribute', 'attributes-for-blocks') + ': ' + normalizedName}
									onClick={() => this.removeAttribute(attribute)}
								>
									<Dashicon icon='no-alt' />
								</Button>
							</div>
						);
					})}
				</BaseControl>
			</InspectorAdvancedControls>
		);
	}
}

export default InspectorControls;
