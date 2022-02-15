import {
	DefaultContext,
	DefaultProvider,
} from '../modules/default/defaultContext';
import { PolicyContext, PolicyProvider } from '../modules/policy/policyContext';
import {
	GlobalSearchContext,
	GlobalSearchProvider,
} from '../modules/globalSearch/globalSearchContext';
import { EDAContext, EDAProvider } from '../modules/eda/edaContext';
import {
	JBookContext,
	JBookProvider,
} from '../modules/jbook/jbookContext';

const getContext = (cloneName) => {
	switch (cloneName) {
		case 'gamechanger':
		case 'gamechanger-test':
			return PolicyContext;
		case 'globalSearch':
			return GlobalSearchContext;
		case 'eda':
			return EDAContext;
		case 'jbook':
			return JBookContext;
		default:
			return DefaultContext;
	}
};

const getProvider = (cloneName) => {
	switch (cloneName) {
		case 'gamechanger':
		case 'gamechanger-test':
			return PolicyProvider;
		case 'globalSearch':
			return GlobalSearchProvider;
		case 'eda':
			return EDAProvider;
		case 'jbook':
			return JBookProvider;
		default:
			return DefaultProvider;
	}
};

export { getContext, getProvider };
