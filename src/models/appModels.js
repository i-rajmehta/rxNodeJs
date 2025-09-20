const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    company_name: {
        type: String, required: true, validate: {
            validator: function (val) {
                return /^[a-z0-9\s]+$/i.test(val);
            },
            message: props => `${props.value} is not alphanumeric`,
        }
    },
    contact_name: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return /^[a-zA-Z0-9\s]+$/.test(val);
            },
            message: props => `${props.value} should only contain alphanumeric characters and spaces`
        }
    },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return /^\d{10,}$/.test(val);
            },
            message: props => 'Phone number must be at least 10 digits.'
        }
    },
    business_type: { type: String, enum: ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Service'], required: true },
    tax_id: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return /^\d{15}$/.test(val);
            },
            message: props => `Tax ID ${props.value} must be exactly 15 digits`
        },
        unique: true
    },
    address: { type: String, maxlength: 255, maxLength: [255, 'Address should not be more than 255 chars.'] },
    image: { type: String, get: getImageName },
    isVerified: { type: Boolean, default: false }
});


function getImageName(image) {
    return process.env.PRODUCT_URL + image;
}
const vendorModel = mongoose.model('Vendor', vendorSchema);
module.exports = vendorModel;
