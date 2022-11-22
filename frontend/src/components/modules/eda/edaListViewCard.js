import React from 'react';
import { StyledListViewFrontCardContent } from '../default/defaultCardHandler';
import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import _ from 'lodash';
import sanitizeHtml from 'sanitize-html';
import GCTooltip from '../../common/GCToolTip';
import { makeCustomDimensions } from '../../telemetry/utils/customDimensions';

const EDAListViewCard = (props) => {
	const {
		item,
		cloneData,
		hitsExpanded,
		setHitsExpanded,
		hoveredHit,
		setHoveredHit,
		clickFn,
		contextHtml,
		tooltipText,
		metadataExpanded,
		setMetadataExpanded,
		backBody,
	} = props;

	console.log(item);

	return (
		<StyledListViewFrontCardContent expandedDataBackground={'#eceef1'}>
			{item.pageHits && item.pageHits.length > 0 && (
				<button
					type="button"
					className={'list-view-button'}
					onClick={() => {
						trackEvent(
							getTrackingNameForFactory(cloneData.clone_name),
							'ListViewInteraction',
							!hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages',
							null,
							makeCustomDimensions(item.file_location_eda_ext)
						);
						setHitsExpanded(!hitsExpanded);
					}}
				>
					<span className="buttonText">Page Hits</span>
					<i className={hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
				</button>
			)}
			{hitsExpanded && (
				<div className={'expanded-hits'}>
					<div className={'page-hits'}>
						{_.chain(item.pageHits)
							.map((page, key) => {
								return (
									<div
										className={'page-hit'}
										key={key}
										style={{
											...(hoveredHit === key && {
												backgroundColor: '#E9691D',
												color: 'white',
											}),
										}}
										onMouseEnter={() => setHoveredHit(key)}
										onClick={(e) => {
											e.preventDefault();
											clickFn(
												item.file_location_eda_ext,
												cloneData.clone_name,
												'',
												page.pageNumber
											);
										}}
									>
										<span>{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>
										<i
											className="fa fa-chevron-right"
											style={{
												color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
											}}
										/>
									</div>
								);
							})
							.value()}
					</div>
					<div className={'expanded-metadata'}>
						<blockquote
							dangerouslySetInnerHTML={{
								__html: sanitizeHtml(contextHtml),
							}}
						/>
					</div>
				</div>
			)}
			<GCTooltip title={tooltipText} arrow placement="top" enterDelay={400}>
				<div>
					<button
						type="button"
						className={'list-view-button'}
						onClick={() => {
							trackEvent(
								getTrackingNameForFactory(cloneData.clone_name),
								'ListViewInteraction',
								!metadataExpanded ? 'Expand metadata' : 'Collapse metadata',
								null,
								makeCustomDimensions(item.file_location_eda_ext)
							);
							setMetadataExpanded(!metadataExpanded);
						}}
					>
						<span className="buttonText">Document Metadata</span>
						<i
							className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
							aria-hidden="true"
						/>
					</button>
					{metadataExpanded && (
						<div className={'metadata'}>
							<div className={'inner-scroll-container'}>{backBody}</div>
						</div>
					)}
				</div>
			</GCTooltip>
		</StyledListViewFrontCardContent>
	);
};

export default EDAListViewCard;
