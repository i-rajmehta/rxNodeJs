const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/images/' });
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { registerVendor, loginVendor, getVendors, addVendor, updateVendor, deleteVendor, verifyVender } = require('../controllers/appControllers');
const authenticateToken = require('../middleware/auth');

// Auth
router.post('/auth/vendor/register', upload.single('image'), [
    body('company_name').notEmpty().matches(/^[a-zA-Z0-9\s]+$/).trim().escape().withMessage("Company name should be alphanumeric with spaces only"),
    body('contact_name').notEmpty().matches(/^[a-zA-Z0-9\s]+$/).trim().escape().withMessage("Contact name should be alphanumeric with spaces only"),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Min length 8').trim(),
    body('phone').isLength({ min: 10, max: 10 }).trim().escape().withMessage("Phone number must be at least 10 digits."),
    body('business_type').notEmpty().trim().escape().isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service']).withMessage("Business type should be from 'Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service'"),
    body('tax_id').isLength({ min: 15, max: 15 }).trim().escape().withMessage('Tax ID must be of 15 digits.'),
    body('address').isLength({ max: 255 }).trim().escape().withMessage('Address should not be more than 255 chars.'),    // body('isVerified').notEmpty(),
], registerVendor); // Registers a new vendor.

router.post('/auth/vendor/login', [body('email').notEmpty().isEmail(), body('password').notEmpty()], loginVendor); // Vendor login with email/password. Returns JWT.

router.get('/vendors', authenticateToken, getVendors); // Pagination + search by companyName/email
router.get('/vendors/:id', authenticateToken, getVendors); // get vendor by id

router.post('/vendors/', authenticateToken, upload.single('image'), [
    body('company_name').notEmpty().matches(/^[a-zA-Z0-9\s]+$/).trim().escape().withMessage("Company name should be alphanumeric with spaces only"),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Min length 8').trim(),
    body('phone').isLength({ min: 10, max: 10 }).trim().escape().withMessage("Phone number must be at least 10 digits."),
    body('business_type').notEmpty().trim().escape().isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service']).withMessage("Business type should be from 'Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service'"),
    body('tax_id').isLength({ min: 15, max: 15 }).trim().escape().withMessage('Tax ID must be of 15 digits.'),
    body('address').isLength({ max: 255 }).trim().escape().withMessage('Address should not be more than 255 chars.'),
    // body('isVerified').notEmpty()
], addVendor); // Creates vendor record.

router.put('/vendor/:id', authenticateToken, upload.single('image'), [
    body('company_name').notEmpty().matches(/^[a-zA-Z0-9\s]+$/).trim().escape().withMessage("Company name should be alphanumeric with spaces only"),
    body('contact_name').notEmpty().matches(/^[a-zA-Z0-9\s]+$/).trim().escape().withMessage("Contact name should be alphanumeric with spaces only"),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Min length 8').trim(),
    body('phone').isLength({ min: 10, max: 10 }).trim().escape().withMessage("Phone number must be at least 10 digits."),
    body('business_type').notEmpty().trim().escape().isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service']).withMessage("Business type should be from 'Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service'"),
    body('tax_id').isLength({ min: 15, max: 15 }).trim().escape().withMessage('Tax ID must be of 15 digits.'),
    body('address').isLength({ max: 255 }).trim().escape().withMessage('Address should not be more than 255 chars.'),
    // body('isVerified').notEmpty()
], updateVendor);  // update vendor

router.delete('/vendor/:id', authenticateToken, deleteVendor); // verify vendor

router.patch('/vendor/:id/verify', [
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('isVerified').isBoolean().default(true),
], verifyVender); // Update vendor verification status

// router.get('/vendor/:id(*)?', getVendors);
//router.post('/vendor', upload.single('image'), [body('email').isEmail()], addVendor); // add Vender by admin only
// router.put('/vendor/:id', upload.single('image'), updateVendor); // update vendor

module.exports = router;
