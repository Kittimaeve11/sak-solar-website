

export const validateFieldmoreInfo = (formData, messages) => {
    const errors = {};
    const nameRegex = /^[\u0E01-\u0E4E\u0E50-\u0E59a-zA-Z\s]+$/;
    const repeatRegex = /(.)\1{4,}/;
    const wordRegex = /[ก-๙]{3,}|[a-zA-Z]{3,}/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pattern = /^[ก-๙a-zA-Z0-9\s.,!?()'"-]+$/;

    Object.keys(formData).forEach((field) => {
        switch (field) {
            case 'topic':
                if (!formData.topic) {
                    errors.topic = messages.Infovalidate.topic;
                }
                break;

            case 'name':
                if (!formData.name) {
                    errors.name = messages.Infovalidate.fullname.fullnamenull;
                } else if (
                    !nameRegex.test(formData.name) ||
                    repeatRegex.test(formData.name) ||
                    !wordRegex.test(formData.name)
                ) {
                    errors.name = messages.Infovalidate.fullname.name;
                }
                break;

            case 'phone':
                if (!formData.phone) {
                    errors.phone = messages.Infovalidate.phone.phonenull;
                } else if (formData.phone.length !== 10) {
                    errors.phone = messages.Infovalidate.phone.phonenumber;
                }
                break;

            case 'email':
                if (!formData.email) {
                    errors.email = '';
                } else if (!emailRegex.test(formData.email)) {
                    errors.email = messages.Infovalidate.email;
                }
                break;

            case 'message':
                const clean = formData.message ? formData.message.trim() : '';
                const repeatMsg = repeatRegex.test(clean);
                const long = clean.length > 1000;
                const hasWords = clean.split(/\s+/).length >= 1;

                if (!clean) {
                    errors.message = messages.Infovalidate.message.clean;
                } else if (!pattern.test(clean) || repeatMsg || long || !hasWords) {
                    errors.message = messages.Infovalidate.message.patternmessage;
                }
                break;

            default:
                break;
        }
    });

    return errors;
};
