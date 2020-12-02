import React from 'react';

export const QuestionVoiting = ({ onVoteUpdate, og, mainQuestions, target, data, onDataReady, clone }) => {
  if (og.isRea) {
    return null;
  }
  const result = mainQuestions[target.step].voteResult;
  return (
    <div className="question-editor-title-vote">
      <div className="form-label">Голосование</div>
      <div className="voting">
        <button
          className={
            'vote-button' + (result === 'Y' ? ' vote-button-favour' : '')
          }
          onClick={() => onVoteUpdate('Y')}
        >
          За
        </button>
        <button
          className={
            'vote-button' + (result === 'N' ? ' vote-button-against' : '')
          }
          onClick={() => onVoteUpdate('N')}
        >
          Против
        </button>
        <button
          className={
            'vote-button' + (result === 'A' ? ' vote-button-abstained' : '')
          }
          onClick={() => onVoteUpdate('A')}
        >
          Воздержался
        </button>
      </div>
    </div>
  );
}