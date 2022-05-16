import React from 'react';
import { createCopyTinyUrl } from '../../../utils/sharedFunctions';

import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';

const DefaultViewHeaderHandler = (props) => {
	const { context = {}, extraStyle = {} } = props;

	const { state, dispatch } = context;

	const { cloneData } = state;

	return (
		<div className={'results-count-view-buttons-container'} style={extraStyle}>
			{state.cloneData.clone_name === 'gamechanger' ? (
				<>
					<div className={'view-filters-container'}></div>
				</>
			) : (
				<> </>
			)}
			<div
				className={'view-buttons-container'}
				style={
					cloneData.clone_name !== 'gamechanger'
						? { marginRight: 35, zIndex: 99 }
						: { marginRight: 15, zIndex: 99 }
				}
			>
				<GCButton
					className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
					id={'gcShareSearch'}
					onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
					style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
					disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
				>
					<GCTooltip title="Share" placement="bottom" arrow>
						<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCTooltip>
				</GCButton>
			</div>
		</div>
	);
};

export default DefaultViewHeaderHandler;
