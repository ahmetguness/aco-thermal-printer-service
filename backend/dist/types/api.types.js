"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiSuccess = createApiSuccess;
exports.createApiFailure = createApiFailure;
function createApiSuccess(data) {
    return {
        success: true,
        data,
    };
}
function createApiFailure(error) {
    return {
        success: false,
        error,
    };
}
