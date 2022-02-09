// the condition who need to match the value
type ICondition<T> = (x: T) => boolean;

// Model define when we create a new interface with improvedInterface
type IModel = Record<string, IFandType>;

type PossibleType<T> = T extends string
  ? "string"
  : T extends boolean
  ? "boolean"
  : T extends number
  ? "number"
  : T extends Record<string, unknown>
  ? "object"
  : T extends Array<unknown>
  ? "array"
  : never;

// The value return by typePredicate
interface IFandType<T = unknown> {
  f?: <A>(x: A) => boolean;
  param: T;
  type: PossibleType<T>;
  optional: boolean;
}

export const typePredicate = {
  // simple type
  string: (f?: ICondition<string>) => <IFandType<string>>{ f, type: "string" },
  number: (f?: ICondition<number>) => <IFandType<number>>{ f, type: "number" },
  boolean: (f?: ICondition<boolean>) =>
    <IFandType<boolean>>{ f, type: "boolean" },
  // computed
  object: (x: IModel) => <IFandType<IModel>>{ type: "object", param: x },
  array: <A>(x: IFandType<A>) =>
    <IFandType<IFandType<A>>>{ type: "array", param: x },
  // helper
  optional: <T>(x: IFandType<T>) => <IFandType<T>>{ ...x, optional: true },
};

/**
 * Verify that the type of two object is equal
 */
// deno-lint-ignore no-explicit-any
const objectTypeIsEqual = (obj1: any, model: IModel | IFandType[]) => {
  for (const [key, value] of Object.entries(model)) {
    const { type, optional } = value;

    // verify that the obj1 have the key of the model
    if (obj1[key] === undefined && optional === false) return false;
    // continue if the value is optional and dont exist on the obj1
    if (obj1[key] === undefined && optional === true) continue;

    // verify the type of the value
    switch (type) {
      case "string":
      case "number":
      case "boolean": {
        const { f } = value;
        if (type !== typeof obj1[key]) return false;
        if (f) {
          if (!f(obj1[key])) return false;
        }
        continue;
      }

      case "object": {
        const { param } = value as IFandType<IModel>;
        if (objectTypeIsEqual(obj1[key], param)) continue;
        return false;
      }

      case "array": {
        const param = [value.param as IFandType];
        param.length = obj1[key].length;

        console.log(param.fill(value.param as IFandType, 0));

        if (
          objectTypeIsEqual(obj1[key], param.fill(value.param as IFandType, 0))
        )
          continue;
        return false;
      }

      default:
        return false;
    }
  }
  return true;
};

/**
 * Return an interface with extra function (is, build, ...)
 *
 * @param model - the model of the interface
 * @returns the type and the extra function for the given model
 *
 */
export const improvedInterface = <T extends IModel>(model: T) => {
  /**
   * Check is the given object match the model of the interface
   *
   * @param x - the object who we want to check
   */
  const is = (x: unknown): boolean => {
    return objectTypeIsEqual(x, model);
  };

  return {
    type: model,
    utils: {
      is,
    },
  };
};
