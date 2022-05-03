import React from 'react';
import { getAdvancedOptions } from './edaSearchMatrixHandler';

const EDAAdvancedOptionsHandler = (props) => {
	return <>{getAdvancedOptions(props)}</>;
};

export default EDAAdvancedOptionsHandler;
