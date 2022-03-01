import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import GCAuth from '../common/GCAuth';
import React, { useEffect } from 'react';
import Config from '../../config/config';

import MatomoReactRouter from 'piwik-react-router';
import SparkMD5 from 'spark-md5';

const MATOMO_LINK = Config.MATOMO_LINK;

let matomo = null;

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

try {
	matomo = MatomoReactRouter({
		url: MATOMO_LINK,
		siteId: isDecoupled ? 2 : 1,
	});
	// matomo = {
	// 	push: (data) => { console.log(data) },
	// 	trackError: (data) => { console.log(data) },
	// 	setUserId: (data) => { console.log(data) }
	// };
} catch (e) {
	matomo = {
		push: () => {},
		trackError: () => {},
		setUserId: () => {},
	};
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
export const TrackerWrapper = (
	ComposedComponent,
	documentTitle,
	customDimensions
) => {
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
	if (
		customDimensions &&
		Array.isArray(customDimensions) &&
		customDimensions.length &&
		useMatomo
	) {
		customDimensions.map((customDimension) =>
			matomo.push([
				'setCustomDimension',
				customDimension.id,
				customDimension.value,
			])
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
			JSON.parse(localStorage.getItem('userMatomo')) &&
			JSON.parse(localStorage.getItem('appMatomo'));
		if (!useMatomo) return;

		// Set User
		const userId = isDecoupled
			? GCAuth.getTokenPayload().cn
			: Auth.getUserId() || ' ';
		const regex = /\d{10}/g;
		const id = regex.exec(userId);
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
 * @param category TODO
 * @param action TODO
 * @param name TODO
 * @param value TODO
 * @param customDimensions: false or an array of customDimensions.
 */
export function trackEvent(category, action, name, value, customDimensions) {
	try {
		const useMatomo =
			JSON.parse(localStorage.getItem('userMatomo')) &&
			JSON.parse(localStorage.getItem('appMatomo'));
		if (!useMatomo) return;
		// Set custom dimensions
		setupDimensions(customDimensions, useMatomo);
		// Track Event
		matomo.push(['trackEvent', category, action, name, value]);
	} catch (error) {
		// Nothing
		console.error('matomo error',error)
	}
}

/***
 * Logs the error to Matomo.
 * @param e: Error object.
 * @param eventName: Event name.
 */
export function trackError(e, eventName) {
	try {
		const useMatomo =
			JSON.parse(localStorage.getItem('userMatomo')) &&
			JSON.parse(localStorage.getItem('appMatomo'));
		if (!useMatomo) return;

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

		matomo.push(['trackSiteSearch', keyword, category, count]);
	} catch (error) {
		console.error(error);
		// Nothing
	}
}
