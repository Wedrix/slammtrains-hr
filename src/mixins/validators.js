const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export default {
    data() {
        return {
            matchesPassword: value => (value === this.password) || 'Kindly ensure the passwords match',
            required: value => !!value || 'This field is required',
            isEmail: value => /.+@.+\..+/.test(value) || 'This email is invalid',
            isPhoneNumber: value => this.isValidPhoneNumber(value) || 'This phone number is invalid for this region'
        };
    },
    methods: {
        isValidPhoneNumber(phoneNumber) {
            try {
                const number = phoneUtil.parseAndKeepRawInput(phoneNumber, this.phoneNumber.countryCode);
        
                return phoneUtil.isValidNumberForRegion(number, this.phoneNumber.countryCode);
            } catch (error) {
                return false;
            }
        },
        formatAsE164PhoneNumber(phoneNumber) {
            if (this.isValidPhoneNumber(phoneNumber)) {
                const number = phoneUtil.parseAndKeepRawInput(phoneNumber, this.phoneNumber.countryCode);
                const contactPhone = phoneUtil.format(number, PNF.E164);

                return contactPhone;
            }

            return phoneNumber;
        },
    }
};