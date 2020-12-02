import { call, put, select, takeEvery } from 'redux-saga/effects';
import { replace, push } from 'react-router-redux';

import { fetchJson } from '../util/util';
import server from '../util/server';
import { types } from '../actions';
import {
  getNominationOg,
  getNominationOu,
  getNominationCandidateDetails,
  getNominationCandidates,
  getStatus,
  getId,
} from '../reselect';

function* fetchNominationOptions({ payload }) {
  const isEdit = payload.status === 'edit';
  let url = server + '/API/internal/v1/wizard_settings_advance.php';
  if (isEdit) {
    url += `?nomination=${payload.id}`;
  }
  const res = yield call(fetchJson, url);
  yield put({ type: types.SET_REDIRECT_URL, payload: res['redirectUrl'] });
  yield put({ type: types.SET_NOMINATION_OPTIONS, payload: res['OG'] });

  if (!isEdit) {
    yield put({ type: types.SET_NOMINATION_OG, payload: res['OG'][0].ID });
  } else {
    yield put({ type: types.SET_NOMINATION_OG, payload: res['selectedOg'] });
    yield put({ type: types.SET_NOMINATION_OU, payload: res['selectedOu'] });
  }
}

function* fetchNominationCandidates() {
  const status = yield select(getStatus);
  const isEdit = status === 'edit';

  const og = yield select(getNominationOg);
  const ou = yield select(getNominationOu);

  let url = server + '/API/internal/v1/wizard_advance_sd.php?';
  if (isEdit) {
    const nomination = yield select(getId);
    url += `nomination=${nomination}`;
  } else {
    url += `ogId=${og}&type=${ou}`;
  }

  const list = yield call(fetchJson, url);
  const members = list['members'];

  for (const candidate of members) {
    candidate.selected = true;
  }

  yield put({ type: types.SET_NOMINATION_CANDIDATES, payload: members });

  yield put({
    type: types.NEXT_STEP,
    payload: {
      type: 'nomination_list',
    },
  });
}
function* showNominationCandidate({ payload }) {
  const details = yield select(getNominationCandidateDetails);
  if (!details[payload]) {
    const info = yield call(fetchJson, server + `/API/internal/v1/user_detail.php?userId=${payload}`);
    yield put({ type: types.SET_NOMINATION_CANDIDATE_DETAILS, payload: { id: payload, info } });
  }
  yield put({ type: types.SET_NOMINATION_CURRENT_CANDIDATE, payload });
}

function* saveNomination() {
  const og = yield select(getNominationOg);
  const ou = yield select(getNominationOu);
  const candidates = yield select(getNominationCandidates);
  const selected = candidates.filter((c) => c.selected);
  const id = yield select(getId);
  let post = {
    og,
    ou,
    candidates: {
      main: selected.filter((c) => !c.added).map((c) => c.id),
      add: selected.filter((c) => c.added).map((c) => c.id),
    },
  };
  if (id) {
    post.id = id;
  }
  const result = yield call(fetchJson, server + '/API/internal/v1/wizard_save.php?type=nomination', {
    method: 'post',
    body: JSON.stringify(post),
  });

  if (typeof result !== 'undefined' && typeof result.ID !== 'undefined') {
    window.location = '/og/nomination/' + result.ID + '/';
  }
}
export default function* nominationSaga() {
  yield takeEvery(types.FETCH_NOMINATION_OPTIONS, fetchNominationOptions);
  yield takeEvery(types.GO_TO_NOMINATION_LIST, fetchNominationCandidates);
  yield takeEvery(types.SHOW_NOMINATION_CANDIDATE, showNominationCandidate);
  yield takeEvery(types.SAVE_NOMINATION, saveNomination);
}
