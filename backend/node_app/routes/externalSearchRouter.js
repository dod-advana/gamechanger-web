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
router.get('/search/keywordSearch', async (req, res) => { await controller.externalSearch(req, res); });

module.exports = router;
