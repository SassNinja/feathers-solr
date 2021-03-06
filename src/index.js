import { _, queryJson, querySuggest, responseFind, responseGet, queryDelete, describeSchemaFields, parseSchemaFields,  deleteSchemaFields, addFields} from './utils';
import errors from 'feathers-errors';
import Solr from './client/solr';
import makeDebug from 'debug';

const debug = makeDebug('feathers-solr');

class Service {

	constructor(opt = {}) {

		this.options = Object.assign({},{
			host: 'http://localhost:8983/solr',
			core: '/gettingstarted',
            schema: false,
			migrate: 'safe',
            adminKey: false,
            idfield: 'id',
			managedScheme: true,
			/*commitStrategy softCommit: true, commit: true, commitWithin: 50*/
			commitStrategy: {
				softCommit: true,
				commitWithin: 50000,
				overwrite: true
			}
		},opt);

		this.Solr = new Solr({
			host: this.options.host,
			core: this.options.core,
			managedScheme: this.options.managedScheme,
			commitStrategy: this.options.commitStrategy
		});

        debug('Initializing feathers-solr Service');

        let _self = this;

        _self.describe()
            .then(res => {
                _self.options._schema = parseSchemaFields(res.fields);
                _self.define()
                    .then(res => {
                        debug('feather-solr Service started',_self.options.commitStrategy || {
                            softCommit: true,
                            commitWithin: 50000,
                            overwrite: true
                        }, res);

                    })
                    .catch(err => {
                        debug('Service.define ERROR',err);
                    });
            })
            .catch(err => {
                debug('Service.describe ERROR',err);
            });

	}

    /**
     * [status description]
     * @return {[type]} [description]
     */
	status() {
		let coreAdmin = this.Solr.coreAdmin();
		coreAdmin.status()
			.then(function(res) {
				console.log('core status',res);
			})
			.catch(function(err){
				console.error(err);
				// return reject(new errors.BadRequest());
			});
	}

    /**
     * [define description]
     * @param  {[type]} fields [description]
     * @return {[type]}        [description]
     */
	define(fields) {
		let schemaApi = this.Solr.schema();
        let _self = this;

        return new Promise((resolve, reject) => {

            if (_.isObject(fields)) {
    		  _self.options.schema = fields;
            }

            if (_self.options.migrate === 'safe' || _self.options.managedScheme === false || _.isObject(_self.options.schema) === false) {
                return true;
            }
            debug('feathers-solr migrate start');

            if (_self.options.migrate === 'drop') {

                this.remove()
                    .then(res => {
                        debug('feathers-solr migrate drop data');

                        schemaApi.deleteField(deleteSchemaFields(_self.options.schema)) ///
                            .then(res => {
                                debug('feathers-solr migrate reset schema',res);
                                schemaApi.addField(describeSchemaFields(_self.options.schema))
                                    .then(function(res) {
                                        debug('feathers-solr migrate define schema',res.errors);
                                        resolve(res);
                                    })
                                    .catch(function(err){
                                        debug('Service.define addField ERROR:',err);
                                        return reject(new errors.BadRequest(err));
                                    });
                            })
                            .catch(err => {
                                debug('Service.define removeField ERROR:',err);
                                return reject(new errors.BadRequest(err));
                            });
                    })
                    .catch(err => {
                        debug('Service.define remove ERROR:',err);
                        return reject(new errors.BadRequest(err));
                    });

            } else {
                /* define fields */
                schemaApi.addField(describeSchemaFields(_self.options.schema))
                    .then(function(res) {
                         debug('feathers-solr migrate define schema');
                        resolve(res);
                    })
                    .catch(function(err){
                        debug('Service.define addField ERROR:',err);
                        return reject(new errors.BadRequest(err));
                    });
            }

        });
	}

    /**
     * [describe description]
     * @return {[type]} [description]
     */
	describe() {
        let _self = this;
		let schemaApi = _self.Solr.schema();
        return new Promise((resolve, reject) => {
            schemaApi.fields()
                .then(function(res) {
                    debug('feathers-solr describe');
                    resolve(res);
                })
                .catch(function(err){
                    debug('Service.find ERROR:',err);
                    return reject(new errors.BadRequest(err));
                });
        });
	}

