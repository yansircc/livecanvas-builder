// 聊天

import { z } from "zod";

const schema = z.object({
	message: z.string(),
});
