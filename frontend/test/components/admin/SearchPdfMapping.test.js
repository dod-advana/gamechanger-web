/**
 * @jest-environment jsdom
 */
import React from 'react';
import { configure, shallow } from 'enzyme';
import { assert } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import SearchPdfMapping, {filterCaseInsensitiveIncludes} from '../../../src/components/admin/SearchPdfMapping';

configure({ adapter: new Adapter() });

describe('<SearchPdfMapping />', () => {
    describe('#filterCaseInsensitiveIncludes', () => {
        test('filter without match returns false', () => {
            const filter = {
              id: 0,
              value: 'x'
            };
            const row = ['TEST-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), false);
        });

        test('same string returns true', () => {
            const filter = {
              pivotId: 0,
              id: 0,
              value: 'test-string'
            };
            const row = ['TEST-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), true);
        });

        test('same string different captialization returns true', () => {
            const filter = {
              pivotId: 0,
              id: 0,
              value: 'test-string'
            };
            const row = ['test-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), true);
        });

        test('out of bounds id returns false', () => {
            const filter = {
              pivotId: 1,
              id: 1,
              value: 'test-string'
            };
            const row = ['TEST-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), false);
        });

        test('using ID instead of pivotID works', () => {
            const filter = {
              id: 0,
              value: 'test-string'
            };
            const row = ['TEST-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), true);
        });

        test('filter without match returns false', () => {
            const filter = {
              id: 0,
              value: 'x'
            };
            const row = ['TEST-STRING'];
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), false);
        });
    });


    describe('#SearchPdfMapping', () => {
        test('should render correctly without props', () => {
            const component = shallow(<SearchPdfMapping />);
            expect(component).toMatchSnapshot();
        });
    });

});