import { improvedInterface, typePredicate } from "./mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.125.0/testing/asserts.ts";

// const UserRaw = improvedInterface({
//   firstName: typePredicate.string(),
//   lastName: typePredicate.string(),
//   age: typePredicate.number((x) => x > 10),
//   skills: typePredicate.object({
//     name: typePredicate.string(),
//   }),
// });

// // type IUser = typeof UserRaw.type;
// interface IUser extends ReturnType<() => typeof UserRaw.type> {}

// const User = UserRaw.utils;

// let isUser = User.is({
//   firstName: "hello",
//   lastName: "world",
//   age: 0,
//   skills: {
//     name: "",
//   },
// });

Deno.test("test simple type", async (testContext) => {
  await testContext.step("successfully check", () => {
    const userRaw = improvedInterface({
      firstName: typePredicate.string(),
      age: typePredicate.number(),
      isAdmin: typePredicate.boolean(),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        firstName: "",
        age: 0,
        isAdmin: true,
      })
    );
  });

  await testContext.step("successfully fail if the type is different", () => {
    const userRaw = improvedInterface({
      firstName: typePredicate.string(),
      age: typePredicate.number(),
      isAdmin: typePredicate.boolean(),
    });

    const User = userRaw.utils;

    assertEquals(
      User.is({
        firstName: true,
        age: "",
        isAdmin: 0,
      }),
      false
    );
  });

  await testContext.step("successfully check with condition function", () => {
    const userRaw = improvedInterface({
      firstName: typePredicate.string((x) => x.includes("hello")),
      age: typePredicate.number((x) => x > 10),
      isAdmin: typePredicate.boolean((x) => x === false),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        firstName: "hello",
        age: 11,
        isAdmin: false,
      })
    );
  });

  await testContext.step(
    "successfully fail if the condition function is not true",
    () => {
      const userRaw = improvedInterface({
        firstName: typePredicate.string((x) => x.includes("hello")),
        age: typePredicate.number((x) => x > 10),
        isAdmin: typePredicate.boolean((x) => x === false),
      });

      const User = userRaw.utils;

      assertEquals(
        User.is({
          firstName: "ello",
          age: 10,
          isAdmin: true,
        }),
        false
      );
    }
  );
});

Deno.test("test computed type", async (testContext) => {
  await testContext.step("successfully check object", () => {
    const userRaw = improvedInterface({
      skills: typePredicate.object({
        name: typePredicate.string(),
        age: typePredicate.number(),
      }),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        skills: {
          name: "",
          age: 1,
        },
      })
    );
  });

  await testContext.step("successfully check object with condition", () => {
    const userRaw = improvedInterface({
      skills: typePredicate.object({
        name: typePredicate.string((x) => x.includes("hello")),
        age: typePredicate.number((x) => x > 10),
      }),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        skills: {
          name: "hello",
          age: 11,
        },
      })
    );
  });

  await testContext.step("successfully check with nested object", () => {
    const userRaw = improvedInterface({
      skills: typePredicate.object({
        category: typePredicate.object({
          name: typePredicate.string(),
        }),
      }),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        skills: {
          category: {
            name: "",
          },
        },
      })
    );
  });

  await testContext.step("successfully check array", () => {
    const userRaw = improvedInterface({
      tags: typePredicate.array(typePredicate.string()),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        tags: ["hello", "world"],
      })
    );
  });
});

Deno.test("test helper type", async (testContext) => {
  await testContext.step("successfully check optional type", () => {
    const userRaw = improvedInterface({
      firstName: typePredicate.string(),
      lastName: typePredicate.string(),
      surname: typePredicate.optional(typePredicate.string()),
    });

    const User = userRaw.utils;

    assert(
      User.is({
        firstName: "hello",
        lastName: "world",
      })
    );
  });

  await testContext.step(
    "successfully fail if the conditional key dont have the good type",
    () => {
      const userRaw = improvedInterface({
        firstName: typePredicate.string(),
        lastName: typePredicate.string(),
        surname: typePredicate.optional(typePredicate.string()),
      });

      const User = userRaw.utils;

      assertEquals(
        User.is({
          firstName: "hello",
          lastName: "world",
          surname: 0,
        }),
        false
      );
    }
  );
});
