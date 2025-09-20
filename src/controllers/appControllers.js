const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/appModels');

const registerVendor = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            let formData = req.body;
            if (req.file != null) {
                formData.image = req.file.filename;
            }
            // Password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                return res.status(400).json({
                    code: '400 Bad Request',
                    error: 'Password must be at least 8 characters with 1 uppercase 1 lowercase and 1 symbol.'
                });
            }
            const saltRounds = parseInt(process.env.SALTROUND) || 10;
            await bcrypt.hash(formData.password, saltRounds, function (err, hash) {
                if (err) throw err;
                formData.password = hash;
                const vendorRegister = new Vendor(formData);
                vendorRegister.save().then((data) => {
                    res.status(200).send(data);
                }).catch((error) => {
                    return res.status(400).json({ code: '400 Bad Request', error: error.message });
                    // res.status(400).send({ Code: '400 Bad Request', error: error.message });
                    // res.send(error.message)
                })
            });
        } catch (err) {
            // res.send(err);
            return res.status(400).json({ code: '400 Bad Request', error: err });
        }
    } else {
        return res.status(400).json({ code: '400 Bad Request', error: errors.array() });
    }
};

// Login
const loginVendor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ code: '400 Bad Request', error: errors.array() });

    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) return res.status(401).json({ code: '401 Unauthorized', error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) return res.status(401).json({ code: '401 Unauthorized', error: 'Invalid credentials' });
        const payload = {
            id: email
        };
        const token = jwt.sign(payload, process.env.JWT_TOKEN, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        //res.status(500).send(err.message);
        return res.status(500).json({
            code: '500 Internal Server Error',
            error: err.message
        });
    }
};

// Get vendors
const getVendors = async (req, res) => {
    try {
        const id = req.params.id;
        const query = id ? { email: id } : {};
        const customers = await Vendor.find(query).select('-password');
        res.json(customers);
    } catch (err) {
        // res.status(500).send(err.message);
        return res.status(500).json({
            code: '500 Internal Server Error',
            error: err.message
        });
    }
};

// Add vendors (protected)
const addVendor = registerVendor;

// Update vendors
const updateVendor = async (req, res) => {
    try {
        const saltRounds = parseInt(process.env.SALTROUND) || 10;
        let updates = {};
        // Only include fields that were passed in the request
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        });
        if (!updates.email) {
            return res.status(400).json({
                code: '400 Bad Request',
                error: 'Email is required for updating vendor'
            });
        }
        if (req.file) updates.image = req.file.filename;
        if (updates.password) updates.password = await bcrypt.hash(updates.password, saltRounds);
        const vendor = await Vendor.findOneAndUpdate(
            { email: updates.email },
            { $set: updates },
            { new: true }
        ).select('-password');
        if (!vendor) {
            return res.status(404).json({
                code: '404 Not Found',
                error: 'Vendor not found with provided email'
            });
        }
        res.status(200).json(vendor);
    } catch (err) {
        // res.status(500).send(err.message);
        return res.status(500).json({
            code: '500 Internal Server Error',
            error: err.message
        });
    }
};

// Delete vendors
const deleteVendor = async (req, res) => {
    try {
        const id = req.params.id || '';
        if (!id || id == ":id") {
            return res.status(400).json({
                code: '400 Bad Request',
                error: 'Email is required to delete vendor.'
            });
        }
        const vendor = await Vendor.findOneAndDelete({ email: id }).select('-password');
        if (!vendor) {
            return res.status(404).json({
                code: '404 Not Found',
                error: 'Vendor not found with provided email.'
            });
        }
        res.status(200).json(vendor);
    } catch (err) {
        // res.status(500).send(err.message);
        return res.status(500).json({
            code: '500 Internal Server Error',
            error: err.message
        });
    }
};

// verify vendors
const verifyVender = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ code: '400 Bad Request', error: 'Request body is missing' });
        const { email } = req.body;
        if (!email) return res.status(400).json({ code: '400 Bad Request', error: 'Email is required for updating vendor' });
        const existingVendor = await Vendor.findOne({ email });
        if (!existingVendor) return res.status(404).json({ code: '404 Not Found', error: 'Vendor not found with provided email' });

        if (existingVendor.isVerified) {
            return res.status(400).json({ code: '400 Bad Request', error: 'Vendor is already verified' });
        }
        const vendor = await Vendor.findOneAndUpdate({ email }, { $set: { isVerified: true } }, { new: true }).select('-password');
        res.status(200).json(vendor);
    } catch (err) {
        return res.status(500).json({ code: '500 Internal Server Error', error: err.message });
    }
};


module.exports = { registerVendor, loginVendor, getVendors, addVendor, updateVendor, deleteVendor, verifyVender };
