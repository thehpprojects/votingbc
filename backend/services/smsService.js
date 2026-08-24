const sendOTPPhone = async (phone, otp) => {

    try {

        console.log(`OTP ${otp} sent to phone ${phone}`);

        // Here you will add Twilio/MSG91 API code

        return true;

    } catch(error){

        console.log(error);
        throw error;

    }

};


module.exports = sendOTPPhone;