import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import React, { useEffect } from 'react';
import Config from '../../config/config';
import MatomoReactRouter from 'piwik-react-router';
import SparkMD5 from 'spark-md5';

const MATOMO_LINK = Config.MATOMO_LINK;
const MATOMO_SITE_ID = Config.MATOMO_SITE_ID;
let matomo = null;

try {
	matomo = MatomoReactRouter({
		url: MATOMO_LINK,
		siteId: MATOMO_SITE_ID,
	});
} catch (e) {
	console.log('Cannot find Matomo');
}

/***
 * High Order Component that wraps the component being called in the router.
 * Tracks the page view when the component mounts.
 * @param ComposedComponent: Component to wrap.
 * @param documentTitle: Title of the component. This will be displayed in Matomo.
 * @param customDimensions: Custom Dimensions to pass to Matomo. false if none provided.
 * @returns
 * @constructor
 */
export const TrackerWrapper = (ComposedComponent, documentTitle, customDimensions) => {
	function WrappedComponent(props) {
		useEffect(() => {
			trackPageView(documentTitle, customDimensions);
		}, []);

		return <ComposedComponent {...props} />;
	}

	return WrappedComponent;
};

/***
 * Sets up the custom dimensions if provided.
 * @param customDimensions: false or array of customDimensions.
 *	[
 *		{
 *		 	id: 1,
 *		 	value: 'value'
 *		}
 *	]
 * @param useMatomo
 */
function setupDimensions(customDimensions, useMatomo) {
	if (customDimensions && Array.isArray(customDimensions) && customDimensions.length && useMatomo) {
		customDimensions.map((customDimension) =>
			matomo.push(['setCustomDimension', customDimension.id, customDimension.value])
		);
	}
}

/***
 * Tracks the page view and sends to Matomo.
 * @param documentTitle: Title of the document. Will be displayed in Matomo.
 * @param customDimensions: false or an array of customDimensions.
 */
export function trackPageView(documentTitle, customDimensions) {
	try {
		const useMatomo =
			JSON.parse(localStorage.getItem('userMatomo')) && JSON.parse(localStorage.getItem('appMatomo'));
		if (localStorage.getItem('userMatomo') !== null && localStorage.getItem('appMatomo') !== null) {
			if (!useMatomo) return;
		}

		// Set User
		const userId = Auth.getUserId() || ' ';
		const id = userId.split('@');
		matomo.setUserId(SparkMD5.hash(id ? id[0] : userId));

		// Set URL and Document Title
		matomo.push(['setCustomUrl', window.location.href]);
		matomo.push(['setDocumentTitle', documentTitle]);

		// Remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
		matomo.push(['deleteCustomVariables', 'page']);
		matomo.push(['setGenerationTimeMs', 0]);

		// Set custom dimensions
		setupDimensions(customDimensions, useMatomo);
		// Track the new page
		matomo.push(['trackPageView']);

		// Make Matomo aware of newly added content
		const content = document.getElementById('content');
		matomo.push(['MediaAnalytics::scanForMedia', content]);
		matomo.push(['FormAnalytics::scanForForms', content]);
		matomo.push(['trackContentImpressionsWithinNode', content]);
		matomo.push(['enableLinkTracking']);
	} catch (error) {
		console.log(error);
	}
}

/***
 * Tracks the event and sends the provided data to Matomo.
 *
 * @param {string} category - Event category. Use a GAMECHANGER clone name.
 * @param {string} action - Event action.
 * @param {string} name - Event name.
 * @param {Number} value - Event value. Non-number value will be ignored by Matomo.
 * @param {CustomDimension[]} - Custom dimensions for the event. See
 * 		makeCustomDimensions() in ./utils/customDimensions.js.
 * @param {bool} isCustomDimensionsForOneActionOnly - Optional. True to track
 * 		customDimensions only for this event, false to track customDimensions
 * 		for all events following this event. Default is true.
 */