    /**
     * [find description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
	find(params) {
        if(!_.has(params.query,'$suggest')) {
            return this.search(params);
        } else{
            return this.suggest(params);
        }
	}

    /**
     * [find description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    search(params) {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.Solr.json(queryJson(params, _self.options))
                .then(function(res) {
                    debug('Service.find',params,res);
                    resolve(responseFind(params, _self.options, res));
                })
                .catch(function(err) {
                    debug('Service.find ERROR:',err);
                    return reject(new errors.BadRequest(err));
                });
        });
    }

    /**
     * Suggest
     * @param  {object} params Query Object
     * @return {object}        Promise
     */
    suggest(params) {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.Solr.suggest(querySuggest(params, _self.options))
                .then(function(res) {
                    debug('Service.find',params,res);
                    resolve(res);
                })
                .catch(function(err) {
                    debug('Service.find ERROR:',err);
                    return reject(new errors.BadRequest(err));
                });
        });
    }

    /**
     * [get description]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
	get(id, params) {
		let _self = this;

        if (typeof params === 'undefined') {
            params = {query:{}};
        }

        params = Object.assign({}, params, {$limit:1,$skip:0});
        params.query[_self.options.idfield] = id;

		return new Promise((resolve, reject) => {

			this.Solr.json(queryJson(params, _self.options))
				.then(function(res) {
					let docs = responseGet(res);
					if (typeof docs !== 'undefined') {
						return resolve(docs);
					} else {
						return reject(new errors.NotFound(`No record found for id '${id}'`));
					}
				})
				.catch(function(err) {
					console.log('err', err);
					return reject(new errors.NotFound(`No record found for id '${id}'`));
				});
		});
	}

    /**
     * [create description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
	create(data) {
		let _self = this;
		return new Promise((resolve, reject) => {
			this.Solr.update(data)
				.then(function(res) {
					if (res.responseHeader.status === 0) {
						resolve(data);
					} else {
                        console.log('res', res);
						return reject(new errors.BadRequest(res));
					}
				})
				.catch(function(err) {
                    console.log('err', err);
					return reject(new errors.BadRequest(err));
				});
		});
	}

	/**
	 * adapter.update(id, data, params) -> Promise
	 * @param  {[type]} id     [description]
	 * @param  {[type]} data   [description]
	 * @param  {[type]} params [description]
	 * @return {[type]}        [description]
	 */
	update(id, data) {

		if (id === null || Array.isArray(data)) {
			return Promise.reject(new errors.BadRequest(
				`You can not replace multiple instances. Did you mean 'patch'?`
			));
		}

		let _self = this;
        data[_self.options.idfield] = id;

		return new Promise((resolve, reject) => {
			_self.create(data)
				.then(function(res) {
					resolve(data);
				})
				.catch(function(err) {
                    debug('Service.update ERROR:',err);
                    return reject(new errors.BadRequest(err));
				});
		});
	}

	/**
	 * adapter.patch(id, data, params) -> Promise
     * Using update / overide the doc instead of atomic
     * field update http://yonik.com/solr/atomic-updates/
	 * @param  {[type]} id     [description]
	 * @param  {[type]} data   [description]
	 * @param  {[type]} params [description]
	 * @return {[type]}        [description]
	 */
	patch(id, data, params) {

        let _self = this;
        let query = {$limit: 1 };

        if (_.has(params,'query')) {
            query =  params.query;
        }

        if (id !== null) {
            query[_self.options.idfield] = id;
        } else {
            query.$limit = 100000; // TODO: ?
        }

        return new Promise((resolve, reject) => {

            _self.Solr
                .json(queryJson({ query: query }, _self.options))
                .then(function(response) {

                    response = responseFind(params, _self.options, response);

                    if (response.data.length > 0) {

                        response.data.forEach((doc, index, ref) => {
                            Object.keys(data).forEach(key => {
                                if (Array.isArray(response.data[index][key])) {
                                    response.data[index][key].push(data[key]);
                                } else {
                                    response.data[index][key] = data[key];
                                }
                            });
                            delete response.data[index]._version_;
                        });


                        _self.create(response.data)
                            .then(function(res) {
                               resolve(res);
                            })
                            .catch(function(err) {
                                debug('Service.patch crate ERROR:',err);
                                return reject(new errors.BadRequest(err));
                            });

                    } else {
                        resolve();
                    }
				})
				.catch(function(err) {
					debug('Service.patch find ERROR:',err);
                    return reject(new errors.BadRequest(err));
				});
		});
	}

    /**
     * Remove Data
     * - .remove('*')              =    {"delete": {"query": "*:*"},"commit": {}}
     * - .remove('*:*')            =    {"delete": {"query": "*:*"},"commit": {}}
     * - .remove('987987FGHJSD')                 =    {"delete": "262","commit": {}}
     * - .remove(['987987FGHJSD','987987FGHJSD'])  =    {"delete": ["262"],"commit": {}}
     * - .remove(null,{'*':'*'}) =    {"delete": {"query": "*:*"},"commit": {}}
     * - .remove(null,{id:257})    =    {"delete": {"query": "id:257"},"commit": {}}
     * - .remove(null,{id:*})      =    {"delete": {"query": "id:*"},"commit": {}}
     * - .remove(null,{other:*})   =    {"delete": {"query": "other:257"},"commit": {}}
     * @param  {[type]} id     [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
	remove(id, params) {
		let _self = this;

        return new Promise((resolve, reject) => {

    			this.Solr.delete(queryDelete(id, params || null))
    				.then(function(res) {
    					resolve(res);
    				})
    				.catch(function(err) {
    					debug('Service.remove ERROR:',err);
                        return reject(new errors.BadRequest(err));
    				});
        });
    	}

    /**
     * Get Solr Client and use additional functions
     * @return {[type]} [description]
     */
	client() {
		return this.Solr;
	}
}

export default function init(options) {
	return new Service(options);
}

init.Service = Service;
