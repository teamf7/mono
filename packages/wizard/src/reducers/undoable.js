import { types } from '../actions';
export function undoable(reducer, editReducer) {
  // Call the reducer with empty action to populate the initial state
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: [],
    edit: editReducer(undefined, {}),
  }

  // Return a reducer that handles undo and redo
  return function (state = initialState, action) {
    const { past, present, future, edit } = state

    switch (action.type) {
      case types.UNDO:
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
          edit: edit
        }
      case types.REDO:
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
          edit: edit
        }
      default: {
        // Delegate handling the action to the passed reducer
        const newPresent = reducer(present, action)
        const newEdit = editReducer(edit, action); 
        if (present === newPresent && edit === newEdit) {
          return state
        }
        let newPast = past;
        if (action.type === types.NEXT_STEP_SUCCEEDED && !action.payload.isEditable) {
          newPast = [...past, present];
        }
        return {
          past: newPast,
          present: newPresent,
          future: [],
          edit: newEdit
        }
      }
    }
  }
}