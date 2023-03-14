const express = require('express');
const router = express.Router();
const { ExternalSearchController } = require('../controllers/externalAPI/externalSearchController');

const controller = new ExternalSearchController();

/**
 * @swagger
 * tags:
 *    name: Search
 *    description: Routes for interacting with GAMECHANGER search functions
 */

/**
 * @swagger
 *
 * /api/gamechanger/external/search/keywordSearch:
 *   get:
 *      tags: [Search]
 *      description: This api returns the results of a key word search
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: cloneName
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *            default: gamechanger
 *        - name: search
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *        - name: offset
 *          in: query
 *          required: false
 *          schema:
 *            type: integer
 *            default: 0
 *        - name: limit
 *          in: query
 *          required: false
 *          schema:
 *            type: integer
 *            default: 20
 *        - name: orgFilter
 *          in: query
 *          required: false
 *          schema:
 *            type: array
 *            default: []
 *            items:
 *              type: string
 *        - name: typeFilter
 *          in: query
 *          required: false
 *          schema:
 *            type: array
 *            default: []
 *            items:
 *              type: string
 *        - name: publicationDateFilterStart
 *          in: query
 *          required: false
 *          schema:
 *            type: string
 *            format: date-time
 *            default: null
 *        - name: publicationDateFilterEnd
 *          in: query
 *          required: false
 *          schema:
 *            type: string
 *            default: null
 *            format: date-time
 *      responses:
 *         401:
 *            $ref: "#/components/responses/UnauthorizedError"
 */
router.get('/search/keywordSearch', async (req, res) => {
	await controller.externalSearch(req, res);
});

/**
 * Gets metadata for all docs according to fields specified when building
 * this endpoint for Enterprise search.
 * We know we've hit end of results when hits.length is less than 10000,
 * though we've also surfaced total hits just in case.
 * @param {string} cloneName must line up with API key permissions
 * @param {string | undefined} searchAfterID single value from 'sort' array in
 *   last elem of 'hits' from prev search | undefined for first page of results
 * @returns {esHits}
 *
 * @typedef {Object} esHits
 * @property {Object} total holds total number of results
 * @property {Array<Hit>} hits holds results
 *
 * @typedef {Object} Hit
 * @property {Object} fields holds key-value pairs
 * @property {Array<string>} sort holds document ID; pass last ID to search_after
 *   of next call to getGCDocsMetadata to paginate
 */
router.get('/search/getGCDocsMetadata', async (req, res) => {
	await controller.getGCDocsMetadata(req, res);
});

module.exports = router;
