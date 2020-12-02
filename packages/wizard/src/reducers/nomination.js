import produce from 'immer';

import { types as actionTypes } from '../actions';

/**
 * options: [
 *   {"ID":1416,"UF_SNAME":"AS «Gaso»"}
 * ]
 */
export const initialState = {
  options: [],
  og: null,
  ou: 'RK',
  candidates: [],
  candidateDetails: {},
  currentCandidate: null,
};

export default produce((draft, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_NOMINATION_OPTIONS: {
      draft.options = payload;
      return draft;
    }
    case actionTypes.SET_NOMINATION_OG: {
      draft.og = payload;
      return draft;
    }
    case actionTypes.SET_NOMINATION_OU: {
      draft.ou = payload;
      return draft;
    }
    case actionTypes.ADD_NOMINATION_CANDIDATE: {
      const id = parseInt(payload.ID);
      if (draft.candidates.find((p) => p.id === id)) {
        return draft;
      }
      draft.candidates.push({
        id,
        position: payload.WORK_POSITION,
        name: payload.UF_NOMINATIVE,
        added: true,
        selected: true,
      });
      return draft;
    }
    case actionTypes.SET_NOMINATION_CANDIDATES: {
      draft.candidates = payload;
      return draft;
    }
    case actionTypes.TOGGLE_NOMINATION_CANDIDATE: {
      const index = draft.candidates.findIndex((c) => c.id === payload);
      draft.candidates[index].selected = !draft.candidates[index].selected;
      return draft;
    }
    case actionTypes.SET_NOMINATION_CANDIDATE_DETAILS: {
      const { id, info } = payload;
      draft.candidateDetails[id] = info;
      return draft;
    }
    case actionTypes.SET_NOMINATION_CURRENT_CANDIDATE: {
      draft.currentCandidate = payload;
      return draft;
    }
    default:
      return draft;
  }
}, initialState);
