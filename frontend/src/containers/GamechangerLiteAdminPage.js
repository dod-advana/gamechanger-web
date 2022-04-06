import React, { useContext, useEffect } from 'react';
import { getContext } from '../components/factories/contextFactory';
import { setState } from '../utils/sharedFunctions';
import AdminMainView from '../components/admin/AdminMainView';

/**
 *
 * @class GamechangerLiteAdminPage
 */
const GamechangerLiteAdminPage = (props) => {
	const { cloneData, jupiter } = props;

	const cloneName = cloneData.clone_name;
	const context = useContext(getContext(cloneName));
	const { state, dispatch } = context;

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, { cloneData: cloneData, cloneDataSet: true });
		}
	}, [cloneData, state, dispatch]);

	return (
		<div className="main-container" style={{ minHeight: 'calc(100vh - 120px' }}>
			{state.cloneDataSet && <AdminMainView context={context} jupiter={jupiter} />}
		</div>
	);
};

export default GamechangerLiteAdminPage;
