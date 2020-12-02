import { combineReducers } from 'redux';
import { enableES5, enableMapSet } from 'immer';
import main from './main';
import forms from './forms';
import questions from './questions';
import deal from './deal';
import nomination from './nomination';
import directive from './directive';
import { undoable } from './undoable';

enableES5();
enableMapSet();
/**
 * Изменением состояния занимается специальная функция — reducer.
 * Она берёт начальное состояние и экшен и возвращает новое состояние.
 * Добавлено два состояния undoable - необходим для undo и redo (для отображения текущего состояния)
 * И для данных, которые зависят от шагов и должны быть актуальными на каждом состоянии
 */
export default undoable(combineReducers({ main, forms, nomination }), combineReducers({ deal, questions, nomination, directive  }))
