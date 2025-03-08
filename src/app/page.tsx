"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { codeSchema } from "./api/chat/schema";

export default function Page() {
	const { object, submit } = useObject({
		schema: codeSchema,
		api: "/api/chat",
		onFinish({ object, error }) {
			// typed object, undefined if schema validation fails:
			console.log("Object generation completed:", object);

			// error, undefined if schema validation succeeds:
			console.log("Schema validation error:", error);
		},
		onError(error) {
			// error during fetch request:
			console.error("An error occurred:", error);
		},
	});

	return (
		<div>
			<button
				type="button"
				onClick={() =>
					submit(
						"Generate a section to display a list of users and give some UI advices",
					)
				}
			>
				Generate code
			</button>

			{object?.code && <div>{object.code}</div>}
			{object?.advices && <div>{object.advices.join(", ")}</div>}
		</div>
	);
}
