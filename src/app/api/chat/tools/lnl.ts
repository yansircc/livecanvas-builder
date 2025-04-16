import { openai } from "@ai-sdk/openai";
import { tool } from "ai";
import { generateObject } from "ai";
import { z } from "zod";

const LNL_GUIDE = `
# Loops & Logic Minimalist Guide for LLM (vFinal)

Loops & Logic (L&L) enhances HTML with dynamic tags for WordPress data.

## Core Syntax Rules

1.  **Tags:** Use capitalized L&L tags (\`<Loop>\`, \`<Field>\`) alongside standard HTML (\`<div>\`). Tags use angle brackets \`<>\`. Can be self-closing (\`<Field />\`) or wrapping (\`<Loop>...</Loop>\`).
2.  **Attributes:** Provide parameters (\`type="post"\`, \`name="title"\`). Values often need quotes (\`"\`) if they contain spaces/special chars. Simple values (alphanumeric, \`-\`, \`_\`) often don't need quotes.
3.  **\`< >\` vs \`{ }\` - CRITICAL RULE:**
    *   **\`< >\` Defines Tags:** Use for *all* tag structures (HTML & L&L). Example: \`<Loop>\`, \`<Field title />\`, \`<div class="...">\`.
    *   **\`{ }\` Injects Dynamic Values into Attributes:** Use *only* inside an attribute's value (\`"..."\`) to insert the output of an L&L tag. Example: \`<img src="{Field image_url}" />\`, \`<Loop count="{Get max_items}">\`. **Always quote the attribute value when using \`{}\`.**
4.  **Context:** Tags like \`<Field>\` work on the current item (inside \`<Loop>\`) or current page/post (outside \`<Loop>\`). Can specify context explicitly on \`<Field>\` using \`type\`, \`id\`, or \`name\`.
5.  **Comments:** Use standard HTML comments \`<!-- ... -->\`.

## Essential L&L Tags

*   **\`<Loop type="...">...</Loop>\`:** Iterates over data. See Loop Types section below for parameters/fields.
*   **\`<Field name="..." />\` (or \`<Field field_name />\`):** Displays data from the current context.
*   **\`<If subject comparison value>...</If>\`:** Conditional logic. Use with \`<Else />\`, \`<Else if />\`. See If Tag section below.
*   **\`<Set name="...">Value</Set>\` (or \`<Set var_name>Value</Set>\`):** Defines a variable. Value can contain tags.
*   **\`<Get name="..." />\`:** Retrieves a variable. Use \`{Get var_name}\` inside attributes. Supports \`local\` scope and special types (\`template\`, \`logic\`, \`list\`, \`map\`, \`query\`, \`route\`, \`setting\`, \`url\`, \`site\`, \`js\`, \`sass\`).
*   **\`<Format type="...">Content</Format>\`:** Formats content. See Format Tag section below.

## Loop Types (\`<Loop>\`)

### Loop Type: \`post\` (Posts, Pages, Custom Post Types)

**Query Parameters:**

*   **Order:**
    *   \`order\`: \`asc\` (default) or \`desc\`.
    *   \`orderby\`: \`id\`, \`author\`, \`title\` (default), \`name\`, \`type\`, \`date\`, \`modified\`, \`random\`, \`comment_count\`, \`relevance\`, \`menu\`.
    *   \`orderby_field\`: Custom field key (string).
    *   \`orderby_field_number\`: Custom field key (numeric value).
*   **Core:**
    *   \`author\`: Author ID(s), login name(s), or "current". (string, array)
    *   \`exclude\`: Post ID(s) or name(s) to exclude. (string, array)
    *   \`exclude_author\`: Author ID(s), login name(s), or "current" to exclude. (string, array)
    *   \`id\`: Post ID(s). (string, array)
    *   \`include\`: Post ID(s) or name(s) to include. (string, array)
    *   \`name\`: Post slug(s). (string, array)
    *   \`post_type\`: Post type slug(s). (string, array)
    *   \`publish_compare\`: Date comparison: \`before\`, \`before_inclusive\`, \`after\`, \`after_inclusive\`. (string)
    *   \`publish_date\`: Filter by date (Y-m-d, "today", "X days ago", etc.). Use with \`publish_compare\`. (string)
    *   \`publish_day\`: Day of month (1-31) or "current". (number)
    *   \`publish_month\`: Month (1-12) or "current". (number)
    *   \`publish_week\`: Week (1-54) or "current". (number)
    *   \`publish_year\`: Year or "current". (number)
    *   \`search\`: Keyword search. Prefix with \`-\` to exclude. (string)
    *   \`status\`: Post status: \`publish\` (default), \`pending\`, \`draft\`, \`future\`, \`private\`, \`trash\`. (string, array)
    *   \`sticky\`: \`true\` (stick to top), \`false\` (exclude), \`only\` (only sticky). (string)
    *   \`parent\`: Include by parent ID(s) or name(s). (string, array)
    *   \`exclude_parent\`: Exclude by parent ID(s) or name(s). (string, array)
    *   \`include_children\`: Include children posts. (boolean)
*   **Custom Fields:** (Can use \`_2\`, \`_3\` suffixes for multiple queries)
    *   \`custom_field\`: Field key. (string)
    *   \`custom_field_value\`: Field value. (string)
    *   \`custom_field_compare\`: \`equal\` (default), \`not\`, \`before\`, \`before_inclusive\`, \`after\`, \`after_inclusive\`. (string)
    *   \`custom_field_type\`: \`string\` (default), \`number\`, \`date\`, \`time\`, \`datetime\`. (string)
    *   \`custom_date_field\`: Date field key. (string)
    *   \`custom_date_field_value\`: Date value or "current". (string)
    *   \`custom_date_field_compare\`: \`equal\` (default), \`not\`, \`before\`, \`before_inclusive\`, \`after\`, \`after_inclusive\`. (string)
    *   \`custom_date_field_format\`: Date format (\`Ymd\` default, \`Y-m-d H:i:s\`, \`timestamp\`). (string)
    *   \`custom_date_field_type\`: \`date\` (default), \`time\`, \`datetime\`, \`number\`. (string)
*   **Taxonomy:** (Can use \`_2\`, \`_3\` suffixes for multiple queries)
    *   \`category\`: Category ID(s), slug(s), or "current". (string, array)
    *   \`exclude_category\`: Category ID(s), slug(s), or "current" to exclude. (string, array)
    *   \`tag\`: Tag ID(s), slug(s), or "current". (string, array)
    *   \`exclude_tag\`: Tag ID(s), slug(s), or "current" to exclude. (string, array)
    *   \`taxonomy\`: Taxonomy slug. Use with \`terms\`. (string, number)
    *   \`terms\`: Term ID(s), slug(s), or "current". Use with \`taxonomy\`. (string, number, array)
    *   \`taxonomy_compare\`: \`in\` (default), \`not\`, \`and\`, \`exists\`, \`not exists\`. (string)
    *   \`child_terms\`: \`true\` to include child terms. (string)
    *   \`taxonomy_relation\`: \`and\` or \`or\` for multiple taxonomy queries. (string)
*   **Pagination:**
    *   \`paged\`: Items per page. Enables AJAX pagination. (number)
    *   \`page\`: Page number to display. Default: 1. (number)
    *   \`count\`: Alias for \`paged\` or general limit. (number)

**Fields:**

*   \`id\`: Post ID.
*   \`title\`: Post title.
*   \`content\`: Post content.
*   \`excerpt\`: Post excerpt. Use \`auto=true\` to generate if empty (\`words=55\`, \`more="[...]"\`).
*   \`url\`: Post permalink.
*   \`name\`: Post slug.
*   \`status\`: Post status.
*   \`publish_date\`: Publish date.
*   \`modify_date\`: Last modified date.
*   \`author\`: Author data (returns \`user\` loop).
*   \`author_*\`: Specific author fields (e.g., \`author_name\`).
*   \`modified_author\`: Last modified author data (returns \`user\` loop).
*   \`image\`: Featured image data (returns \`attachment\` loop).
*   \`image_*\`: Specific featured image fields (e.g., \`image_url\`).
*   \`parent\`: Parent post data (returns \`post\` loop).
*   \`parent_*\`: Specific parent fields.
*   \`parent_ids\`: List of all parent IDs.
*   \`children\`: Children posts (returns \`post\` loop).
*   \`children_ids\`: List of children IDs.
*   \`ancestors\`: Ancestor posts (returns \`post\` loop). \`reverse=true\` for top-down.
*   \`menu_order\`: Menu order number.
*   \`post_class\`: CSS classes for the post.
*   \`edit_url\`: Post edit link in admin.
*   \`archive_author\`, \`archive_post_type\`, \`archive_term\`: Contextual archive data (return loops).
*   \`all\`: Debug field - shows all available data.
*   *Any custom field key*.

### Loop Type: \`user\`

**Query Parameters:**

*   \`id\`: User ID(s). (string, array)
*   \`include\`: User ID(s) or login name(s). (string, array)
*   \`exclude\`: User ID(s) or login name(s). (string, array)
*   \`name\`: User login name(s). (string, array)
*   \`role\`: User role slug(s). (string, array)
*   \`not_role\`: Exclude user role slug(s). (string, array)
*   \`order\`: \`asc\` (default) or \`desc\`. (string)
*   \`orderby\`: Field to order by (\`display_name\` default, \`id\`, \`login\`, \`nicename\`, \`email\`, \`url\`, \`registered\`, \`post_count\`). (string, array)
*   \`paged\`: Items per page. Default: 10. (number)
*   \`count\`: Alias for \`paged\` or general limit. (number)

**Fields:**

*   \`id\`: User ID.
*   \`name\`: Username (login).
*   \`full_name\`: Display name.
*   \`email\`: User email.
*   \`url\`: User website URL.
*   \`avatar\`: \`<img>\` tag for avatar.
*   \`avatar_url\`: URL of avatar image.
*   \`roles\`: List of user roles.
*   \`post_count\`: Number of posts by user.
*   \`registration_date\`: Date user registered.
*   \`locale\`: User's language setting.
*   \`edit_url\`: User edit link in admin.
*   \`archive_url\`: Author archive page URL.
*   *Any custom user meta field key*.

### Loop Type: \`attachment\` (Media Library Items)

**Query Parameters:** (Many are similar to \`post\` loop, focusing on attachment specifics)

*   \`id\`: Attachment ID(s). (string, array)
*   \`include\`: Attachment ID(s) or name(s). (string, array)
*   \`exclude\`: Attachment ID(s) or name(s). (string, array)
*   \`name\`: Attachment slug(s). (string, array)
*   \`author\`: Author ID(s), login name(s), or "current". (string, array)
*   \`parent\`: ID(s) or name(s) of the post this attachment is attached to. Use \`current\` for current post. (string, array)
*   \`status\`: \`inherit\` (usually default for attachments), \`publish\`, \`private\`, \`trash\`. (string, array)
*   \`order\`: \`asc\` (default) or \`desc\`.
*   \`orderby\`: \`id\`, \`author\`, \`title\` (default), \`name\`, \`type\`, \`date\`, \`modified\`, \`menu_order\`, \`parent\`.
*   \`paged\`: Items per page. (number)
*   \`count\`: Alias for \`paged\` or general limit. (number)
*   \`search\`: Keyword search (searches title, caption, description). (string)
*   *Supports \`custom_field\`, \`taxonomy\` parameters similar to \`post\` loop.*

**Fields:**

*   \`id\`: Attachment ID.
*   \`title\`: Attachment title.
*   \`caption\`: Attachment caption.
*   \`description\`: Attachment description.
*   \`alt\`: Image alt text.
*   \`url\`: File URL. Accepts \`size\` attribute (e.g., \`size=thumbnail\`).
*   \`filename\`: Original filename.
*   \`extension\`: File extension (e.g., \`jpg\`).
*   \`type\`: MIME type (e.g., \`image/jpeg\`).
*   \`size\`: File size (formatted, e.g., \`12 KB\`).
*   \`sizes\`: Responsive \`sizes\` attribute for \`<img>\`. Accepts \`size\` attribute or \`width,height\`.
*   \`srcset\`: Responsive \`srcset\` attribute for \`<img>\`. Accepts \`size\` attribute or \`width,height\`.
*   \`image\`: Returns the image itself (useful in specific contexts).
*   \`parent\`: Parent post data (returns \`post\` loop).
*   \`author\`: Author data (returns \`user\` loop).
*   \`publish_date\`: Upload date.
*   \`edit_url\`: Attachment edit link in admin.
*   \`all\`: Debug field.
*   *Any custom attachment meta field key*.

### Loop Type: \`taxonomy_term\` (Categories, Tags, Custom Taxonomy Terms)

**Query Parameters:**

*   \`taxonomy\`: Taxonomy slug (e.g., \`category\`, \`post_tag\`). **Required**. (string)
*   \`id\`: Term ID(s). (number, array)
*   \`include\`: Term ID(s) or slug(s). (string, array) Alias: \`terms\`.
*   \`exclude\`: Term ID(s) or slug(s). (string, array)
*   \`name\`: Term slug(s). (string, array)
*   \`order\`: \`asc\` (default) or \`desc\`. (string)
*   \`orderby\`: \`name\`, \`title\` (default), \`term_id\`, \`menu_order\`, \`count\`. (string)
*   \`orderby_field\`: Custom term meta field key. (string)
*   \`orderby_field_number\`: Custom term meta field key (numeric). (string)
*   \`parent\`: Parent term ID or slug. (number, string)
*   \`parents\`: \`true\` to get only top-level terms. (boolean)
*   \`children\`: \`true\` to get only child terms (requires \`parent\` or context). (boolean)
*   \`hide_empty\`: \`true\` (default) or \`false\` to hide/show terms with no posts. (boolean)
*   \`post\`: Get terms associated with specific Post ID(s) or "current". (number, array)
*   \`count\`: Limit number of terms. (number)

**Fields:**

*   \`id\`: Term ID.
*   \`name\`: Term slug.
*   \`title\`: Term name (display title).
*   \`description\`: Term description.
*   \`count\`: Number of posts associated with the term.
*   \`url\`: URL to the term archive page.
*   \`taxonomy\`: Taxonomy slug (returns \`taxonomy\` loop).
*   \`parent\`: Parent term data (returns \`taxonomy_term\` loop).
*   \`children\`: Children terms (returns \`taxonomy_term\` loop).
*   \`ancestors\`: Ancestor terms (returns \`taxonomy_term\` loop). \`reverse=true\` for top-down.
*   \`posts\`: Posts associated with the term (returns \`post\` loop).
*   *Any custom term meta field key*.

## If Tag (\`<If>\`)

Evaluates conditions. Use with \`<Else />\` and \`<Else if />\`. Syntax: \`<If subject comparison value>\`.

**Subjects:**

*   \`archive\`: Checks if current page is an archive (\`author\`, \`category\`, \`date\`, \`post\`, \`tag\`, \`taxonomy\`). Use \`type\` or \`taxonomy\` attributes to filter.
*   \`check\`: Evaluates dynamic content within its value (\`check="{Field title}"\`).
*   \`count\`: Current loop item index (starts at 1).
*   \`field\`: Field value from current context (\`field="title"\`).
*   \`first\`: If current loop item is the first.
*   \`last\`: If current loop item is the last.
*   \`list\`: Checks a list variable (\`list="my_list"\`).
*   \`logic\`: Checks a logic variable (\`logic="my_condition"\`).
*   \`loop\`: Checks if a loop would return items (use Loop parameters as attributes: \`<If loop type=post category=news>\`).
*   \`previous_total\`: Total items in the *previous* loop.
*   \`query\`: Checks if a URL query variable exists (\`query="search_term"\`).
*   \`route\`: Checks the current URL path (\`route="products/*"\`).
*   \`singular\`: Checks if current page is a single post/page/CPT. Use \`type\` attribute to filter (\`singular type="product"\`).
*   \`total\`: Total items in the current loop.
*   \`user\`: Checks the current user.
*   \`user_field\`: Checks a field of the current user (\`user_field="locale"\`).
*   \`user_role\`: Checks the current user's role.
*   \`variable\`: Checks a standard variable (\`variable="my_var"\`).
*   *ACF specific subjects like \`acf_true_false\`, \`acf_date\`, etc.*

**Comparisons:**

*   **General:** \`exists\` (default if no value), \`not_exists\`, \`is\` (default if value present), \`is_not\`, \`starts_with\`, \`ends_with\`, \`includes\`, \`not_includes\`, \`matches_pattern\`.
*   **Subject is List:** \`any_is\`, \`all_is\`, \`any_is_not\`, \`all_is_not\`, \`any_starts_with\`, \`all_starts_with\`, \`any_ends_with\`, \`all_ends_with\`, \`any_includes\`, \`all_includes\`, \`any_not_includes\`, \`all_not_includes\`.
*   **Value is List:** \`in\`, \`not_in\`.
*   **Numbers:** \`more_than\`, \`more_than_or_equal\`, \`less_than\`, \`less_than_or_equal\`.
*   **Dates (with \`check\`, \`field\`, \`acf_date\`, \`acf_date_time\` subjects):** \`before\`, \`before_inclusive\`, \`after\`, \`after_inclusive\`. Compare against dates like "today", "2023-12-25", or timestamps.

## Format Tag (\`<Format>\`)

Applies formatting. Syntax: \`<Format type="...">Content</Format>\`.

**Common Formatting Attributes (\`type\`):**

*   \`case\`: \`camel\`, \`kebab\`, \`snake\`, \`pascal\`, \`lower\`, \`upper\`.
*   \`code\`: Escapes HTML for \`<code>\`.
*   \`date\`: Formats dates (e.g., \`date="Y-m-d"\`). Use \`locale\` for language.
*   \`index\`: Gets character/item at index (\`index=0\`).
*   \`join\`: Joins list items (\`join=","\`).
*   \`length\`: Trims string to length (\`length=50\`). Use \`offset\`.
*   \`list\`: Apply format to each item in a list (\`<Format list case=lower>\`).
*   \`match_pattern\`: Returns list of regex matches (\`match_pattern="/\d+/"\`).
*   \`number\`: Formats numbers (\`number decimals=2 point="." thousands=","\`).
*   \`offset\`: Gets substring from offset (\`offset=5\`). Use \`length\`.
*   \`prefix\`/\`suffix\`: Adds text before/after (\`prefix="ID: "\`).
*   \`replace\`/\`with\`: Simple text replacement (\`replace=" " with="-"\`). Use \`_2\`, \`_3\` for multiple.
*   \`replace_pattern\`/\`with\`: Regex replacement (\`replace_pattern="/\s+/" with="-"\`).
*   \`remove_html\`: Strips all HTML tags.
*   \`slash\`: Ensures/removes start/end slashes (\`start_slash\`, \`end_slash\`, \`start_slash=false\`).
*   \`slug\`: Creates a URL-friendly slug.
*   \`split\`: Splits string into a list (\`split=","\`). Use \`trim\`.
*   \`trim\`: Removes whitespace/chars from ends (\`trim\`, \`trim_left\`, \`trim_right\`).
*   \`url_query\`: Encodes string for URL query part.
*   \`words\`: Trims string to word count (\`words=20\`).

## Other Useful Features

*   **ACF Integration:** Use \`acf_\` attributes (\`<Field acf_text=...>\`, \`<Loop acf_repeater=...>\`). Access Options page with \`from=options\`.
*   **Pagination:** Use \`paged\` attribute on \`<Loop>\`. Display controls with \`<PaginateButtons />\` and info with \`<PaginateFields> (<Field current_page />, <Field total_pages />) </PaginateFields>\`. Supports \`scroll_top=true\`. (Currently Post loop only).
*   **Logic Variables:** Build complex conditions: \`<Set logic=my_cond all=true> <If ...>true</If> ... </Set>\`, then \`<If logic=my_cond>...\`. Use \`any=true\` for OR.
*   **Switch/When:** Shortcut for multiple \`If/Else if\`: \`<Switch field=status> <When value=publish /> ... <When value=draft /> ... <When /> ... </Switch>\`.

## Common Tag Shortcuts

*   \`<Field title />\` -> \`<Field name=title />\`
*   \`<Set my_var>...</Set>\` -> \`<Set name=my_var>...</Set>\`
*   \`<Url site />\` -> \`<Get url=site />\`
*   \`<Taxonomy category>\` -> \`<Loop type=taxonomy_term taxonomy=category>\` (context-dependent)
*   \`<User field=name />\` -> \`<Loop type=user id=current><Field name /></Loop>\` (gets current user field)

## Basic Example

\`\`\`html
<!-- List 3 most recent blog posts -->
<Loop type=post post_type=post count=3 orderby=date order=desc>
  <article>
    <h2><a href="{Field url}"><Field title /></a></h2>
    <If user exists> <!-- Show excerpt only to logged-in users -->
      <If field=excerpt exists>
        <p><Field excerpt words=30 /></p>
      <Else />
        <p><Format words=30><Field content remove_html /></Format></p> <!-- Auto-excerpt from content -->
      </If>
    </If>
    <small>By: <Field author_full_name /> on <Format date="F j, Y"><Field publish_date /></Format></small>
  </article>
</Loop>
\`\`\`

## ACF Example
\`\`\`html
<article class="portfolio-item">

  <h1><Field title /></h1> <!-- Standard Post Title -->

  <!-- ACF Image Field -->
  <div class="main-project-image">
    <h3>Project Image</h3>
    <!-- Check if the ACF image field has a value -->
    <If field=project_image exists>
        <!-- Use Field shortcut to get the URL for the 'large' size -->
        <img src="{Field acf_image=project_image field=url size=large}"
             alt="{Field acf_image=project_image field=alt}" />

        <!-- Optionally display caption using Loop (even for single image) -->
        <Loop acf_image=project_image>
          <If field=caption exists>
            <figcaption><Field caption /></figcaption>
          </If>
        </Loop>
    <Else />
      <p>No main project image provided.</p>
    </If>
  </div>

  <!-- ACF Gallery Field -->
  <div class="project-gallery">
    <h3>Project Gallery</h3>
    <!-- Check if the ACF gallery field has any images selected -->
    <If loop acf_gallery=project_gallery>
      <div class="gallery-grid">
        <!-- Loop through each image in the gallery -->
        <Loop acf_gallery=project_gallery>
          <figure>
            <!-- Display each gallery image (thumbnail size) -->
            <img src="{Field url size=thumbnail}" alt="{Field alt}" />
            <!-- Display caption if it exists for this gallery image -->
            <If field=caption exists>
              <figcaption><Field caption /></figcaption>
            </If>
          </figure>
        </Loop>
      </div>
    <Else />
      <p>No additional gallery images.</p>
    </If>
  </div>

</article>
\`\`\`
`;

