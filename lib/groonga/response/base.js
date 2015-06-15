var STATUS_SUCCEEDED =
      BaseResponse.STATUS_SUCCEEDED = 0;

function BaseResponse(response) {
  if (typeof response == 'string')
    this._response = JSON.parse(response);
  else
    this._response = response;
}

BaseResponse.prototype = {
  get header() {
    if (!this._header)
      this._header = this._response[0];
    return this._header;
  },

  get body() {
    if (!this._body)
      this._body = (this._response || []).slice(1);
    return this._body;
  },

  get succeeded() {
    return this.header[0] === STATUS_SUCCEEDED;
  },

  get failed() {
    return !this.succeeded;
  }
};

module.exports = BaseResponse;