export function trackEvent(category, action, name, value, customDimensions, isCustomDimensionsForOneActionOnly = true) {
	try {
		const useMatomo =
			JSON.parse(localStorage.getItem('userMatomo')) && JSON.parse(localStorage.getItem('appMatomo'));
		if (localStorage.getItem('userMatomo') !== null && localStorage.getItem('appMatomo') !== null) {
			if (!useMatomo) return;
		}
		// Set User
		const userId = Auth.getUserId() || ' ';
		const id = userId.split('@');
		matomo.setUserId(SparkMD5.hash(id ? id[0] : userId));

		// Set custom dimensions & track event
		// See the "Custom Dimensions" section here: https://developer.matomo.org/guides/tracking-javascript-guide
		if (customDimensions) {
			if (isCustomDimensionsForOneActionOnly) {
				matomo.push(['trackEvent', category, action, name, value, customDimensions]);
			} else {
				setupDimensions(customDimensions, useMatomo);
				matomo.push(['trackEvent', category, action, name, value]);
			}
		}
	} catch (error) {
		// Nothing
	}
}

/**
 * Track an event in Matomo when a card is flipped.
 *
 * @param {string} category - Event category. Use a GAMECHANGER clone name.
 * @param {boolean} toggledOverview - True if the card was flipped from the
 * 		'Overview' side, false if it was flipped from the 'More' side.
 * @param {CustomDimension[]} - Custom dimensions for the event. See
 * 		makeCustomDimensions() in ./utils/customDimensions.js.
 */
export function trackFlipCardEvent(category, toggledOverview, customDimensions) {
	trackEvent(category, 'CardInteraction', `flipCard${toggledOverview ? 'Overview' : 'More'}`, null, customDimensions);
}

/***
 * Track an event in Matomo when a (left or right) panel is opened or closed.
 *
 * @param {string} category - Event category. Use a GAMECHANGER clone name.
 * @param {string} action - Event action.
 * @param {boolean} isLeft - True if the left panel was toggled, false if the
 *		right panel was toggled.
 * @param {boolean} wasOpen - True if the panel was open when the event occurred,
 *		false if the panel was closed when the event occurred.
 * @param {CustomDimension[]} - Custom dimensions for the event. See
 * 		makeCustomDimensions() in ./utils/customDimensions.js.
 */
export function trackLeftRightPanelToggle(category, action, isLeft, wasOpen, customDimensions) {
	const panelDirection = isLeft ? 'Left' : 'Right';
	const panelState = wasOpen ? 'Close' : 'Open';
	trackEvent(category, action, `${panelDirection}PanelToggle${panelState}`, null, customDimensions);
}

/**
 * Track an event in Matomo when a page title is clicked.
 *
 * @param {string} category - Event category. Use a GAMECHANGER clone name.
 * @param {string} pageName
 * @param {number|null} numValue - Optional integer value associated with the event
 * @param {CustomDimension[]} - Optional Custom dimensions for the event. See
 * 		makeCustomDimensions() in ./utils/customDimensions.js.
 */
export function trackPageTitleClick(category, pageName, numValue = null, customDimensions = []) {
	trackEvent(category, `${pageName}PageTitle`, 'onClick', numValue, customDimensions);
}

export function trackDocumentExplorerToggleAll(category, onExpand) {
	trackEvent(category, 'DocumentExplorerResultsViewToggle', onExpand ? 'onExpandAll' : 'onCollapseAll');
}

/***
 * Logs the error to Matomo.
 * @param e: Error object.
 * @param eventName: Event name.
 */
export function trackError(e, eventName) {
	try {
		const useMatomo =
			JSON.parse(localStorage.getItem('userMatomo')) && JSON.parse(localStorage.getItem('appMatomo'));
		if (localStorage.getItem('userMatomo') !== null && localStorage.getItem('appMatomo') !== null) {
			if (!useMatomo) return;
		}
		// Set User
		const userId = Auth.getUserId() || ' ';
		const id = userId.split('@');
		matomo.setUserId(SparkMD5.hash(id ? id[0] : userId));

		matomo.trackError(e, eventName);
	} catch (error) {
		// Nothing
	}
}

/***
 * Tracks a search and sends the values to Matomo.
 * @param keyword: Keywords used in the search.
 * @param category: Category of the search. (GameChanger use 'Keyword' or 'Semantic'
 * @param count: Total found.
 * @param customDimensions: false or an array of customDimensions.
 */
export function trackSearch(keyword, category, count, customDimensions) {
	try {
		setupDimensions(customDimensions, true);

		// Set User
		const userId = Auth.getUserId() || ' ';
		const id = userId.split('@');
		matomo.setUserId(SparkMD5.hash(id ? id[0] : userId));
		matomo.push(['trackSiteSearch', keyword, category, count]);
	} catch (error) {
		console.error(error);
		// Nothing
	}
}