const simplifiedFieldSchema = z.object({
	type: z.string(),
	name: z.string(),
});

interface LNLGeneratorResult {
	code: string;
}

export const generateLNLCodeTool = tool({
	description:
		"Generate dynamic LNL(tangible loop & logic, it's a enhanced html with dynamic tags for wordpress data) code based on acf fields. No need to display the output code in your response since the this tool will showcase the output code in the chat interface for user to copy.",
	parameters: z.object({
		fields: z.array(simplifiedFieldSchema),
	}),
	execute: async (fields): Promise<LNLGeneratorResult> => {
		const { object } = await generateObject({
			model: openai("gpt-4.1-mini"),
			schema: z.object({
				code: z
					.string()
					.describe(
						"LNL(tangible loop & logic) HTML template code snippets. The template should only include LNL HTML code snippets to demonstrate the dynamic template, without any CSS or JavaScript.",
					),
			}),
			system: `
			You are an expert in creating LNL (tangible loop & logic) code for WordPress.
			Your task is to assist the user in designing a demo LNL template that showcases all possible ACF fields, including nested fields or sub-fields, to demonstrate the capabilities of the LNL template.
			Refer to the LNL guide below:
			${LNL_GUIDE}
			`,
			prompt: `
			Here are the acf fields:
			${JSON.stringify(fields, null, 2)}
      ALWAYS wrap the code in the <tangible> tag.
			`,
		});
		return object;
	},
});
