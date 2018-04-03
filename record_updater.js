const DigitalOcean = require("do-wrapper");

module.exports = class RecordUpdater {
  constructor(do_token, domain) {
    this._domain = domain;
    this._api = new DigitalOcean(do_token);
  }

  _filterRecord(records, record_name) {
    for (let i = 0; i < records.length; i++) {
      if (records[i].name === record_name) {
        return records[i];
      }
    }

    return false
  }

  _validateRecord(record_name) {
    return this._api.domainRecordsGetAll(this._domain)
      .then(res => {
        if (res.response.statusCode == 200) {
          let records = res.response.body.domain_records;
          let record = this._filterRecord(records, record_name);

          if (record) {
            return record
          } else {
            return Promise.reject("Record not found.");
          }
        }
      })
      .catch(() => {
        return Promise.reject("Unexpected error on record validation.");
      });
  }

  _updateRecord(record, data) {
    return this._api.domainRecordsUpdate(this._domain, record.id, data)
      .then(res => {
        if (res.response.statusCode == 200) {
          return record;
        }

        return Promise.reject("Can't update record");
      })
      .catch(err => {
        return Promise.reject(err.message);
      });
  }

  update(record_name, addr) {
    return this._validateRecord(record_name)
      .then(record => {
        let data = { data: addr };
        return this._updateRecord(record, data);
      });
  }
}
