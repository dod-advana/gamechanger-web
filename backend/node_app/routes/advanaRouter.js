// Router for /api/ac routes
const express = require('express');
const router = express.Router();

const MatomoController = require('../controllers/matomoController');
const { TutorialOverlayController } = require('../controllers/tutorialOverlaysController');
const { UserController } = require('../controllers/userController');

const matomoController = new MatomoController();
const tutorialOverlay = new TutorialOverlayController();
const userController = new UserController();

// matomo
router.get('/matomo', matomoController.getAppMatomoStatus);
router.post('/matomo', matomoController.setAppMatomoStatus);
router.get('/matomo/user', matomoController.getUserMatomoStatus);
router.post('/matomo/user', matomoController.setUserMatomoStatus);

router.get('/tutorialOverlay', tutorialOverlay.fetchTutorialOverlays);
router.post('/userAppVersion', userController.postUserAppVersion);

module.exports = router;
