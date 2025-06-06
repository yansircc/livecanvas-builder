import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTableCreator,
	primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple project.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `lc_builder_${name}`);

export const user = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }).notNull(),
	email: d.varchar({ length: 255 }).notNull().unique(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 255 }),
	backgroundInfo: d.text(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
		.$onUpdate(() => new Date()),
}));

export const userRelation = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
	project: many(project),
	purchase: many(purchase),
	favorite: many(favorite),
}));

export const account = createTable(
	"account",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull()
			.$onUpdate(() => new Date()),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountRelation = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const session = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("session_user_id_idx").on(t.userId)],
);

export const sessionRelation = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const project = createTable(
	"project",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		htmlContent: d.text().notNull(),
		thumbnail: d.varchar({ length: 255 }),
		tags: d.varchar({ length: 255 }).default(""),
		purchaseCount: d.integer().notNull().default(0),
		isPublished: d.boolean().notNull().default(false),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull()
			.$onUpdate(() => new Date()),
	}),
	(t) => [
		index("project_user_id_idx").on(t.userId),
		index("project_title_idx").on(t.title),
	],
);

export const projectRelation = relations(project, ({ one, many }) => ({
	user: one(user, { fields: [project.userId], references: [user.id] }),
	purchase: many(purchase),
	favorite: many(favorite),
}));

export const purchase = createTable(
	"purchase",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		projectId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		amount: d.integer().notNull().default(0),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("purchase_project_id_idx").on(t.projectId),
		index("purchase_user_id_idx").on(t.userId),
	],
);

export const purchaseRelation = relations(purchase, ({ one }) => ({
	project: one(project, {
		fields: [purchase.projectId],
		references: [project.id],
	}),
	user: one(user, { fields: [purchase.userId], references: [user.id] }),
}));

export const favorite = createTable(
	"favorite",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		projectId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => project.id, { onDelete: "cascade" }),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("favorite_project_id_idx").on(t.projectId),
		index("favorite_user_id_idx").on(t.userId),
	],
);

export const favoriteRelation = relations(favorite, ({ one }) => ({
	project: one(project, {
		fields: [favorite.projectId],
		references: [project.id],
	}),
	user: one(user, { fields: [favorite.userId], references: [user.id] }),
}));
