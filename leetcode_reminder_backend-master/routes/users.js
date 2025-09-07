const express = require('express');

const router= express.Router();

const {handlegetuserbyemail,handeluserdelete,handelusersetup,handeuserpotdstatus}= require('../controllers/users');


router.get('/:email', handlegetuserbyemail);

router.post('/delete',handeluserdelete);


router.post('/setup',handelusersetup);

router.post('/potd',handeuserpotdstatus);
module.exports = router;