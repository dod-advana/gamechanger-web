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
 *      description: This api takes returns the results of a key word search
 *      produces:
 *        - application/json
 *      parameters:
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
 *      responses:
 *         401:
 *            $ref: "#/components/responses/UnauthorizedError"
 */
router.get('/search/keywordSearch', async (req, res) => { await controller.externalSearch('Keyword', req, res); });

/**
 * @swagger
 *
 * /api/gamechanger/external/search/keywordSearchFiltered:
 *   get:
 *      tags: [Search]
 *      description: This api takes returns the results of a key word search filtered by organization.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: search
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *        - name: orgFilter
 *          in: query
 *          required: false
 *          schema:
 *            type: string
 *            default: Classification Guides_Dept. of Defense_Dept. of the Air Force_Executive Branch_Intelligence Community_Joint Chiefs of Staff_OPM_US Army_US Marine Corps_US Navy_US Navy Medicine_US Navy Reserve_United States Code
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
 *      responses:
 *         401:
 *            $ref: "#/components/responses/UnauthorizedError"
 */
router.get('/search/keywordSearchFiltered', async (req, res) => { await controller.externalSearch('Keyword', req, res); });

/**
 * @swagger
 *
 * /api/gamechanger/external/search/intelligentSearch:
 *   get:
 *      tags: [Search]
 *      description: This is a word search using the beta inteligent search.
 *      produces:
 *        - application/json
 *      parameters:
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
 *      responses:
 *         401:
 *            $ref: "#/components/responses/UnauthorizedError"
 */
router.get('/search/ntelligentSearch', async (req, res) => { await controller.externalSearch('Intelligent', req, res); });

/**
 * @swagger
 *
 * /api/gamechanger/external/search/intelligentSearchFiltered:
 *   get:
 *      tags: [Search]
 *      description: This is a filtered word search using the beta inteligent search.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: search
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *        - name: orgFilter
 *          in: query
 *          required: false
 *          schema:
 *            type: string
 *            default: Classification Guides_Dept. of Defense_Dept. of the Air Force_Executive Branch_Intelligence Community_Joint Chiefs of Staff_OPM_US Army_US Marine Corps_US Navy_US Navy Medicine_US Navy Reserve_United States Code
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
 *      responses:
 *         401:
 *            $ref: "#/components/responses/UnauthorizedError"
 */
router.get('/search/intelligentSearchFiltered', async (req, res) => { await controller.externalSearch('Intelligent', req, res); });

module.exports = router;
