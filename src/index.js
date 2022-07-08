import {
	applyFilters,
	addFilter,
} from '@wordpress/hooks';

import {
	hasBlockSupport,
} from '@wordpress/blocks';

import {
	Fragment,
} from '@wordpress/element';

import {
	createHigherOrderComponent,
} from '@wordpress/compose';

import InspectorControls from './InspectorControls';

import {
	mergeAttributes,
} from './utils';

import './style.scss';

const featureName = 'attributesForBlocks';
const featureDefaultEnabled = applyFilters('afb.defaultEnabled', true);
const featureIsSupported = block => {
	const name = block.name || block;
	if(window.afbData.unsupportedBlocks.includes(name)) {
		return false;
	}
	return hasBlockSupport(block, featureName, featureDefaultEnabled);
};
const featureAttributes = {
	attributesForBlocks: {
		type: 'object',
		default: {},
	},
};

/**
 * Add attributes to block attributes.
 */
const withFeatureAttributes = function(settings) {
	if(featureIsSupported(settings)) {
		settings.attributes = Object.assign(settings.attributes || {}, featureAttributes);
	}
	return settings;
}

/**
 * Add inspector controls to block edit component.
 */
const withFeatureInspectorControls = createHigherOrderComponent(function(BlockEdit) {
	return function(props) {
		if(featureIsSupported(props.name)) {
			return (
				<Fragment>
					<BlockEdit {...props} />
					<InspectorControls {...props} />
				</Fragment>
			);
		}
		return <BlockEdit {...props} />;
	};
}, 'withAttributesForBlocksInspectorControls');

/**
 * Add extra props to block's save component output.
 */
const withExtraProps = (extraProps, blockType, attributes) => {
	if(featureIsSupported(blockType)) {
		let {attributesForBlocks} = attributes;
		if(attributesForBlocks) {
			Object.keys(attributesForBlocks).forEach(attribute => {
				if(attribute.substring(0, 1) === '@') {
					/** Override mode: simply override the attribute. */
					extraProps[attribute.substring(1)] = attributesForBlocks[attribute];
				} else {
					/** Merge mode: try to merge attribute (if original value exists). */
					extraProps[attribute] = mergeAttributes(attribute, extraProps[attribute], attributesForBlocks[attribute]);
				}
			});
		}
	}
	return extraProps;
}

/**
 * Register feature filters.
 */
addFilter('blocks.registerBlockType', 'attributes-for-blocks/attributes', withFeatureAttributes);
addFilter('editor.BlockEdit', 'attributes-for-blocks/inspector-controls', withFeatureInspectorControls);
addFilter('blocks.getSaveContent.extraProps', 'attributes-for-blocks/extra-props', withExtraProps);
