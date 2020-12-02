import React, { useMemo } from 'react';
import { Header } from '../header';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../actions';
import { currentTarget, getCurrentSelectedIp, getIpNav } from '../../../reselect';
import '../../../styles/ui-components/checkbox.sass';

const votes = {
  Y: 'ЗА',
  N: 'ПРОТИВ',
  M: 'ВОЗДЕРЖАЛСЯ',
};

const NavBar = ({ nav, toStep }) =>
  nav.map((step, index) => (
    <div className="directive-navigation__button-wrapper" key={`ip-nav-${step.idx}`}>
      <button
        className={`directive-navigation__button${step.currentStep === index ? ' directive-navigation__button_current' : ''}`}
        onClick={() => toStep(step)}
      >
        {step.name}
      </button>
    </div>
  ));

function DirectiveQuestionSelect({ ips, toggleIpQuestion, setIpQuestionVoteOverride, isSummary, nav, nextStepSucceeded }) {
  let totalQuestions = 0;
  const ipList = useMemo(() => {
    return ips.map((ip) => {
      const questions = isSummary ? ip.questions.filter((q) => q.selected) : ip.questions;
      if (!questions.length) {
        return null;
      }

      return (
        <div className="directive-question" key={ip.id}>
          {questions.map((q, qidx) => {
            const qNumber = isSummary ? ++totalQuestions : qidx + 1;
            const onVoteOverrideChange = (vote) => {
              setIpQuestionVoteOverride({
                ip: ip.id,
                question: q.id,
                vote,
              });
            };
            return (
              <div className="directive-question-page" key={q.id}>
                <div className="directive-questions">
                  <div className="directive__row">
                    <div
                      className={`directive-question__block directive-question__block_main${
                        !q.selected ? ' directive-question__block_disabled' : ''
                      }`}
                    >
                      <label className="directive__label directive__label_question">Формулировка вопроса №{qNumber}</label>
                      <div dangerouslySetInnerHTML={{ __html: q.title }}></div>
                    </div>
                  </div>
                  {q.selected && (
                    <div className="directive__row">
                      <div className="directive-question__block">
                        <label className="directive__label directive__label_question">
                          Проект решения по вопросу №{qNumber}
                        </label>
                        <div>
                          <div className="directive-question__vote">
                            Голосовать "{votes[q.voteOverride || q.vote]}" принятие следующего решения:
                          </div>
                          <div dangerouslySetInnerHTML={{ __html: q.text }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {!isSummary && (
                  <div className="directive-settings">
                    <div className="directive__row">
                      <div className="directive-question__block">
                        <div className="toggle-container">
                          <div>Вопрос включен в проект директивы</div>
                          <div className="toggle">
                            <input
                              className="toggle-checkbox"
                              id={`add-question-to-project-${q.id}`}
                              type="checkbox"
                              checked={q.selected}
                              onChange={() =>
                                toggleIpQuestion({
                                  ip: ip.id,
                                  question: q.id,
                                })
                              }
                            />
                            <label htmlFor={`add-question-to-project-${q.id}`} className="toggle-switch"></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {q.selected && (
                      <>
                        <div className="directive__row">
                          <div className="directive-question__block">
                            <div className="toggle-container">
                              <div>Изменить решение по вопросу</div>
                              <div className="toggle">
                                <input
                                  className="toggle-checkbox"
                                  id={`change-project-${q.id}`}
                                  type="checkbox"
                                  checked={!!q.voteOverride}
                                  onChange={(e) => onVoteOverrideChange(e.target.checked ? 'Y' : false)}
                                />
                                <label htmlFor={`change-project-${q.id}`} className="toggle-switch"></label>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!!q.voteOverride && (
                          <div className="directive__row">
                            <div className="voting">
                              <button
                                className={`vote-button${q.voteOverride === 'Y' ? ' vote-button-favour' : ''}`}
                                onClick={q.voteOverride ? () => onVoteOverrideChange('Y') : null}
                              >
                                За
                              </button>
                              <button
                                className={`vote-button${q.voteOverride === 'N' ? ' vote-button-against' : ''}`}
                                onClick={q.voteOverride ? () => onVoteOverrideChange('N') : null}
                              >
                                Против
                              </button>
                              <button
                                className={`vote-button${q.voteOverride === 'M' ? ' vote-button-abstained' : ''}`}
                                onClick={q.voteOverride ? () => onVoteOverrideChange('M') : null}
                              >
                                Воздержался
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    });
  }, [ips]);
  return (
    <>
      <Header title="Редактирование проекта директивы" stepCounter={{ current: !isSummary ? 3 : 4, last: 5 }} />
      <div className="directive-wide">
        {isSummary && (
          <div className="directive-navigation">
            <div className="directive-navigation__title">Вопросы, включенные в проект данной директивы:</div>
          </div>
        )}
        {nav && (
          <div className="directive-navigation">
            <div className="directive-navigation__title">Вопросы, согласованные в рамках ИП:</div>
            <NavBar nav={nav} toStep={nextStepSucceeded} />
          </div>
        )}
        {ipList}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    ips: getCurrentSelectedIp(state),
    isSummary: currentTarget(state).summary || false,
    nav: getIpNav(state),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DirectiveQuestionSelect);
