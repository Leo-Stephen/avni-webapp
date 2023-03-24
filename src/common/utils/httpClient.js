import { isEmpty } from "lodash";
import { fetchUtils } from "react-admin";
import { authContext as _authContext } from "../../rootApp/authContext";
import { stringify } from "query-string";
import axios from "axios";
import files from "./files";
import { devEnvUserName } from "../constants";
import Auth from "@aws-amplify/auth";
import querystring from "querystring";

class HttpClient {
  idp;

  static instance;

  constructor() {
    if (HttpClient.instance) return HttpClient.instance;
    this.authContext = _authContext;
    this.initAuthContext = this.initAuthContext.bind(this);
    this.setHeaders = this.setHeaders.bind(this);
    this.fetchJson = this.fetchJson.bind(this);
    this.getOrgUUID = this.getOrgUUID.bind(this);
    this.get = this._wrapAxiosMethod("get");
    this.post = this._wrapAxiosMethod("post");
    this.put = this._wrapAxiosMethod("put");
    this.patch = this._wrapAxiosMethod("patch");
    this.delete = this._wrapAxiosMethod("delete");
    HttpClient.instance = this;
  }

  setIdp(idp) {
    this.idp = idp;
  }

  initAuthContext(userInfo) {
    this.authContext.init(userInfo);
  }

  setOrgUuidHeader() {
    const organisationUUID = this.getOrgUUID();
    if (!isEmpty(organisationUUID)) {
      axios.defaults.headers.common["ORGANISATION-UUID"] = organisationUUID;
    } else {
      delete axios.defaults.headers.common["ORGANISATION-UUID"];
    }
  }

  initHeadersForDevEnv() {
    if (devEnvUserName) {
      axios.defaults.headers.common["user-name"] = devEnvUserName;
    }
    this.setOrgUuidHeader();
  }

  getOrgUUID() {
    return localStorage.getItem("ORGANISATION_UUID");
  }

  saveAuthTokenForAnalyticsApp() {
    Auth.currentSession().then(session => {
      const authToken = session.idToken.jwtToken;
      localStorage.setItem("authToken", authToken);
    });
  }

  async setHeaders(options) {
    const authParams = this.authContext.get();
    if (!options.headers) options.headers = new Headers({ Accept: "application/json" });
    if (
      !options.headers.has("Content-Type") &&
      !(options.body && options.body instanceof FormData)
    ) {
      options.headers.set("Content-Type", "application/json");
    }
    if (!isEmpty(authParams)) {
      options.headers.set("user-name", authParams.username);
      await this.setTokenAndOrgUuidHeaders(options);
    }

    if (devEnvUserName) {
      options.headers.set("user-name", devEnvUserName);
    }
    if (!isEmpty(this.getOrgUUID())) {
      options.headers.set("ORGANISATION-UUID", this.getOrgUUID());
    } else {
      options.headers.delete("ORGANISATION-UUID");
    }
    options.credentials = "include";
  }

  async fetchJson(url, options = {}, skipOrgUUIDHeader) {
    await this.setHeaders(options);
    if (skipOrgUUIDHeader) {
      options.headers.delete("ORGANISATION-UUID");
    }
    return fetchUtils.fetchJson(url, options);
  }

  async downloadFile(url, filename) {
    return await this.get(url, {
      responseType: "blob"
    }).then(response => {
      files.download(filename, response.data);
    });
  }

  async uploadFile(url, file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.post(url, formData);
  }

  withParams(url, params) {
    return url + "?" + stringify(params);
  }

  async setTokenAndOrgUuidHeaders(options) {
    await this.idp.updateRequestWithSession(options, axios);
    this.setOrgUuidHeader();
  }

  _wrapAxiosMethod(methodName) {
    return async (...args) => {
      await this.setTokenAndOrgUuidHeaders();
      return axios[methodName](...args);
    };
  }

  async postJson(url, body) {
    return await this.post(url, body);
  }

  async putJson(url, body) {
    return await this.put(url, body);
  }

  async deleteEntity(url) {
    return await this.delete(url);
  }

  getData(...args) {
    return this.get(...args).then(response => response.data);
  }

  getPageData(embeddedResourceCollectionName, ...args) {
    return this.getData(args).then(responseBodyJson => {
      return {
        data: responseBodyJson._embedded
          ? responseBodyJson._embedded[embeddedResourceCollectionName]
          : [],
        page: responseBodyJson.page.number,
        totalCount: responseBodyJson.page.totalElements
      };
    });
  }

  postUrlEncoded(url, request) {
    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    const encoded = querystring.stringify(request);
    return axios.post(url, encoded, options);
  }
}

export const httpClient = new HttpClient();
export default httpClient;
