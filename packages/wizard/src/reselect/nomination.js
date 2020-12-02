import { createSelector } from 'reselect';

const getNominationOptions = (state) => {
  return state.edit.nomination.options;
};

const getNominationOg = (state) => {
  return state.edit.nomination.og;
};
const getNominationOu = (state) => {
  return state.edit.nomination.ou;
};

const getNominationOgName = createSelector(
  [getNominationOptions, getNominationOg],
  (options, og) => options.find((o) => o.ID === og)['UF_SNAME']
);

const ouNames = {
  RK: 'Ревизионная комиссия',
  SD: 'Совет директоров',
};
const getNominationOuName = (state) => {
  return ouNames[state.edit.nomination.ou];
};
const getNominationCandidates = (state) => {
  return state.edit.nomination.candidates;
};
const getCurrentCandidate = (state) => {
  return state.edit.nomination.candidateDetails[state.edit.nomination.currentCandidate];
};

const getNominationCandidateDetails = (state) => {
  return state.edit.nomination.candidateDetails;
};
export {
  getNominationOptions,
  getNominationOg,
  getNominationOu,
  getNominationCandidates,
  getNominationOgName,
  getNominationOuName,
  getCurrentCandidate,
  getNominationCandidateDetails
};
