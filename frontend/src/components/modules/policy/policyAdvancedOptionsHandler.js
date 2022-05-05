import React from 'react';
import { getAdvancedOptions } from './policySearchMatrixHandler';

const PolicyAdvancedOptionsHandler = (props) => {
	return <>{getAdvancedOptions(props)}</>;
};

export default PolicyAdvancedOptionsHandler;
