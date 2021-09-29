import React from 'react';
import _ from 'underscore';
import grey from '@material-ui/core/colors/grey';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const grey300 = grey[300];

const LinkList = styled.ul`
	list-style-type: none;
	border: 1px solid ${grey300};
	padding-left: 0;
	font-family: Noto Sans;
`;
const LinkListItem = styled.li`
	border-top: 1px solid ${grey300};
	padding: 15px 4px;
	cursor: pointer;
	color: #386f94;
`;

const FaIcon = styled.i`
	margin-left: 10px;
	font-size: 0.8em;
`;

export default class MagellanTrendingLinkList extends React.Component {
	static defaultProps = {
		links: [],
		title: 'Trending',
		onLinkClick: _.noop,
		padding: 0,
	};
	render() {
		const { links, title, onLinkClick } = this.props;
		return (
			<div>
				<Typography variant="h3" style={{ marginBottom: 10, fontSize: 20 }}>
					{title}
				</Typography>
				<LinkList>
					{_.map(links, (link, idx) => (
						<LinkListItem onClick={() => onLinkClick(link)} key={idx}>
							<span style={{ marginLeft: this.props.padding }}>{link}</span>
							<FaIcon className="fa fa-chevron-right" />
						</LinkListItem>
					))}
				</LinkList>
			</div>
		);
	}
}
