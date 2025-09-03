import { useTimedCallbackQueue } from "@/hooks/useTimedCallbackQueue";
import { getAlgorithmParser, getCubeActionSemantics } from "@/model/algorithm";
import { MatchResult } from "ohm-js";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IconButton } from "../common";
import { CubeActions } from "../cubes";
import {
  algorithmParser,
  executing,
  hilite,
  invalid,
  match,
  running,
} from "./algorithm-parse.module.scss";

interface IAlgorithmParseProps {
  /** How to mutate the cube from here */
  readonly dispatch: React.Dispatch<CubeActions>;
}

/** Component that parses and executes algorithms for a cube */
export const AlgorithmParser: React.FC<IAlgorithmParseProps> = props => {
  const { dispatch } = props;
  const parser = useMemo(() => getAlgorithmParser(), []);
  const matcher = useMemo(() => parser.matcher(), [parser]);
  const semantics = useMemo(() => getCubeActionSemantics(parser), [parser]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [inputString, setInputString] = useState("");
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null);
  const [textAreaClass, setTextAreaClass] = useState("");
  const [executingClassName, setExecutingClassName] =
    useState<string>(executing);

  const actionQueue = useTimedCallbackQueue(dispatch, 500);

  const onChange = useCallback((event: ChangeEvent) => {
    setInputString((event.target as HTMLTextAreaElement).value);
    setExecutingClassName(executing);
  }, []);
  const onRun = useCallback(() => {
    if (!currentMatch || textAreaClass) {
      return;
    }
    setExecutingClassName(`${executing} ${running}`);
    actionQueue.replaceQueue(...semantics(currentMatch).execute());
    actionQueue.startQueue();
  }, [currentMatch, semantics, actionQueue, textAreaClass]);

  useEffect(() => {
    matcher.setInput(inputString);
    const curMatch = matcher.match();
    setCurrentMatch(curMatch);
    setTextAreaClass(inputString && curMatch.failed() ? invalid : "");
  }, [matcher, inputString]);

  return (
    <div className={algorithmParser}>
      <label htmlFor="freeTextAlgorithm">Enter an algorithm to use:</label>
      <textarea
        id="freeTextAlgorithm"
        className={textAreaClass}
        ref={textAreaRef}
        placeholder="F R L B U D"
        onChange={onChange}
      ></textarea>
      <div className={`${match} ${textAreaClass}`}>
        {inputString && currentMatch?.shortMessage}
      </div>
      <IconButton
        iconKey="magic-swirl"
        label="Run Al&gorithm"
        onClick={onRun}
        labelAsText
        shortcut="Ctrl+Alt+G"
        disabled={currentMatch?.failed() ?? true}
        alt="Execute the listed steps with a delay of 0.5 seconds between each step"
      />
      <div className={executingClassName}>
        <h3>Currently executing:</h3>
        {...inputString.split(" ").map((pc, ix) => (
          <span
            key={ix}
            className={ix === actionQueue.queueIndex ? hilite : ""}
          >
            {pc}
          </span>
        )) ?? []}
      </div>
    </div>
  );
};
