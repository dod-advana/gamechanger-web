import React, { useState, useEffect, useCallback } from 'react';
import { Button, withStyles } from '@material-ui/core';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import CheveronLeftIcon from '@material-ui/icons/ChevronLeft';

import SearchImage from '../../../images/analytics/policy/GC-ai-search.png';
import CardImage from '../../../images/analytics/policy/GC-backofcards.png';
import GraphImage from '../../../images/analytics/policy/GC-nodecluster.png';
import ExplorerImage from '../../../images/analytics/policy/GC-documentexplore.png';
import CrowdsourceImage from '../../../images/analytics/policy/GC-crowdsource.png';
import TutorialImage from '../../../images/analytics/policy/GC-tooltip.png';

let timeoutId = null;

const GCCarousel = ({ classes, includeOnlyList }) => {
	const [carouselIndex, setCarouselIndex] = useState(0);

	let carouselOptions = [
		SearchImage,
		CardImage,
		GraphImage,
		ExplorerImage,
		CrowdsourceImage,
		TutorialImage,
	];
	let carouselText = [
		'Search Results: Search the corpus of requirements and policy using simple or complex queries. Each result is tied to an interactive card with information-rich metadata.',
		'Card View: Every card is equivalent to a document and has information-rich metadata which users can interact with by flipping any card around.',
		'Graph View: Our interactive Graph View provides the ability to visualize complex relationships between documents.',
		'Document Explorer: The Document Explorer tab provides a preview of each document to enable further research through a given query, allowing users to see all information at a single glance.',
		'Assists: In order to validate our models, we leverage all users to assist in tagging data to support our Natural Language Processing (NLP) development.',
		'Automated Tutorial: We ensure our users have the best tools to support their research and provide automated tutorials to guide use of the platform.',
	];

	if (includeOnlyList) {
		carouselOptions = carouselOptions.filter((_, i) =>
			includeOnlyList.includes(i)
		);
		carouselText = carouselText.filter((_, i) => includeOnlyList.includes(i));
	}

	const onNext = () => {
		let next =
			carouselIndex + 1 > carouselOptions.length - 1 ? 0 : carouselIndex + 1;
		setCarouselIndex(next);
	};

	const onPrev = () => {
		let prev =
			carouselIndex - 1 < 0 ? carouselOptions.length - 1 : carouselIndex - 1;
		setCarouselIndex(prev);
	};

	const tinyTileClick = (index) => {
		setCarouselIndex(index);
	};

	const onNextCb = useCallback(onNext, [carouselIndex, onNext]);

	useEffect(() => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(onNextCb, 30000);
	}, [carouselIndex, onNextCb]);

	return [
		<div style={{ minHeight: 500, marginTop: 50 }} key="option">
			<img
				src={carouselOptions[carouselIndex]}
				style={{ width: '100%' }}
				alt="Carousel Images"
			/>
		</div>,
		<div style={{ width: '100%' }} key="scrollButtons">
			<Button
				variant="outlined"
				onClick={onPrev}
				style={{ float: 'left', left: '-20px' }}
				classes={classes}
			>
				<CheveronLeftIcon style={styles.icon} />
			</Button>
			<Button
				variant="outlined"
				onClick={onNext}
				style={{ float: 'right', right: '-20px' }}
				classes={classes}
			>
				<CheveronRightIcon style={styles.icon} />
			</Button>
		</div>,
		<div key="text">
			<p>{carouselText[carouselIndex]}</p>
		</div>,
		<div style={styles.tileWrapper} key="indexTiles">
			{carouselOptions.map((option, index) => {
				return (
					<div
						style={{
							...styles.tinyTile,
							backgroundColor: index === carouselIndex ? '#13A792' : '#B0BAC5',
						}}
						onClick={() => tinyTileClick(index)}
						key={'indexTile' + index}
					></div>
				);
			})}
		</div>,
	];
};

const styles = {
	mottoText: {
		margin: '0px auto 0px auto',
	},
	mainText: {
		fontSize: 70,
		fontWeight: 'bold',
		lineHeight: '84px',
	},
	whiteColor: {
		color: 'white',
	},
	image: {
		width: '100%',
	},
	icon: {
		fontSize: 40,
		color: 'white',
	},
	tinyTile: {
		height: 10,
		width: 40,
		marginLeft: 3,
		marginRight: 3,
		cursor: 'pointer',
	},
	tileWrapper: {
		display: 'inline-flex',
		justifyContent: 'center',
		float: 'left',
		width: '100%',
		marginBottom: 50,
	},
	caption: {
		color: '#56B1AC',
		marginBottom: 15,
		marginLeft: 60,
		marginTop: 8,
		textTransform: 'uppercase',
	},
};

const materialStyles = () => ({
	root: {
		width: 65,
		top: '-300px',
		backgroundColor: '#B0BAC5',
		opacity: '.5',
		'&:hover': {
			backgroundColor: '#3F4A56',
		},
	},
});

export default withStyles(materialStyles)(GCCarousel);
