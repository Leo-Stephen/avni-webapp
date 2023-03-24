import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import "./SecureApp.css";
import App from "./App";
import CognitoSignIn from "./CognitoSignIn";
import httpClient from "../common/utils/httpClient";
import IdpDetails from "./security/IdpDetails";
import KeycloakSignInView from "./views/KeycloakSignInView";
import { setCognitoUser } from "./ducks";

class SecureApp extends Component {
  hasSignedIn() {
    return this.props.user.authState === "signedIn";
  }

  render() {
    const redirect_url = new URLSearchParams(window.location.search).get("redirect_url");
    if (!_.isEmpty(redirect_url) && this.hasSignedIn()) {
      window.location.href = redirect_url;
      return <></>;
    }

    if (this.props.user.authState === "signedIn") return <App />;

    const idpType = httpClient.idp.idpType;

    if (idpType === IdpDetails.cognito) return <CognitoSignIn />;

    if (idpType === IdpDetails.keycloak) return <KeycloakSignInView />;
  }
}

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    { setCognitoUser }
  )(SecureApp)
);
