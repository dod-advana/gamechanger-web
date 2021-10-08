import { Bezier } from 'bezier-js';
import { convertHexToRgbA } from './gamechangerUtils';
const Color = require('color');

const NODE_COLORS = [
	{ color: '#c990c0', textColor: '#000000' },
	{ color: '#f79767', textColor: '#000000' },
	{ color: '#57c7e3', textColor: '#000000' },
	{ color: '#f16666', textColor: '#000000' },
	{ color: '#d9c8ae', textColor: '#000000' },
	{ color: '#8dcc93', textColor: '#000000' },
	{ color: '#ecb5c9', textColor: '#000000' },
	{ color: '#4c8eda', textColor: '#000000' },
	{ color: '#ffc354', textColor: '#000000' },
	{ color: '#569480', textColor: '#000000' },
];

export const EDGE_PATTERNS = [
	[1, 1],
	[2, 2],
	[3, 1],
	[3, 1, 1, 1],
	[2, 1, 1, 1],
];

export const getTextColorBasedOnBackground = (backgroundColor) => {
	const color = Color(backgroundColor);

	if (color.isDark()) {
		return '#ffffff';
	} else {
		return '#000000';
	}
};

export const calcLinkControlPoints = (edge) => {
	const curvature = edge.curvature;

	if (curvature === 0) {
		// straight line
		edge.__controlPoints = null;
		return;
	}

	const start = edge.source;
	const end = edge.target;
	if (!start || !end || !start.hasOwnProperty('x') || !end.hasOwnProperty('x'))
		return; // skip invalid link

	const l = Math.sqrt(
		Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
	); // line length

	if (l > 0) {
		const a = Math.atan2(end.y - start.y, end.x - start.x); // line angle
		const d = l * curvature; // control point distance

		const cp = {
			// control point
			x: (start.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
			y: (start.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2),
		};

		edge.__controlPoints = [cp.x, cp.y];
	} else {
		// Same point, draw a loop
		const d = curvature * 70;
		edge.__controlPoints = [end.x, end.y - d, end.x + d, end.y];
	}
};

export const draw2DArrows = (
	link,
	ctx,
	globalScale,
	arrowLength,
	arrowRelativePos,
	color,
	nodeRelSize,
	test = false
) => {
	const ARROW_WH_RATIO = 1.6;
	const ARROW_VLEN_RATIO = 0.2;

	const start = link.source;
	const end = link.target;

	const nodeSize = end.value * nodeRelSize;

	if (
		!start ||
		!end ||
		!start.hasOwnProperty('x') ||
		!end.hasOwnProperty('x') ||
		!start.x ||
		!start.y ||
		!end.x ||
		!end.y
	)
		return; // skip invalid link

	const startR = Math.sqrt(Math.max(0, nodeSize || 1));
	const endR = Math.sqrt(Math.max(0, nodeSize || 1));

	const arrowRelPos = Math.min(1, Math.max(0, arrowRelativePos));
	const arrowColor = color;
	const arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2;

	// Construct bezier for curved lines
	const bzLine =
		link.__controlPoints &&
		new Bezier(start.x, start.y, ...link.__controlPoints, end.x, end.y);

	const getCoordsAlongLine = bzLine
		? (t) => bzLine.get(t) // get position along bezier line
		: (t) => ({
			// straight line: interpolate linearly
			x: start.x + (end.x - start.x) * t || 0,
			y: start.y + (end.y - start.y) * t || 0,
		  });

	const lineLen = bzLine
		? bzLine.length()
		: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

	const posAlongLine =
		startR +
		arrowLength +
		(lineLen - startR - endR - arrowLength) * arrowRelPos -
		nodeSize / 2;

	const arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
	const arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
	const arrowTailVertex = getCoordsAlongLine(
		(posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen
	);

	const arrowTailAngle =
		Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) -
		Math.PI / 2;

	if (test) {
		return {
			posAlongLine,
			arrowHead,
			arrowTail,
			arrowTailVertex,
			arrowTailAngle,
		};
	}

	ctx.beginPath();

	ctx.moveTo(arrowHead.x, arrowHead.y);
	ctx.lineTo(
		arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle),
		arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle)
	);
	ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y);
	ctx.lineTo(
		arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle),
		arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle)
	);

	ctx.fillStyle = arrowColor;
	ctx.fill();
};

export const getNodeColors = (node, alpha, nodeLabelColors = {}) => {
	if (
		nodeLabelColors[node?.label] &&
		nodeLabelColors[node?.label].color === ''
	) {
		shuffleArray(NODE_COLORS);

		Object.keys(nodeLabelColors).forEach((label, idx) => {
			nodeLabelColors[label] = {
				color: NODE_COLORS[idx].color,
				textColor: NODE_COLORS[idx].textColor,
			};
		});
	} else {
		if (
			!nodeLabelColors[node?.label] ||
			nodeLabelColors[node?.label].color === ''
		) {
			return {
				nodeColor: convertHexToRgbA('#000000', alpha),
				nodeTextColor: convertHexToRgbA('#ffffff', alpha),
				nodeHexColor: '#000000',
			};
		}
	}

	const nodeColor = nodeLabelColors[node.label].color;

	return {
		nodeColor: convertHexToRgbA(nodeColor, alpha),
		nodeTextColor: convertHexToRgbA(
			getTextColorBasedOnBackground(nodeColor),
			alpha
		),
		nodeHexColor: nodeColor,
	};
};

