import { expect, it } from "vitest";
import { sayHello } from "./index.ts";

it('should return expected string', () => {
  const to = 'World'

  const result = sayHello(to)

  expect(result).toBe('Hello World!')
})
