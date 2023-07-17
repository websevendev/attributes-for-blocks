import * as React from 'react'
import {__} from '@wordpress/i18n'

import {
	Button,
	TextControl,
	Dashicon,
} from '@wordpress/components'

import {
	useState,
} from '@wordpress/element'

import parse from 'style-to-object'

export const PLACEHOLDER = '-afb-placeholder'
export const SPACE_PLACEHOLDER = '-afb-space'

type CSSProperty = string
type CSSValue = string
type Style = Record<CSSProperty, CSSValue>

export interface StyleEditorProps {
	value: string
	onChange: (nextValue: string) => void
	toggleStyleEditor: (e?: React.SyntheticEvent) => void | boolean
}

const StyleEditor: React.FC<StyleEditorProps> = ({value, onChange, toggleStyleEditor}) => {

	/**
	 * When adding a property that already exists, a dash is automatically appended to prevent overwriting the existing property.
	 * Example: When `border` exists, adding `border` will produce `border-`.
	 * `skipDash` will prevent the following `-` keypress from adding an additional `-`.
	 */
	const [skipDash, setSkipDash] = useState<boolean>(false)

	let parsedValue: Style

	try {
		/** Transform string style into an object. */
		parsedValue = parse(value) as Style
	} catch(e) {

		const resetStyles = (e: React.SyntheticEvent): false => {
			e.preventDefault()
			onChange('')
			return false
		}

		return <Error toggleStyleEditor={toggleStyleEditor} resetStyles={resetStyles} />
	}

	if(!parsedValue) {
		parsedValue = {[PLACEHOLDER]: PLACEHOLDER}
	}

	const updateStyle = (nextStyle: Style) => {

		const format = (key: keyof typeof nextStyle) => {
			let value = nextStyle[key] || PLACEHOLDER
			if(value[value.length - 1] === ' ') {
				value = value.slice(0, -1) + SPACE_PLACEHOLDER
			}
			return `${key}: ${value};`
		}

		const nextValue = Object.keys(nextStyle)
			.map(key => key === '' ? PLACEHOLDER : key)
			.map(format)
			.join(' ')

		if(value !== nextValue) {
			onChange(nextValue)
		}
	}

	const keys = Object.keys(parsedValue) as CSSProperty[]

	return <>{keys.map((key, index) => {

		const isFirst = index === 0
		const isLast = index + 1 === keys.length
		const isOnly = keys.length === 1
		const isBlank = key === PLACEHOLDER && parsedValue[key] === PLACEHOLDER

		return (
			<div
				key={`rule-${index}`}
				className='wsd-afb-action-input wsd-afb-style'
				data-index={index}
				data-is-blank={isBlank}
			>
				<TextControl
					placeholder={__('Property...', 'attributes-for-blocks')}
					value={key === PLACEHOLDER ? '' : key}
					onChange={(nextKey: CSSProperty) => {
						if(nextKey !== '' && keys.includes(nextKey)) {
							nextKey = `${nextKey}-`
							setSkipDash(true)
						}
						updateStyle(
							keys.reduce((acc, cur) => {
								if(cur === key) {
									acc[clean(nextKey)] = parsedValue[cur]
								} else {
									acc[cur] = parsedValue[cur]
								}
								return acc
							}, {} as Style)
						)
					}}
					onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if(skipDash) {
							if(e.key === '-') {
								e.preventDefault()
								e.stopPropagation()
							}
							setSkipDash(false)
						}
					}}
					onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if(e.key === 'Enter') {
							/** Move focus from `Property` to `Value` field. */
							focusElement(`.wsd-afb-style[data-index="${index}"] .components-base-control + .components-base-control input[type="text"]`, false)
						}
					}}
				/>
				<TextControl
					placeholder={__('Value...', 'attributes-for-blocks')}
					value={parsedValue[key] === PLACEHOLDER ? '' : parsedValue[key].replace(SPACE_PLACEHOLDER, ' ')}
					onChange={(nextValue: CSSValue) => {
						updateStyle({...parsedValue, [key]: clean(nextValue)})
					}}
					onBlur={() => {
						/** Clean trailing space placeholder. */
						if(parsedValue[key].includes(SPACE_PLACEHOLDER)) {
							updateStyle({...parsedValue, [key]: parsedValue[key].replace(SPACE_PLACEHOLDER, '')})
						}
					}}
					onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if(e.code === 'Enter') {
							/** Add new empty row if there already isn't one. */
							const addNewRow = isLast && !parsedValue.hasOwnProperty(PLACEHOLDER)
							if(addNewRow) {
								updateStyle({...parsedValue, [PLACEHOLDER]: PLACEHOLDER})
							}
							/** Move focus from `Value` field to next `Property` field. */
							focusElement(`.wsd-afb-style[data-index="${index + 1}"] input[type="text"]`, addNewRow)
						}
					}}
				/>
				<div className='wsd-afb-button-group'>
					<Button
						className='button icon-button'
						aria-label={__('Move up', 'attributes-for-blocks')}
						disabled={isFirst}
						onClick={() => updateStyle(
							keys.filter(k => k !== key).reduce((acc, cur, currentIndex) => {
								if(currentIndex === index - 1) {
									acc[key] = parsedValue[key]
								}
								acc[cur] = parsedValue[cur]
								return acc
							}, {} as Style)
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
							} = parsedValue
							updateStyle({
								...rest,
								...(isOnly && {[PLACEHOLDER]: PLACEHOLDER}),
							})
						}}
					>
						<Dashicon icon='no' />
					</Button>
					<Button
						className='button icon-button'
						aria-label={__('Move down', 'attributes-for-blocks')}
						disabled={isLast}
						onClick={() => updateStyle(
							keys.filter(k => k !== key).reduce((acc, cur, currentIndex) => {
								acc[cur] = parsedValue[cur]
								if(currentIndex === index) {
									acc[key] = parsedValue[key]
								}
								return acc
							}, {} as Style)
						)}
					>
						<Dashicon icon='arrow-down' />
					</Button>
					<Button
						className='button icon-button is-bottom-right'
						aria-label={__('Add rule', 'attributes-for-blocks')}
						disabled={key === PLACEHOLDER}
						onClick={() => {
							if(isLast) {
								const {
									[PLACEHOLDER]: _empty,
									...rest
								} = parsedValue
								updateStyle({
									...rest,
									[PLACEHOLDER]: PLACEHOLDER,
								})
							} else {
								updateStyle(
									keys.reduce((acc, cur, currentIndex) => {
										if(cur === PLACEHOLDER) {
											return acc
										}
										acc[cur] = parsedValue[cur]
										if(currentIndex === index) {
											acc[PLACEHOLDER] = PLACEHOLDER
										}
										return acc
									}, {} as Style)
								)
							}
							focusElement(`.wsd-afb-style[data-is-blank="true"] input[type="text"]`)
						}}
					>
						<Dashicon icon='plus' />
					</Button>
				</div>
			</div>
		)
	})}</>
}