export const getLinkColor = (link, alpha) => {
	return convertHexToRgbA('#000000', alpha);
};

export const getNodeOutlineColors = (
	node,
	alpha,
	nodeColor,
	connectedLevel
) => {
	switch (connectedLevel) {
		case 0:
			return convertHexToRgbA('#ffe89c', alpha);
		case 1:
			return convertHexToRgbA('#ff9c50', alpha);
		default:
			return convertHexToRgbA(Color(nodeColor).darken(0.3).hex(), alpha);
	}
};

export const getLines = (ctx, text, maxWidth) => {
	if (text) {
		const words = text.split(' ');
		const lines = { max: 0, lines: [] };
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(currentLine + ' ' + word).width;
			if (lines.max > width) lines.max = width;
			if (width < maxWidth) {
				currentLine += ' ' + word;
			} else {
				lines.lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.lines.push(currentLine);
		return lines;
	} else {
		return '';
	}
};

export const shuffleArray = (array) => {
	const tempArr = [...array];
	for (let i = tempArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
	}
	return tempArr;
};

// https://stackoverflow.com/questions/10014271/generate-random-color-distinguishable-to-humans
export function generateRandomColors(number) {
	let i;
	if (
		typeof arguments[1] != 'undefined' &&
		arguments[1].constructor === Array &&
		arguments[1][0] &&
		arguments[1][0].constructor !== Array
	) {
		for (i = 0; i < arguments[1].length; i++) {
			//for all the passed colors
			const vals = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
				arguments[1][i]
			); //get RGB values
			arguments[1][i] = [
				parseInt(vals[1], 16),
				parseInt(vals[2], 16),
				parseInt(vals[3], 16),
			]; //and convert them to base 10
		}
	}
	let loadedColors = typeof arguments[1] == 'undefined' ? [] : arguments[1]; //predefine colors in the set
	let tmpNum = number + loadedColors.length; //reset number to include the colors already passed
	let lastLoadedReduction = Math.floor(Math.random() * 3); //set a random value to be the first to decrease

	const rgbToHSL = (rgb) => {
		const color = new Color.rgb(rgb);
		const hsl = color.hsl().color;
		return hsl;
	};

	const hslToRGB = (hsl) => {
		const color = new Color.hsl(hsl);
		const rgb = color.rgb().array();
		return rgb;
	};

	const shiftHue = (rgb, degree) => {
		//shifts [r,g,b] by a number of degrees
		const hsl = rgbToHSL(rgb); //convert to hue/saturation/luminosity to modify hue
		hsl[0] += degree; //increment the hue
		if (hsl[0] > 360) {
			//if it's too high
			hsl[0] -= 360; //decrease it mod 360
		} else if (hsl[0] < 0) {
			//if it's too low
			hsl[0] += 360; //increase it mod 360
		}
		return hslToRGB(hsl); //convert back to rgb
	};

	let differenceRecursions = {
		//stores recursion data, so if all else fails we can use one of the hues already generated
		differences: [], //used to calculate the most distant hue
		values: [], //used to store the actual colors
	};

	const fixDifference = (colorMap = []) => {
		//recursively asserts that the current color is distinctive
		if (differenceRecursions.values.length > 23) {
			//first, check if this is the 25th recursion or higher. (can we try any more unique hues?)
			//if so, get the biggest value in differences that we have and its corresponding value
			const ret =
				differenceRecursions.values[
					differenceRecursions.differences.indexOf(
						Math.max.apply(null, differenceRecursions.differences)
					)
				];
			differenceRecursions = { differences: [], values: [] }; //then reset the recursions array, because we're done now
			return ret; //and then return up the recursion chain
		} //okay, so we still have some hues to try.
		const differences = []; //an array of the "difference" numbers we're going to generate.
		for (let i = 0; i < loadedColors.length; i++) {
			//for all the colors we've generated so far

			const difference = [];
			difference.push(Math.abs(loadedColors[i][0] - colorMap[0]));
			difference.push(Math.abs(loadedColors[i][1] - colorMap[1]));
			difference.push(Math.abs(loadedColors[i][2] - colorMap[2]));

			const sumFunction = (sum, value) => {
				//function for adding up arrays
				return sum + value;
			};

			const sumDifference = difference.reduce(sumFunction); //add up the difference array
			const loadedColorLuminosity = loadedColors[i].reduce(sumFunction); //get the total luminosity of the already generated color
			const currentColorLuminosity = colorMap.reduce(sumFunction); //get the total luminosity of the current color
			const lumDifference = Math.abs(
				loadedColorLuminosity - currentColorLuminosity
			); //get the difference in luminosity between the two
			//how close are these two colors to being the same luminosity and saturation?
			const differenceRange =
				Math.max.apply(null, difference) - Math.min.apply(null, difference);
			const luminosityFactor = 50; //how much difference in luminosity the human eye should be able to detect easily
			const rangeFactor = 75; //how much difference in luminosity and saturation the human eye should be able to dect easily
			if (
				((luminosityFactor / (lumDifference + 1)) * rangeFactor) /
					(differenceRange + 1) >
				1
			) {
				//if there's a problem with range or luminosity
				//set the biggest difference for these colors to be whatever is most significant
				differences.push(
					Math.min(differenceRange + lumDifference, sumDifference)
				);
			}
			differences.push(sumDifference); //otherwise output the raw difference in RGB values
		}

		const breakdownAt = 64, //if you're generating this many colors or more, don't try so hard to make unique hues, because you might fail.
			breakdownFactor = 25, //how much should additional colors decrease the acceptable difference
			shiftByDegrees = 15, //how many degrees of hue should we iterate through if this fails
			acceptableDifference = 250, //how much difference is unacceptable between colors
			breakVal = (loadedColors.length / tmpNum) * (tmpNum - breakdownAt), //break down progressively (if it's the second color, you can still make it a unique hue)
			totalDifference = Math.min.apply(null, differences); //get the color closest to the current color

		if (
			totalDifference >
			acceptableDifference - (breakVal < 0 ? 0 : breakVal) * breakdownFactor
		) {
			//if the current color is acceptable
			differenceRecursions = { differences: [], values: [] }; //reset the recursions object, because we're done
			return colorMap; //and return that color
		} //otherwise the current color is too much like another

		//start by adding this recursion's data into the recursions object
		differenceRecursions.differences.push(totalDifference);
		differenceRecursions.values.push(colorMap);
		colorMap = shiftHue(colorMap, shiftByDegrees); //then increment the color's hue
		return fixDifference(colorMap); //and try again
	};

	const color = () => {
		//generate a random color
		const scale = (x) => {
			//maps [0,1] to [300,510]
			return x * 210 + 300; //(no brighter than #ff0 or #0ff or #f0f, but still pretty bright)
		};

		const randVal = () => {
			//random value between 300 and 510
			return Math.floor(scale(Math.random()));
		};

		const luminosity = randVal(), //random luminosity
			red = randVal(), //random color values
			green = randVal(), //these could be any random integer but we'll use the same function as for luminosity
			blue = randVal();

		let rescale = null; //we'll define this later
		let thisColor = [red, green, blue], //an array of the random values
			/*
			#ff0 and #9e0 are not the same colors, but they are on the same range of the spectrum, namely without blue.
			Try to choose colors such that consecutive colors are on different ranges of the spectrum.
			This shouldn't always happen, but it should happen more often then not.
			Using a factor of 2.3, we'll only get the same range of spectrum 15% of the time.
			*/
			valueToReduce =
				Math.floor(lastLoadedReduction + 1 + Math.random() * 2.3) % 3, //which value to reduce
			/*
			Because 300 and 510 are fairly close in reference to zero,
			increase one of the remaining values by some arbitrary percent betweeen 0% and 100%,
			so that our remaining two values can be somewhat different.
			*/
			valueToIncrease = Math.floor(valueToReduce + 1 + Math.random() * 2) % 3, //which value to increase (not the one we reduced)
			increaseBy = Math.random() + 1; //how much to increase it by

		lastLoadedReduction = valueToReduce; //next time we make a color, try not to reduce the same one
		thisColor[valueToReduce] = Math.floor(thisColor[valueToReduce] / 16); //reduce one of the values
		thisColor[valueToIncrease] = Math.ceil(
			thisColor[valueToIncrease] * increaseBy
		); //increase one of the values
		rescale = (x) => {
			//now, rescale the random numbers so that our output color has the luminosity we want
			return (
				(x * luminosity) /
				thisColor.reduce((a, b) => {
					return a + b;
				})
			); //sum red, green, and blue to get the total luminosity
		};
		thisColor = fixDifference(
			thisColor.map((a) => {
				return rescale(a);
			})
		); //fix the hue so that our color is recognizable
		if (Math.max.apply(null, thisColor) > 255) {
			//if any values are too large
			rescale = function (x) {
				//rescale the numbers to legitimate hex values
				return (x * 255) / Math.max.apply(null, thisColor);
			};
			thisColor = thisColor.map(function (a) {
				return rescale(a);
			});
		}
		return thisColor;
	};

	for (i = loadedColors.length; i < number; i++) {
		//Start with our predefined colors or 0, and generate the correct number of colors.
		loadedColors.push(
			color().map((value) => {
				//for each new color
				return Math.round(value); //round RGB values to integers
			})
		);
	}

	//then, after you've made all your colors, convert them to hex codes and return them.
	return loadedColors.map((color) => {
		const hx = (c) => {
			//for each value
			const h = c.toString(16); //then convert it to a hex code
			return h.length < 2 ? '0' + h : h; //and assert that it's two digits
		};
		return `#${hx(color[0])}${hx(color[1])}${hx(color[2])}`; //then return the hex code
	});
}
