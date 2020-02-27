import React, { Fragment } from "react";
import { isNaN } from "lodash";
import { withParams } from "../../../common/components/utils";
import Paginator from "../../components/Paginator";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { LineBreak } from "../../../common/components/utils";
import moment from "moment/moment";
import Form from "../../components/Form";
import Summary from './Summary';
import { Box, Typography, Paper } from "@material-ui/core";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(3, 3)
  },
  details: {   
    color: "rgba(0, 0, 0, 0.54)"
  }
}));


const Header = ({ subject }) => {
  const classes = useStyle();
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender.name || "-";
  const lowestAddressLevel = subject.lowestAddressLevel.title || "-";
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return (   
      <div className={classes.details}>
        <Typography variant="caption" gutterBottom>
          Name: {fullName} | Age: {dateOfBirth} | Gender: {gender} | Village: {lowestAddressLevel}
        </Typography>
        <LineBreak num={2}></LineBreak> 
      </div>    
  )
};

const SubjectRegistrationForm = ({ form, obs, updateObs, location, title, match, saved, onSaveGoto, onSave, subject }) => {
  const classes = useStyle();

  const page = +match.queryParams.page;
  const from = match.queryParams.from;

  const firstPageNumber = form.firstFormElementGroup.displayOrder;
  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  const lastPageNumber = form.getLastFormElementElementGroup().displayOrder;

  const pageDetails = {
    nextPageNumber:
      currentPageNumber === lastPageNumber
        ? null
        : form.getNextFormElement(currentPageNumber).displayOrder,
    previousPageNumber:
      currentPageNumber === firstPageNumber
        ? null
        : form.getPrevFormElement(currentPageNumber).displayOrder,
    location,
    from
  };

  const current = form.formElementGroupAt(currentPageNumber);
  const pageCount = (currentPageNumber+1) + " / " + (lastPageNumber+1);

  return (
    <Fragment>
      <Header subject={subject}></Header>
      <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
        <Typography variant="subtitle1" gutterBottom>  {currentPageNumber + 1}. {current.name} </Typography>       
          <Paginator pageDetails={pageDetails} 
          onSave={onSave}
          label={{Previous:"PREV",Next:"NEXT",Save:"SAVE",type:"text"}}
          showCount="true"
          count={pageCount}/>               
      </Box>      
      <Paper className={classes.form}>
        {(currentPageNumber === lastPageNumber) ? <Summary subject={subject} /> :
          <Form current={current} obs={obs} updateObs={updateObs}></Form>}

        {saved && <Redirect to={onSaveGoto} />}
        <Paginator pageDetails={pageDetails}
         onSave={onSave}
         label={{Previous:"Previous",Next:"Next",Save:"Save",type:"button"}}
         showCount="false"/>
      </Paper>
    </Fragment>
  );
}

export default withRouter(withParams(SubjectRegistrationForm));
