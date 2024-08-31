import {
	renameProp,
	mergeAttributes,
} from '../utils'

import {
	addFilter,
} from '@wordpress/hooks'

describe('renameProp()', () => {

	const obj = {asd: 'qwe', foo: 'bar', baz: 'xed'}
	const oKeys = Object.keys(obj)
	const obj2 = renameProp('foo', '@foo', obj)
	const o2Keys = Object.keys(obj2)

	it('renames prop', () => {
		expect(obj2['foo']).toBe(undefined)
		expect(obj2['@foo']).toBe('bar')
	})

	it('keeps order', () => {
		expect(obj2['@foo']).toBe('bar')
		expect(o2Keys[0]).toBe(oKeys[0])
		expect(o2Keys[1]).toBe('@foo')
		expect(o2Keys[2]).toBe(oKeys[2])
	})
})

describe('mergeAttributes()', () => {

	it('merges string style', () => {
		const mergedStyle = mergeAttributes('style', 'color:red', 'font-weight:bold')
		expect(mergedStyle).toBe('color:red;font-weight:bold')
	})

	it('merges object style', () => {
		const mergedStyleObj = mergeAttributes('style', {color: 'red'}, 'margin: 3em;padding:0')
		expect(mergedStyleObj.color).toBe('red')
		expect(mergedStyleObj.margin).toBe('3em')
		expect(mergedStyleObj.padding).toBe('0')
	})

	it('merges classes', () => {
		const merged = mergeAttributes('class', 'asd qwe', 'foo bar')
		expect(merged).toBe('asd qwe foo bar')
	})

	it('applies filter', () => {
		addFilter('afb.attribute.separator', 'test-filter', (separator, attribute, current, add) => {
			return attribute === 'data-test' ? '@' : separator
		})
		const mergedWithFilter = mergeAttributes('data-test', 'asd', 'foo')
		expect(mergedWithFilter).toBe('asd@foo')
	})

	it('merges with nothing', () => {
		expect(mergeAttributes('att', '', 'next')).toBe('next')
	})
})
