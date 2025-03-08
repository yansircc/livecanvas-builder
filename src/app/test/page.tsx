"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { codeSchema } from "../api/chat/schema";

export default function Page() {
	const { object, submit } = useObject({
		api: "/api/chat",
		schema: codeSchema,
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
						"generate a feature block to display 4 advantages of use react",
					)
				}
			>
				Generate code
			</button>

			{object?.code && (
				<div>
					<p>{object?.code}</p>
					<p>{object?.advices}</p>
				</div>
			)}
		</div>
	);
}
