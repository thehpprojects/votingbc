/**
 * Success Response
 * @param {object} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} data
 */

export const successResponse = (
    res,
    statusCode = 200,
    message = "Success",
    data = {}
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error Response
 * @param {object} res
 * @param {number} statusCode
 * @param {string} message
 */

export const errorResponse = (
    res,
    statusCode = 500,
    message = "Something went wrong"
) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};