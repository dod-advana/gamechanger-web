const express = require('express');
const router = express.Router();
const { ExternalGraphController } = require('../controllers/externalAPI/externalGraphController');

const controller = new ExternalGraphController();

/**
 * @swagger
 * tags:
 *    name: Graph
 *    description: Routes for interacting with GAMECHANGER Knowledge Graph
 */

/**
 * @swagger
 *
 * /api/gamechanger/external/graph/queryGraph:
 *   get:
 *      tags: [Graph]
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
router.get('/graph/queryGraph', async (req, res) => { await controller.queryGraph(req, res); });

module.exports = router;
