class ApiResponse {
  static success(data = {}, message = "Success") {
    return { success: true, message, data };
  }

  static error(message = "Something went wrong") {
    return { success: false, message };
  }
}

module.exports = ApiResponse;