/**
 * Renders error message when input styles cannot be parsed.
 */
interface ErrorProps {
	toggleStyleEditor: StyleEditorProps['toggleStyleEditor']
	resetStyles: (e: React.SyntheticEvent) => false
}
const Error: React.FC<ErrorProps> = ({toggleStyleEditor, resetStyles}) => (
	<p style={{marginBottom: 0}}>
		<span style={{color: 'red'}}>
			{__('Unable to parse styles.', 'attributes-for-blocks')}
		</span>
		{` `}
		<a href="#" onClick={toggleStyleEditor}>
			{__('Edit', 'attributes-for-blocks')}
		</a>
		{` ${__('or', 'attributes-for-blocks')} `}
		<a href="#" onClick={resetStyles}>
			{__('Clear value', 'attributes-for-blocks')}
		</a>
	</p>
)

/** Strip characters that can't be in style property or value. */
const clean = (s: string): string => {
	return s.replaceAll(':', '').replaceAll(';', '')
}

/** Focus HTML element. */
const focusElement = (selector: string, delayed: boolean = true) => {
	const focus = () => {
		const element = document.querySelector(selector)
		if(element !== null) {
			(element as HTMLElement).focus()
		}
	}
	delayed ? setTimeout(focus, 50) : focus()
}

export default StyleEditor
