import React from "react";

export const timeout = async (ms) => {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), ms));
};

export const mapValues = (obj, mapper) => {
  const output = {};
  Object.entries(obj).forEach(([key, value]) => (output[key] = mapper(value)));
  return output;
};

// NOTE: This only memoizes one value. Which is good enough for this app probably
export const memoize = (func) => {
  let mostRecent = undefined;
  let value = undefined;

  return (...args) => {
    if (mostRecent === undefined || mostRecent.length !== args.length) {
      value = func(...args);
      mostRecent = args;
      return value;
    }

    const memoValid = args.reduce(
      (agg, current, index) => agg && mostRecent[index] === current,
      true
    );

    if (!memoValid) {
      value = func(...args);
      mostRecent = args;
    }

    return value;
  };
};

export function useAsync(_call, dependencies) {
  const counter = React.useRef(0);
  const data = React.useRef(undefined);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const call = React.useCallback(_call, dependencies);

  React.useEffect(() => {
    setIsLoaded(false);
    counter.current += 1;
    const iteration = counter.current;

    const doCall = async () => {
      let newValue, newIsLoaded;
      try {
        newValue = await new Promise((resolve) => resolve(call()));
        newIsLoaded = true;
      } catch (err) {
        newValue = undefined;
        newIsLoaded = false;
      }

      if (iteration === counter.current) {
        data.current = newValue;
        setIsLoaded(newIsLoaded);
      }
    };

    doCall();
  }, [call, setIsLoaded]);

  return { isLoaded, data: data.current };
}
