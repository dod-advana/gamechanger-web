/**
 * @jest-environment jsdom
 */
import React from 'react';
import { configure, shallow } from 'enzyme';
import { assert } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import {filterCaseInsensitiveIncludes, SearchPdfMapping} from '../../../src/components/admin/SearchPdfMapping';

configure({ adapter: new Adapter() });

describe('<SearchPdfMapping />', () => {
    describe('#filterCaseInsensitiveIncludes', () => {
        test('uses null if start date null/empty', () => {
            filter = {
              pivotId: 0,
              id: 0,
              value: 'test-string'
            }
            row = ['TEST-STRING']
            assert.deepEqual(filterCaseInsensitiveIncludes(filter, row), true);
        });

        // test('uses null if end date null/empty', () => {
        //     assert.deepEqual(getDateRange('2020-05-01', ''), ['2020-05-01', null])
        // });

        // test('passes both start and end date if not null/empty', () => {
        //     assert.deepEqual(getDateRange('2020-05-01', '2020-05-31'), ['2020-05-01', '2020-05-31'])
        // });
    });
});