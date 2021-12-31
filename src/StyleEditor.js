import {
	__,
} from '@wordpress/i18n';

import {
	Button,
	TextControl,
	Dashicon,
} from '@wordpress/components';

import {
	useState,
	useEffect,
	useRef,
} from '@wordpress/element';

import parse from 'style-to-object';

const PLACEHOLDER = '-afb-placeholder';

const clean = string => {
	return string.replaceAll(':', '').replaceAll(';', '');
};

/**
 * Advanced editor for style attribute.
 */
let StyleEditor;
export default StyleEditor = ({value = '', onChange, toggleStyleEditor}) => {
	const [parsedValue, setParsedValue] = useState({'': ''});
	const [error, setError] = useState(false);
	const [skipDash, setSkipDash] = useState(false);
	const firstUpdate = useRef(true);
	const parsed = useRef(false);

	useEffect(() => {
		parsed.current = false;
	}, [value]);

	useEffect(() => {
		if(parsed.current) {
			return;
		}
		try {
			const styles = parse(value);
			if(JSON.stringify(parsedValue) !== JSON.stringify(styles)) {
				setParsedValue(styles || {'': ''});
			}
			parsed.current = true;
		} catch(e) {
			setError(true);
		}
	}, [value, JSON.stringify(parsedValue)]);

	useEffect(() => {
		if(!parsed.current || !parsedValue) {
			return;
		}

		/**
		 * Skip first update when value is received.
		 */
		if(firstUpdate.current) {
			firstUpdate.current = false;
			return;
		}

		const nextValue = Object.keys(parsedValue).filter(k => k !== '').map(key => `${key}: ${parsedValue[key] || PLACEHOLDER};`).join(' ');
		if(value === nextValue) {
			return;
		}

		try {
			/**
			 * Throws error on invalid value.
			 */
			parse(nextValue);
			/**
			 * Update value.
			 */
			onChange(nextValue);
		} catch(e) {}
	}, [value, JSON.stringify(parsedValue)]);

	if(error) {
		return (
			<p style={{marginBottom: 0}}>
				<span style={{color: 'red'}}>{__('Unable to parse styles.', 'attributes-for-blocks')}</span>
				{` `}
				<a href="#" onClick={toggleStyleEditor}>
					{__('Edit', 'attributes-for-blocks')}
				</a>
				{` ${__('or', 'attributes-for-blocks')} `}
				<a
					href="#"
					onClick={e => {
						e.preventDefault();
						onChange('');
						setError(false);
						return false;
					}}
				>
					{__('Clear value', 'attributes-for-blocks')}
				</a>
			</p>
		);
	}

	if(!parsedValue) {
		return null;
	}

	const keys = Object.keys(parsedValue);

	return keys.map((key, index) => {
		const isFirst = index === 0;
		const isLast = index + 1 === keys.length;
		const isOnly = keys.length === 1;
		const isBlank = key === '' && parsedValue[key] === '';
		return (
			<div
				key={`rule-${index}`}
				class='wsd-afb-action-input wsd-afb-style'
				data-index={index}
				data-is-blank={isBlank}
			>
				<TextControl
					placeholder={__('Property...', 'attributes-for-blocks')}
					value={key}
					onKeyDown={e => {
						if(skipDash) {
							if(e.key === '-') {
								e.preventDefault();
								e.stopPropagation();
							}
							setSkipDash(false);
						}
					}}
					onChange={nextKey => {
						if(nextKey !== '' && keys.includes(nextKey)) {
							nextKey = `${nextKey}-`;
							setSkipDash(true);
						}
						setParsedValue(
							keys.reduce((acc, cur) => {
								if(cur === key) {
									acc[clean(nextKey)] = parsedValue[cur];
								} else {
									acc[cur] = parsedValue[cur];
								}
								return acc;
							}, {})
						);
					}}
					onKeyUp={e => {
						if(e.key === 'Enter') {
							document.querySelector(`.wsd-afb-style[data-index="${index}"] .components-base-control + .components-base-control input[type="text"]`)?.focus();
						}
					}}
				/>
				<TextControl
					placeholder={__('Value...', 'attributes-for-blocks')}
					value={parsedValue[key] === PLACEHOLDER ? '' : parsedValue[key]}
					onChange={nextValue => setParsedValue({...parsedValue, [key]: clean(nextValue)})}
					onKeyUp={e => {
						if(e.key === 'Enter') {
							if(isLast && !parsedValue.hasOwnProperty('')) {
								setParsedValue({...parsedValue, '': ''});
								setTimeout(() => {
									document.querySelector(`.wsd-afb-style[data-index="${index + 1}"] input[type="text"]`)?.focus();
								}, 50);
							}
						}
					}}
				/>
				<div className='wsd-afb-button-group'>
					<Button
						className='button icon-button'
						aria-label={__('Move up', 'attributes-for-blocks')}
						disabled={isFirst}
						onClick={() => setParsedValue(
							keys.filter(k => k !== key).reduce((acc, cur, currentIndex) => {
								if(currentIndex === index - 1) {
									acc[key] = parsedValue[key];
								}
								acc[cur] = parsedValue[cur];
								return acc;
							}, {})
						)}
					>
						<Dashicon icon='arrow-up' />
					</Button>
					<Button
						className='button icon-button is-top-right'
						aria-label={__('Remove rule', 'attributes-for-blocks')}
						disabled={isOnly && isBlank}
						onClick={() => {
							const {
								[key]: value,
								...rest
							} = parsedValue;
							setParsedValue({
								...rest,
								...(isOnly && {
									'': '',
								})
							});
						}}
					>
						<Dashicon icon='no' />
					</Button>
					<Button
						className='button icon-button'
						aria-label={__('Move down', 'attributes-for-blocks')}
						disabled={isLast}
						onClick={() => setParsedValue(
							keys.filter(k => k !== key).reduce((acc, cur, currentIndex) => {
								acc[cur] = parsedValue[cur];
								if(currentIndex === index) {
									acc[key] = parsedValue[key];
								}
								return acc;
							}, {})
						)}
					>
						<Dashicon icon='arrow-down' />
					</Button>
					<Button
						className='button icon-button is-bottom-right'
						aria-label={__('Add rule', 'attributes-for-blocks')}
						disabled={key === ''}
						onClick={() => {
							if(isLast) {
								const {
									'': empty,
									...rest
								} = parsedValue;
								setParsedValue({
									...rest,
									'': '',
								});
							} else {
								setParsedValue(
									keys.reduce((acc, cur, currentIndex) => {
										if(cur === '') {
											return acc;
										}
										acc[cur] = parsedValue[cur];
										if(currentIndex === index) {
											acc[''] = '';
										}
										return acc;
									}, {})
								);
							}
							setTimeout(() => {
								document.querySelector(`.wsd-afb-style[data-is-blank="true"] input[type="text"]`)?.focus();
							}, 50);
						}}
					>
						<Dashicon icon='plus' />
					</Button>
				</div>
			</div>
		);
	});
};
