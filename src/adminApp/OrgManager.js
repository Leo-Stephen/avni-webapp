import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "./react-admin-config";
import { adminHistory, store } from "../common/store";
import { UserCreate, UserDetail, UserEdit, UserList } from "./user";
import { CatchmentCreate, CatchmentDetail, CatchmentEdit, CatchmentList } from "./catchment";
import {
  LocationTypeCreate,
  LocationTypeDetail,
  LocationTypeEdit,
  LocationTypeList
} from "./addressLevelType";
import { LocationCreate, LocationDetail, LocationEdit, LocationList } from "./locations";
import {
  IdentifierSourceCreate,
  IdentifierSourceDetail,
  IdentifierSourceEdit,
  IdentifierSourceList
} from "./IdentifierSource";
import {
  IdentifierUserAssignmentCreate,
  IdentifierUserAssignmentDetail,
  IdentifierUserAssignmentEdit,
  IdentifierUserAssignmentList
} from "./IdentifierUserAssignment";
import customConfig from "./OrganisationConfig";
import { WithProps } from "../common/components/utils";

import { Dashboard as UploadDashboard } from "../upload";
import customRoutes from "./customRoutes";
import AdminLayout from "../common/components/AdminLayout";
import { getAdminOrgs } from "../rootApp/ducks";
import UserGroups from "../userGroups/UserGroups";
import { OrganisationDetail } from "./OrganisationDetail";
import Msg91Config from "../phoneNumberVerification/Msg91Config";
import CurrentUserService from "../common/service/CurrentUserService";
import DeploymentManager from "./DeploymentManager";

class OrgManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user, userInfo } = this.props;

    if (CurrentUserService.isAdminButNotImpersonating(userInfo)) return <DeploymentManager />;

    return (
      <Admin
        title="Manage Organisation"
        authProvider={authProvider}
        history={adminHistory}
        logoutButton={WithProps({ user }, LogoutButton)}
        customRoutes={customRoutes}
        appLayout={AdminLayout}
      >
        <Resource
          name="language"
          options={{ label: "Languages" }}
          list={WithProps({ organisation }, customConfig)}
        />
        <Resource
          name="addressLevelType"
          options={{ label: "Location Types" }}
          list={LocationTypeList}
          show={LocationTypeDetail}
          create={LocationTypeCreate}
          edit={LocationTypeEdit}
        />
        <Resource
          name="locations"
          options={{ label: "Locations" }}
          list={LocationList}
          show={LocationDetail}
          create={LocationCreate}
          edit={LocationEdit}
        />
        <Resource
          name="catchment"
          list={CatchmentList}
          show={CatchmentDetail}
          create={CatchmentCreate}
          edit={CatchmentEdit}
        />
        <Resource
          name="user"
          list={WithProps({ organisation }, UserList)}
          create={WithProps({ organisation }, UserCreate)}
          show={WithProps({ user }, UserDetail)}
          edit={WithProps({ user }, UserEdit)}
        />
        <Resource name="userGroups" options={{ label: "User Groups" }} list={UserGroups} />
        <Resource name="task" options={{ label: "Tasks" }} />
        <Resource name="upload" options={{ label: "Upload" }} list={UploadDashboard} />
        <Resource
          name="identifierSource"
          options={{ label: "Identifier Source" }}
          list={IdentifierSourceList}
          show={IdentifierSourceDetail}
          create={IdentifierSourceCreate}
          edit={IdentifierSourceEdit}
        />
        <Resource
          name="identifierUserAssignment"
          options={{ label: "Identifier User Assignment" }}
          list={IdentifierUserAssignmentList}
          show={IdentifierUserAssignmentDetail}
          create={IdentifierUserAssignmentCreate}
          edit={IdentifierUserAssignmentEdit}
        />
        <Resource
          name="organisationDetails"
          options={{ label: "Organisation Details" }}
          list={WithProps({ organisation }, OrganisationDetail)}
        />
        <Resource
          name="phoneNumberVerification"
          options={{ label: "Phone Verification" }}
          list={Msg91Config}
        />
        <Resource name="upload" options={{ label: "Upload" }} list={UploadDashboard} />
      </Admin>
    );
  }
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.authSession,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getAdminOrgs }
  )(OrgManager)
);
