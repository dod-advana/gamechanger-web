const express = require('express');
const router = express.Router();

const { ModularGameChangerController } = require('../controllers/modularGameChangerController');
const controller = new ModularGameChangerController();

router.post('/getCloneMeta', controller.getCloneMeta);
router.get('/admin/getCloneTableStructure', controller.getCloneTableStructure);
router.post('/admin/storeCloneMeta', controller.storeCloneMeta);
router.post('/admin/deleteCloneMeta', controller.deleteCloneMeta);
router.get('/admin/reloadHandlerMap', controller.reloadHandlerMap);
router.get('/getAllCloneMeta', controller.getAllCloneMeta);
router.post('/search', controller.search);
router.post('/callSearchFunction', controller.callSearchFunction);
router.post('/export', (req, res) => {
	req.setTimeout(720000);
	controller.export(req, res);
});
router.post('/graphSearch', controller.graphSearch);
//router.post('/graphQuery', controller.graphQuery);
router.post('/callGraphFunction', controller.callGraphFunction);
router.post('/querySuggester', controller.querySuggester);
router.post('/docFetcher', controller.docFetcher);

module.exports = router;
