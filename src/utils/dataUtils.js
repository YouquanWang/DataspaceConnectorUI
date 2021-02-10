    import Axios from "axios";
    import moment from 'moment';

    const POLICY_N_TIMES_USAGE = "N Times Usage";
    const POLICY_DURATION_USAGE = "Duration Usage";
    const POLICY_USAGE_DURING_INTERVAL = "Usage During Interval";

    const POLICY_TYPE_TO_NAME = {
        "ids:NotMoreThanNOffer": POLICY_N_TIMES_USAGE,
        "ids:DurationOffer": POLICY_DURATION_USAGE,
        "ids:IntervalUsageOffer": POLICY_USAGE_DURING_INTERVAL
    };

    const OPERATOR_TYPE_TO_SYMBOL = {
        "idsc:EQ": "=",
        "idsc:LTEQ": "<=",
        "idsc:LT": "<",
    };



    var languages = null;
    var sourcTypes = null;
    var apps = null;
    var backendConnections = null;

    export default {
        POLICY_N_TIMES_USAGE,
        POLICY_DURATION_USAGE,
        POLICY_USAGE_DURING_INTERVAL,

        getValue(data, name) {
            let value = "-";
            if (data[name] !== undefined && data[name] != null) {
                if (Array.isArray(data[name])) {
                    value = data[name][0]["@value"];
                } else {
                    value = data[name]["@id"];
                }
            }
            return value;
        },

        convertTypeToPolicyName(type) {
            return POLICY_TYPE_TO_NAME[type];
        },

        convertOperatorTypeToSymbol(type) {
            return OPERATOR_TYPE_TO_SYMBOL[type];
        },

        convertOperatorSymbolToType(symbol) {
            let type = "";
            for (let [key, value] of Object.entries(OPERATOR_TYPE_TO_SYMBOL)) {
                if (value == symbol) {
                    type = key;
                    break;
                }
            }
            return type;
        },

        getLanguages(callback) {
            if (languages == null) {
                Axios.get("http://localhost:80/enum?enumName=Language").then(response => {
                    languages = response.data;
                    callback(languages);
                }).catch(error => {
                    console.log("Error in loadData(): ", error);
                    callback([]);
                });
            } else {
                callback(languages);
            }
        },

        getSourceTypes(callback) {
            if (sourcTypes == null) {
                Axios.get("http://localhost:80/enum?enumName=SourceType").then(response => {
                    sourcTypes = response.data;
                    callback(sourcTypes);
                }).catch(error => {
                    console.log("Error in loadData(): ", error);
                    callback([]);
                });
            } else {
                callback(sourcTypes);
            }
        },

        getBrokers(callback) {
            let brokers = [];
            Axios.get("http://localhost:80/brokers").then(response => {
                brokers = response.data;
                callback(brokers);
            }).catch(error => {
                console.log("Error in getBrokers(): ", error);
            });
        },

        getBackendConnections(callback) {
            backendConnections = [];
            Axios.get("http://localhost:80/backend/connections").then(response => {
                var genericEndpoints = response.data;

                for (var genericEndpoint of genericEndpoints) {
                    backendConnections.push({
                        id: genericEndpoint["@id"],
                        endpoint: genericEndpoint,
                        url: genericEndpoint["ids:accessURL"]["@id"]
                    });
                }
                callback(backendConnections);
            }).catch(error => {
                console.log("Error in getBackendConnections(): ", error);
                callback([]);
            });
        },

        createBackendConnection(url, username, password, callback) {
            Axios.post("http://localhost:80/backend/connection?accessUrl=" + url + "&username=" + username + "&password=" + password).then(() => {
                callback();
            }).catch(error => {
                console.log("Error in saveBackendConnection(): ", error);
                callback();
            });
        },

        updateBackendConnection(id, url, username, password, callback) {
            Axios.put("http://localhost:80/backend/connection?id=" + id + "&accessUrl=" + url + "&username=" + username + "&password=" + password).then(() => {
                callback();
            }).catch(error => {
                console.log("Error in saveBackendConnection(): ", error);
                callback();
            });
        },

        deleteResource(id, callback) {
            Axios.delete("http://localhost:80/resource?resourceId=" + id).then(() => {
                callback();
            }).catch(error => {
                console.log(error);
                callback();
            });
        },

        getRoute(id, callback) {
            Axios.get("http://localhost:80/approute?routeId=" + id).then(response => {
                callback(response.data)
            }).catch(error => {
                console.log("Error in getRoute(): ", error);
                callback();
            });
        },

        deleteRoute(id, callback) {
            Axios.delete("http://localhost:80/approute?routeId=" + id).then(() => {
                callback();
            }).catch(error => {
                console.log(error);
                callback();
            });
        },

        deleteBackendConnection(id, callback) {
            Axios.delete("http://localhost:80/backend/connection?id=" + id).then(() => {
                callback();
            }).catch(error => {
                console.log("Error in saveBackendConnection(): ", error);
                callback();
            });
        },

        getApps(callback) {
            apps = [];
            Axios.get("http://localhost:80/apps").then(response => {
                let appsResponse = response.data;
                for (var app of appsResponse) {
                    apps.push(app[1]);
                }
                callback(apps);
            }).catch(error => {
                console.log("Error in getApps(): ", error);
                callback([]);
            });
        },

        getEndpointList(node, endpointType) {
            var endpointList = [];
            if (node.type == "backendnode") {
                let endpoint = this.getBackendConnection(node.objectId).endpoint;
                endpointList.push(endpoint);
            } else if (node.type == "appnode") {
                let appEndpoints = this.getApp(node.objectId).appEndpointList[1];
                for (let appEndpoint of appEndpoints) {
                    if (appEndpoint[1].endpoint["ids:appEndpointType"]["@id"] == endpointType) {
                        endpointList.push(appEndpoint[1].endpoint);
                    }
                }
            }
            return endpointList;
        },

        getBackendConnection(id) {
            var result = null;
            for (var backendConnection of backendConnections) {
                console.log(id, " <> ", backendConnection.id);
                if (id == backendConnection.id) {
                    result = backendConnection;
                    break;
                }
            }
            return result;
        },

        getApp(id) {
            var result = null;
            for (var app of apps) {
                if (id == app.id) {
                    result = app;
                    break;
                }
            }
            return result;
        },

        getAppIdOfEndpointId(endpointId) {
            var result = null;
            for (var app of apps) {
                for (let appEndpoint of app.appEndpointList[1]) {
                    if (endpointId == appEndpoint[1].endpoint["@id"]) {
                        result = app.id;
                        break;
                    }
                }
            }
            return result;
        },

        getNode(id, nodes) {
            let node = null;
            for (let n of nodes) {
                if (n.id == id) {
                    node = n;
                    break;
                }
            }
            return node;
        },

        getNodeIdByObjectId(endpointId, nodes) {
            let nodeId = null;
            for (let n of nodes) {
                if (n.objectId == endpointId) {
                    nodeId = n.id;
                    break;
                }
            }
            return nodeId;
        },

        getCurrentDate() {
            return moment().format("YYYY-MM-DD");
        },

        createConnectorEndpoint(accessUrl, callback) {
            let params = "?accessUrl=" + accessUrl;
            Axios.post("http://localhost:80/connector/endpoint" + params).then((response) => {
                callback(response.data.connectorEndpointId);
            }).catch(error => {
                console.log("Error in createConnectorEndpoint(): ", error);
                callback();
            });
        },

        createResource(title, description, language, keyword, version, standardlicense, publisher, contractJson,
            sourceType, brokerIds, genericEndpointId, callback) {
            let params = "?title=" + title + "&description=" + description + "&language=" +
                language + "&keyword=" + keyword + "&version=" + version + "&standardlicense=" + standardlicense +
                "&publisher=" + publisher;
            Axios.post("http://localhost:80/resource" + params).then((response) => {
                let resourceId = response.data.resourceID;
                params = "?resourceId=" + resourceId;

                // TODO !!! REMOVE THIS !!! workaround for new policy pattern
                contractJson = {
                    "@context": {
                        "ids": "https://w3id.org/idsa/core/",
                        "idsc": "https://w3id.org/idsa/code/"
                    },
                    "@type": "ids:ContractOffer",
                    "@id": "https://w3id.org/idsa/autogen/contractOffer/90e2bb48-c2eb-4723-ac8e-f404258173e7",
                    "ids:permission": [{
                        "@type": "ids:Permission",
                        "@id": "https://w3id.org/idsa/autogen/permission/f0760bec-e888-4c03-88c7-0b509e147a52",
                        "ids:description": [{
                            "@value": "Example Description",
                            "@type": "http://www.w3.org/2001/XMLSchema#string"
                        }],
                        "ids:title": [{
                            "@value": "Example Usage Policy",
                            "@type": "http://www.w3.org/2001/XMLSchema#string"
                        }],
                        "ids:constraint": [{
                            "@type": "ids:Constraint",
                            "@id": "https://w3id.org/idsa/autogen/constraint/59000467-dc39-4e8c-a69e-2939a171df23",
                            "ids:operator": {
                                "@id": "idsc:LTEQ"
                            },
                            "ids:pipEndpoint": {
                                "@id": "https://localhost:8080/admin/api/resources/"
                            },
                            "ids:leftOperand": {
                                "@id": "idsc:COUNT"
                            },
                            "ids:rightOperand": {
                                "@value": "5"
                            }
                        }],
                        "ids:action": [{
                            "@id": "idsc:READ"
                        }]
                    }]
                };

                Axios.put("http://localhost:80/contract" + params, contractJson).then(() => {
                    params = "?resourceId=" + resourceId + "&endpointId=" + genericEndpointId + "&language=" + language + "&sourceType=" + sourceType;
                    Axios.post("http://localhost:80/representation" + params).then(() => {
                        this.createConnectorEndpoint("http://data_" + Date.now(), endpointId => {
                            this.createNewRoute(this.getCurrentDate() + " - " + title, routeId => {
                                this.createSubRoute(routeId, genericEndpointId, 0, 0,
                                    endpointId, 0, 0, resourceId, () => {
                                        this.registerResourceAtBrokers(resourceId, brokerIds, () => {
                                            callback();
                                        })
                                    });
                            });
                        });
                    }).catch(error => {
                        console.log("Error in createResource(): ", error);
                        callback();
                    });
                }).catch(error => {
                    console.log("Error in createResource(): ", error);
                    callback();
                });

            }).catch(error => {
                console.log("Error in createResource(): ", error);
                callback();
            });
        },

        registerResourceAtBrokers(resourceId, brokerIds, callback) {
            // TODO implement when new API ready.
            console.log(">>> registerResourceAtBrokers: ", resourceId, brokerIds);
            callback();
        },

        getEndpointInfo(routeId, endpointId, callback) {
            var params = "?routeId=" + routeId + "&endpointId=" + endpointId;
            Axios.get("http://localhost:80/approute/step/endpoint/info" + params).then(response => {
                callback(response.data)
            }).catch(error => {
                console.log("Error in getEndpointInfo(): ", error);
                callback();
            });
        },

        getRoutes(callback) {
            Axios.get("http://localhost:80/approutes").then(response => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in getRoutes(): ", error);
                callback([]);
            });
        },

        createNewRoute(description, callback) {
            let params = "?description=" + description;
            Axios.post("http://localhost:80/approute" + params).then(response => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in createNewRoute(): ", error);
            });
        },

        createSubRoute(routeId, startId, startCoordinateX, startCoordinateY, endId, endCoordinateX, endCoordinateY, resourceId, callback) {
            let params = "?routeId=" + routeId + "&startId=" + startId + "&startCoordinateX=" + startCoordinateX +
                "&startCoordinateY=" + startCoordinateY + "&endId=" + endId + "&endCoordinateX=" + endCoordinateX +
                "&endCoordinateY=" + endCoordinateY + "&resourceId=" + resourceId;
            Axios.post("http://localhost:80/approute/step" + params).then(response => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in createSubRoute(): ", error);
            });
        },

        setSubRouteEnd(routeId, subRouteId, accessUrl, callback) {
            let params = "?routeId=" + routeId + "&routeStepId=" + subRouteId + "&accessUrl=" + accessUrl;
            Axios.post("http://localhost:80/approute/subroute/end" + params).then(response => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in setSubRouteEnd(): ", error);
            });
        },

        getProxySettings(callback) {
            Axios.get("http://localhost:80/proxy").then((response) => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in getProxySettings(): ", error);
                callback(null);
            });
        },

        changeProxySettings(proxyUrl, proxyNoProxy, username, password, callback) {
            let params = "?proxyUri=" + proxyUrl + "&noProxyUri=" + proxyNoProxy + "&username=" +
                username + "&password=" + password;
            Axios.put("http://localhost:80/proxy" + params).then(() => {
                callback();
            }).catch(error => {
                console.log("Error in changeProxySettings(): ", error);
                callback();
            });
        },

        getDeployMethods(callback) {
            Axios.get("http://localhost:80/enum?enumName=deployMethod").then((response) => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in getDeployMethod(): ", error);
                callback(null);
            });
        },

        getDeployMethod(callback) {
            Axios.get("http://localhost:80/route/deploymethod").then((response) => {
                callback(response.data);
            }).catch(error => {
                console.log("Error in getDeployMethod(): ", error);
                callback(null);
            });
        },

        changeDeployMethod(deployMethod, callback) {
            let params = "?deployMethod=" + deployMethod;
            Axios.post("http://localhost:80/route/deploymethod" + params).then(() => {
                callback();
            }).catch(error => {
                console.log("Error in changeDeployMethod(): ", error);
                callback();
            });
        },
    }
