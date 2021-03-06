import React, { useState, useEffect } from 'react';
import db from '../../db.json';
import Widget from '../../src/components/Widget';
import QuizLogo from '../../src/components/QuizLogo';
import QuizBackground from '../../src/components/QuizBackground';
import QuizContainer from '../../src/components/QuizContainer';
import Button from '../../src/components/Button';
import AlternativesForm from '../../src/components/AlternativesForm';
import BackLinkArrow from '../../src/components/BackLinkArrow';
import Link from '../../src/components/Link';

function msgQuestions(correctQuestions) {
  switch (correctQuestions) {
    case 0:
    case 1:
      return <p>Você precisa estudar sobre Formula 1</p>;
    case 2:
    case 3:
      return (
        <p>Você sabe alguma coisa, mas precisa se esforçar mais...</p>
      );
    case 4:
    case 5:
      return <p>Você é um expert em F1, parabéns!</p>;
  }
}

function ResultWidget({ results }) {
  return (
    <Widget>
      <Widget.Header>Tela de Resultado:</Widget.Header>

      <Widget.Content>
        <p>
          Você acertou{' '}
          {/* {results.reduce((somatoriaAtual, resultAtual) => {
              const isAcerto = resultAtual === true;
              if (isAcerto) {
                return somatoriaAtual + 1;
              }
              return somatoriaAtual;
            }, 0)} */}
          {results.filter((x) => x).length} perguntas
        </p>
        {msgQuestions(results.filter((x) => x).length)}
        <ul>
          {results.map((result, index) => (
            <li key={`result__${result}`}>
              #{index + 1} Resultado:
              {result === true ? 'Acertou' : 'Errou'}
            </li>
          ))}
        </ul>
        <Widget.Topic as={Link} href="/">
          Jogar novamente
        </Widget.Topic>
      </Widget.Content>
    </Widget>
  );
}

function LoadingWidget() {
  return (
    <Widget>
      <Widget.Header>Carregando...</Widget.Header>

      <Widget.Content>[Desafio do Loading]</Widget.Content>
    </Widget>
  );
}

function QuestionWidget({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  onClick,
  addResult,
}) {
  const questionId = `question__${questionIndex}`;
  const [isQuestionSubmited, setIsQuestionSubmited] = useState();
  const [answerQuestion, setAnswerQuestion] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState(
    null,
  );
  const isCorrect = selectedAlternative === question.answer;
  const hasAlternativeSelected = selectedAlternative !== undefined;

  return (
    <Widget>
      <Widget.Header>
        <BackLinkArrow href="/" />
        <h3>
          {`Pergunta ${questionIndex + 1} de ${totalQuestions}`}
        </h3>
      </Widget.Header>

      <img
        alt="Descrição"
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
        }}
        src={question.image}
      />

      <Widget.Content>
        <h2>{question.title}</h2>
        <p>{question.description}</p>

        <AlternativesForm
          onSubmit={(infosDoEvento) => {
            infosDoEvento.preventDefault();
            setIsQuestionSubmited(true);
            setTimeout(() => {
              addResult(isCorrect);
              onSubmit(answerQuestion, question.answer);
              setIsQuestionSubmited(false);
              setSelectedAlternative(undefined);
            }, 3 * 1000);
          }}
        >
          {question.alternatives.map(
            (alternative, alternativeIndex) => {
              const isSelected =
                selectedAlternative === alternativeIndex;
              const alternativeStatus = isCorrect
                ? 'SUCCESS'
                : 'ERROR';
              const alternativeId = `alternative__${alternativeIndex}`;
              return (
                <Widget.Topic
                  as="label"
                  htmlFor={alternativeId}
                  key={alternativeId}
                  data-selected={isSelected}
                  data-status={
                    isQuestionSubmited && alternativeStatus
                  }
                >
                  {alternativeIndex + 1} {'-) '}
                  <input
                    style={{ display: 'none' }}
                    id={alternativeId}
                    name={questionId}
                    type="radio"
                    onChange={() => {
                      setSelectedAlternative(alternativeIndex);
                    }}
                    onClick={() => {
                      setAnswerQuestion(alternativeIndex);
                      onClick(alternativeIndex, questionIndex);
                    }}
                  />
                  {alternative}
                </Widget.Topic>
              );
            },
          )}

          {/* <pre>{JSON.stringify(question, null, 4)}</pre> */}
          <Button type="submit" disabled={!hasAlternativeSelected}>
            Confirmar
          </Button>
          {isQuestionSubmited && isCorrect && <p>Você acertou</p>}
          {isQuestionSubmited && !isCorrect && <p>Você errou!</p>}
        </AlternativesForm>
      </Widget.Content>
    </Widget>
  );
}

const screenStates = {
  QUIZ: 'QUIZ',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
};

export default function QuizPage() {
  const [screenState, setScreenState] = useState(
    screenStates.LOADING,
  );
  const totalQuestions = db.questions.length;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questionIndex = currentQuestion;
  const question = db.questions[questionIndex];
  const [hits, setHits] = useState(0);
  const [results, setResults] = useState([]);

  function addResult(result) {
    setResults([...results, result]);
  }

  // [React chama de: Efeitos || Effects]
  // React.useEffect
  // atualizado === willUpdate
  // morre === willUnmount
  useEffect(() => {
    // fetch() ...
    setTimeout(() => {
      setScreenState(screenStates.QUIZ);
    }, 1 * 1000);
    // nasce === didMount
  }, []);

  function handleSubmitQuiz(answer, correctAnswer) {
    if (answer === correctAnswer) {
      setHits(hits + 1);
    }
    const nextQuestion = questionIndex + 1;
    if (nextQuestion < totalQuestions) {
      setCurrentQuestion(nextQuestion);
    } else {
      setScreenState(screenStates.RESULT);
    }
  }

  function handleClick(handleClick, question) {
    console.log('Question ', question);
    console.log('cliclou na alternativa ', handleClick);
  }

  return (
    <QuizBackground backgroundImage={db.bg}>
      <QuizContainer>
        <QuizLogo />
        {screenState === screenStates.QUIZ && (
          <QuestionWidget
            question={question}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            onSubmit={handleSubmitQuiz}
            onClick={handleClick}
            addResult={addResult}
          />
        )}

        {screenState === screenStates.LOADING && <LoadingWidget />}

        {screenState === screenStates.RESULT && (
          <div>Você acertou {hits} questões, parabéns!</div>
        )}

        {screenState === screenStates.RESULT && (
          <ResultWidget results={results} />
        )}
      </QuizContainer>
    </QuizBackground>
  );
}
